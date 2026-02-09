import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@lego': path.resolve(__dirname, '../Philips-oneblade/Lego-Modules/nablon-lego-ux/src'),
        },
    },
    optimizeDeps: {
        include: ['date-fns', 'lucide-react', 'clsx', 'react-force-graph-2d'],
    },
    server: {
        port: 3000,
        fs: {
            allow: ['..'], // Allow access to parent directory for Lego modules
        },
    },
});
