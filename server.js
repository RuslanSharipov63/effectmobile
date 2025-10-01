import express from "express";
import session from "express-session";
import MySQLStore from "express-mysql-session";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { pool, initializeDatabase } from "./database.js";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
await initializeDatabase();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
const MySQLSessionStore = MySQLStore(session);
const sessionStore = new MySQLSessionStore(
  {
    createDatabaseTable: false,
  },
  pool
);

app.use(
  session({
    secret: process.env.SECRET_KEY_SESSION,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

const regEmail =
  /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/;

app.get("/", async (request, response) => {
  response.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/registration", async (request, response) => {
  response.sendFile(path.join(__dirname, "views", "registration.html"));
});

app.post("/adduser", async (request, response) => {
  const { ...data } = request.body;

  try {
    if (
      data.name == "" ||
      data.dateBirth == "" ||
      !regEmail.test(data.email) ||
      data.password.length < 8
    ) {
      response.json({ message: "Заполните корректно поля" });
      return;
    }

    const sqlExist = "SELECT COUNT(*) AS count FROM datausers WHERE email = ?";
    const dataExist = [data.email];
    const [checkResults] = await pool.execute(sqlExist, dataExist);

    if (checkResults[0].count > 0) {
      response.json({ message: "Пользователь существует" });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const sql =
      "INSERT INTO datausers (datebirth, email, password, role, status, username) VALUES (?, ?, ?, ?, ?, ?)";
    const dataInsert = [
      data.dateBirth,
      data.email,
      hashedPassword,
      data.role,
      data.status,
      data.name,
    ];
    const addUser = await pool.query(sql, dataInsert);

    request.session.email = data.email;
    request.session.username = data.name;

    response.json({ message: "Пользователь добавлен" });
  } catch (error) {
    response.json({
      message: "ошибка сервера",
    });
  }
});

app.get("/auth", (request, response) => {
  response.sendFile(path.join(__dirname, "views", "auth.html"));
});

app.post("/authuser", async (request, response) => {
  const { ...dataUser } = request.body;

  try {
    if (!dataUser.email || !dataUser.password) {
      return response
        .status(400)
        .json({ message: "Email и пароль обязательны" });
    }

    const sqlCheckuser =
      "SELECT email, password FROM datausers WHERE email = ?";
    const dataCheckuser = [dataUser.email];
    const [results] = await pool.execute(sqlCheckuser, dataCheckuser);

    if (results.length === 0) {
      return response
        .status(401)
        .json({ message: "Email и пароль обязательны" });
    }
    const user = results[0];

    const isPasswordValid = await bcrypt.compare(
      dataUser.password,
      user.password
    );
    if (!isPasswordValid) {
      return response
        .status(401)
        .json({ message: "Email и пароль обязательны" });
    }
    request.session.email = dataUser.email;
    request.session.name = dataUser.name;
     console.log("Сессия после входа:", req.session);
    response.json({ message: "Пользователь авторизован" });
  } catch (error) {
    response.json({
      message: "ошибка сервера",
    });
  }
});

app.get("/account", async (response, request) => {
  console.log(request.session.email)

  /* if (!request.session.email) {
    return response.redirect("/auth");
  } */
  try {
 /*    const sqlCheckuser = "SELECT * FROM datausers WHERE email = ?";
    const dataCheckuser = [dataUser.email];
    const [results] = await pool.execute(sqlCheckuser, dataCheckuser); */
    response.sendFile(path.join(__dirname, "views", "account.html"));
  } catch (err) {
    res.status(401).json({ message: "Ошибка сервера" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
