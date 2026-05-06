import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var _mongoosePromise: Promise<typeof mongoose> | undefined;
}

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined in environment variables");

  // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (mongoose.connection.readyState === 2) {
    // Already connecting — wait for it
    await new Promise<void>((resolve, reject) => {
      mongoose.connection.once("connected", resolve);
      mongoose.connection.once("error", reject);
    });
    return mongoose;
  }

  // Reset stale promise on disconnection
  if (!global._mongoosePromise) {
    global._mongoosePromise = mongoose
      .connect(uri, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      })
      .then((m) => {
        console.log("MongoDB connected via Mongoose");
        return m;
      })
      .catch((err) => {
        global._mongoosePromise = undefined; // allow retry on next call
        throw err;
      });
  }

  await global._mongoosePromise;
  return mongoose;
}
