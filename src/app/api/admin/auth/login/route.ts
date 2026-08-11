// import { NextRequest, NextResponse } from "next/server";
// import { scryptSync, timingSafeEqual } from "crypto";
// import { SignJWT } from "jose";

// import { prisma } from "@/lib/prisma";
// import { AccountStatus, UserRole } from "@/generated/prisma/client";

// export const runtime = "nodejs";

// const ADMIN_SESSION_COOKIE = "aegis_admin_session";

// function getAuthSecret() {
//   const secret = process.env.AUTH_SECRET;

//   if (!secret) {
//     throw new Error("AUTH_SECRET is not set");
//   }

//   return new TextEncoder().encode(secret);
// }

// function verifyPassword(password: string, storedPassword: string) {
//   try {
//     const [salt, storedHash] = storedPassword.split(":");

//     if (!salt || !storedHash) {
//       return false;
//     }

//     const hash = scryptSync(password, salt, 64);

//     const storedHashBuffer = Buffer.from(storedHash, "hex");

//     if (hash.length !== storedHashBuffer.length) {
//       return false;
//     }

//     return timingSafeEqual(hash, storedHashBuffer);
//   } catch {
//     return false;
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();

//     const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

//     const password = typeof body.password === "string" ? body.password : "";

//     if (!email || !password) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Email and password are required.",
//         },
//         { status: 400 },
//       );
//     }

//     const user = await prisma.user.findUnique({
//       where: {
//         email,
//       },
//       select: {
//         id: true,
//         firstName: true,
//         lastName: true,
//         name: true,
//         email: true,
//         password: true,
//         role: true,
//         status: true,
//         deletedAt: true,
//       },
//     });

//     if (!user) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Invalid email or password.",
//         },
//         { status: 401 },
//       );
//     }

//     if (user.deletedAt) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "This account has been deleted.",
//         },
//         { status: 403 },
//       );
//     }

//     if (user.role !== UserRole.SUPER_ADMIN) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "You do not have permission to access the admin panel.",
//         },
//         { status: 403 },
//       );
//     }

//     if (user.status !== AccountStatus.ACTIVE) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "This admin account is inactive.",
//         },
//         { status: 403 },
//       );
//     }

//     const passwordValid = verifyPassword(password, user.password);

//     if (!passwordValid) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Invalid email or password.",
//         },
//         { status: 401 },
//       );
//     }

//     const token = await new SignJWT({
//       userId: user.id,
//       role: user.role,
//       type: "ADMIN",
//     })
//       .setProtectedHeader({
//         alg: "HS256",
//       })
//       .setIssuedAt()
//       .setExpirationTime("7d")
//       .sign(getAuthSecret());

//     const response = NextResponse.json({
//       success: true,
//       message: "Admin login successful.",
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         status: user.status,
//       },
//     });

//     response.cookies.set({
//       name: ADMIN_SESSION_COOKIE,
//       value: token,
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       path: "/",
//       maxAge: 60 * 60 * 24 * 7,
//     });

//     return response;
//   } catch (error) {
//     console.error("ADMIN_LOGIN_ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         error: "Something went wrong while logging in.",
//       },
//       { status: 500 },
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { scryptSync, timingSafeEqual } from "crypto";

import { prisma } from "@/lib/prisma";
import { AccountStatus, UserRole } from "@/generated/prisma/client";

import { SESSION_COOKIE_NAME, createSession } from "@/lib/auth/session";

export const runtime = "nodejs";

function verifyPassword(password: string, storedPassword: string) {
  try {
    const [salt, storedHash] = storedPassword.split(":");

    if (!salt || !storedHash) {
      return false;
    }

    const hash = scryptSync(password, salt, 64);

    const storedHashBuffer = Buffer.from(storedHash, "hex");

    if (hash.length !== storedHashBuffer.length) {
      return false;
    }

    return timingSafeEqual(hash, storedHashBuffer);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required.",
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        password: true,
        role: true,
        status: true,
        deletedAt: true,
      },
    });

    // if (!user) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: "Invalid email or password.",
    //     },
    //     { status: 401 },
    //   );
    // }
    if (!user) {
      console.log("ADMIN LOGIN FAILED: USER NOT FOUND", email);

      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password.",
        },
        { status: 401 },
      );
    }

    // if (user.deletedAt) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: "This account has been deleted.",
    //     },
    //     { status: 403 },
    //   );
    // }
    if (user.deletedAt) {
      console.log("ADMIN LOGIN FAILED: USER DELETED", user.email);

      return NextResponse.json(
        {
          success: false,
          error: "This account has been deleted.",
        },
        { status: 403 },
      );
    }

    // if (user.role !== UserRole.SUPER_ADMIN) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: "You do not have permission to access the admin panel.",
    //     },
    //     { status: 403 },
    //   );
    // }
    if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.ADMIN) {
      console.log("ADMIN LOGIN FAILED: WRONG ROLE", user.role);

      return NextResponse.json(
        {
          success: false,
          error: "You do not have permission to access the admin panel.",
        },
        { status: 403 },
      );
    }

    // if (user.status !== AccountStatus.ACTIVE) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: "This admin account is inactive.",
    //     },
    //     { status: 403 },
    //   );
    // }
    if (user.status !== AccountStatus.ACTIVE) {
      console.log("ADMIN LOGIN FAILED: INACTIVE", user.status);

      return NextResponse.json(
        {
          success: false,
          error: "This admin account is inactive.",
        },
        { status: 403 },
      );
    }

    // const passwordValid = verifyPassword(password, user.password);

    // if (!passwordValid) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: "Invalid email or password.",
    //     },
    //     { status: 401 },
    //   );
    // }
    const passwordValid = verifyPassword(password, user.password);

    console.log("ADMIN PASSWORD VALID:", passwordValid);

    if (!passwordValid) {
      console.log("ADMIN LOGIN FAILED: PASSWORD INVALID");

      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password.",
        },
        { status: 401 },
      );
    }

    // Create the shared application session.
    const token = await createSession(user.id, user.role);

    const response = NextResponse.json(
      {
        success: true,
        message: "Admin login successful.",
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      },
      { status: 200 },
    );

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("ADMIN_LOGIN_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong while logging in.",
      },
      { status: 500 },
    );
  }
}
