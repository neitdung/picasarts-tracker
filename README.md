# picasarts-tracker
This repo has responsibility for tracking NFT data change from [smart contracts](https://github.com/neitdung/picasarts-docs/blob/main/docs/contract.md) as:
- NFT owner change
- Collection import/create
- Add/remove whitelist tokens
- Grant/revoke artist

When new collection create or import, new process will be created to tracking NFT owner change and also tracking owner from past events. Server need to be ran before UI running and list of NFT contracts need to tracking will be lost when server restart.

## Install
- Copy file ```config.json``` and ```abis``` folder
- ```npm install```
- ```npm start```
More documents: [picasarts-docs](https://github.com/neitdung/picasarts-docs)
