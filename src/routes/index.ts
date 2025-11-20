import { Router } from 'express';
import authRouter from './auth.routes';
import accountsRouter from './accounts.routes';
import clientsRouter from './clients.routes';
import operationsRouter from './operations.routes';
import installmentsRouter from './installments.routes';
import paymentsRouter from './payments.routes';
import resourcesRouter from './resources.routes';
import alertsRouter from './alerts.routes';
import notificationsRouter from './notifications.routes';
import settingsRouter from './settings.routes';
import platformUsersRouter from './platformUsers.routes';

const routes = Router();

// Public routes
routes.use('/auth', authRouter);

// Protected routes (require authentication)
routes.use('/accounts', accountsRouter);
routes.use('/clients', clientsRouter);
routes.use('/operations', operationsRouter);
routes.use('/installments', installmentsRouter);
routes.use('/payments', paymentsRouter);
routes.use('/resources', resourcesRouter);
routes.use('/alerts', alertsRouter);
routes.use('/notifications', notificationsRouter);
routes.use('/settings', settingsRouter);
routes.use('/platform-users', platformUsersRouter);

export default routes;
