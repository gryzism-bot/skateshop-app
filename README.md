# 🛹 SkateShop App

A simple e-commerce back and frontend for a skate shop built with Spring Boot and Angular

currently: tests in test.http, understanding and adding unit tests, Playwright api tests and ui init test

https://youtube.com/shorts/ZAp0CHNlNBI?feature=share

## 🚀 Features

* Product management (CRUD)
* Cart system
* JWT authentication
* Role-based access (ADMIN / CLIENT)
* REST API with DTOs

UI, login and password inputs, logout, get all products ngFor, cart for logged user

inits with 8 products, user and admin

cart, userless cart, merge userless browser cart to "real cart" button, checkout modal, mock payment button, order paid status, admin panel, order dashboard, change status to sent button 

## all made for Playwright framework showcase: 

Business POM with Component Locator subtree, with page's locator functions, freshClient fixture, browserless login, textContext object in test fixture dependency chain, with nested getToken workerFixture for roles, with api client: admin's product and user's product/cart/order. Made as SO from SOLID as possible for scalability and openness. 

but backend is brought to early-commercial level in case of future use 

## 🛠️ Tech Stack

* Java 17
* Spring Boot
* Spring Security
* H2 Database
* Maven
* Angular
* Docker

## 🐳 Run with Docker

install Docker Desktop, go to root folder and docker-compose up -d --build

localhost:4200

docker-compose exec playwright npx playwright test

## ▶️ Run locally 

install git
open a folder with command line
git clone https://github.com/thisrepo
install maven
install node
cd backend 
mvn clean install
./mvnw spring-boot:run
localhost:8080

second terminal:
cd frontend 
npm install
npm start
localhost:4200

third terminal:
cd playwright
npm install
npm run ui

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

## test api from DevTools Console after UI login:

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

