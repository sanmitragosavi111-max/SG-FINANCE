import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Copy,
  Download,
  FileText,
  Globe,
  Inbox,
  LogOut,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Save,
  Search,
  Shield,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { SeoHead } from '../components/SeoHead';
import { BrandMark } from '../components/BrandMark';
import { StaffAdminPanel } from '../components/StaffAdminPanel';
import {
  deleteEnquiryRecord,
  fetchServerNotificationStatuses,
  retryEnquiryEmailNotification,
  subscribeToEnquiries,
  updateEnquiryNotificationStatus,
  updateEnquiryStatusAndRemarks,
} from '../services/firestoreService';
import type { ServerNotificationStatusRecord } from '../services/firestoreService';
import { ENQUIRY_STATUSES } from '../types/site';
import type {
  EmailNotificationStatus,
  EnquiryRecord,
  EnquiryStatus,
  NotificationRetryStatus,
  SiteSettings,
} from '../types/site';
import { buildWhatsAppUrl, filterEnquiries } from '../utils/validation';
import { enquiriesToCsv } from '../utils/csv';

type AdminTab = 'enquiries' | 'contact' | 'content' | 'team';

const STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  in_review: 'In Review',
  follow_up: 'Follow-Up',
  closed: 'Closed',
};

const STATUS_TEXT_COLORS: Record<EnquiryStatus, string> = {
  new: 'text-[#9A7426]',
  contacted: 'text-sky-800',
  in_review: 'text-indigo-800',
  follow_up: 'text-orange-800',
  closed: 'text-emerald-800',
};

const EMAIL_STATUS_LABELS: Record<EmailNotificationStatus, string> = {
  pending: 'Email Pending',
  sent: 'Email Sent',
  failed: 'Email Failed',
};

const EMAIL_STATUS_COLORS: Record<EmailNotificationStatus, string> = {
  pending: 'text-[#747C86]',
  sent: 'text-emerald-800',
  failed: 'text-red-700',
};

const RETRY_STATUS_LABELS: Record<NotificationRetryStatus, string> = {
  none: 'Initial attempt',
  retrying: 'Retrying…',
  retried_sent: 'Retry succeeded',
  retried_failed: 'Retry failed',
};

const INPUT_CLASS =
  'w-full px-3.5 py-2.5 text-sm border border-[#E5DFD3] bg-[#FFFFFF] text-[#202A36] focus:border-[#0B1628] outline-none transition-colors';

function formatDateTime(date: Date | null): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function AdminPage() {
  const {
    settings,
    updateSettings,
    user,
    authReady,
    isAdmin,
    isPrimaryAdmin,
    authError,
    signInAdmin,
    signOutAdmin,
  } = useSite();

  const [activeTab, setActiveTab] = useState<AdminTab>('enquiries');
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(true);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);
  const [copiedUid, setCopiedUid] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | EnquiryStatus>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Selected enquiry drawer state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<EnquiryStatus>('new');
  const [draftRemarks, setDraftRemarks] = useState('');
  const [savingEnquiry, setSavingEnquiry] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [serverNotifications, setServerNotifications] = useState<
    Record<string, ServerNotificationStatusRecord>
  >({});
  const [retryingNotificationId, setRetryingNotificationId] = useState<string | null>(null);
  const [retryFeedback, setRetryFeedback] = useState<string | null>(null);

  // Settings form state
  const [draftSettings, setDraftSettings] = useState<SiteSettings>(settings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState<string | null>(null);
  const [settingsErrMsg, setSettingsErrMsg] = useState<string | null>(null);

  useEffect(() => {
    setDraftSettings(settings);
  }, [settings]);

  // Close enquiry drawer on Escape key
  useEffect(() => {
    if (!selectedId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedId]);

  // Subscribe to enquiries ONLY when authenticated & verified as admin
  useEffect(() => {
    if (!authReady || !isAdmin) {
      setEnquiries([]);
      setLoadingEnquiries(false);
      return;
    }

    setLoadingEnquiries(true);
    setEnquiryError(null);
    const unsubscribe = subscribeToEnquiries(
      (items) => {
        setEnquiries(items);
        setLoadingEnquiries(false);
      },
      (err) => {
        setEnquiryError(err.message || 'Unable to load enquiries.');
        setLoadingEnquiries(false);
      }
    );

    return () => unsubscribe();
  }, [authReady, isAdmin]);

  // Fetch live server-side notification delivery outcomes for authorized admin and sync pending Firestore records
  useEffect(() => {
    if (!authReady || !isAdmin || !user) {
      setServerNotifications({});
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const records = await fetchServerNotificationStatuses(idToken);
        if (!cancelled) {
          setServerNotifications(records);
        }
      } catch {
        // Non-blocking: Firestore enquiry records remain fully accessible
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authReady, isAdmin, user, enquiries.length]);

  // Persist server-tracked notification status to Firestore for any newly submitted pending enquiry
  useEffect(() => {
    if (!isAdmin || enquiries.length === 0) return;
    for (const item of enquiries) {
      const serverRec = serverNotifications[item.referenceCode];
      if (!serverRec) continue;
      const storedStatus = item.emailNotificationStatus ?? 'pending';
      const storedAttempts = item.emailNotificationAttempts ?? 0;
      if (
        (storedStatus === 'pending' && serverRec.emailNotificationStatus !== 'pending') ||
        serverRec.emailNotificationAttempts > storedAttempts
      ) {
        void updateEnquiryNotificationStatus(item.id, {
          emailNotificationStatus: serverRec.emailNotificationStatus,
          emailNotificationError: serverRec.emailNotificationError,
          emailNotificationAttempts: serverRec.emailNotificationAttempts,
          emailNotificationRetryStatus: serverRec.emailNotificationRetryStatus,
          emailNotifiedAt: serverRec.emailNotifiedAt,
        }).catch(() => {
          // Best-effort sync; status still displays live from serverNotifications
        });
      }
    }
  }, [isAdmin, enquiries, serverNotifications]);

  const enrichedEnquiries = useMemo(() => {
    return enquiries.map((item) => {
      const serverRec = serverNotifications[item.referenceCode];
      if (!serverRec) return item;
      const storedAttempts = item.emailNotificationAttempts ?? 0;
      if (
        (item.emailNotificationStatus ?? 'pending') === 'pending' ||
        serverRec.emailNotificationAttempts >= storedAttempts
      ) {
        return {
          ...item,
          emailNotificationStatus: serverRec.emailNotificationStatus,
          emailNotificationError: serverRec.emailNotificationError,
          emailNotificationAttempts: serverRec.emailNotificationAttempts,
          emailNotificationRetryStatus: serverRec.emailNotificationRetryStatus,
          emailNotifiedAt: serverRec.emailNotifiedAt,
        };
      }
      return item;
    });
  }, [enquiries, serverNotifications]);

  const filteredEnquiries = useMemo(
    () =>
      filterEnquiries(enrichedEnquiries, {
        search,
        status: statusFilter,
        dateFrom,
        dateTo,
      }),
    [enrichedEnquiries, search, statusFilter, dateFrom, dateTo]
  );

  const selectedEnquiry = useMemo(
    () => enrichedEnquiries.find((item) => item.id === selectedId) ?? null,
    [enrichedEnquiries, selectedId]
  );

  useEffect(() => {
    if (selectedEnquiry) {
      setDraftStatus(selectedEnquiry.status);
      setDraftRemarks(selectedEnquiry.remarks);
      setConfirmDelete(false);
      setActionFeedback(null);
      setRetryFeedback(null);
    }
  }, [selectedEnquiry?.id]);

  const counts = useMemo(() => {
    let newCount = 0;
    let activeCount = 0;
    let closedCount = 0;
    for (const item of enquiries) {
      if (item.status === 'new') newCount += 1;
      else if (item.status === 'closed') closedCount += 1;
      else activeCount += 1;
    }
    return { total: enquiries.length, newCount, activeCount, closedCount };
  }, [enquiries]);

  function handleExportCsv(): void {
    const csv = enquiriesToCsv(filteredEnquiries);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const stamp = new Date().toISOString().split('T')[0];
    link.download = `sg-finance-enquiries-${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function handleCopyUid(uid: string) {
    try {
      await navigator.clipboard.writeText(uid);
      setCopiedUid(true);
      window.setTimeout(() => setCopiedUid(false), 2000);
    } catch {
      setCopiedUid(false);
    }
  }

  async function handleSaveEnquiryUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedEnquiry) return;
    setSavingEnquiry(true);
    setActionFeedback(null);
    try {
      await updateEnquiryStatusAndRemarks(selectedEnquiry.id, draftStatus, draftRemarks);
      setActionFeedback('Enquiry status and remarks saved.');
    } catch {
      setActionFeedback('Failed to update enquiry. Please verify your permissions and try again.');
    } finally {
      setSavingEnquiry(false);
    }
  }

  async function handleDeleteSelected() {
    if (!selectedEnquiry) return;
    setSavingEnquiry(true);
    try {
      await deleteEnquiryRecord(selectedEnquiry.id);
      setSelectedId(null);
      setConfirmDelete(false);
    } catch {
      setActionFeedback('Unable to delete enquiry record.');
    } finally {
      setSavingEnquiry(false);
    }
  }

  async function handleRetryEmailNotification() {
    if (!selectedEnquiry || !user) return;
    setRetryingNotificationId(selectedEnquiry.id);
    setRetryFeedback(null);
    try {
      const idToken = await user.getIdToken();
      const result = await retryEnquiryEmailNotification(idToken, selectedEnquiry);

      setServerNotifications((prev) => ({
        ...prev,
        [selectedEnquiry.referenceCode]: {
          enquiryId: selectedEnquiry.id,
          referenceCode: selectedEnquiry.referenceCode,
          emailNotificationStatus: result.emailNotificationStatus,
          emailNotificationError: result.emailNotificationError,
          emailNotificationAttempts: result.emailNotificationAttempts,
          emailNotificationRetryStatus: result.emailNotificationRetryStatus,
          emailNotifiedAt: result.emailNotifiedAt,
        },
      }));

      await updateEnquiryNotificationStatus(selectedEnquiry.id, {
        emailNotificationStatus: result.emailNotificationStatus,
        emailNotificationError: result.emailNotificationError,
        emailNotificationAttempts: result.emailNotificationAttempts,
        emailNotificationRetryStatus: result.emailNotificationRetryStatus,
        emailNotifiedAt: result.emailNotifiedAt,
      });

      setRetryFeedback(
        result.ok
          ? 'Notification email sent successfully.'
          : result.emailNotificationError || 'Email delivery failed again.'
      );
    } catch (err) {
      setRetryFeedback(
        err instanceof Error ? err.message : 'Unable to retry email notification right now.'
      );
    } finally {
      setRetryingNotificationId(null);
    }
  }

  async function handleSaveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSavedMsg(null);
    setSettingsErrMsg(null);
    try {
      await updateSettings(draftSettings);
      setSettingsSavedMsg('Website settings saved and published live.');
    } catch {
      setSettingsErrMsg('Unable to save settings. Please verify your admin session and try again.');
    } finally {
      setSavingSettings(false);
    }
  }

  // Loading auth state
  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#0B1628] text-white flex items-center justify-center p-6">
        <SeoHead title="Admin Portal | SG FINANCE" description="Authorized SG FINANCE staff dashboard." noIndex />
        <div className="text-center space-y-2">
          <p className="text-xs font-semibold tracking-[0.14em] text-[#D4BC85]">SG FINANCE</p>
          <p className="text-sm text-slate-300">Verifying session…</p>
        </div>
      </div>
    );
  }

  // Unauthenticated sign-in gate
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B1628] text-white flex flex-col items-center justify-center p-6">
        <SeoHead title="Staff Sign In | SG FINANCE Admin" description="Authorized staff login for SG FINANCE." noIndex />
        <div className="max-w-md w-full bg-[#101F35] border border-[#B99752]/30 p-8 sm:p-10 space-y-6">
          <BrandMark tone="light" size="lg" />
          <div className="space-y-2.5">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#D4BC85]">
              AUTHORIZED STAFF ACCESS
            </p>
            <h1 className="font-display text-3xl text-white leading-tight">
              Staff Admin Portal
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Sign in with your authorized SG FINANCE Google account to manage confidential customer enquiries, contact details, social links, and website content.
            </p>
          </div>

          {authError && (
            <div role="alert" className="p-3.5 text-xs bg-red-950/80 border border-red-400/40 text-red-200">
              {authError}
            </div>
          )}

          <button
            type="button"
            onClick={() => void signInAdmin()}
            className="w-full px-5 py-3 text-sm font-semibold bg-[#B99752] text-[#0B1628] hover:bg-[#D4BC85] transition-colors cursor-pointer"
          >
            Sign in with Google
          </button>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Restricted to authorized staff</span>
            <Link to="/" className="text-[#D4BC85] hover:underline">
              Back to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Signed in but unauthorized account
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0B1628] text-white flex flex-col items-center justify-center p-6">
        <SeoHead title="Access Restricted | SG FINANCE Admin" description="Restricted administrative console." noIndex />
        <div className="max-w-md w-full bg-[#101F35] border border-[#B99752]/30 p-8 sm:p-10 space-y-5">
          <div className="flex items-center gap-2.5 text-[#D4BC85]">
            <Shield className="w-5 h-5" aria-hidden="true" />
            <span className="text-xs font-semibold tracking-[0.12em]">ACCESS RESTRICTED</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-white leading-tight">
            Account not authorized.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            You are signed in as <span className="text-white font-medium">{user.email}</span>, which does not currently have SG FINANCE administrator permissions. Customer enquiry records remain protected.
          </p>

          <div className="bg-[#0B1628] border border-white/15 p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold tracking-[0.1em] text-[#D4BC85]">
                YOUR ACCOUNT UID
              </span>
              <button
                type="button"
                onClick={() => void handleCopyUid(user.uid)}
                className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-[#D4BC85] cursor-pointer"
              >
                {copiedUid ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#D4BC85]" aria-hidden="true" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    Copy UID
                  </>
                )}
              </button>
            </div>
            <p className="font-mono text-xs text-slate-200 break-all">{user.uid}</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Share this UID with the SG FINANCE Primary Administrator if you require staff access.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => void signOutAdmin()}
              className="px-5 py-2.5 text-sm font-semibold bg-[#B99752] text-[#0B1628] hover:bg-[#D4BC85] transition-colors cursor-pointer"
            >
              Sign Out
            </button>
            <Link
              to="/"
              className="px-5 py-2.5 text-sm font-medium text-white border border-white/25 hover:border-[#D4BC85] hover:text-[#D4BC85] transition-colors"
            >
              Return to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeHeading =
    activeTab === 'enquiries'
      ? 'Customer Enquiries'
      : activeTab === 'contact'
        ? 'Contact & Social Settings'
        : activeTab === 'content'
          ? 'Website Content, Legal & SEO'
          : 'Authorized Team Access';

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#202A36] flex flex-col lg:flex-row">
      <SeoHead title="Admin Dashboard | SG FINANCE" description="SG FINANCE enquiry and content management console." noIndex />

      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-[#0B1628] text-white border-b lg:border-b-0 lg:border-r border-[#B99752]/20 shrink-0 flex flex-col">
        <div className="h-16 px-6 flex items-center justify-between border-b border-white/10">
          <Link to="/" aria-label="SG FINANCE Public Site">
            <BrandMark tone="light" size="sm" />
          </Link>
        </div>

        <nav aria-label="Admin Navigation" className="p-3 sm:p-4 flex lg:flex-col gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('enquiries')}
            className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'enquiries'
                ? 'bg-[#101F35] text-[#D4BC85] border-l-2 border-[#B99752]'
                : 'text-slate-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
            }`}
          >
            <Inbox className="w-4 h-4 shrink-0" aria-hidden="true" />
            Enquiries
            <span className="ml-auto font-mono text-xs tabular-nums text-slate-400">
              {counts.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-[#101F35] text-[#D4BC85] border-l-2 border-[#B99752]'
                : 'text-slate-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
            }`}
          >
            <Globe className="w-4 h-4 shrink-0" aria-hidden="true" />
            Contact &amp; Social
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'content'
                ? 'bg-[#101F35] text-[#D4BC85] border-l-2 border-[#B99752]'
                : 'text-slate-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" aria-hidden="true" />
            Content &amp; Legal
          </button>

          {isPrimaryAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('team')}
              className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'team'
                  ? 'bg-[#101F35] text-[#D4BC85] border-l-2 border-[#B99752]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" aria-hidden="true" />
              Team Access
            </button>
          )}
        </nav>

        <div className="mt-auto p-5 border-t border-white/10 hidden lg:block space-y-3">
          <div className="text-xs">
            <p className="text-slate-400">
              {isPrimaryAdmin ? 'Primary Administrator' : 'Authorized Staff'}
            </p>
            <p className="text-slate-100 font-medium truncate mt-0.5">{user.email}</p>
          </div>
          <div className="flex items-center justify-between gap-2 pt-1">
            <Link to="/" className="text-xs text-[#D4BC85] hover:underline">
              View Public Site
            </Link>
            <button
              type="button"
              onClick={() => void signOutAdmin()}
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Admin Header */}
        <header className="h-16 bg-white border-b border-[#E5DFD3] px-5 sm:px-8 flex items-center justify-between gap-4">
          <div className="text-sm text-[#747C86] truncate">
            <span>SG FINANCE</span>
            <span className="mx-2 text-[#E5DFD3]">/</span>
            <span className="font-semibold text-[#0B1628]">{activeHeading}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {activeTab === 'enquiries' && (
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={filteredEnquiries.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#0B1628] text-white hover:bg-[#101F35] disabled:opacity-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#D4BC85]" aria-hidden="true" />
                Export CSV
              </button>
            )}
            <button
              type="button"
              onClick={() => void signOutAdmin()}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#0B1628] border border-[#E5DFD3] hover:border-[#0B1628] cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              Sign Out
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-8 max-w-6xl w-full">
          {/* TAB 1: CUSTOMER ENQUIRIES */}
          {activeTab === 'enquiries' && (
            <div className="space-y-6">
              {/* Summary Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E5DFD3] p-5">
                  <p className="text-xs font-medium text-[#747C86]">Total Enquiries</p>
                  <p className="font-mono text-2xl font-medium text-[#0B1628] mt-1.5 tabular-nums">
                    {counts.total}
                  </p>
                </div>
                <div className="bg-white border border-[#E5DFD3] p-5">
                  <p className="text-xs font-medium text-[#747C86]">New Enquiries</p>
                  <p className="font-mono text-2xl font-medium text-[#9A7426] mt-1.5 tabular-nums">
                    {counts.newCount}
                  </p>
                </div>
                <div className="bg-white border border-[#E5DFD3] p-5">
                  <p className="text-xs font-medium text-[#747C86]">In Progress</p>
                  <p className="font-mono text-2xl font-medium text-sky-800 mt-1.5 tabular-nums">
                    {counts.activeCount}
                  </p>
                </div>
                <div className="bg-white border border-[#E5DFD3] p-5">
                  <p className="text-xs font-medium text-[#747C86]">Closed</p>
                  <p className="font-mono text-2xl font-medium text-emerald-800 mt-1.5 tabular-nums">
                    {counts.closedCount}
                  </p>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="bg-white border border-[#E5DFD3] p-4 sm:p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-5 relative">
                    <Search
                      className="w-4 h-4 text-[#747C86] absolute left-3.5 top-1/2 -translate-y-1/2"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      aria-label="Search enquiries"
                      placeholder="Search name, mobile, city, ref code..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-[#E5DFD3] bg-[#FFFFFF] text-[#202A36] focus:border-[#0B1628] outline-none"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="sr-only" htmlFor="filter-date-from">From Date</label>
                    <input
                      id="filter-date-from"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-[#E5DFD3] bg-[#FFFFFF] text-[#202A36] focus:border-[#0B1628] outline-none tabular-nums"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="sr-only" htmlFor="filter-date-to">To Date</label>
                    <input
                      id="filter-date-to"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-[#E5DFD3] bg-[#FFFFFF] text-[#202A36] focus:border-[#0B1628] outline-none tabular-nums"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSearch('');
                        setStatusFilter('all');
                        setDateFrom('');
                        setDateTo('');
                      }}
                      className="w-full py-2.5 text-xs font-medium text-[#747C86] border border-[#E5DFD3] hover:border-[#0B1628] hover:text-[#0B1628] transition-colors cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Status Filter Segmented Controls */}
                <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F7F5F0] border border-[#E5DFD3]/70">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      statusFilter === 'all'
                        ? 'bg-[#0B1628] text-white'
                        : 'text-[#747C86] hover:text-[#0B1628]'
                    }`}
                  >
                    All ({enquiries.length})
                  </button>
                  {ENQUIRY_STATUSES.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                        statusFilter === st
                          ? 'bg-[#0B1628] text-white'
                          : 'text-[#747C86] hover:text-[#0B1628]'
                      }`}
                    >
                      {STATUS_LABELS[st]}
                    </button>
                  ))}
                </div>
              </div>

              {enquiryError && (
                <div role="alert" className="p-4 bg-red-50 border border-red-200 text-sm text-red-900">
                  {enquiryError}
                </div>
              )}

              {/* Enquiries List (Mobile Cards + Desktop Table) */}
              <div className="bg-white border border-[#E5DFD3]">
                {loadingEnquiries ? (
                  <div className="p-10 text-center text-sm text-[#747C86]">
                    Loading customer enquiries…
                  </div>
                ) : filteredEnquiries.length === 0 ? (
                  <div className="p-12 text-center space-y-2">
                    <p className="font-display text-2xl text-[#0B1628]">
                      No enquiries found.
                    </p>
                    <p className="text-sm text-[#747C86]">
                      {enquiries.length === 0
                        ? 'Submitted customer enquiries from the public website will appear here in real time.'
                        : 'Try clearing your search term or date filters.'}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Mobile Card Stack */}
                    <div className="md:hidden divide-y divide-[#E5DFD3]">
                      {filteredEnquiries.map((item) => (
                        <div
                          key={item.id}
                          className={`p-5 space-y-3 ${
                            selectedId === item.id ? 'bg-[#F7F5F0]' : 'bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-mono text-xs text-[#B99752] tabular-nums">
                                {item.referenceCode}
                              </p>
                              <p className="font-display text-lg text-[#0B1628] truncate">
                                {item.fullName}
                              </p>
                            </div>
                            <span className={`text-xs font-semibold shrink-0 ${STATUS_TEXT_COLORS[item.status]}`}>
                              {STATUS_LABELS[item.status]}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs text-[#202A36]">
                            <div>
                              <span className="text-[#747C86] block">Mobile</span>
                              <span className="font-mono tabular-nums">+91 {item.mobileNumber}</span>
                            </div>
                            <div>
                              <span className="text-[#747C86] block">Amount</span>
                              <span className="font-mono tabular-nums">{item.requiredAmount}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-[#747C86] block">Requirement · {item.city}</span>
                              <span>{item.requirementType}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-[#747C86] block">Notification</span>
                              <span
                                className={`font-semibold ${
                                  EMAIL_STATUS_COLORS[item.emailNotificationStatus ?? 'pending']
                                }`}
                              >
                                {EMAIL_STATUS_LABELS[item.emailNotificationStatus ?? 'pending']}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-[#F0ECE4]">
                            <span className="text-[11px] text-[#747C86] tabular-nums">
                              {formatDateTime(item.createdAt)}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedId(item.id)}
                              className="px-3.5 py-2 text-xs font-semibold text-[#0B1628] border border-[#0B1628]/25 hover:border-[#0B1628] cursor-pointer"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-[#E5DFD3] bg-[#F7F5F0] text-xs font-semibold text-[#747C86]">
                            <th className="py-3.5 px-4">Reference</th>
                            <th className="py-3.5 px-4">Customer</th>
                            <th className="py-3.5 px-4">Mobile &amp; City</th>
                            <th className="py-3.5 px-4">Requirement</th>
                            <th className="py-3.5 px-4">Amount</th>
                            <th className="py-3.5 px-4">Status</th>
                            <th className="py-3.5 px-4">Notification</th>
                            <th className="py-3.5 px-4">Received</th>
                            <th className="py-3.5 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5DFD3]">
                          {filteredEnquiries.map((item) => {
                            const emailStatus = item.emailNotificationStatus ?? 'pending';
                            return (
                              <tr
                                key={item.id}
                                className={`hover:bg-[#F7F5F0]/70 transition-colors ${
                                  selectedId === item.id ? 'bg-[#F7F5F0]' : ''
                                }`}
                              >
                                <td className="py-3.5 px-4 font-mono text-xs text-[#202A36] tabular-nums whitespace-nowrap">
                                  {item.referenceCode}
                                </td>
                                <td className="py-3.5 px-4 font-medium text-[#0B1628]">
                                  {item.fullName}
                                </td>
                                <td className="py-3.5 px-4 text-[#202A36]">
                                  <span className="font-mono text-xs tabular-nums block">
                                    +91 {item.mobileNumber}
                                  </span>
                                  <span className="text-xs text-[#747C86]">{item.city}</span>
                                </td>
                                <td className="py-3.5 px-4 text-[#202A36] max-w-[190px] truncate">
                                  {item.requirementType}
                                </td>
                                <td className="py-3.5 px-4 font-mono text-xs tabular-nums text-[#0B1628] whitespace-nowrap">
                                  {item.requiredAmount}
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span className={`text-xs font-semibold ${STATUS_TEXT_COLORS[item.status]}`}>
                                    {STATUS_LABELS[item.status]}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span className={`text-xs font-semibold block ${EMAIL_STATUS_COLORS[emailStatus]}`}>
                                    {EMAIL_STATUS_LABELS[emailStatus]}
                                  </span>
                                  {item.emailNotificationRetryStatus &&
                                    item.emailNotificationRetryStatus !== 'none' && (
                                      <span className="text-[11px] text-[#747C86] block">
                                        {RETRY_STATUS_LABELS[item.emailNotificationRetryStatus]}
                                      </span>
                                    )}
                                </td>
                                <td className="py-3.5 px-4 text-xs text-[#747C86] tabular-nums whitespace-nowrap">
                                  {formatDateTime(item.createdAt)}
                                </td>
                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedId(item.id)}
                                    className="px-3.5 py-1.5 text-xs font-semibold text-[#0B1628] border border-[#E5DFD3] hover:border-[#0B1628] transition-colors cursor-pointer"
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CONTACT & SOCIAL SETTINGS */}
          {activeTab === 'contact' && (
            <form onSubmit={handleSaveSettings} className="bg-white border border-[#E5DFD3] p-6 sm:p-8 space-y-6">
              <div>
                <p className="text-xs font-semibold tracking-[0.12em] text-[#B99752] mb-1.5">
                  COMMUNICATION CHANNELS
                </p>
                <h1 className="font-display text-2xl sm:text-[1.75rem] text-[#0B1628]">
                  Contact Information &amp; Social Media Links
                </h1>
                <p className="text-sm text-[#747C86] mt-1">
                  Updates saved here immediately reflect on the Contact page, Footer, Floating WhatsApp button, and Call Now buttons.
                </p>
              </div>

              {settingsSavedMsg && (
                <div role="status" className="p-3.5 text-sm bg-emerald-50 border border-emerald-200 text-emerald-900">
                  {settingsSavedMsg}
                </div>
              )}
              {settingsErrMsg && (
                <div role="alert" className="p-3.5 text-sm bg-red-50 border border-red-200 text-red-900">
                  {settingsErrMsg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="phoneDisplay" className="block text-xs font-semibold text-[#202A36] mb-1.5">
                    Phone Display Text
                  </label>
                  <input
                    id="phoneDisplay"
                    type="text"
                    maxLength={40}
                    placeholder="+91 7038391002"
                    value={draftSettings.phoneDisplay}
                    onChange={(e) => setDraftSettings({ ...draftSettings, phoneDisplay: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label htmlFor="phoneHref" className="block text-xs font-semibold text-[#202A36] mb-1.5">
                    Phone Dial Number (for tel: link, e.g. +917038391002)
                  </label>
                  <input
                    id="phoneHref"
                    type="text"
                    maxLength={30}
                    placeholder="+917038391002"
                    value={draftSettings.phoneHref}
                    onChange={(e) => setDraftSettings({ ...draftSettings, phoneHref: e.target.value })}
                    className={`${INPUT_CLASS} font-mono`}
                  />
                </div>
                <div>
                  <label htmlFor="whatsappNumber" className="block text-xs font-semibold text-[#202A36] mb-1.5">
                    WhatsApp Number (digits with country code, e.g. 917038391002)
                  </label>
                  <input
                    id="whatsappNumber"
                    type="text"
                    maxLength={20}
                    placeholder="917038391002"
                    value={draftSettings.whatsappNumber}
                    onChange={(e) => setDraftSettings({ ...draftSettings, whatsappNumber: e.target.value })}
                    className={`${INPUT_CLASS} font-mono`}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-[#202A36] mb-1.5">
                    Business Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    maxLength={120}
                    placeholder="in.sg.infra@gmail.com"
                    value={draftSettings.email}
                    onChange={(e) => setDraftSettings({ ...draftSettings, email: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="whatsappPrefillMessage" className="block text-xs font-semibold text-[#202A36] mb-1.5">
                    WhatsApp Pre-Filled Message
                  </label>
                  <input
                    id="whatsappPrefillMessage"
                    type="text"
                    maxLength={400}
                    value={draftSettings.whatsappPrefillMessage}
                    onChange={(e) =>
                      setDraftSettings({ ...draftSettings, whatsappPrefillMessage: e.target.value })
                    }
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label htmlFor="addressLine" className="block text-xs font-semibold text-[#202A36] mb-1.5">
                    Office Street Address
                  </label>
                  <input
                    id="addressLine"
                    type="text"
                    maxLength={300}
                    value={draftSettings.addressLine}
                    onChange={(e) => setDraftSettings({ ...draftSettings, addressLine: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label htmlFor="cityRegion" className="block text-xs font-semibold text-[#202A36] mb-1.5">
                    City &amp; State
                  </label>
                  <input
                    id="cityRegion"
                    type="text"
                    maxLength={120}
                    value={draftSettings.cityRegion}
                    onChange={(e) => setDraftSettings({ ...draftSettings, cityRegion: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label htmlFor="workingHours" className="block text-xs font-semibold text-[#202A36] mb-1.5">
                    Business Working Hours
                  </label>
                  <input
                    id="workingHours"
                    type="text"
                    maxLength={200}
                    value={draftSettings.workingHours}
                    onChange={(e) => setDraftSettings({ ...draftSettings, workingHours: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label htmlFor="mapsEmbedUrl" className="block text-xs font-semibold text-[#202A36] mb-1.5">
                    Google Maps Embed URL (optional https://www.google.com/maps/embed?pb=...)
                  </label>
                  <input
                    id="mapsEmbedUrl"
                    type="url"
                    maxLength={500}
                    value={draftSettings.mapsEmbedUrl}
                    onChange={(e) => setDraftSettings({ ...draftSettings, mapsEmbedUrl: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="pt-5 border-t border-[#E5DFD3]">
                <h2 className="text-sm font-semibold text-[#0B1628] mb-4">Social Media URLs</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label htmlFor="instagramUrl" className="block text-xs font-semibold text-[#202A36] mb-1.5">
                      Instagram URL
                    </label>
                    <input
                      id="instagramUrl"
                      type="url"
                      maxLength={300}
                      placeholder="https://instagram.com/..."
                      value={draftSettings.instagramUrl}
                      onChange={(e) => setDraftSettings({ ...draftSettings, instagramUrl: e.target.value })}
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label htmlFor="facebookUrl" className="block text-xs font-semibold text-[#202A36] mb-1.5">
                      Facebook URL
                    </label>
                    <input
                      id="facebookUrl"
                      type="url"
                      maxLength={300}
                      placeholder="https://facebook.com/..."
                      value={draftSettings.facebookUrl}
                      onChange={(e) => setDraftSettings({ ...draftSettings, facebookUrl: e.target.value })}
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label htmlFor="linkedinUrl" className="block text-xs font-semibold text-[#202A36] mb-1.5">
                      LinkedIn URL
                    </label>
                    <input
                      id="linkedinUrl"
                      type="url"
                      maxLength={300}
                      placeholder="https://linkedin.com/company/..."
                      value={draftSettings.linkedinUrl}
                      onChange={(e) => setDraftSettings({ ...draftSettings, linkedinUrl: e.target.value })}
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5DFD3]">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-[#0B1628] text-white hover:bg-[#101F35] disabled:opacity-60 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#D4BC85]" aria-hidden="true" />
                  {savingSettings ? 'Saving…' : 'Save Contact & Social Settings'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: WEBSITE CONTENT, LEGAL & SEO */}
          {activeTab === 'content' && (
            <form onSubmit={handleSaveSettings} className="bg-white border border-[#E5DFD3] p-6 sm:p-8 space-y-6">
              <div>
                <p className="text-xs font-semibold tracking-[0.12em] text-[#B99752] mb-1.5">
                  EDITORIAL &amp; COMPLIANCE
                </p>
                <h1 className="font-display text-2xl sm:text-[1.75rem] text-[#0B1628]">
                  Website Content, Legal Notes &amp; SEO Configuration
                </h1>
                <p className="text-sm text-[#747C86] mt-1">
                  Manage key public website copy, compliance notes, Google Analytics 4, and Search Console verification centrally.
                </p>
              </div>

              {settingsSavedMsg && (
                <div role="status" className="p-3.5 text-sm bg-emerald-50 border border-emerald-200 text-emerald-900">
                  {settingsSavedMsg}
                </div>
              )}
              {settingsErrMsg && (
                <div role="alert" className="p-3.5 text-sm bg-red-50 border border-red-200 text-red-900">
                  {settingsErrMsg}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label htmlFor="heroHeadline" className="block text-xs font-semibold text-[#202A36] mb-1.5">
                    Homepage Hero Headline
                  </label>
                  <input
                    id="heroHeadline"
                    type="text"
                    maxLength={180}
                    value={draftSettings.heroHeadline}
                    onChange={(e) => setDraftSettings({ ...draftSettings, heroHeadline: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label htmlFor="heroSubtitle" className="block text-xs font-semibold text-[#202A36] mb-1.5">
                    Homepage Hero Subtitle
                  </label>
                  <textarea
                    id="heroSubtitle"
                    rows={2}
                    maxLength={400}
                    value={draftSettings.heroSubtitle}
                    onChange={(e) => setDraftSettings({ ...draftSettings, heroSubtitle: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label htmlFor="aboutIntro" className="block text-xs font-semibold text-[#202A36] mb-1.5">
                    About SG FINANCE Introduction
                  </label>
                  <textarea
                    id="aboutIntro"
                    rows={3}
                    maxLength={1200}
                    value={draftSettings.aboutIntro}
                    onChange={(e) => setDraftSettings({ ...draftSettings, aboutIntro: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label htmlFor="complianceBannerNote" className="block text-xs font-semibold text-[#202A36] mb-1.5">
                    Footer &amp; Services Compliance Notice
                  </label>
                  <textarea
                    id="complianceBannerNote"
                    rows={2}
                    maxLength={600}
                    value={draftSettings.complianceBannerNote}
                    onChange={(e) =>
                      setDraftSettings({ ...draftSettings, complianceBannerNote: e.target.value })
                    }
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="pt-5 border-t border-[#E5DFD3] space-y-5">
                <h2 className="text-sm font-semibold text-[#0B1628]">
                  Editable Legal &amp; Compliance Review Sections
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="privacyPolicyCustomNote" className="block text-xs font-semibold text-[#202A36] mb-1.5">
                      Privacy Policy Note
                    </label>
                    <textarea
                      id="privacyPolicyCustomNote"
                      rows={3}
                      maxLength={3000}
                      value={draftSettings.privacyPolicyCustomNote}
                      onChange={(e) =>
                        setDraftSettings({ ...draftSettings, privacyPolicyCustomNote: e.target.value })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label htmlFor="termsCustomNote" className="block text-xs font-semibold text-[#202A36] mb-1.5">
                      Terms &amp; Conditions Note
                    </label>
                    <textarea
                      id="termsCustomNote"
                      rows={3}
                      maxLength={3000}
                      value={draftSettings.termsCustomNote}
                      onChange={(e) =>
                        setDraftSettings({ ...draftSettings, termsCustomNote: e.target.value })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label htmlFor="disclaimerCustomNote" className="block text-xs font-semibold text-[#202A36] mb-1.5">
                      Disclaimer Note
                    </label>
                    <textarea
                      id="disclaimerCustomNote"
                      rows={3}
                      maxLength={3000}
                      value={draftSettings.disclaimerCustomNote}
                      onChange={(e) =>
                        setDraftSettings({ ...draftSettings, disclaimerCustomNote: e.target.value })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label htmlFor="loanTermsCustomNote" className="block text-xs font-semibold text-[#202A36] mb-1.5">
                      Loan Terms &amp; Conditions Note
                    </label>
                    <textarea
                      id="loanTermsCustomNote"
                      rows={3}
                      maxLength={3000}
                      value={draftSettings.loanTermsCustomNote}
                      onChange={(e) =>
                        setDraftSettings({ ...draftSettings, loanTermsCustomNote: e.target.value })
                      }
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-[#E5DFD3] grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="googleSiteVerification" className="block text-xs font-semibold text-[#202A36] mb-1.5">
                    Google Search Console Verification Token
                  </label>
                  <input
                    id="googleSiteVerification"
                    type="text"
                    maxLength={120}
                    placeholder="Paste verification content token"
                    value={draftSettings.googleSiteVerification}
                    onChange={(e) =>
                      setDraftSettings({ ...draftSettings, googleSiteVerification: e.target.value })
                    }
                    className={`${INPUT_CLASS} font-mono`}
                  />
                </div>
                <div>
                  <label htmlFor="googleAnalyticsId" className="block text-xs font-semibold text-[#202A36] mb-1.5">
                    Google Analytics 4 Measurement ID (e.g. G-XXXXXXXXXX)
                  </label>
                  <input
                    id="googleAnalyticsId"
                    type="text"
                    maxLength={60}
                    placeholder="G-XXXXXXXXXX"
                    value={draftSettings.googleAnalyticsId}
                    onChange={(e) =>
                      setDraftSettings({ ...draftSettings, googleAnalyticsId: e.target.value })
                    }
                    className={`${INPUT_CLASS} font-mono`}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5DFD3]">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-[#0B1628] text-white hover:bg-[#101F35] disabled:opacity-60 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#D4BC85]" aria-hidden="true" />
                  {savingSettings ? 'Saving…' : 'Save Content & Legal Settings'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: AUTHORIZED TEAM ACCESS (Primary Administrator Only) */}
          {activeTab === 'team' && isPrimaryAdmin && <StaffAdminPanel />}
        </main>
      </div>

      {/* Enquiry Details Slide-Over Panel */}
      {selectedEnquiry && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Enquiry details for ${selectedEnquiry.fullName}`}
          className="fixed inset-0 z-50 bg-[#0B1628]/55 flex justify-end"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedId(null);
            }
          }}
        >
          <div className="w-full max-w-lg bg-white h-full overflow-y-auto flex flex-col border-l border-[#E5DFD3]">
            <div className="px-6 py-5 border-b border-[#E5DFD3] bg-[#F7F5F0] flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#B99752] tabular-nums">
                  {selectedEnquiry.referenceCode}
                </p>
                <h2 className="font-display text-2xl text-[#0B1628]">
                  {selectedEnquiry.fullName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Close enquiry details"
                className="w-10 h-10 inline-flex items-center justify-center text-[#747C86] hover:text-[#0B1628] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              <div className="flex flex-wrap gap-2.5">
                <a
                  href={`tel:+91${selectedEnquiry.mobileNumber}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-[#0B1628] text-white hover:bg-[#101F35] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#D4BC85]" aria-hidden="true" />
                  Call +91 {selectedEnquiry.mobileNumber}
                </a>
                <a
                  href={buildWhatsAppUrl(
                    selectedEnquiry.mobileNumber,
                    `Hello ${selectedEnquiry.fullName}, this is SG FINANCE regarding your enquiry (${selectedEnquiry.referenceCode}).`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#B99752] text-[#0B1628] hover:bg-[#D4BC85] transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  WhatsApp Customer
                </a>
                {selectedEnquiry.email && (
                  <a
                    href={`mailto:${selectedEnquiry.email}?subject=${encodeURIComponent(
                      `SG FINANCE — Enquiry ${selectedEnquiry.referenceCode}`
                    )}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#0B1628] border border-[#E5DFD3] hover:border-[#0B1628] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#B99752]" aria-hidden="true" />
                    Email Customer
                  </a>
                )}
              </div>

              <dl className="grid grid-cols-2 gap-4 text-sm border-t border-b border-[#E5DFD3] py-5">
                <div>
                  <dt className="text-xs text-[#747C86]">Mobile Number</dt>
                  <dd className="font-mono font-medium text-[#0B1628] tabular-nums mt-0.5">
                    +91 {selectedEnquiry.mobileNumber}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#747C86]">City</dt>
                  <dd className="font-medium text-[#0B1628] mt-0.5">{selectedEnquiry.city}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-[#747C86]">Email Address</dt>
                  <dd className="font-medium text-[#0B1628] mt-0.5 break-all">
                    {selectedEnquiry.email ? (
                      <a
                        href={`mailto:${selectedEnquiry.email}`}
                        className="text-[#0B1628] underline underline-offset-2 hover:text-[#B99752]"
                      >
                        {selectedEnquiry.email}
                      </a>
                    ) : (
                      <span className="text-[#747C86] font-normal">Not provided</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#747C86]">Required Loan Amount</dt>
                  <dd className="font-mono font-medium text-[#0B1628] tabular-nums mt-0.5">
                    {selectedEnquiry.requiredAmount}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#747C86]">Preferred Contact</dt>
                  <dd className="font-medium text-[#0B1628] mt-0.5">
                    {selectedEnquiry.preferredContact}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-[#747C86]">Financial Requirement</dt>
                  <dd className="font-medium text-[#0B1628] mt-0.5">
                    {selectedEnquiry.requirementType}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#747C86]">Received</dt>
                  <dd className="text-xs text-[#202A36] tabular-nums mt-0.5">
                    {formatDateTime(selectedEnquiry.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#747C86]">Source</dt>
                  <dd className="text-xs text-[#202A36] mt-0.5">{selectedEnquiry.source}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-[#747C86]">Customer Message</dt>
                  <dd className="text-sm text-[#202A36] mt-1 whitespace-pre-line leading-relaxed">
                    {selectedEnquiry.message || 'No additional message provided.'}
                  </dd>
                </div>
              </dl>

              {/* Notification Delivery Status & Authorized Retry Control */}
              <div className="bg-[#F7F5F0] border border-[#E5DFD3] p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold tracking-wide text-[#0B1628]">
                    NOTIFICATION STATUS
                  </p>
                  <span className="text-xs font-medium text-emerald-800">
                    Enquiry Saved
                  </span>
                </div>
                <dl className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-[#747C86]">Email Notification</dt>
                    <dd
                      className={`font-semibold mt-0.5 ${
                        EMAIL_STATUS_COLORS[selectedEnquiry.emailNotificationStatus ?? 'pending']
                      }`}
                    >
                      {EMAIL_STATUS_LABELS[selectedEnquiry.emailNotificationStatus ?? 'pending']}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#747C86]">Retry Status</dt>
                    <dd className="font-medium text-[#202A36] mt-0.5">
                      {retryingNotificationId === selectedEnquiry.id
                        ? 'Retrying…'
                        : RETRY_STATUS_LABELS[selectedEnquiry.emailNotificationRetryStatus ?? 'none']}
                      {(selectedEnquiry.emailNotificationAttempts ?? 0) > 0 && (
                        <span className="text-[#747C86] font-mono tabular-nums ml-1">
                          ({selectedEnquiry.emailNotificationAttempts})
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>
                {selectedEnquiry.emailNotificationError && (
                  <p className="text-xs text-red-700 leading-relaxed break-words">
                    {selectedEnquiry.emailNotificationError}
                  </p>
                )}
                {retryFeedback && (
                  <p
                    role="status"
                    className={`text-xs font-medium ${
                      retryFeedback.includes('successfully') ? 'text-emerald-800' : 'text-red-700'
                    }`}
                  >
                    {retryFeedback}
                  </p>
                )}
                <div className="pt-1">
                  <button
                    type="button"
                    disabled={retryingNotificationId === selectedEnquiry.id}
                    onClick={() => void handleRetryEmailNotification()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0B1628] bg-white border border-[#0B1628]/25 hover:border-[#0B1628] disabled:opacity-60 transition-colors cursor-pointer"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 text-[#B99752] ${
                        retryingNotificationId === selectedEnquiry.id ? 'animate-spin' : ''
                      }`}
                      aria-hidden="true"
                    />
                    {retryingNotificationId === selectedEnquiry.id
                      ? 'Retrying Email Notification…'
                      : selectedEnquiry.emailNotificationStatus === 'sent'
                        ? 'Resend Email Notification'
                        : 'Retry Email Notification'}
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveEnquiryUpdate} className="space-y-4">
                <div>
                  <label htmlFor="detail-status" className="block text-xs font-semibold text-[#202A36] mb-1.5">
                    Enquiry Status
                  </label>
                  <select
                    id="detail-status"
                    value={draftStatus}
                    onChange={(e) => setDraftStatus(e.target.value as EnquiryStatus)}
                    className={INPUT_CLASS}
                  >
                    {ENQUIRY_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {STATUS_LABELS[st]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="detail-remarks" className="block text-xs font-semibold text-[#202A36] mb-1.5">
                    Internal Follow-Up Remarks
                  </label>
                  <textarea
                    id="detail-remarks"
                    rows={4}
                    maxLength={2000}
                    placeholder="Record call outcomes, appointment notes, or follow-up dates..."
                    value={draftRemarks}
                    onChange={(e) => setDraftRemarks(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>

                {actionFeedback && (
                  <p role="status" className="text-xs font-medium text-emerald-800">
                    {actionFeedback}
                  </p>
                )}

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingEnquiry}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-[#0B1628] text-white hover:bg-[#101F35] disabled:opacity-60 transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[#D4BC85]" aria-hidden="true" />
                    {savingEnquiry ? 'Saving…' : 'Save Changes'}
                  </button>

                  {!confirmDelete ? (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Delete
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void handleDeleteSelected()}
                        disabled={savingEnquiry}
                        className="px-3 py-1.5 text-xs font-semibold bg-red-700 text-white hover:bg-red-800 cursor-pointer"
                      >
                        Confirm Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="px-3 py-1.5 text-xs text-[#747C86] border border-[#E5DFD3] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
