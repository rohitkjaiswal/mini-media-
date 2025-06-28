// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    base: './', // ✅ Use relative path for Netlify
    server: {
        watch: {
            usePolling: true,
        },
    },
});