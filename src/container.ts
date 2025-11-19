import { PrismaClient } from '@prisma/client';
import { asClass, asValue, createContainer, Lifetime } from 'awilix';
import { scopePerRequest } from 'awilix-express';
import { Application } from 'express';
import logger from 'jet-logger';

export const loadContainer = (app: Application) => {
  const container = createContainer();

  // Create a single PrismaClient instance
  const prisma = new PrismaClient();

  // Register PrismaClient and its models
  container.register({
    prisma: asValue(prisma),
  });

  logger.info('Loading modules...');
  container.loadModules(
    ['services/*.ts', 'controllers/*.ts', 'adapters/*.ts'],
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
