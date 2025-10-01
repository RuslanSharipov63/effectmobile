import express from "express";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { pool, initializeDatabase } from "./database.js";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
await initializeDatabase();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
    const [checkResults] = await pool.execute(sqlExist, dataExist)

    if (checkResults[0].count > 0) {
      response.json({ message: "Пользователь существует" })
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);


    const sql = "INSERT INTO datausers (datebirth, email, password, role, status, username) VALUES (?, ?, ?, ?, ?, ?)";
    const dataInsert = [
      data.dateBirth,
      data.email,
      hashedPassword,
      data.role,
      data.status,
      data.name,
    ];
    const addUser = await pool.query(sql, dataInsert)

    response.json({ message: 'Пользователь добавлен' })
  } catch (error) {
    response.json({
      message: 'ошибка сервера'
    })
  }
});

app.get('/auth', (request, response) => {
  response.sendFile(path.join(__dirname, "views", "auth.html"));
})


app.post('/authuser', async (request, response) => {
  const { ...dataUser } = request.body;

  try {
    if (!dataUser.email || !dataUser.password) {
      return response.status(400).json({ message: "Email и пароль обязательны" });
    }

    const sqlCheckuser = "SELECT email, password FROM datausers WHERE email = ?";
    const dataCheckuser = [dataUser.email];
    const [results] = await pool.execute(sqlCheckuser, dataCheckuser);


    if (results.length === 0) {
      return res.status(401).json({ message: "Email и пароль обязательны" });
    }
    const user = results[0];

    const isPasswordValid = await bcrypt.compare(dataUser.password, user.password);
    if (!isPasswordValid) {
      return response.status(401).json({ message: "Email и пароль обязательны" });
    }
    const token = jwt.sign({ email: user.email }, process.env.SECRET_KEY, { expiresIn: "1h" });
    response.json({ token });

  } catch (error) {
    response.json({
      message: 'ошибка сервера'
    })
  }
})


app.get('/account', (response, request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Токен не предоставлен" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded.email —  email авторизованного пользователя
    response.sendFile(path.join(__dirname, "views", "account.html"));
    res.json({ message: `Профиль пользователя: ${decoded.email}` });

  } catch (err) {
    res.status(401).json({ message: "Неверный или просроченный токен" });
  }


})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
