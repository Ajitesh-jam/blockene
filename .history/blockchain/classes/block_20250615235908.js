//make block of a blockchain --> merkle tree
// const { MerkleTree } = require("merkletreejs");
// const { keccak256 } = require("ethereum-cryptography/keccak");
// const { toBuffer } = require("ethereum-cryptography/utils");
// const { BlockHeader } = require("./blockHeader");
// const { Transaction } = require("./transaction");
// const { BlockBody } = require("./blockBody");
// const { Block } = require("./block");
// const { BlockHeaderSchema } = require("./blockHeaderSchema");
// const { BlockBodySchema } = require("./blockBodySchema");
import { MerkleTree } from "merkletreejs";
import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes } from "ethereum-cryptography/utils.js";


import { BlockHeader } from "./blockHeader.js";
import { BlockData } from "./blockData.js";

class Block {
  header; // BlockHeader instance
  data; // BlockData instance
  merkeltree; // Merkle tree of transactions
  hash;
  constructor(_header, _data) {
    if (!(_header instanceof BlockHeader)) {
      throw new Error("Block header must be an instance of BlockHeader");
    }
    this.header = _header;
    if (!(_data instanceof BlockData)) {
      throw new Error("Block data must be an instance of BlockData");
    }
    this.data = _data;
  }
  makeMerkleTree() {
    const leaves = this.data
      .getTransactions()
      .map((tx) => keccak256(toUtf8Bytes(tx.toString())));
    this.merkeltree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    this.hash = this.merkeltree.getRoot().toString("hex");
  }

  toString() {
    return JSON.stringify({
      header: this.header.toString(),
      data: this.data.toString(),
      hash: this.hash,
    });
  }
}
