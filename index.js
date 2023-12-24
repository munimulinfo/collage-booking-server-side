const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.User_Name}:${process.env.User_Pass}@cluster0.j5a0pdi.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const cartsCollection = client.db("product").collection("carts");
    const usersCollection = client.db("product").collection("alluser");

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ error: "user Alredy exsits" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/singlecart/:email", async (req, res) => {
      const email = req.params.email;
      const result = await cartsCollection.find({ email: email }).toArray();
      res.send(result);
    });

    app.post("/postcart", async (req, res) => {
      const addcollage = req.body;
      const result = await cartsCollection.insertOne(addcollage);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("product server is running");
});

app.listen(port, (req, res) => {
  console.log(`product servre is running on port ${port}`);
});
