
import express from "express";
import { createBlock, getAllBlocks, getBlockByIndex } from "../controllers/blockController.js";

const router = express.Router();

router.post("/blocks", createBlock); // /api/blocks
router.get("/blocks", getAllBlocks);    //   /api/blocks
router.get("/blocks/:index", getBlockByIndex); // /api/blocks/:index

export default router;
