import { Block } from "../classes/block.js";
import BlockHeader from "../classes/blockHeader.js";
import { BlockData } from "../classes/blockData.js";
import { Transaction } from "../classes/transactions.js";
import { NO_OF_TRANSACTIONS_IN_BLOCK } from "../constants/const.js";

export class Blockchain {
  constructor() {
    this.chain = [];
    this.createGenesisBlock();
  }

  createGenesisBlock() {
    const header = new BlockHeader(0, "0".repeat(64), 0);
    const data = new BlockData([]);
    const block = new Block(header, data);
    block.makeMerkleTree();
    this.chain.push(block);
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(transactions) {
    const prevBlock = this.getLatestBlock();
    const header = new BlockHeader(
      transactions.length,
      prevBlock.hash,
      Math.floor(Math.random() * 100000)
    );
    const data = new BlockData(transactions);
    const block = new Block(header, data);
    block.makeMerkleTree();
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
