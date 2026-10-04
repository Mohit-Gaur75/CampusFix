import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { globalLimiter } from './middleware/rateLimit.js';

import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import metaRoutes from './routes/meta.routes.js';

import issueRoutes from './routes/issue.routes.js';
import authorityRoutes from './routes/authority.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false })); // allow static image loading if needed
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(globalLimiter);

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: { status: 'ok' }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/authority', authorityRoutes);
app.use('/api/notifications', notificationRoutes);


// Central error handler
app.use(errorHandler);

export default app;
