import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import maquinasRoutes from './routes/maquinasRoutes.js';
import operariosRoutes from './routes/operariosRoutes.js';
import ubicacionesRoutes from './routes/ubicacionesRoutes.js';
import gastosRoutes from './routes/gastosRoutes.js';
import ingresosRoutes from './routes/ingresosRoutes.js';
import asignacionesRoutes from './routes/asignacionesRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'V&G API is running' });
});

// Test database connection
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'OK', database: 'Connected', time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/maquinas', maquinasRoutes);
app.use('/api/operarios', operariosRoutes);
app.use('/api/ubicaciones', ubicacionesRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/ingresos', ingresosRoutes);
app.use('/api/asignaciones', asignacionesRoutes);
app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/operarios', operariosRoutes);
// app.use('/api/gastos', gastosRoutes);
// app.use('/api/ubicaciones', ubicacionesRoutes);
// app.use('/api/ingresos', ingresosRoutes);
// app.use('/api/nomina', nominaRoutes);
// app.use('/api/reportes', reportesRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`V&G API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
