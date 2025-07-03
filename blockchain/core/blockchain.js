import { Transaction } from "../classes/transactions.js";
import { Block } from "../classes/block.js";
import { BlockHeader } from "../classes/blockHeader.js";
import { BlockData } from "../classes/blockData.js";
import {
  NO_OF_TRANSACTIONS_IN_BLOCK,
  FIRST_BLOCK_HASH,
} from "../../constants/const.js";

export class Blockchain {
  constructor() {
    this.chain = [];
    this.createGenesisBlock();
  }

  createGenesisBlock() {
    const header = new BlockHeader(0, FIRST_BLOCK_HASH, 0);
    const data = new BlockData([]);
    const block = new Block(header, data);
    block.makeMerkleTree();
    this.chain.push(block);
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }
  getLatestHash() {
    return this.getLatestBlock().hash;
  }

  addBlockByTransactions(transactions) {
    const prevBlock = this.getLatestBlock();
    const header = new BlockHeader(
      transactions.length(),
      prevBlock.hash,
      chain.length + 1
    );
    //convert transactions from json to Transaction class instances
    transactions = transactions.map((tx) => {
      if (!(tx instanceof Transaction)) {
        return new Transaction(
          tx.id,
          tx.from,
          tx.to,
          tx.amount,
          tx.signature,
          tx.timestamp
        );
      }
      return tx;
    });
    const data = new BlockData(transactions);
    const block = new Block(header, data);
    block.makeMerkleTree();
    this.chain.push(block);
  }
  addBlock(block) {
    if (!(block instanceof Block)) {
      throw new Error("Block must be an instance of Block class");
    }
    if (!block.verify()) {
      throw new Error("Block verification failed");
    }
    this.chain.push(block);
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const curr = this.chain[i];
      const prev = this.chain[i - 1];

      curr.makeMerkleTree(); // Recalculate Merkle root
      if (curr.header.prevHash !== prev.hash) return false;
    }
    return true;
  }
}
