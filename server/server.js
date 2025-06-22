// server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import blockRoutes from "./routes/blockRoutes.js";
import { PORT1 } from "../constants/const.js";

const app = express();
const PORT = process.env.PORT || 4500;
app.get("/", (req, res) => {
  res.send("Hello! from the politician server at port " + PORT);
});

app.use(cors());
app.use(bodyParser.json());
app.use("/api", blockRoutes);

///////////Ajitesh

import { WitnessListOfTxPool } from "../witness_list/witnessListClass.js";
import { Transaction } from "../blockchain/classes/transactions.js";
import { signMsg } from "../blockchain/utils/crypto.js";
import { Key } from "../blockchain/utils/key.js";
import { addWitnessListToMyWitnessList } from "../witness_list/witnessListClass.js";
let witnessListOfTxPool = new WitnessListOfTxPool(PORT); //this should be array
let witnessList = [];

app.get("/getMyWitnessList", (req, res) => {
  if (witnessListOfTxPool) {
    res.json(witnessListOfTxPool);
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
    const status = witnessListOfTxPool.txPool.addATransaction(transaction);
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
    // Sign the witness list
    witnessListOfTxPool.signWitnessList(approverCitizen, pvtKey);
    res.status(200).send("Witness list signed successfully");
  } catch (error) {
    console.error("Error signing witness list:", error);
    res.status(500).send("Error signing witness list");
  }
});

app.post("/signWitnessList", (req, res) => {
  try {
    const { pvtKey } = req.body;
    if (!approverCitizen || !pvtKey) {
      return res.status(400).send("Invalid witness list data");
    }
    const key = new Key(pvtKey, pvtKey); // Assuming pvtKey is the public key of the approver
    // Sign the witness list
    witnessListOfTxPool.signWitnessList(key);
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
    witnessListOfTxPool.addAWitness(txId, witness);
    res.status(200).send("Witness added successfully", witnessListOfTxPool);
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
      witnessListOfTxPool,
      witnessList.approverCitizen,
      witnessList.txPool,
      witnessList.witnessesOfEachTransactions,
      witnessList.signature
    );
    res.status(200).send("Witness list added successfully");
  } catch (error) {
    console.error("Error adding witness list:", error);
    res.status(400).send("Error adding witnessList:", error || "Unknown error");
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// setInterval(() => syncConsensus(PORT), 40000);
