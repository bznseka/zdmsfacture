import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/overview/:path*",
    "/clients/:path*",
    "/invoices/:path*",
    "/payments/:path*",
    "/refunds/:path*",
    "/settings/:path*",
    "/subscriptions/:path*",
    "/support/:path*",
    "/login",
  ],
};
