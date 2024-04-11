// webauthn.ts
import { toast } from 'react-toastify';

import { client, parsers } from '@passwordless-id/webauthn';
import { poseidon2 } from 'poseidon-lite/poseidon2';
import { ethers, BrowserProvider } from 'ethers';
import { bytesToHex } from 'viem';
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

export const generateProof = async () => {
    toast.success('Generating Proof');
    toast.success('Generating Proof');

    // const ethersProvider = new BrowserProvider(walletProvider);
    // const signer = await ethersProvider.getSigner();

    // const zkKYC = new ethers.Contract(WebAuthnAddress, ZK_KYCABI, signer);

    const circuit = await getCircuit();
    const backend = new BarretenbergBackend(circuit, {
        threads: navigator.hardwareConcurrency,
    });
    const noir = new Noir(circuit, backend);

    /*     
    await toast.promise(noir.init, {
        pending: 'Initializing Noir...',
        success: 'Noir initialized!',
        error: 'Error initializing Noir',
    });
    */

    console.log('Proof compiled');

    // 1) get proofSiblings and path from smart contract
    // 2) parse proof public inputs
    // 3) generate proof via noir wasm
    // 4) push proof to API => check if it is usuable on API side
    // 5) write proof to state to vote using API

    const root =
        '0x2e3764cc712bf528977821358801d9ccc5bdd126eff91bcfad0f9bff8aee02e6';
    const nulifierHash =
        '0x2098f5fb9e239eab3ceac3f27b81e481dc3124d55ffed523a839ee8446b64864';
    const proofSiblings = [
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x2098f5fb9e239eab3ceac3f27b81e481dc3124d55ffed523a839ee8446b64864',
        '0x1069673dcdb12263df301a6ff584a7ec261a44cb9dc68df067a4774460b1f1e1',
        '0x18f43331537ee2af2e3d758d50f72106467c6eea50371dd528d57eb2b856d238',
        '0x07f9d837cb17b0d36320ffe93ba52345f1b728571a568265caac97559dbc952a',
        '0x2b94cf5e8746b3f5c9631f4c5df32907a699c58c94b2ad4d7b5cec1639183f55',
        '0x2dee93c5a666459646ea7d22cca9e1bcfed71e6951b953611d11dda32ea09d78',
        '0x078295e5a22b84e982cf601eb639597b8b0515a88cb5ac7fa8a4aabe3c87349d',
        '0x2fa5e5f18f6027a6501bec864564472a616b2e274a41211a444cbe3a99f3cc61',
        '0x0e884376d0d8fd21ecb780389e941f66e45e7acce3e228ab3e2156a614fcd747',
        '0x1b7201da72494f1e28717ad1a52eb469f95892f957713533de6175e5da190af2',
        '0x1f8d8822725e36385200c0b201249819a6e6e1e4650808b5bebc6bface7d7636',
        '0x2c5d82f66c914bafb9701589ba8cfcfb6162b0a12acf88a8d0879a0471b5f85a',
        '0x14c54148a0940bb820957f5adf3fa1134ef5c4aaa113f4646458f270e0bfbfd0',
        '0x190d33b12f986f961e10c0ee44d8b9af11be25588cad89d416118e4bf4ebe80c',
        '0x22f98aa9ce704152ac17354914ad73ed1167ae6596af510aa5b3649325e06c92',
        '0x2a7c7c9b6ce5880b9f6f228d72bf6a575a526f29c66ecceef8b753d38bba7323',
        '0x2e8186e558698ec1c67af9c14d463ffc470043c9c2988b954d75dd643f36b992',
        '0x0f57c5571e9a4eab49e2c8cf050dae948aef6ead647392273546249d1c1ff10f',
        '0x1830ee67b5fb554ad5f63d4388800e1cfe78e310697d46e43c9ce36134f72cca',
        '0x2134e76ac5d21aab186c2be1dd8f84ee880a1e46eaf712f9d371b6df22191f3e',
        '0x19df90ec844ebc4ffeebd866f33859b0c051d8c958ee3aa88f8f8df3db91a5b1',
        '0x18cca2a66b5c0787981e69aefd84852d74af0e93ef4912b4648c05f722efe52b',
        '0x2388909415230d1b4d1304d2d54f473a628338f2efad83fadf05644549d2538d',
        '0x27171fb4a97b6cc0e9e8f543b5294de866a2af2c9c8d0b1d96e673e4529ed540',
        '0x2ff6650540f629fd5711a0bc74fc0d28dcb230b9392583e5f8d59696dde6ae21',
        '0x120c58f143d491e95902f7f5277778a2e0ad5168f6add75669932630ce611518',
        '0x1f21feb70d3f21b07bf853d5e5db03071ec495a0a565a21da2d665d279483795',
        '0x24be905fa71335e14c638cc0f66a8623a826e768068a9e968bb1a1dde18a72d2',
        '0x0f8666b62ed17491c50ceadead57d4cd597ef3821d65c328744c74e553dac26d',
        '0x0918d46bf52d98b034413f4a1a1c41594e7a7a3f6ae08cb43d1a2a230e1959ef',
        '0x1bbeb01b4c479ecde76917645e404dfa2e26f90d0afc5a65128513ad375c5ff2',
    ];
    const proofPathIndices = [
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
    ];
    const nulifier =
        '0x0000000000000000000000000000000000000000000000000000000000000000';
    const secret =
        '0x0000000000000000000000000000000000000000000000000000000000000000';
    const proposalId =
        '0x0000000000000000000000000000000000000000000000000000000000000000';
    const voteType =
        '0x0000000000000000000000000000000000000000000000000000000000000001';

    const inputs = {
        root,
        nulifierHash,
        proofSiblings,
        proofPathIndices,
        nulifier,
        secret,
        proposalId,
        voteType,
    };
    // const inputs = {x: 1, y: 3}

/*     console.log('generating proof');
    console.time('Proof Generation Time');

    const proof = await noir.generateProof(inputs);

    console.timeEnd('Proof Generation Time');
    console.log(proof);

    const byteString: string = bytesToHex(proof.proof);

    // push proof to server API
    // save it to a useState hook
    // if the user doesn't trust the API they can submit directly to the SC

    const publicInputs = { root, nulifierHash, proposalId, voteType };

    const proofInputs = { proofBytes: byteString, publicInputs: publicInputs };
    
        await pushUserVoteProofToAPI(proofInputs);
*/

    await pushUserVoteProofToAPI({});

    // console.log("verifying");
    // const result = await noir.verifyProof(proof);
    // console.log(result);

    return "";
};

export const getVoteData = async (walletProvider: any) => {
    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    const zkKYC = new ethers.Contract(WebAuthnAddress, ZK_KYCABI, signer);

    // this is failing
    const voteData = await zkKYC.proposals(0);

    console.log(voteData);
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
        toast.success('Please enter a username.');
        // alertUser('Please enter a username.');
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

    const secretUserData = {
        username,
        userAddress,
        commitmentHash,
        secret,
        nulifier,
    };

    // window.localStorage.setItem(username, JSON.stringify(secretUserData));

    // push userData to API
    await requestKYCfromAPI(userData);

    setAuthenticated(true);
};

async function requestKYCfromAPI(userData: any) {
    console.log('Pushing UserData to API', userData);
    try {
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
        toast.success('Requesting KYC');
        return await response.json(); // Assuming the API responds with JSON
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
        return await response.json(); // Assuming the API responds with JSON
    } catch (error) {
        console.error('Error pushing userData to API:', error);
        return null;
    }
}
