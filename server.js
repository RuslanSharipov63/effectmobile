import express from "express";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { pool, initializeDatabase } from "./database.js";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  console.log(data);
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

    const [result] = await pool.execute(
      "INSERT INTO datausers (datebirth, email, password, role, status, username) VALUES (?, ?, ?, ?, ?, ?)",
      [
        data.dateBirth,
        data.email,
        data.password,
        data.role,
        data.status,
        data.username,
      ]
    );
    console.log(result);
    response.status(201).json({
      message: "Пользователь добавлен",
    });
  } catch (error) {}
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
