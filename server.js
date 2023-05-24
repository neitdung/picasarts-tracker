const Hub = require('./abis/Hub.json');
const FungibleToken = require('./abis/FungibleToken.json');
const PNFT = require('./abis/PNFT.json');
const config = require('./config.json');
const { ethers } = require("ethers");
const axios = require('axios');

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

hubContract.on("AddToken", async (tokenAddr, _event) => {
    try {
        let tokenDetails = [];
        const tokenContract = new ethers.Contract(
            tokenAddr,
            FungibleToken.abi,
            provider
        )
        tokenDetails.push(tokenContract.name());
        tokenDetails.push(tokenContract.symbol());
        tokenDetails.push(tokenContract.decimals());
        let tokenDetailValues = await Promise.all(tokenDetails);
        let existedToken = await Token.findOne({ address: tokenAddr, chain: "calamus" });
        if (!existedToken) {
            Token.create({
                address: tokenAddr.toLowerCase(),
                chain: "calamus",
                name: tokenDetailValues[0],
                symbol: tokenDetailValues[1],
                decimals: tokenDetailValues[2],
                logo: "/" + tokenDetailValues[1].toLowerCase() + ".png"
            })
        }
    } catch (e) {
        console.log("Add token failed: ", e.message);
    }
})

hubContract.on("RemoveToken", async (tokenAddr, _event) => {
    try {
        Token.findOneAndDelete({ address: tokenAddr.toLowerCase(), chain: "calamus" }).exec();
    } catch (e) {
        console.log("Remove token failed: ", e.message);
    }
})

hubContract.on("RoleGranted", async (_role, account, _sender, _event) => {
    try {
        let existed = await ArtistRequest.findOne({ address: account.toLowerCase(), chain: "calamus" });
        if (existed) {
            ArtistRequest.findOneAndUpdate({ address: account.toLowerCase(), chain: "calamus" }, { approved: true }).exec()
        }
    } catch (e) {
        console.log("RoleGranted failed: ", e.message);
    }
})

hubContract.on("RoleRevoked", async (_role, account, _sender, _event) => {
    try {
        let existed = await ArtistRequest.findOne({ address: account.toLowerCase(), chain: "calamus" });
        if (existed) {
            ArtistRequest.findOneAndDelete({ address: account.toLowerCase(), chain: "calamus" }).exec()
        }
    } catch (e) {
        console.log("RoleRevoked failed: ", e.message);
    }
})

hubContract.on("CollectionCreated", async (cid, owner, nftAddress, c_hash, _event) => {
    try {
        const nftContract = new ethers.Contract(
            nftAddress,
            PNFT.abi,
            provider
        )
        nftContract.on("Transfer", (_from, to, tokenId, _event) => {
            try {
                let convertedTokenId = tokenId.toString();
                Nft.findOne({ contract_address: nftAddress, token_id: convertedTokenId, chain: "calamus" }, async (error, existingNft) => {
                    if (!existingNft) {
                        let hash = await nftContract.tokenURI(tokenId);
                        let metadata = await fetch(`http://127.0.0.1:8080/btfs/${hash}`);
                        let metadatJson = metadata.data;
                        Nft.create({
                            chain: "calamus",
                            contract_address: nftAddress,
                            token_id: convertedTokenId,
                            ipnft: nftAddress + "@" + convertedTokenId,
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
            } catch (e) {
                console.log("CollectionCreated failed: ", e.message);
            }
        });
    } catch (e) {
        console.log("CollectionCreated failed: ", e.message);
    }
    try {
        let metadata = await axios.get(`http://127.0.0.1:8080/btfs/${c_hash}`);
        let metadatJson = metadata.data;
        let collection = await Collection.findOne({ cid: cid.toString(), chain: "calamus" }) 
        if (!collection) {
            Collection.create({
                chain: "calamus",
                cid: cid.toString(),
                contract_address: nftAddress,
                owner: owner,
                hash: c_hash,
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
        }
    } catch (e) {
        console.log("CollectionCreated failed: ", e.message);
    }
})

hubContract.on("CollectionListed", async (cid, owner, nftAddress, c_hash, _event) => {
    try {
        let metadata = await axios.get(`http://127.0.0.1:8080/btfs/${c_hash}`);
        let metadatJson = metadata.data;
        let collection = await Collection.findOne({ cid: cid.toString(), chain: "calamus" })
        if (!collection) {
            Collection.create({
                chain: "calamus",
                cid: cid.toString(),
                contract_address: nftAddress,
                owner: owner,
                hash: c_hash,
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
        }
    } catch (e) {
        console.log("CollectionListed failed: ", e.message);
    }
    try{ 
        const nftContract = new ethers.Contract(
            nftAddress,
            PNFT.abi,
            provider
        )
        let eventFilter = nftContract.filters.Transfer();
        nftContract.queryFilter(eventFilter).then(events => {
            events.forEach(item => {
                let convertedTokenId = item.args.tokenId.toString();

                Nft.findOne({ contract_address: nftAddress, token_id: convertedTokenId, chain: "calamus" }, async (error, existingNft) => {
                    if (!existingNft) {
                        let hash = await nftContract.tokenURI(item.args.tokenId);
                        let metadata = await axios.get(`http://127.0.0.1:8080/btfs/${hash}`);
                        let metadatJson = metadata.data;
                        Nft.create({
                            chain: "calamus",
                            contract_address: nftAddress,
                            token_id: convertedTokenId,
                            ipnft: nftAddress + "@" + convertedTokenId,
                            hash: hash,
                            image: metadatJson.image,
                            name: metadatJson.name,
                            description: metadatJson.description,
                            external_url: metadatJson.external_url,
                            background_color: metadatJson.background_color,
                            royalty: metadatJson.royalty,
                            creator_address: item.args.to,
                            owner: item.args.to,
                            attributes: metadatJson.attributes
                        })
                    } else {
                        existingNft.owner = item.args.to;
                        existingNft.save();
                    }
                });
            })
        })
        nftContract.on("Transfer", (_from, to, tokenId, _event) => {
            try {
                let convertedTokenId = tokenId.toString();
                Nft.findOne({ token_id: convertedTokenId, chain: "calamus" }, async (error, existingNft) => {
                    if (!existingNft) {
                        let hash = await nftContract.tokenURI(tokenId);
                        let metadata = await axios.get(`http://127.0.0.1:8080/btfs/${hash}`);
                        let metadatJson = metadata.data;
                        Nft.create({
                            chain: "calamus",
                            contract_address: nftAddresss,
                            token_id: convertedTokenId,
                            ipnft: nftAddress + "@" + convertedTokenId,
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
            } catch (e) {
                console.log("CollectionListed failed: ", e.message);
            }
        });

    } catch (e) {
        console.log("CollectionListed failed: ", e.message);
    }
})

hubContract.on("CollectionEdited", async (cid, c_hash, _event) => {
    try {
        let metadata = await axios.get(`http://127.0.0.1:8080/btfs/${c_hash}`);
        let metadatJson = metadata.data;
        let collection = await Collection.findOne({ cid: cid.toString(), chain: "calamus" })
        if (!collection) {
            Collection.create({
                chain: "calamus",
                cid: cid.toString(),
                contract_address: nftAddress,
                owner: owner,
                hash: c_hash,
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
        } else {
            collection.hash = c_hash;
            collection.name = metadatJson.name;
            collection.symbol = metadatJson.symbol;
            collection.description = metadatJson.description;
            collection.logo = metadatJson.logo;
            collection.banner = metadatJson.banner;
            collection.facebook = metadatJson.banner;
            collection.twitter = metadatJson.twitter;
            collection.instagram = metadatJson.instagram;
            collection.website = metadatJson.website;
            collection.save();
        }
    } catch (e) {
        console.log("CollectionEditted failed: ", e.message);
    }
})

async function listenOldContracts() {
    try {
        let nftContractList = await Collection.find({ chain: "calamus" }, 'contract_address')
        nftContractList.forEach(item => {
            const nftContract = new ethers.Contract(
                item.contract_address,
                PNFT.abi,
                provider
            )
            nftContract.on("Transfer", (_from, to, tokenId, _event) => {
                try {
                    let convertedTokenId = tokenId.toString();
                    Nft.findOne({ address: item.contract_address, token_id: convertedTokenId, chain: "calamus" }, async (error, existingNft) => {
                        if (!existingNft) {
                            let hash = await nftContract.tokenURI(tokenId);
                            let metadata = await axios.get(`http://127.0.0.1:8080/btfs/${hash}`);
                            let metadatJson = metadata.data;
                            Nft.create({
                                chain: "calamus",
                                contract_address: item.contract_address,
                                token_id: convertedTokenId,
                                ipnft: item.contract_address + "@" + convertedTokenId,
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
                } catch (e) {
                    console.log("Listen old contract: ", nftAddress)
                }
                
            });
        })

    } catch (e) {
        console.log("Listen from old contracts: ", e.message)
    }

}

listenOldContracts();
