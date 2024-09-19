const express = require("express");
const passwordHashing = require("argon2");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const jwtPassword = "123456";

const app = express();
app.use(express.json());
app.listen(3000);

mongoose.connect(
  "mongodb+srv://bharabhi01:I%40mabhi2701@test.9jo8d.mongodb.net/"
);

const User = mongoose.model("Users", {
  email: String,
  password: String,
  firstName: String,
  lastName: String,
});

async function hashPassword(password) {
  try {
    const hashedPassword = await passwordHashing.hash(password, {
      type: passwordHashing.argon2id,
      timeCost: 2,
      memoryCost: 2 ** 16,
      parallelism: 1,
    });
    return hashedPassword;
  } catch (err) {
    console.log("Error hashing the password!");
  }
}

app.post("/signup", async function (req, res) {
  const { email, password, firstName, lastName } = req.body;

  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      res.status(403).json({
        message: "User already exists! Please sign in!",
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = new User({
      email: email,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName,
    });

    user.save();

    res.json({
      message: "User has been signed up!",
    });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({
      message: "Error signing up the user!",
    });
  }
});

app.post("/signin", async function (req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(403).json({
        message: "User doesn't exist! Please signup!",
      });
    }

    // Verify the password using argon2
    const isPasswordValid = await passwordHashing.verify(
      user.password,
      password
    );
    if (!isPasswordValid) {
      return res.status(403).json({
        message: "Invalid email or password!",
      });
    }

    const jwtToken = jwt.sign({ email: email }, jwtPassword);

    res.json({
      jwtToken,
    });
  } catch (err) {
    console.error("Error during signin:", err);
    res.status(500).json({
      message: "Error signing in the user!",
    });
  }
});
