# 🚀 Production Deployment & Administration Guide

This guide provides step-by-step instructions for deploying and configuring **Momentum Learning** in production environments.

---

## 📌 Prerequisites & Environment Setup

### System Requirements
- **Operating System**: Ubuntu 22.04 LTS or higher / Debian 12 / RHEL 9
- **CPU / RAM**: Minimum 2 VCPU, 4GB RAM (8GB recommended for concurrent users)
- **Disk Space**: 20GB+ SSD storage (accounting for DB byte blobs)
- **Software Installed**:
  - OpenJDK 21
  - MySQL Server 8.0+
  - Node.js 18+ & npm
  - Nginx (Web Server & Reverse Proxy)
  - Certbot (Let's Encrypt SSL/TLS certificates)

---

## 🗄️ 1. Production MySQL Database Setup

1. Log in to MySQL server:
   ```bash
   sudo mysql -u root -p
   ```

2. Create production database and dedicated application database user:
   ```sql
   CREATE DATABASE momentum_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   
   CREATE USER 'momentum_user'@'localhost' IDENTIFIED BY 'STRONG_PRODUCTION_PASSWORD_HERE';
   
   GRANT ALL PRIVILEGES ON momentum_prod.* TO 'momentum_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. Optimize MySQL max packet size for binary blob uploads (in `/etc/mysql/mysql.conf.d/mysqld.cnf`):
   ```ini
   [mysqld]
   max_allowed_packet=32M
   ```

---

## ☕ 2. Backend Build & Deployment (Spring Boot)

### 2.1 Package Application
Navigate to the `backend/` directory and create an optimized executable JAR:
```bash
cd backend
mvn clean package -DskipTests
```
The compiled JAR artifact will be created at `target/mementum-0.0.1-SNAPSHOT.jar`.

---

### 2.2 Configure Production Environment Variables
Create a deployment environment configuration file (e.g. `/etc/momentum/backend.env`):
```env
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/momentum_prod?useSSL=true&requireSSL=false
SPRING_DATASOURCE_USERNAME=momentum_user
SPRING_DATASOURCE_PASSWORD=STRONG_PRODUCTION_PASSWORD_HERE
APP_JWT_SECRET=c3VwZXItc2VjcmV0LTI1Ni1iaXQtcHJvZHVjdGlvbi1rZXktZm9yLW1vbWVudHVtLWxlYXJuaW5n
APP_JWT_EXPIRATION_MS=86400000
SERVER_PORT=8080
```

---

### 2.3 Systemd Service Configuration
Create a Linux systemd service file at `/etc/systemd/system/momentum-backend.service`:

```ini
[Unit]
Description=Momentum Learning Backend Spring Boot Service
After=syslog.target network.target mysql.service

[Service]
User=www-data
Group=www-data
EnvironmentFile=/etc/momentum/backend.env
ExecStart=/usr/bin/java -Xms512m -Xmx2048m -jar /var/www/momentum/mementum-0.0.1-SNAPSHOT.jar
SuccessExitStatus=143
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable momentum-backend
sudo systemctl start momentum-backend
sudo systemctl status momentum-backend
```

---

## 🌐 3. Frontend Build & Nginx Deployment (React)

### 3.1 Build Production Bundle
Navigate to the `frontend/` directory and run the Vite production build script:
```bash
cd frontend
npm install
npm run build
```
This produces static assets in the `frontend/dist` directory. Copy these files to your Web Root (e.g., `/var/www/momentum/frontend`).

---

### 3.2 Configure Nginx Reverse Proxy & Static Hosting
Create an Nginx configuration file at `/etc/nginx/sites-available/momentum.conf`:

```nginx
server {
    listen 80;
    server_name momentum.example.com;

    # Static Frontend SPA
    root /var/www/momentum/frontend;
    index index.html;

    # Client-side routing support (SPA fallback)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy REST API requests to Spring Boot
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # File upload limits
        client_max_body_size 25M;
    }

    # Enable Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

Enable the site configuration and test Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/momentum.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### 3.3 Enable SSL/TLS Encryption with Certbot
Secure your application domain with HTTPS:
```bash
sudo certbot --nginx -d momentum.example.com
```

---

## 🔒 4. Production Security Hardening

1. **Replace Default JWT Secret**: Never run production with default credentials. Use a cryptographically secure 256-bit base64 secret string.
2. **Restrict CORS**: In `CorsConfig.java`, specify explicit allowed origins (e.g. `https://momentum.example.com`) rather than wildcards (`*`).
3. **Database Credentials**: Store sensitive database credentials in system environment variables or cloud key vaults (AWS Secrets Manager, HashiCorp Vault).
4. **Disable DDL Auto Update**: Set `spring.jpa.hibernate.ddl-auto=validate` or `none` in production, using database migration tools like Flyway or Liquibase.

---

## 📈 5. Monitoring & Maintenance

- **Inspect Backend Logs**:
  ```bash
  journalctl -u momentum-backend -f --output=cat
  ```
- **Nginx Access & Error Logs**:
  ```bash
  tail -f /var/log/nginx/error.log
  ```
- **Database Backup Cron**:
  ```bash
  0 2 * * * mysqldump -u momentum_user -p'PASSWORD' momentum_prod | gzip > /backups/momentum_$(date +\%F).sql.gz
  ```
