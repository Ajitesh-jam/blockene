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
  addWitnessesToMyWitnessList,
} from "../witness_list/witnessListClass.js";

import { Key } from "../blockchain/utils/key.js";

import { makeBlockFromTransactions } from "../blockchain/core/blockMethods.js";
import { VRFGenerate } from "../blockchain/utils/crypto.js";

const app = express();
app.use(bodyParser.json());

// Define the IP addresses and ports of the politician server
const politicianIpPorts = [
  "localhost:4500",
  // "localhost:6000",
  // "localhost:7001",
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
        id: "confirmed_tx_1",
        sender: "ajit",
        receiver: "someone",
        amount: 200,
        timestamp: "2025-07-05T22:18:29.792Z",
        signature:
          "67a93968e168cf3d33f7cdee6196cc43ea3b326c2b7e96c2fb7385edbcf0cb00",
      },
      {
        id: "confirmed_tx_2",
        sender: "ajit",
        receiver: "someone_else",
        amount: 100,
        timestamp: "2025-07-05T22:18:43.418Z",
        signature:
          "3bda6904e3e729d279aaae7872a13c647bd020d8d8b4bda85aba6452f1349ace",
      },
      {
        id: "NOT_confirmed_tx_2",
        sender: "ajit",
        receiver: "someone",
        amount: 100,
        timestamp: "2025-07-05T22:19:10.039Z",
        signature:
          "3a24ddefa48ab2557a6482be3509737d32820943ee30c072a53625ae21e262d5",
      },
    ],
  },
  witnessesOfEachTransactions: {
    "confirmed_tx_1:ajit:someone:200": [
      {
        signature:
          "ded16b0b767325a7ba270e09ef005c4b2563cb697450c95c80b1421452dea348",
        citizen: 5507,
      },
      {
        signature:
          "9009207e265cca00bab5c2eafa95921a1af001ab2a0f3ec4006802264bbedfe0",
        citizen: 5500,
      },
      {
        signature:
          "8610100ccd296a565c278c568ee788f4c0ce337bbadd910471ef80f09cd9fa27",
        citizen: 5501,
      },
      {
        signature:
          "553aa19b6cedd16433464635dcde930d0654d20cc07b3c120a56059aadfa3d35",
        citizen: 5504,
      },
    ],
    "confirmed_tx_2:ajit:someone_else:100": [
      {
        signature:
          "88ed9d4b590dcc0f6272933a25ee90724fa9a44b9464331fd71d2d45c5fc3f39",
        citizen: 5504,
      },
      {
        signature:
          "7a02a2ae8fdce31d057bbf35782531d58140be3a6c8dc92058d2c7dd5f7892cb",
        citizen: 5505,
      },
      {
        signature:
          "3fe6cd8ac8b23268b71fd4af0a52c3c13d821a6ab53242ef782ca565918790ab",
        citizen: 5500,
      },
    ],
    "NOT_confirmed_tx_2:ajit:someone:100": [
      {
        signature:
          "5663f239b4eab45b239bbb01c96acd209369b13a28d1a792391ac30825e514c1",
        citizen: 5500,
      },
    ],
  },
  signature: "dc92f1bb0dd02808bfc87140f6f8ffe0867f91d6e808c39b4e4249ca7f5022e0",
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
myWitnessList.approverCitizen = PORT; // Set the approver citizen to the current port
myWitnessList.signature = null;

// function proposeMsgToPolitician(){} TODO

//transactions
app.post("/createTransaction", (req, res) => {
  try {
    const { tx_id, senderPvtKey, receiver, amount } = req.body;
    if (!senderPvtKey || !receiver || !amount) {
      return res.status(400).send("Invalid transaction data");
    }
    const keypair = new Key(senderPvtKey, senderPvtKey);
    const senderPublicKey = keypair.getPubKey();
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
    if (!transaction.verifyTransaction()) {
      return res.status(400).send("Transaction verification failed");
    }
    res.status(201).send("Transaction created successfully");
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).send("Error creating transaction");
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

// My witness List endpoints
app.get("/getMyWitnessList", (req, res) => {
  if (myWitnessList) {
    res.json(myWitnessList.getWitnessList());
  } else {
    res.status(404).send("Witness list not found");
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

app.get("/getWitnessListFromPolitician", async (req, res) => {
  try {
    const responses = await Promise.all(
      politicianIpPorts.map((ipPort) =>
        axios.get(`http://${ipPort}/api/getAllWitnessList`)
      )
    );
    const witnessLists = responses.map((response) => response.data);
    // // Check if all witness lists are the same
    // if (new Set(witnessLists).size !== 1) {
    //   return res.status(500).send("Witness lists do not match");
    // }
    witnessList = witnessLists[0];
    res.json(witnessList);
  } catch (error) {
    console.error("Error fetching witness list:", error);
    res.status(500).send("Error fetching witness list");
  }
});

app.post("/signWitnessList", (req, res) => {
  try {
    const { pvtKey } = req.body;
    const key = new Key(pvtKey, pvtKey);
    // Sign the witness list
    myWitnessList.signWitnessList(key);
    res.status(200).send("Witness list signed successfully");
  } catch (error) {
    console.error("Error signing witness list:", error);
    res.status(500).send("Error signing witness list :", error);
  }
});

app.post("/addWitnessToWitnessList", (req, res) => {
  try {
    const {
      tx_id,
      tx_sender,
      tx_receiver,
      tx_amount,
      tx_signature,
      tx_timestamp,
      witness_pvtKey,
    } = req.body;
    if (
      !tx_id ||
      !tx_sender ||
      !tx_receiver ||
      !tx_amount ||
      !tx_signature ||
      !witness_pvtKey
    ) {
      return res.status(400).send("Invalid witness data");
    }
    // Create a new transaction instance
    const transaction = new Transaction(
      tx_id,
      tx_sender,
      tx_receiver,
      tx_amount,
      tx_signature,
      tx_timestamp
    );
    transaction.verifyTransaction(); // Verify the transaction
    const transactionID = transaction.getTransactionId(); // Get the transaction ID

    const keypair = new Key(witness_pvtKey, witness_pvtKey);

    const status = myWitnessList.addAWitness(transactionID, {
      signature: signMsg(witness_pvtKey, transactionID),
      citizen: keypair.getPubKey(),
    });
    if (!status) {
      return res
        .status(400)
        .send("Witness already exists for this transaction");
    }
    res.status(200).send("Witness added successfully", myWitnessList);
  } catch (error) {
    console.error("Error adding witness:", error);
    res.status(500).send("Error adding witness ; ", error);
  }
});

app.post("/addWitnessesFromOtherWitnessListToMyWitnessList", (req, res) => {
  try {
    const { approverCitizen, txPool, witnessesOfEachTransactions, signature } =
      req.body;
    if (
      !approverCitizen ||
      !txPool ||
      !witnessesOfEachTransactions || //should a signature class object
      !signature
    ) {
      return res.status(400).send("Invalid witness list data");
    }
    // Add the witness list to my witness list
    addWitnessesToMyWitnessList(
      myWitnessList,
      approverCitizen,
      txPool,
      witnessesOfEachTransactions, //signature class instanaces
      signature
    );
    res.status(200).send("Witness list added successfully");
  } catch (error) {
    console.error("Error adding witness list:", error);
    res.status(500).send("Error adding witness list");
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

app.post("/shareMyWitnessListWithPolitician", async (req, res) => {
  try {
    const sharePromises = politicianIpPorts.map(async (ipPort) => {
      try {
        const witnessList = myWitnessList.witnessesOfEachTransactions;
        let witnessMap = new Map();
        if (witnessList instanceof Map) {
          // Handle if it's a Map
          witnessMap = new Map(
            Array.from(witnessList.entries()).map(([txId, witnesses]) => [
              txId,
              witnesses,
            ])
          );
        } else {
          // Handle if it's an Object
          witnessMap = new Map(
            Object.entries(witnessList).map(([txId, witnesses]) => [
              txId,
              witnesses,
            ])
          );
        }
        // Get transaction data
        const txPool = {
          transactions: myWitnessList.txPool.getAllTransactions(),
        };

        // Format data without double-stringifying
        const formattedWitnessList = {
          approverCitizen: myWitnessList.approverCitizen,
          txPool: txPool,
          witnessesOfEachTransactions: Object.fromEntries(witnessMap), // Convert Map to Object for JSON serialization
          signature: myWitnessList.signature,
        };
        console.log(
          `Sharing witness list with ${ipPort} with data:`,
          formattedWitnessList
        );
        const response = await axios.post(
          `http://${ipPort}/api/addWitnessListToPool`,
          {
            witnessList: formattedWitnessList,
          }
        );

        console.log(
          `Witness list shared with ${ipPort} successfully in response:`,
          response.data
        );
        return { success: true, ipPort };
      } catch (error) {
        console.error(
          `Error sharing witness list with ${ipPort}:`,
          error.response?.data || error.message
        );
        return { success: false, ipPort, error: error.message };
      }
    });

    // Wait for all sharing operations to complete
    const results = await Promise.allSettled(sharePromises);

    // Check if at least one succeeded
    const anySuccess = results.some(
      (result) => result.status === "fulfilled" && result.value.success
    );

    if (anySuccess) {
      res.status(200).send("Witness list shared with politicians successfully");
    } else {
      res.status(500).send("Failed to share witness list with any politician");
    }
  } catch (error) {
    console.error("Error sharing witness list with politicians:", error);
    res.status(500).send("Error sharing witness list with politicians");
  }
});

// Endpoint to get the blockchain
app.get("/getLatestHashFromPolitician", async (req, res) => {
  try {
    // Send the block proposal to all politicians
    const responses = await Promise.all(
      politicianIpPorts.map((ipPort) =>
        axios.get(`http://${ipPort}/api/blocks/latest/hash`)
      )
    );
    const latestHashes = responses.map((response) => response.data.hash);
    prevHash = latestHashes[0]; // ------------------------------------------------------------>
    res.json(latestHashes);
  } catch (error) {
    console.error("Error fetching latest hash from politicians:", error);
    res.status(500).send("Error fetching latest hash from politicians", error);
  }
});

app.get("/getBlockchain", (req, res) => {
  if (blockchain.length > 0) {
    res.json(blockchain);
  } else {
    res.status(404).send("Blockchain not found");
  }
});

app.get("/getLastBlockFromPolitician", async (req, res) => {
  try {
    // Send the block proposal to all politicians
    const responses = await Promise.all(
      politicianIpPorts.map((ipPort) =>
        axios.get(`http://${ipPort}/api/blocks/latest`)
      )
    );
    const lastBlocks = responses.map((response) => response.data);
    if (lastBlocks.length === 0) {
      return res.status(404).send("No blocks found from politicians");
    }
    // Assuming the last block is the most recent one
    const block = lastBlocks[0];
    if (!block) {
      return res.status(404).send("No last block found");
    }
    //check if the block is already in the blockchain
    if (blockchain.length > 0) {
      const lastBlock = blockchain[blockchain.length - 1];
      if (lastBlock.hash === block.hash) {
        return res.status(200).send(blockchain);
      }
    }
    blockchain.push(block); // Add the last block to the local blockchain
    prevHash = block.hash; // Update the previous hash
    res.json(blockchain);
  } catch (error) {
    console.error("Error fetching last block from politicians:", error);
    res.status(500).send("Error fetching last block from politicians");
  }
});

app.post("/addBlockToBlockchain", (req, res) => {
  try {
    const transactionsWithThresholdWitness =
      myWitnessList.getTransactionsWithThresholdWitness();
    if (transactionsWithThresholdWitness.length === 0) {
      return res.status(400).send("No transactions with sufficient witnesses");
    }

    const myNewBlock = makeBlockFromTransactions(
      prevHash,
      nounce,
      transactionsWithThresholdWitness
    );
    if (!myNewBlock) {
      return res.status(400).send("Failed to create a new block");
    }

    // Add the block to the blockchain
    blockchain.push(myNewBlock);
    // Update the previous hash and nounce for the next block
    prevHash = hash(myNewBlock.toString());
    nounce += 1;
    res.status(201).send("Block added to blockchain successfully", myNewBlock);
  } catch (error) {
    console.error("Error adding block to blockchain:", error);
    res.status(500).send("Error adding block to blockchain");
  }
});

//proppose Block to politicians
app.post("/proposeBlockToPoliticians", async (req, res) => {
  try {
    const { pvtKey } = req.body;
    const block = blockchain[blockchain.length - 1]; // Get the last block from the blockchain
    if (!block) {
      return res.status(400).send("No block available to propose");
    }
    const keypair = new Key(pvtKey, pvtKey);
    const VRF = VRFGenerate(keypair.pvtKey, block.getBlock());
    const VRFValue = VRF.value;
    const VRFProof = VRF.proof;
    const signature = signMsg(keypair.pvtKey, block.getBlock());
    const approverCitizen = keypair.pubKey;
    // Send the block proposal to all politicians
    for (const ipPort of politicianIpPorts) {
      try {
        const response = await axios.post(
          `http://${ipPort}/api/addNewProposal`,
          {
            VRFValue,
            VRFProof,
            approverCitizen,
            block: block,
            signature,
          }
        );
        console.log(
          `Block proposal sent to ${ipPort} successfully:`,
          response.data
        );
      } catch (error) {
        console.error(
          `Error proposing block to ${ipPort}:`,
          error.response?.data || error.message
        );
        res
          .status(500)
          .send(`Error proposing block to ${ipPort}: ${error.message}`);
        return; // Exit if any proposal fails
      }
    }
    res.status(200).send("Block proposed to politicians successfully");
  } catch (error) {
    console.error("Error proposing block to politicians:", error);
    res.status(500).send("Error proposing block to politicians");
  }
});

app.get("/getProposalsFromPolitician", async (req, res) => {
  try {
    const responses = await Promise.all(
      politicianIpPorts.map((ipPort) =>
        axios.get(`http://${ipPort}/getNewBlockProposals`)
      )
    );
    const allProposals = responses.flatMap((response) => response.data);
    if (allProposals.length === 0) {
      return res.status(404).send("No proposals found");
    }
    res.json("All the proposals: ", allProposals);
  } catch (error) {
    console.error("Error fetching proposals:", error);
    res.status(500).send("Error fetching proposals");
  }
});

app.post("/signBlockProposal", async (req, res) => {
  try {
    const { pvtKey, block } = req.body;
    const keypair = new Key(pvtKey, pvtKey);
    const approverCitizen = keypair.getPubKey();
    if (!pvtKey || !approverCitizen || !block) {
      return res.status(400).send("Invalid proposal data");
    }

    const blockIns = makeBlockFromTransactions(
      block.header.prevHash,
      block.header.nounce,
      block.data.transactions
    );
    const signature = signMsg(keypair.pvtKey, blockIns.getBlock());

    // Send the signed proposal to all politicians
    for (const ipPort of politicianIpPorts) {
      try {
        const response = await axios.post(
          `http://${ipPort}/api/addSignatureToProposal`,
          {
            signature,
            block: blockIns,
            approverCitizen,
          }
        );
        // console.log(
        //   `Block proposal signed and sent to ${ipPort} successfully:`,
        //   response.data
        // );
      } catch (error) {
        console.error(
          `Error signing and proposing block to ${ipPort}:`,
          error.response?.data || error.message
        );
        res
          .status(500)
          .send(
            `Error signing and proposing block to ${ipPort}: ${error.message}`
          );
      }
    }
    res.status(200).send("Block proposal signed and sent successfully");
  } catch (error) {
    console.error("Error signing block proposal:", error);
    res.status(500).send("Error signing block proposal");
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
