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
// let witnessListOfTxPool = new WitnessListOfTxPool(PORT); //this should be array
let allWitnessLists = [];

app.get("/getAllWitnessList", (req, res) => {
  let allWitnessListJsonObj = [];
  try {
    for (const witness of allWitnessLists) {
      if (witness instanceof WitnessListOfTxPool) {
        allWitnessListJsonObj.push(witness.getWitnessList());
      }
      console.log("Not a witness list Witness List:", witness.getWitnessList());
    }
    if (allWitnessListJsonObj.length === 0) {
      return res.status(404).send("No witness lists found");
    }
    res.status(200).json(allWitnessListJsonObj);
  } catch (error) {
    console.error("Error fetching witness lists:", error);
    res.status(500).send("Error fetching witness lists");
  }
});

app.post("/addWitnessListToPool", (req, res) => {
  try {
    const { witnessList } = req.body;
    if (allWitnessLists.includes(witnessList))
      console.log("Received witness list:", witnessList);

    //check if there is already a witness list with the same approverCitizen
    const existingWitnessList = allWitnessLists.find(
      (witness) => witness.approverCitizen === witnessList.approverCitizen
    );
    if (existingWitnessList) {
      addWitnessListToMyWitnessList(
        existingWitnessList,
        witnessList.approverCitizen,
        witnessList.txPool,
        witnessList.witnessesOfEachTransactions,
        witnessList.signature
      );
      return res.status(200).send("Witness list updated successfully");
    }
    const witnessListObj = new WitnessListOfTxPool(witnessList.approverCitizen);

    // Add the received witness list to the local witness list
    addWitnessListToMyWitnessList(
      witnessListObj,
      witnessList.approverCitizen,
      witnessList.txPool,
      witnessList.witnessesOfEachTransactions,
      witnessList.signature
    );
    allWitnessLists.push(witnessListObj);
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
