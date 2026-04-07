# 🛹 SkateShop Backend

A simple e-commerce backend for a skate shop built with Spring Boot.

## 🚀 Features

* Product management (CRUD)
* Cart system
* JWT authentication
* Role-based access (ADMIN / CLIENT)
* REST API with DTOs

## 🛠️ Tech Stack

* Java 17
* Spring Boot
* Spring Security
* H2 Database
* Maven
* Docker

## ▶️ Run locally

```bash
./mvnw spring-boot:run
```

## 🐳 Run with Docker

```bash
./mvnw clean package
docker build -t skateshop-backend .
docker run -p 8080:8080 skateshop-backend
```

## 🔐 Authentication

Login:

```http
POST /api/auth/login
```

Use token:

```
Authorization: Bearer <token>
```

## 📦 API Endpoints

* `/api/products`
* `/api/cart`
* `/api/auth`

## 👤 Roles

* CLIENT → shopping
* ADMIN → product management


http://localhost:8080/swagger-ui/index.html