import React, { useState } from 'react';
import {
  KeyRound,
  Mail,
  AtSign,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../../../shared/components/Button.tsx';
import { Input } from '../../../shared/components/Input.tsx';
import { apiClient } from '../../../shared/api/apiClient.ts';
import { useAuth } from '../../../shared/context/useAuth.ts';
import type { ProblemDetails } from '../../../shared/types/index.ts';

export interface AccountSecurityCardProps {
  currentEmail?: string;
  currentUsername?: string;
  onEmailChanged?: (newEmail: string) => void;
  onUsernameChanged?: (newUsername: string) => void;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

// RFC 7807 Problem Details Alert Component
const ProblemAlert: React.FC<{ problem: ProblemDetails | null; onDismiss?: () => void }> = ({
  problem,
}) => {
  if (!problem) return null;

  return (
    <div
      role="alert"
      className="p-4 rounded-xl bg-[#d97757]/10 border border-[#d97757]/40 text-[#141413] animate-in fade-in"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-[#d97757] shrink-0 mt-0.5" />
        <div className="flex-1 text-sm font-serif">
          <p className="font-gothic font-bold uppercase tracking-wider text-xs text-[#d97757]">
            {problem.title || 'Security Action Error'}
            {problem.status ? ` (HTTP ${problem.status})` : ''}
          </p>
          {problem.detail && <p className="mt-1 text-[#141413]/90">{problem.detail}</p>}

          {/* Validation errors dictionary */}
          {problem.errors && Object.keys(problem.errors).length > 0 && (
            <ul className="mt-2 space-y-1 list-disc list-inside text-xs text-[#141413]/85">
              {Object.entries(problem.errors).flatMap(([field, msgs]) =>
                msgs.map((msg, i) => (
                  <li key={`${field}-${i}`}>
                    <strong className="font-gothic uppercase tracking-wide">{field}:</strong> {msg}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export const AccountSecurityCard: React.FC<AccountSecurityCardProps> = ({
  currentEmail = '',
  currentUsername = '',
  onEmailChanged,
  onUsernameChanged,
  onNotify,
}) => {
  const { refreshUser } = useAuth();

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordProblem, setPasswordProblem] = useState<ProblemDetails | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Email Form State
  const [newEmail, setNewEmail] = useState('');
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('');
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [emailProblem, setEmailProblem] = useState<ProblemDetails | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  // Username Form State
  const [newUsername, setNewUsername] = useState('');
  const [usernameCurrentPassword, setUsernameCurrentPassword] = useState('');
  const [showUsernamePassword, setShowUsernamePassword] = useState(false);
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [usernameProblem, setUsernameProblem] = useState<ProblemDetails | null>(null);
  const [usernameSuccess, setUsernameSuccess] = useState<string | null>(null);

  // Helper to extract RFC 7807 problem details
  const parseProblemDetails = (err: unknown, defaultTitle: string): ProblemDetails => {
    if (err && typeof err === 'object') {
      const p = err as ProblemDetails;
      return {
        title: p.title || defaultTitle,
        detail: p.detail || (err as { message?: string }).message || 'An unexpected error occurred.',
        status: p.status || 400,
        errors: p.errors,
      };
    }
    return {
      title: defaultTitle,
      detail: String(err),
      status: 400,
    };
  };

  // 1. Password Handler
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordProblem(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordProblem({
        title: 'Validation Error',
        detail: 'Current password is required to authorize this credential change.',
        status: 400,
      });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordProblem({
        title: 'Validation Error',
        detail: 'New password must contain at least 6 characters.',
        status: 400,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordProblem({
        title: 'Validation Error',
        detail: 'New password and confirmation do not match.',
        status: 400,
      });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      await apiClient.changePassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess('Password successfully updated.');
      onNotify?.('Password successfully updated.', 'success');

      setTimeout(() => setPasswordSuccess(null), 5000);
    } catch (err: unknown) {
      const problem = parseProblemDetails(err, 'Password Change Failed');
      setPasswordProblem(problem);
      onNotify?.(problem.detail || 'Password update failed.', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // 2. Email Handler
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailProblem(null);
    setEmailSuccess(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = newEmail.trim().toLowerCase();

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setEmailProblem({
        title: 'Invalid Email Address',
        detail: 'Please provide a valid, well-formed email address.',
        status: 400,
      });
      return;
    }

    if (trimmedEmail === currentEmail.trim().toLowerCase()) {
      setEmailProblem({
        title: 'Unchanged Email',
        detail: 'The new email address matches your current registered email.',
        status: 400,
      });
      return;
    }

    if (!emailCurrentPassword) {
      setEmailProblem({
        title: 'Verification Required',
        detail: 'Current password is required to authorize email alteration.',
        status: 400,
      });
      return;
    }

    setIsUpdatingEmail(true);

    try {
      await apiClient.changeEmail({
        newEmail: trimmedEmail,
        currentPassword: emailCurrentPassword,
      });

      await refreshUser();
      onEmailChanged?.(trimmedEmail);
      setEmailSuccess(`Account email updated to ${trimmedEmail}`);
      onNotify?.('Email address successfully updated.', 'success');
      setNewEmail('');
      setEmailCurrentPassword('');

      setTimeout(() => setEmailSuccess(null), 5000);
    } catch (err: unknown) {
      const problem = parseProblemDetails(err, 'Email Change Failed');
      setEmailProblem(problem);
      onNotify?.(problem.detail || 'Email update failed.', 'error');
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  // 3. Username Handler
  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameProblem(null);
    setUsernameSuccess(null);

    const trimmedUsername = newUsername.trim();
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;

    if (!usernameRegex.test(trimmedUsername)) {
      setUsernameProblem({
        title: 'Invalid Username Slug',
        detail:
          'Username must be between 3 and 30 characters and contain only alphanumeric letters, digits, underscores, or hyphens.',
        status: 400,
      });
      return;
    }

    if (trimmedUsername.toLowerCase() === currentUsername.trim().toLowerCase()) {
      setUsernameProblem({
        title: 'Unchanged Username',
        detail: 'The specified username is already assigned to your creator profile.',
        status: 400,
      });
      return;
    }

    if (!usernameCurrentPassword) {
      setUsernameProblem({
        title: 'Verification Required',
        detail: 'Current password is required to authorize username alteration.',
        status: 400,
      });
      return;
    }

    setIsUpdatingUsername(true);

    try {
      await apiClient.changeUsername({
        newUsername: trimmedUsername,
        currentPassword: usernameCurrentPassword,
      });

      await refreshUser();
      onUsernameChanged?.(trimmedUsername);
      setUsernameSuccess(`Creator username updated to @${trimmedUsername}`);
      onNotify?.('Username successfully updated.', 'success');
      setNewUsername('');
      setUsernameCurrentPassword('');

      setTimeout(() => setUsernameSuccess(null), 5000);
    } catch (err: unknown) {
      const problem = parseProblemDetails(err, 'Username Change Failed');
      setUsernameProblem(problem);
      onNotify?.(problem.detail || 'Username update failed.', 'error');
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  return (
    <div className="bg-[#faf9f5] rounded-[24px] border border-[#cccbc8]/60 p-6 sm:p-8 space-y-10">
      {/* Card Header */}
      <div className="border-b border-[#cccbc8]/50 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-[#f0eee6] border border-[#cccbc8]/70 text-[#141413]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-gothic text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#141413]">
              Account Security &amp; Credentials
            </h2>
            <p className="font-serif text-sm sm:text-base text-[#87867f] mt-0.5">
              Simulated security controls with RFC 7807 problem details validation and state persistence.
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Change Password Form */}
      <section aria-labelledby="change-password-heading" className="space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-[#87867f]" />
          <h3
            id="change-password-heading"
            className="font-gothic text-xs sm:text-sm font-bold uppercase tracking-[0.12em] text-[#141413]"
          >
            Change Account Password
          </h3>
        </div>
        <p className="font-serif text-xs sm:text-sm text-[#87867f]">
          Ensure your account uses a secure passphrase of at least 6 characters.
        </p>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
          <Input
            label="Current Password"
            type={showCurrentPassword ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter existing password"
            required
            disabled={isUpdatingPassword}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="hover:text-[#141413] transition-colors p-1"
                aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              disabled={isUpdatingPassword}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="hover:text-[#141413] transition-colors p-1"
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            <Input
              label="Confirm New Password"
              type={showNewPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
              disabled={isUpdatingPassword}
            />
          </div>

          <ProblemAlert problem={passwordProblem} />

          {passwordSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#2e7d32]/10 border border-[#2e7d32]/30 text-[#2e7d32] text-xs font-serif animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <div className="pt-1">
            <Button
              type="submit"
              variant="slate"
              size="sm"
              isLoading={isUpdatingPassword}
              disabled={!currentPassword || !newPassword || !confirmPassword}
            >
              Update Password
            </Button>
          </div>
        </form>
      </section>

      <div className="border-t border-[#cccbc8]/50" />

      {/* Section 2: Change Email Form */}
      <section aria-labelledby="change-email-heading" className="space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-[#87867f]" />
          <h3
            id="change-email-heading"
            className="font-gothic text-xs sm:text-sm font-bold uppercase tracking-[0.12em] text-[#141413]"
          >
            Change Email Address
          </h3>
        </div>

        <div className="flex items-center gap-2 font-serif text-xs sm:text-sm text-[#87867f]">
          <span>Current Address:</span>
          <span className="font-gothic text-xs font-semibold text-[#141413] bg-[#f0eee6] px-2 py-0.5 rounded">
            {currentEmail || 'elena.vance@showcase.gallery'}
          </span>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-4 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Email Address"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new.email@example.com"
              required
              disabled={isUpdatingEmail}
            />

            <Input
              label="Current Password"
              type={showEmailPassword ? 'text' : 'password'}
              value={emailCurrentPassword}
              onChange={(e) => setEmailCurrentPassword(e.target.value)}
              placeholder="Confirm password"
              required
              disabled={isUpdatingEmail}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowEmailPassword((prev) => !prev)}
                  className="hover:text-[#141413] transition-colors p-1"
                  aria-label={showEmailPassword ? 'Hide password' : 'Show password'}
                >
                  {showEmailPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
          </div>

          <ProblemAlert problem={emailProblem} />

          {emailSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#2e7d32]/10 border border-[#2e7d32]/30 text-[#2e7d32] text-xs font-serif animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{emailSuccess}</span>
            </div>
          )}

          <div className="pt-1">
            <Button
              type="submit"
              variant="slate"
              size="sm"
              isLoading={isUpdatingEmail}
              disabled={!newEmail || !emailCurrentPassword}
            >
              Update Email Address
            </Button>
          </div>
        </form>
      </section>

      <div className="border-t border-[#cccbc8]/50" />

      {/* Section 3: Change Username Form */}
      <section aria-labelledby="change-username-heading" className="space-y-4">
        <div className="flex items-center gap-2">
          <AtSign className="h-4 w-4 text-[#87867f]" />
          <h3
            id="change-username-heading"
            className="font-gothic text-xs sm:text-sm font-bold uppercase tracking-[0.12em] text-[#141413]"
          >
            Change Username Slug
          </h3>
        </div>

        <div className="flex items-center gap-2 font-serif text-xs sm:text-sm text-[#87867f]">
          <span>Current Public Handle:</span>
          <span className="font-gothic text-xs font-semibold text-[#141413] bg-[#f0eee6] px-2 py-0.5 rounded">
            @{currentUsername || 'elena_v'}
          </span>
          <span className="text-xs text-[#87867f]/80">(Target URL: /u/{currentUsername || 'elena_v'})</span>
        </div>

        <form onSubmit={handleUsernameSubmit} className="space-y-4 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="e.g. elena_vance"
              helperText="3-30 chars. Letters, digits, underscores, hyphens."
              required
              disabled={isUpdatingUsername}
            />

            <Input
              label="Current Password"
              type={showUsernamePassword ? 'text' : 'password'}
              value={usernameCurrentPassword}
              onChange={(e) => setUsernameCurrentPassword(e.target.value)}
              placeholder="Confirm password"
              required
              disabled={isUpdatingUsername}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowUsernamePassword((prev) => !prev)}
                  className="hover:text-[#141413] transition-colors p-1"
                  aria-label={showUsernamePassword ? 'Hide password' : 'Show password'}
                >
                  {showUsernamePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
          </div>

          <ProblemAlert problem={usernameProblem} />

          {usernameSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#2e7d32]/10 border border-[#2e7d32]/30 text-[#2e7d32] text-xs font-serif animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{usernameSuccess}</span>
            </div>
          )}

          <div className="pt-1">
            <Button
              type="submit"
              variant="slate"
              size="sm"
              isLoading={isUpdatingUsername}
              disabled={!newUsername || !usernameCurrentPassword}
            >
              Update Username Slug
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
};
