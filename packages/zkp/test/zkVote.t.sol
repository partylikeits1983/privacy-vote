// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {UltraVerifier} from "../src/libraries/plonk_vk.sol";
import {ZK_KYC, Proposal} from "../src/ZK_KYC.sol";

contract ZKPverify is Test {
    UltraVerifier verifier;
    ZK_KYC zkKYC;

    function setUp() public {
        verifier = new UltraVerifier();
        zkKYC = new ZK_KYC();

        zkKYC.setVerifier(address(verifier));
    }

    function test_IMTverifyProof_ZKP() public view {
        string memory proofFilePath = "./circuits/proofs/vote.proof";
        string memory proof = vm.readLine(proofFilePath);
        bytes memory proofBytes = vm.parseBytes(proof);

        bytes32 root = vm.parseBytes32(vm.readFile("./data/root.txt"));
        bytes32 nulifierHash = vm.parseBytes32(vm.readFile("./data/nulifierHash.txt"));
        bytes32 proposalId = vm.parseBytes32(vm.readFile("./data/proposalId.txt"));
        bytes32 voteType = vm.parseBytes32(vm.readFile("./data/voteType.txt"));

        bytes32[] memory publicInputs = new bytes32[](4);
        publicInputs[0] = root;
        publicInputs[1] = nulifierHash;
        publicInputs[2] = proposalId;
        publicInputs[3] = voteType;

        console.logBytes32(root);
        console.logBytes32(nulifierHash);
        console.logBytes32(proposalId);
        console.logBytes32(voteType);

        require(verifier.verify(proofBytes, publicInputs), "failed to verify proof");
    }

    function test_createProposal_ZKP() public {
        string[] memory usernames = new string[](1);
        address[] memory users = new address[](1);
        uint256[] memory commitmentHashes = new uint256[](1);

        uint256 commitmentHash = vm.parseUint(vm.readFile("./data/commitmentHash.txt"));

        usernames[0] = "alice";
        users[0] = address(123);
        commitmentHashes[0] = commitmentHash;

        zkKYC.registerMultipleUsers(usernames, users, commitmentHashes);

        string memory username = "alice";
        string memory description = "xyz";
        bytes memory data = ""; // used to execute arbitrary data

        vm.prank(address(123));
        zkKYC.createProposal(username, description, data);

        string memory proofFilePath = "./circuits/proofs/vote.proof";
        string memory proof = vm.readLine(proofFilePath);
        bytes memory proofBytes = vm.parseBytes(proof);

        bytes32 root = vm.parseBytes32(vm.readFile("./data/root.txt"));

        // console.logBytes32(root);
        bytes32 nulifierHash = vm.parseBytes32(vm.readFile("./data/nulifierHash.txt"));
        bytes32 proposalId = vm.parseBytes32(vm.readFile("./data/proposalId.txt"));
        bytes32 voteType = vm.parseBytes32(vm.readFile("./data/voteType.txt"));

        bytes32[] memory publicInputs = new bytes32[](4);
        publicInputs[0] = root;
        publicInputs[1] = nulifierHash;
        publicInputs[2] = proposalId;
        publicInputs[3] = voteType;

        // random address
        vm.prank(address(93921381238));
        zkKYC.vote(proofBytes, publicInputs);

        Proposal memory voteStatus = zkKYC.getVoteStatus(uint256(proposalId));
        assertEq(voteStatus.votesFor, 1);
    }
}
