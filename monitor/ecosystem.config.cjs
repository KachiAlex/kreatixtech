module.exports = {
  apps: [{
    name: 'kreatix-monitor',
    script: 'server.js',
    cwd: '/opt/kreatix-monitor',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5101,
      CHECK_INTERVAL: 60000,
      DB_PATH: '/opt/kreatix-monitor/health.db',
    },
    error_file: '/opt/kreatix-monitor/logs/err.log',
    out_file: '/opt/kreatix-monitor/logs/out.log',
    max_restarts: 10,
    restart_delay: 5000,
  }],
};
