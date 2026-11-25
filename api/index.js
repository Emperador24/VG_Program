import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database.js';
import initializeDatabase from './init-db.js';
import authRoutes from './routes/authRoutes.js';
import seedRoutes from './routes/seedRoutes.js';
import maquinasRoutes from './routes/maquinasRoutes.js';
import operariosRoutes from './routes/operariosRoutes.js';
import ubicacionesRoutes from './routes/ubicacionesRoutes.js';
import gastosRoutes from './routes/gastosRoutes.js';
import ingresosRoutes from './routes/ingresosRoutes.js';
import asignacionesRoutes from './routes/asignacionesRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportesRoutes from './routes/reportesRoutes.js';
import configRoutes from './routes/configRoutes.js';
import nominaRoutes from './routes/nominaRoutes.js';
import analisisRoutes from './routes/analisisRoutes.js';
import clientesRoutes from './routes/clientesRoutes.js';
import trabajadoresRoutes from './routes/trabajadoresRoutes.js';
import { initReportesJobs } from './jobs/reportesJob.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.includes('vercel.app') || origin === 'http://localhost:3000' || origin === 'http://localhost:5173') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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
app.use('/api/seed', seedRoutes);
app.use('/api/maquinas', maquinasRoutes);
app.use('/api/operarios', operariosRoutes);
app.use('/api/ubicaciones', ubicacionesRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/ingresos', ingresosRoutes);
app.use('/api/asignaciones', asignacionesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/config', configRoutes);
app.use('/api/nomina', nominaRoutes);
app.use('/api/analisis', analisisRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/trabajadores', trabajadoresRoutes);
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

// Initialize cron jobs
initReportesJobs();

// Initialize database
await initializeDatabase();

// Start server
app.listen(PORT, () => {
  console.log(`V&G API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
