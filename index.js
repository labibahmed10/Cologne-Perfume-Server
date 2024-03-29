const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");

//dotenv
require("dotenv").config();

const port = process.env.PORT || 5000;

//middlesware
app.use(cors());
app.use(express.json());

//json web token
const jwt = require("jsonwebtoken");

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
         const pageNum = req.query.pageNum;
         const size = req.query.size;

         const cursor = productImage.find({});
         const result = await cursor
            .skip(+pageNum * +size)
            .limit(+size)
            .toArray();

         const count = await productImage.estimatedDocumentCount();
         res.send({ result, count });
      });

      //using PUT method to update quantity at inventory page
      app.put("/inventory/:id", async (req, res) => {
         const id = req.params.id;
         const upDoc = req.body;

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

      //using POST method to add new product here
      app.post("/inventory", async (req, res) => {
         const addedProduct = req.body;
         const token = req.headers.authorization;
         const [email, accessToken] = token.split(" ");
         const decoded = verifyToken(accessToken);

         if (decoded.email === email) {
            const result = await productImage.insertOne(addedProduct);
            res.send(result);
         } else {
            res.send({ message: "Unauthorized Access" });
         }
      });

      //getting my items only by email & GET method
      app.get("/myItems", async (req, res) => {
         const token = req.headers.authorization;
         const [tokenEmail, accessToken] = token.split(" ");
         const { email } = req.query;

         const decoded = verifyToken(accessToken);

         if (decoded.email === tokenEmail) {
            const query = { email: email };
            const cursor = productImage.find(query);
            const result = await cursor.toArray();
            res.send({ result, success: true });
         } else {
            res.send({ success: false, message: "Unauthorized Access can't show products" });
         }
      });

      //Deleting single my Items by DElETE
      app.delete("/myItems/:id", async (req, res) => {
         const { id } = req.params;
         const query = { _id: ObjectId(id) };
         const result = await productImage.deleteOne(query);
         res.send(result);
      });

      //implementing basic jwt here and creating token
      app.post("/createToken", async (req, res) => {
         const email = req.body;
         const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
         res.send(token);
      });
   } finally {
      console.log("Connected to db");
   }
}
run().catch(console.dir);

//verify the token by function
function verifyToken(token) {
   let email;
   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
         email = "The email you're trying with is invalid";
      }
      if (decoded) {
         email = decoded;
      }
   });

   return email;
}

//basic check
app.get("/", (req, res) => {
   res.send("The heroku port is running successfully");
});

app.use((req, res, next) => {
   res.header({ "Access-Control-Allow-Origin": "*" });
   next();
});

app.listen(port, () => {
   console.log("Port is connected");
});
