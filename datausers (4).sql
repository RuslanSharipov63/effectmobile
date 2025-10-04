-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Хост: MySQL-8.0
-- Время создания: Окт 04 2025 г., 09:44
-- Версия сервера: 8.0.35
-- Версия PHP: 8.1.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `users`
--

-- --------------------------------------------------------

--
-- Структура таблицы `datausers`
--

CREATE TABLE `datausers` (
  `id` int NOT NULL,
  `datebirth` date NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `role` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ban` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `datausers`
--

INSERT INTO `datausers` (`id`, `datebirth`, `email`, `password`, `role`, `status`, `username`, `ban`) VALUES
(30, '2025-10-10', 'gavrilov1563347@mail.ru', '$2b$10$g4N3jokuQdykjUoqB9BRr.5jw0Kn1uaQA.hL5NzReG.rQKVKYoD4u', 'user', 'active', 'fdgdgfd', 1),
(31, '2025-10-25', 'texgaz@mail.ru', '$2b$10$K.4Ww5jgNPuvNaP5KVSQM.F8/SehhB/aUKQAJNdSW/iRgba4RQlV6', 'admin', 'active', 'zsfgdfsgdfg', 1);

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `datausers`
--
ALTER TABLE `datausers`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `datausers`
--
ALTER TABLE `datausers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
