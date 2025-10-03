import express, { response } from "express";
import session from "express-session";
import MySQLStore from "express-mysql-session";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { pool, initializeDatabase } from "./database.js";
import cors from "cors";
import jwt from "jsonwebtoken"; /* потом удалить из модулей */
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
    expiration: 60 * 60 * 1000,
    clearExpired: true,
    checkExpirationInterval: 15 * 60 * 1000
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
      "SELECT * FROM datausers WHERE email = ?";
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
    console.log("Сессия после входа:", request.session);
    response.json({ message: "Пользователь авторизован", id: user.id, role: user.role });
  } catch (error) {
    response.json({
      message: "ошибка сервера",
    });
  }
});

app.get("/account/:id", async (request, response) => {

  if (!request.session.email) {
    return response.redirect("/auth");
  }
  try {
    response.sendFile(path.join(__dirname, "views", "account.html"));
  } catch (err) {
    response.status(401).json({ message: "Ошибка сервера" });
  }
});

app.get("/getdatauser/:id", async (request, response) => {
  const id = request.params.id
  try {
    const sqlCheckuser = "SELECT * FROM datausers WHERE id = ?";
    const dataCheckuser = [id];
    const [results] = await pool.execute(sqlCheckuser, dataCheckuser);
    const dataUser = results[0];
    const { password, ...user } = dataUser
    response.json(user)
  } catch (error) {
    console.log(error)
    response.json({ message: "ошибка сервера" })
  }
})


app.get("/bunuser/:id/:action", async (request, response) => {

  if (!request.session.email) {
    return response.redirect("/auth");
  }

  const id = request.params.id
  const action = request.params.action
  try {
    const sqlCheckuser = "UPDATE datausers SET ban = ? WHERE id = ?";
    const dataCheckuser = [action, id];
    const [results] = await pool.execute(sqlCheckuser, dataCheckuser);
    if (results.changedRows == 1) {
      response.json({ message: 'Обновление успешно', success: true })
    } else {
      response.json({ message: 'Обновление не удалось. Попробуйте еще раз', success: false })
    }
  } catch (error) {
    console.log(error)
    response.json({ message: "ошибка сервера", success: false })
  }
})


app.get("/admin/:id", async (request, response) => {
  if (!request.session.email) {
    return response.redirect("/auth");
  }

  response.sendFile(path.join(__dirname, "views", "admin.html"));
})


app.get('/users', async (request, response) => {
  try {
    if (!request.session.email) {
      return response.redirect("/auth");
    }
    const sqlCheckuser = "SELECT id, username, datebirth, email, status, role, ban FROM datausers";
    const [results] = await pool.execute(sqlCheckuser);
    response.json(results)
  } catch (error) {
    console.log(error)
    response.json({ message: "ошибка сервера" })
  }
})


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
