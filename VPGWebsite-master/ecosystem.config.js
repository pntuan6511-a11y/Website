module.exports = {
    apps: [
        {
            name: 'vpg-website',
            script: 'node_modules/next/dist/bin/next',
            args: 'start',
            cwd: './',
            instances: 1, // Only 1 instance for 1vCPU
            exec_mode: 'cluster',
            watch: false,
            max_memory_restart: '1500M', // Restart if memory exceeds 1.5GB (leave 500MB for system)
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
            error_file: './logs/err.log',
            out_file: './logs/out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            autorestart: true,
            max_restarts: 10,
            min_uptime: '10s',
            listen_timeout: 10000,
            kill_timeout: 5000,
        },
    ],
};
