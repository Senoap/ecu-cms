// ecosystem.config.cjs
// Konfigurasi PM2 Process Manager untuk ESU Company (Next.js 16)
// Menggunakan single-instance fork mode demi konsistensi in-memory rate limiting.

module.exports = {
  apps: [
    {
      name: 'esu-company',
      cwd: '/var/www/esu-company/current',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -H 127.0.0.1 -p 3000',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '900M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/pm2-esu-error.log',
      out_file: '/var/log/pm2-esu-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      min_uptime: '10s',
      max_restarts: 10,
    },
  ],
}
