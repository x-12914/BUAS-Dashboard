module.exports = {
  apps: [{
    name: 'phone-dashboard-frontend',
    script: 'serve',
    args: '-s build -l 3000',
    cwd: './frontend',
    env: {
      REACT_APP_API_URL: 'http://143.244.133.125:5000' // Points to Flask server
    },
    env_production: {
      REACT_APP_API_URL: 'http://143.244.133.125:5000' // Points to Flask server
    }
  }]
  // Note: Flask server (BUAS) runs as a separate service from the BUAS workspace
};