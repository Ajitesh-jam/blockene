
import express from "express";
import { createBlock, getBlocks, getBlockByIndex } from "../controllers/blockController.js";

const router = express.Router();

router.post("/blocks", createBlock); // /api/blocks
router.get("/blocks", getBlocks);    //   /api/blocks
router.get("/blocks/:index", getBlockByIndex); // /api/blocks/:index

export default router;
