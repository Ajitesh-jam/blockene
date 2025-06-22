import { BlockHeader } from "../classes/blockHeader.js";
import { BlockData } from "../classes/blockData.js";
import { Block } from "../classes/block.js";
import { Transaction } from "../classes/transactions.js";
import { hash, buildMerkleTree } from "../utils/crypto.js";
import { Key } from "../utils/key.js";

export function makeBlockDataFromTransactions(transactions) {
  if (!Array.isArray(transactions)) {
    throw new Error("Transactions must be an array");
  }
  if (transactions.length === 0) {
    throw new Error("Transactions array cannot be empty");
  }
  transactions.map((tx) => {
    let txn;
    if (!(tx instanceof Transaction)) {
      txn = new Transaction(
        tx.id,
        tx.from,
        tx.to,
        tx.amount,
        tx.signature,
        tx.timestamp
      );
    } else {
      txn = tx;
    }
    if (!(txn instanceof Transaction)) {
      throw new Error("Each transaction must be an instance of Transaction");
    }
    if (!txn.verfiyTransaction()) {
      throw new Error(
        "Transaction verification failed for transaction: " + txn.id
      );
    }
    return txn;
  });

  const blockData = new BlockData(transactions);
  if (!blockData.verifyTransactions()) {
    throw new Error("Block data verification failed");
  }
  return blockData;
}

export function makeBlockFromTransactions(prevHash, nounce, transactions) {
  if (!Array.isArray(transactions)) {
    throw new Error("Transactions must be an array");
  }
  if (transactions.length === 0) {
    throw new Error("Transactions array cannot be empty");
  }
  const noOfTransactions = transactions.length;

  const blockHeader = new BlockHeader(prevHash, noOfTransactions, nounce);
  const blockData = new makeBlockDataFromTransactions(transactions);
  const block = new Block(blockHeader, blockData);
  return block;
}
