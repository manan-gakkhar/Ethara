import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "./mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  // No adapter — JWT strategy handles sessions entirely in the token.
  // The adapter + jwt strategy combination causes NextAuth server config errors.

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
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
          image: user.image ?? null,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    // On Google sign-in: create the user in our User collection if first time
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connectDB();
          const existing = await User.findOne({ email: user.email });
          if (!existing) {
            const created = await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              role: "MEMBER",
            });
            // Attach our DB id so the jwt callback picks it up
            user.id = String(created._id);
          } else {
            user.id = String(existing._id);
            (user as any).role = existing.role;
          }
        } catch (err) {
          console.error("signIn callback error:", err);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      // Initial sign-in: user object is present
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? "MEMBER";
      }

      // For Google sign-in the role may not be on the user object yet — fetch from DB
      if (account?.provider === "google" && !token.role) {
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
        (session.user as any).role = (token.role as string) ?? "MEMBER";
      }
      return session;
    },
  },

  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
    error: "/login",
  },
};
