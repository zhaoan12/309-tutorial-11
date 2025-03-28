const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const app = express();

app.use(
  cors({
    origin: FRONTEND_URL,
    // if needed:
    // methods: ["GET", "POST", "PUT", "DELETE"],
    // credentials: true,
  })
);

app.use(express.json());
app.use("", routes);

module.exports = app;
