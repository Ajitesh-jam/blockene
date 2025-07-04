import { Transaction } from "../blockchain/classes/transactions.js";
import { verifyTransactionDoneByPubKey } from "../blockchain/utils/crypto.js";
export class TxPoolClass {
  // List of transactions in the pool
  transactions;

  //it is an array of people

  constructor() {
    this.transactions = [];
  }

  addATransaction(tx) {
    if (!(tx instanceof Transaction)) {
      throw new Error("Transaction must be an instance of Transaction");
    }
    if (
      this.transactions.find(
        (t) => t.getTransactionId() === tx.getTransactionId()
      )
    ) {
      //throw new Error("Transaction already exists in the pool");
      return false; // Skip if the transaction already exists in the pool
    }
    if (!tx.verifyTransaction()) {
      throw new Error("Transaction verification failed");
      return false; // Transaction verification failed
    }
    this.transactions.push(tx);
    return true; // Transaction added successfully
  }

  addTransactions(_transactions) {
    const success = true;
    if (!Array.isArray(_transactions)) {
      throw new Error("Transactions must be an array");
    }
    for (const tx of _transactions) {
      if (!(tx instanceof Transaction)) {
        throw new Error("Each transaction must be an instance of Transaction");
        return false; // Skip if the transaction is not an instance of Transaction
      }

      if (
        this.transactions.find(
          (t) => t.getTransactionId() === tx.getTransactionId()
        ) ||
        tx.verfiyTransaction()
      ) {
        continue; // Skip if the transaction already exists in the pool
      }
      const status = this.addATransaction(tx);
      success = success && status;
    }
    return true;
  }

  getAllTransactions() {
    return this.transactions;
  }
  getNoOfTransactions() {
    return this.transactions.length;
  }
  getTransactionById(_id) {
    return this.transactions.find(
      (transaction) => transaction.getTransactionId() === _id
    );
  }
  toString() {
    return JSON.stringify(this.transactions);
  }
}
