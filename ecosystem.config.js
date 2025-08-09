module.exports = {
  apps: [{
    name: 'phone-dashboard-frontend',
    script: 'npx',
    args: 'serve -s build -l 3000 --host 0.0.0.0',
    cwd: '/root/BUAS-Dashboard/frontend',
    env: {
      NODE_ENV: 'production',
      REACT_APP_API_URL: 'http://127.0.0.1:5000'  // Use localhost to avoid DNS issues
    },
    env_production: {
      NODE_ENV: 'production', 
      REACT_APP_API_URL: 'http://127.0.0.1:5000'  // Use localhost to avoid DNS issues
    },
    error_file: '/var/log/pm2/frontend-error.log',
    out_file: '/var/log/pm2/frontend-out.log',
    log_file: '/var/log/pm2/frontend.log',
    max_restarts: 3,
    restart_delay: 5000
  }]
};