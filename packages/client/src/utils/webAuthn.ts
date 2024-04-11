// webauthn.ts
import { toast } from 'react-toastify';

import { client, parsers } from '@passwordless-id/webauthn';
import { poseidon2 } from 'poseidon-lite/poseidon2';
import { ethers, BrowserProvider } from 'ethers';
import { bytesToHex, toHex } from 'viem';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import { getCircuit } from './getCircuit';

const ZK_KYCABI = require('../abi/ZK_KYC.json').abi;
const WebAuthnAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

interface AlertFunction {
    (message: string): void;
}

export const authenticateUser = async (username: string) => {
    const credentialId = window.localStorage.getItem(username);
    if (!credentialId) {
        toast.success('User not registered'); // Using toast for success message

        return;
    }

    console.log('Initiating WebAuthn authentication process...');

    try {
        const res = await client.authenticate(
            credentialId ? [credentialId] : [],
            window.crypto.randomUUID(),
            {
                authenticatorType: 'auto',
            },
        );
        console.debug(res);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};

export const generateProof = async (
    walletProvider: any,
    username: string,
    proposalId: number,
    voteType: number,
) => {
    toast.success('Generating Proof');

    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    const zkKYC = new ethers.Contract(WebAuthnAddress, ZK_KYCABI, signer);

    // here you can chose to compile in the browser or use the precompiled circuit
    const circuit = await getCircuit();

    const backend = new BarretenbergBackend(circuit, {
        threads: navigator.hardwareConcurrency,
    });
    const noir = new Noir(circuit, backend);
    console.log('Proof compiled');

    // 1) get proofSiblings and path from smart contract
    // 2) parse proof public inputs
    // 3) generate proof via noir wasm
    // 4) push proof to API => check if it is usuable on API side
    // 5) write proof to state to vote using API

    const secretUserData = JSON.parse(
        window.localStorage.getItem(`${username}-secret`) ?? '{}',
    );

    const proofData = await zkKYC.createProof(secretUserData.leafIndex);
    const _root = await zkKYC.getCurrentRoot();

    const _nullifierHash = poseidon2([secretUserData.nulifier, proposalId]);
    const _proofSiblings = proofData.proofSiblings;
    const _proofPathIndices = proofData.proofPathIndices;
    const _nulifier = secretUserData.nulifier;
    const _secret = secretUserData.secret;

    const inputs = {
        root: toHex(_root, { size: 32 }),
        nulifierHash: toHex(_nullifierHash, { size: 32 }),
        proofSiblings: _proofSiblings.map((sibling: bigint) =>
            toHex(sibling, { size: 32 }),
        ),
        proofPathIndices: _proofPathIndices.map((index: bigint) =>
            toHex(index, { size: 32 }),
        ),
        nulifier: toHex(_nulifier, { size: 32 }),
        secret: toHex(_secret, { size: 32 }),
        proposalId: toHex(proposalId, { size: 32 }),
        voteType: toHex(voteType, { size: 32 }),
    };

    console.log('inputs', inputs);

    console.log('generating proof');
    console.time('Proof Generation Time');

    const proof = await noir.generateProof(inputs);

    console.timeEnd('Proof Generation Time');
    console.log(proof);

    const proofBytes: string = bytesToHex(proof.proof);
    const publicInputs = {
        root: inputs.root,
        nulifierHash: inputs.nulifierHash,
        proposalId: inputs.proposalId,
        voteType: inputs.voteType,
    };

    // push proof to server API
    // save it to a useState hook
    // if the user doesn't trust the API they can submit directly to the SC

    const proofInputs = { proofBytes: proofBytes, publicInputs: publicInputs };

    const apiResult = await pushUserVoteProofToAPI(proofInputs);

    if (apiResult.success) {
        toast.success('Proof Generation Success');
        toast.success('Vote Successfully Submitted');
    } else {
        toast.error('Vote Submission Failed');
    }

    /*     
    // you can verify in the browser here
    console.log('verifying');
    const result = await noir.verifyProof(proof);
    console.log(result); 
    */

    return true;
};

export const getVoteData = async (walletProvider: any, proposalId: number) => {
    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    const zkKYC = new ethers.Contract(WebAuthnAddress, ZK_KYCABI, signer);

    const voteData = await zkKYC.proposals(proposalId);
    console.log('VOTE DATA', voteData);

    const serializableVoteData = JSON.parse(
        JSON.stringify(
            voteData,
            (_, value) =>
                typeof value === 'bigint' ? value.toString() : value, // Convert BigInt to string
        ),
    );
    return serializableVoteData;
};

export const generateWallet = async (
    signature: string,
): Promise<ethers.HDNodeWallet> => {
    const signatureBuffer = Buffer.from(signature, 'base64');
    const signatureHex = '0x' + signatureBuffer.toString('hex');
    const hashedSignature = ethers.keccak256(signatureHex);

    const mnemonic = ethers.Mnemonic.entropyToPhrase(hashedSignature);

    const wallet = ethers.Wallet.fromPhrase(mnemonic);

    if (!wallet.mnemonic) {
        throw new Error('Failed to generate a mnemonic.');
    }

    const mnemonicPhrase = wallet.mnemonic.phrase;
    const deterministicWallet = ethers.Wallet.fromPhrase(mnemonicPhrase);

    return deterministicWallet;
};

export const registerWithWebAuthn = async (
    username: string,
    isRoaming: boolean,
    setAuthenticated: (isAuthenticated: boolean) => void,
): Promise<void> => {
    if (!username) {
        return;
    }

    // Check if a wallet already exists for this username
    const existingCredentialId = window.localStorage.getItem(username);
    if (existingCredentialId) {
        setAuthenticated(true); // Assuming the existence of a wallet authenticates the user
        return;
    }

    const res = await client.register(username, window.crypto.randomUUID(), {
        authenticatorType: isRoaming ? 'roaming' : 'auto',
    });

    const parsed = parsers.parseRegistration(res);

    window.localStorage.setItem(username, parsed.credential.id);

    setAuthenticated(true);
};

export const loginWithWebAuthn = async (
    username: string,
    isRoaming: boolean,
    setAuthenticated: (isAuthenticated: boolean) => void, // Change made here
): Promise<void> => {
    if (!username) {
        toast.success('Please enter a username.');
        return;
    }

    const credentialId = window.localStorage.getItem(username);
    if (!credentialId) {
        toast.success('User not registered'); // Using toast for success message

        return;
    }

    console.log('Initiating WebAuthn authentication process...');

    const res = await client.authenticate(
        credentialId ? [credentialId] : [],
        window.crypto.randomUUID(),
        {
            authenticatorType: isRoaming ? 'roaming' : 'auto',
        },
    );
    console.debug(res);

    const parsed = parsers.parseAuthentication(res);
    console.log(parsed);

    const signature = String(parsed.signature);

    console.log(signature);
    const wallet = await generateWallet(signature);

    console.log('ADDRESS', wallet.getAddress());

    window.localStorage.setItem(credentialId, username);

    // 1) compute commitment
    // 2) push username, userAddress, commitment to API

    // compute commitmemnt
    const secret = 0;
    const nulifier = 0;

    // save as a bigInt
    const commitmentHash = poseidon2([secret, nulifier]).toString();
    console.log(commitmentHash);

    const userAddress = await wallet.getAddress();
    const userData = { username, userAddress, commitmentHash };

    // window.localStorage.setItem(username, JSON.stringify(secretUserData));

    // push userData to API
    let result = await requestKYCfromAPI(userData);

    if (result.success) {
        toast.success('User KYC approved');
    } else {
        toast.error('User KYC rejected');
        return;
    }

    console.log('RES', result);

    const leafIndex = result.leafIndices[0];

    const secretUserData = {
        username,
        userAddress,
        commitmentHash,
        secret,
        nulifier,
        leafIndex,
    };

    console.log(secretUserData);

    const key = `${username}-secret`;
    window.localStorage.setItem(key, JSON.stringify(secretUserData));

    setAuthenticated(true);
};

async function requestKYCfromAPI(userData: any) {
    console.log('Pushing UserData to API', userData);
    try {
        toast.success('Requesting KYC');

        const response = await fetch('http://localhost:4000/request-kyc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        toast.error('API is Down');
        console.error('Error pushing userData to API:', error);
        return null;
    }
}

async function pushUserVoteProofToAPI(proofInputs: any) {
    console.log('proof', proofInputs);
    try {
        const response = await fetch('http://localhost:4000/vote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(proofInputs),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error pushing userData to API:', error);
        return null;
    }
}
