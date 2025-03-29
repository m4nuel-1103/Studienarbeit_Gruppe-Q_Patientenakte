import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());
    return {
        define: {
            "process.env": env
        },
        plugins: [react()],
        server: {
            cors: true,
            // port: 3000,
            proxy: {
                "/api": {
                    target: "http://localhost:3000",
                    changeOrigin: true,
                    secure: false,
                    rewrite: (path) => path.replace(/^\/api/, ""),
                },
            }
        },
    }
})
