import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Создаем пул соединений
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3308,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'users',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Подключение к БД установлено');
    
    // Выполняем тестовый запрос
    const [rows] = await connection.execute('SELECT NOW() AS time');
    console.log('✅ Время сервера БД:', rows[0].time);
    
    connection.release(); 
    return true;
  } catch (error) {
    console.error('Ошибка подключения к БД:', error.message);
    return false;
  }
}

// Проверка подключения при запуске
export async function initializeDatabase() {
  const success = await testConnection();
  if (success) {
    console.log('База данных инициализирована');
    return true;
  } else {
    console.log('Не удалось подключиться к БД');
    process.exit(1);
  }
}