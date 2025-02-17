// import NextAuth from "next-auth";
// import { AuthOptions } from "next-auth";

// import GithubProvider from "next-auth/providers/github";
// import GoogleProvider from "next-auth/providers/google";
// import CredentialsProvider from "next-auth/providers/credentials";

// export const authOptions: AuthOptions = {
//   providers: [
//     GithubProvider({
//       clientId: process.env.GITHUB_ID as string,
//       clientSecret: process.env.GITHUB_SECRET as string,
//     }),
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID as string,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//     }),
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { 
//           label: "Email", 
//           type: "email",
//           placeholder: "example@example.com" 
//         },
//         password: { 
//           label: "Password", 
//           type: "password" 
//         }
//       },
//       async authorize(credentials) {
//         // Add your own logic here to lookup the user from credentials
//         // For example, verify against a database
//         if (!credentials?.email || !credentials?.password) return null;
        
//         try {
//           // Example database lookup - replace with your actual authentication logic
//           const user = {
//             id: "1",
//             email: credentials.email,
//             name: "John Doe"
//           };
          
//           return user;
//         } catch (error) {
//           console.error("Error during authentication:", error);
//           return null;
//         }
//       }
//     })
//   ],
//   session: {
//     strategy: "jwt",
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//   callbacks: {
//     async jwt({ token, user, account }) {
//       if (account && user) {
//         return {
//           ...token,
//           accessToken: account.access_token,
//           userId: user.id,
//         };
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       return {
//         ...session,
//         user: {
//           ...session.user,
//           id: token.userId,
//         },
//       };
//     },
//   },
//   pages: {
//     signIn: '/auth/signin',
//     error: '/auth/error',
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };



import { handlers } from "~/app/auth"
export const { GET, POST } = handlers