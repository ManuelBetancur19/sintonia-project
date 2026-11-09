// RESPONSABILIDAD: Configura Vite y el complemento de React para el proyecto.

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
    plugins: [react()],
});