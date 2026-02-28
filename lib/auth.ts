import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const SECRET = new TextEncoder().encode(
    (() => {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("Missing JWT_SECRET environment variable");
        return secret;
    })()
);

export const COOKIE_NAME = "auth-token";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export type JWTPayload = {
    sub: string;   // user id
    email: string;
    role: string;
};

// Password

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// Token

export async function signToken(payload: JWTPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return payload as unknown as JWTPayload;
    } catch {
        return null;
    }
}
