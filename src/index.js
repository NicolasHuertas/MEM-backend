const express = require('express');
const app = express();
const uri = "mongodb+srv://nicolashuertas:8bG4qjX0M8nw4hb3@cluster0.catgcnu.mongodb.net/?retryWrites=true&w=majority";
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const Model = require('./model/Model');

const port = 5000;
/*
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.log(err));*/

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/api', (req, res) => {
  res.send("hello");
})

app.post('/api/users', (req, res) => {
  const {username, email, password} = req.body;
  const newUser = new Model({
    username,
    email,
    password
  });

  newUser.save()
    .then(user => {
      console.log('User saved:', user);
      res.json(user);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: 'Unable to save user' });
    });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Find the user in the database based on the username
  Model.findOne({ username })
    .then(user => {
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Compare the entered password with the hashed password stored in the database
      bcrypt.compare(password, user.password)
        .then(match => {
          if (!match) {
            return res.status(401).json({ error: 'Invalid password' });
          }

          res.json({ message: 'Login successful' });
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({ error: 'An error occurred during login' });
        });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: 'An error occurred during login' });
    });
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})