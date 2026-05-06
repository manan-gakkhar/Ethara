import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "./mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
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
          image: user.image ?? null,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connectDB();
          const existing = await User.findOne({ email: user.email }).lean();
          if (!existing) {
            const created = await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              role: "MEMBER",
            });
            user.id = String(created._id);
            (user as any).role = "MEMBER";
          } else {
            user.id = String(existing._id);
            (user as any).role = existing.role;
          }
        } catch (err) {
          console.error("Google signIn error:", err);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? "MEMBER";
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

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/login",
    error: "/login",
  },
};
