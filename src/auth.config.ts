import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

const prisma = new PrismaClient();

export const OPTIONS: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
      allowDangerousEmailAccountLinking: true,
      httpOptions: {
        timeout: 30000, // Set this value higher than 3500ms (e.g., 10000ms)
      },
    }),
  ],
//   pages: {
//     signIn: "/auth/signin",
//   },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.isPro = user.isPro;
      }
      return session;
    },
  },
};

export const authOptions = OPTIONS;