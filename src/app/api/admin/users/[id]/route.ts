import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapUIToAccountStatus, transformUserToUI } from "@/lib/user-transform";
import { ActivityAction } from "@/generated/prisma/client";
import { getCurrentAdminUser } from "@/lib/current-user";

export const runtime = "nodejs";

interface RouteProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PATCH /api/admin/users/:id
 * Allows updating: firstName, lastName, phone, discordName, status / accountStatus
 */
export async function PATCH(request: Request, { params }: RouteProps) {
  try {
    const adminUser = await getCurrentAdminUser();

    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized admin access" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Verify user exists and is not soft deleted
    const existingUser = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const { firstName, lastName, phone, discordName, status, accountStatus } = body;

    // Determine status update if any
    const rawStatus = accountStatus ?? status;
    const newAccountStatus = rawStatus ? mapUIToAccountStatus(rawStatus) : undefined;

    // Determine new full name
    const newFirstName = firstName !== undefined ? firstName.trim() : existingUser.firstName;
    const newLastName = lastName !== undefined ? lastName.trim() : (existingUser.lastName || "");
    const updatedName = `${newFirstName} ${newLastName}`.trim();

    // Prepare Prisma update payload
    const updateData: Record<string, unknown> = {};

    if (firstName !== undefined) updateData.firstName = newFirstName;
    if (lastName !== undefined) updateData.lastName = newLastName;
    if (firstName !== undefined || lastName !== undefined) updateData.name = updatedName;
    if (phone !== undefined) updateData.phone = phone.trim() || null;
    if (discordName !== undefined) updateData.discordName = discordName.trim() || null;
    if (newAccountStatus !== undefined) updateData.status = newAccountStatus;

    // Perform database update
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        subscriptions: {
          select: {
            id: true,
            status: true,
            currentExpiryDate: true,
          },
        },
        accountActivities: {
          take: 10,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    // Record Activity Log if status or profile updated
    if (newAccountStatus && newAccountStatus !== existingUser.status) {
      await prisma.userActivity.create({
        data: {
          userId: id,
          actorId: adminUser.id,
          action:
            newAccountStatus === "SUSPENDED"
              ? ActivityAction.ACCOUNT_SUSPENDED
              : ActivityAction.ACCOUNT_REACTIVATED,
          title: `Account ${newAccountStatus === "SUSPENDED" ? "Suspended" : "Activated"}`,
          details: `Account status changed to ${newAccountStatus} by ${adminUser.name}.`,
        },
      }).catch(() => null);
    } else if (firstName !== undefined || lastName !== undefined || phone !== undefined || discordName !== undefined) {
      await prisma.userActivity.create({
        data: {
          userId: id,
          actorId: adminUser.id,
          action: ActivityAction.ACCOUNT_UPDATED,
          title: "Updated Profile",
          details: `Account information updated by administrator (${adminUser.name}).`,
        },
      }).catch(() => null);
    }

    const transformed = transformUserToUI(updatedUser);

    return NextResponse.json({
      success: true,
      user: transformed,
      message: "User profile updated successfully",
    });
  } catch (error) {
    console.error("PATCH /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user profile" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/:id
 * Permanent hard delete: clears user and linked records from database
 */
export async function DELETE(_request: Request, { params }: RouteProps) {
  try {
    const adminUser = await getCurrentAdminUser();

    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized admin access" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found in database" },
        { status: 404 }
      );
    }

    // Perform hard delete inside transaction to clear user and related records from database
    await prisma.$transaction([
      prisma.subscriptionExtension.deleteMany({
        where: { OR: [{ subscription: { userId: id } }, { extendedById: id }] },
      }),
      prisma.subscriptionNote.deleteMany({
        where: { OR: [{ subscription: { userId: id } }, { authorId: id }] },
      }),
      prisma.subscriptionEvent.deleteMany({
        where: { OR: [{ subscription: { userId: id } }, { actorId: id }] },
      }),
      prisma.subscription.deleteMany({ where: { userId: id } }),
      prisma.refund.deleteMany({ where: { userId: id } }),
      prisma.payment.deleteMany({ where: { userId: id } }),
      prisma.order.deleteMany({ where: { userId: id } }),
      prisma.userActivity.deleteMany({
        where: { OR: [{ userId: id }, { actorId: id }] },
      }),
      prisma.activityLog.deleteMany({
        where: { OR: [{ actorId: id }, { targetId: id }] },
      }),
      prisma.user.updateMany({
        where: { deletedById: id },
        data: { deletedById: null },
      }),
      prisma.user.delete({ where: { id } }),
    ]);

    return NextResponse.json({
      success: true,
      message: `User ${existingUser.name} deleted permanently from database`,
      id,
    });
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete user from database" },
      { status: 500 }
    );
  }
}
