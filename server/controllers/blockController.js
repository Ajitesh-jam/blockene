// controllers/blockController.js
import { makeBlockFromData } from "../../blockchain/classes/block.js";
import { WitnessListOfTxPool } from "../../witness_list/witnessListClass.js";
import { Blockchain } from "../../blockchain/core/blockchain.js";
let blockchain = new Blockchain(); //initialize blockchain with genesis block
let newBlockProposals = []; //this will be used to store the new block proposal received from the citizen

//ek validate block function bna le jo block ki properties ko check kare
//call block.verify

let witnessList = []; //array of witness lists ,(element is of type WitnessListClass)

export const addBlockToProposals = (req, res) => {
  //add logic to validate the block before adding it
  try {
    const { previousHash, nounce, transactions } = req.body;

    console.log("Adding block to proposals with data:", {
      previousHash,
      nounce,
      transactions,
    });
    // Validate the input data
    const newBlock = makeBlockFromData(
      transactions.length,
      previousHash,
      nounce,
      transactions
    );
    if (!newBlock) {
      return res.status(400).json({ message: "Invalid block data" });
    }
    // Validate the block
    if (!newBlock.verify()) {
      return res.status(400).json({ message: "Block verification failed" });
    }
    // Add block to newBlockProposals
    newBlockProposals.push(newBlock);
    res.status(201).json(newBlock);
  } catch (error) {
    console.error("Error adding block to proposals:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const addBlockToBlockchain = (req, res) => {
  const { transactions } = req.body;
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return res.status(400).json({ message: "Invalid transactions data" });
  }
  blockchain.addBlock(transactions);
  res.status(201).json({
    message: "Block added to blockchain",
    block: blockchain.getLatestBlock(),
  });
};

export const getNewBlockProposals = (req, res) => {
  if (newBlockProposals.length === 0) {
    return res.status(404).json({ message: "No new block proposals found" });
  }
  res.status(200).json(newBlockProposals);
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
