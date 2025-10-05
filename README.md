# ddac_group3

# 🩸 Cloud-Based Blood Bank Management System

A cloud-hosted web application designed to connect **donors**, **patients**, and **hospitals** in real-time to ensure immediate blood availability during emergencies.  
This system was developed for the **CT071-3-3 Designing and Developing Cloud Applications (DDAC)** module at **Asia Pacific University (APU)**.

---

## 🏥 Project Overview

Blood shortages and delays in locating compatible donors often result in life-threatening situations.  
This system addresses that problem by creating a digital bridge between **donors**, **patients**, and **blood banks**, ensuring efficient matching and tracking of blood supplies through a cloud-based infrastructure.

### 🎯 Objectives
- Enable hospitals to **manage and monitor** blood inventory efficiently.  
- Allow donors to **register and donate blood** conveniently.  
- Let patients **request and track** blood availability in real-time.  
- Integrate **AWS Cloud Services** for scalability, monitoring, and high availability.  
- Automate deployment through **GitHub Actions** to reduce manual workload.

---

## 👥 User Roles & Key Features

| Role | Features |
|------|-----------|
| 🩸 **Donor** | Register, update blood type/location, donate requests, receive urgent alerts, view donation history. |
| 🧍‍♀️ **Patient** | Register, request blood by type and urgency, track status, receive notifications when a match is found. |
| 🏥 **Hospital (Blood Bank Staff)** | Manage inventory, approve donor/patient requests, generate stock and usage reports. |
| ⚙️ **Admin** | Manage user permissions, monitor system performance, view analytics dashboards. |

---

## 🧰 Tech Stack

| Layer | Technology |
|--------|-------------|
| **Frontend** | ReactJS + Tailwind CSS |
| **Backend** | ASP.NET (C#) |
| **Database** | Amazon RDS (Relational) + DynamoDB (NoSQL) |
| **Storage** | Amazon S3 |
| **Authentication** | Amazon Cognito |
| **Security** | AWS WAF, IAM, KMS, CloudTrail |
| **Notifications** | Amazon SNS |
| **Monitoring** | Amazon CloudWatch |
| **Analytics** | Amazon QuickSight |
| **CI/CD** | GitHub Actions |
| **Hosting** | Amazon EC2 / Elastic Beanstalk |

---

## 🧩 System Architecture

### 🏗️ **Phase 1 (Task #1 – Server-Based Architecture)**
- Frontend and backend deployed on **AWS EC2** (or Elastic Beanstalk).
- Database hosted on **Amazon RDS**.
- Version control and CI/CD managed via **GitHub Actions** for automatic synchronization.

### ☁️ **Phase 2 (Task #2 – Serverless Extension)**
- Integration of **AWS Lambda**, **API Gateway**, and **SNS/S3** for event-driven automation.
- Real-time monitoring via **CloudWatch** and performance analytics via **QuickSight**.

---

## ⚙️ Repository Structure

```
blood-bank-management-system/
│
├── frontend/ # ReactJS + Tailwind CSS source code
│ ├── src/
│ ├── public/
│ └── package.json
│
├── backend/ # ASP.NET backend logic (C#)
│ ├── Controllers/
│ ├── Models/
│ ├── Views/
│ ├── appsettings.json
│ └── Program.cs
│
├── .github/ # GitHub Actions CI/CD workflow
│ └── workflows/
│ └── deploy.yml
│
├── docs/ # Documentation, diagrams, and reports
│ └── architecture-diagram.png
│
├── .gitignore
├── README.md
└── LICENSE (optional)
```

---

## 🚀 Continuous Deployment (GitHub Actions)

Every time new code is pushed to the `main` branch:
1. GitHub Actions automatically triggers a workflow.
2. The EC2 instance pulls the latest code and rebuilds the application.
3. Containers restart with the updated version — **no manual intervention needed.**

---

## 🧑‍💻 Contributors

| Name        | Role                                  | TP Number |
| ----------- | ------------------------------------- | --------- |
| [Your Name] | Project Lead / Admin                  | TPXXXXXX  |
| [Member 2]  | Frontend Developer (Donor/Patient UI) | TPXXXXXX  |
| [Member 3]  | Backend Developer (Hospital/Admin)    | TPXXXXXX  |
| [Member 4]  | AWS Integration & CI/CD Engineer      | TPXXXXXX  |

---

🌐 Deployment Details

- Deployed URL: 
- Frontend Port: 
- Backend Port: 
- Database: Amazon RDS (MySQL)
