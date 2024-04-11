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

    const secretUserData = JSON.parse(
        window.localStorage.getItem(`${username}-secret`) ?? '{}',
    );

    const proofData = await zkKYC.createProof(secretUserData.leafIndex);

    console.log('proofSiblings', proofData);
    console.log('secret data', secretUserData);

    const _root = await zkKYC.getCurrentRoot();

    const _nullifierHash = poseidon2([secretUserData.nulifier, proposalId]);

    const _proofSiblings = proofData.proofSiblings;
    const _proofPathIndices = proofData.proofPathIndices;

    const _nulifier = secretUserData.nulifier;
    const _secret = secretUserData.secret;

    console.log('BEFORE INPUT');
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
    /*     const proposalId =
        '0x0000000000000000000000000000000000000000000000000000000000000000';
    const voteType =
        '0x0000000000000000000000000000000000000000000000000000000000000001';
 */
    /*     const inputs = {
        root,
        nulifierHash,
        proofSiblings,
        proofPathIndices,
        nulifier,
        secret,
        proposalId,
        voteType,
    }; */
    // const inputs = {x: 1, y: 3}

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

    /*     const publicInputs = { root, nulifierHash, proposalId, voteType };

    const proofInputs = { proofBytes: byteString, publicInputs: publicInputs };
     */

    /*     const proofBytes =
        '0x14861b37acad3d2ca575e3c02e95054a0d581db00fa46050e86a6fe0541d41a40bd2f3f0f96cd19b4a66e9de8ed2d2e449fb564f6df584d1d03915a07050a20718a98f084bbeb6e905e8042713158e60173aaef3f29602b496d5ee2d3847b24f047c2e371d0c703e538524ff8dbebbb3630ff8df4c11b264f022d5bd7ce324512127fb89476a558af0dc05fe8c4f75185058e69ae0c8b35fd7c7532afff8918616b785dfa4ebf55a06aad399a5ef47273d2024695bd4b2b138255e48360d85bd15ffd76adbfceca9e897369dbbf875ec38bb9eabee1c54d30ec4eb14999d08d22f612427477871624ac315a70f7d3061b9e6ae08def39eb1e911b7411662455728b0c487a7a03e7708555b629ce2550beb1ca7d7f080392f34a22ad3354adf152cd85ba9d1f5a3f82c2e756953af25a3f817ee9a16e93bb108e87c6d8cc2b13d2fcae979e40b4d7068801314742c281f88536dab7abdde4123d71f5f3c57018c1846a73b85772b37db2eb40531f74e6608116210488a52aed42bb0b073e520c9048a151d4dfaa1040013357dfd1936b06fb85ae26e13904b047ae269aab943400af78c2b76ce733bfe3f3a652f20437b57979fdd0549e00df14185476c905ddf11b64c2a6217856994feb4442eb5c3a131194ebcca08c2b783faccce3d3abeba14ea71f6e06c200ea648efba39d5a7095fcc1849cf9d9751190e3ef8d28dcda81dedb0f46ed81297283f62b09c17832f76ee2847d9e0d8b94484884cf9f1a6c324580e0d598ca14be66d009fed42b7801609f9a5a97153ebdb3a21764534e22620f05c286494488179a1d8ba69a7ff250ec8f95b966c771d99196e0ae28f7b210793cfba7e8047af04ac3c7a52fa0de1e166a931de682dc273282a9f9deb1aa9158e93d772f38a9d8ac5da3817735c27500f5b05ba01d22de6469f77a5f8d69e16ccd13049e32668d6216939f998eb0bbcc5eed0fd4439aba544565e23a386ed170822c7850af1fdcf56ae7680ddcb9c34d04cff8eaa7ea26f1f28c80d1728732cbc77df5b98ae3ae940be48a8189774978ec5d54b6ceed3d9aa28540e20669b142b3941e7e1a8bd32541de3fa2ea334ce9f146857aa9288e9cf12870f3e304f01052adc05f6e858bc52c043b979d7a83bad5a547e0a7d84fff1ea3ee0c3becd10f2fa652623d1c7489dc650aa09129654cc37d01b52bcb485f17eaf98bce00f251dc3ad52be2c1ef52d6e6437b65d913d7b0b4c443d5b0c6e6af71cf4fa9be303aaadba52a80d2ec57a74299d59be45e37b80386758f0439a011f4e100843332cb2342f5161a3a6ee34bab0c657e4f07e416ce1bf9c7d6bb8f95059fa7ec69710babb1f0a95a9aacf00479ba8666e968e6729311af97f22ee14009dc15847c0272974fc2e859a4145cab60fb89c5084ae14564c11004c9f62fea3782322fa88159213e76edea572c41f17fb8c4bbff040aaca8aa2cc40fce3afa7f4593e67a41d267b3867c8c2924b7d574367c31b5cd1ac75e8bbdb7f4d5161b7f7de3f04c11c2672358bc23c14b47c913a758d202be695bc32d01b3899e04b309741acc4f42ebb90563212416b39b1cba8bb69a8641d4e0a7681651ba4d62226a6541f472f2effb7ca637b9130e434c13cd53b762737ceb7e73f987702a075b13f9076ac3f272c166445816c93de8cea89446a1b954e58df461a929ea1ed820e8ef7b7ab5c160467ca93cf150388eaacb92ee713d1d3681f113cc24556e9ba4db26fafa1f40ef80dff8e07f226e649b85ff77a782234ec9e133d31d97e4b9df916a2d7483820bf75b6bd51461539b8b975518baed565510e34f49fbda88f12eba98ad35eac0cbd16e5b35d4b43725c7a04717f87a5db1e14b4136115d8f9b9521510a3478c003da0b98441a27b77088fe5b44fc0e330e84e8b11ceb693fff20f1c18e0e8cc2419590a119c060c95f676cf85625ca805ba86effadb0352260cc18d4f9f8f2512f1aa705fe9ae7c405438ff6fdf54e48ac9c6bb1d0aaa07224500b0c79785bd01c9fbd6ae3756ebeab1fb2f5a5c4d210fd906863f3a50bc1e7d3fd43f8f7c5521069bafddb69f854d600315c65a9dbabd1c2e99db2368025e97748ba78772ee04dcb930e21cbd7333486ee919640c0e58775edc5ef1ec0be5f28cd5e7a7988c08e68a0e3a3a05283a6d9b03ccf9b395e6d8f4f207dff7d6880759b1394d49640d3b01896e49e31bd472d94893a30b43dc4373e2e19d8ed5725526ba767227cb1e7d0564d498c27f01c5a266261cde3cc03fe9d5290393a8925c47f7a829131117917f6d8b739eb14e7a785b3366c80245ff4bf98d1deb6860ead32dee6af9a40c158ecdac19a279a0d1830b7f1b432faa3fff8774701f2ffedb29ad70865c800c07f2450a2c73a3dda742d32c0a9d6802db79e8e0ab54ad2bc69cf91e8682a913563258dd96ef3b271793f10e35b1820cac0d8bfc38dbe9e95a061c031bd21e06315ecb24b89e2934fd196c8589ca0d8fe1fd3b0bc641c093c22c31a514a39a1f3023658303f7613fe8cbb06d0966e3cbee5edc1c4a6b53bd969adb59051199157fa123eadbaa84f1d4162f0387a7b79b1d618fce92c5d2705d74be5abdcbad2ee989e95c8d4957ce81734e95f88713902859536f27c3a4f08bd830ee1d34cb253a2715c8ac5e86942aad0a6d00043b5e56e91c0ca24c3f7f31a1f940058a7e10222dc8d37740fcef06189ab554adbc676eddba26286fa6d284ca040d5b56082b6e82eebf73c39d0231c9e17f2aaf9a98babaa0b968039f69b9e7a2cab12193165689a1ca3ea6135d0d3571c77f591ba1d2af3ed2ee2706bd0d0fad9806ed1d13401dfe200b64c38da29bf36271850681206ff04bcf1c493beea6773320fb8d2a63b68ce7a05a120992f845d098cd532b5f1067c2e1f79e3ba9bc118c059619107b7ef41c01e8182b11bb7f69314e2776f7c5802af1d2d279329a9db15d3acc04fab7025666aff28856910daf14d38d11a882136eac4cda8fc51c7782f7c4a0';

    const publicInputs = {
        root: '0x2e3764cc712bf528977821358801d9ccc5bdd126eff91bcfad0f9bff8aee02e6',
        nulifierHash:
            '0x2098f5fb9e239eab3ceac3f27b81e481dc3124d55ffed523a839ee8446b64864',
        proposalId:
            '0x0000000000000000000000000000000000000000000000000000000000000000',
        voteType:
            '0x0000000000000000000000000000000000000000000000000000000000000001',
    };
 */
    const proofInputs = { proofBytes: proofBytes, publicInputs: publicInputs };

    await pushUserVoteProofToAPI(proofInputs);

    console.log('verifying');
    const result = await noir.verifyProof(proof);
    console.log(result);

    return '';
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
        return await response.json(); // Assuming the API responds with JSON
    } catch (error) {
        console.error('Error pushing userData to API:', error);
        return null;
    }
}
