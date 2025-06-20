// models/Block.js

//import { Block } from "../classes/block.js"; //iske hisab se bana lena

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
