import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./mongodb";
import { connectDB } from "./mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  // MongoDBAdapter handles sessions/accounts/verification tokens in MongoDB
  adapter: MongoDBAdapter(clientPromise) as any,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email }).lean();
        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: String(user._id),
          email: user.email ?? "",
          name: user.name ?? "",
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    // Called after a successful sign-in — ensure Google users have a role in our User collection
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDB();
        const existing = await User.findOne({ email: user.email });
        if (!existing) {
          // First-time Google sign-in: create user with default MEMBER role
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            role: "MEMBER",
          });
        }
      }
      return true;
    },

    async jwt({ token, user, trigger }) {
      // On initial sign-in, user object is present
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? "MEMBER";
      }

      // Fetch role from DB if not yet on token (e.g. Google sign-in first time)
      if (!token.role || token.role === undefined) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email }).lean();
        if (dbUser) {
          token.id = String(dbUser._id);
          token.role = dbUser.role ?? "MEMBER";
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },

  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
  },
};
