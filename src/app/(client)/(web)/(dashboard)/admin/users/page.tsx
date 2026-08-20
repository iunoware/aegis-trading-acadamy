"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { toast } from "sonner";
import { UsersHeader } from "./(components)/UsersHeader";
import { UserOverviewCards } from "./(components)/UserOverviewCards";
import { UsersTable, User } from "./(components)/UsersTable";
import { UserSidebar } from "@/components/sidebar/UserSidebar";
import { EditUserModal } from "./(components)/EditUserModal";
import { DeleteUserModal } from "./(components)/DeleteUserModal";
import {
  getUsers,
  updateUser,
  deleteUser,
} from "@/lib/services/users.service";

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  // Fetch users from API using users.service
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
        console.log("Fetched users:", data.users);
      } else {
        toast.error(data.message || "Failed to load user directory");
      }
    } catch (error: any) {
      console.error("Failed to fetch users:", error);
      toast.error(error?.message || "Failed to connect to backend server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // GSAP Entrance Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (pageRef.current) {
        gsap.fromTo(
          pageRef.current.children,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: "power2.out",
          },
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, [loading]);

  // Compute KPI Values
  const totalRegistered = users.length;
  const subscribedCount = users.filter((u) => u.isSubscribed).length;
  const nonSubscribedCount = users.filter((u) => !u.isSubscribed).length;

  const now = new Date();
  const currentMonthStr = now
    .toLocaleString("en-US", { month: "short" })
    .toLowerCase();
  const currentYearStr = now.getFullYear().toString();

  const newThisMonth = users.filter((u) => {
    if (!u.joinedDate) return false;
    const joinedLower = u.joinedDate.toLowerCase();
    return (
      joinedLower.includes(currentMonthStr) &&
      joinedLower.includes(currentYearStr)
    );
  }).length;

  // Handlers
  const handleEditSave = async (updatedUser: User) => {
    try {
      const data = await updateUser(updatedUser.id, {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        discordName: updatedUser.discordName,
        accountStatus: updatedUser.accountStatus,
      });

      if (data.success && data.user) {
        setUsers((prev) =>
          prev.map((u) => (u.id === data.user.id ? data.user : u)),
        );
        if (selectedUser?.id === data.user.id) {
          setSelectedUser(data.user);
        }
        toast.success(`User profile for "${data.user.name}" updated!`);
      } else {
        toast.error(data.message || "Failed to update user profile");
      }
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(error?.message || "An error occurred while saving user changes");
    }
  };

  const handleToggleAccountStatus = async (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    const newStatus =
      targetUser.accountStatus === "Active" ? "Suspended" : "Active";

    try {
      const data = await updateUser(userId, {
        accountStatus: newStatus,
      });

      if (data.success && data.user) {
        setUsers((prev) =>
          prev.map((u) => (u.id === data.user.id ? data.user : u)),
        );
        if (selectedUser?.id === userId) {
          setSelectedUser(data.user);
        }
        toast.info(`Account status updated to ${newStatus}.`);
      } else {
        toast.error(data.message || "Failed to update account status");
      }
    } catch (error: any) {
      console.error("Error toggling account status:", error);
      toast.error(error?.message || "Failed to update account status");
    }
  };

  const handleOpenDeleteModal = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setDeletingUser(target);
    }
  };

  const handleConfirmDeleteUser = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    const userName = target?.name || "User";
    try {
      const data = await deleteUser(userId);

      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        if (selectedUser?.id === userId) {
          setSelectedUser(null);
        }
        toast.success(`User "${userName}" deleted permanently from database.`);
      } else {
        toast.error(data.message || "Failed to delete user from database");
      }
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error?.message || "Failed to delete user from database");
    }
  };

  const handleExportUsers = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        "ID,FirstName,LastName,Email,Phone,Subscribed,Status,JoinedDate,LastLogin",
      ]
        .concat(
          users.map(
            (u) =>
              `"${u.id}","${u.firstName}","${u.lastName}","${u.email}","${u.phone}","${u.isSubscribed ? "Subscribed" : "Not Subscribed"
              }","${u.accountStatus}","${u.joinedDate}","${u.lastLogin}"`,
          ),
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aegis_registered_users_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Exported master user directory to CSV!");
  };

  const handleUserUpdated = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    setSelectedUser(updatedUser);
  };

  return (
    <div
      ref={pageRef}
      aria-label="User Account Management Page"
      className="w-full max-w-[1600px] mx-auto space-y-8 pb-12"
    >
      {/* 1. Header */}
      <UsersHeader totalCount={users.length} onExport={handleExportUsers} />

      {/* 2. Overview KPI Cards */}
      <UserOverviewCards
        totalRegistered={totalRegistered}
        subscribedCount={subscribedCount}
        nonSubscribedCount={nonSubscribedCount}
        newThisMonth={newThisMonth}
      />

      {/* 3. Master Users Table */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-[#111113]/80 border border-white/10 text-zinc-400 font-mono text-sm space-y-3">
          <div className="inline-block w-6 h-6 border-2 border-[#C9A227] border-t-transparent rounded-full animate-spin" />
          <p>Loading Users Directory...</p>
        </div>
      ) : (
        <UsersTable
          users={users}
          onSelectUser={(user) => setSelectedUser(user)}
          onEditUser={(user) => setEditingUser(user)}
          onDeleteUser={handleOpenDeleteModal}
        />
      )}

      {/* 4. User Details Sidebar */}
      <UserSidebar
        isOpen={!!selectedUser}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onEditUser={(user) => setEditingUser(user)}
        onToggleStatus={handleToggleAccountStatus}
        onDeleteUser={handleOpenDeleteModal}
        onUserUpdated={handleUserUpdated}
      />

      {/* 5. Edit User Modal */}
      <EditUserModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleEditSave}
      />

      {/* 6. Delete User Confirmation Modal */}
      <DeleteUserModal
        isOpen={!!deletingUser}
        user={deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirmDelete={handleConfirmDeleteUser}
      />
    </div>
  );
}

