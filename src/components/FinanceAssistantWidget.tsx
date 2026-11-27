import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  MessageCircle,
  MessageSquare,
  Minus,
  Phone,
  Send,
  X,
} from 'lucide-react';
import { SG_FINANCE_LOGO_SRC } from './BrandMark';
import { useSite } from '../context/SiteContext';
import { getTelHref, OFFICIAL_CONTACT } from '../config/contact';
import { buildWhatsAppUrl } from '../utils/validation';
import { buildEnquiryWhatsAppUrl } from '../utils/enquiryNotifications';
import type { EnquiryNotificationPayload } from '../utils/enquiryNotifications';
import { submitEnquiry } from '../services/firestoreService';
import { PREFERRED_CONTACT_METHODS, REQUIREMENT_TYPES } from '../types/site';
import type { EnquiryFormInput } from '../types/site';

interface UiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestEnquiry?: boolean;
  isError?: boolean;
}

const STORAGE_KEY = 'sgf_assistant_history_v1';

const WELCOME_MESSAGE: UiChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hello! Welcome to SG FINANCE.\n\nI'm your virtual finance assistant. I can help you understand our financial services, answer your initial questions and guide you through the enquiry process.\n\nHow may I assist you today?",
};

const QUICK_PROMPTS = [
  'What secured lending services do you offer?',
  'How does the pledged asset evaluation work?',
  'What documents may be required?',
  'I would like to submit an enquiry',
] as const;

const INITIAL_ENQUIRY_DRAFT: EnquiryFormInput = {
  fullName: '',
  mobileNumber: '',
  email: '',
  city: 'Pune',
  requiredAmount: '',
  requirementType: REQUIREMENT_TYPES[0],
  preferredContact: PREFERRED_CONTACT_METHODS[0],
  message: '',
  consentAccepted: false,
};

function loadSavedMessages(): UiChatMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [WELCOME_MESSAGE];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return [WELCOME_MESSAGE];
    const valid = parsed.filter(
      (m): m is UiChatMessage =>
        Boolean(m) &&
        typeof m === 'object' &&
        typeof (m as UiChatMessage).id === 'string' &&
        ((m as UiChatMessage).role === 'user' || (m as UiChatMessage).role === 'assistant') &&
        typeof (m as UiChatMessage).content === 'string'
    );
    return valid.length > 0 ? valid.slice(-20) : [WELCOME_MESSAGE];
  } catch {
    return [WELCOME_MESSAGE];
  }
}

export function FinanceAssistantWidget() {
  const { settings } = useSite();
  const { pathname } = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimised, setIsMinimised] = useState(false);
  const [messages, setMessages] = useState<UiChatMessage[]>(() => loadSavedMessages());
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);

  // Contextual quick-enquiry panel state inside the chatbot
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [enquiryDraft, setEnquiryDraft] = useState<EnquiryFormInput>(INITIAL_ENQUIRY_DRAFT);
  const [enquiryErrors, setEnquiryErrors] = useState<
    Partial<Record<keyof EnquiryFormInput, string>>
  >({});
  const [enquiryFormError, setEnquiryFormError] = useState<string | null>(null);
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [submittedEnquiry, setSubmittedEnquiry] = useState<EnquiryNotificationPayload | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const enquiryFormRef = useRef<HTMLFormElement | null>(null);

  const whatsappHref = buildWhatsAppUrl(
    settings.whatsappNumber || OFFICIAL_CONTACT.whatsappNumber,
    settings.whatsappPrefillMessage
  );
  const telHref = getTelHref(settings.phoneHref || OFFICIAL_CONTACT.phoneHref);

  const hasUserMessages = messages.some((m) => m.role === 'user');

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-20)));
    } catch {
      // Ignore storage quota errors in restricted browsing modes
    }
  }, [messages]);

  useEffect(() => {
    if (!isOpen || isMinimised) return;
    if (showEnquiryForm && enquiryFormRef.current) {
      enquiryFormRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
      return;
    }
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, sending, showEnquiryForm, submittedEnquiry, isOpen, isMinimised]);

  useEffect(() => {
    if (isOpen && !isMinimised && !showEnquiryForm) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(id);
    }
  }, [isOpen, isMinimised, showEnquiryForm]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMinimised(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  async function sendMessageText(rawText: string) {
    const trimmed = rawText.trim();
    if (!trimmed || sending) return;

    const userMsg: UiChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputValue('');
    setShowEnquiryForm(false);
    setSending(true);

    try {
      const apiHistory = nextMessages
        .filter((m) => !m.isError && m.id !== 'welcome')
        .slice(-16)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiHistory,
          pagePath: pathname,
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        reply?: string;
        message?: string;
        suggestEnquiry?: boolean;
        suggestedRequirement?: string;
        extractedAmount?: string;
        extractedCity?: string;
      };

      if (!response.ok || !data.ok || !data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `e_${Date.now()}`,
            role: 'assistant',
            content:
              data.message ||
              'Our assistant is temporarily unavailable. You can submit an enquiry below or connect directly with our Pune team on WhatsApp (+91 7038391002).',
            suggestEnquiry: true,
            isError: true,
          },
        ]);
        return;
      }

      // Pre-fill quick enquiry draft with any context already shared in chat so we never repeat questions
      setEnquiryDraft((prev) => ({
        ...prev,
        requirementType:
          data.suggestedRequirement &&
          (REQUIREMENT_TYPES as readonly string[]).includes(data.suggestedRequirement)
            ? data.suggestedRequirement
            : prev.requirementType,
        requiredAmount: data.extractedAmount ? data.extractedAmount : prev.requiredAmount,
        city: data.extractedCity ? data.extractedCity : prev.city,
        message: prev.message || trimmed.slice(0, 300),
      }));

      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          content: data.reply || '',
          suggestEnquiry: Boolean(data.suggestEnquiry),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `e_${Date.now()}`,
          role: 'assistant',
          content:
            'We could not reach the assistant right now. You may submit an enquiry directly below or message us on WhatsApp at +91 7038391002.',
          suggestEnquiry: true,
          isError: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void sendMessageText(inputValue);
  }

  function updateDraftField<K extends keyof EnquiryFormInput>(
    key: K,
    value: EnquiryFormInput[K]
  ) {
    setEnquiryDraft((prev) => ({ ...prev, [key]: value }));
    if (enquiryErrors[key]) {
      setEnquiryErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    if (enquiryFormError) setEnquiryFormError(null);
  }

  async function handleQuickEnquirySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingEnquiry) return;

    setSubmittingEnquiry(true);
    setEnquiryErrors({});
    setEnquiryFormError(null);

    try {
      const outcome = await submitEnquiry(enquiryDraft, 'chatbot_assistant');
      if (!outcome.ok) {
        if (outcome.fieldErrors) setEnquiryErrors(outcome.fieldErrors);
        setEnquiryFormError(
          outcome.errorMessage || 'Please review the highlighted fields and try again.'
        );
        return;
      }

      const confirmed: EnquiryNotificationPayload = outcome.submittedPayload ?? {
        enquiryId: outcome.enquiryId || outcome.referenceCode || 'SGF-RECEIVED',
        referenceCode: outcome.referenceCode || 'SGF-RECEIVED',
        fullName: enquiryDraft.fullName.trim(),
        mobileNumber: enquiryDraft.mobileNumber.trim(),
        email: enquiryDraft.email.trim(),
        requirementType: enquiryDraft.requirementType,
        requiredAmount: enquiryDraft.requiredAmount.trim(),
        city: enquiryDraft.city.trim(),
        preferredContact: enquiryDraft.preferredContact,
        message: enquiryDraft.message.trim(),
        source: 'chatbot_assistant',
        submittedAtIso: new Date().toISOString(),
      };

      setSubmittedEnquiry(confirmed);
      setShowEnquiryForm(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `c_${Date.now()}`,
          role: 'assistant',
          content: `Thank you, ${confirmed.fullName}. Your enquiry (${confirmed.referenceCode}) has been securely recorded for our SG FINANCE Pune team. An authorized representative will contact you via ${confirmed.preferredContact || 'your preferred channel'} during working hours. Submitting an enquiry does not constitute loan approval.`,
        },
      ]);
      setEnquiryDraft(INITIAL_ENQUIRY_DRAFT);
    } finally {
      setSubmittingEnquiry(false);
    }
  }

  function handleOpenWidget() {
    setIsOpen(true);
    setIsMinimised(false);
  }

  function handleMinimise() {
    setIsMinimised(true);
  }

  function handleClose() {
    setIsOpen(false);
    setIsMinimised(false);
    setShowEnquiryForm(false);
  }

  const showFloatingLauncher = !isOpen || isMinimised;

  return (
    <>
      {/* Floating SG Finance Assistant Launcher Button */}
      {showFloatingLauncher && (
        <button
          type="button"
          onClick={handleOpenWidget}
          aria-label="Open SG Finance Assistant chat"
          data-testid="sgf-chatbot-launcher"
          className="fixed bottom-[66px] right-4 md:bottom-6 md:right-6 z-40 inline-flex items-center gap-2.5 h-12 pl-3.5 pr-4 sm:pr-5 bg-[#0B1628] text-white border border-[#B99752] shadow-[0_12px_32px_rgba(11,22,40,0.28)] hover:bg-[#101F35] hover:-translate-y-0.5 transition-all duration-150 cursor-pointer whitespace-nowrap"
        >
          <span className="relative shrink-0">
            <span className="flex items-center justify-center w-7 h-7 bg-white border border-[#D4BC85]/50 overflow-hidden">
              <img
                src={SG_FINANCE_LOGO_SRC}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-contain scale-[1.82] translate-y-[2%]"
              />
            </span>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0B1628] rounded-full"
              aria-hidden="true"
            />
          </span>
          <span className="flex flex-col items-start leading-tight text-left">
            <span className="text-xs sm:text-[13px] font-semibold tracking-wide text-white">
              SG Finance Assistant
            </span>
            <span className="text-[10px] text-[#D4BC85] font-medium">
              {isMinimised && hasUserMessages ? 'Resume chat' : 'Ask a question'}
            </span>
          </span>
          <MessageSquare className="w-4 h-4 text-[#D4BC85] shrink-0 ml-0.5" aria-hidden="true" />
        </button>
      )}

      {/* Open Chat Window */}
      {isOpen && !isMinimised && (
        <section
          role="dialog"
          aria-label="SG Finance Assistant"
          data-testid="sgf-chatbot-window"
          className="fixed inset-x-3 bottom-[62px] top-16 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[630px] sm:max-h-[calc(100vh-48px)] z-50 flex flex-col bg-white border border-[#B99752]/55 shadow-[0_24px_60px_rgba(11,22,40,0.28)] overflow-hidden"
        >
          {/* Header */}
          <header className="bg-[#0B1628] text-white px-4 py-3.5 border-b border-[#B99752]/40 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-white border border-[#D4BC85]/50 overflow-hidden shrink-0 flex items-center justify-center">
                <img
                  src={SG_FINANCE_LOGO_SRC}
                  alt="SG FINANCE logo"
                  className="w-full h-full object-contain scale-[1.82] translate-y-[2%]"
                />
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-base text-white leading-tight truncate">
                  SG Finance Assistant
                </h2>
                <p className="flex items-center gap-1.5 text-[11px] text-[#D4BC85] mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" aria-hidden="true" />
                  <span>Online · SG FINANCE Pune</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleMinimise}
                aria-label="Minimise chat window"
                title="Minimise"
                className="w-8 h-8 inline-flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close chat window"
                title="Close"
                className="w-8 h-8 inline-flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </header>

          {/* Conversation Area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto bg-[#F7F5F0] px-4 py-4 space-y-3.5"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] px-3.5 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-[#0B1628] text-white'
                      : msg.isError
                        ? 'bg-red-50 border border-red-200 text-red-900'
                        : 'bg-white border border-[#E5DFD3] text-[#202A36]'
                  }`}
                >
                  {msg.content}
                </div>

                {msg.role === 'assistant' && msg.suggestEnquiry && !showEnquiryForm && (
                  <div className="mt-2 flex flex-wrap gap-2 max-w-[90%]">
                    <button
                      type="button"
                      onClick={() => {
                        setSubmittedEnquiry(null);
                        setShowEnquiryForm(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#B99752] text-[#0B1628] hover:bg-[#D4BC85] transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                      Submit Enquiry Now
                    </button>
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-[#0B1628] border border-[#E5DFD3] hover:border-[#0B1628] transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#B99752]" aria-hidden="true" />
                      WhatsApp Support
                    </a>
                  </div>
                )}
              </div>
            ))}

            {/* Initial Quick-Start Conversation Starters */}
            {!hasUserMessages && !sending && !showEnquiryForm && (
              <div className="pt-1 space-y-1.5">
                <p className="text-[11px] font-medium text-[#747C86]">Quick topics</p>
                <div className="flex flex-col gap-1.5">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => {
                        if (prompt === 'I would like to submit an enquiry') {
                          setSubmittedEnquiry(null);
                          setShowEnquiryForm(true);
                        } else {
                          void sendMessageText(prompt);
                        }
                      }}
                      className="text-left px-3 py-2 text-xs font-medium text-[#0B1628] bg-white border border-[#E5DFD3] hover:border-[#B99752] hover:bg-[#FCFBF9] transition-colors cursor-pointer flex items-center justify-between gap-2"
                    >
                      <span>{prompt}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#B99752] shrink-0" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {sending && (
              <div className="flex items-start">
                <div className="bg-white border border-[#E5DFD3] px-3.5 py-2.5 text-xs text-[#747C86] inline-flex items-center gap-2">
                  <span className="inline-flex gap-1" aria-hidden="true">
                    <span className="w-1.5 h-1.5 bg-[#B99752] rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-[#B99752] rounded-full animate-bounce [animation-delay:120ms]" />
                    <span className="w-1.5 h-1.5 bg-[#B99752] rounded-full animate-bounce [animation-delay:240ms]" />
                  </span>
                  <span>SG Finance Assistant is replying…</span>
                </div>
              </div>
            )}

            {/* Confirmed Enquiry Card (with Pre-Filled WhatsApp & Call Us) */}
            {submittedEnquiry && !showEnquiryForm && (
              <div className="bg-white border border-[#B99752]/50 p-3.5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="text-xs font-semibold">
                    Enquiry Saved · {submittedEnquiry.referenceCode}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={buildEnquiryWhatsAppUrl(
                      settings.whatsappNumber || OFFICIAL_CONTACT.whatsappNumber,
                      submittedEnquiry
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#0B1628] text-white hover:bg-[#101F35] transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#D4BC85]" aria-hidden="true" />
                    Send Enquiry on WhatsApp
                  </a>
                  <a
                    href={telHref}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#B99752] text-[#0B1628] hover:bg-[#D4BC85] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                    Call Us
                  </a>
                </div>
              </div>
            )}

            {/* Integrated In-Chat Quick Enquiry Form (Saves directly to Firestore + Backend Notification) */}
            {showEnquiryForm && (
              <form
                ref={enquiryFormRef}
                onSubmit={handleQuickEnquirySubmit}
                noValidate
                className="bg-white border border-[#B99752]/50 p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#F0ECE4]">
                  <div>
                    <p className="text-[11px] font-semibold tracking-wider text-[#B99752]">
                      CONFIDENTIAL ENQUIRY
                    </p>
                    <p className="text-xs text-[#747C86]">
                      Submit directly to the SG FINANCE team
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEnquiryForm(false)}
                    className="text-xs text-[#747C86] hover:text-[#0B1628] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                {enquiryFormError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 text-red-900 text-xs"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-700" aria-hidden="true" />
                    <span>{enquiryFormError}</span>
                  </div>
                )}

                <div className="space-y-2.5">
                  <div>
                    <input
                      type="text"
                      placeholder="Full Name *"
                      maxLength={100}
                      value={enquiryDraft.fullName}
                      onChange={(e) => updateDraftField('fullName', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#DDD6C8] bg-[#FCFBF9] text-[#202A36] focus:border-[#0B1628] outline-none"
                    />
                    {enquiryErrors.fullName && (
                      <p className="mt-1 text-[11px] text-red-700">{enquiryErrors.fullName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="10-digit Mobile *"
                        maxLength={16}
                        value={enquiryDraft.mobileNumber}
                        onChange={(e) => updateDraftField('mobileNumber', e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#DDD6C8] bg-[#FCFBF9] text-[#202A36] focus:border-[#0B1628] outline-none tabular-nums"
                      />
                      {enquiryErrors.mobileNumber && (
                        <p className="mt-1 text-[11px] text-red-700">
                          {enquiryErrors.mobileNumber}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="City *"
                        maxLength={80}
                        value={enquiryDraft.city}
                        onChange={(e) => updateDraftField('city', e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#DDD6C8] bg-[#FCFBF9] text-[#202A36] focus:border-[#0B1628] outline-none"
                      />
                      {enquiryErrors.city && (
                        <p className="mt-1 text-[11px] text-red-700">{enquiryErrors.city}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Required Amount *"
                        maxLength={40}
                        value={enquiryDraft.requiredAmount}
                        onChange={(e) => updateDraftField('requiredAmount', e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#DDD6C8] bg-[#FCFBF9] text-[#202A36] focus:border-[#0B1628] outline-none"
                      />
                      {enquiryErrors.requiredAmount && (
                        <p className="mt-1 text-[11px] text-red-700">
                          {enquiryErrors.requiredAmount}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Email (Optional)"
                        maxLength={120}
                        value={enquiryDraft.email}
                        onChange={(e) => updateDraftField('email', e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#DDD6C8] bg-[#FCFBF9] text-[#202A36] focus:border-[#0B1628] outline-none"
                      />
                      {enquiryErrors.email && (
                        <p className="mt-1 text-[11px] text-red-700">{enquiryErrors.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <select
                      aria-label="Financial requirement"
                      value={enquiryDraft.requirementType}
                      onChange={(e) => updateDraftField('requirementType', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#DDD6C8] bg-[#FCFBF9] text-[#202A36] focus:border-[#0B1628] outline-none"
                    >
                      {REQUIREMENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      aria-label="Preferred contact method"
                      value={enquiryDraft.preferredContact}
                      onChange={(e) => updateDraftField('preferredContact', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#DDD6C8] bg-[#FCFBF9] text-[#202A36] focus:border-[#0B1628] outline-none"
                    >
                      {PREFERRED_CONTACT_METHODS.map((method) => (
                        <option key={method} value={method}>
                          Preferred: {method}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <textarea
                      rows={2}
                      maxLength={1000}
                      placeholder="Brief details about your requirement (optional)"
                      value={enquiryDraft.message}
                      onChange={(e) => updateDraftField('message', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#DDD6C8] bg-[#FCFBF9] text-[#202A36] focus:border-[#0B1628] outline-none resize-none"
                    />
                  </div>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enquiryDraft.consentAccepted}
                      onChange={(e) => updateDraftField('consentAccepted', e.target.checked)}
                      className="mt-0.5 w-3.5 h-3.5 accent-[#0B1628] shrink-0"
                    />
                    <span className="text-[11px] text-[#747C86] leading-snug">
                      I authorize SG FINANCE to contact me per the{' '}
                      <Link
                        to="/privacy-policy"
                        onClick={handleMinimise}
                        className="text-[#0B1628] underline"
                      >
                        Privacy Policy
                      </Link>
                      . Submitting an enquiry does not guarantee loan approval.
                    </span>
                  </label>
                  {enquiryErrors.consentAccepted && (
                    <p className="text-[11px] text-red-700">{enquiryErrors.consentAccepted}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submittingEnquiry}
                    className="w-full py-2.5 text-xs font-semibold bg-[#0B1628] text-white hover:bg-[#101F35] disabled:opacity-60 transition-colors cursor-pointer"
                  >
                    {submittingEnquiry ? 'Submitting Enquiry…' : 'Submit Confidential Enquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Utility Support Bar: WhatsApp Support & Quick Enquiry Toggle */}
          <div className="bg-[#FCFBF9] border-t border-[#E5DFD3] px-3.5 py-2 flex items-center justify-between gap-2 shrink-0">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0B1628] hover:text-[#B99752] transition-colors whitespace-nowrap"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#B99752]" aria-hidden="true" />
              WhatsApp Support
            </a>
            <div className="flex items-center gap-3">
              <a
                href={telHref}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#747C86] hover:text-[#0B1628] transition-colors whitespace-nowrap"
              >
                <Phone className="w-3 h-3 text-[#B99752]" aria-hidden="true" />
                Call
              </a>
              <button
                type="button"
                onClick={() => {
                  setSubmittedEnquiry(null);
                  setShowEnquiryForm((prev) => !prev);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B1628] hover:text-[#B99752] transition-colors cursor-pointer whitespace-nowrap"
              >
                <FileText className="w-3.5 h-3.5 text-[#B99752]" aria-hidden="true" />
                {showEnquiryForm ? 'Back to Chat' : 'Submit Enquiry'}
              </button>
            </div>
          </div>

          {/* Message Input Bar */}
          <form
            onSubmit={handleFormSubmit}
            className="bg-white border-t border-[#E5DFD3] px-3 py-2.5 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              maxLength={1200}
              disabled={sending}
              placeholder="Ask in English, Hindi, or Marathi…"
              aria-label="Type your message to SG Finance Assistant"
              className="flex-1 min-w-0 px-3 py-2 text-sm text-[#202A36] bg-[#FCFBF9] border border-[#DDD6C8] focus:border-[#0B1628] focus:bg-white outline-none transition-colors placeholder:text-[#9CA3AF]"
            />
            <button
              type="submit"
              disabled={sending || !inputValue.trim()}
              aria-label="Send message"
              className="inline-flex items-center justify-center w-10 h-10 bg-[#0B1628] text-white hover:bg-[#101F35] disabled:opacity-45 transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4 text-[#D4BC85]" aria-hidden="true" />
            </button>
          </form>
        </section>
      )}
    </>
  );
}
