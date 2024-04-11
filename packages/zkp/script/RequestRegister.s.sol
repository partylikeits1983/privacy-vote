// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";

import {ZK_KYC} from "../src/ZK_KYC.sol";
import {UltraVerifier} from "../src/libraries/plonk_vk.sol";

contract ZK_KYC_DEPLOY is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        // link deployed address
        ZK_KYC zkKYC = ZK_KYC(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512);

        string memory username = "alice";
        uint256 commitment = 0x2098f5fb9e239eab3ceac3f27b81e481dc3124d55ffed523a839ee8446b64864;
        zkKYC.requestRegistration(username, commitment);
        vm.stopBroadcast();
    }
}
