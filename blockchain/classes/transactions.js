import {
  hash,
  signMsg,
  verifyTransactionDoneByPubKey,
} from "../utils/crypto.js";
import { Key } from "../utils/key.js";

//object like
// {
//   id: "transaction_id",// unique identifier for the transaction for a sender (no need for any global unique id, just unique to a sender also works)
//   sender: "sender_public_key", // public key of the sender
//   receiver: "receiver_public_key", // public key of the receiver
//   amount: 100, // amount to be transferred
//   timestamp: "2023-10-01T12:00:00Z", // timestamp of the transaction
//   signature: "transaction_signature", // signature of the transaction
// }
//constructor
//( unique id, Key instance (public key of sender , private key of sender), reciever , amount  )

//globally a transaction is recognized as id:sender:receiver:amount

//add transaction like
// keyPair = new Key(privateKey, publicKey);
// const transaction = new Transaction("tx1", keyPair.getPubKey(), "receiver_public_key", 100,signMsg(keyPair.getPvtKey(), "tx1:sender_public_key:receiver_public_key:100"));

export class Transaction {
  constructor(_id, _sender, _reciever, _amount, _signature) {
    if (!_id || !_sender || !_reciever || !_amount) {
      throw new Error("Transaction requires id, sender, receiver, and amount.");
    }
    if (typeof _amount !== "number" || _amount <= 0) {
      throw new Error("Amount must be a positive number.");
    }
    this.id = _id;
    this.sender = _sender; // public key of the sender
    this.receiver = _reciever;
    this.amount = _amount;
    this.timestamp = new Date().toISOString();
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
    const transaction_id = this.getTransactionId();
    return verifyTransactionDoneByPubKey(
      this.sender,
      transaction_id,
      this.signature
    );
  }

  getTransactionId() {
    return (
      this.id.toString() +
      ":" +
      this.sender.toString() +
      ":" +
      this.receiver.toString() +
      ":" +
      this.amount.toString()
    );
  }
}
