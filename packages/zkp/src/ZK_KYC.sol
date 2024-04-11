// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {CryptoTools} from "./CryptoTools.sol";
import {UltraVerifier} from "./libraries/plonk_vk.sol";

struct UserInfo {
    address userAddress;
    string username;
    uint256 commitment;
    uint256 commitmentId;
    bool isAuthenticated;
}

struct Proposal {
    string description;
    uint256 voteCount;
    uint256 votesFor;
    uint256 votesAgainst;
    uint256 createdAt;
    bool isAccepted;
    bytes data;
}

contract ZK_KYC is CryptoTools {
    string public sanityCheck = "ZK_KYC is deployed";

    /// @dev  username string => UserInfo
    mapping(string username => UserInfo) public userData;

    /// @dev proposalId => Proposal
    mapping(uint256 proposalId => Proposal) public proposals;

    /// @dev proposalId
    uint256 public currentProposalId;

    /// @dev nulifierHash => bool
    mapping(uint256 nulifierHashes => mapping(uint256 proposalId => bool)) public nulifierHashes;

    /// @dev address admin
    address public admin;

    /// @dev address verifier
    UltraVerifier public verifier;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only owner can call this function");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /// @dev Set the verifier contract address
    function setVerifier(address verifierAddress) public onlyAdmin {
        verifier = UltraVerifier(verifierAddress);
    }

    /// @dev get user credentialId for WebAuthn
    function getCredentialId(string memory username) public view returns (UserInfo memory) {
        UserInfo memory userInfo = userData[username];

        if (bytes(userInfo.username).length == 0) {
            revert("User not found");
        } else {
            return userInfo;
        }
    }

    /// @dev user requests registration
    function requestRegistration(string memory username, uint256 commitment) public {
        UserInfo memory userInfo = userData[username];

        if (bytes(userInfo.username).length == 0) {
            userData[username] = UserInfo(msg.sender, username, commitment, 0, false);
        } else {
            revert("user already exists");
        }
    }

    /// @dev admin can accept user registration request after KYC
    function registerUser(string memory username) external onlyAdmin {
        UserInfo memory userInfo = userData[username];

        if (bytes(userInfo.username).length == 0) {
            revert("User not found");
        } else {
            userData[username].isAuthenticated = true;
            userData[username].commitmentId = nextIndex;
            insert(userData[username].commitment);
        }
    }

    // @dev admin can register multiple users
    function registerMultipleUsers(string[] memory usernames, address[] memory addresses, uint256[] memory commitments)
        external
        onlyAdmin
    {
        require(usernames.length == commitments.length, "Invalid input length");

        for (uint256 i = 0; i < usernames.length; i++) {
            string memory username = usernames[i];
            address user = addresses[i];
            uint256 commitment = commitments[i];

            UserInfo memory userInfo = userData[username];

            if (bytes(userInfo.username).length == 0) {
                userData[username] = UserInfo(user, username, commitment, nextIndex, true);
                insert(commitment);
            } else {
                revert("user already exists");
            }
        }
    }

    /// @dev create proposal
    function createProposal(string memory username, string memory description, bytes memory data) public {
        require(userData[username].isAuthenticated, "User not authenticated");
        require(userData[username].userAddress == msg.sender, "Only users can create proposal");
        require(bytes(description).length > 0, "Description cannot be empty");

        proposals[currentProposalId] = Proposal(description, 0, 0, 0, block.timestamp, false, data);

        currentProposalId++;
    }

    function getVoteStatus(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }

    /// @dev vote on proposal
    /// @dev nulifier hash is unique per proposal
    /// @dev nulifierHash = poseidon(nulifier, proposalId)
    function vote(bytes memory proof, bytes32[] memory publicInputs) public {
        require(verifier.verify(proof, publicInputs), "Invalid proof");

        uint256 root = uint256(publicInputs[0]);
        uint256 nulifierHash = uint256(publicInputs[1]);
        uint256 proposalId = uint256(publicInputs[2]);
        uint256 voteType = uint256(publicInputs[3]);

        require(isValidRoot(root), "Invalid root");
        require(!nulifierHashes[nulifierHash][proposalId], "Nulifier already used");
        require(bytes(proposals[proposalId].description).length > 0, "Proposal not found");

        nulifierHashes[nulifierHash][proposalId] = true;
        proposals[proposalId].voteCount++;

        if (voteType == 1) {
            proposals[proposalId].votesFor += 1;
        } else {
            proposals[proposalId].votesAgainst += 1;
        }
    }

    /// @dev Batch vote on proposals
    /// @dev nulifier hash is unique per proposal per vote
    /// @dev nulifierHash = poseidon(nulifier, proposalId) for each vote
    function batchVote(bytes[] memory proofs, bytes32[][] memory publicInputs) public {
        require(proofs.length == publicInputs.length, "Mismatched inputs");

        for (uint256 i = 0; i < proofs.length; i++) {
            // Extracting individual vote parameters from publicInputs
            uint256 root = uint256(publicInputs[i][0]);
            uint256 nulifierHash = uint256(publicInputs[i][1]);
            uint256 proposalId = uint256(publicInputs[i][2]);
            uint256 voteType = uint256(publicInputs[i][3]);

            // Verifying each vote's proof and parameters
            require(verifier.verify(proofs[i], publicInputs[i]), "Invalid proof");
            require(isValidRoot(root), "Invalid root");
            require(!nulifierHashes[nulifierHash][proposalId], "Nulifier already used");
            require(bytes(proposals[proposalId].description).length > 0, "Proposal not found");

            // Marking the nulifier as used for the given proposal
            nulifierHashes[nulifierHash][proposalId] = true;

            // Incrementing the vote count and updating votes for/against
            proposals[proposalId].voteCount++;
            if (voteType == 1) {
                proposals[proposalId].votesFor += 1;
            } else {
                proposals[proposalId].votesAgainst += 1;
            }
        }
    }
}
