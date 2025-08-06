module.exports = {
  apps: [{
    name: 'phone-dashboard-fastapi',
    script: 'uvicorn',
    args: 'main:app --host 0.0.0.0 --port 8000 --reload',
    cwd: './backend',
    interpreter: 'python3',
    env: {
      PYTHONPATH: './backend',
      DATABASE_URL: process.env.DATABASE_URL || 'sqlite:///./phone_monitoring.db',
      HOST: '0.0.0.0',
      PORT: '8000'
    },
    env_production: {
      PYTHONPATH: './backend',
      DATABASE_URL: process.env.DATABASE_URL,
      HOST: '0.0.0.0',
      PORT: '8000',
      DEBUG: 'false'
    }
  }, {
    name: 'phone-dashboard-frontend',
    script: 'serve',
    args: '-s build -l 3000',
    cwd: './frontend',
    env: {
      REACT_APP_API_URL: 'http://143.244.133.125:5000' // Points to Flask server
    }
  }]
  // Note: Flask server should be started separately from BUAS workspace
  // Start Flask first: cd ../BUAS && python3 server.py
}