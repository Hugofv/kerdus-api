import { PrismaClient } from '@prisma/client';
import { asClass, asValue, createContainer, Lifetime } from 'awilix';
import { scopePerRequest } from 'awilix-express';
import { Application } from 'express';
import logger from 'jet-logger';

export const loadContainer = (app: Application) => {
  const container = createContainer();

  // Create a single PrismaClient instance
  const prisma = new PrismaClient();

  // Register PrismaClient
  container.register({
    prisma: asValue(prisma),
  });

  // Set prisma instance for auth middleware
  import('./middlewares/auth.middleware').then(({ setPrismaInstance }) => {
    setPrismaInstance(prisma);
  });

  logger.info('Loading modules...');

  // Dynamically register all services with *Service suffix
  // e.g. src/services/accounts.ts        -> accountsService
  //      src/services/accountsService.ts -> accountsService
  container.loadModules(
    ['services/*.ts'],
    {
      cwd: __dirname,
      formatName: (name) =>
        name.endsWith('Service') ? name : `${name}Service`,
      resolverOptions: {
        lifetime: Lifetime.SINGLETON,
        register: asClass,
      },
    }
  );

  // Register controllers and adapters with their camelCase file names
  container.loadModules(
    ['controllers/*.ts', 'adapters/*.ts'],
    {
      cwd: __dirname,
      formatName: 'camelCase',
      resolverOptions: {
        lifetime: Lifetime.SINGLETON,
        register: asClass,
      },
    }
  );

  app.use(scopePerRequest(container));
};
