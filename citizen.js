//Make a ciitizrn node server which will call politicians server's to fetch data and propose new transactions.
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { Transaction } from "./classes/transactions.js";
import { Blockchain } from "./core/blockchain.js";
import { NO_OF_TRANSACTIONS_IN_BLOCK } from "./constants/const.js";
import { hash } from "./utils/crypto.js";
import { Block } from "./classes/block.js";
import { BlockHeader } from "./classes/blockHeader.js";

const app = express();
app.use(bodyParser.json());
