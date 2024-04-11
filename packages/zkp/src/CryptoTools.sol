// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {PoseidonT3} from "./libraries/PoseidonT3.sol";
import {InternalBinaryIMT, BinaryIMTData} from "./libraries/InternalBinaryIMT.sol";

import "forge-std/console.sol";

contract CryptoTools {
    BinaryIMTData public binaryIMTData;

    mapping(uint256 => uint256) public roots;
    uint32 public constant ROOT_HISTORY_SIZE = 32;
    uint32 public currentRootIndex = 0;
    uint32 public nextIndex = 0;

    constructor() {
        InternalBinaryIMT._init(binaryIMTData, 32, 0);
    }

    function isValidRoot(uint256 root) public view returns (bool) {
        console.log("ROOT");
        console.log(root);
        for (uint32 i = 0; i < ROOT_HISTORY_SIZE; i++) {
            console.log(roots[i]);
            if (roots[i] == root) {
                return true;
            }
        }
        return false;
    }

    function lastSubtrees(uint256 index) public view returns (uint256[2] memory) {
        return binaryIMTData.lastSubtrees[index];
    }

    function hash(uint256 x, uint256 y) public pure returns (uint256) {
        uint256[2] memory input = [x, y];
        return PoseidonT3.hash(input);
    }

    function insert(uint256 leaf) public returns (uint256) {
        require(nextIndex < 2 ** 32, "Merkle tree is full. No more leaves can be added");

        uint256 root = InternalBinaryIMT._insert(binaryIMTData, leaf);
        uint32 newRootIndex = (currentRootIndex + 1) % ROOT_HISTORY_SIZE;
        currentRootIndex = newRootIndex;
        roots[newRootIndex] = root;
        nextIndex++;

        console.log("ROOT INSERT");
        console.log(root);

        return root;
    }

    function verifyLeaf(uint256 leaf, uint256[] calldata proofSiblings, uint8[] calldata proofPathIndices)
        public
        view
        returns (bool)
    {
        return InternalBinaryIMT._verify(binaryIMTData, leaf, proofSiblings, proofPathIndices);
    }

    function createProof(uint256 leafIndex)
        public
        view
        returns (uint256[] memory proofSiblings, uint8[] memory proofPathIndices)
    {
        return InternalBinaryIMT._createProof(binaryIMTData, leafIndex);
    }
}
