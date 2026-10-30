// Configuration PM2 — VPS Contabo
module.exports = {
  apps: [
    {
      name: "communaute-bapa",
      cwd: "/var/www/communaute-bapa/current/.next/standalone",
      script: "server.js",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3005,
        HOSTNAME: "127.0.0.1",
      },
      node_args: "--env-file=/var/www/communaute-bapa/shared/.env",
      out_file: "/var/log/communaute-bapa/out.log",
      error_file: "/var/log/communaute-bapa/error.log",
      time: true,
    },
  ],
}
