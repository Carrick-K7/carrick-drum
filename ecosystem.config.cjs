module.exports = {
  apps: [{
    name: 'drum-app',
    cwd: '/root/.openclaw/workspace/projects/drum-app/dist',
    script: 'python3',
    args: '-m http.server 8080 --bind 0.0.0.0',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '200M',
    env: {
      NODE_ENV: 'production'
    },
    log_file: '/tmp/drum-app.log',
    out_file: '/tmp/drum-app-out.log',
    error_file: '/tmp/drum-app-error.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}