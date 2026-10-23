/**
 * MongoDB Initialization Script for Project 75
 * Executed automatically by the mongo docker-entrypoint when database volume is first created.
 * Creates the application user with readWrite privileges on the application database.
 */

const dbName = process.env.MONGO_DATABASE || 'taskdb';
const appUser = process.env.MONGO_USER || 'appuser';
const appPassword = process.env.MONGO_PASSWORD || 'appSecurePass75_2026';

const appDb = db.getSiblingDB(dbName);

// Check if user already exists
const existingUser = appDb.getUser(appUser);

if (!existingUser) {
  print(`[init-mongo.js] Creating application user '${appUser}' on database '${dbName}'...`);
  appDb.createUser({
    user: appUser,
    pwd: appPassword,
    roles: [
      {
        role: 'readWrite',
        db: dbName,
      },
    ],
  });
  print(`[init-mongo.js] Application user '${appUser}' created successfully.`);
} else {
  print(`[init-mongo.js] Application user '${appUser}' already exists on '${dbName}'. Skipping creation.`);
}

// Create initial collection and index
appDb.createCollection('tasks');
appDb.tasks.createIndex({ completed: 1, createdAt: -1 });
print(`[init-mongo.js] Database '${dbName}' initialized with indexes.`);
