# UberEats


This repository contains a **full-stack** UberEATS-style application built with **Node.js (Express.js)** for the backend and **React** for the frontend. The system supports two roles:

- **Customers**: signup, login, view restaurants, add to cart, checkout, favorites.  
- **Restaurants**: signup, login, manage profile, add/edit dishes, view/update orders.

---

## 1. Prerequisites

1. **Node.js** (v14+ recommended)  
2. **MySQL** server running locally (or accessible with valid credentials)  
3. **npm** (or **yarn**)

---

## 2. Clone Repository & Install Dependencies


git clone https://github.com/BasanthPR/UberEats.git
cd UberEats

###Backend Setup

cd backend
npm install

###Frontend Setup

cd ../frontend
npm install

### Backend Environment
In backend, ensure you have a .env file with:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=uber_eats_db
SESSION_SECRET=uberEatsSecret
PORT=3001

### Frontend Environment
In frontend, you can create a .env if needed. For example:


REACT_APP_API_URL=http://localhost:3001
Or just reference http://localhost:3001 directly in your Axios configuration.

### 4. Running the App
### 4.1. Start the Backend
Open a terminal in UberEats/backend:

npm start
You should see something like:
Server listening on port 3001

### 4.2. Start the Frontend
Open another terminal in UberEats/frontend:

npm start

By default, the React app runs on port 3000. Open http://localhost:3000 in your browser.

### 5. Basic Usage
Customer
Signup via http://localhost:3000/signup
Login via http://localhost:3000/login

Browse restaurants, add items to cart, checkout, manage favorites

### Restaurant
Signup or login at the same URLs but select “restaurant” role
Manage profile, add dishes, view customer orders at http://localhost:3000/restaurant-home
