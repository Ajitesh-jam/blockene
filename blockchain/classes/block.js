import { BlockHeader } from "./blockHeader.js";
import { BlockData } from "./blockData.js";

import { hash, buildMerkleTree } from "../utils/crypto.js";

export class Block {
  constructor(_header, _data) {
    if (!(_header instanceof BlockHeader)) {
      throw new Error("Block header must be an instance of BlockHeader");
    }
    if (!(_data instanceof BlockData)) {
      throw new Error("Block data must be an instance of BlockData");
    }
    this.header = _header;
    this.data = _data;
    this.makeMerkleTree();
  }

  makeMerkleTree() {
    const transactions = this.data.getTransactions();
    const leaves = transactions.map((tx) => hash(tx.toString()));
    this.hash = buildMerkleTree(leaves);
  }

  toString() {
    return JSON.stringify({
      header: this.header.toString(),
      data: this.data.toString(),
      hash: this.hash,
    });
  }
}
