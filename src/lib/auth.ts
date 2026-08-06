import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Placeholder for NextAuth configuration
// The user will set up PrismaAdapter and proper authentication logic shortly.
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // TODO: Implement user verification against Prisma DB
        if (credentials?.email === 'admin@acme.com' && credentials?.password === 'password') {
          return { id: '1', name: 'Admin User', email: 'admin@acme.com', role: 'ADMIN' };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore - Temporary bypass until next-auth types are extended
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', // TODO: create login page
  },
};
