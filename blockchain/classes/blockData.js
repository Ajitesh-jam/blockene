import { Transaction } from "./transactions.js";

export class BlockData {
  transactions;

  constructor(_transactions) {
    if (!Array.isArray(_transactions)) {
      throw new Error("Transactions must be an array");
    }
    if (_transactions.length === 0) {
      throw new Error("Transactions array cannot be empty");
    }
    for (const transaction of _transactions) {
      if (!(transaction instanceof Transaction)) {
        throw new Error("Each transaction must be an instance of Transaction");
      }
    }
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
      if (!transaction.verfiyTransaction()) {
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
  addTransaction(_transaction) {
    this.transactions.push(_transaction);
  }
}
