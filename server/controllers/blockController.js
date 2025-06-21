// controllers/blockController.js
import { Block } from "../models/Block.js";

let blockchain = [];

//ek validate block function bna le jo block ki properties ko check kare
//call block.verify

export const addBlock = (req, res) => {
  //add logic to validate the block before adding it

  const { index, data, previousHash, hash } = req.body;
  const timestamp = new Date().toISOString();
  const newBlock = new Block(index, timestamp, data, previousHash, hash);
  blockchain.push(newBlock);
  res.status(201).json(newBlock);
};

export const getAllBlocks = (req, res) => {
  res.status(200).json(blockchain);
};

export const getBlockByIndex = (req, res) => {
  const { index } = req.params;
  const block = blockchain.find((b) => b.index == index);
  if (block) {
    res.json(block);
  } else {
    res.status(404).json({ message: "Block not found" });
  }
};

export const getLatestBlock = (req, res) => {
  if (blockchain.length === 0)
    return res.status(404).json({ message: "Blockchain is empty" });
  res.json(blockchain[blockchain.length - 1]);
};

export const getLatestHash = (req, res) => {
  if (blockchain.length === 0)
    return res.status(404).json({ message: "Blockchain is empty" });
  res.json({ hash: blockchain[blockchain.length - 1].hash });
};

export const getNBlocks = (req, res) => {
  const n = parseInt(req.params.n);
  if (isNaN(n) || n <= 0) {
    return res.status(400).json({ message: "Invalid value for N" });
  }
  const latestBlocks = blockchain.slice(-n).reverse();
  res.json(latestBlocks);
};

export const replaceChain = (req, res) => {
  const { chain } = req.body;
  if (isValidChain(chain) && chain.length > blockchain.length) {
    blockchain = chain;
    res.send("Chain replaced with consensus chain.");
  } else {
    res.status(400).send("Invalid or shorter chain.");
  }
};

// Validate the integrity of a blockchain
export function isValidChain(chain) {
  for (let i = 1; i < chain.length; i++) {
    if (chain[i].previousHash !== chain[i - 1].hash) return false;
  }
  return true;
}

export const getBlockchain = () => blockchain; //yeh kyu hai? Is it used somewhere?
export const setBlockchain = (newChain) => {
  blockchain = newChain;
};

//add witness list related functions bhi
