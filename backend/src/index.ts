import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { setupSocket } from './socket';

import authRoutes from './routes/auth.routes';
import companyRoutes from './routes/company.routes';
import driverRoutes from './routes/driver.routes';
import vehicleRoutes from './routes/vehicle.routes';
import customerRoutes from './routes/customer.routes';
import orderRoutes from './routes/order.routes';
import visitRoutes from './routes/visit.routes';
import routeRoutes from './routes/route.routes';
import importRoutes from './routes/import.routes';
import reportRoutes from './routes/report.routes';
import aiRoutes from './routes/ai.routes';

const app = express();
const httpServer = createServer(app);

app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Route Pro AI API funcionando', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/import', importRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);

app.use(errorHandler);

const io = setupSocket(httpServer);

httpServer.listen(config.port, () => {
  console.log(`Route Pro AI API corriendo en puerto ${config.port}`);
  console.log(`Entorno: ${config.nodeEnv}`);
});

export { app, httpServer, io };
