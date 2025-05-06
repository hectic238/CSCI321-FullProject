# PlanIt - Local Event Planner and Finder

PlanIt is a modern web application that allows users to create, explore, and manage local events.  
The application consists of a **React frontend** hosted on **AWS Amplify**, and a **serverless backend** powered by **AWS Lambda**, **API Gateway**, **DynamoDB**, and **AWS Cognito** for authentication.

---

## 📌 Prerequisites

Before running the project locally, ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

---

## 🏃 Running the Project Locally

You can easily run the frontend locally for development.

### Steps:

1. Clone the repository.
2. Open a terminal and navigate to the project’s root folder.
3. Install the project dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:

   ```
   http://localhost:5173/home
   ```

> ⚡ The backend (API and database) are already deployed in AWS, so no backend setup is needed for local development.

---

## 🚀 Production Deployment

- The production frontend is hosted via **AWS Amplify**.
- The project follows a **CI/CD pipeline**:
  - **CI**: GitHub Actions — when changes are pushed to the `AWS-Production` branch.
  - **CD**: AWS Amplify automatically deploys the latest version, ensuring continuous delivery and **100% uptime**.

---

## 🔑 Security Considerations

- All sensitive information (such as API keys, Cognito details, etc.) are stored securely in environment variables.
- The production website uses HTTPS automatically through AWS Amplify with trusted SSL certificates.
- User authentication is handled through **AWS Cognito**, ensuring secure and scalable user management.

---
