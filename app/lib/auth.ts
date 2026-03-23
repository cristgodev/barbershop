import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                    // Note: This role might be overridden in the signIn callback if the user already exists
                    role: "CUSTOMER", 
                    barbershopId: "", 
                } as any;
            }
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing credentials");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user || !user.passwordHash) {
                    throw new Error("Invalid credentials");
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

                if (!isPasswordValid) {
                    throw new Error("Invalid credentials");
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    barbershopId: user.barbershopId || ""
                };
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                // Ensure the user exists in our DB, if not, create them
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email! }
                });

                if (!existingUser) {
                    // It's a brand new user, so default to CUSTOMER
                    await prisma.user.create({
                        data: {
                            email: user.email!,
                            name: user.name,
                            image: user.image || null,
                            role: "CUSTOMER", 
                        }
                    });
                } else if (!existingUser.image && user.image) {
                    // Optional: Update avatar if they just linked Google
                    await prisma.user.update({
                        where: { email: user.email! },
                        data: { image: user.image }
                    })
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.barbershopId = user.barbershopId;
            } else if (token.email) {
                 // For subsequent requests, fetch the user to ensure we have the latest role (useful for Google logins)
                 const dbUser = await prisma.user.findUnique({ where: { email: token.email }});
                 if (dbUser) {
                     token.id = dbUser.id;
                     token.role = dbUser.role;
                     token.barbershopId = dbUser.barbershopId || "";
                 }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.barbershopId = (token.barbershopId as string) || "";
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development",
};
