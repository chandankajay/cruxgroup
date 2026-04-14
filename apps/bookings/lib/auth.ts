import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@repo/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
      },
      async authorize(credentials) {
        const phone = credentials?.phone as string | undefined;
        if (!phone) return null;

        const otp = await prisma.otp.findFirst({
          where: {
            phone,
            verified: true,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: "desc" },
        });

        if (!otp) return null;

        let user = await prisma.user.findUnique({ where: { phone } });

        if (!user) {
          user = await prisma.user.create({
            data: { phone, role: "USER" },
          });
        }

        return { id: user.id, name: user.name, phone: user.phone };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
