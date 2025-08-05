module.exports = {
  apps: [{
    name: 'phone-dashboard-api',
    script: 'uvicorn',
    args: 'main:app --host 0.0.0.0 --port 8000',
    cwd: './backend',
    interpreter: './venv/bin/python',
    env: {
      PYTHONPATH: './backend'
    }
  }]
}