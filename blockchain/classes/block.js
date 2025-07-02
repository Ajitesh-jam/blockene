import { BlockHeader } from "./blockHeader.js";
import { BlockData } from "./blockData.js";
import { hash, buildMerkleTree } from "../utils/crypto.js";
import { Transaction } from "./transactions.js";
export class Block {
  header;
  data;
  hash;
  constructor(_header, _data) {
    if (!(_header instanceof BlockHeader)) {
      throw new Error("Block header must be an instance of BlockHeader");
    }
    if (!(_data instanceof BlockData)) {
      throw new Error("Block data must be an instance of BlockData");
    }
    this.header = _header;
    this.data = _data;
    this.hash = null;
    this.makeMerkleTree();
  }

  makeMerkleTree() {
    const transactions = this.data.getTransactions();
    const leaves = transactions.map((tx) => hash(tx.toString()));
    const txnHash = buildMerkleTree(leaves);
    this.hash = hash(this.header.toString() + txnHash).toString();
  }

  toString() {
    return JSON.stringify({
      header: this.header.toString(),
      data: this.data.toString(),
      hash: this.hash,
    });
  }

  getBlock() {
    return JSON.stringify({
      header: this.header.toString(),
      data: this.data.toString(),
      hash: this.hash,
    });
  }

  verify() {
    //call make merkle tree and compare the hash by merkel tree and this.hash
    const transactions = this.data.getTransactions();
    const leaves = transactions.map((tx) => hash(tx.toString()));
    const merkleRoot = buildMerkleTree(leaves);
    const merkelRootHash = hash(this.header.toString() + merkleRoot).toString();
    if (this.hash !== merkelRootHash) {
      throw new Error("Block hash does not match the Merkle root");
    }
    return true;
  }
}

export function makeBlockFromData(
  noOfTransactions,
  prevHash,
  nounce,
  transactions
) {
  if (!Array.isArray(transactions)) {
    throw new Error("Transactions must be an array");
  }
  if (transactions.length === 0) {
    throw new Error("Transactions array cannot be empty");
  }
  //make transactions instances of Transaction class if they are not already
  transactions = transactions.map((tx) => {
    if (
      typeof tx !== "object" ||
      !tx.id ||
      !tx.sender ||
      !tx.receiver ||
      !tx.amount ||
      !tx.timestamp ||
      !tx.signature
    ) {
      throw new Error(
        "Each transaction must be an object with id, sender, receiver, amount, timestamp, and signature"
      );
    }
    return new Transaction(
      tx.id,
      tx.sender,
      tx.receiver,
      tx.amount,
      tx.signature,
      tx.timestamp
    );
  });

  const blockHeader = new BlockHeader(noOfTransactions, prevHash, nounce);
  const blockData = new BlockData(transactions);
  const block = new Block(blockHeader, blockData);
  block.verify(); // Verify the block after creation
  console.log("Block created:", block);
  // block.makeMerkleTree();
  return block;
}
