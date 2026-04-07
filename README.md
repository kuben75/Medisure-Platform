# Medisure - Healthcare Subscription & Consultation Platform

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

*()*

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