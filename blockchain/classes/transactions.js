import { hash } from "../utils/crypto.js";

export class Transaction {
  constructor(_id = null, _sender, _reciever, _amount, _timestamp, _signature) {
    this.id = _id;
    this.sender = _sender;
    this.receiver = _reciever;
    this.amount = _amount;
    this.timestamp = _timestamp;
    this.signature = _signature;
  }

  toString() {
    return JSON.stringify(this);
  }

  getSender() {
    return this.sender;
  }
  getReceiver() {
    return this.receiver;
  }
  getAmount() {
    return this.amount;
  }
  getTimestamp() {
    return this.timestamp;
  }
  getSignature() {
    return this.signature;
  }
  getId() {
    return this.id;
  }

  verfiyTransaction() {
    // Here we would implement the logic to verify the transaction signature
    // For now, we will just return true as a placeholder

    //encrypt sender + reciver + amount to generate signature
    const data = this.sender + this.receiver + this.amount;
    const hashstring = hash(data);
    if (hashstring !== this.signature) {
      console.error("Transaction signature verification failed");
      return false;
    }
    console.log("Transaction signature verified successfully");
    return true;
  }
}
