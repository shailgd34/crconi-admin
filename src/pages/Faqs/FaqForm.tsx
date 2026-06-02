import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { websitePages } from "./FaqList";
import { useAddFaqMutation, useUpdateFaqMutation, useGetFaqsQuery } from "../../store/api/apiSlice";
import { toast } from "react-hot-toast";

interface FaqItem {
  id: string | number;
  page: string;
  question: string;
  answer: string;
  dateCreated?: string;
  created_at?: string;
}

interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

export default function FaqForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Track separate textarea elements for rich HTML helper injections
  const textareaRefs = useRef<Record<number, HTMLTextAreaElement | null>>({});

  const [page, setPage] = useState("Overview");
  const [faqs, setFaqs] = useState<FaqEntry[]>([
    { id: "initial-1", question: "", answer: "" }
  ]);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number>(0);
  const [expandedPreviewIndex, setExpandedPreviewIndex] = useState<number | null>(0);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [addFaq, { isLoading: isAdding }] = useAddFaqMutation();
  const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation();

  const isSaving = isAdding || isUpdating;

  // Fetch live FAQs to find the item in Edit Mode
  const { data: rawFaqs } = useGetFaqsQuery({ pageNumber: 1, limit: 100 });
  const faqsList: FaqItem[] = Array.isArray(rawFaqs)
    ? rawFaqs
    : (rawFaqs && typeof rawFaqs === "object" && Array.isArray((rawFaqs as any).data)
      ? (rawFaqs as any).data
      : (rawFaqs && typeof rawFaqs === "object" && Array.isArray((rawFaqs as any).faqs)
        ? (rawFaqs as any).faqs
        : []));

  // Load existing FAQ if in edit mode
  useEffect(() => {
    if (id && faqsList && faqsList.length > 0) {
      const faqToEdit = faqsList.find((f) => String(f.id) === String(id));
      if (faqToEdit) {
        setPage(faqToEdit.page);
        setFaqs([{ id: String(faqToEdit.id), question: faqToEdit.question, answer: faqToEdit.answer }]);
        setActiveFaqIndex(0);
        setExpandedPreviewIndex(0);
      } else {
        setNotification({ type: "error", message: "FAQ not found in live database." });
      }
    }
  }, [id, faqsList]);

  // Add a new empty FAQ row to our dynamic editor array
  const handleAddFaqRow = () => {
    const newId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newFaqs = [...faqs, { id: newId, question: "", answer: "" }];
    setFaqs(newFaqs);
    setActiveFaqIndex(newFaqs.length - 1);
    setExpandedPreviewIndex(newFaqs.length - 1);
  };

  // Remove an FAQ row at a specific index
  const handleRemoveFaqRow = (indexToRemove: number) => {
    if (faqs.length <= 1) return; // Keep at least one row active

    const newFaqs = faqs.filter((_, idx) => idx !== indexToRemove);
    setFaqs(newFaqs);

    // Adjust active selection indexes safely
    const newActiveIndex = activeFaqIndex >= newFaqs.length ? newFaqs.length - 1 : activeFaqIndex;
    setActiveFaqIndex(newActiveIndex);
    setExpandedPreviewIndex(newActiveIndex);
  };

  // Handle value change inside text fields
  const handleFieldChange = (index: number, field: "question" | "answer", value: string) => {
    const updated = [...faqs];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setFaqs(updated);
  };

  // Insert HTML helper template at current cursor position of active textarea
  const injectHTML = (template: string) => {
    const textarea = textareaRefs.current[activeFaqIndex];
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const text = textarea.value;

    const newText = text.substring(0, startPos) + template + text.substring(endPos, text.length);

    handleFieldChange(activeFaqIndex, "answer", newText);

    // Refocus and place cursor after inserted text
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = startPos + template.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    // Validate that all FAQ entries have content
    for (let i = 0; i < faqs.length; i++) {
      if (!faqs[i].question.trim()) {
        const msg = `FAQ Row #${i + 1} must have a valid question description.`;
        setNotification({ type: "error", message: msg });
        toast.error(msg);
        return;
      }
      if (!faqs[i].answer.trim()) {
        const msg = `FAQ Row #${i + 1} must have a valid answer description.`;
        setNotification({ type: "error", message: msg });
        toast.error(msg);
        return;
      }
    }

    try {
      if (id) {
        // Edit Mode: Update single FAQ
        await updateFaq({
          id: Number(id),
          page: page,
          question: faqs[0].question,
          answer: faqs[0].answer
        }).unwrap();
      } else {
        // Create Mode: Batch publish using Promise.all on sequential addFaq mutations
        const savePromises = faqs.map((faq) =>
          addFaq({
            page: page,
            question: faq.question,
            answer: faq.answer
          }).unwrap()
        );
        await Promise.all(savePromises);
      }

      const successMsg = id ? "FAQ updated successfully!" : `Successfully published ${faqs.length} FAQs!`;
      setNotification({
        type: "success",
        message: successMsg
      });
      toast.success(successMsg);
      setTimeout(() => navigate("/faqs"), 1200);
    } catch (apiErr: any) {
      console.error("Faq API save failed:", apiErr);
      const errMsg = apiErr.data?.message || apiErr.data?.error || apiErr.message || "Failed to publish FAQ to the backend API.";
      setNotification({ type: "error", message: errMsg });
      toast.error(errMsg);
    }
  };

  return (
    <>
      <PageMeta
        title={`${id ? "Edit" : "Batch Create"} FAQs | Croconi Digital Admin`}
        description="Select a website page and publish multiple beautifully formatted HTML FAQs inside a single batch transaction."
      />

      {/* Header Section */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white sm:text-3xl">
            {id ? "Modify FAQ" : "Batch Publish FAQs"}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {id
              ? "Modify parameters, update inquiries, and refine rich HTML response blocks."
              : "Select a page segment once and write multiple question & answer pairs together."}
          </p>
        </div>
        <div>
          <Link
            to="/faqs"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-850 dark:bg-white/[0.02] dark:text-gray-300 dark:hover:bg-white/5 transition-colors"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Directory
          </Link>
        </div>
      </div>

      {/* Alert Notification */}
      {notification && (
        <div
          className={`mb-6 flex items-center gap-3 rounded-2xl border p-4.5 text-xs font-bold shadow-sm transition-all animate-fadeIn ${
            notification.type === "success"
              ? "border-emerald-250 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400"
              : "border-rose-250 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-455"
          }`}
        >
          <svg className="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={notification.type === "success" ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"} />
          </svg>
          {notification.message}
        </div>
      )}

      {/* Workspace Editor Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Left Side: Batch Form Editor */}
        <form onSubmit={handleSubmitForm} className="lg:col-span-7 space-y-6">
          
          {/* Target Page Category Selector Card */}
          <div className="rounded-3xl border border-gray-250/60 bg-white p-6 shadow-sm dark:border-gray-800/80 dark:bg-white/[0.02]">
            <label htmlFor="faq-page" className="block text-xs font-bold text-gray-450 uppercase tracking-wider mb-2.5">
              Target Website Page Category
            </label>
            <select
              id="faq-page"
              value={page}
              onChange={(e) => setPage(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:focus:border-brand-500 transition-colors"
            >
              <optgroup label="Core Pages">
                {websitePages.filter(p => p.group === "Core").map(p => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Industries">
                {websitePages.filter(p => p.group === "Industries").map(p => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Capabilities">
                {websitePages.filter(p => p.group === "Capabilities").map(p => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* HTML Rich text helper tools (targets the active focused row) */}
          <div className="rounded-2xl border border-gray-250/60 bg-white p-4 shadow-sm dark:border-gray-800/80 dark:bg-white/[0.02] flex flex-wrap gap-2 items-center justify-between">
            <span className="text-[10px] font-bold text-gray-450 uppercase tracking-wider">
              HTML Helpers (Row #{activeFaqIndex + 1})
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => injectHTML("<h3>Sub-Heading</h3>\n")}
                className="inline-flex items-center justify-center rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700 border border-gray-150 hover:bg-gray-100 dark:bg-gray-955 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                H3 Header
              </button>
              <button
                type="button"
                onClick={() => injectHTML("<ul>\n  <li>Strategic key metric</li>\n  <li>Bespoke operational node</li>\n</ul>\n")}
                className="inline-flex items-center justify-center rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700 border border-gray-150 hover:bg-gray-100 dark:bg-gray-955 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Bullets
              </button>
              <button
                type="button"
                onClick={() => injectHTML("<strong>Bold text keyphrase</strong>")}
                className="inline-flex items-center justify-center rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700 border border-gray-150 hover:bg-gray-100 dark:bg-gray-955 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Bold
              </button>
              <button
                type="button"
                onClick={() => injectHTML('<a href="#" class="text-brand-500 hover:underline font-semibold">Bespoke Link</a>')}
                className="inline-flex items-center justify-center rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700 border border-gray-150 hover:bg-gray-100 dark:bg-gray-955 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Link
              </button>
            </div>
          </div>

          {/* Dynamic FAQ entries editor list */}
          <div className="space-y-5">
            {faqs.map((faq, index) => {
              const isActive = activeFaqIndex === index;
              return (
                <div
                  key={faq.id}
                  onClick={() => {
                    setActiveFaqIndex(index);
                    setExpandedPreviewIndex(index);
                  }}
                  className={`rounded-3xl border bg-white p-5 shadow-sm dark:bg-white/[0.02] transition-all duration-300 ${
                    isActive
                      ? "border-brand-500/40 ring-1 ring-brand-500/20"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-750"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-800/60">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-extrabold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                      FAQ Row #{index + 1}
                    </span>
                    
                    {faqs.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFaqRow(index);
                        }}
                        className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-1 text-[10px] font-bold text-rose-700 hover:bg-rose-500 hover:text-white dark:border-rose-955/20 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500 dark:hover:text-white transition-all cursor-pointer"
                      >
                        Remove Row
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Question Field */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-450 uppercase tracking-wider mb-1.5">
                        FAQ Inquiry Question
                      </label>
                      <input
                        type="text"
                        value={faq.question}
                        placeholder="e.g. What levels of digital transformation consulting do you support?"
                        onChange={(e) => handleFieldChange(index, "question", e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:placeholder-gray-650 transition-colors"
                      />
                    </div>

                    {/* Rich HTML Answer Field */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-450 uppercase tracking-wider mb-1.5">
                        HTML Response Answer
                      </label>
                      <textarea
                        ref={(el) => {
                          textareaRefs.current[index] = el;
                        }}
                        value={faq.answer}
                        rows={5}
                        placeholder="✍️ Write HTML formatted solution here..."
                        onChange={(e) => handleFieldChange(index, "answer", e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:placeholder-gray-650 transition-colors font-mono"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add FAQ Button */}
          {!id && (
            <button
              type="button"
              onClick={handleAddFaqRow}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-250 dark:border-gray-800 py-3.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:border-brand-500/50 hover:bg-gray-50 dark:hover:bg-white/[0.01] hover:text-brand-500 transition-all cursor-pointer"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add Another FAQ Row to Batch
            </button>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5 dark:border-gray-800/60">
            <Link
              to="/faqs"
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-850 dark:bg-gray-955 dark:text-gray-300 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-brand-500 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/10 hover:bg-brand-650 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? "Publishing..." : id ? "Update FAQ Entry" : `Publish ${faqs.length} FAQs`}
            </button>
          </div>

        </form>

        {/* Right Side: Live HTML Visual Preview (Renders all dynamic FAQs as an accordion set together) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="sticky top-20 rounded-3xl border border-gray-250/60 bg-white p-6 shadow-sm dark:border-gray-800/80 dark:bg-white/[0.02] flex flex-col flex-1 min-h-[500px]">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800/60">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Accordion Set Live Preview
                </h3>
                <p className="text-xs text-gray-450 dark:text-gray-400 mt-0.5 font-medium">
                  Dynamic visual structure of this FAQ batch
                </p>
              </div>
              <span className="rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-[10px] font-extrabold text-brand-600 uppercase dark:bg-brand-500/10 dark:border-brand-500/20 dark:text-brand-400">
                {page}
              </span>
            </div>

            {/* Rendered Preview Box */}
            <div className="flex-1 overflow-y-auto no-scrollbar rounded-2xl bg-gray-50/50 p-4 border border-gray-150 dark:bg-white/[0.01] dark:border-gray-800/50 space-y-3">
              {faqs.some(f => f.question.trim() || f.answer.trim()) ? (
                faqs.map((faq, index) => {
                  const isExpanded = expandedPreviewIndex === index;
                  return (
                    <div
                      key={faq.id}
                      className={`rounded-2xl border bg-white dark:bg-white/[0.02] overflow-hidden shadow-sm transition-all duration-300 ${
                        isExpanded ? "border-brand-500/30" : "border-gray-200 dark:border-gray-800/60"
                      }`}
                    >
                      {/* Accordion Preview Header */}
                      <div
                        onClick={() => setExpandedPreviewIndex(isExpanded ? null : index)}
                        className="flex items-center justify-between gap-3 p-4 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center size-5 rounded-full bg-brand-50 text-[9px] font-black text-brand-500 dark:bg-brand-500/10 dark:text-brand-400">
                            {index + 1}
                          </span>
                          <h4 className="text-xs font-extrabold text-gray-850 dark:text-white leading-tight">
                            {faq.question || `Draft Inquiry Question #${index + 1}...`}
                          </h4>
                        </div>
                        <div className={`flex size-5 shrink-0 items-center justify-center rounded bg-gray-50 text-gray-400 dark:bg-white/5 transition-transform duration-300 ${isExpanded ? "rotate-180 text-brand-500 bg-brand-50 dark:bg-brand-500/10" : ""}`}>
                          <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* Accordion Preview Body */}
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out border-gray-100 dark:border-gray-800/50 ${
                        isExpanded ? "max-h-[500px] border-t p-4" : "max-h-0"
                      }`}>
                        {faq.answer ? (
                          <div
                            dangerouslySetInnerHTML={{ __html: faq.answer }}
                            className="faq-rich-render text-xs text-gray-600 dark:text-gray-300 leading-relaxed space-y-2
                              [&_h3]:text-xs [&_h3]:font-black [&_h3]:text-gray-900 [&_h3]:dark:text-white [&_h3]:mt-2.5 [&_h3]:mb-1
                              [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-2 [&_ul]:space-y-1
                              [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-2 [&_ol]:space-y-1
                              [&_li]:font-semibold [&_li]:text-gray-600 [&_li]:dark:text-gray-400
                              [&_img]:rounded-xl [&_img]:my-3 [&_img]:max-h-36 [&_img]:object-cover [&_img]:shadow-sm"
                          />
                        ) : (
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold italic">
                            Draft HTML solution to see visual response content here...
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center text-gray-400 py-24">
                  <svg className="size-10 text-gray-300 mb-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Empty Accordion Workspace</span>
                  <span className="text-[11px] text-gray-455 mt-1 max-w-[200px]">
                    Formulate your dynamic FAQ list to watch the accordion sets compile live here.
                  </span>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
