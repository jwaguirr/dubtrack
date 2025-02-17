import NextAuth, { DefaultSession } from "next-auth"
import Google from "next-auth/providers/google"
import { query } from "~/lib/db"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account || !user.email) return false;

      try {
        const googleUid = account.providerAccountId;
        const email = user.email;
        const pfp = user.image;
        const username = user.name;

        // Check if user exists
        const existingUser = await query(
          "SELECT google_uid FROM users WHERE google_uid = $1",
          [googleUid]
        );

        if (existingUser.length === 0) {
          // Insert new user
          console.log("User does not exist, so inserting a new record with the data");
          await query(
            "INSERT INTO users (google_uid, created_at, email, username, profile_picture) VALUES ($1, NOW(), $2, $3, $4)",
            [googleUid, email, username, pfp]
          );
        } else {
          console.log("USER ALREADY EXISTS");
        }

        return true;
      } catch (error) {
        console.error("Database error:", error);
        return false;
      }
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.providerAccountId as string,
        },
      };
    },

    async jwt({ token, account }) {
      if (account) {
        token.providerAccountId = account.providerAccountId;
      }
      return token;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/auth/error",
    newUser: "/dashboard", 
  },
})