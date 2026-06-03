import { useState } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { useGetCaseStudiesQuery, useDeleteCaseStudyMutation } from "../../store/api/apiSlice";
import { toast } from "react-hot-toast";

interface CaseStudyItem {
  id: string;
  title: string;
  category: string;
  client: string;
  year: string;
  coverImage: string;
  cover_image?: string;
  content: string;
  dateCreated: string;
}

const preSeededCases: CaseStudyItem[] = [
  {
    id: "case-seed-1",
    title: "eCommerce Acceleration for Acme Retail",
    category: "Web Development",
    client: "Acme Corp",
    year: "2026",
    coverImage: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=60",
    content: `<h3>The Challenge</h3><p>Acme Corp was experiencing severe checkout bounce rates due to geographical latency issues in their legacy monolith architecture.</p><h3>Our Strategic Integration</h3><ul class="list-disc pl-5 my-2 space-y-1"><li><strong>Serverless Checkout API:</strong> Optimized checkout page response rates by over 50%.</li><li><strong>Dynamic Edge Caching:</strong> Enabled instant product catalog delivery across all nodes.</li><li><strong>Custom Admin Console:</strong> Streamlined inventory audits and simplified catalog manager structures.</li></ul><img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=60" class="rounded-2xl border border-gray-150 my-4 max-h-48 w-full object-cover" alt="SaaS dashboard analytics" />`,
    dateCreated: "May 28, 2026",
  },
  {
    id: "case-seed-2",
    title: "SaaS Scaling Milestone for Wayne Enterprises",
    category: "SaaS Platform",
    client: "Wayne Corp",
    year: "2025",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60",
    content: `<h3>Enterprise Security & Scale</h3><p>Wayne Enterprises required a bulletproof logistical dashboard. We custom-developed a multi-tenant SaaS hub featuring: </p><ul class="list-disc pl-5 my-2 space-y-1"><li><strong>Real-time Asset Tracking:</strong> Leveraged secure WebSockets pipelines for millisecond-level location updates.</li><li><strong>Sub-second Serverless Compiling:</strong> Shifted heavier queries to globally-distributed cloud runners.</li><li><strong>Zero-Trust Gateways:</strong> Standardized end-to-end multi-factor administrative access barriers.</li></ul>`,
    dateCreated: "May 27, 2026",
  },
];

export default function CaseStudyList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [clientFilter, setClientFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Fetch case studies via RTK Query live API (with local storage pre-seeded backup)
  const { data: apiCasesData = [], isLoading: isApiLoading } = useGetCaseStudiesQuery(
    {
      page: 1,
      limit: 100,
      category: selectedCategoryFilter,
      year: yearFilter,
      client: clientFilter,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );
  const [deleteCaseStudy, { isLoading: isDeleting }] = useDeleteCaseStudyMutation();

  const localCasesStr = localStorage.getItem("croconi_casestudies");
  const localCases: CaseStudyItem[] = localCasesStr ? JSON.parse(localCasesStr) : preSeededCases;

  const casesList: CaseStudyItem[] = Array.isArray(apiCasesData) && apiCasesData.length > 0
    ? apiCasesData
    : (apiCasesData && typeof apiCasesData === "object" && Array.isArray((apiCasesData as any).data) && (apiCasesData as any).data.length > 0
      ? (apiCasesData as any).data
      : localCases);

  const handleDeleteCase = async (caseId: string) => {
    try {
      await deleteCaseStudy(caseId).unwrap();
      
      const savedCases = localStorage.getItem("croconi_casestudies");
      if (savedCases) {
        const casesArray: CaseStudyItem[] = JSON.parse(savedCases);
        const updated = casesArray.filter((c) => c.id !== caseId);
        localStorage.setItem("croconi_casestudies", JSON.stringify(updated));
      }

      toast.success("Case study deleted successfully!");
      setShowDeleteConfirm(null);
    } catch (err: any) {
      console.error("Failed to delete case study:", err);
      toast.error(err.data?.message || err.message || "Failed to remove case study.");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedCaseId(expandedCaseId === id ? null : id);
  };

  // Filter Case Studies based on Search Query and Category
  const filteredCases = casesList.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === "All" || c.category === selectedCategoryFilter;
    const matchesClient = clientFilter.trim() === "" || c.client.toLowerCase().includes(clientFilter.toLowerCase());
    const matchesYear = yearFilter.trim() === "" || c.year.includes(yearFilter);
    return matchesSearch && matchesCategory && matchesClient && matchesYear;
  });

  const categories = ["All", "Web Development", "SEO Optimization", "SaaS Platform", "Mobile App Development"];

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case "Web Development":
        return "bg-blue-50 text-blue-700 border-blue-150 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
      case "SEO Optimization":
        return "bg-pink-50 text-pink-700 border-pink-150 dark:bg-pink-500/10 dark:text-pink-400 dark:border-pink-500/20";
      case "SaaS Platform":
        return "bg-purple-50 text-purple-700 border-purple-150 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20";
      case "Mobile App Development":
        return "bg-emerald-50 text-emerald-700 border-emerald-150 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
      default:
        return "bg-gray-50 text-gray-700 border-gray-150 dark:bg-white/5 dark:text-gray-300 dark:border-white/10";
    }
  };

  return (
    <>
      <PageMeta
        title="Case Studies Directory | Croconi Digital Admin"
        description="Search, filter, edit, and delete published client success portfolios with full HTML detail support."
      />

      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white sm:text-3xl">
            Case Studies Showroom
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Publish and manage client portfolio success metrics and technical development reviews.
          </p>
        </div>
        <div>
          <Link
            to="/case-studies/add"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-xs font-bold text-white shadow-md shadow-brand-500/15 hover:bg-brand-650 hover:shadow-lg transition-all"
          >
            <svg className="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Publish Case Study
          </Link>
        </div>
      </div>

      {/* Filters Hub Grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-12 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800/80 dark:bg-white/[0.02]">
        {/* Search */}
        <div className="relative sm:col-span-4">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-450" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords..."
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-gray-700 placeholder-gray-450 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-955 dark:text-gray-300 dark:placeholder-gray-600 dark:focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Category Selector */}
        <div className="sm:col-span-3">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-955 dark:text-gray-300 dark:focus:border-brand-500 transition-colors"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : `${cat}`}
              </option>
            ))}
          </select>
        </div>

        {/* Client Selector */}
        <div className="sm:col-span-3 relative">
          <input
            type="text"
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            placeholder="Filter by Client (e.g. Wayne)"
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 placeholder-gray-450 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-955 dark:text-gray-300 dark:placeholder-gray-600 dark:focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Year Selector */}
        <div className="sm:col-span-2 relative">
          <input
            type="text"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            placeholder="Year (e.g. 2026)"
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 placeholder-gray-450 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-955 dark:text-gray-300 dark:placeholder-gray-600 dark:focus:border-brand-500 transition-colors"
          />
        </div>
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
              Are you absolutely sure you want to delete this case study? This project portfolio will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-855 dark:bg-gray-950 dark:text-gray-350 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => showDeleteConfirm && handleDeleteCase(showDeleteConfirm)}
                disabled={isDeleting}
                className="rounded-xl bg-rose-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-rose-500/10 hover:bg-rose-650 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Removing..." : "Delete Portfolio"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Directory Grid */}
      {isApiLoading && casesList.length === 0 ? (
        <div className="text-center py-10 text-gray-500">Loading cases directory...</div>
      ) : filteredCases.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCases.map((c) => {
            const isExpanded = expandedCaseId === c.id;
            return (
              <div
                key={c.id}
                className={`group flex flex-col justify-between overflow-hidden rounded-3xl border transition-all duration-300 bg-white dark:bg-white/[0.02] shadow-sm ${
                  isExpanded
                    ? "border-brand-500/30 shadow-md md:col-span-2 lg:col-span-3"
                    : "border-gray-200/80 hover:border-brand-500/20 hover:shadow-lg"
                }`}
              >
                {/* Cover section */}
                <div className={`relative overflow-hidden shrink-0 ${isExpanded ? "h-64" : "h-44"}`}>
                  <img
                    src={c.cover_image || c.coverImage}
                    alt={c.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className={`absolute left-4 top-4 rounded-full border px-3 py-0.5 text-[9px] font-extrabold tracking-wider uppercase backdrop-blur-md shadow-md ${getCategoryBadgeColor(c.category)}`}>
                    {c.category}
                  </span>

                  {isExpanded && (
                    <button
                      onClick={() => toggleExpand(c.id)}
                      className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-slate-900/60 backdrop-blur-md text-white border border-white/10 shadow-lg hover:bg-slate-900 transition-colors"
                    >
                      <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Content Details */}
                <div className="flex flex-col flex-1 p-5.5">
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-2">
                    <div>Client: <span className="text-gray-800 dark:text-white font-bold">{c.client}</span></div>
                    <div className="text-right">Year: <span className="text-gray-800 dark:text-white font-bold">{c.year}</span></div>
                  </div>

                  <h3 className={`text-base font-extrabold text-gray-900 dark:text-white leading-snug group-hover:text-brand-500 transition-colors ${isExpanded ? "text-lg mb-3" : "line-clamp-2"}`}>
                    {c.title}
                  </h3>

                  {isExpanded ? (
                    <div className="mt-4 border-t border-gray-100 pt-4.5 dark:border-gray-800/60 flex-1">
                      <div
                        dangerouslySetInnerHTML={{ __html: c.content }}
                        className="faq-rich-render text-sm text-gray-650 dark:text-gray-350 leading-relaxed space-y-2.5
                          [&_h3]:text-sm sm:[&_h3]:text-base [&_h3]:font-black [&_h3]:text-gray-900 [&_h3]:dark:text-white [&_h3]:mt-3.5 [&_h3]:mb-1.5
                          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3.5 [&_ul]:space-y-1.5
                          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-3.5 [&_ol]:space-y-1.5
                          [&_li]:font-semibold [&_li]:text-gray-600 [&_li]:dark:text-gray-455
                          [&_img]:rounded-2xl [&_img]:my-4 [&_img]:max-w-full [&_img]:shadow-md [&_img]:border [&_img]:border-gray-150 [&_img]:dark:border-gray-800"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleExpand(c.id)}
                      className="mt-4 inline-flex items-center gap-1.5 self-start text-xs font-black text-brand-500 hover:text-brand-650 dark:text-brand-400 group-hover:underline transition-all cursor-pointer"
                    >
                      Read Case Details
                      <svg className="size-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}

                  {/* Actions Bar */}
                  <div className={`mt-5 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800/60 ${isExpanded ? "w-full" : "hidden group-hover:flex"}`}>
                    <span className="text-[10px] text-gray-450 font-semibold">
                      Registered: {c.dateCreated}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/case-studies/edit/${c.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-155 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-850 dark:bg-gray-955 dark:text-gray-300 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        Modify
                      </Link>
                      <button
                        onClick={() => setShowDeleteConfirm(c.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-100 bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-700 shadow-sm hover:bg-rose-500 hover:text-white hover:border-rose-500 dark:border-rose-955/20 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500 dark:hover:text-white transition-all cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-16 rounded-2xl border border-dashed border-gray-300/80 bg-white dark:bg-white/[0.01] dark:border-gray-800/80">
          <svg className="size-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4" />
          </svg>
          <h4 className="text-sm font-extrabold text-gray-800 dark:text-gray-350 uppercase tracking-wider">No Portfolios Found</h4>
          <p className="text-xs text-gray-455 dark:text-gray-500 mt-1 max-w-sm">
            We couldn't locate any projects matching "{searchQuery}" under category "{selectedCategoryFilter}". Publish a fresh one above!
          </p>
        </div>
      )}
    </>
  );
}
