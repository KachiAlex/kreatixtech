// PM2 ecosystem for a white-label mail deployment.
// Secrets live in .env files (chmod 600), loaded via node --env-file.
module.exports = {
  apps: [
    {
      name: 'mail-server',
      script: '/opt/mail/server/dist/server.js',
      cwd: '/opt/mail/server',
      interpreter_args: '--env-file=/opt/mail/server/.env',
      env: { PORT: 3020 },
      max_memory_restart: '400M',
      restart_delay: 3000,
    },
    {
      name: 'mail-smtp',
      script: '/opt/mail/smtp-receiver/receiver.mjs',
      cwd: '/opt/mail/smtp-receiver',
      interpreter_args: '--env-file=/opt/mail/smtp-receiver/.env',
      max_memory_restart: '300M',
      restart_delay: 3000,
    },
  ],
};
