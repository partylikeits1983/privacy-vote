## Privacy Vote 

This repository is a basic demonstration of the Noir zk-circuit language, the WebAuthn API, and a Solidity Smart contract to enable a KYC'ed private voting mechanism.


### Running 
```
pnpm i
pnpm build 
```

```
pnpm start:zkp
```

In a new terminal:
```
pnpm deploy:contracts
pnpm start
```

The front end will be on http://localhost:3000

Make sure you have the RPC: http://127.0.0.1:8545 with chain id 31337 (Foundry Anvil) added to your wallet