import { Transaction } from "./transactions.js";

export class BlockData {
  transactions;

  constructor(_transactions) {
    if (!Array.isArray(_transactions)) {
      throw new Error("Transactions must be an array");
    }
    if (_transactions.length === 0) {
      this.transactions = [];
      return; // Allow empty transactions array
    }
    //make transactions instances of Transaction class if they are not already
    this.transactions = _transactions.map((tx) => {
      if (!(tx instanceof Transaction)) {
        return new Transaction(
          tx.id,
          tx.sender,
          tx.receiver,
          tx.amount,
          tx.signature,
          tx.timestamp
        );
      }
      return tx;
    });
    this.transactions = _transactions;
  }
  toString() {
    return JSON.stringify(this);
  }

  getTransactions() {
    return this.transactions;
  }
  getNoOfTransactions() {
    return this.transactions.length;
  }

  getTransactionById(_id) {
    return this.transactions.find((transaction) => transaction.id === _id);
  }
  verifyTransactions() {
    for (const transaction of this.transactions) {
      if (!transaction.verifyTransaction()) {
        console.error(
          "Transaction verification failed for transaction:",
          transaction.id
        );
        return false;
      }
    }
    console.log("All transactions verified successfully");
    return true;
  }
  addATransaction(transaction) {
    if (!(transaction instanceof Transaction)) {
      throw new Error("Transaction must be an instance of Transaction");
    }
    if (this.transactions.find((t) => t.id === transaction.id)) {
      console.warn("Transaction already exists in the block data");
      return; // Skip if the transaction already exists
    }
    this.transactions.push(transaction);
  }
  addTransactions(_transaction) {
    if (!Array.isArray(_transaction)) {
      throw new Error("Transactions must be an array");
    }
    for (const transaction of _transaction) {
      this.addATransaction(transaction); // Add each transaction individually
    }
  }
}
