import { Router } from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

import ZK_KYCABI from "../abi/ZK_KYC.json";
const WebAuthnAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545"; // Use RPC_URL from .env if available

const PRIVATE_KEY = process.env.PRIVATE_KEY; // Load the private key from .env

if (!PRIVATE_KEY) {
  console.error("Private key not found in .env file.");
  process.exit(1); // Exit if no private key found
}

const requestKYC_Route = Router();

// Route to accept a string
requestKYC_Route.post("/request-kyc", async (req, res) => {
  console.log("data", req.body);
  const userData = req.body;

  console.log("request-kyc");

  if (userData) {
    const commitmentHash = userData.commitmentHash;

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    const zkKYC = new ethers.Contract(WebAuthnAddress, ZK_KYCABI.abi, wallet);

    try {
      const usernames = [userData.username];
      const userAddresses = [userData.userAddress];
      const commitmentHashes = [commitmentHash];

      await zkKYC.registerMultipleUsers(
        usernames,
        userAddresses,
        commitmentHashes,
      );
    } catch (error) {
      console.error("Error fetching proposal data:", error);
    }

    res.json({ data: userData });
  }
});

export default requestKYC_Route;
