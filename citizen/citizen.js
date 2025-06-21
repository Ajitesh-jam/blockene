// //Make a ciitizrn node server which will call politicians server's to fetch data and propose new transactions.
// import express from "express";
// import bodyParser from "body-parser";
// import axios from "axios";
// import { Transaction } from "./classes/transactions.js";
// import { Blockchain } from "./core/blockchain.js";
// import {
//   NO_OF_TRANSACTIONS_IN_BLOCK,
//   CONSENSUS_POLITICIANS_THRESHOLD,
// } from "./constants/const.js";
// import { hash } from "./utils/crypto.js";
// import { Block } from "./classes/block.js";
// import { BlockHeader } from "./classes/blockHeader.js";

// const app = express();
// app.use(bodyParser.json());

// const politicianIpPorts = [
//   "10.104.181.54:4000",
//   "10.104.181.54:5000",
//   "10.104.181.54:6000",
//   "10.104.181.54:7000",
// ];

// //citizen should store some verified transactions in its own database (not blockchain) just a local array of transactions and make its create a new transactions api
// let verifiedTransactions = [];
// app.post("/createTransaction", (req, res) => {
//   const { sender, receiver, amount } = req.body;
//   if (!sender || !receiver || !amount) {
//     return res.status(400).send("Invalid transaction data");
//   }

//   // Create a new transaction
//   const transaction = new Transaction(
//     null,
//     sender,
//     receiver,
//     amount,
//     Date.now(),
//     hash(sender + receiver + amount)
//   );

//   // Verify the transaction
//   if (!transaction.verfiyTransaction()) {
//     return res.status(400).send("Transaction verification failed");
//   }

//   // Store the verified transaction
//   verifiedTransactions.push(transaction);
//   res.status(201).send("Transaction created successfully");
// });
// //create api to fetch all verified transactions
// app.get("/getVerifiedTransactions", (req, res) => {
//   res.json(verifiedTransactions);
// });

// app.get("/getLatestBlock", async (req, res) => {
//   //logic to fetch latest block from politician server from conseus ie fetch from threshold of politicans severs
//   try {
//     //try to fetch from different IP's of politician severs and chech if theey have same latest block
//     const blocks = await Promise.all(
//       politicianIpPorts.map((ipPort) =>
//         axios.get(`http://${ipPort}/latestBlock`)
//       )
//     );
//     const latestBlocks = blocks.map((response) => response.data);
//     const blockHashes = latestBlocks.map((block) => block.hash);

//     //check for block which is given by majority of the politicians
//     const blockCount = {};
//     for (const hash of blockHashes) {
//       blockCount[hash] = (blockCount[hash] || 0) + 1;
//     }
//     const majorityBlockHash = Object.keys(blockCount).find(
//       (hash) => blockCount[hash] >= CONSENSUS_POLITICIANS_THRESHOLD
//     );
//     if (!majorityBlockHash) {
//       return res.status(500).send("No consensus on latest block");
//     }
//   } catch (error) {
//     console.error("Error fetching latest block:", error);
//     res.status(500).send("Error fetching latest block");
//   }
// });
// app.get("/getBlockHashOnly", async (req, res) => {
//   try {
//     const block = await getLatestBlock();
//     res.json({ hash: block.hash });
//   } catch (error) {
//     res.status(500).send("Failed to fetch hash");
//   }
// });

// app.post("/clearVerifiedTransactions", (req, res) => {
//   verifiedTransactions = [];
//   res.send("Cleared local verified transactions");
// });

// async function getLatestBlockHash() {
//   try {
//     const blocks = await Promise.all(
//       politicianIpPorts.map((ipPort) =>
//         axios.get(`http://${ipPort}/latestBlock`)
//       )
//     );
//     const latestBlocks = blocks.map((response) => response.data);
//     const blockHashes = latestBlocks.map((block) => block.hash);

//     //check for block which is given by majority of the politicians
//     const blockCount = {};
//     for (const hash of blockHashes) {
//       blockCount[hash] = (blockCount[hash] || 0) + 1;
//     }
//     const majorityBlockHash = Object.keys(blockCount).find(
//       (hash) => blockCount[hash] >= CONSENSUS_POLITICIANS_THRESHOLD
//     );
//     return majorityBlockHash;
//   } catch (error) {
//     console.error("Error fetching latest block:", error);
//     throw new Error("Error fetching latest block");
//   }
// }

// app.get("/getLatestHash", async (req, res) => {
//   try {
//     const latestBlockHash = await getLatestBlockHash();
//     res.json({ latestBlockHash });
//   } catch (error) {
//     res.status(500).send("Error fetching latest block hash");
//   }
// });

// app.post("/proposeTransaction", async (req, res) => {
//   const transactions = req.body.transactions;
//   if (!Array.isArray(transactions) || transactions.length === 0) {
//     return res.status(400).send("Invalid transactions data");
//   }
//   //check at least NO_OF_TRANSACTIONS_IN_BLOCK transactions are present
//   if (transactions.length < NO_OF_TRANSACTIONS_IN_BLOCK) {
//     return res
//       .status(400)
//       .send(
//         `At least ${NO_OF_TRANSACTIONS_IN_BLOCK} transactions are required`
//       );
//   }
//   //call api to get latest block hash
//   const latestPrevHash = await getLatestBlockHash();
//   if (!latestPrevHash) {
//     return res.status(500).send("Error fetching latest block hash");
//   }
//   //create header for new block
//   const header = new BlockHeader(
//     transactions.length,
//     latestPrevHash,
//     Math.floor(Math.random() * 100000)
//   );
//   //create data for new block
//   const data = new BlockData(transactions);
//   //create new block
//   const block = new Block(header, data);

//   //call api to publish this to politicians servers
//   try {
//     const responses = await Promise.all(
//       politicianIpPorts.map((ipPort) =>
//         axios.post(`http://${ipPort}/addBlock`, block)
//       )
//     );
//     // Check if all responses are successful
//     if (responses.every((response) => response.status === 200)) {
//       res.status(201).send("Block proposed successfully");
//     } else {
//       res.status(500).send("Failed to propose block to politicians");
//     }
//   } catch (error) {
//     console.error("Error proposing block:", error);
//     res.status(500).send("Error proposing block to politicians");
//   }
// });

import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

import { Transaction } from "../blockchain/classes/transactions.js";
import { Block } from "../blockchain/classes/block.js";
import { BlockData } from "../blockchain/classes/blockData.js";
import { BlockHeader } from "../blockchain/classes/blockHeader.js";
import {
  NO_OF_TRANSACTIONS_IN_BLOCK,
  CONSENSUS_POLITICIANS_THRESHOLD,
} from "../constants/const.js";
import { hash, signMsg } from "../blockchain/utils/crypto.js";

const app = express();
app.use(bodyParser.json());

const politicianIpPorts = [
  "localhost:4000",
  "localhost:6000",
  "localhost:7001",
];

//ask for transactions from politicians and witness list from politicians
let blockchain = [];
let witnessList = [];

app.get("/getWitnessList", async (req, res) => {
  try {
    const responses = await Promise.all(
      politicianIpPorts.map((ipPort) =>
        axios.get(`http://${ipPort}/witnessList`)
      )
    );
    const witnessLists = responses.map((response) => response.data);
    // Check if all witness lists are the same
    if (new Set(witnessLists).size !== 1) {
      return res.status(500).send("Witness lists do not match");
    }
    witnessList = witnessLists[0];
    res.json(witnessList);
  } catch (error) {
    console.error("Error fetching witness list:", error);
    res.status(500).send("Error fetching witness list");
  }
});
app.post("/createTransaction", (req, res) => {
  const { senderPublicKey, senderPvtKey, receiver, amount } = req.body;
  if (!sender || !receiver || !amount) {
    return res.status(400).send("Invalid transaction data");
  }
  const txId = sender.toString() + ":" + receiver.toString() + ":" + amount;
  // Create a new transaction
  const transaction = new Transaction(
    null,
    senderPublicKey,
    receiver,
    amount,
    Date.now(),
    signMsg(senderPvtKey, txId)
  );

  // Verify the transaction
  if (!transaction.verfiyTransaction()) {
    return res.status(400).send("Transaction verification failed");
  }

  // Store the verified transaction
  blockchain.push(transaction);
  res.status(201).send("Transaction created successfully");
});
