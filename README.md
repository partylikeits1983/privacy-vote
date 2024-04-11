## Privacy Vote 

This repository is a basic demonstration of the Noir zk-circuit language, the WebAuthn API, and a Solidity Smart contract to enable a KYC'ed private voting mechanism.


### 1) start the local development EVM chain
```
cd privacy-vote-contracts
anvil -a 20
```
In a new terminal:
```
cd privacy-vote-contracts
forge script script/Deploy.s.sol --fork-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
forge script script/BatchRegister.s.sol --fork-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
forge script script/SubmitProposal.s.sol --fork-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
```

### 2) start the express API
```
cd backend
pnpm i 
pnpm run dev
```

### 3) start the frontend interface
```
cd interface
pnpm i 
pnpm start
```