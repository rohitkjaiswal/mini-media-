import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    base: "/mini-media-/", // ✅ VERY IMPORTANT
    server: {
        watch: {
            usePolling: true,
        },
    },
});