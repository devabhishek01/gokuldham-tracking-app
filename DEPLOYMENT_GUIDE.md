# 🚀 ResqTrack CRM & Vehicle Tracking Management System - Production Go-Live Deployment Guide

This guide provides step-by-step instructions to deploy **ResqTrack CRM** and the **24/7 Background GPS Collector Daemon** on an Ubuntu 22.04 / 24.04 LTS Cloud VPS (DigitalOcean, AWS EC2, Linode, Hostinger VPS, or Hetzner).

---

## 📌 System Architecture Overview

```
                        +-----------------------------------+
                        |   User Browser / Mobile Client    |
                        +-----------------------------------+
                                          |
                                    HTTPS / WSS (Port 443)
                                          v
                        +-----------------------------------+
                        |       Nginx Reverse Proxy         |
                        |      (SSL Let's Encrypt)          |
                        +-----------------------------------+
                                          |
                                          v
                        +-----------------------------------+
                        |        PM2 Process Manager        |
                        |                                   |
                        |  +-----------------------------+  |
                        |  | resqtrack-web (Port 3000)   |  |
                        |  +-----------------------------+  |
                        |  | resqtrack-gps-daemon (24/7) |  |
                        |  +-----------------------------+  |
                        +-----------------------------------+
                                    |              |
                Fetch GPS API Telemetry            SQL Queries
                                    v              v
                        +-----------------------------------+
                        |   PostgreSQL Production Database  |
                        |            (resqtrack)            |
                        +-----------------------------------+
```

---

## 📋 Recommended Server Specifications

- **OS**: Ubuntu 22.04 LTS or Ubuntu 24.04 LTS (64-bit)
- **CPU**: 2 vCPUs
- **RAM**: 2 GB RAM (minimum) / 4 GB RAM (recommended)
- **Disk**: 25 GB SSD
- **Domain**: A registered domain pointing `A Record` to your server's IP (e.g. `tracking.yourdomain.com`).

---

## 🛠️ Step 1: VPS Security & Firewall Setup

Log into your VPS server via SSH:

```bash
ssh root@YOUR_SERVER_IP
```

Update system packages and setup UFW firewall:

```bash
sudo apt update && sudo apt upgrade -y
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 📦 Step 2: Install Node.js 20 LTS, PostgreSQL & Nginx

### 1. Install Node.js 20 LTS:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git build-essential
node -v # Verify version (v20.x.x)
```

### 2. Install PM2 Process Manager:

```bash
sudo npm install -g pm2
```

### 3. Install Nginx Web Server:

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 4. Install PostgreSQL Server (Skip if using Cloud DB like Neon/Supabase):

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

---

## 🗄️ Step 3: Production PostgreSQL Database Setup

Create database user and database:

```bash
sudo -u postgres psql
```

Inside the PostgreSQL terminal, execute:

```sql
CREATE DATABASE resqtrack;
CREATE USER resq_admin WITH PASSWORD 'YourStrongPassword123!';
GRANT ALL PRIVILEGES ON DATABASE resqtrack TO resq_admin;
ALTER DATABASE resqtrack OWNER TO resq_admin;
\q
```

---

## 📁 Step 4: Deploy Project Codebase

### 1. Clone repository into `/var/www/`:

```bash
cd /var/www
sudo git clone https://github.com/your-username/tracking-crm.git tracking-crm
cd tracking-crm
sudo chown -R $USER:$USER /var/www/tracking-crm
```

### 2. Install Node dependencies:

```bash
npm install
```

### 3. Setup Production Environment Variables (`.env.production`):

```bash
cp .env.production.example .env.production
nano .env.production
```

Update the values inside `.env.production`:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://resq_admin:YourStrongPassword123!@localhost:5432/resqtrack
JWT_SECRET=generate_a_random_64_character_string_here
MILLITRACK_EMAIL=your_gps_username
MILLITRACK_PASSWORD=your_gps_password
GPS_POLL_INTERVAL_MS=10000
```

### 4. Initialize Database Tables & Seed Data:

```bash
node scripts/init-db.js
```

### 5. Build Next.js Production App:

```bash
npm run build
```

---

## ⚙️ Step 5: Start PM2 Web App & 24/7 GPS Daemon

Create `logs` directory for PM2 logging:

```bash
mkdir -p logs
```

Start both **Next.js Web App** and **24/7 Background GPS Daemon** using `ecosystem.config.js`:

```bash
pm2 start ecosystem.config.js
```

Check status and verify both services are online:

```bash
pm2 status
```

Output should show:
- `resqtrack-web` : `online`
- `resqtrack-gps-daemon` : `online`

### Configure PM2 Auto-Start on Server Reboot:

```bash
pm2 save
pm2 startup
```

*(Copy and execute the command printed by `pm2 startup`).*

---

## 🌐 Step 6: Configure Nginx & Let's Encrypt SSL

### 1. Create Nginx Site Configuration:

```bash
sudo cp nginx.conf.example /etc/nginx/sites-available/resqtrack
sudo nano /etc/nginx/sites-available/resqtrack
```

*Replace `tracking.yourdomain.com` with your actual domain name.*

### 2. Enable Nginx Site:

```bash
sudo ln -s /etc/nginx/sites-available/resqtrack /etc/nginx/sites-enabled/
sudo nginx -t # Verify syntax is OK
sudo systemctl reload nginx
```

### 3. Generate Free SSL Certificate (HTTPS):

```bash
sudo certbot --nginx -d tracking.yourdomain.com
```

Select option `2` to redirect HTTP traffic to HTTPS.

---

## 📊 Step 7: Monitoring & Useful Maintenance Commands

### Check Live GPS Daemon Logs:

```bash
pm2 logs resqtrack-gps-daemon --lines 50
```

### Check Web Server Logs:

```bash
pm2 logs resqtrack-web --lines 50
```

### Restart Application Services:

```bash
pm2 restart ecosystem.config.js
```

### Database Backup Command (Daily Cron Job):

```bash
pg_dump -U resq_admin -d resqtrack | gzip > /var/backups/resqtrack_$(date +%Y%m%d).sql.gz
```

---

## 💡 Troubleshooting Checklist

- **GPS Points Not Updating**: Run `pm2 logs resqtrack-gps-daemon` and check if `MILLITRACK_EMAIL` or `MILLITRACK_PASSWORD` credentials are valid.
- **Database Connection Error**: Ensure PostgreSQL service is active (`sudo systemctl status postgresql`) and `DATABASE_URL` credentials in `.env.production` are correct.
- **Port 3000 In Use**: Check process using port 3000 with `sudo lsof -i :3000`.

---

🎉 **Congratulations! Your ResqTrack CRM & 24/7 Vehicle Tracking System is now LIVE and fully operational.**
