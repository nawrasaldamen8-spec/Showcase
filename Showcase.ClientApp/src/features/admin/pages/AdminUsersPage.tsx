import React, { useEffect, useState } from "react";
import {
  Ban,
  CheckCircle2,
  ExternalLink,
  Search,
  Shield,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Input } from "@shared/components/Input.tsx";
import { VerifiedBadge } from "@shared/components/VerifiedBadge.tsx";
import { useAsyncData } from "@shared/hooks/index.ts";
import { apiClient } from "@shared/api/index.ts";
import { toast } from "sonner";
import { formatBytes } from "@shared/utils/format.ts";
import type { AdminUserListItem, UserRole } from "@shared/types/index.ts";
import { AdminLayout } from "../components/AdminLayout.tsx";
import { AdminPasswordConfirmModal } from "../components/AdminPasswordConfirmModal.tsx";
import { AdminTable, type AdminTableColumn } from "../components/AdminTable.tsx";
import { BanUserModal } from "../components/BanUserModal.tsx";

export const AdminUsersPage: React.FC = () => {

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUserForBan, setSelectedUserForBan] = useState<AdminUserListItem | null>(null);
  const [selectedUserForRoleChange, setSelectedUserForRoleChange] = useState<AdminUserListItem | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const {
    data: users,
    isLoading,
    reload: loadUsers,
  } = useAsyncData(() => apiClient.getUsers(debouncedSearch, statusFilter, roleFilter));

  useEffect(() => {
    loadUsers();
  }, [debouncedSearch, statusFilter, roleFilter, loadUsers]);

  const handleConfirmBan = async (userId: string, reason: string) => {
    await apiClient.banUser(userId, reason);
    toast.success("User account suspended successfully.");
    loadUsers();
  };

  const handleConfirmUnban = async (userId: string) => {
    await apiClient.unbanUser(userId);
    toast.success("User account reinstated.");
    loadUsers();
  };

  const handleConfirmRoleChange = async (adminPassword: string) => {
    if (!selectedUserForRoleChange) return;
    const user = selectedUserForRoleChange;
    const hasAdmin = user.roles.includes("Admin");
    const nextRoles: UserRole[] = hasAdmin
      ? user.roles.filter((r) => r !== "Admin")
      : [...user.roles, "Admin"];

    await apiClient.updateUserRole(user.id, nextRoles, adminPassword);
    toast.success(
      hasAdmin
        ? `Admin privileges revoked for @${user.username}.`
        : `Admin privileges granted to @${user.username}.`
    );
    loadUsers();
  };

  const handleToggleVerification = async (user: AdminUserListItem) => {
    const nextVerified = !user.isVerified;
    try {
      await apiClient.toggleUserVerification(
        user.id,
        nextVerified,
        nextVerified
          ? "Direct verified badge granted by administrator."
          : "Verified badge revoked by administrator."
      );
      toast.success(
        nextVerified
          ? `Verified badge granted to @${user.username}.`
          : `Verified badge revoked from @${user.username}.`
      );
      loadUsers();
    } catch {
      toast.error("Failed to update verification status.");
    }
  };

  const columns: AdminTableColumn<AdminUserListItem>[] = [
    {
      key: "creator",
      header: "Creator / Account",
      render: (user) => (
        <div className="flex items-center gap-3">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-9 h-9 rounded-full object-cover border border-stone"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-slate-dark text-ivory-light flex items-center justify-center font-gothic text-xs font-bold uppercase">
              {user.name?.[0] || user.username[0]}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-gothic font-bold uppercase tracking-wider text-slate-dark">
                {user.name}
              </span>
              {user.isVerified && <VerifiedBadge size="xs" />}
            </div>
            <span className="text-cloud-dark font-serif text-[11px] block">
              @{user.username}{user.email ? ` • ${user.email}` : ""}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "roles",
      header: "Roles",
      render: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.roles.map((role) => (
            <span
              key={role}
              className={`px-2 py-0.5 rounded-full font-gothic text-[9px] font-bold uppercase tracking-wider ${
                role === "Admin"
                  ? "bg-[#2e7d32]/15 text-[#2e7d32] border border-[#2e7d32]/30"
                  : "bg-[#e8e5dc] text-slate-dark border border-stone"
              }`}
            >
              {role}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (user) =>
        user.status === "active" ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#2e7d32]/10 text-[#2e7d32] font-gothic text-[10px] font-bold uppercase tracking-wider border border-[#2e7d32]/30">
            <CheckCircle2 className="w-3 h-3" /> Active
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-700 font-gothic text-[10px] font-bold uppercase tracking-wider border border-red-500/30"
            title={user.banReason || undefined}
          >
            <Ban className="w-3 h-3" /> Suspended
          </span>
        ),
    },
    {
      key: "works",
      header: "Works",
      render: (user) => (
        <span className="font-gothic font-bold text-slate-dark">{user.postsCount}</span>
      ),
    },
    {
      key: "storage",
      header: "Storage",
      render: (user) => (
        <span className="text-cloud-dark">{formatBytes(user.storageUsedBytes)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (user) => (
        <div className="inline-flex items-center gap-1.5 justify-end">
          <a
            href={`/u/${user.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-cloud-dark hover:text-slate-dark hover:bg-[#e8e5dc] transition-colors"
            title="View Public Profile"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={() => handleToggleVerification(user)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              user.isVerified
                ? "text-clay hover:bg-clay/10"
                : "text-cloud-dark hover:text-clay hover:bg-[#e8e5dc]"
            }`}
            title={user.isVerified ? "Revoke Verification Badge" : "Grant Verification Badge"}
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setSelectedUserForRoleChange(user)}
            className="p-1.5 rounded-lg text-cloud-dark hover:text-[#2e7d32] hover:bg-[#e8e5dc] transition-colors cursor-pointer"
            title={user.roles.includes("Admin") ? "Revoke Admin Role" : "Make Admin"}
          >
            <Shield className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setSelectedUserForBan(user)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              user.status === "suspended"
                ? "text-[#2e7d32] hover:bg-[#2e7d32]/10"
                : "text-clay hover:bg-red-500/10 hover:text-red-700"
            }`}
            title={user.status === "suspended" ? "Reinstate Account" : "Suspend Account"}
          >
            {user.status === "suspended" ? (
              <UserCheck className="w-4 h-4" />
            ) : (
              <Ban className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      title="User Directory &amp; Moderation"
      subtitle="Search accounts, manage permissions, and enforce community standing rules."
    >
      {/* Filters & Search Header */}
      <div className="bg-ivory-light p-4 rounded-2xl border border-stone flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-cloud-dark absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by handle, name, email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 bg-ivory-medium border-stone"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-stone bg-ivory-medium font-serif text-xs text-slate-dark focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-stone bg-ivory-medium font-serif text-xs text-slate-dark focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="Creator">Creators</option>
            <option value="Admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      <AdminTable<AdminUserListItem>
        columns={columns}
        rows={users || []}
        isLoading={isLoading}
        loadingMessage="Loading user directory..."
        emptyMessage="No accounts matching the search criteria."
      />

      {/* Ban / Reinstatement Modal */}
      <BanUserModal
        user={selectedUserForBan}
        isOpen={!!selectedUserForBan}
        onClose={() => setSelectedUserForBan(null)}
        onConfirmBan={handleConfirmBan}
        onConfirmUnban={handleConfirmUnban}
      />

      {/* Admin Role Password Confirmation Modal */}
      <AdminPasswordConfirmModal
        isOpen={!!selectedUserForRoleChange}
        onClose={() => setSelectedUserForRoleChange(null)}
        onConfirm={handleConfirmRoleChange}
        title={
          selectedUserForRoleChange?.roles.includes("Admin")
            ? "Revoke Administrator Role"
            : "Grant Administrator Role"
        }
        description={`Target user: @${selectedUserForRoleChange?.username} (${selectedUserForRoleChange?.name})`}
        actionLabel={
          selectedUserForRoleChange?.roles.includes("Admin")
            ? "Confirm Revoke Admin"
            : "Confirm Grant Admin"
        }
        variant={selectedUserForRoleChange?.roles.includes("Admin") ? "slate" : "clay"}
      />
    </AdminLayout>
  );
};
