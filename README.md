# 🛹 SkateShop App

A simple e-commerce back and frontend for a skate shop built with Spring Boot and Angular

currently: tests in test.http, understanding and adding unit tests, Playwright api tests, UI to be implemented after userless cart and creating order on UI

https://youtube.com/shorts/ZAp0CHNlNBI?feature=share

## 🚀 Features

* Product management (CRUD)
* Cart system
* JWT authentication
* Role-based access (ADMIN / CLIENT)
* REST API with DTOs

partial UI, login and password inputs, logout, get all products ngFor, cart for logged user

inits with 4 products, user and admin

## 🛠️ Tech Stack

* Java 17
* Spring Boot
* Spring Security
* H2 Database
* Maven
* Angular
* Docker

## ▶️ Run locally

install git
open a folder with command line
git clone https://github.com/thisrepo
install maven
install node
cd backend 
mvn clean install
./mvnw spring-boot:run

second terminal:
cd frontend 
npm install
npm start

## 🐳 Run with Docker

should work with docker compose up in source folder, it has backend alias instead of localhost

## 🔐 Authentication

Login:

```http
POST /api/auth/login
```
{login:
password}
Use token:

```
Authorization: Bearer <token>
```

## 📦 API Endpoints

* `/api/products`
* `/api/cart`
* `/api/order`
* `/api/auth`

## 👤 Roles

* CLIENT → shopping
* ADMIN → product management

## test from DevTools Console:

fetch('http://localhost:8080/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  },
  body: JSON.stringify({
    name: "Test S333kates",
    price: 299.99,
    category: "SKATES",
    type: "FREESKATE",
    stock: 10,
    imageUrl: "test.jpg"
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

http://localhost:8080/swagger-ui/index.html