// this is a perfectly working code:

// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { ContentStatus } from "@/generated/prisma/client";
// import { getCourseAccess } from "@/lib/course-access";

// export async function GET() {
//   try {
//     const access = await getCourseAccess();

//     // Not logged in
//     if (!access.authenticated) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Authentication required.",
//         },
//         { status: 401 },
//       );
//     }

//     // Logged in but subscription is not active
//     if (!access.hasActiveSubscription) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "An active subscription is required to access courses.",
//         },
//         { status: 403 },
//       );
//     }

//     const courses = await prisma.course.findMany({
//       where: {
//         status: ContentStatus.PUBLISHED,
//         deletedAt: null,
//       },
//       orderBy: {
//         displayOrder: "asc",
//       },
//       include: {
//         lessons: {
//           where: {
//             deletedAt: null,
//           },
//           orderBy: {
//             displayOrder: "asc",
//           },
//         },
//       },
//     });

//     return NextResponse.json(
//       {
//         success: true,
//         courses,
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.error("GET student courses error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to fetch courses.",
//       },
//       { status: 500 },
//     );
//   }
// }

// this is a new code to pass only the (thumbnail, title and description) data to the frontend for users
// who don't have a active subscription.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ContentStatus } from "@/generated/prisma/client";
import { getCourseAccess } from "@/lib/course-access";

export async function GET() {
  try {
    const access = await getCourseAccess();

    // Not logged in
    if (!access.authenticated) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 },
      );
    }

    const courses = await prisma.course.findMany({
      where: {
        status: ContentStatus.PUBLISHED,
        deletedAt: null,
      },
      orderBy: {
        displayOrder: "asc",
      },
      include: {
        // Only bring back lesson details (including videoUrl) if the
        // student actually has access. Locked users still see the
        // course cards, just not what's inside them.
        lessons: access.hasActiveSubscription
          ? {
              where: {
                deletedAt: null,
              },
              orderBy: {
                displayOrder: "asc",
              },
            }
          : false,
        _count: {
          select: {
            lessons: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        hasActiveSubscription: access.hasActiveSubscription,
        courses,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET student courses error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch courses.",
      },
      { status: 500 },
    );
  }
}
