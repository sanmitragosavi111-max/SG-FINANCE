import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  FileText,
  Globe,
  Inbox,
  LogOut,
  MessageCircle,
  Phone,
  Save,
  Search,
  Shield,
  Trash2,
  X,
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { SeoHead } from '../components/SeoHead';
import { BrandMark } from '../components/BrandMark';
import {
  deleteEnquiryRecord,
  subscribeToEnquiries,
  updateEnquiryStatusAndRemarks,
} from '../services/firestoreService';
import { ENQUIRY_STATUSES } from '../types/site';
import type { EnquiryRecord, EnquiryStatus, SiteSettings } from '../types/site';
import { buildWhatsAppUrl, filterEnquiries } from '../utils/validation';
import { enquiriesToCsv } from '../utils/csv';

type AdminTab = 'enquiries' | 'contact' | 'content';

const STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  in_review: 'In Review',
  follow_up: 'Follow-Up',
  closed: 'Closed',
};

const STATUS_TEXT_COLORS: Record<EnquiryStatus, string> = {
  new: 'text-amber-700',
  contacted: 'text-sky-700',
  in_review: 'text-indigo-700',
  follow_up: 'text-orange-700',
  closed: 'text-emerald-700',
};

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
    authError,
    signInAdmin,
    signOutAdmin,
  } = useSite();

  const [activeTab, setActiveTab] = useState<AdminTab>('enquiries');
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(true);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);

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

  // Settings form state
  const [draftSettings, setDraftSettings] = useState<SiteSettings>(settings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState<string | null>(null);
  const [settingsErrMsg, setSettingsErrMsg] = useState<string | null>(null);

  useEffect(() => {
    setDraftSettings(settings);
  }, [settings]);

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

  const filteredEnquiries = useMemo(
    () =>
      filterEnquiries(enquiries, {
        search,
        status: statusFilter,
        dateFrom,
        dateTo,
      }),
    [enquiries, search, statusFilter, dateFrom, dateTo]
  );

  const selectedEnquiry = useMemo(
    () => enquiries.find((item) => item.id === selectedId) ?? null,
    [enquiries, selectedId]
  );

  useEffect(() => {
    if (selectedEnquiry) {
      setDraftStatus(selectedEnquiry.status);
      setDraftRemarks(selectedEnquiry.remarks);
      setConfirmDelete(false);
      setActionFeedback(null);
    }
  }, [selectedEnquiry]);

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
      <div className="min-h-screen bg-[#070E1A] text-white flex items-center justify-center p-6">
        <SeoHead title="Admin Portal | SG FINANCE" description="Authorized SG FINANCE staff dashboard." noIndex />
        <p className="text-sm text-slate-300">Verifying session...</p>
      </div>
    );
  }

  // Unauthenticated sign-in gate
  if (!user) {
    return (
      <div className="min-h-screen bg-[#070E1A] text-white flex flex-col items-center justify-center p-6">
        <SeoHead title="Staff Sign In | SG FINANCE Admin" description="Authorized staff login for SG FINANCE." noIndex />
        <div className="max-w-md w-full bg-[#0A1628] border border-white/15 p-8 sm:p-10 space-y-6">
          <BrandMark tone="light" />
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-semibold text-white">
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
            className="w-full px-5 py-3 text-sm font-semibold bg-[#B89347] text-[#070E1A] hover:bg-[#D4AF5A] transition-colors cursor-pointer"
          >
            Sign in with Google
          </button>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Access restricted to authorized staff</span>
            <Link to="/" className="text-[#D4AF5A] hover:underline">
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
      <div className="min-h-screen bg-[#070E1A] text-white flex flex-col items-center justify-center p-6">
        <SeoHead title="Access Restricted | SG FINANCE Admin" description="Restricted administrative console." noIndex />
        <div className="max-w-md w-full bg-[#0A1628] border border-white/15 p-8 space-y-5">
          <div className="flex items-center gap-2.5 text-[#D4AF5A]">
            <Shield className="w-5 h-5" aria-hidden="true" />
            <span className="text-xs font-semibold tracking-[0.12em]">Access Restricted</span>
          </div>
          <h1 className="font-display text-2xl font-semibold">
            Account not authorized.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            You are signed in as <span className="text-white font-medium">{user.email}</span>, which does not have SG FINANCE administrator permissions. Customer enquiry records remain protected.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => void signOutAdmin()}
              className="px-5 py-2.5 text-sm font-semibold bg-[#B89347] text-[#070E1A] hover:bg-[#D4AF5A] transition-colors cursor-pointer"
            >
              Sign Out
            </button>
            <Link
              to="/"
              className="px-5 py-2.5 text-sm font-medium text-white border border-white/25 hover:border-white/60 transition-colors"
            >
              Return to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-900 flex flex-col lg:flex-row">
      <SeoHead title="Admin Dashboard | SG FINANCE" description="SG FINANCE enquiry and content management console." noIndex />

      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-[#070E1A] text-white border-b lg:border-b-0 lg:border-r border-white/10 shrink-0 flex flex-col">
        <div className="h-16 px-6 flex items-center justify-between border-b border-white/10">
          <Link to="/" aria-label="SG FINANCE Public Site">
            <BrandMark tone="light" />
          </Link>
        </div>

        <nav aria-label="Admin Navigation" className="p-4 flex lg:flex-col gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('enquiries')}
            className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'enquiries'
                ? 'bg-[#12233D] text-[#D4AF5A]'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
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
                ? 'bg-[#12233D] text-[#D4AF5A]'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
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
                ? 'bg-[#12233D] text-[#D4AF5A]'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" aria-hidden="true" />
            Content &amp; Legal
          </button>
        </nav>

        <div className="mt-auto p-4 border-t border-white/10 hidden lg:block space-y-3">
          <div className="text-xs">
            <p className="text-slate-400">Signed in as</p>
            <p className="text-slate-100 font-medium truncate">{user.email}</p>
          </div>
          <div className="flex items-center justify-between gap-2">
            <Link
              to="/"
              className="text-xs text-[#D4AF5A] hover:underline"
            >
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
        <header className="h-16 bg-white border-b border-slate-200 px-5 sm:px-8 flex items-center justify-between gap-4">
          <div className="text-sm text-slate-600 truncate">
            <span>SG FINANCE</span>
            <span className="mx-2 text-slate-300">/</span>
            <span className="font-semibold text-[#0A1628]">
              {activeTab === 'enquiries'
                ? 'Customer Enquiries'
                : activeTab === 'contact'
                  ? 'Contact & Social Settings'
                  : 'Website Content, Legal & SEO'}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {activeTab === 'enquiries' && (
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={filteredEnquiries.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#0A1628] text-white hover:bg-[#12233D] disabled:opacity-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#D4AF5A]" aria-hidden="true" />
                Export CSV
              </button>
            )}
            <button
              type="button"
              onClick={() => void signOutAdmin()}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 border border-slate-300 cursor-pointer"
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
                <div className="bg-white border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">Total Enquiries</p>
                  <p className="font-mono text-2xl font-medium text-[#0A1628] mt-1 tabular-nums">
                    {counts.total}
                  </p>
                </div>
                <div className="bg-white border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">New Enquiries</p>
                  <p className="font-mono text-2xl font-medium text-amber-700 mt-1 tabular-nums">
                    {counts.newCount}
                  </p>
                </div>
                <div className="bg-white border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">In Progress</p>
                  <p className="font-mono text-2xl font-medium text-sky-700 mt-1 tabular-nums">
                    {counts.activeCount}
                  </p>
                </div>
                <div className="bg-white border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">Closed</p>
                  <p className="font-mono text-2xl font-medium text-emerald-700 mt-1 tabular-nums">
                    {counts.closedCount}
                  </p>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="bg-white border border-slate-200 p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-5 relative">
                    <Search
                      className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      aria-label="Search enquiries"
                      placeholder="Search name, mobile, city, ref code..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 focus:border-[#0A1628] outline-none"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="sr-only" htmlFor="filter-date-from">From Date</label>
                    <input
                      id="filter-date-from"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-[#0A1628] outline-none tabular-nums"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="sr-only" htmlFor="filter-date-to">To Date</label>
                    <input
                      id="filter-date-to"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 focus:border-[#0A1628] outline-none tabular-nums"
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
                      className="w-full py-2 text-xs font-medium text-slate-600 border border-slate-300 hover:border-slate-500 cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Status Filter Segmented Controls */}
                <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      statusFilter === 'all'
                        ? 'bg-white text-[#0A1628] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
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
                          ? 'bg-white text-[#0A1628] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
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

              {/* Enquiries Table */}
              <div className="bg-white border border-slate-200 overflow-x-auto">
                {loadingEnquiries ? (
                  <div className="p-10 text-center text-sm text-slate-500">
                    Loading customer enquiries...
                  </div>
                ) : filteredEnquiries.length === 0 ? (
                  <div className="p-12 text-center space-y-2">
                    <p className="font-display text-xl text-[#0A1628]">
                      No enquiries found.
                    </p>
                    <p className="text-sm text-slate-500">
                      {enquiries.length === 0
                        ? 'Submitted customer enquiries from the public website will appear here in real time.'
                        : 'Try clearing your search term or date filters.'}
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                        <th className="py-3 px-4">Reference</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Mobile &amp; City</th>
                        <th className="py-3 px-4">Requirement</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Received</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredEnquiries.map((item) => (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-50 transition-colors ${
                            selectedId === item.id ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                            {item.referenceCode}
                          </td>
                          <td className="py-3 px-4 font-medium text-[#0A1628]">
                            {item.fullName}
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            <span className="font-mono text-xs tabular-nums block">
                              {item.mobileNumber}
                            </span>
                            <span className="text-xs text-slate-500">{item.city}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-700 max-w-[200px] truncate">
                            {item.requirementType}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs tabular-nums text-slate-800 whitespace-nowrap">
                            {item.requiredAmount}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`text-xs font-semibold ${STATUS_TEXT_COLORS[item.status]}`}>
                              {STATUS_LABELS[item.status]}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-500 tabular-nums whitespace-nowrap">
                            {formatDateTime(item.createdAt)}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedId(item.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-[#0A1628] border border-slate-300 hover:border-[#0A1628] cursor-pointer"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CONTACT & SOCIAL SETTINGS */}
          {activeTab === 'contact' && (
            <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 p-6 sm:p-8 space-y-6">
              <div>
                <h1 className="font-display text-2xl font-semibold text-[#0A1628]">
                  Contact Information &amp; Social Media Links
                </h1>
                <p className="text-sm text-slate-600 mt-1">
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
                  <label htmlFor="phoneDisplay" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Phone Display Text
                  </label>
                  <input
                    id="phoneDisplay"
                    type="text"
                    maxLength={40}
                    value={draftSettings.phoneDisplay}
                    onChange={(e) => setDraftSettings({ ...draftSettings, phoneDisplay: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 focus:border-[#0A1628] outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="phoneHref" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Phone Dial Number (for tel: link, e.g. +9198XXXXXXXX)
                  </label>
                  <input
                    id="phoneHref"
                    type="text"
                    maxLength={30}
                    value={draftSettings.phoneHref}
                    onChange={(e) => setDraftSettings({ ...draftSettings, phoneHref: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 focus:border-[#0A1628] outline-none font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="whatsappNumber" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    WhatsApp Number (digits with country code, e.g. 9198XXXXXXXX)
                  </label>
                  <input
                    id="whatsappNumber"
                    type="text"
                    maxLength={20}
                    value={draftSettings.whatsappNumber}
                    onChange={(e) => setDraftSettings({ ...draftSettings, whatsappNumber: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 focus:border-[#0A1628] outline-none font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Business Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    maxLength={120}
                    value={draftSettings.email}
                    onChange={(e) => setDraftSettings({ ...draftSettings, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 focus:border-[#0A1628] outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="whatsappPrefillMessage" className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 focus:border-[#0A1628] outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="addressLine" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Office Street Address
                  </label>
                  <input
                    id="addressLine"
                    type="text"
                    maxLength={300}
                    value={draftSettings.addressLine}
                    onChange={(e) => setDraftSettings({ ...draftSettings, addressLine: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 focus:border-[#0A1628] outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="cityRegion" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    City &amp; State
                  </label>
                  <input
                    id="cityRegion"
                    type="text"
                    maxLength={120}
                    value={draftSettings.cityRegion}
                    onChange={(e) => setDraftSettings({ ...draftSettings, cityRegion: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 focus:border-[#0A1628] outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="workingHours" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Business Working Hours
                  </label>
                  <input
                    id="workingHours"
                    type="text"
                    maxLength={200}
                    value={draftSettings.workingHours}
                    onChange={(e) => setDraftSettings({ ...draftSettings, workingHours: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 focus:border-[#0A1628] outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="mapsEmbedUrl" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Google Maps Embed URL (optional https://www.google.com/maps/embed?pb=...)
                  </label>
                  <input
                    id="mapsEmbedUrl"
                    type="url"
                    maxLength={500}
                    value={draftSettings.mapsEmbedUrl}
                    onChange={(e) => setDraftSettings({ ...draftSettings, mapsEmbedUrl: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 focus:border-[#0A1628] outline-none"
                  />
                </div>
              </div>

              <div className="pt-5 border-t border-slate-200">
                <h2 className="text-sm font-semibold text-[#0A1628] mb-4">Social Media URLs</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label htmlFor="instagramUrl" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Instagram URL
                    </label>
                    <input
                      id="instagramUrl"
                      type="url"
                      maxLength={300}
                      placeholder="https://instagram.com/..."
                      value={draftSettings.instagramUrl}
                      onChange={(e) => setDraftSettings({ ...draftSettings, instagramUrl: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 focus:border-[#0A1628] outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="facebookUrl" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Facebook URL
                    </label>
                    <input
                      id="facebookUrl"
                      type="url"
                      maxLength={300}
                      placeholder="https://facebook.com/..."
                      value={draftSettings.facebookUrl}
                      onChange={(e) => setDraftSettings({ ...draftSettings, facebookUrl: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 focus:border-[#0A1628] outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="linkedinUrl" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      LinkedIn URL
                    </label>
                    <input
                      id="linkedinUrl"
                      type="url"
                      maxLength={300}
                      placeholder="https://linkedin.com/company/..."
                      value={draftSettings.linkedinUrl}
                      onChange={(e) => setDraftSettings({ ...draftSettings, linkedinUrl: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 focus:border-[#0A1628] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-[#0A1628] text-white hover:bg-[#12233D] disabled:opacity-60 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#D4AF5A]" aria-hidden="true" />
                  {savingSettings ? 'Saving...' : 'Save Contact & Social Settings'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: WEBSITE CONTENT, LEGAL & SEO */}
          {activeTab === 'content' && (
            <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 p-6 sm:p-8 space-y-6">
              <div>
                <h1 className="font-display text-2xl font-semibold text-[#0A1628]">
                  Website Content, Legal Notes &amp; SEO Configuration
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Manage key public website copy, compliance notes, and Google verification tokens centrally.
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
                  <label htmlFor="heroHeadline" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Homepage Hero Headline
                  </label>
                  <input
                    id="heroHeadline"
                    type="text"
                    maxLength={180}
                    value={draftSettings.heroHeadline}
                    onChange={(e) => setDraftSettings({ ...draftSettings, heroHeadline: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 focus:border-[#0A1628] outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="heroSubtitle" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Homepage Hero Subtitle
                  </label>
                  <textarea
                    id="heroSubtitle"
                    rows={2}
                    maxLength={400}
                    value={draftSettings.heroSubtitle}
                    onChange={(e) => setDraftSettings({ ...draftSettings, heroSubtitle: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 focus:border-[#0A1628] outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="aboutIntro" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    About SG FINANCE Introduction
                  </label>
                  <textarea
                    id="aboutIntro"
                    rows={3}
                    maxLength={1200}
                    value={draftSettings.aboutIntro}
                    onChange={(e) => setDraftSettings({ ...draftSettings, aboutIntro: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 focus:border-[#0A1628] outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="complianceBannerNote" className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 focus:border-[#0A1628] outline-none"
                  />
                </div>
              </div>

              <div className="pt-5 border-t border-slate-200 space-y-5">
                <h2 className="text-sm font-semibold text-[#0A1628]">
                  Editable Legal &amp; Compliance Review Sections
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="privacyPolicyCustomNote" className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 focus:border-[#0A1628] outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="termsCustomNote" className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 focus:border-[#0A1628] outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="disclaimerCustomNote" className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 focus:border-[#0A1628] outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="loanTermsCustomNote" className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 focus:border-[#0A1628] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="googleSiteVerification" className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 focus:border-[#0A1628] outline-none font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="googleAnalyticsId" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Google Analytics Measurement ID (e.g. G-XXXXXXXXXX)
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
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 focus:border-[#0A1628] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-[#0A1628] text-white hover:bg-[#12233D] disabled:opacity-60 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#D4AF5A]" aria-hidden="true" />
                  {savingSettings ? 'Saving...' : 'Save Content & Legal Settings'}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>

      {/* Enquiry Details Slide-Over Panel */}
      {selectedEnquiry && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Enquiry details for ${selectedEnquiry.fullName}`}
          className="fixed inset-0 z-50 bg-black/50 flex justify-end"
        >
          <div className="w-full max-w-lg bg-white h-full overflow-y-auto flex flex-col border-l border-slate-200">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#8C6A24] tabular-nums">
                  {selectedEnquiry.referenceCode}
                </p>
                <h2 className="font-display text-xl font-semibold text-[#0A1628]">
                  {selectedEnquiry.fullName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Close enquiry details"
                className="w-10 h-10 inline-flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              <div className="flex flex-wrap gap-2.5">
                <a
                  href={`tel:+91${selectedEnquiry.mobileNumber}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#0A1628] text-white hover:bg-[#12233D]"
                >
                  <Phone className="w-3.5 h-3.5 text-[#D4AF5A]" aria-hidden="true" />
                  Call +91 {selectedEnquiry.mobileNumber}
                </a>
                <a
                  href={buildWhatsAppUrl(
                    selectedEnquiry.mobileNumber,
                    `Hello ${selectedEnquiry.fullName}, this is SG FINANCE regarding your enquiry (${selectedEnquiry.referenceCode}).`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0A1628] border border-slate-300 hover:border-[#0A1628]"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#8C6A24]" aria-hidden="true" />
                  WhatsApp Customer
                </a>
              </div>

              <dl className="grid grid-cols-2 gap-4 text-sm border-t border-b border-slate-200 py-5">
                <div>
                  <dt className="text-xs text-slate-500">Mobile Number</dt>
                  <dd className="font-mono font-medium text-slate-900 tabular-nums mt-0.5">
                    +91 {selectedEnquiry.mobileNumber}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">City</dt>
                  <dd className="font-medium text-slate-900 mt-0.5">{selectedEnquiry.city}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-slate-500">Email Address</dt>
                  <dd className="font-medium text-slate-900 mt-0.5 break-all">
                    {selectedEnquiry.email ? (
                      <a
                        href={`mailto:${selectedEnquiry.email}`}
                        className="text-[#0A1628] underline underline-offset-2 hover:text-[#8C6A24]"
                      >
                        {selectedEnquiry.email}
                      </a>
                    ) : (
                      <span className="text-slate-400 font-normal">Not provided</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Required Loan Amount</dt>
                  <dd className="font-mono font-medium text-slate-900 tabular-nums mt-0.5">
                    {selectedEnquiry.requiredAmount}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Preferred Contact</dt>
                  <dd className="font-medium text-slate-900 mt-0.5">
                    {selectedEnquiry.preferredContact}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-slate-500">Financial Requirement</dt>
                  <dd className="font-medium text-slate-900 mt-0.5">
                    {selectedEnquiry.requirementType}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Received</dt>
                  <dd className="text-xs text-slate-700 tabular-nums mt-0.5">
                    {formatDateTime(selectedEnquiry.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Source</dt>
                  <dd className="text-xs text-slate-700 mt-0.5">{selectedEnquiry.source}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-slate-500">Customer Message</dt>
                  <dd className="text-sm text-slate-700 mt-1 whitespace-pre-line">
                    {selectedEnquiry.message || 'No additional message provided.'}
                  </dd>
                </div>
              </dl>

              <form onSubmit={handleSaveEnquiryUpdate} className="space-y-4">
                <div>
                  <label htmlFor="detail-status" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Enquiry Status
                  </label>
                  <select
                    id="detail-status"
                    value={draftStatus}
                    onChange={(e) => setDraftStatus(e.target.value as EnquiryStatus)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 focus:border-[#0A1628] outline-none bg-white"
                  >
                    {ENQUIRY_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {STATUS_LABELS[st]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="detail-remarks" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Internal Follow-Up Remarks
                  </label>
                  <textarea
                    id="detail-remarks"
                    rows={4}
                    maxLength={2000}
                    placeholder="Record call outcomes, appointment notes, or follow-up dates..."
                    value={draftRemarks}
                    onChange={(e) => setDraftRemarks(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 focus:border-[#0A1628] outline-none"
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
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#0A1628] text-white hover:bg-[#12233D] disabled:opacity-60 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[#D4AF5A]" aria-hidden="true" />
                    {savingEnquiry ? 'Saving...' : 'Save Changes'}
                  </button>

                  {!confirmDelete ? (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 cursor-pointer"
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
                        className="px-3 py-1.5 text-xs text-slate-600 border border-slate-300 cursor-pointer"
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
