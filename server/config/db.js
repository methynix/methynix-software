const mongoose = require("mongoose");

// Cache the connection across hot reloads / serverless invocations so we never
// open more sockets than we need.
let cached = global._methynixMongoose;
if (!cached) {
  cached = global._methynixMongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add your MongoDB Atlas connection string to .env.");
  }

  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose
      .connect(uri, {
        dbName: process.env.MONGODB_DB || "methynix",
        serverSelectionTimeoutMS: 10000,
      })
      .then((m) => {
        console.log("[METHYNIX_DB] Connected to MongoDB Atlas.");
        return m;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

mongoose.connection.on("error", (err) => {
  console.error("[METHYNIX_DB_CRITICAL] Unexpected error:", err.message);
});

module.exports = connectDB;
