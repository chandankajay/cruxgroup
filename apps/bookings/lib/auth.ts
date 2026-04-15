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

        // Temporary simulated OTP auth: phone number is treated as verified.
        let user = await prisma.user.findUnique({
          where: { phoneNumber: phone },
        });

        if (!user) {
          user = await prisma.user.create({
            data: { phoneNumber: phone, name: "", role: "USER" },
          });
        }

        return { id: user.id, name: user.name, phoneNumber: user.phoneNumber };
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
