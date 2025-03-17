# PlanIt - Local Event Planner and Finder

PlanIt is a web-based event planner system that allows users to create, explore, and manage events.  
The application consists of a **React frontend** and an **ASP.NET 8 backend**, using **AWS DynamoDB** for data storage, and Auth0 for authentication.

## 📌 Prerequisites

Ensure you have the following installed:

- [Node.js]
- [npm]
- [.NET 8 SDK]

- [JetBrains Rider] or [Visual Studio] (optional)


## 🏃 Running the Project


🔑🔑  
As this project uses many external api's and applications such as Auth0, AWS, Stripe. We have various secret and access keys used for these
as such we need to protect these keys. To do this we have removed files such as .env. files on the client side, and appsettings files
on the server side. These need to be placed in the root of their respective folders /CSCI321.Server/ and /csci321.client/.

They have been attached along side this project, however they will never be stored in the github to maintain security.  
🔑🔑
### **1️⃣ Backend (ASP.NET 8) & Front End (React)**
#### 🛠️ **Run Project Locally in Command Line**

When the Backend is run locally

#### Make a directory for the self-signed SSL certificate

mkdir "%APPDATA%\ASP.NET\https"  

#### Change Directory to Backend

cd to CSCI321-FullProject\CSCI321.Server  
#### Install dependencies
dotnet restore  
#### Build the project
dotnet build   
#### Start the backend
dotnet run      

#### Visit Website
https://localhost:5173/home

## 🔑  Security Considerations:

During the development and testing phases of this project, the website was accessed using a self-signed SSL certificate, which resulted in a "Not Secure" browser warning. This was a temporary measure to enable HTTPS testing without incurring costs for a trusted certificate.

In a real-world production environment, the following steps would be taken to ensure full SSL security:

Register a custom domain name.

Use AWS Certificate Manager (ACM) to issue a trusted SSL certificate.

Set up an Elastic Load Balancer to terminate SSL at the load balancer level.

These steps would ensure end-to-end encryption, secure connections, and improved user trust.
