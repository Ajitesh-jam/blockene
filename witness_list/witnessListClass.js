import { TxPoolClass } from "../tx_pool/txPoolClass.js";
import { signMsg, verifySignature } from "../blockchain/utils/crypto.js";
import { Key } from "../blockchain/utils/key.js";
import { Transaction } from "../blockchain/classes/transactions.js";
import { THRESHOLD_WITNESSES } from "../constants/const.js";
import { signatureClass } from "../blockchain/utils/signatureClass.js";

/// WitnessListOfTxPool class represents a list of transactions in the pool
/// along with the witnesses for each transaction.

// one approver citizen can approve the witness list

//witness list Id  represented as
// approverCitizen : txPool : witnessesOfEachTransactions
// // where approverCitizen is the public key of the citizen who approves the witness list
// // txPool is the transaction pool containing the transactions
// // witnessesOfEachTransactions is a map where the key is the transaction ID and the value
// // is an array of public keys of witnesses for that transaction
// it gives signature array which confirms
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

  getWitnessList() {
    // if (!this.approverCitizen) {
    //   throw new Error(
    //     "Approver's public key is required to get the witness list"
    //   );
    // }
    // if (this.signature === null) {
    //   throw new Error("Witness list has not been signed yet");
    // }

    const witnessesOfEachTransactionsObj = {};
    this.witnessesOfEachTransactions.forEach((witnesses, txId) => {
      witnessesOfEachTransactionsObj[txId] = witnesses;
    });

    // Convert the Map to a plain object for easier serialization
    return {
      approverCitizen: this.approverCitizen,
      txPool: this.txPool,
      witnessesOfEachTransactions: witnessesOfEachTransactionsObj,
      signature: this.signature,
    };
  }

  makeDataToSign() {
    // // Assuming we have a method to sign the witness list using the approver's public key
    // const txPoolData = this.txPool.getTransactions().map((tx) => tx.toString());
    // if (txPoolData.length === 0) {
    //   throw new Error("No transactions to sign in the witness list");
    // }
    // // Create a string representation of the transactions for signing
    // const transactionsString = txPoolData.join(",");
    // const witnessesString = Array.from(
    //   this.witnessesOfEachTransactions.entries()
    // )
    //   .map(([txId, witnesses]) => `${txId}:${witnesses.join(",")}`)
    //   .join(";");

    // return (
    //   this.approverCitizen + ":" + transactionsString + ":" + witnessesString
    // );
    const data = makeDataToSign(
      this.approverCitizen,
      this.txPool,
      this.witnessesOfEachTransactions
    );
    return data;
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
    this.signature = null;
    //add this to witness list with approver citizen as witness
    if (!(tx instanceof Transaction)) {
      tx = new Transaction(
        tx.id,
        tx.sender,
        tx.receiver,
        tx.amount,
        tx.signature,
        tx.timestamp
      );
    }
    return this.txPool.addATransaction(tx); //transaction instance + duplicate + verification check is done in txPool
  }

  addTransactions(_transactions) {
    //add unique verified transactions to the txPool
    this.signature = null;
    return this.txPool.addTransactions(_transactions); //transaction instance + duplicate + verification check is done in txPool
  }

  addAWitness(txId, witness) {
    // Add a witness to a specific transaction
    //witness is signatureClass instance
    //witness have
    // citizen: as witness of transaction (not whole witness list just a transaction)
    // and a sginature which signature of witness signing the transaction ID
    if (!txId || !witness) {
      throw new Error(
        "Transaction ID and witness are required to add a witness"
      );
    }
    // Check if witness is an instance of
    const signature = witness.signature; //signature of the witness
    const citizen = witness.citizen; //public key of the witness
    if (!(witness instanceof signatureClass)) {
      witness = new signatureClass(
        signature,
        citizen //public key of the witness
      );
    }
    //check if witness aggress the transaction ID
    if (!witness.verifySignature(txId)) {
      // throw new Error(
      //   "Witness signature does not match the transaction ID. Witness cannot be added."
      // );
      console.warn(
        "Witness signature is not valid for the transaction ID. Witness cannot be added:",
        witness
      );
      // Skip adding the witness if the signature does not match
      return false; // Witness not added due to signature mismatch
    }
    //witness is map
    if (!this.witnessesOfEachTransactions.has(txId)) {
      this.witnessesOfEachTransactions.set(txId, []);
    }
    const witnesses = this.witnessesOfEachTransactions.get(txId);
    if (witnesses.some((w) => w.equals(witness))) {
      //throw new Error("Witness already exists for this transaction");
      console.warn("Witness already exists for this transaction:", witness);
      // Skip adding the witness if it already exists
      return false;
    }
    witnesses.push(witness);
    this.witnessesOfEachTransactions.set(txId, witnesses);
    this.signature = null;
    return true; // Witness added successfully
  }

  addWitnesses(txId, _witnesses) {
    if (!Array.isArray(_witnesses)) {
      throw new Error("Witnesses must be an array");
    }
    for (const witness of _witnesses) {
      this.addAWitness(txId, witness);
    }
    this.signature = null;
  }

  getAllTransactions() {
    return this.txPool.getAllTransactions(); // Return the transactions in the pool
  }

  getTransactionsWithThresholdWitness() {
    // Return transactions that have at least THRESHOLD_WITNESSES witnesses
    const transactionsWithThresholdWitness = [];
    for (const [
      txId,
      witnesses,
    ] of this.witnessesOfEachTransactions.entries()) {
      console.log(
        `Transaction ID: ${txId}, Witnesses: ${
          witnesses.length
        } (${witnesses.join(", ")})`
      );
      if (witnesses.length >= THRESHOLD_WITNESSES) {
        const transaction = this.txPool.getTransactionById(txId);
        console.log(
          `Transaction ID: ${txId} has ${witnesses.length} witnesses, which meets the threshold of ${THRESHOLD_WITNESSES}.`
        );
        console.log("####Transaction:", transaction);
        if (transaction) {
          transactionsWithThresholdWitness.push(transaction);
        }
      }
    }
    return transactionsWithThresholdWitness;
  }
}

export function verifyWitnessListSendByApprover(
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
  // const txPoolData = txPool.getTransactions().map((tx) => tx.toString());
  // if (txPoolData.length === 0) {
  //   throw new Error("No transactions to verify in the witness list");
  // }
  // // Create a string representation of the transactions for verification
  // const transactionsString = txPoolData.join(",");
  // const witnessesString = Array.from(witnessesOfEachTransactions.entries())
  //   .map(([txId, witnesses]) => `${txId}:${witnesses.join(",")}`)
  //   .join(";");

  // const dataToVerify =
  //   approverCitizen + ":" + transactionsString + ":" + witnessesString;
  const dataToVerify = makeDataToSign(
    approverCitizen,
    txPool,
    witnessesOfEachTransactions
  );

  return verifySignature(approverCitizen, dataToVerify, signature);
}

export function addWitnessListToMyWitnessList(
  myWitnessList,
  approverCitizen,
  txPool,
  witnessesOfEachTransactions, //mapp of transactionId to array of witnesses
  signature
) {
  // console.log(
  //   "Adding witness list to my witness list",
  //   approverCitizen,
  //   txPool,
  //   witnessesOfEachTransactions,
  //   signature
  // );
  //add witness list to my witness list
  if (!myWitnessList || !(myWitnessList instanceof WitnessListOfTxPool)) {
    throw new Error("Witness list missing or invalid");
  }
  if (
    !approverCitizen ||
    !txPool ||
    !witnessesOfEachTransactions ||
    !signature
  ) {
    throw new Error("All parameters are required to add witness list");
  }
  const witnessMap = new Map();
  for (const [txId, witnesses] of Object.entries(witnessesOfEachTransactions)) {
    if (!Array.isArray(witnesses) || witnesses.length === 0) {
      throw new Error(
        `Witnesses for transaction ${txId} must be a non-empty array`
      );
    }
    witnessMap.set(txId, witnesses);
  }

  const txPoolData = new TxPoolClass();
  for (const txn of txPool.transactions) {
    const transaction = new Transaction(
      txn.id,
      txn.sender,
      txn.receiver,
      txn.amount,
      txn.signature,
      txn.timestamp
    );
    if (!transaction.verifyTransaction())
      throw Error("Transaction not  verified!");

    txPoolData.addATransaction(transaction);
    myWitnessList.addATransaction(transaction);
  }
  if (
    !verifyWitnessListSendByApprover(
      approverCitizen,
      txPoolData,
      witnessMap,
      signature
    )
  ) {
    throw new Error("Witness list verification failed");
  }

  for (const [txId, witnesses] of witnessMap.entries()) {
    //make sure witnesses is an array of signatureClass instances
    myWitnessList.addWitnesses(txId, witnesses); // add witnesses to the transaction in the witness list
  }
  myWitnessList.approverCitizen = approverCitizen; // Store the approver's public key
  myWitnessList.signature = signature; // Store the signature in the witness list
}

export function addWitnessesToMyWitnessList(
  myWitnessList,
  approverCitizen,
  txPool,
  witnessesOfEachTransactions,
  signature
) {
  if (!myWitnessList || !(myWitnessList instanceof WitnessListOfTxPool)) {
    throw new Error("Witness list missing or invalid");
  }
  if (
    !approverCitizen ||
    !txPool ||
    !witnessesOfEachTransactions ||
    !signature
  ) {
    throw new Error("All parameters are required to add witness list");
  }
  const witnessMap = new Map();
  for (const [txId, witnesses] of Object.entries(witnessesOfEachTransactions)) {
    if (!Array.isArray(witnesses) || witnesses.length === 0) {
      throw new Error(
        `Witnesses for transaction ${txId} must be a non-empty array`
      );
    }
    witnessMap.set(txId, witnesses);
  }

  const txPoolData = new TxPoolClass();
  for (const txn of txPool.transactions) {
    const transaction = new Transaction(
      txn.id,
      txn.sender,
      txn.receiver,
      txn.amount,
      txn.signature,
      txn.timestamp
    );
    if (!transaction.verifyTransaction())
      // verify each transaction
      throw Error("Transaction not  verified!");

    txPoolData.addATransaction(transaction);
    myWitnessList.addATransaction(transaction);
  }
  if (
    !verifyWitnessListSendByApprover(
      approverCitizen,
      txPoolData,
      witnessMap,
      signature
    )
  ) {
    throw new Error("Witness list verification failed");
  }

  //add approver citizen as a witness to each transaction in the txPool
  for (const [txId, witnesses] of witnessMap.entries()) {
    myWitnessList.addAWitness(txId, approverCitizen); // add approver citizen as a witness
  }
}

export function makeDataToSign(
  approverCitizen,
  txPool,
  witnessesOfEachTransactions
) {
  if (!approverCitizen || !txPool || !witnessesOfEachTransactions) {
    throw new Error("All parameters are required to create data to sign");
  }
  const txPoolData = txPool.transactions.map((tx) => tx.toString());
  if (txPoolData.length === 0) {
    throw new Error("No transactions to sign in the witness list");
  }
  // Create a string representation of the transactions for signing
  const transactionsString = txPoolData.join(",");
  const witnessesString = //make array of all citizen public key and signature of witnesses
    Array.from(witnessesOfEachTransactions.entries())
      .map(([txId, witnesses]) => {
        return `${txId}:${witnesses
          .map((w) => {
            return w.citizen + w.signature;
          })
          .join(",")}`;
      })
      .join(";");
  const data =
    approverCitizen + ":" + transactionsString + ":" + witnessesString;
  return data;
}
