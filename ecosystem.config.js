module.exports = {
  apps: [
    {
      name: 'citi-frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3050,
        NEXT_PUBLIC_API_URL: 'https://banking.scnfinc.com/api'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'citi-backend',
      script: 'server.js',
      cwd: './backend',
      env: {
        NODE_ENV: 'production',
        PORT: 5050,
        CORS_ORIGIN: 'https://banking.scnfinc.com'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M'
    }
  ]
}
