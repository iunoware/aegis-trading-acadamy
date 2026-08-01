"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { toast } from "sonner";
import { UsersHeader } from "./(components)/UsersHeader";
import { UserOverviewCards } from "./(components)/UserOverviewCards";
import { UsersTable, User } from "./(components)/UsersTable";
import { UserDetailsDrawer } from "./(components)/UserDetailsDrawer";
import { EditUserModal } from "./(components)/EditUserModal";

const INITIAL_USERS: User[] = [
  {
    id: "usr-1001",
    firstName: "Aarav",
    lastName: "Sharma",
    name: "Aarav Sharma",
    email: "aarav.sharma@gmail.com",
    phone: "+91 98765 43210",
    isSubscribed: true,
    accountStatus: "Active",
    joinedDate: "15 Jan 2026",
    lastLogin: "10 mins ago",
    activityTimeline: [
      {
        id: "act-1",
        action: "Logged In",
        date: "01 Aug 2026",
        details: "Authenticated via Web Browser from Mumbai, IN.",
      },
      {
        id: "act-2",
        action: "Updated Profile",
        date: "12 May 2026",
        details: "Updated primary phone number and contact details.",
      },
      {
        id: "act-3",
        action: "Changed Password",
        date: "10 Mar 2026",
        details: "Account security password updated.",
      },
      {
        id: "act-4",
        action: "Account Created",
        date: "15 Jan 2026",
        details: "Registered account on Aegis Trading Academy.",
      },
    ],
  },
  {
    id: "usr-1002",
    firstName: "Priya",
    lastName: "Patel",
    name: "Priya Patel",
    email: "priya.patel@yahoo.com",
    phone: "+91 98123 45678",
    isSubscribed: true,
    accountStatus: "Active",
    joinedDate: "10 Jun 2026",
    lastLogin: "1 hour ago",
    activityTimeline: [
      {
        id: "act-5",
        action: "Logged In",
        date: "01 Aug 2026",
        details: "Web session started.",
      },
      {
        id: "act-6",
        action: "Changed Password",
        date: "20 Jun 2026",
        details: "Security password updated.",
      },
      {
        id: "act-7",
        action: "Account Created",
        date: "10 Jun 2026",
        details: "Registered account on Aegis Trading Academy.",
      },
    ],
  },
  {
    id: "usr-1003",
    firstName: "Rohan",
    lastName: "Verma",
    name: "Rohan Verma",
    email: "rohan.v@outlook.com",
    phone: "+91 97654 32109",
    isSubscribed: false,
    accountStatus: "Active",
    joinedDate: "28 Feb 2026",
    lastLogin: "3 hours ago",
    activityTimeline: [
      {
        id: "act-8",
        action: "Logged In",
        date: "01 Aug 2026",
        details: "Logged in via Chrome desktop browser.",
      },
      {
        id: "act-9",
        action: "Account Created",
        date: "28 Feb 2026",
        details: "Registered account on Aegis Trading Academy.",
      },
    ],
  },
  {
    id: "usr-1004",
    firstName: "Sneha",
    lastName: "Reddy",
    name: "Sneha Reddy",
    email: "sneha.reddy@gmail.com",
    phone: "+91 96543 21098",
    isSubscribed: false,
    accountStatus: "Active",
    joinedDate: "01 May 2026",
    lastLogin: "5 days ago",
    activityTimeline: [
      {
        id: "act-10",
        action: "Logged Out",
        date: "27 Jul 2026",
        details: "User session ended cleanly.",
      },
      {
        id: "act-11",
        action: "Account Created",
        date: "01 May 2026",
        details: "Registered account on Aegis Trading Academy.",
      },
    ],
  },
  {
    id: "usr-1005",
    firstName: "Vikram",
    lastName: "Malhotra",
    name: "Vikram Malhotra",
    email: "vikram.m@gmail.com",
    phone: "+91 95432 10987",
    isSubscribed: true,
    accountStatus: "Active",
    joinedDate: "12 Jul 2026",
    lastLogin: "Yesterday",
    activityTimeline: [
      {
        id: "act-12",
        action: "Logged In",
        date: "31 Jul 2026",
        details: "Web session active.",
      },
      {
        id: "act-13",
        action: "Account Created",
        date: "12 Jul 2026",
        details: "Registered account on Aegis Trading Academy.",
      },
    ],
  },
  {
    id: "usr-1006",
    firstName: "Ananya",
    lastName: "Iyer",
    name: "Ananya Iyer",
    email: "ananya.iyer@gmail.com",
    phone: "+91 94321 09876",
    isSubscribed: true,
    accountStatus: "Active",
    joinedDate: "25 Jul 2026",
    lastLogin: "2 hours ago",
    activityTimeline: [
      {
        id: "act-14",
        action: "Logged In",
        date: "01 Aug 2026",
        details: "Logged in via Mobile Safari.",
      },
      {
        id: "act-15",
        action: "Account Created",
        date: "25 Jul 2026",
        details: "Registered account on Aegis Trading Academy.",
      },
    ],
  },
  {
    id: "usr-1007",
    firstName: "Devansh",
    lastName: "Nambiar",
    name: "Devansh Nambiar",
    email: "devansh.n@yahoo.com",
    phone: "+91 93210 98765",
    isSubscribed: false,
    accountStatus: "Suspended",
    joinedDate: "05 Mar 2026",
    lastLogin: "2 weeks ago",
    activityTimeline: [
      {
        id: "act-16",
        action: "Account Suspended",
        date: "10 May 2026",
        details: "Account suspended by administrator.",
      },
      {
        id: "act-17",
        action: "Account Created",
        date: "05 Mar 2026",
        details: "Registered account on Aegis Trading Academy.",
      },
    ],
  },
  {
    id: "usr-1008",
    firstName: "Karan",
    lastName: "Mehta",
    name: "Karan Mehta",
    email: "karan.mehta@hotmail.com",
    phone: "+91 92109 87654",
    isSubscribed: true,
    accountStatus: "Active",
    joinedDate: "18 Jul 2026",
    lastLogin: "4 hours ago",
    activityTimeline: [
      {
        id: "act-18",
        action: "Logged In",
        date: "01 Aug 2026",
        details: "Web session active.",
      },
      {
        id: "act-19",
        action: "Account Created",
        date: "18 Jul 2026",
        details: "Registered account on Aegis Trading Academy.",
      },
    ],
  },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

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
          }
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // Compute KPI Values
  const totalRegistered = users.length;
  const subscribedCount = users.filter((u) => u.isSubscribed).length;
  const nonSubscribedCount = users.filter((u) => !u.isSubscribed).length;
  const newThisMonth = users.filter(
    (u) =>
      u.joinedDate.toLowerCase().includes("jul 2026") ||
      u.joinedDate.toLowerCase().includes("aug 2026")
  ).length;

  // Handlers
  const handleEditSave = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    if (selectedUser?.id === updatedUser.id) {
      setSelectedUser(updatedUser);
    }
    toast.success(`User profile for "${updatedUser.name}" updated!`);
  };

  const handleToggleAccountStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.accountStatus === "Active" ? "Suspended" : "Active";
          const updatedUser: User = {
            ...u,
            accountStatus: newStatus,
            activityTimeline: [
              {
                id: `act-status-${Date.now()}`,
                action: `Account ${newStatus}`,
                date: "01 Aug 2026",
                details: `Admin changed account status to ${newStatus}.`,
              },
              ...u.activityTimeline,
            ],
          };

          if (selectedUser?.id === userId) {
            setSelectedUser(updatedUser);
          }

          return updatedUser;
        }
        return u;
      })
    );

    toast.info(`Account status updated.`);
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (selectedUser?.id === userId) {
      setSelectedUser(null);
    }
    toast.error(`User "${userToDelete?.name || "User"}" deleted.`);
  };

  const handleExportUsers = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["ID,FirstName,LastName,Email,Phone,Subscribed,Status,JoinedDate,LastLogin"]
        .concat(
          users.map(
            (u) =>
              `"${u.id}","${u.firstName}","${u.lastName}","${u.email}","${u.phone}","${
                u.isSubscribed ? "Subscribed" : "Not Subscribed"
              }","${u.accountStatus}","${u.joinedDate}","${u.lastLogin}"`
          )
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

  return (
    <div
      ref={pageRef}
      aria-label="User Account Management Page"
      className="w-full max-w-[1600px] mx-auto space-y-8 pb-12"
    >
      {/* 1. Header */}
      <UsersHeader
        totalCount={users.length}
        onExport={handleExportUsers}
      />

      {/* 2. Overview KPI Cards */}
      <UserOverviewCards
        totalRegistered={totalRegistered}
        subscribedCount={subscribedCount}
        nonSubscribedCount={nonSubscribedCount}
        newThisMonth={newThisMonth}
      />

      {/* 3. Master Users Table */}
      <UsersTable
        users={users}
        onSelectUser={(user) => setSelectedUser(user)}
        onEditUser={(user) => setEditingUser(user)}
        onDeleteUser={handleDeleteUser}
      />

      {/* 4. User Details Drawer */}
      <UserDetailsDrawer
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onEditUser={(user) => setEditingUser(user)}
        onToggleStatus={handleToggleAccountStatus}
        onDeleteUser={handleDeleteUser}
      />

      {/* 5. Edit User Modal */}
      <EditUserModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleEditSave}
      />
    </div>
  );
}
