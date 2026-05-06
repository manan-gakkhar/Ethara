import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Please add MONGODB_URI to your environment variables");

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(uri).connect();
    }
    return global._mongoClientPromise;
  }

  return new MongoClient(uri).connect();
}

// Export a lazy promise — only resolved when first used at runtime, not at build time
const clientPromise: Promise<MongoClient> = new Promise((resolve, reject) => {
  // Defer until the module is actually used (not during static analysis)
  Promise.resolve().then(() => getClientPromise()).then(resolve).catch(reject);
});

export default clientPromise;
