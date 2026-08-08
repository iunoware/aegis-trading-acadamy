// import { NextResponse } from "next/server";
// import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

// export async function POST() {
//   try {
//     const response = NextResponse.json(
//       {
//         success: true,
//         message: "Admin logged out successfully.",
//       },
//       { status: 200 },
//     );

//     response.cookies.set({
//       name: SESSION_COOKIE_NAME,
//       value: "",
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       path: "/",
//       expires: new Date(0),
//     });

//     return response;
//   } catch (error) {
//     console.error("ADMIN_LOGOUT_ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to logout.",
//       },
//       { status: 500 },
//     );
//   }
// }

import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Admin logged out successfully.",
  });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  return response;
}
