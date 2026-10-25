import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';
import { seedDatabase } from './seed.js';
import authRoutes from './routes/auth.js';
import specialtiesRoutes from './routes/specialties.js';
import stationsRoutes from './routes/stations.js';
import attemptsRoutes from './routes/attempts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const upload = multer({ storage: multer.memoryStorage() });

// Auto-seed if database has no specialties yet
try {
  const count = db.prepare('SELECT COUNT(*) as c FROM specialties').get().c;
  if (count === 0) {
    console.log('🌱 Banco vazio detectado — populando dados iniciais do Revalida Tracker...');
    seedDatabase({ force: false });
  }
} catch (err) {
  console.error('Erro ao verificar seed inicial:', err);
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'revalida-tracker-api',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/specialties', specialtiesRoutes);
app.use('/api/stations', stationsRoutes);
app.use('/api/attempts', upload.single('file'), attemptsRoutes);

// 404 handler for /api
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
});

// Serve frontend build in production (from client/dist or docs/)
const clientDistPath = path.resolve(__dirname, '../client/dist');
const docsPath = path.resolve(__dirname, '../docs');
const staticDir = fs.existsSync(clientDistPath)
  ? clientDistPath
  : fs.existsSync(docsPath)
  ? docsPath
  : null;

if (staticDir) {
  app.use(express.static(staticDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Erro não tratado na API:', err);
  res.status(500).json({ error: 'Erro interno no servidor.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Revalida Tracker API rodando em http://0.0.0.0:${PORT}`);
});
