
start localhost
```
anvil --accounts 10
```

run setup transactions
```
forge script script/Deploy.s.sol --fork-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
forge script script/BatchRegister.s.sol --fork-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
forge script script/SubmitProposal.s.sol --fork-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
```



misc:
```
forge script script/RequestRegister.s.sol --fork-url http://127.0.0.1:8545 --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d --broadcast
forge script script/AuthenticateUser.s.sol --fork-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
```


Circuits:
```
nargo build
nargo check
nargo prove
nargo execute
nargo verify
nargo codegen-verifier
```

Running tests:
```
forge test --match-contract zkKYCTest
rustc test/utils/formatOutput.rs
./formatOutput
forge test --match-contract ZKPverify
```



forge script script/GetValue.s.sol --fork-url http://127.0.0.1:8545

