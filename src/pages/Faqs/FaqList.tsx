import { useState } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { useGetFaqsQuery, useDeleteFaqMutation } from "../../store/api/apiSlice";
import { toast } from "react-hot-toast";

interface FaqItem {
  id: string | number;
  page: string;
  question: string;
  answer: string;
  dateCreated?: string;
  created_at?: string;
}

export interface WebsitePage {
  name: string;
  path: string;
  group: "Core" | "Industries" | "Capabilities";
}

export const websitePages: WebsitePage[] = [
  // Core Pages
  { name: "Overview", path: "/overview/", group: "Core" },
  { name: "Insights", path: "/insights/", group: "Core" },
  { name: "About Us", path: "/about-us/", group: "Core" },
  { name: "Careers", path: "/careers/", group: "Core" },
  { name: "Contact Us", path: "/contact-us/", group: "Core" },
  
  // Industries
  { name: "Financial Services", path: "/industries/financial-services/", group: "Industries" },
  { name: "Corporates", path: "/industries/corporates/", group: "Industries" },
  { name: "Not For Profits", path: "/industries/not-for-profits/", group: "Industries" },
  { name: "Government – Federal and State", path: "/industries/govt-federal-and-state/", group: "Industries" },
  { name: "Telecommunications & Media", path: "/industries/telecommunications-and-media/", group: "Industries" },
  { name: "Defence and National Security", path: "/industries/defence-and-national-security/", group: "Industries" },
  
  // Capabilities
  { name: "Digital and Operational Transformation", path: "/capabilities/digital-and-operational-transformation/", group: "Capabilities" },
  { name: "Artificial Intelligence Solutions", path: "/capabilities/artificial-intelligence-solutions/", group: "Capabilities" },
  { name: "Finance and Risk Consulting", path: "/capabilities/finance-and-risk-consulting/", group: "Capabilities" },
  { name: "Strategy, Advisory and Innovation", path: "/capabilities/strategy-advisory-and-innovation/", group: "Capabilities" },
  { name: "Technology, Data and Insights", path: "/capabilities/technology-data-and-insights/", group: "Capabilities" },
  { name: "Workforce and Organisational Design", path: "/capabilities/workforce-and-organisational-design/", group: "Capabilities" },
];

export const getPagePath = (pageName: string): string => {
  const page = websitePages.find(p => p.name === pageName);
  if (page) return page.path;
  
  // Backward compatibility mappings
  if (pageName === "Home") return "/overview/";
  if (pageName === "Services") return "/capabilities/technology-data-and-insights/";
  return "/";
};

export default function FaqList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [expandedFaqId, setExpandedFaqId] = useState<string | number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | number | null>(null);

  // Fetch FAQs via RTK Query
  const { data: rawFaqs, isLoading } = useGetFaqsQuery(
    { pageNumber: 1, limit: 100 },
    { refetchOnMountOrArgChange: true }
  );

  // Safely parse array of FAQs from raw response shapes
  const faqs: FaqItem[] = Array.isArray(rawFaqs)
    ? rawFaqs
    : (rawFaqs && typeof rawFaqs === "object" && Array.isArray((rawFaqs as any).data)
      ? (rawFaqs as any).data
      : (rawFaqs && typeof rawFaqs === "object" && Array.isArray((rawFaqs as any).faqs)
        ? (rawFaqs as any).faqs
        : []));

  // Delete FAQ Mutation via RTK Query
  const [deleteFaq, { isLoading: isDeleting }] = useDeleteFaqMutation();

  const toggleExpand = (id: string | number) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  // Filter FAQs
  const uniquePages = Array.from(new Set(faqs.map((faq) => faq.page))).sort();

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "All" || faq.page === activeTab;
    return matchesSearch && matchesTab;
  });  const getCategoryBadgeColor = (pageName: string) => {
    const page = websitePages.find(p => p.name === pageName);
    if (!page) {
      if (pageName === "Home" || pageName === "Services") {
        return "bg-blue-50 text-blue-700 border-blue-150 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
      }
      return "bg-gray-50 text-gray-700 border-gray-150 dark:bg-white/5 dark:text-gray-300 dark:border-white/10";
    }

    switch (page.group) {
      case "Core":
        return "bg-blue-50 text-blue-700 border-blue-150 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
      case "Industries":
        return "bg-amber-55 bg-opacity-10 text-amber-800 border-amber-200/50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
      case "Capabilities":
        return "bg-indigo-50 text-indigo-700 border-indigo-150 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20";
      default:
        return "bg-gray-50 text-gray-700 border-gray-150 dark:bg-white/5 dark:text-gray-300 dark:border-white/10";
    }
  };

  return (
    <>
      <PageMeta
        title="FAQ Management Directory | Croconi Digital Admin"
        description="Search, filter, edit, and delete administrative website FAQs with interactive rich HTML previews."
      />

      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white sm:text-3xl">
            FAQ Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Control the Frequently Asked Questions shown to visitors across various website pages.
          </p>
        </div>
        <div>
          <Link
            to="/faqs/add"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-xs font-bold text-white shadow-md shadow-brand-500/15 hover:bg-brand-650 hover:shadow-lg transition-all"
          >
            <svg className="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Create New FAQ
          </Link>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-5 relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search FAQs by question description, answer details, or keyword..."
          className="w-full rounded-xl border border-gray-250 bg-white pl-10 pr-4 py-3 text-sm font-semibold text-gray-700 placeholder-gray-450 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:placeholder-gray-650 transition-colors shadow-sm"
        />
      </div>

      {/* Dynamic Scrolling Category Tabs Bar */}
      <div className="mb-6 flex gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-gray-150 dark:border-gray-800/50">
        <button
          onClick={() => setActiveTab("All")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "All"
              ? "bg-brand-500 text-white shadow-md shadow-brand-500/15"
              : "bg-white border border-gray-250 text-gray-650 hover:bg-gray-50 dark:bg-white/[0.02] dark:border-gray-850 dark:text-gray-400 dark:hover:bg-white/5"
          }`}
        >
          All Web Pages
          <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-extrabold transition-all ${
            activeTab === "All" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400"
          }`}>
            {faqs.length}
          </span>
        </button>

        {uniquePages.map((pageName) => {
          const count = faqs.filter(f => f.page === pageName).length;
          const isActive = activeTab === pageName;
          return (
            <button
              key={pageName}
              onClick={() => setActiveTab(pageName)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? "bg-brand-500 text-white shadow-md shadow-brand-500/15"
                  : "bg-white border border-gray-250 text-gray-650 hover:bg-gray-50 dark:bg-white/[0.02] dark:border-gray-850 dark:text-gray-400 dark:hover:bg-white/5"
              }`}
            >
              {pageName}
              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-extrabold transition-all ${
                isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Delete Confirmation Modal Overlay */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-99 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-955 text-gray-855 dark:text-white animate-scaleUp">
            <div className="flex items-center gap-3 text-rose-500 mb-4">
              <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <h3 className="text-lg font-extrabold">Confirm Removal</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-6">
              Are you absolutely sure you want to delete this FAQ? This action is immediate and cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-955 dark:text-gray-300 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (showDeleteConfirm === null) return;
                  try {
                    await deleteFaq(showDeleteConfirm).unwrap();
                    setShowDeleteConfirm(null);
                    toast.success("FAQ deleted successfully!");
                  } catch (err: any) {
                    console.error("Delete FAQ failed:", err);
                    toast.error(err.data?.message || err.message || "Failed to delete FAQ.");
                  }
                }}
                disabled={isDeleting}
                className="rounded-xl bg-rose-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-rose-500/10 hover:bg-rose-650 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Removing..." : "Delete FAQ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accordion Directory List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">Loading directory...</div>
        ) : filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-300 bg-white dark:bg-white/[0.02] shadow-sm ${
                  isExpanded
                    ? "border-brand-500/30 shadow-md shadow-brand-500/[0.02]"
                    : "border-gray-200/80 hover:border-gray-300/80 dark:border-gray-800/80 dark:hover:border-gray-700/80"
                }`}
              >
                {/* FAQ Header */}
                <div
                  onClick={() => toggleExpand(faq.id)}
                  className="flex items-center justify-between gap-4 p-5 cursor-pointer select-none"
                >
                  <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[9px] font-extrabold tracking-wider uppercase shrink-0 ${getCategoryBadgeColor(faq.page)}`}>
                      {faq.page}
                    </span>
                    <h4 className="text-sm font-extrabold text-gray-900 dark:text-white leading-snug">
                      {faq.question}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-gray-400 font-semibold hidden md:inline">
                      Created: {faq.dateCreated || faq.created_at || "N/A"}
                    </span>
                    <div className={`flex size-7 items-center justify-center rounded-lg bg-gray-50 text-gray-400 dark:bg-white/5 transition-transform duration-300 ${isExpanded ? "rotate-180 text-brand-500 bg-brand-50 dark:bg-brand-500/10 dark:text-brand-400" : ""}`}>
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* FAQ Body */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out border-gray-100 dark:border-gray-800/50 ${
                    isExpanded ? "max-h-[800px] border-t p-5" : "max-h-0"
                  }`}
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:justify-between lg:items-start">
                    <div className="flex-1 max-w-3xl">
                      <div
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                        className="faq-rich-render text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed space-y-2.5
                          [&_h3]:text-sm sm:[&_h3]:text-base [&_h3]:font-black [&_h3]:text-gray-900 [&_h3]:dark:text-white [&_h3]:mt-3.5 [&_h3]:mb-1.5
                          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3.5 [&_ul]:space-y-1.5
                          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-3.5 [&_ol]:space-y-1.5
                          [&_li]:font-semibold [&_li]:text-gray-600 [&_li]:dark:text-gray-450
                          [&_img]:rounded-2xl [&_img]:my-4 [&_img]:max-w-full [&_img]:shadow-md [&_img]:border [&_img]:border-gray-150 [&_img]:dark:border-gray-800"
                      />
                    </div>

                    <div className="flex items-center gap-2 border-t border-gray-100 pt-4 lg:border-t-0 lg:pt-0 shrink-0 self-end lg:self-start">
                      <Link
                        to={`/faqs/edit/${faq.id}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-955 dark:text-gray-350 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <svg className="size-4 text-gray-455" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Modify
                      </Link>
                      <button
                        onClick={() => setShowDeleteConfirm(faq.id)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 shadow-sm hover:bg-rose-500 hover:text-white hover:border-rose-500 dark:border-rose-955/20 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500 dark:hover:text-white transition-all cursor-pointer"
                      >
                        <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-16 rounded-2xl border border-dashed border-gray-300/80 bg-white dark:bg-white/[0.01] dark:border-gray-800/80">
            <svg className="size-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="text-sm font-extrabold text-gray-800 dark:text-gray-355 uppercase tracking-wider">No Matching FAQs Found</h4>
            <p className="text-xs text-gray-450 dark:text-gray-500 mt-1 max-w-sm">
              We couldn't locate any FAQs matching "{searchQuery}" under the category "{activeTab}". Click above to add a fresh entry!
            </p>
          </div>
        )}
      </div>
    </>
  );
}
