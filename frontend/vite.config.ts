import { defineConfig } from 'vite';
import angular from '@vitejs/plugin-angular'; // If you're using Angular with Vite, adjust if necessary

export default defineConfig({
  plugins: [angular()], // Adjust based on your setup
  optimizeDeps: {
    exclude: ['browser-SJBEN2D6'], // Add the name of the dependency causing the issue
  },
});
