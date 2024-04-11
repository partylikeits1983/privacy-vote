// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";

import {ZK_KYC, Proposal} from "../src/ZK_KYC.sol";
import {UltraVerifier} from "../src/libraries/plonk_vk.sol";

contract ZK_KYC_DEPLOY is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        // link deployed address
        ZK_KYC zkKYC = ZK_KYC(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512);

        (string memory description, uint256 voteCount, uint256 votesFor, uint256 votesAgainst,,,) = zkKYC.proposals(0);

        console.log(description);
        console.log(voteCount);
        console.log(votesFor);
        console.log(votesAgainst);
    }
}
