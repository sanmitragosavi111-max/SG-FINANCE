import React, { useEffect, useState } from 'react';
import { ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import { PRIMARY_ADMIN_EMAIL } from '../lib/firebase';
import {
  addStaffAdmin,
  removeStaffAdmin,
  subscribeToStaffAdmins,
} from '../services/firestoreService';
import type { AdminProfile } from '../types/site';

function formatAddedDate(date: Date | null): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function StaffAdminPanel() {
  const [staffList, setStaffList] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [uid, setUid] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [confirmRemoveUid, setConfirmRemoveUid] = useState<string | null>(null);
  const [removingUid, setRemovingUid] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    const unsubscribe = subscribeToStaffAdmins(
      (items) => {
        setStaffList(items);
        setLoading(false);
      },
      (err) => {
        setLoadError(err.message || 'Unable to load authorized staff records.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  async function handleAddStaff(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    setFormError(null);
    try {
      await addStaffAdmin(uid, email, displayName);
      setUid('');
      setEmail('');
      setDisplayName('');
      setFeedback('Authorized staff access granted. They can now sign in to manage enquiries.');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to add staff administrator.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemoveStaff(targetUid: string) {
    setRemovingUid(targetUid);
    setFeedback(null);
    setFormError(null);
    try {
      await removeStaffAdmin(targetUid);
      setConfirmRemoveUid(null);
      setFeedback('Staff administrator access revoked.');
    } catch {
      setFormError('Unable to revoke access. Please verify your primary administrator session.');
    } finally {
      setRemovingUid(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Primary Admin Identity Card */}
      <div className="bg-white border border-[#E5DFD3] p-6 sm:p-8 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-[#B99752] mb-1.5">
              ACCESS GOVERNANCE
            </p>
            <h1 className="font-display text-2xl sm:text-[1.75rem] text-[#0B1628]">
              Authorized Team Access
            </h1>
            <p className="text-sm text-[#747C86] mt-1 max-w-2xl leading-relaxed">
              Manage verified SG FINANCE staff members who can view, update, and export customer enquiries. Only the Primary Administrator can add or revoke team access.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#F7F5F0] border border-[#E5DFD3] text-xs font-medium text-[#0B1628]">
            <ShieldCheck className="w-4 h-4 text-[#B99752]" aria-hidden="true" />
            <span>Primary Owner: {PRIMARY_ADMIN_EMAIL}</span>
          </div>
        </div>

        <div className="bg-[#F7F5F0] border-l-2 border-[#B99752] px-4 py-3 text-xs text-[#202A36] leading-relaxed">
          <strong className="font-semibold text-[#0B1628]">How to onboard a staff member:</strong> Ask them to open{' '}
          <span className="font-mono text-[#0B1628]">/admin</span> and sign in with their verified Google account. Their Account UID will appear on the Access Restricted screen—paste that UID below along with their email and name.
        </div>
      </div>

      {/* Add Staff Form */}
      <form
        onSubmit={handleAddStaff}
        className="bg-white border border-[#E5DFD3] p-6 sm:p-8 space-y-5"
      >
        <h2 className="font-display text-xl text-[#0B1628]">Grant Staff Access</h2>

        {feedback && (
          <div
            role="status"
            className="p-3.5 text-sm bg-emerald-50 border border-emerald-200 text-emerald-900"
          >
            {feedback}
          </div>
        )}
        {formError && (
          <div
            role="alert"
            className="p-3.5 text-sm bg-red-50 border border-red-200 text-red-900"
          >
            {formError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label htmlFor="staff-uid" className="block text-xs font-semibold text-[#202A36] mb-1.5">
              Firebase User UID *
            </label>
            <input
              id="staff-uid"
              type="text"
              required
              maxLength={128}
              placeholder="Paste UID from staff sign-in screen"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-mono border border-[#E5DFD3] bg-[#FFFFFF] text-[#202A36] focus:border-[#0B1628] outline-none"
            />
          </div>
          <div>
            <label htmlFor="staff-email" className="block text-xs font-semibold text-[#202A36] mb-1.5">
              Verified Google Email *
            </label>
            <input
              id="staff-email"
              type="email"
              required
              maxLength={120}
              placeholder="staff.member@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-[#E5DFD3] bg-[#FFFFFF] text-[#202A36] focus:border-[#0B1628] outline-none"
            />
          </div>
          <div>
            <label htmlFor="staff-name" className="block text-xs font-semibold text-[#202A36] mb-1.5">
              Staff Full Name *
            </label>
            <input
              id="staff-name"
              type="text"
              required
              maxLength={100}
              placeholder="e.g., Operations Desk"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-[#E5DFD3] bg-[#FFFFFF] text-[#202A36] focus:border-[#0B1628] outline-none"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-[#0B1628] text-white hover:bg-[#101F35] disabled:opacity-60 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#D4BC85]" aria-hidden="true" />
            {submitting ? 'Granting Access…' : 'Authorize Staff Member'}
          </button>
        </div>
      </form>

      {/* Active Staff Directory */}
      <div className="bg-white border border-[#E5DFD3]">
        <div className="px-6 py-4 border-b border-[#E5DFD3] flex items-center justify-between">
          <h2 className="font-display text-lg text-[#0B1628]">Authorized Staff Directory</h2>
          <span className="font-mono text-xs text-[#747C86] tabular-nums">
            {staffList.length} {staffList.length === 1 ? 'member' : 'members'}
          </span>
        </div>

        {loadError && (
          <div role="alert" className="m-5 p-4 bg-red-50 border border-red-200 text-sm text-red-900">
            {loadError}
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-sm text-[#747C86]">Loading team records…</div>
        ) : staffList.length === 0 ? (
          <div className="p-10 text-center space-y-1.5">
            <p className="font-display text-lg text-[#0B1628]">No additional staff authorized yet.</p>
            <p className="text-sm text-[#747C86]">
              Currently only the Primary Administrator ({PRIMARY_ADMIN_EMAIL}) has dashboard access.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5DFD3]">
            {staffList.map((member) => (
              <div
                key={member.uid}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-0.5 min-w-0">
                  <p className="font-medium text-[#0B1628]">{member.displayName}</p>
                  <p className="text-sm text-[#202A36] break-all">{member.email}</p>
                  <p className="font-mono text-xs text-[#747C86] break-all">
                    UID: {member.uid} · Added {formatAddedDate(member.createdAt)}
                  </p>
                </div>

                <div className="shrink-0">
                  {confirmRemoveUid !== member.uid ? (
                    <button
                      type="button"
                      onClick={() => setConfirmRemoveUid(member.uid)}
                      aria-label={`Revoke access for ${member.displayName}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-red-700 border border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Revoke Access
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={removingUid === member.uid}
                        onClick={() => void handleRemoveStaff(member.uid)}
                        className="px-3.5 py-2 text-xs font-semibold bg-red-700 text-white hover:bg-red-800 disabled:opacity-60 cursor-pointer"
                      >
                        {removingUid === member.uid ? 'Revoking…' : 'Confirm Revoke'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmRemoveUid(null)}
                        className="px-3 py-2 text-xs text-[#747C86] border border-[#E5DFD3] hover:text-[#0B1628] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
