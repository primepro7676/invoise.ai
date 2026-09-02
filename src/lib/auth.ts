import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.warn("[AUTH] Missing email or password in request");
          return null;
        }

        const email = credentials.email.toLowerCase().trim();

        try {
          const admin = await prisma.admin.findUnique({
            where: { email },
          });

          if (!admin) {
            console.warn(`[AUTH] Admin not found for email: "${email}"`);
            return null;
          }

          const valid = await bcrypt.compare(credentials.password, admin.password);
          if (!valid) {
            console.warn(`[AUTH] Password mismatch for: "${email}"`);
            return null;
          }

          console.log(`[AUTH] Successfully authenticated admin: "${email}"`);
          return {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
          };
        } catch (error: any) {
          console.error(`[AUTH DB ERROR] Failed to query admin for "${email}":`, error?.message || error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "ADMIN";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "default_super_secret_for_invoice_app_2026",
};
