# 📁 Workspace Separation Guide

## 🎯 **Separate Workspace Setup**

You can run these as completely separate workspaces:

### **Workspace 1: BUAS Flask Server**
```
BUAS/
├── app/
│   ├── __init__.py
│   ├── routes.py      # Phone API endpoints
│   ├── models.py      # Database models
│   └── tasks.py
├── server.py          # Flask server entry point
├── requirements.txt   # Flask dependencies
└── start-flask-server.sh
```

**To run Flask server independently:**
```bash
cd BUAS
bash start-flask-server.sh
# or
python3 server.py
```

### **Workspace 2: BUAS-Dashboard**
```
BUAS-Dashboard/
├── backend/           # FastAPI server
├── frontend/          # React dashboard
├── ecosystem.config.js # PM2 configuration
└── start-dashboard-only.sh
```

**To run Dashboard independently:**
```bash
cd BUAS-Dashboard
bash start-dashboard-only.sh
# or
pm2 start ecosystem.config.js --only phone-dashboard-fastapi,phone-dashboard-frontend
```

## 🔄 **How They Communicate**

```
📱 Phone App → Flask Server (BUAS workspace)
                     ↓ HTTP API
🖥️ Dashboard ← React Frontend ← FastAPI Server (Dashboard workspace)
```

- **Flask Server** runs on port 5000
- **FastAPI Server** runs on port 8000  
- **React Frontend** runs on port 3000
- Communication is via HTTP requests (no file dependencies)

## ✅ **Benefits of Separation**

1. **Independent Development** - Teams can work on each part separately
2. **Independent Deployment** - Deploy Flask and Dashboard to different servers
3. **Scalability** - Scale each service independently
4. **Technology Isolation** - Different Python environments/versions

## 🚀 **Deployment Options**

### **Option A: Same Server**
```bash
# On VPS:
cd /path/to/BUAS && python3 server.py &
cd /path/to/BUAS-Dashboard && pm2 start ecosystem.config.js
```

### **Option B: Different Servers**
```bash
# Server 1 (Flask):
cd BUAS && python3 server.py

# Server 2 (Dashboard):
cd BUAS-Dashboard && pm2 start ecosystem.config.js
```

Just update the frontend API URL to point to the Flask server's IP.

## 🎯 **Current Configuration**

Both workspaces are already configured to work with:
- **VPS IP**: 143.244.133.125
- **Authentication**: admin:supersecret
- **CORS**: Configured for cross-origin requests

The separation is clean and ready to use! 🚀
