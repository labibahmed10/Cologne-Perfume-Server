const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

//dotenv
require("dotenv").config();

//middlesware
app.use(cors());
app.use(express.json());

//mongodb side

const uri = `mongodb+srv://${process.env.COL_USER}:${process.env.COL_PASS}@cluster0.zqp7w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const basicImages = client.db("colognePerfume").collection("basicImages");

    app.get("/basicImages", async (req, res) => {
      const query = {};
      const cursor = basicImages.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
  } finally {
    console.log("Connected to db");
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log("Port is connected");
});
