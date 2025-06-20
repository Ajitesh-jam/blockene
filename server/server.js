// server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import blockRoutes from "./routes/blockRoutes.js";
import { PORT1 } from "../constants/const.js";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello! Ajitesh bhadwe le kar diya backend connect. Chodu saala!");
});

app.use(cors());
app.use(bodyParser.json());
app.use("/api", blockRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

setInterval(() => syncConsensus(PORT), 40000);
