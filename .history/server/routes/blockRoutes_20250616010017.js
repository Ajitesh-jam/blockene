// routes/blockRoutes.js
import express from "express";
import { createBlock, getBlocks, getBlockByIndex } from "../controllers/blockController.js";

const router = express.Router();

router.post("/blocks", createBlock); // POST /api/blocks
router.get("/blocks", getBlocks);    // GET  /api/blocks
router.get("/blocks/:index", getBlockByIndex); // GET /api/blocks/:index

export default router;
