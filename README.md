# 🚀 myTA Project

This repo documents how I built and deployed the **myTA** project step by step.  
It covers **local setup → Dockerization → database integration (Redis + Postgres) → Terraform infra → Jenkins pipeline**.

---

## 🔹 Local Setup
- Cloned repo, renamed to `myTA`
- Added `.gitignore`  
- Installed dependencies with `npm install`  
- Verified app runs on `http://localhost:3000`

---

## 🔹 Dockerization
- Wrote a **Dockerfile** to containerize Node.js app  
- Created **docker-compose.yml** to map ports and mount volumes  
- Added **.dockerignore** to keep image clean  
- Wrote **ci.sh** script to simulate a mini CI pipeline (lint → test → build → run)  

✅ Ran app at `http://localhost:3001`

**Issues & Fixes**
- Port conflict → mapped `3001:3000`  
- ESLint error → skipped lint if no config  
- Docker Compose warning → removed `version` key  

---

## 🔹 Database Integration
- Added **Redis** (for caching/session) via Docker container on port 6379  
- Added **Postgres** (for persistent data) via Docker with volume mapping  

✅ Connected Node.js app to both Redis + Postgres  

**Issues & Fixes**
- Redis wasn’t persisting → solved by adding a Docker volume  
- Postgres connection refused → fixed by exposing correct port + updating env vars  

---

## 🔹 Infrastructure (Terraform)
Defined AWS infra (structure only, no AWS account used):  
- **EC2 app instance** → runs Node.js app in Docker  
- **EC2 Redis instance** → runs Redis container  
- **EC2 Postgres instance** → runs Postgres container  

Outputs return public IPs of each service.  

---

## 🔹 CI/CD (Jenkins)
Added `Jenkinsfile` with stages:  
1. **Clone Repo**  
2. **Build Docker image**  
3. **Run Containers with docker-compose**  
4. **Test App Health** (curl request)  

✅ Pipeline automated app build + deploy.  

---

## 🔹 Problems I Faced
- **Duplicate Terraform variables** → solved by cleaning `variables.tf`  
- **Node.js Docker build timeout** → solved by checking network & retrying  
- **Nothing on port 3000** → fixed by mapping to 3001 and using `docker ps` logs  

---

## 📌 Current Status
- Local app works  
- Docker & Docker Compose fully running  
- Redis & Postgres integrated  
- Terraform infra defined  
- Jenkins pipeline automated build & deploy  
