const WAValidator = require('wallet-address-validator');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const fs = require('fs');

const getRoot = () => {
  const rawdata = fs.readFileSync(`./src/services/whitelist.json`);

  const whiteListArray = JSON.parse(rawdata);

  const leaves = whiteListArray.map((v) => keccak256(v));
  const tree = new MerkleTree(leaves, keccak256, { sort: true });
  const root = tree.getHexRoot();
  return root;
}

const verifyWhitelist = (address) => {
  // Wallet Validate
  const valid = WAValidator.validate(address, 'ETH');
  if (!valid) {
    console.log('Address INVALID');
    return false;
  }
  console.log('address: ', address);
  console.log('This is a valid address');

  const rawdata = fs.readFileSync(`./src/services/whitelist.json`);

  const whiteListArray = JSON.parse(rawdata);
  console.log('whitelistarray: ', whiteListArray);

  const leaves = whiteListArray.map((v) => keccak256(v));
  const tree = new MerkleTree(leaves, keccak256, { sort: true });
  const root = tree.getHexRoot();
  const leaf = keccak256(address);
  const proof = tree.getHexProof(leaf);
  const verified = tree.verify(proof, leaf, root);
  console.log('root: ', root);
  console.log('leaf: ', leaf);
  console.log('proof: ', proof);
  console.log('verified: ', verified);
  return { proof, leaf, verified };
};

const getAllList = () => {
  const rawdata = fs.readFileSync(`./src/services/whitelist.json`);
  const whiteListArray = JSON.parse(rawdata);
  console.log(whiteListArray);
  return whiteListArray;
}

const addWhiteList = (whitelist) => {
  const list_arr = whitelist.split(',');
  const rawdata = fs.readFileSync(`./src/services/whitelist.json`);
  const whiteListArray = JSON.parse(rawdata);
  const resultArray = whiteListArray.concat(list_arr.filter((item) => whiteListArray.indexOf(item) < 0));
  const resultStr = JSON.stringify(resultArray);
  fs.writeFileSync(`./src/services/whitelist.json`, resultStr);
}

const removeWhiteList = (whitelist) => {
  const list_arr = whitelist.split(',');
  const rawdata = fs.readFileSync(`./src/services/whitelist.json`);
  const whiteListArray = JSON.parse(rawdata);
  const resultArr =  whiteListArray.filter(i => !list_arr.includes(i));
  const resultStr = JSON.stringify(resultArr);
  fs.writeFileSync(`./src/services/whitelist.json`, resultStr);
}


module.exports = {
  verifyWhitelist,
  addWhiteList,
  removeWhiteList,
  getAllList,
  getRoot
};