import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { getUserByEmail, recordUserLogin } from "@/lib/users";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const user = await getUserByEmail(parsed.data.email);
        if (!user?.active) return null;

        const passwordMatches = await compare(parsed.data.password, user.passwordHash);
        if (!passwordMatches) return null;

        await recordUserLogin(user.email);
        return {
          id: user._id?.toString() ?? user.email,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? token.sub ?? "");
        session.user.role = token.role === "editor" ? "editor" : "admin";
      }
      return session;
    },
  },
});

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !["admin", "editor"].includes(session.user.role)) return null;
  return session;
}
