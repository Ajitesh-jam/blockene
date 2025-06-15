// controllers/blockController.js
import { Block } from "../models/Block.js";

let blockchain = [];

export const createBlock = (req, res) => {
  const { index, timestamp, data, previousHash, hash } = req.body;
  const newBlock = new Block(index, timestamp, data, previousHash, hash);
  blockchain.push(newBlock);
  res.status(201).json(newBlock);
};

export const getBlocks = (req, res) => {
  res.status(200).json(blockchain);
};

export const getBlockByIndex = (req, res) => {
  const { index } = req.params;
  const block = blockchain.find(b => b.index == index);
  if (block) {
    res.json(block);
  } else {
    res.status(404).json({ message: "Block not found" });
  }
};

