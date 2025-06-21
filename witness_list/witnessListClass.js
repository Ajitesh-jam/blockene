import { Transaction } from "../blockchain/classes/transactions";
import { TxPoolClass } from "../tx_pool/txPoolClass";
import { signMsg, verifySignature } from "../blockchain/utils/crypto";
import { Key } from "../blockchain/utils/key";

/// WitnessListOfTxPool class represents a list of transactions in the pool
/// along with the witnesses for each transaction.

// one approver citizen can approve the witness list

//witness list Id  represented as
// approverCitizen : txPool : witnessesOfEachTransactions
// // where approverCitizen is the public key of the citizen who approves the witness list
// // txPool is the transaction pool containing the transactions
// // witnessesOfEachTransactions is a map where the key is the transaction ID and the value
// // is an array of public keys of witnesses for that transaction
// it gives signature which confirms
//  (approverCitizen + txpool + witnessesOfEachTransactions)
// signed by approverCitizen

export class WitnessListOfTxPool {
  // List of transactions in the pool
  approverCitizen;

  txPool;
  witnessesOfEachTransactions; //maping to no of witnesses for each transaction
  //it is an array of public keys of witnesses

  signature;

  constructor(publicKey) {
    if (!publicKey) {
      throw new Error(
        "Public key is required to initialize WitnessListOfTxPool"
      );
    }
    this.approverCitizen = publicKey; // Initialize the approver's public key
    this.signature = null; // Initialize the signature to null
    this.txPool = new TxPoolClass(); // Initialize the transaction pool
    this.witnessesOfEachTransactions = new Map(); // Initialize the map to track witnesses for each transaction
  }

  makeDataToSign() {
    // Assuming we have a method to sign the witness list using the approver's public key
    const txPoolData = this.txPool.getTransactions().map((tx) => tx.toString());
    if (txPoolData.length === 0) {
      throw new Error("No transactions to sign in the witness list");
    }
    // Create a string representation of the transactions for signing
    const transactionsString = txPoolData.join(",");
    const witnessesString = Array.from(
      this.witnessesOfEachTransactions.entries()
    )
      .map(([txId, witnesses]) => `${txId}:${witnesses.join(",")}`)
      .join(";");

    return (
      this.approverCitizen + ":" + transactionsString + ":" + witnessesString
    );
  }

  signWitnessList(_key) {
    if (!(_key instanceof Key)) {
      throw new Error("Key must be an instance of Key");
    }

    if (!this.approverCitizen) {
      throw new Error(
        "Approver's public key is required to sign the witness list"
      );
    }
    if (this.approverCitizen !== _key.getPubKey()) {
      throw new Error("Provided key does not match the approver's public key");
    }
    const dataToSign = this.makeDataToSign();

    // this.signature = signMsg(_key.getPvtKey(), dataToSign);
    this.signature = signMsg(this.approverCitizen, dataToSign);
  }

  addATransaction(tx) {
    this.txPool.addATransaction(tx); //transaction instance + duplicate + verification check is done in txPool
  }
  addTransactions(_transactions) {
    //add unique verified transactions to the txPool
    this.txPool.addTransactions(_transactions); //transaction instance + duplicate + verification check is done in txPool
  }
  addAWitness(txId, witness) {
    if (!this.witnessesOfEachTransactions.has(txId)) {
      this.witnessesOfEachTransactions.set(txId, []);
    }
    const witnesses = this.witnessesOfEachTransactions.get(txId);
    if (witnesses.includes(witness)) {
      throw new Error("Verifier already exists for this transaction");
    }
    const previousWitnesses = witnesses.get(txId) || [];
    previousWitnesses.push(witness);
    witnesses.set(txId, previousWitnesses);
  }
  addWitnesses(txId, _witnesses) {
    if (!Array.isArray(_witnesses)) {
      throw new Error("Witnesses must be an array");
    }
    if (!this.witnessesOfEachTransactions.has(txId)) {
      this.witnessesOfEachTransactions.set(txId, []);
    }
    const witnesses = this.witnessesOfEachTransactions.get(txId);
    for (const witness of _witnesses) {
      if (witnesses.includes(witness)) {
        //throw new Error("Witness already exists for this transaction");
        continue; // Skip if the witness already exists
      }
      witnesses.push(witness);
    }
  }
}

export function verifyWitnessList(
  approverCitizen,
  txPool,
  witnessesOfEachTransactions,
  signature
) {
  if (
    !approverCitizen ||
    !txPool ||
    !witnessesOfEachTransactions ||
    !signature
  ) {
    throw new Error("All parameters are required for verification");
  }
  const txPoolData = txPool.getTransactions().map((tx) => tx.toString());
  if (txPoolData.length === 0) {
    throw new Error("No transactions to verify in the witness list");
  }
  // Create a string representation of the transactions for verification
  const transactionsString = txPoolData.join(",");
  const witnessesString = Array.from(witnessesOfEachTransactions.entries())
    .map(([txId, witnesses]) => `${txId}:${witnesses.join(",")}`)
    .join(";");

  const dataToVerify =
    approverCitizen + ":" + transactionsString + ":" + witnessesString;

  return verifySignature(approverCitizen, dataToVerify, signature);
}

export function addWitnessListToMyWitnessList(
  witnessList,
  approverCitizen,
  txPool,
  witnessesOfEachTransactions, //mapp of transactionId to array of witnesses
  signature
) {
  //add witness list to my witness list
  if (!witnessList) {
    throw new Error("Witness list is required to add to my witness list");
  }
  if (
    !approverCitizen ||
    !txPool ||
    !witnessesOfEachTransactions ||
    !signature
  ) {
    throw new Error("All parameters are required to add witness list");
  }
  if (
    !verifyWitnessList(
      approverCitizen,
      txPool,
      witnessesOfEachTransactions,
      signature
    )
  ) {
    throw new Error("Witness list verification failed");
  }

  //add transactions to the witness list
  witnessList.addTransactions(txPool.getTransactions());
  //add witnesses to the witness list
  for (const [txId, witnesses] of witnessesOfEachTransactions.entries()) {
    witnessList.addWitnesses(txId, witnesses);
  }
}
