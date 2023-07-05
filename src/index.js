const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const pass = process.env.MONGO_PASSWORD;
const uri = `mongodb+srv://nicolashuertas:${pass}@cluster0.catgcnu.mongodb.net/?retryWrites=true&w=majority`;
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const Model = require('./model/Model');

const port = 5000;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.log(err));

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/api', (req, res) => {
  res.send("hello");
})

app.post('/api/users', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password using bcrypt

    const newUser = new Model({
      username,
      email,
      password: hashedPassword // Save the hashed password
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
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Unable to save user' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await Model.findOne({ $or: [{ username }, { email: username }] });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or email' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      res.json({ message: 'Login successful' });
    } else {
      return res.status(401).json({ error: 'Invalid password' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Unable to login' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
