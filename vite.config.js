import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()], // 👈 Add this to enable React plugin
    server: {
        watch: {
            usePolling: true, // 👈 Helpful for hot reload issues (especially on WSL or network FS)
        },
    },
});