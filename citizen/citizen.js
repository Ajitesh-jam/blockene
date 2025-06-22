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
  FIRST_BLOCK_HASH,
} from "../constants/const.js";
import { hash, signMsg } from "../blockchain/utils/crypto.js";

import {
  WitnessListOfTxPool,
  addWitnessListToMyWitnessList,
} from "../witness_list/witnessListClass.js";

import { Key } from "../blockchain/utils/key.js";

import { makeBlockFromTransactions } from "../blockchain/core/blockMethods.js";

const app = express();
app.use(bodyParser.json());

// Define the IP addresses and ports of the politician server
const politicianIpPorts = [
  "localhost:4000",
  "localhost:6000",
  "localhost:7001",
];
const PORT = process.env.PORT || 5500;

//ask for transactions from politicians and witness list from politicians
let blockchain = [];
let witnessList = [];
let prevHash = FIRST_BLOCK_HASH; // Initial hash for the first block
let nounce = 0; // Initial nounce for the first block

// Read and parse JSON file
const Initialdata = {
  approverCitizen: 5500,
  txPool: {
    transactions: [
      {
        id: "tx_1",
        sender: "ajit",
        receiver: "someone_else",
        amount: 1000,
        timestamp: "2025-06-21T21:28:30.065Z",
        signature:
          "9a704f39a59b118928d426d6381155487b850ad3a308b33399d7b5484706dca1",
      },
      {
        id: "tx_2",
        sender: "ajit",
        receiver: "someone_else",
        amount: 1000,
        timestamp: "2025-06-21T21:28:33.530Z",
        signature:
          "d5c4cc172bd78f9e6a551194a38de71b28aa87ef183c965afe661950f0de6704",
      },
    ],
  },
  witnessesOfEachTransactions: {
    '5525:{"id":"tx_1","sender":"aji","receiver":"someone","amount":100,"timestamp":"2025-06-21T14:58:50.721Z","signature":"61739f77d4e916defb420a9bdc8ec3cfbd10d45a596d3c7c1e3350dec08f5232"}:':
      [4701, 4702, 4703],
    '5520:{"id":"tx_1","sender":"aji","receiver":"someone","amount":100,"timestamp":"2025-06-21T14:58:50.721Z","signature":"61739f77d4e916defb420a9bdc8ec3cfbd10d45a596d3c7c1e3350dec08f5232"}:':
      [4703, 4704],
  },
  signature: "c3577ebaa99e7c7c944f0fd7e32caae7216c8a6f2df3dc579c142161ccc9c89e",
};

// Create witness list instance
let myWitnessList = new WitnessListOfTxPool(PORT);
// Add witness list data
addWitnessListToMyWitnessList(
  myWitnessList,
  Initialdata.approverCitizen,
  Initialdata.txPool,
  Initialdata.witnessesOfEachTransactions,
  Initialdata.signature
);

app.get("/getWitnessList", async (req, res) => {
  try {
    const responses = await Promise.all(
      politicianIpPorts.map((ipPort) =>
        axios.get(`http://${ipPort}/witnessList`)
      )
    );
    const witnessLists = responses.map((response) => response.data);
    // // Check if all witness lists are the same
    // if (new Set(witnessLists).size !== 1) {
    //   return res.status(500).send("Witness lists do not match");
    // }
    console.log("Witness lists fetched successfully:", witnessLists);
    witnessList = witnessLists[0];
    res.json(witnessList);
  } catch (error) {
    console.error("Error fetching witness list:", error);
    res.status(500).send("Error fetching witness list");
  }
});

app.post("/getAllTransactions", async (req, res) => {
  try {
    const responses = await Promise.all(
      politicianIpPorts.map((ipPort) =>
        axios.get(`http://${ipPort}/getAllTransactions`)
      )
    );
    const allTransactions = responses.flatMap((response) => response.data);
    res.json(allTransactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).send("Error fetching transactions");
  }
});

//endpoint for my tx_pool
app.get("/getMyTxPool", (req, res) => {
  if (myWitnessList) {
    res.json(myWitnessList.txPool.getAllTransactions());
  } else {
    res.status(404).send("Transaction pool not found");
  }
});

// Endpoint to get the blockchain
app.get("/getBlockchain", (req, res) => {
  if (blockchain.length > 0) {
    res.json(blockchain);
  } else {
    res.status(404).send("Blockchain not found");
  }
});
app.post("/addBlockToBlockchain", (req, res) => {
  try {
    // add all the transactions from the txPool to the block data
    if (myWitnessList.txPool.getNoOfTransactions() === 0) {
      return res
        .status(400)
        .send("No transactions in the pool to add to block");
    }
    const myNewBlock = makeBlockFromTransactions(
      prevHash,
      nounce,
      myWitnessList.txPool.getAllTransactions()
    );
    if (!myNewBlock) {
      return res.status(400).send("Failed to create a new block");
    }

    // Add the block to the blockchain
    blockchain.push(myNewBlock);
    console.log("Block added to blockchain:", myNewBlock);
    // Update the previous hash and nounce for the next block
    prevHash = hash(myNewBlock.toString());
    nounce += 1;
    res.status(201).send("Block added to blockchain successfully", myNewBlock);
  } catch (error) {
    console.error("Error adding block to blockchain:", error);
    res.status(500).send("Error adding block to blockchain");
  }
});

// Endpoint to get the witness list of the current server
app.get("/getMyWitnessList", (req, res) => {
  if (myWitnessList) {
    res.json(myWitnessList.getWitnessList());
  } else {
    res.status(404).send("Witness list not found");
  }
});

app.post("/createTransaction", (req, res) => {
  try {
    const { tx_id, senderPublicKey, senderPvtKey, receiver, amount } = req.body;
    if (!senderPublicKey || !senderPvtKey || !receiver || !amount) {
      return res.status(400).send("Invalid transaction data");
    }
    const txId =
      tx_id.toString() +
      ":" +
      senderPublicKey.toString() +
      ":" +
      receiver.toString() +
      ":" +
      amount;

    // Create a new transaction
    const transaction = new Transaction(
      tx_id, // Unique ID for the transaction
      senderPublicKey,
      receiver,
      amount,
      signMsg(senderPvtKey, txId) // Sign the transaction with the sender's private key
    );

    const status = myWitnessList.txPool.addATransaction(transaction);
    if (!status) {
      return res.status(400).send("Transaction already exists in the pool");
    }

    // Verify the transaction
    if (!transaction.verfiyTransaction()) {
      return res.status(400).send("Transaction verification failed");
    }
    res.status(201).send("Transaction created successfully");
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).send("Error creating transaction");
  }
});

app.post("/signWitnessList", (req, res) => {
  try {
    const { approverCitizen, pvtKey } = req.body;
    if (!approverCitizen || !pvtKey) {
      return res.status(400).send("Invalid witness list data");
    }
    const key = new Key(pvtKey, approverCitizen);
    // Sign the witness list
    myWitnessList.signWitnessList(key);
    res.status(200).send("Witness list signed successfully");
  } catch (error) {
    console.error("Error signing witness list:", error);
    res.status(500).send("Error signing witness list");
  }
});

app.post("/addWitnessToWitnessList", (req, res) => {
  try {
    const { txId, witness } = req.body;
    if (!txId || !witness) {
      return res.status(400).send("Invalid witness data");
    }
    console.log("Adding witness:", txId, "\n\nwitn: ", witness);
    // Add a witness to the witness list
    myWitnessList.addAWitness(txId, witness);
    res.status(200).send("Witness added successfully", myWitnessList);
  } catch (error) {
    console.error("Error adding witness:", error);
    res.status(500).send("Error adding witness");
  }
});

app.post("/addWitnessListToMyWitnessList", (req, res) => {
  try {
    const { witnessList } = req.body;

    // Add the received witness list to the local witness list
    addWitnessListToMyWitnessList(
      myWitnessList,
      witnessList.approverCitizen,
      witnessList.txPool,
      witnessList.witnessesOfEachTransactions,
      witnessList.signature
    );
    res.status(200).send("Witness list added successfully");
  } catch (error) {
    console.error("Error adding witness list:", error);
    res.status(400).send(error || "Error adding witness list");
  }
});

app.post("/shareMyWitnessListWithPolitician", (req, res) => {
  try {
    for (const ipPort of politicianIpPorts) {
      axios
        .post(`http://${ipPort}/addWitnessListToMyWitnessList`, {
          witnessList: myWitnessList.getWitnessList(),
        })
        .then((response) => {
          console.log(
            `Witness list shared with ${ipPort} successfully in response:`,
            response.data
          );
        })
        .catch((error) => {
          console.error(`Error sharing witness list with ${ipPort}:`, error);
        });
    }
  } catch (error) {
    console.error("Error sharing witness list with politician:", error);
    res.status(500).send("Error sharing witness list with politician");
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
