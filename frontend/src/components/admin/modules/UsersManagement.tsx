"use client";

import { useState } from "react";
import { DataTable, Column } from "../shared/DataTable";
import {
  RiUserStarLine,
  RiShieldUserLine,
  RiUserSearchLine,
  RiUserHeartLine,
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCheckDoubleLine,
  RiForbidLine,
  RiShieldFlashLine,
  RiCloseLine,
  RiSaveLine,
} from "react-icons/ri";

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: string;
  college?: string;
  department?: string;
  status?: string;
  phone?: string;
  createdAt?: string;
}

interface UsersManagementProps {
  users: UserRecord[];
  onRefresh?: () => void;
  onStatusChange?: (id: string, status: string) => void;
  onDeleteUser?: (id: string) => void;
}

export function UsersManagement({
  users,
  onRefresh,
  onStatusChange,
  onDeleteUser,
}: UsersManagementProps) {
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [userList, setUserList] = useState<UserRecord[]>(users);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("user");
  const [editCollege, setEditCollege] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const displayUsers = userList.length > 0 ? userList : users;

  const filteredUsers = displayUsers.filter((u) => {
    if (roleFilter === "all") return true;
    return u.role === roleFilter;
  });

  const handleOpenEdit = (user: UserRecord) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role || "user");
    setEditCollege(user.college || "MACFAST College");
    setEditPhone(user.phone || "");
  };

  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUserList((prev) =>
      prev.map((u) =>
        u._id === editingUser._id
          ? {
              ...u,
              name: editName,
              email: editEmail,
              role: editRole,
              college: editCollege,
              phone: editPhone,
            }
          : u
      )
    );
    setEditingUser(null);
    onRefresh?.();
  };

  const handleBanToggle = (id: string, currentStatus?: string) => {
    const newStatus = currentStatus === "BANNED" ? "ACTIVE" : "BANNED";
    setUserList((prev) =>
      prev.map((u) => (u._id === id ? { ...u, status: newStatus } : u))
    );
    onStatusChange?.(id, newStatus);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this user account?")) {
      setUserList((prev) => prev.filter((u) => u._id !== id));
      onDeleteUser?.(id);
    }
  };

  const handlePromoteAdmin = (id: string) => {
    setUserList((prev) =>
      prev.map((u) => (u._id === id ? { ...u, role: "admin" } : u))
    );
    onRefresh?.();
  };

  const columns: Column<UserRecord>[] = [
    {
      key: "name",
      header: "User / Delegate",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#F5B301]/10 border border-[#F5B301]/30 flex items-center justify-center text-[#F5B301] font-bold text-xs uppercase shrink-0">
            {row.name?.[0] || "U"}
          </div>
          <div>
            <p className="font-bold text-white text-xs">{row.name}</p>
            <p className="text-[10px] text-zinc-400 font-mono">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "System Role",
      render: (row) => {
        const role = row.role || "user";
        const badgeColors: Record<string, string> = {
          admin: "bg-purple-500/20 text-purple-300 border-purple-500/30 font-bold",
          judge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          volunteer: "bg-blue-500/20 text-blue-300 border-blue-500/30",
          user: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        };
        return (
          <span
            className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
              badgeColors[role] || badgeColors.user
            }`}
          >
            {role === "admin" ? "Super Admin" : role}
          </span>
        );
      },
    },
    {
      key: "college",
      header: "Institution / Department",
      render: (row) => (
        <div>
          <p className="text-xs font-semibold text-zinc-200">{row.college || "MACFAST College"}</p>
          <p className="text-[10px] text-zinc-500">{row.department || "General Stream"}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Account Status",
      render: (row) => {
        const status = row.status || "ACTIVE";
        const isBanned = status === "BANNED" || status === "SUSPENDED";
        return (
          <span
            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
              isBanned
                ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                : "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
            }`}
          >
            {isBanned ? "Banned / Suspended" : "Active"}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Role Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-zinc-900/60 border border-zinc-800/80">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All Accounts" },
            { id: "admin", label: "Super Admins" },
            { id: "judge", label: "Judges Panel" },
            { id: "volunteer", label: "Volunteers" },
            { id: "user", label: "Delegates & Students" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                roleFilter === tab.id
                  ? "bg-[#F5B301] text-zinc-950 shadow-md"
                  : "bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        title="Super Admin User Management & Access Control"
        columns={columns}
        data={filteredUsers}
        searchKey="name"
        searchPlaceholder="Search user name, email, college, role, or status..."
        onRefresh={onRefresh}
        exportFileName="macfiesta_users_directory"
        actions={(row) => (
          <div className="flex items-center justify-end gap-1.5">
            {/* Edit User Button */}
            <button
              onClick={() => handleOpenEdit(row)}
              className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white text-xs cursor-pointer"
              title="Edit User Details"
            >
              <RiEditLine size={14} />
            </button>

            {/* Promote Admin Button */}
            {row.role !== "admin" && (
              <button
                onClick={() => handlePromoteAdmin(row._id)}
                className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 text-xs cursor-pointer"
                title="Grant Super Admin Privileges"
              >
                <RiShieldFlashLine size={14} />
              </button>
            )}

            {/* Ban / Unban Toggle Button */}
            <button
              onClick={() => handleBanToggle(row._id, row.status)}
              className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                row.status === "BANNED"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
              }`}
              title={row.status === "BANNED" ? "Unban User" : "Ban User"}
            >
              <RiForbidLine size={14} />
            </button>

            {/* Permanent Delete Button */}
            <button
              onClick={() => handleDelete(row._id)}
              className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs cursor-pointer"
              title="Permanently Remove Account"
            >
              <RiDeleteBinLine size={14} />
            </button>
          </div>
        )}
      />

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#111114] border border-zinc-800 p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <RiEditLine className="text-[#F5B301]" /> Edit User Profile & Permissions
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-zinc-500 hover:text-white cursor-pointer"
              >
                <RiCloseLine size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#F5B301]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#F5B301]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Role & Privilege</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="user">Delegate / Student</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="judge">Judge Panel</option>
                    <option value="admin">Super Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">College / Institution</label>
                  <input
                    type="text"
                    value={editCollege}
                    onChange={(e) => setEditCollege(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#F5B301]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#F5B301]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#F5B301] hover:bg-amber-300 text-zinc-950 font-black flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <RiSaveLine size={14} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
