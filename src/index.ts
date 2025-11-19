import logger from 'jet-logger';

import server from './server';

// **** Run **** //
const SERVER_START_MSG =
  'Express server started on port: ' + process.env.PORT?.toString();

server.listen(process.env.PORT, () => logger.info(SERVER_START_MSG));
