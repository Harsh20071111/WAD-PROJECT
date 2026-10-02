const { MongoMemoryServer } = require('mongodb-memory-server');

async function start() {
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: 'smart-pg',
    },
    spawn: { timeout: 30000 },
  });

  console.log('✅ MongoDB ready at: mongodb://127.0.0.1:27017/smart-pg');

  setInterval(() => {}, 60000);

  const shutdown = async () => {
    console.log('Stopping MongoDB...');
    await mongod.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((err) => {
  console.error('Failed to start MongoDB:', err);
  process.exit(1);
});
