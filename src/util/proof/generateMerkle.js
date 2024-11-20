const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const ethers = require('ethers');
const fs = require('fs');

// Load the list of eligible addresses and their respective amounts
const addressList = require('./addressList.json');

// Create leaf nodes by hashing address and amount together
const leafNodes = addressList.map(user => keccak256(user.address ));

// Create the Merkle tree
const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
const buf2hex = user => '0x' + user.toString('hex')

// Get the root of the Merkle tree
const root = buf2hex(merkleTree.getRoot());

// Generate proofs for each address and amount
const proofs = addressList.map(user => {
  const amount = ethers.parseUnits(user.amount.toString(), 18);
  const leaf = keccak256(user.address);
  const proof = merkleTree.getHexProof(leaf);
  return {address: user.address, amount: amount, proof };
});

function stringifyBigInt(obj) {
  return JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value,
    2
  );
}

// Save the root and proofs to files
fs.writeFileSync('./merkleRoot.json', JSON.stringify({ root }));
fs.writeFileSync('./proofs.json', stringifyBigInt(proofs));

console.log('Merkle Root:', root);
console.log('Merkle Tree\n', merkleTree.toString());