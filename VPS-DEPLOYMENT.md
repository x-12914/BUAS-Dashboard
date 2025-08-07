# VPS Deployment Guide

## Quick Fix for Dashboard Not Reflecting Data

The issue was that FastAPI backend was running locally while Flask and Frontend were on VPS. This creates a broken connection chain.

## Solution: Deploy FastAPI to VPS

### Step 1: Upload Files to VPS
```bash
# On your local machine, upload the entire project to VPS
scp -r . root@143.244.133.125:/opt/buas-dashboard/
```

### Step 2: Run Deployment Script on VPS
```bash
# SSH into your VPS
ssh root@143.244.133.125

# Navigate to project directory
cd /opt/buas-dashboard

# Make deployment script executable
chmod +x deploy-vps.sh

# Run deployment script
./deploy-vps.sh
```

### Step 3: Configure Database
```bash
# IMPORTANT: Edit the database password in deploy-vps.sh before running
# Replace 'your_secure_password' with a strong password (lines 35, 41, 42)
# For example: 'buas_db_password_2025!'

# Also update the .env.production file with the same password
sed -i 's/your_secure_password/buas_db_password_2025!/g' deploy-vps.sh
sed -i 's/your_secure_password/buas_db_password_2025!/g' .env.production
```

### Step 4: Start Services
```bash
# Start all services
pm2 start ecosystem.config.js --env production

# Start Flask server (from BUAS directory)
cd BUAS
pm2 start "python3 server.py" --name "buas-flask-server"

# Save PM2 configuration
pm2 save
```

### Step 5: Verify Services
```bash
# Check if services are running
pm2 status

# Check logs if there are issues
pm2 logs
```

## Service URLs After Deployment:
- **Frontend**: http://143.244.133.125:3000
- **Flask API**: http://143.244.133.125:5000  
- **FastAPI Backend**: http://143.244.133.125:8000

## Expected Result:
✅ Dashboard should now properly reflect data because all services are on the same VPS and can communicate with each other.

## Troubleshooting:
- If database connection fails, update the DATABASE_URL in .env.production
- If services don't start, check logs with `pm2 logs [service-name]`
- Ensure firewall allows ports 3000, 5000, and 8000
