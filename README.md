# Medisure - Healthcare Subscription & Consultation Platform

[![.NET 8](https://img.shields.io/badge/.NET_8-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/features/actions)

A comprehensive, full-stack healthcare platform developed to simulate the process of browsing, comparing, and purchasing medical insurance packages. Built with a modern tech stack focusing on performance, real-time communication, and strict security standards.

> **Note on Project Origin:** This platform was developed as an Engineering Thesis project in a 4-person team.
> **My Role:** Lead Fullstack Developer. I was solely responsible for 100% of the codebase, including software architecture, backend (.NET 8), frontend (React/TS), and DevOps (Docker, CI/CD). Other team members handled research, manual testing, and documentation.

## Key Features

* **Real-Time Consultations:** Integrated `SignalR` (WebSockets) for instant, two-way chat between patients and medical staff, featuring concurrent connection management and hybrid guest/registered user support.
* **Advanced Pricing Engine:** A dynamic, client-and-server-validated calculator that adjusts insurance premiums in real-time based on progressive actuarial risk factors (e.g., patient age).
* **Robust Security & Auth:** * Stateless `JWT` authentication.
    * Multi-Factor Authentication (`2FA` / TOTP).
    * Strict Role-Based Access Control (`RBAC`) with SuperAdmin, Admin, and User hierarchies.
    * Protection against Brute-Force attacks and Insecure Direct Object References (`IDOR`).
* **Client-Side Document Generation:** On-demand generation of medical certificates and policies in PDF format directly in the browser using `jsPDF` to offload server resources.
* **Smart UI/UX:** Optimistic UI updates, custom-built toast notification system, background data polling for system alerts, and deep linking for seamless navigation.

##  Screenshots

<img width="2505" height="1285" alt="image" src="https://github.com/user-attachments/assets/30420d36-cd5e-4269-a179-de0efd639530" />

<img width="2507" height="1293" alt="image" src="https://github.com/user-attachments/assets/a1e5bbe6-5b9f-4daa-a138-12c18bbf9c39" />

<img width="2504" height="1289" alt="image" src="https://github.com/user-attachments/assets/8804797b-74d7-4690-8919-2bec75c609a6" />

<img width="2506" height="1294" alt="image" src="https://github.com/user-attachments/assets/e0a80bf5-bb09-49d8-9b3b-5c873b4b36bb" />

<img width="2505" height="1200" alt="image" src="https://github.com/user-attachments/assets/07586419-75d2-448b-8181-88d3caad9f7a" />

<img width="2506" height="1290" alt="image" src="https://github.com/user-attachments/assets/149a8bf9-eb2f-4562-bef0-ecb170073be2" />

<img width="2508" height="1093" alt="image" src="https://github.com/user-attachments/assets/abbad031-0c90-486f-8500-c1618e27ee45" />

<img width="2507" height="1291" alt="image" src="https://github.com/user-attachments/assets/c9d533ab-c639-43c6-8558-a67368a5e154" />

<img width="2521" height="1288" alt="image" src="https://github.com/user-attachments/assets/b9a89916-351c-4efd-8cc0-f0077719209f" />

<img width="2510" height="1295" alt="image" src="https://github.com/user-attachments/assets/849bcdf6-75df-4c71-ace5-47b1b37c7fb5" />

<img width="2495" height="1289" alt="image" src="https://github.com/user-attachments/assets/ab33c498-2513-4471-9132-fd5824a0558d" />

<img width="2489" height="1282" alt="image" src="https://github.com/user-attachments/assets/cfae03cf-1fb2-428b-a76f-21f1994324ad" />

<img width="2503" height="1295" alt="image" src="https://github.com/user-attachments/assets/7e909c3a-cc0b-4e1f-8459-d4f75fab5219" />

<img width="2508" height="1292" alt="image" src="https://github.com/user-attachments/assets/176e6230-6d86-41d8-8883-e2fbd7895741" />

<img width="2504" height="1286" alt="image" src="https://github.com/user-attachments/assets/266f2a81-2233-40d1-b608-8b76c1893af2" />

<img width="2504" height="1286" alt="image" src="https://github.com/user-attachments/assets/c139c835-d96c-4d3c-adcd-d645ce33ced1" />

<img width="2521" height="1291" alt="image" src="https://github.com/user-attachments/assets/570f417f-6d1a-4d46-8c47-6f18134e4e9a" />

<img width="2501" height="1288" alt="image" src="https://github.com/user-attachments/assets/3806d215-9d3a-4f4c-bf72-8407ea04b128" />

<img width="2501" height="1287" alt="image" src="https://github.com/user-attachments/assets/2a372d99-cce4-4d07-a087-bbc65f9bbf9c" />

<img width="1247" height="1232" alt="image" src="https://github.com/user-attachments/assets/2541cb9a-6fe5-4941-bbc1-41b935ce2f3f" />

<img width="1217" height="1254" alt="image" src="https://github.com/user-attachments/assets/3900f6d1-69d5-4737-9ecd-f3d70fd3cf42" />

<img width="1226" height="988" alt="image" src="https://github.com/user-attachments/assets/a85e7b32-eef4-4a14-900f-e9578f9a39d5" />

##  Tech Stack & Architecture

The application follows the **Clean Architecture** pattern (Majestic Monolith) separating the domain logic from infrastructure and presentation layers.

* **Backend:** C#, .NET 8 (ASP.NET Core Web API)
* **Frontend:** React, TypeScript, Tailwind CSS, Vite
* **Database:** PostgreSQL, Entity Framework Core (Code-First)
* **Real-Time:** SignalR (WebSockets)
* **DevOps & Infrastructure:** Docker, Docker Compose, GitHub Actions (CI/CD Pipelines)
* **Logging:** Serilog integrated with Seq for structured audit trails.

##  Database & Concurrency

* **Relational Integrity:** Complex many-to-many relationships utilizing pivot tables (e.g., UserPackages) to ensure historical data snapshotting (maintaining purchase prices independently of current catalog prices).
* **Performance:** Extensive use of `.AsNoTracking()` for read-heavy operations and raw SQL batch operations for massive system notifications.

## Local Setup

The entire environment is containerized. To run the project locally:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/kuben75/Medisure-Healthcare-Platform.git](https://github.com/kuben75/Medisure-Healthcare-Platform.git)
   cd Medisure-Healthcare-Platform
   ```
2. **Configure environment variables:**
   Copy the `.env.example` file to `.env` and `.appsettings.example.json` to `appsettings.json` in the backend directory, then adjust any necessary values (e.g., database connection strings, JWT secrets)
3. **Spin up the environment:**
   Make sure you have Docker Desktop running, then execute:
    ```bash
    docker-compose up --build
    ```
   This command will automatically build the React frontend, the .NET backend, spin up the PostgreSQL database, apply Entity Framework migrations, and seed initial dummy data (including the SuperAdmin account).
4. **Access the application:**
   - Frontend / public view: `http://localhost:3000`
   - Backend API / Swagger: `http://localhost:8080/swagger`
   - Seq Dashboard: `http://localhost:5341`

5. **Admin Credentials:**
   - Email: `admin@admin.com`
   - Password: `Admin123!`
