# Spin & Win Wheel Full Stack Application

## Overview
A production-ready Spin & Win Wheel application covering functionality for:
- **Customers:** Mobile-first spin experience with weighted probabilities.
- **Admins:** Comprehensive dashboard for managing campaigns, offers, and users.

## Quick Start

1.  **Start Services**:
    ```bash
    docker-compose up --build
    ```

2.  **Seed Database** (Important):
    ```bash
    # Open a new terminal
    docker exec -it spin_wheel_backend npm run seed
    ```

3.  **Access Application**:
    - **Customer Link**: [http://localhost/spin/salon-fest-9Ax3W](http://localhost/spin/salon-fest-9Ax3W)
    - **Admin Panel**: [http://localhost/admin/login](http://localhost/admin/login)

## Default Credentials

- **Super Admin**: `admin` / `Admin@123`
- **Campaign Manager**: `manager` / `Manager@123`
- **Analyst**: `analyst` / `Analyst@123`

## Tech Stack

- **Backend**: Node.js, Express, Prisma, PostgreSQL
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **DevOps**: Docker, Nginx

## Features

- **RBAC**: Multi-role admin access.
- **Analytics**: Charts and CSV Export.
- **Security**: Rate limiting, Input validation.
- **Scalability**: Dockerized environment.
