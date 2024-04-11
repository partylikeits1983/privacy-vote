// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {ZK_KYC} from "../src/ZK_KYC.sol";

contract ZK_KYC_DEPLOY is Script {
    function setUp() public {}

    function run() public {
        vm.broadcast();
        // link deployed address
        ZK_KYC zkKYC = ZK_KYC(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512);

        address[] memory users = new address[](3);
        users[0] = address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266);
        users[1] = address(0x70997970C51812dc3A010C7d01b50e0d17dc79C8);
        users[2] = address(0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC);

        string[] memory usernames = new string[](3);
        usernames[0] = "alice";
        usernames[1] = "bob";
        usernames[2] = "eve";



        uint256[] memory commitments = new uint256[](3);
        commitments[0] = 0x2098f5fb9e239eab3ceac3f27b81e481dc3124d55ffed523a839ee8446b64864;
        commitments[1] = 1;
        commitments[2] = 2;

        zkKYC.registerMultipleUsers(usernames, users, commitments);
    }
}
