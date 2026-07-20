# 🛹 SkateShop App

A simple e-commerce back and frontend for a skate shop built with Spring Boot and Angular to showcase Playwright framework

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

config has: 
- ui and api path specified projects
- docker configuration
- screenshot and video retency
- expect timeout

fixtures injected:
- freshClient user with random email
- browserless login for freshClient
- api client for admin and user to setup and teardown test data
- worker token fixture

tests receive: 
- Business POMs with technical Component Locator subtree, with api returns for business processes for wait and assert
- ProductBuilder
- assertions

backend is brought to early-commercial level in case of future use 

npx playwright test --grep @suite-api
npx playwright test --grep @suite-ui
npx playwright test --grep @suite-all

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

## Playwright scripts

```bash
npm run test:api
npm run test:ui
npm test
npm run ui
```

Native Playwright suite tags:

```bash
npx playwright test --grep @suite-api
npx playwright test --grep @suite-ui
npx playwright test --grep @suite-all
```

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

