import React, { useState } from "react";
import {
  Ban,
  CheckCircle2,
  ExternalLink,
  Search,
  Shield,
  UserCheck,
} from "lucide-react";
import { Input } from "@shared/components/Input.tsx";
import { VerifiedBadge } from "@shared/components/VerifiedBadge.tsx";
import { useAsyncData } from "@shared/hooks/index.ts";
import { apiClient } from "@shared/api/index.ts";
import { useToast } from "@shared/context/index.ts";
import type { AdminUserListItem, UserRole } from "@shared/types/index.ts";
import { AdminLayout } from "../components/AdminLayout.tsx";
import { BanUserModal } from "../components/BanUserModal.tsx";

function formatStorage(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}

export const AdminUsersPage: React.FC = () => {
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUserForBan, setSelectedUserForBan] = useState<AdminUserListItem | null>(null);

  const {
    data: users,
    isLoading,
    reload: loadUsers,
  } = useAsyncData(() => apiClient.getUsers(search, statusFilter, roleFilter));

  React.useEffect(() => {
    loadUsers();
  }, [search, statusFilter, roleFilter, loadUsers]);

  const handleConfirmBan = async (userId: string, reason: string) => {
    await apiClient.banUser(userId, reason);
    showToast("success", "User account suspended successfully.");
    loadUsers();
  };

  const handleConfirmUnban = async (userId: string) => {
    await apiClient.unbanUser(userId);
    showToast("success", "User account reinstated.");
    loadUsers();
  };

  const handleToggleAdminRole = async (user: AdminUserListItem) => {
    const hasAdmin = user.roles.includes("Admin");
    const nextRoles: UserRole[] = hasAdmin
      ? user.roles.filter((r) => r !== "Admin")
      : [...user.roles, "Admin"];

    try {
      await apiClient.updateUserRole(user.id, nextRoles);
      showToast(
        "success",
        hasAdmin
          ? `Admin privileges revoked for @${user.username}.`
          : `Admin privileges granted to @${user.username}.`
      );
      loadUsers();
    } catch {
      showToast("error", "Failed to update user role.");
    }
  };

  return (
    <AdminLayout
      title="User Directory &amp; Moderation"
      subtitle="Search accounts, manage permissions, and enforce community standing rules."
    >
      {/* Filters & Search Header */}
      <div className="bg-[#faf9f5] p-4 rounded-2xl border border-[#cccbc8] flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#87867f] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by handle, name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#f0eee6] border-[#cccbc8]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#cccbc8] bg-[#f0eee6] font-serif text-xs text-[#141413] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#cccbc8] bg-[#f0eee6] font-serif text-xs text-[#141413] focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="Creator">Creators</option>
            <option value="Admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-[#faf9f5] rounded-2xl border border-[#cccbc8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-serif text-xs">
            <thead>
              <tr className="border-b border-[#cccbc8] bg-[#f0eee6] font-gothic text-[10px] font-bold uppercase tracking-[0.14em] text-[#87867f]">
                <th className="py-3 px-4">Creator / Account</th>
                <th className="py-3 px-4">Roles</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Works</th>
                <th className="py-3 px-4">Storage</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#cccbc8]/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#87867f]">
                    Loading user directory...
                  </td>
                </tr>
              ) : !users || users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#87867f]">
                    No accounts matching the search criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#f0eee6]/50 transition-colors">
                    {/* User info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.username}
                            className="w-9 h-9 rounded-full object-cover border border-[#cccbc8]"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#141413] text-[#faf9f5] flex items-center justify-center font-gothic text-xs font-bold uppercase">
                            {user.firstName[0]}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-gothic font-bold uppercase tracking-wider text-[#141413]">
                              {user.firstName} {user.lastName}
                            </span>
                            {user.isVerified && <VerifiedBadge size="xs" />}
                          </div>
                          <span className="text-[#87867f] font-serif text-[11px] block">
                            @{user.username} &bull; {user.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Roles */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <span
                            key={role}
                            className={`px-2 py-0.5 rounded-full font-gothic text-[9px] font-bold uppercase tracking-wider ${
                              role === "Admin"
                                ? "bg-[#2e7d32]/15 text-[#2e7d32] border border-[#2e7d32]/30"
                                : "bg-[#e8e5dc] text-[#141413] border border-[#cccbc8]"
                            }`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {user.status === "active" ? (
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
                      )}
                    </td>

                    {/* Works */}
                    <td className="py-3.5 px-4 font-gothic font-bold text-[#141413]">
                      {user.postsCount}
                    </td>

                    {/* Storage */}
                    <td className="py-3.5 px-4 text-[#87867f]">
                      {formatStorage(user.storageUsedBytes)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <a
                          href={`/u/${user.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-[#87867f] hover:text-[#141413] hover:bg-[#e8e5dc] transition-colors"
                          title="View Public Profile"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleToggleAdminRole(user)}
                          className="p-1.5 rounded-lg text-[#87867f] hover:text-[#2e7d32] hover:bg-[#e8e5dc] transition-colors cursor-pointer"
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
                              : "text-[#d97757] hover:bg-red-500/10 hover:text-red-700"
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ban / Reinstatement Modal */}
      <BanUserModal
        user={selectedUserForBan}
        isOpen={!!selectedUserForBan}
        onClose={() => setSelectedUserForBan(null)}
        onConfirmBan={handleConfirmBan}
        onConfirmUnban={handleConfirmUnban}
      />
    </AdminLayout>
  );
};
