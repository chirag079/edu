import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDb } from "@/lib/db";
import { User } from "@/lib/models/user.schema";
import { verifyPassword } from "@/lib/auth";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Please provide process.env.NEXTAUTH_SECRET");
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          await connectToDb();
          const user = await User.findOne({ username: credentials.username });

          if (!user) {
            return null;
          }

          if (!user.password) {
            return null;
          }

          const isValid = await verifyPassword(
            credentials.password,
            user.password
          );

          if (!isValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            username: user.username,
            role: user.role,
            college: user.college,
            profileStatus: user.profileStatus,
            isVerified: user.isVerified,
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.college = user.college;
        token.profileStatus = user.profileStatus;
        token.isVerified = user.isVerified;
        token.username = user.username;
      }

      // If trigger is 'update'
      if (trigger === "update" && session) {
        // Merging logic can be added here if needed for specific fields
      }

      // Re-fetch logic
      if (!user) {
        try {
          await connectToDb();
          const dbUser = await User.findById(token.id);
          if (dbUser) {
            token.name = dbUser.name;
            token.email = dbUser.email;
            token.role = dbUser.role;
            token.college = dbUser.college;
            token.profileStatus = dbUser.profileStatus;
            token.isVerified = dbUser.isVerified;
            token.username = dbUser.username;
          } else {
          }
        } catch (error) {}
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.college = token.college;
        session.user.profileStatus = token.profileStatus;
        session.user.isVerified = token.isVerified;
        session.user.username = token.username;
        session.user.name = token.name;
        session.user.email = token.email;
      } else if (!session.user) {
        session.user = {};
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authOptions);
