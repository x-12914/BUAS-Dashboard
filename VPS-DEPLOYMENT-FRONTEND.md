# VPS Deployment Guide - Frontend Only

## Architecture
The simplified architecture uses only Flask backend with React frontend:

```
React Frontend (VPS:3000) → Flask Backend (VPS:5000) → Database
```

**Note**: This workspace only deploys the React frontend. Flask backend (BUAS) is deployed separately.

## Deployment Steps

### Step 1: Upload Frontend Project
```bash
scp -r . user@143.244.133.125:/opt/buas-dashboard-frontend/
```

### Step 2: SSH and Deploy
```bash
ssh user@143.244.133.125
cd /opt/buas-dashboard-frontend
chmod +x deploy-vps.sh
./deploy-vps.sh
```

### Step 3: Verify Frontend
```bash
pm2 status
# Should show: phone-dashboard-frontend
```

### Step 4: Ensure Flask Backend is Running
Flask backend should already be running from BUAS workspace:
```bash
# Check if Flask is running (from BUAS workspace)
pm2 list | grep flask
```

## Service URLs
- **Frontend Dashboard**: http://143.244.133.125:3000
- **Flask API**: http://143.244.133.125:5000

## Testing

### Test Frontend
```bash
curl http://143.244.133.125:3000
# Should return HTML content
```

### Test Flask API Connection
```bash
curl -u admin:supersecret http://143.244.133.125:5000/api/dashboard-data
# Should return JSON data
```

## Troubleshooting

### Frontend not loading
```bash
pm2 logs phone-dashboard-frontend
# Check for build errors or port conflicts
```

### API connection issues
- Verify Flask backend is running on port 5000
- Check firewall allows port 5000 and 3000
- Verify frontend is pointing to correct Flask URL

## File Structure (After Deployment)
```
/opt/buas-dashboard-frontend/
├── frontend/build/        # Built React app
├── ecosystem.config.js    # PM2 config (frontend only)
└── deploy-vps.sh         # Deployment script
```

**Important**: Flask backend (BUAS) should be deployed separately from its own workspace to ensure proper separation of concerns.
