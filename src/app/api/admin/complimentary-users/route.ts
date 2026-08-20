// // this is the route to create students with free courses access

// import { NextRequest, NextResponse } from "next/server";
// import { randomBytes, scryptSync } from "crypto";
// import { prisma } from "@/lib/prisma";
// import {
//   AccountStatus,
//   ActivityAction,
//   ActivityActorType,
//   SubscriptionEventType,
//   SubscriptionSource,
//   SubscriptionStatus,
//   UserRole,
// } from "@/generated/prisma/client";
// import { getRequiredSuperAdmin } from "@/lib/current-user";

// function hashPassword(password: string) {
//   const salt = randomBytes(16).toString("hex");

//   const hash = scryptSync(password, salt, 64).toString("hex");

//   return `${salt}:${hash}`;
// }

// function getNameParts(name: string) {
//   const parts = name.trim().split(/\s+/);

//   const firstName = parts.shift() || "";
//   const lastName = parts.length > 0 ? parts.join(" ") : null;

//   return {
//     firstName,
//     lastName,
//   };
// }

// export async function GET() {
//   try {
//     await getRequiredSuperAdmin();

//     const users = await prisma.user.findMany({
//       where: {
//         role: UserRole.STUDENT,
//         deletedAt: null,
//         subscriptions: {
//           some: {
//             source: SubscriptionSource.COMPLIMENTARY,
//             deletedAt: null,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//       select: {
//         id: true,
//         firstName: true,
//         lastName: true,
//         name: true,
//         email: true,
//         phone: true,
//         discordName: true,
//         status: true,
//         createdAt: true,
//         subscriptions: {
//           where: {
//             source: SubscriptionSource.COMPLIMENTARY,
//             deletedAt: null,
//           },
//           orderBy: {
//             createdAt: "desc",
//           },
//           take: 1,
//           select: {
//             id: true,
//             status: true,
//             source: true,
//             currentExpiryDate: true,
//           },
//         },
//       },
//     });

//     return NextResponse.json(
//       {
//         success: true,
//         users,
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.error("GET complimentary users error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to fetch complimentary users.",
//       },
//       { status: 500 },
//     );
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const adminUser = await getRequiredSuperAdmin();

//     const body = await request.json();

//     const name = typeof body.name === "string" ? body.name.trim() : "";

//     const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

//     const phone = typeof body.phone === "string" ? body.phone.trim() : "";

//     const password = typeof body.password === "string" ? body.password : "";

//     const discordName = typeof body.discordName === "string" ? body.discordName : "";

//     const status =
//       body.status === "INACTIVE" ? AccountStatus.INACTIVE : AccountStatus.ACTIVE;

//     if (!name) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Full name is required.",
//         },
//         { status: 400 },
//       );
//     }

//     if (!email) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Email address is required.",
//         },
//         { status: 400 },
//       );
//     }

//     if (!discordName) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Discord name is required",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     if (!password) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Password is required.",
//         },
//         { status: 400 },
//       );
//     }

//     if (password.length < 8) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Password must be at least 8 characters long.",
//         },
//         { status: 400 },
//       );
//     }

//     // Check existing email
//     const existingEmail = await prisma.user.findUnique({
//       where: {
//         email,
//       },
//       select: {
//         id: true,
//         email: true,
//         deletedAt: true,
//       },
//     });

//     if (existingEmail && !existingEmail.deletedAt) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "An account with this email already exists.",
//         },
//         { status: 409 },
//       );
//     }

//     // Check existing phone
//     if (phone) {
//       const existingPhone = await prisma.user.findUnique({
//         where: {
//           phone,
//         },
//         select: {
//           id: true,
//           phone: true,
//           deletedAt: true,
//         },
//       });

//       if (existingPhone && !existingPhone.deletedAt) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "An account with this phone number already exists.",
//           },
//           { status: 409 },
//         );
//       }
//     }

//     // Find an active subscription plan
//     const plan = await prisma.subscriptionPlan.findUnique({
//       where: {
//         type: "YEARLY",
//       },
//       select: {
//         id: true,
//         type: true,
//         name: true,
//         durationMonths: true,
//         active: true,
//         deletedAt: true,
//       },
//     });

//     if (!plan || !plan.active || plan.deletedAt) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "The yearly subscription plan is not available.",
//         },
//         { status: 400 },
//       );
//     }

//     // Prepare user data
//     const { firstName, lastName } = getNameParts(name);

//     const hashedPassword = hashPassword(password);

//     const now = new Date();

//     const expiryDate = new Date(now);

//     expiryDate.setMonth(expiryDate.getMonth() + plan.durationMonths);

//     // Create User + Complimentary Subscription + Logs

//     const result = await prisma.$transaction(async (tx) => {
//       const user = await tx.user.create({
//         data: {
//           firstName,
//           lastName,
//           name,
//           email,
//           phone: phone || null,
//           discordName: discordName || null,
//           password: hashedPassword,
//           role: UserRole.STUDENT,
//           status,

//           // Admin-created accounts are trusted and pre-verified
//           emailVerifiedAt: now,
//           emailVerificationCode: null,
//           emailVerificationExpiresAt: null,
//           emailVerificationAttempts: 0,
//           emailVerificationLastSentAt: null,

//           passwordChangedAt: now,
//         },
//       });

//       const subscription = await tx.subscription.create({
//         data: {
//           userId: user.id,
//           planId: plan.id,

//           status:
//             status === AccountStatus.ACTIVE
//               ? SubscriptionStatus.ACTIVE
//               : SubscriptionStatus.CANCELLED,

//           source: SubscriptionSource.COMPLIMENTARY,

//           purchaseDate: now,
//           startDate: now,

//           originalExpiryDate: expiryDate,
//           currentExpiryDate: expiryDate,

//           autoRenew: false,
//         },
//       });

//       await tx.subscriptionEvent.create({
//         data: {
//           subscriptionId: subscription.id,

//           type: SubscriptionEventType.PURCHASED,

//           title: "Complimentary access created",

//           description: "Complimentary course access was created by an administrator.",

//           metadata: {
//             source: "COMPLIMENTARY",
//             planId: plan.id,
//             planType: plan.type,
//             planName: plan.name,
//           },
//         },
//       });

//       await tx.userActivity.create({
//         data: {
//           userId: user.id,
//           actorId: adminUser.id,

//           action: ActivityAction.ACCOUNT_CREATED,

//           title: "Student account created",

//           details: "A complimentary student account was created.",

//           metadata: {
//             source: "COMPLIMENTARY",
//             subscriptionId: subscription.id,
//             planId: plan.id,
//           },
//         },
//       });

//       await tx.activityLog.create({
//         data: {
//           actorId: adminUser.id,
//           actorType: ActivityActorType.SUPER_ADMIN,

//           action: ActivityAction.ACCOUNT_CREATED,

//           module: "USERS",

//           title: "Complimentary student account created",

//           description: "A student account with complimentary course access was created.",

//           targetId: user.id,
//           targetType: "USER",

//           afterData: {
//             userId: user.id,
//             email: user.email,
//             role: user.role,
//             status: user.status,
//             subscriptionId: subscription.id,
//             subscriptionSource: SubscriptionSource.COMPLIMENTARY,
//             planId: plan.id,
//           },
//         },
//       });

//       return {
//         user,
//         subscription,
//       };
//     });

//     // Response

//     return NextResponse.json(
//       {
//         success: true,

//         message: "Complimentary student account created successfully.",

//         user: {
//           id: result.user.id,
//           firstName: result.user.firstName,
//           lastName: result.user.lastName,
//           name: result.user.name,
//           email: result.user.email,
//           phone: result.user.phone,
//           discordName: result.user.discordName,
//           role: result.user.role,
//           status: result.user.status,
//           createdAt: result.user.createdAt,
//         },

//         subscription: {
//           id: result.subscription.id,
//           status: result.subscription.status,
//           source: result.subscription.source,
//           startDate: result.subscription.startDate,
//           currentExpiryDate: result.subscription.currentExpiryDate,
//         },
//       },
//       { status: 201 },
//     );
//   } catch (error: unknown) {
//     console.error("POST complimentary user error:", error);

//     /*
//      * Prisma unique constraint handling
//      */
//     if (
//       typeof error === "object" &&
//       error !== null &&
//       "code" in error &&
//       error.code === "P2002"
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "An account with the provided email or phone already exists.",
//         },
//         { status: 409 },
//       );
//     }

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to create complimentary student account.",
//       },
//       { status: 500 },
//     );
//   }
// }

// export async function PATCH(request: NextRequest) {
//   try {
//     const adminUser = await getRequiredSuperAdmin();
//     const body = await request.json();

//     const userId = typeof body.userId === "string" ? body.userId : "";
//     if (!userId) {
//       return NextResponse.json(
//         { success: false, message: "User ID is required." },
//         { status: 400 },
//       );
//     }

//     const existingUser = await prisma.user.findUnique({
//       where: { id: userId },
//       select: { id: true, role: true, deletedAt: true, phone: true, email: true },
//     });

//     if (!existingUser || existingUser.deletedAt) {
//       return NextResponse.json(
//         { success: false, message: "Student not found." },
//         { status: 404 },
//       );
//     }

//     if (existingUser.role !== UserRole.STUDENT) {
//       return NextResponse.json(
//         { success: false, message: "Only student accounts can be edited here." },
//         { status: 400 },
//       );
//     }

//     const name = typeof body.name === "string" ? body.name.trim() : undefined;
//     const email =
//       typeof body.email === "string" ? body.email.trim().toLowerCase() : undefined;
//     const phone = typeof body.phone === "string" ? body.phone.trim() : undefined;
//     const discordName =
//       typeof body.discordName === "string" ? body.discordName.trim() : undefined;
//     const status =
//       body.status === "ACTIVE" || body.status === "INACTIVE"
//         ? (body.status as AccountStatus)
//         : undefined;

//     if (name !== undefined && !name) {
//       return NextResponse.json(
//         { success: false, message: "Full name cannot be empty." },
//         { status: 400 },
//       );
//     }

//     if (email !== undefined) {
//       if (!email) {
//         return NextResponse.json(
//           { success: false, message: "Email cannot be empty." },
//           { status: 400 },
//         );
//       }

//       const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!emailPattern.test(email)) {
//         return NextResponse.json(
//           { success: false, message: "Enter a valid email address." },
//           { status: 400 },
//         );
//       }

//       if (email !== existingUser.email) {
//         const existingEmail = await prisma.user.findUnique({
//           where: { email },
//           select: { id: true, deletedAt: true },
//         });

//         if (existingEmail && !existingEmail.deletedAt && existingEmail.id !== userId) {
//           return NextResponse.json(
//             { success: false, message: "An account with this email already exists." },
//             { status: 409 },
//           );
//         }
//       }
//     }

//     if (phone && phone !== existingUser.phone) {
//       const existingPhone = await prisma.user.findUnique({
//         where: { phone },
//         select: { id: true, deletedAt: true },
//       });

//       if (existingPhone && !existingPhone.deletedAt && existingPhone.id !== userId) {
//         return NextResponse.json(
//           {
//             success: false,
//             message: "An account with this phone number already exists.",
//           },
//           { status: 409 },
//         );
//       }
//     }

//     const { firstName, lastName } = name
//       ? getNameParts(name)
//       : { firstName: undefined, lastName: undefined };

//     const updatedUser = await prisma.$transaction(async (tx) => {
//       const user = await tx.user.update({
//         where: { id: userId },
//         data: {
//           ...(name !== undefined ? { name, firstName, lastName } : {}),
//           ...(email !== undefined ? { email } : {}),
//           ...(phone !== undefined ? { phone: phone || null } : {}),
//           ...(discordName !== undefined ? { discordName: discordName || null } : {}),
//           ...(status !== undefined ? { status } : {}),
//         },
//       });

//       if (status !== undefined) {
//         await tx.subscription.updateMany({
//           where: { userId, source: SubscriptionSource.COMPLIMENTARY, deletedAt: null },
//           data: {
//             status:
//               status === AccountStatus.ACTIVE
//                 ? SubscriptionStatus.ACTIVE
//                 : SubscriptionStatus.CANCELLED,
//           },
//         });
//       }

//       await tx.activityLog.create({
//         data: {
//           actorId: adminUser.id,
//           actorType: ActivityActorType.SUPER_ADMIN,
//           action: ActivityAction.ACCOUNT_UPDATED, // confirm this exists in your enum
//           module: "USERS",
//           title: "Complimentary student account updated",
//           description: "A complimentary student account was updated by an administrator.",
//           targetId: userId,
//           targetType: "USER",
//           afterData: { userId, name, email, phone, status },
//         },
//       });

//       return user;
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Student account updated successfully.",
//       user: {
//         id: updatedUser.id,
//         name: updatedUser.name,
//         email: updatedUser.email,
//         phone: updatedUser.phone,
//         discordName: updatedUser.discordName,
//         status: updatedUser.status,
//         createdAt: updatedUser.createdAt,
//       },
//     });
//   } catch (error: unknown) {
//     console.error("PATCH complimentary user error:", error);

//     if (
//       typeof error === "object" &&
//       error !== null &&
//       "code" in error &&
//       error.code === "P2002"
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "An account with the provided email or phone already exists.",
//         },
//         { status: 409 },
//       );
//     }

//     return NextResponse.json(
//       { success: false, message: "Failed to update student account." },
//       { status: 500 },
//     );
//   }
// }

// // export async function DELETE(request: NextRequest) {
// //   try {
// //     const adminUser = await getRequiredSuperAdmin();
// //     const body = await request.json();

// //     const userId = typeof body.userId === "string" ? body.userId : "";
// //     if (!userId) {
// //       return NextResponse.json(
// //         { success: false, message: "User ID is required." },
// //         { status: 400 },
// //       );
// //     }

// //     const user = await prisma.user.findUnique({
// //       where: { id: userId },
// //       select: {
// //         id: true,
// //         role: true,
// //         deletedAt: true,
// //         subscriptions: {
// //           where: { source: SubscriptionSource.COMPLIMENTARY, deletedAt: null },
// //           select: { id: true },
// //         },
// //       },
// //     });

// //     if (!user || user.deletedAt) {
// //       return NextResponse.json(
// //         { success: false, message: "Complimentary student not found." },
// //         { status: 404 },
// //       );
// //     }

// //     if (user.role !== UserRole.STUDENT) {
// //       return NextResponse.json(
// //         { success: false, message: "Only student accounts can be deleted here." },
// //         { status: 400 },
// //       );
// //     }

// //     if (user.subscriptions.length === 0) {
// //       return NextResponse.json(
// //         { success: false, message: "This is not a complimentary student account." },
// //         { status: 400 },
// //       );
// //     }

// //     await prisma.$transaction(async (tx) => {
// //       await tx.subscription.updateMany({
// //         where: {
// //           userId: user.id,
// //           source: SubscriptionSource.COMPLIMENTARY,
// //           deletedAt: null,
// //         },
// //         data: { deletedAt: new Date() },
// //       });

// //       await tx.user.update({
// //         where: { id: user.id },
// //         data: { deletedAt: new Date() },
// //       });

// //       await tx.activityLog.create({
// //         data: {
// //           actorId: adminUser.id,
// //           actorType: ActivityActorType.SUPER_ADMIN,
// //           action: ActivityAction.ACCOUNT_DELETED,
// //           module: "USERS",
// //           title: "Complimentary student account deleted",
// //           description: "A complimentary student account was deleted by an administrator.",
// //           targetId: user.id,
// //           targetType: "USER",
// //           afterData: {
// //             userId: user.id,
// //             subscriptionSource: SubscriptionSource.COMPLIMENTARY,
// //           },
// //         },
// //       });
// //     });

// //     return NextResponse.json({
// //       success: true,
// //       message: "Complimentary student deleted successfully.",
// //     });
// //   } catch (error) {
// //     console.error("DELETE complimentary user error:", error);
// //     return NextResponse.json(
// //       { success: false, message: "Failed to delete complimentary student." },
// //       { status: 500 },
// //     );
// //   }
// // }

// export async function DELETE(request: NextRequest) {
//   try {
//     const adminUser = await getRequiredSuperAdmin();
//     const body = await request.json();

//     const userId = typeof body.userId === "string" ? body.userId : "";
//     if (!userId) {
//       return NextResponse.json(
//         { success: false, message: "User ID is required." },
//         { status: 400 },
//       );
//     }

//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: { id: true, name: true, role: true },
//     });

//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: "Complimentary student not found." },
//         { status: 404 },
//       );
//     }

//     if (user.role !== UserRole.STUDENT) {
//       return NextResponse.json(
//         { success: false, message: "Only student accounts can be deleted here." },
//         { status: 400 },
//       );
//     }

//     await prisma.$transaction(async (tx) => {
//       // Delete dependent records first (adjust based on what your schema actually has)
//       await tx.subscriptionEvent.deleteMany({
//         where: { subscription: { userId } },
//       });
//       await tx.subscription.deleteMany({ where: { userId } });
//       await tx.userActivity.deleteMany({ where: { userId } });

//       // Log the deletion BEFORE removing the user, since activityLog
//       // references targetId — decide whether ActivityLog rows for this
//       // user should also be deleted, or kept with a dangling targetId.
//       await tx.activityLog.create({
//         data: {
//           actorId: adminUser.id,
//           actorType: ActivityActorType.SUPER_ADMIN,
//           action: ActivityAction.ACCOUNT_DELETED,
//           module: "USERS",
//           title: "Complimentary student account permanently deleted",
//           description:
//             "A complimentary student account was permanently deleted by an administrator.",
//           targetId: userId,
//           targetType: "USER",
//           afterData: { userId, name: user.name },
//         },
//       });

//       await tx.user.delete({ where: { id: userId } });
//     });

//     return NextResponse.json({
//       success: true,
//       message: `Complimentary student ${user.name} deleted successfully.`,
//     });
//   } catch (error) {
//     console.error("DELETE complimentary user error:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to delete complimentary student." },
//       { status: 500 },
//     );
//   }
// }

// this is the route to create students with free courses access

import { NextRequest, NextResponse } from "next/server";
import { randomBytes, scryptSync } from "crypto";
import { prisma } from "@/lib/prisma";
import {
  AccountStatus,
  ActivityAction,
  ActivityActorType,
  PlanType,
  SubscriptionEventType,
  SubscriptionSource,
  SubscriptionStatus,
  UserRole,
} from "@/generated/prisma/client";
import { getRequiredSuperAdmin } from "@/lib/current-user";

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");

  const hash = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

function getNameParts(name: string) {
  const parts = name.trim().split(/\s+/);

  const firstName = parts.shift() || "";
  const lastName = parts.length > 0 ? parts.join(" ") : null;

  return {
    firstName,
    lastName,
  };
}

export async function GET() {
  try {
    await getRequiredSuperAdmin();

    const users = await prisma.user.findMany({
      where: {
        role: UserRole.STUDENT,
        deletedAt: null,
        subscriptions: {
          some: {
            source: SubscriptionSource.COMPLIMENTARY,
            deletedAt: null,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        phone: true,
        discordName: true,
        status: true,
        createdAt: true,
        subscriptions: {
          where: {
            source: SubscriptionSource.COMPLIMENTARY,
            deletedAt: null,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            id: true,
            status: true,
            source: true,
            currentExpiryDate: true,
            plan: {
              select: {
                type: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        users,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET complimentary users error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch complimentary users.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUser = await getRequiredSuperAdmin();

    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    const password = typeof body.password === "string" ? body.password : "";

    const discordName = typeof body.discordName === "string" ? body.discordName : "";

    const status =
      body.status === "INACTIVE" ? AccountStatus.INACTIVE : AccountStatus.ACTIVE;

    // Plan type selection (defaults to YEARLY if not provided / invalid)
    const planType: PlanType =
      body.planType === "MONTHLY" ? PlanType.MONTHLY : PlanType.YEARLY;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Full name is required.",
        },
        { status: 400 },
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email address is required.",
        },
        { status: 400 },
      );
    }

    if (!discordName) {
      return NextResponse.json(
        {
          success: false,
          message: "Discord name is required",
        },
        {
          status: 400,
        },
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message: "Password is required.",
        },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters long.",
        },
        { status: 400 },
      );
    }

    // Check existing email
    const existingEmail = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        deletedAt: true,
      },
    });

    if (existingEmail && !existingEmail.deletedAt) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 },
      );
    }

    // Check existing phone
    if (phone) {
      const existingPhone = await prisma.user.findUnique({
        where: {
          phone,
        },
        select: {
          id: true,
          phone: true,
          deletedAt: true,
        },
      });

      if (existingPhone && !existingPhone.deletedAt) {
        return NextResponse.json(
          {
            success: false,
            message: "An account with this phone number already exists.",
          },
          { status: 409 },
        );
      }
    }

    // Find the selected subscription plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: {
        type: planType,
      },
      select: {
        id: true,
        type: true,
        name: true,
        durationMonths: true,
        active: true,
        deletedAt: true,
      },
    });

    if (!plan || !plan.active || plan.deletedAt) {
      return NextResponse.json(
        {
          success: false,
          message: `The ${planType.toLowerCase()} subscription plan is not available.`,
        },
        { status: 400 },
      );
    }

    // Prepare user data
    const { firstName, lastName } = getNameParts(name);

    const hashedPassword = hashPassword(password);

    const now = new Date();

    const expiryDate = new Date(now);

    expiryDate.setMonth(expiryDate.getMonth() + plan.durationMonths);

    // Create User + Complimentary Subscription + Logs

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          name,
          email,
          phone: phone || null,
          discordName: discordName || null,
          password: hashedPassword,
          role: UserRole.STUDENT,
          status,

          // Admin-created accounts are trusted and pre-verified
          emailVerifiedAt: now,
          emailVerificationCode: null,
          emailVerificationExpiresAt: null,
          emailVerificationAttempts: 0,
          emailVerificationLastSentAt: null,

          passwordChangedAt: now,
        },
      });

      const subscription = await tx.subscription.create({
        data: {
          userId: user.id,
          planId: plan.id,

          status:
            status === AccountStatus.ACTIVE
              ? SubscriptionStatus.ACTIVE
              : SubscriptionStatus.CANCELLED,

          source: SubscriptionSource.COMPLIMENTARY,

          purchaseDate: now,
          startDate: now,

          originalExpiryDate: expiryDate,
          currentExpiryDate: expiryDate,

          autoRenew: false,
        },
      });

      await tx.subscriptionEvent.create({
        data: {
          subscriptionId: subscription.id,

          type: SubscriptionEventType.PURCHASED,

          title: "Complimentary access created",

          description: "Complimentary course access was created by an administrator.",

          metadata: {
            source: "COMPLIMENTARY",
            planId: plan.id,
            planType: plan.type,
            planName: plan.name,
          },
        },
      });

      await tx.userActivity.create({
        data: {
          userId: user.id,
          actorId: adminUser.id,

          action: ActivityAction.ACCOUNT_CREATED,

          title: "Student account created",

          details: "A complimentary student account was created.",

          metadata: {
            source: "COMPLIMENTARY",
            subscriptionId: subscription.id,
            planId: plan.id,
          },
        },
      });

      await tx.activityLog.create({
        data: {
          actorId: adminUser.id,
          actorType: ActivityActorType.SUPER_ADMIN,

          action: ActivityAction.ACCOUNT_CREATED,

          module: "USERS",

          title: "Complimentary student account created",

          description: "A student account with complimentary course access was created.",

          targetId: user.id,
          targetType: "USER",

          afterData: {
            userId: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
            subscriptionId: subscription.id,
            subscriptionSource: SubscriptionSource.COMPLIMENTARY,
            planId: plan.id,
            planType: plan.type,
          },
        },
      });

      return {
        user,
        subscription,
      };
    });

    // Response

    return NextResponse.json(
      {
        success: true,

        message: "Complimentary student account created successfully.",

        user: {
          id: result.user.id,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          name: result.user.name,
          email: result.user.email,
          phone: result.user.phone,
          discordName: result.user.discordName,
          role: result.user.role,
          status: result.user.status,
          createdAt: result.user.createdAt,
        },

        subscription: {
          id: result.subscription.id,
          status: result.subscription.status,
          source: result.subscription.source,
          startDate: result.subscription.startDate,
          currentExpiryDate: result.subscription.currentExpiryDate,
          planType: plan.type,
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("POST complimentary user error:", error);

    /*
     * Prisma unique constraint handling
     */
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with the provided email or phone already exists.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create complimentary student account.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminUser = await getRequiredSuperAdmin();
    const body = await request.json();

    const userId = typeof body.userId === "string" ? body.userId : "";
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required." },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, deletedAt: true, phone: true, email: true },
    });

    if (!existingUser || existingUser.deletedAt) {
      return NextResponse.json(
        { success: false, message: "Student not found." },
        { status: 404 },
      );
    }

    if (existingUser.role !== UserRole.STUDENT) {
      return NextResponse.json(
        { success: false, message: "Only student accounts can be edited here." },
        { status: 400 },
      );
    }

    const name = typeof body.name === "string" ? body.name.trim() : undefined;
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : undefined;
    const phone = typeof body.phone === "string" ? body.phone.trim() : undefined;
    const discordName =
      typeof body.discordName === "string" ? body.discordName.trim() : undefined;
    const status =
      body.status === "ACTIVE" || body.status === "INACTIVE"
        ? (body.status as AccountStatus)
        : undefined;

    // New password is optional — only provided when the admin wants to change it
    const newPassword = typeof body.password === "string" ? body.password : "";

    if (newPassword && newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters long." },
        { status: 400 },
      );
    }

    if (name !== undefined && !name) {
      return NextResponse.json(
        { success: false, message: "Full name cannot be empty." },
        { status: 400 },
      );
    }

    if (email !== undefined) {
      if (!email) {
        return NextResponse.json(
          { success: false, message: "Email cannot be empty." },
          { status: 400 },
        );
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        return NextResponse.json(
          { success: false, message: "Enter a valid email address." },
          { status: 400 },
        );
      }

      if (email !== existingUser.email) {
        const existingEmail = await prisma.user.findUnique({
          where: { email },
          select: { id: true, deletedAt: true },
        });

        if (existingEmail && !existingEmail.deletedAt && existingEmail.id !== userId) {
          return NextResponse.json(
            { success: false, message: "An account with this email already exists." },
            { status: 409 },
          );
        }
      }
    }

    if (phone && phone !== existingUser.phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone },
        select: { id: true, deletedAt: true },
      });

      if (existingPhone && !existingPhone.deletedAt && existingPhone.id !== userId) {
        return NextResponse.json(
          {
            success: false,
            message: "An account with this phone number already exists.",
          },
          { status: 409 },
        );
      }
    }

    const { firstName, lastName } = name
      ? getNameParts(name)
      : { firstName: undefined, lastName: undefined };

    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          ...(name !== undefined ? { name, firstName, lastName } : {}),
          ...(email !== undefined ? { email } : {}),
          ...(phone !== undefined ? { phone: phone || null } : {}),
          ...(discordName !== undefined ? { discordName: discordName || null } : {}),
          ...(status !== undefined ? { status } : {}),
          ...(newPassword
            ? { password: hashPassword(newPassword), passwordChangedAt: new Date() }
            : {}),
        },
      });

      if (status !== undefined) {
        await tx.subscription.updateMany({
          where: { userId, source: SubscriptionSource.COMPLIMENTARY, deletedAt: null },
          data: {
            status:
              status === AccountStatus.ACTIVE
                ? SubscriptionStatus.ACTIVE
                : SubscriptionStatus.CANCELLED,
          },
        });
      }

      await tx.activityLog.create({
        data: {
          actorId: adminUser.id,
          actorType: ActivityActorType.SUPER_ADMIN,
          action: ActivityAction.ACCOUNT_UPDATED,
          module: "USERS",
          title: "Complimentary student account updated",
          description: "A complimentary student account was updated by an administrator.",
          targetId: userId,
          targetType: "USER",
          afterData: {
            userId,
            name,
            email,
            phone,
            status,
            passwordChanged: Boolean(newPassword),
          },
        },
      });

      return user;
    });

    return NextResponse.json({
      success: true,
      message: "Student account updated successfully.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        discordName: updatedUser.discordName,
        status: updatedUser.status,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error: unknown) {
    console.error("PATCH complimentary user error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with the provided email or phone already exists.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update student account." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminUser = await getRequiredSuperAdmin();
    const body = await request.json();

    const userId = typeof body.userId === "string" ? body.userId : "";
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        role: true,
        subscriptions: {
          select: { id: true, source: true },
        },
        orders: {
          select: { id: true },
          take: 1,
        },
        payments: {
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Complimentary student not found." },
        { status: 404 },
      );
    }

    if (user.role !== UserRole.STUDENT) {
      return NextResponse.json(
        { success: false, message: "Only student accounts can be deleted here." },
        { status: 400 },
      );
    }

    if (user.subscriptions.length === 0) {
      return NextResponse.json(
        { success: false, message: "This is not a complimentary student account." },
        { status: 400 },
      );
    }

    // Safety net: refuse a permanent delete if this account has real payment
    // history or a non-complimentary subscription. Those rows aren't
    // cascade-deletable and permanently deleting them would destroy
    // financial records.
    const hasNonComplimentarySubscription = user.subscriptions.some(
      (subscription) => subscription.source !== SubscriptionSource.COMPLIMENTARY,
    );

    if (
      hasNonComplimentarySubscription ||
      user.orders.length > 0 ||
      user.payments.length > 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This account has order or payment history and can't be permanently deleted.",
        },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      // Deleting the subscription cascades its SubscriptionEvent,
      // SubscriptionExtension, and SubscriptionNote rows automatically.
      await tx.subscription.deleteMany({
        where: { userId: user.id },
      });

      // targetId on ActivityLog is a plain string (no FK), so this is
      // safe to write even after the user row is gone.
      await tx.activityLog.create({
        data: {
          actorId: adminUser.id,
          actorType: ActivityActorType.SUPER_ADMIN,
          action: ActivityAction.ACCOUNT_DELETED,
          module: "USERS",
          title: "Complimentary student account permanently deleted",
          description:
            "A complimentary student account was permanently deleted by an administrator.",
          targetId: user.id,
          targetType: "USER",
          afterData: {
            userId: user.id,
            name: user.name,
            subscriptionSource: SubscriptionSource.COMPLIMENTARY,
          },
        },
      });

      // Deleting the user cascades AuthSession, CourseProgress,
      // LessonProgress, PasswordResetToken, and their own UserActivity rows.
      await tx.user.delete({ where: { id: user.id } });
    });

    return NextResponse.json({
      success: true,
      message: `Complimentary student ${user.name} deleted successfully.`,
    });
  } catch (error: unknown) {
    console.error("DELETE complimentary user error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This account has related records elsewhere in the system and can't be permanently deleted.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to delete complimentary student." },
      { status: 500 },
    );
  }
}
