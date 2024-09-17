const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
app.use(express.json());

require("dotenv").config();

const Users = JSON.parse(process.env.USERS);

function userCheck(username, password) {
  let obj = Users.find(
    (user) => user.username === username && user.password === password
  );
  if (obj) {
    return true;
  }

  return false;
}

app.post("/signin", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  if (!userCheck(username, password)) {
    res.status(403).json({
      message: "User doesn't exist!",
    });
  }

  var jwtToken = jwt.sign({ username: username }, "shhhhh");

  return res.json({
    jwtToken,
  });
});

app.get("/users", function (req, res) {
  const token = req.headers.authorization;
  console.log("token", token);
  try {
    const decodedToken = jwt.verify(token, "shhhhh");
    const username = decodedToken.username;
    console.log("username:", username);
    res.json({
      username,
    });
  } catch (error) {
    res.status(403).json({
      message: "Invalid JWT!",
    });
  }
});

app.listen(3000);
