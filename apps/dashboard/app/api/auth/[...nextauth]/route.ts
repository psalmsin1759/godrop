import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { LoginResponse } from "@/types/api";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

        try {
          const res = await fetch(`${apiUrl}/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const json = await res.json();

          console.log("LOGIN RESPONSE:", json);

          if (!res.ok || !json.success) return null;

          // 🔥 FIX: match your backend shape
          const accessToken = json.token;
          const admin = json.admin;

          if (!accessToken || !admin) return null;

          return {
            id: admin.id,
            email: admin.email,
            accessToken,
            admin,
          };
        } catch (err) {
          console.error("AUTH ERROR:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.admin = user.admin;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.admin = token.admin;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
