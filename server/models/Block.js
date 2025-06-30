// models/Block.js

import { Block } from "../classes/block.js"; //iske hisab se bana lena

export class Block {
  constructor(index, timestamp, data, previousHash, hash) {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = hash;
  }
}

//yeh esa nhi hai

//check blockchain wala block

// block:
//   header {
//         noOfTransactions;
//   prevHash;
//   nounce;
//   }
//   data{
//     transactions: [
//     id
//     sender
//     receiver
//     amount
//     timestamp
//     signature
//     ],
//     hash

//   }

//block ke sath ek witness list bhi hogi
// witnessList: [
//   {
//     approverCitizen: "publicKey",
//     txPool: [
//       {
//         id: "tx1",
//         sender: "senderPublicKey",
//         receiver: "receiverPublicKey",
//         amount: 100,
//         timestamp: "2023-10-01T12:00:00Z",
//         signature: "transactionSignature"
//       },
//       // more transactions
//     ],
//     witnessesOfEachTransactions: {
//       "tx1": ["witness1PublicKey", "witness2PublicKey"],
//       // more transactions with their witnesses
//     },
//     signature: "signatureOfWitnessList"
//   },

//ussey bi store karney ka bana lena jaise block ka banya hai
//check witness list wala folder usme class likhi hai
