module.exports = {
  apps: [
    {
      name: "resqtrack-web",
      script: "npm",
      args: "run start",
      cwd: "./",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/web-error.log",
      out_file: "./logs/web-out.log",
      combine_logs: true,
    },
    {
      name: "resqtrack-gps-daemon",
      script: "scripts/gps-daemon.js",
      cwd: "./",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        GPS_POLL_INTERVAL_MS: "10000",
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/daemon-error.log",
      out_file: "./logs/daemon-out.log",
      combine_logs: true,
    },
  ],
};
