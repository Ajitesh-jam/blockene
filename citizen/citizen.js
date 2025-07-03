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
myWitnessList.approverCitizen = Number(PORT); // Set the approver citizen to the current port
myWitnessList.signature = null;

// function proposeMsgToPolitician(){}

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

// Endpoint to get the witness list of the current server
app.get("/getMyWitnessList", (req, res) => {
  if (myWitnessList) {
    res.json(myWitnessList.getWitnessList());
  } else {
    res.status(404).send("Witness list not found");
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

    // Add the witness to the witness list
    const status = myWitnessList.addAWitness(txId, witness);
    if (!status) {
      return res
        .status(400)
        .send("Witness already exists for this transaction");
    }

    res.status(200).send("Witness added successfully", myWitnessList);
  } catch (error) {
    console.error("Error adding witness:", error);
    res.status(500).send("Error adding witness");
  }
});

app.post("/addWitnessesFromOtherWitnessListToMyWitnessList", (req, res) => {
  try {
    const { approverCitizen, txPool, witnessesOfEachTransactions, signature } =
      req.body;
    if (
      !approverCitizen ||
      !txPool ||
      !witnessesOfEachTransactions ||
      !signature
    ) {
      return res.status(400).send("Invalid witness list data");
    }
    console.log(
      "Adding witness list:",
      approverCitizen,
      txPool,
      witnessesOfEachTransactions,
      signature
    );
    // Add the witness list to my witness list
    addWitnessesToMyWitnessList(
      myWitnessList,
      approverCitizen,
      txPool,
      witnessesOfEachTransactions,
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
        // Get the witness list data - handle Map or Object appropriately
        const witnessList = myWitnessList.witnessesOfEachTransactions;
        console.log(`Sharing witness list with ${ipPort}:`, witnessList);

        // Format witness data properly depending on its type
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

        // Send data - let axios handle the JSON conversion
        const response = await axios.post(
          `http://${ipPort}/addWitnessListToPool`,
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

app.post("/createTransaction", (req, res) => {
  try {
    const { tx_id, senderPvtKey, receiver, amount } = req.body;
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

    const keypair = new Key(senderPvtKey, senderPvtKey);
    const senderPublicKey = keypair.getPubKey();

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
    console.log("Responses from politicians:", responses);
    const lastBlocks = responses.map((response) => response.data);
    if (lastBlocks.length === 0) {
      return res.status(404).send("No blocks found from politicians");
    }
    console.log("Last blocks fetched successfully:", lastBlocks);
    // Assuming the last block is the most recent one
    const block = lastBlocks[0];
    if (!block) {
      return res.status(404).send("No last block found");
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
    // add all the transactions from the txPool to the block data
    if (myWitnessList.txPool.getNoOfTransactions() === 0) {
      return res
        .status(400)
        .send("No transactions in the pool to add to block");
    }
    console.log(
      "Adding block to blockchain with transactions:",
      myWitnessList.txPool.getAllTransactions()
    );
    console.log("Previous hash:", prevHash);
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
        console.log(
          `Block proposal signed and sent to ${ipPort} successfully:`,
          response.data
        );
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
