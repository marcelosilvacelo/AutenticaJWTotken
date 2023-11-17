require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("./model/User.js");

const app = express();
const PORT = 3000;

app.use(express.json());

function checkToken(req, res, next) {
  const authHeader = req.header["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "acesso negado" });
  }
  try {
    const secret = process.env.SECRET;
    jwt.verify(token, secret);
    next();
  } catch (error) {
    re.status(400).json({ msg: "Token Invalido" });
  }
}
app.post("/auth/register", async (req, res) => {
  const { nome, email, password, confirmaPassword } = req.body;
  if (!nome) {
    return res.status(422).json({ msg: "Nome Obrigatorio!" });
  }
  if (!email) {
    return res.status(422).json({ msg: "E-mail Obrigatorio!" });
  }
  if (!password) {
    return res.status(422).json({ msg: "Password Obrigatorio!" });
  }
  const userExists = await User.findOne({ email: email });
  if (userExists) {
    return res.status(422).json({ msg: "FAVOR INFORMAR E-MAILS VALIDO" });
  }
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = new User({
    nome,
    email,
    password: passwordHash,
  });
  try {
    await user.save();
    res.status(201).json({ msg: "USUARIO CADASTRADO COM SUCESSO" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    res.status(422).json({ msg: "E-mail Obrigratorio!" });
  }
  if (!password) {
    res.status(422).json({ msg: "Password Obrigatorio!" });
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    res.status(404).json({ msg: "usuario não encontrado" });
  }
  const checkPassword = await bcrypt.compare(password, user.password);
  if (!checkPassword) {
    res.status(422).json({ msg: "Senha Invalida!" });
  }
  try {
    const secret = process.env.SECRET;
    const token = jwt.sign(
      {
        id: user._id,
      },
      secret
    );
    res.status(200).json({ msg: "AUTENTICADO COM SUCESSO", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "ERRO NO SERVIDOR, TENTE MAIS TARDE" });
  }
});
app.get("/user/:id", checkToken, async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id, "-password");
  if (!user) {
    return res.status(422).json({ msg: "Usuario não encontrado" });
  }
  res.status(200).json({ user });
});
db_User = process.env.DB_USER;
db_Password = process.env.DB_PASSWORD;
mongoose
  .connect(
    `mongodb+srv://${db_User}:${db_Password}@cluster0.yycqypt.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(PORT, () => {
      console.log("SERVER CONECTED");
    });
  })
  .catch((error) => {
    console.log(error);
  });
