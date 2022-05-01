const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const productImage = client.db("colognePerfume").collection("productCollection");

    //loading basic images
    app.get("/basicImages", async (req, res) => {
      const query = {};
      const cursor = basicImages.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //loading inventory items
    app.get("/inventory", async (req, res) => {
      const query = {};
      const cursor = productImage.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //using PUT method to update quantity at inventory page
    app.put("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const upDoc = req.body;
      console.log(id);
      console.log(upDoc);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: { quantity: upDoc?.quantity },
      };
      const result = await productImage.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    //using DELETE method to delete single item
    app.delete("/deleteItem/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: ObjectId(id) };
      const result = await productImage.deleteOne(query);
      res.send(result);
    });
  } finally {
    console.log("Connected to db");
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("The heroku port is running successfully");
});

app.listen(port, () => {
  console.log("Port is connected");
});
