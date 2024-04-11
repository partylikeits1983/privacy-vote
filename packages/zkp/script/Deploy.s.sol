// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";

import {ZK_KYC} from "../src/ZK_KYC.sol";
import {UltraVerifier} from "../src/libraries/plonk_vk.sol";

contract ZK_KYC_DEPLOY is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        // deploy
        ZK_KYC zkKYC = new ZK_KYC();
        UltraVerifier verifier = new UltraVerifier();

        console.log(address(zkKYC));

        // set verifier
        zkKYC.setVerifier(address(verifier));


        

        vm.stopBroadcast();
    }
}
