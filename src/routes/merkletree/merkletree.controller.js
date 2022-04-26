const WAValidator = require('wallet-address-validator');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const fs = require('fs');
const { docClient, whitelistTable } = require('../../services/dynamo');

const getRoot = async () => {
  let whiteListArray = [];
  let root="";
  params = {
    TableName: whitelistTable,
  }
  await docClient.scan(params, async (err, data) => {
    if(err) console.log(err);
    else {
      for (let item of data.Items) {
        whiteListArray.push(item.address);
      }
      const leaves = whiteListArray.map((v) => keccak256(v));
      const tree = new MerkleTree(leaves, keccak256, { sort: true });
      root = await tree.getHexRoot();
      console.log(root);
      return root;
    }
  });
}

const verifyWhitelist = async (address) => {
  // Wallet Validate
  const valid = WAValidator.validate(address, 'ETH');
  if (!valid) {
    console.log('Address INVALID');
    return false;
  }
  console.log('address: ', address);
  console.log('This is a valid address');

  let whiteListArray = [];
  params = {
    TableName: whitelistTable,
  }
  await docClient.scan(params, async (err, data) => {
    for(item of data.Items) {
      whiteListArray.push(item.address);
    }
    const leaves = whiteListArray.map((v) => keccak256(v));
    const tree = new MerkleTree(leaves, keccak256, { sort: true });
    const root = tree.getHexRoot();
    const leaf = keccak256(address);
    const proof = tree.getHexProof(leaf);
    const verified = tree.verify(proof, leaf, root);
    // console.log('root: ', root);
    // console.log('leaf: ', leaf);
    // console.log('proof: ', proof);
    // console.log('verified: ', verified);
  });
  return { proof, leaf, verified };

};

const getAllList = async () => {
  let wholeList = [];
  params = {
    TableName: whitelistTable,
  }
  await docClient.scan(params, async (err, data) => {
    for(item of data.Items) {
      wholeList.push(item.address);
    }
  });
  return wholeList;
}

const addWhiteList = async (whitelist) => {
  // const list_arr = whitelist.split(',');
  for (let item of whitelist) {
    params = {
      TableName: whitelistTable,
      Item: {
          "address": item,
          "status": "true"
      }
    }
    await docClient.put(params, (err, data) => {
      if (err) {
        console.log(err)
      }
    });
  }
}

const removeWhiteList = async (whitelist) => {
  for (let item of whitelist) {
    params = {
      TableName: whitelistTable,
      Key: {
          "address": item,
      }
    }
    await docClient.delete(params, (err, data) => {
      if (err) {
        console.log(err)
      }
    });
  }
}


module.exports = {
  verifyWhitelist,
  addWhiteList,
  removeWhiteList,
  getAllList,
  getRoot
};