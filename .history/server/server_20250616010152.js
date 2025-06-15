// server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import blockRoutes from "./routes/blockRoutes.js";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());
app.use("/api", blockRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

