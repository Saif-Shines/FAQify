import express from "express";

import path from "path";
import cors from "cors";
import { chain } from "./example_scripts/scram-into-single-question";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

app.get("/", function (req, res) {
  try {
    res.sendFile("public/index.html");
    res.status(200);
  } catch (error) {
    console.debug("Something", error);
    res.status(500);
  }
});

app.post("/question", async function (req, res) {
  try {
    const answer = await chain.invoke({ question: req.body.question });
    res.json({ answer: answer });
    res.status(200);
    res.end();
  } catch (error) {
    console.error("The error deatils we know:", error);
    res.status(500);
  }
});

app.listen(port, function () {
  console.info(`Web Server is listening at ${port}`);
});
