const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// MongoDB connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@samimosman.5p8c5.mongodb.net/?retryWrites=true&w=majority&appName=SamimOsman`;

// MongoDB Client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false, // Set to false if collections are created dynamically
    deprecationErrors: true,
  },
});

let productsCollection;
let usersCollection;

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    // Define collections AFTER connecting to the database
    const db = client.db("sunnah-storeDB");
    productsCollection = db.collection("products");
    usersCollection = db.collection("users");

  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
}
run().catch(console.dir);

// POST a user to DB
app.post("/users", async (req, res) => {
  try {
    const user = req.body;
    
    if (!user) {
      return res.status(400).json({ status: "error", message: "Invalid user data" });
    }

    const result = await usersCollection.insertOne(user);
    res.status(201).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
});

//Get a single user from db

app.get("/users/:id", async (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const result = await usersCollection.findOne(
    { _id: new ObjectId(id) },
    { projection: { _id: 0 } }
  );

  if (!result) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).send(result);
});

// Get all users from db
app.get("/users", async (req, res) =>{
  try {
    const users = await usersCollection.find().toArray();
    res.send(users);
  } catch (error) {
    res.status(500).send({ message: "Users not found" });
  }
});

// GET all products from db
app.get("/products", async (req, res) => {
  try {
    const products = await productsCollection.find().toArray();
    res.send(products);
  } catch (error) {
    res.status(500).send({ message: "Products not found" });
  }
});

// GET a single product from DB
app.get("/products/:id", async (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  const result = await productsCollection.findOne(
    { _id: new ObjectId(id) },
    { projection: { _id: 0 } }
  );

  if (!result) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(200).send(result);
});

// DELETE a users
app.delete("/users/:id", async (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  res.send({ message: "User deleted successfully" });
});

// DELETE a product
app.delete("/products/:id", async (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  const result = await productsCollection.deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.send({ message: "Product deleted successfully" });
});

// UPDATE a product in DB
app.put("/products/:id", async (req, res) => {
  const id = req.params.id;
  const updateDoc = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  const result = await productsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateDoc },
    { upsert: true }
  );

  res.send(result);
});

// POST a new product
app.post("/products", async (req, res) => {
  try {
    const product = req.body;
    const result = await productsCollection.insertOne(product);
    res.send({ status: "success", data: result });
  } catch (error) {
    res.status(500).send({ message: "Failed to add product" });
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Sunnah-Store Server");
});

// Start Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
