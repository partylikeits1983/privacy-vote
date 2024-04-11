// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {ZK_KYC, UserInfo} from "../src/ZK_KYC.sol";
import {PoseidonT2} from "../src/libraries/PoseidonT2.sol";
import {PoseidonT3} from "../src/libraries/PoseidonT3.sol";
import {ConvertBytes32ToString} from "./utils/Bytes32toString.sol";

contract zkKYCTest is Test, ConvertBytes32ToString {
    ZK_KYC public zkKYC;

    function setUp() public {
        zkKYC = new ZK_KYC();
    }

    function test_RequestRegistrationAndRegister() public {
        address alice = address(123);
        vm.startPrank(alice);
        string memory username = "alice";
        uint256 commitment = 0;
        zkKYC.requestRegistration(username, commitment);
        vm.stopPrank();

        address admin = address(this);
        vm.startPrank(admin);
        zkKYC.registerUser("alice");
        UserInfo memory userInfo = zkKYC.getCredentialId("alice");

        assertEq(userInfo.username, "alice");
    }

    function test_WriteProverData() public {
        vm.writeFile("data/root.txt", "");
        vm.writeFile("data/commitmentHash.txt", "");
        vm.writeFile("data/nulifierHash.txt", "");
        vm.writeFile("data/commitment.txt", "");
        vm.writeFile("data/proofSiblings.txt", "");
        vm.writeFile("data/proofPathIndices.txt", "");
        vm.writeFile("data/nulifier.txt", "");
        vm.writeFile("data/secret.txt", "");
        vm.writeFile("data/proposalId.txt", "");
        vm.writeFile("data/voteType.txt", "");

        // private inputs
        uint256 nulifier = 0;
        uint256 secret = 0;

        // public inputs
        uint256 proposalId = 0;
        uint256 voteType = 1; // [true]

        // calculated inside circuit
        uint256 commitmentHash = PoseidonT3.hash([nulifier, secret]);
        uint256 nulifierHash = PoseidonT3.hash([nulifier, proposalId]);

        uint256 root = zkKYC.insert(commitmentHash);

        (uint256[] memory proofSiblings, uint8[] memory proofPathIndices) = zkKYC.createProof(0);

        vm.writeFile("data/root.txt", bytes32ToString(bytes32(root)));
        vm.writeFile("data/commitmentHash.txt", bytes32ToString(bytes32(commitmentHash)));
        vm.writeFile("data/nulifierHash.txt", bytes32ToString(bytes32(nulifierHash)));
        vm.writeFile("data/nulifier.txt", bytes32ToString(bytes32(nulifier)));
        vm.writeFile("data/secret.txt", bytes32ToString(bytes32(secret)));
        vm.writeFile("data/proposalId.txt", bytes32ToString(bytes32(proposalId)));
        vm.writeFile("data/voteType.txt", bytes32ToString(bytes32(voteType)));

        for (uint256 i = 0; i < proofSiblings.length; i++) {
            string memory path = "data/proofSiblings.txt";
            vm.writeLine(path, bytes32ToString(bytes32(proofSiblings[i])));
        }

        console.log("Proof path indices:");
        for (uint256 i = 0; i < proofPathIndices.length; i++) {
            string memory path = "data/proofPathIndices.txt";
            vm.writeLine(path, bytes32ToString(bytes32(uint256(proofPathIndices[i]))));
        }

        require(zkKYC.verifyLeaf(commitmentHash, proofSiblings, proofPathIndices), "failed");
    }

    function test_InsertMultipleUsers() public {
        address alice = address(0x123);
        address bob = address(0x234);
        address eve = address(0x345);

        address[] memory users = new address[](3);
        users[0] = alice;
        users[1] = bob;
        users[2] = eve;

        string memory username1 = "alice";
        string memory username2 = "bob";
        string memory username3 = "eve";

        string[] memory usernames = new string[](3);
        usernames[0] = username1;
        usernames[1] = username2;
        usernames[2] = username3;

        uint256 commitment1 = 0;
        uint256 commitment2 = 1;
        uint256 commitment3 = 2;

        uint256[] memory commitments = new uint256[](3);
        commitments[0] = commitment1;
        commitments[1] = commitment2;
        commitments[2] = commitment3;

        zkKYC.registerMultipleUsers(usernames, users, commitments);

        UserInfo memory userInfo = zkKYC.getCredentialId("alice");

        assertEq(userInfo.userAddress, address(0x123));
    }
}
