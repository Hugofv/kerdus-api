import { PrismaClient } from '@prisma/client';
import { asClass, asValue, createContainer, Lifetime } from 'awilix';
import { scopePerRequest } from 'awilix-express';
import { Application } from 'express';
import logger from 'jet-logger';

// Services
import { AccountsService } from './services/accounts';
import { ClientsService } from './services/clients';
import { PlansService } from './services/plans';
import { FeaturesService } from './services/features';
import { ModulesService } from './services/modules';
import { QualificationsService } from './services/qualifications';
import { ResourcesService } from './services/resources';
import { PlatformUsersService } from './services/platformUsers';
import { AlertsService } from './services/alerts';
import { NotificationsService } from './services/notifications';
import { PaymentsService } from './services/payments';
import { OperationsService } from './services/operations';
import { OnboardingService } from './services/onboarding';
import { InstallmentsService } from './services/installments';
import { VerificationService } from './services/verification';
import { SettingsService } from './services/settings';

export const loadContainer = (app: Application) => {
  const container = createContainer();

  // Create a single PrismaClient instance
  const prisma = new PrismaClient();

  // Register PrismaClient and its models
  container.register({
    prisma: asValue(prisma),

    // Explicitly registered services for DI (accountsService, plansService, etc.)
    accountsService: asClass(AccountsService, { lifetime: Lifetime.SINGLETON }),
    clientsService: asClass(ClientsService, { lifetime: Lifetime.SINGLETON }),
    plansService: asClass(PlansService, { lifetime: Lifetime.SINGLETON }),
    featuresService: asClass(FeaturesService, { lifetime: Lifetime.SINGLETON }),
    modulesService: asClass(ModulesService, { lifetime: Lifetime.SINGLETON }),
    qualificationsService: asClass(QualificationsService, { lifetime: Lifetime.SINGLETON }),
    resourcesService: asClass(ResourcesService, { lifetime: Lifetime.SINGLETON }),
    platformUsersService: asClass(PlatformUsersService, { lifetime: Lifetime.SINGLETON }),
    alertsService: asClass(AlertsService, { lifetime: Lifetime.SINGLETON }),
    notificationsService: asClass(NotificationsService, { lifetime: Lifetime.SINGLETON }),
    paymentsService: asClass(PaymentsService, { lifetime: Lifetime.SINGLETON }),
    operationsService: asClass(OperationsService, { lifetime: Lifetime.SINGLETON }),
    onboardingService: asClass(OnboardingService, { lifetime: Lifetime.SINGLETON }),
    installmentsService: asClass(InstallmentsService, { lifetime: Lifetime.SINGLETON }),
    verificationService: asClass(VerificationService, { lifetime: Lifetime.SINGLETON }),
    settingsService: asClass(SettingsService, { lifetime: Lifetime.SINGLETON }),
  });

  // Set prisma instance for auth middleware
  import('./middlewares/auth.middleware').then(({ setPrismaInstance }) => {
    setPrismaInstance(prisma);
  });

  logger.info('Loading modules...');

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
