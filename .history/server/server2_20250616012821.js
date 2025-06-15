// server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import blockRoutes from "./routes/blockRoutes.js";
import { PORT2 } from "../constants/const.js";

const app = express();


app.use(cors());
app.use(bodyParser.json());
app.use("/api", blockRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

