const Hub = require('./abis/Hub.json');
const FungibleToken = require('./abis/FungibleToken.json');
const PNFT = require('./abis/PNFT.json');
const config = require('./config.json');
const { ethers } = require("ethers");
const Collection = require("./models/Collection");
const Nft = require("./models/Nft");
const User = require("./models/User");
const Token = require("./models/Token");
const ArtistRequest = require("./models/Artist");

const Mongoose = require('mongoose');

const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

const hubContract = new ethers.Contract(
    config.hub,
    Hub.abi,
    provider
)
Mongoose.connect('mongodb://localhost:27017/picasarts', { useNewUrlParser: true });

// hubContract.on("AddToken", async (tokenAddr, _event) => {
//     try {
//         let tokenDetails = [];
//         const tokenContract = new ethers.Contract(
//             tokenAddr,
//             FungibleToken.abi,
//             provider
//         )
//         tokenDetails.push(tokenContract.name());
//         tokenDetails.push(tokenContract.symbol());
//         tokenDetails.push(tokenContract.decimals());
//         let tokenDetailValues = await Promise.all(tokenDetails);
//         Token.create({
//             address: tokenAddr,
//             chain: "calamus",
//             name: tokenDetailValues[0],
//             symbol: tokenDetailValues[1],
//             decimals: tokenDetailValues[2],
//             logo: "/" + tokenDetailValues[1].toLowerCase() + ".png"
//         })
//     } catch (e) {
//         console.log("Add token failed: ", e.message);
//     }
// })

// hubContract.on("RemoveToken", async (tokenAddr, _event) => {
//     try {
//         Token.findOneAndDelete({ address: tokenAddr, chain: "calamus" });
//     } catch (e) {
//         console.log("Remove token failed: ", e.message);
//     }
// })

// hubContract.on("RoleGranted", async (_role, account, _sender, _event) => {
//     try {
//         ArtistRequest.findOneAndUpdate({ owner: from, address: account, chain: "calamus" }, {approved: true})
//     } catch (e) {
//         console.log("RoleGranted failed: ", e.message);
//     }
// })

// hubContract.on("RoleRevoked", async (_role, account, _sender, _event) => {
//     try {
//         ArtistRequest.findOneAndDelete({ owner: from, address: account, chain: "calamus" })
//     } catch (e) {
//         console.log("RoleRevoked failed: ", e.message);
//     }
// })

// hubContract.on("CollectionCreated", async (cid, owner, nftAddress, hash, _event) => {
//     try {
//         const nftContract = new ethers.Contract(
//             item.address,
//             PNFT.abi,
//             provider
//         )
//         nftContract.on("Transfer", (from, to, tokenId, _event) => {
//             let convertedTokenId = tokenId.toString();
//             Nft.findOne({ owner: from, token_id: convertedTokenId, chain: "calamus" }, async (error, existingNft) => {
//                 if (!existingNft) {
//                     let hash = await nftContract.tokenURI();
//                     let metadata = await fetch(`http://127.0.0.1:8080/bfts/${hash}`);
//                     let metadatJson = await metadata.json();
//                     Nft.create({
//                         chain: "calamus",
//                         contract_address: item.address,
//                         token_id: convertedTokenId,
//                         ipnft: item.address + "@" + convertedTokenId,
//                         hash: hash,
//                         image: metadatJson.image,
//                         name: metadatJson.name,
//                         description: metadatJson.description,
//                         external_url: metadatJson.external_url,
//                         background_color: metadatJson.background_color,
//                         royalty: metadatJson.royalty,
//                         creator_address: to,
//                         owner: to,
//                         attributes: metadatJson.attributes
//                     })
//                 } else {
//                     existingNft.owner = to;
//                     existingNft.save();
//                 }
//             });
//         });
//         let metadata = await fetch(`http://127.0.0.1:8080/bfts/${hash}`);
//         let metadatJson = await metadata.json();
//         Collection.create({
//             chain: "calamus",
//             cid: cid.toString(),
//             contract_address: nftAddress,
//             owner: owner,
//             hash: hash,
//             name: metadatJson.name,
//             symbol: metadatJson.symbol,
//             description: metadatJson.description,
//             logo: metadatJson.logo,
//             banner: metadatJson.banner,
//             facebook: metadatJson.banner,
//             twitter: metadatJson.twitter,
//             instagram: metadatJson.instagram,
//             website: metadatJson.website
//         });
//     } catch (e) {
//         console.log("CollectionCreated failed: ", e.message);
//     }
// })

hubContract.on("CollectionListed", async (cid, owner, nftAddress, hash, _event) => {
    try {
        const nftContract = new ethers.Contract(
            nftAddress,
            PNFT.abi,
            provider
        )
        const filter = nftContract.filters.Transfer();
        provider.getLogs(filter).then(function (events) {
            console.log(events);
        });
        nftContract.on("Transfer", (from, to, tokenId, _event) => {
            let convertedTokenId = tokenId.toString();
            Nft.findOne({ owner: from, token_id: convertedTokenId, chain: "calamus" }, async (error, existingNft) => {
                if (!existingNft) {
                    let hash = await nftContract.tokenURI();
                    let metadata = await fetch(`http://127.0.0.1:8080/bfts/${hash}`);
                    let metadatJson = await metadata.json();
                    Nft.create({
                        chain: "calamus",
                        contract_address: item.address,
                        token_id: convertedTokenId,
                        ipnft: item.address + "@" + convertedTokenId,
                        hash: hash,
                        image: metadatJson.image,
                        name: metadatJson.name,
                        description: metadatJson.description,
                        external_url: metadatJson.external_url,
                        background_color: metadatJson.background_color,
                        royalty: metadatJson.royalty,
                        creator_address: to,
                        owner: to,
                        attributes: metadatJson.attributes
                    })
                } else {
                    existingNft.owner = to;
                    existingNft.save();
                }
            });
        });
        let metadata = await fetch(`http://127.0.0.1:8080/bfts/${hash}`);
        let metadatJson = await metadata.json();
        Collection.create({
            chain: "calamus",
            cid: cid.toString(),
            contract_address: nftAddress,
            owner: owner,
            hash: hash,
            name: metadatJson.name,
            symbol: metadatJson.symbol,
            description: metadatJson.description,
            logo: metadatJson.logo,
            banner: metadatJson.banner,
            facebook: metadatJson.banner,
            twitter: metadatJson.twitter,
            instagram: metadatJson.instagram,
            website: metadatJson.website
        });
    } catch (e) {
        console.log("CollectionCreated failed: ", e.message);
    }
})

// hubContract.on("CollectionEdited", async (_role, account, _sender, _event) => {
//     try {
//         ArtistRequest.findOneAndUpdate({ owner: from, address: account, chain: "calamus" }, { approved: true })
//     } catch (e) {
//         console.log("RoleGranted failed: ", e.message);
//     }
// })

// async function listenOldContracts() {
//     try {
//         let nftContractList = await Collection.find({chain: "calamus"}, 'address')
//         nftContractList.forEach(item => {
//             const nftContract = new ethers.Contract(
//                 item.address,
//                 PNFT.abi,
//                 provider
//             )
//             nftContract.on("Transfer", (from, to, tokenId, _event) => {
//                 let convertedTokenId = tokenId.toString();
//                 Nft.findOne({ owner: from, token_id: convertedTokenId, chain: "calamus" }, async (error, existingNft) => {
//                     if (!existingNft) {
//                         let hash = await nftContract.tokenURI();
//                         let metadata = await fetch(`http://127.0.0.1:8080/bfts/${hash}`);
//                         let metadatJson = await metadata.json();
//                         Nft.create({
//                             chain: "calamus",
//                             contract_address: item.address,
//                             token_id: convertedTokenId,
//                             ipnft: item.address + "@" + convertedTokenId,
//                             hash: hash,
//                             image: metadatJson.image,
//                             name: metadatJson.name,
//                             description: metadatJson.description,
//                             external_url: metadatJson.external_url,
//                             background_color: metadatJson.background_color,
//                             royalty: metadatJson.royalty,
//                             creator_address: to,
//                             owner: to,
//                             attributes: metadatJson.attributes
//                         })
//                     } else {
//                         existingNft.owner = to;
//                         existingNft.save();
//                     }
//                 });
//             });
//         })

//     } catch (e) {
//         console.log("Listen from old contracts: ", e.message)
//     }

// }

// listenOldContracts();
