import type { NextAuthConfig } from "next-auth";

const PROTECTED_PREFIXES = [
  "/overview",
  "/clients",
  "/invoices",
  "/payments",
  "/refunds",
  "/settings",
  "/subscriptions",
  "/support",
];

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      if (nextUrl.pathname.startsWith("/admin")) {
        if (auth?.user?.role === "admin") return true;
        return isLoggedIn ? Response.redirect(new URL("/overview", nextUrl)) : false;
      }

      const isProtected = PROTECTED_PREFIXES.some((prefix) =>
        nextUrl.pathname.startsWith(prefix)
      );

      if (isProtected) {
        return isLoggedIn;
      }

      if (isLoggedIn && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/overview", nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
