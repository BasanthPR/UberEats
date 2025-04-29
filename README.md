# UberEats Clone - Distributed Systems Project

This is an UberEats clone application built with React, Node.js, MongoDB, Docker, Kubernetes, and Kafka. The project is a part of the Distributed Systems course (DATA 236).

## Technologies Used

- **Frontend**: React, Redux, Bootstrap
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Messaging**: Kafka
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **Testing**: JMeter

## Test Accounts

Use these accounts to test the application's features:

### Customer Accounts
- **Email**: customer@test.com
- **Password**: password123

### Restaurant Accounts
- **Pizza Palace**:
  - **Email**: pizza@restaurant.com
  - **Password**: password123

- **Sushi Haven**:
  - **Email**: sushi@restaurant.com
  - **Password**: password123

- **Taco Town**:
  - **Email**: taco@restaurant.com
  - **Password**: password123

- **Mylapore SJ**:
  - **Email**: mylapore@restaurant.com
  - **Password**: password123

## How to Test the Order Flow

1. **Login as a customer** using the customer credentials.
2. Browse to a registered restaurant (Pizza Palace, Sushi Haven, etc.).
3. Add items to your cart and proceed to checkout.
4. After placing the order, you can view it in your orders section.
5. **Login as the restaurant owner** using the corresponding restaurant account.
6. Navigate to the restaurant dashboard and orders section to see incoming orders.
7. Update order statuses as a restaurant owner to see the status change for the customer.

## Project Structure

- `/frontend` - React frontend with Redux for state management
- `/backend` - Node.js Express API server
- `/kubernetes` - Kubernetes deployment configurations
- `/jmeter` - JMeter test plans for performance testing

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- Docker and Docker Compose
- Kubernetes cluster (Minikube for local development)
- Kafka

### Local Development Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd UberEats
```

2. **Set up environment variables**

```bash
# For backend
cp backend/.env.example backend/.env
# Edit the .env file with your configuration
```

3. **Install dependencies**

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

4. **Seed the database**

```bash
cd backend
npm run seed
```

5. **Start the development servers**

```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd frontend
npm start
```

### Docker Setup

```bash
# Build and start all services
docker-compose up --build
```

### Kubernetes Deployment

```bash
# Create namespace
kubectl apply -f kubernetes/namespace.yaml

# Deploy MongoDB
kubectl apply -f kubernetes/mongodb.yaml

# Deploy Kafka and Zookeeper
kubectl apply -f kubernetes/kafka.yaml

# Deploy backend service
kubectl apply -f kubernetes/backend.yaml

# Deploy frontend service
kubectl apply -f kubernetes/frontend.yaml
```

## Features

- User authentication (signup, login, logout)
- Restaurant browsing and searching
- Menu viewing
- Cart management
- Order placement and tracking
- Restaurant and dish rating
- User profiles

## Performance Testing

JMeter tests are available in the `/jmeter` directory. To run the tests:

1. Install Apache JMeter
2. Open the JMeter GUI
3. Load the test plan from `/jmeter/UberEats_TestPlan.jmx`
4. Configure the test parameters as needed
5. Run the test plan

## AWS Deployment

The application can be deployed to AWS using:

- Amazon EKS for Kubernetes orchestration
- Amazon MSK for Kafka
- Amazon DocumentDB for MongoDB
- Amazon S3 for static file storage
- Amazon CloudFront for content delivery

Follow the Kubernetes deployment steps and update the environment variables to point to your AWS resources.

## Project Structure Explanation

### Backend Services

- **Authentication Service**: Manages user authentication and sessions
- **Restaurant Service**: Handles restaurant data and search functionality
- **Order Service**: Processes and tracks orders
- **Notification Service**: Sends notifications via Kafka

### Kafka Topics

- `order-created`: Published when a new order is created
- `order-updated`: Published when an order status is updated
- `restaurant-notification`: Notifications for restaurant owners
- `customer-notification`: Notifications for customers

### Redux State Management

- `auth`: Manages user authentication state
- `restaurants`: Stores restaurant data
- `cart`: Manages shopping cart state
- `orders`: Tracks order status and history 