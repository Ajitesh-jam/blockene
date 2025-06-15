export class BlockData {
  transactions;

  constructor(_transactions) {
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
