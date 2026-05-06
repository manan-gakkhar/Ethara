import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: typeof mongoose | undefined;
  // eslint-disable-next-line no-var
  var _mongoosePromise: Promise<typeof mongoose> | undefined;
}

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Please add MONGODB_URI to your environment variables");

  // Return cached connection if available
  if (global._mongooseConn) return global._mongooseConn;

  if (!global._mongoosePromise) {
    global._mongoosePromise = mongoose.connect(uri, { bufferCommands: false });
  }

  global._mongooseConn = await global._mongoosePromise;
  return global._mongooseConn;
}
