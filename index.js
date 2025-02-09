require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");

// Middleware Settings here
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
// Middleware Settings here

// Verify Token Here
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res
      .status(401)
      .send({ message: "You are not supposed to be here!" });
  }

  jwt.verify(token, process.env.ACCESS_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Access Denied" });
    }
    req.user = decoded;
    next();
  });
};
// Verify Token Here

// MongoDB Settings here
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.parzq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // Collections here
    const eventCollection = client.db("eventPulse").collection("events");
    const userCollection = client.db("eventPulse").collection("users");
    // Collections here

    // JWT Api
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_SECRET_KEY, {
        expiresIn: "24h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    app.post("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });
    // JWT Api

    // User APIS here
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users/role/:email", verifyToken, async (req, res) => {
      const { email } = req.params;
      try {
        const user = await userCollection.findOne({ email });
        res.send({ role: user.role });
      } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
      }
    });
    // User APIS here

    // Event APIS here
    app.post("/events", verifyToken, async (req, res) => {
      const event = req.body;
      const result = await eventCollection.insertOne(event);
      res.send(result);
    });

    app.get("/events", async (req, res) => {
      try {
        const { filter } = req.query;

        const currentDate = new Date();

        let query = {};

        if (filter === "upcoming") {
          query.eventTime = { $gte: currentDate.toISOString() };
        } else if (filter === "past") {
          query.eventTime = { $lt: currentDate.toISOString() };
        }

        const events = await eventCollection.find(query).toArray();
        res.json(events);
      } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Error fetching events" });
      }
    });
    // Event APIS here
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
// MongoDB Settings here

// Get and Listen Settings here
app.get("/", (req, res) => {
  res.send("Event server is running");
});

app.listen(port, () => {
  console.log(`Event Server is running on PORT: ${port}`);
});
// Get and Listen Settings here
