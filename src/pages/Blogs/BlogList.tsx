import { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageMeta from "../../components/common/PageMeta";
import { useGetBlogsQuery, useDeleteBlogMutation } from "../../store/api/apiSlice";
import { toast } from "react-hot-toast";

interface BlogItem {
  id: string;
  title: string;
  category: string;
  author: string;
  coverImage?: string;
  cover_image?: string;
  content: string;
  dateCreated?: string;
  created_at?: string;
  readTime?: string;
  read_time?: string;
  tags?: string[] | string;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString.replace(/-/g, "/"));
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return dateString;
  }
};

// Dummy data removed. Prioritizing backend database.

export default function BlogList() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [expandedBlogId, setExpandedBlogId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Fetch blogs via RTK Query (direct live API connection with server-side pagination & filtering)
  const { data: rawBlogs, isLoading } = useGetBlogsQuery(
    {
      page: 1,
      limit: 100,
      category: selectedCategoryFilter,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  // Dynamically extract the array of blogs from all common API wrapper envelopes safely
  const blogs: BlogItem[] = Array.isArray(rawBlogs)
    ? rawBlogs
    : (rawBlogs && typeof rawBlogs === "object" && Array.isArray((rawBlogs as any).data)
      ? (rawBlogs as any).data
      : (rawBlogs && typeof rawBlogs === "object" && Array.isArray((rawBlogs as any).blogs)
        ? (rawBlogs as any).blogs
        : []));

  // Delete Blog Mutation via RTK Query
  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();

  const toggleExpand = (id: string) => {
    setExpandedBlogId(expandedBlogId === id ? null : id);
  };

  // Filter Blogs based on Search Query and Category
  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === "All" || b.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", "Technology", "Design", "Marketing", "Business", "Development"];

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case "Technology":
        return "bg-blue-50 text-blue-700 border-blue-150 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
      case "Design":
        return "bg-purple-50 text-purple-700 border-purple-150 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20";
      case "Marketing":
        return "bg-pink-50 text-pink-700 border-pink-150 dark:bg-pink-500/10 dark:text-pink-400 dark:border-pink-500/20";
      case "Business":
        return "bg-amber-50 text-amber-700 border-amber-150 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
      case "Development":
        return "bg-emerald-50 text-emerald-700 border-emerald-150 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
      default:
        return "bg-gray-50 text-gray-700 border-gray-150 dark:bg-white/5 dark:text-gray-300 dark:border-white/10";
    }
  };

  return (
    <>
      <PageMeta
        title="Blogs Directory | Croconi Digital Admin"
        description="Search, filter, edit, and delete published website articles with high fidelity image grids."
      />

      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white sm:text-3xl">
            Blog Articles Manager
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Publish, edit, and categorize company blog posts and community news stories.
          </p>
        </div>
        <div>
          <Link
            to="/blogs/add"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-xs font-bold text-white shadow-md shadow-brand-500/15 hover:bg-brand-650 hover:shadow-lg transition-all"
          >
            <svg className="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Write Blog Post
          </Link>
        </div>
      </div>

      {/* Filters Hub */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-12 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800/80 dark:bg-white/[0.02]">
        {/* Search */}
        <div className="relative sm:col-span-8">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-450" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles by title, author, or keyword..."
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm font-semibold text-gray-700 placeholder-gray-455 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:placeholder-gray-600 dark:focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Category Selector */}
        <div className="sm:col-span-4">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:focus:border-brand-500 transition-colors"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : `${cat}`}
              </option>
            ))}
          </select>
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
              Are you absolutely sure you want to delete this blog article? This action cannot be reverted.
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
                  if (!showDeleteConfirm) return;
                  try {
                    await deleteBlog(showDeleteConfirm).unwrap();
                    setShowDeleteConfirm(null);
                    toast.success("Blog post deleted successfully!");
                  } catch (err: any) {
                    console.error("Delete blog failed:", err);
                    toast.error(err.data?.message || err.message || "Failed to delete blog post.");
                  }
                }}
                disabled={isDeleting}
                className="rounded-xl bg-rose-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-rose-500/10 hover:bg-rose-650 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Removing..." : "Delete Post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Directory Grid */}
      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Loading blogs showroom...</div>
      ) : filteredBlogs.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBlogs.map((b) => {
            const isExpanded = expandedBlogId === b.id;
            return (
              <div
                key={b.id}
                className={`group flex flex-col justify-between overflow-hidden rounded-3xl border transition-all duration-300 bg-white dark:bg-white/[0.02] shadow-sm ${isExpanded
                  ? "border-brand-500/30 shadow-md md:col-span-2 lg:col-span-3"
                  : "border-gray-200/80 hover:border-brand-500/20 hover:shadow-lg"
                  }`}
              >
                {/* Header/Cover Section */}
                <div className={`relative overflow-hidden shrink-0 ${isExpanded ? "h-64" : "h-44"}`}>
                  <img
                    src={b.coverImage}
                    alt={b.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className={`absolute left-4 top-4 rounded-full border px-3 py-0.5 text-[9px] font-extrabold tracking-wider uppercase backdrop-blur-md shadow-md ${getCategoryBadgeColor(b.category)}`}>
                    {b.category}
                  </span>

                  {isExpanded && (
                    <button
                      onClick={() => toggleExpand(b.id)}
                      className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-slate-900/60 backdrop-blur-md text-white border border-white/10 shadow-lg hover:bg-slate-900 transition-colors"
                    >
                      <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Content Section */}
                <div className="flex flex-col flex-1 p-5.5">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-2">
                    <span>By {b.author}</span>
                    <span>{b.readTime}</span>
                  </div>

                  <h3 className={`text-base font-extrabold text-gray-900 dark:text-white leading-snug group-hover:text-brand-500 transition-colors ${isExpanded ? "text-lg mb-3" : "line-clamp-2"}`}>
                    {b.title}
                  </h3>

                  {isExpanded ? (
                    <div className="mt-4 border-t border-gray-100 pt-4.5 dark:border-gray-800/60 flex-1">
                      <div
                        dangerouslySetInnerHTML={{ __html: b.content }}
                        className="faq-rich-render text-sm text-gray-650 dark:text-gray-355 leading-relaxed space-y-2.5
                          [&_h3]:text-sm sm:[&_h3]:text-base [&_h3]:font-black [&_h3]:text-gray-900 [&_h3]:dark:text-white [&_h3]:mt-3.5 [&_h3]:mb-1.5
                          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3.5 [&_ul]:space-y-1.5
                          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-3.5 [&_ol]:space-y-1.5
                          [&_li]:font-semibold [&_li]:text-gray-600 [&_li]:dark:text-gray-450
                          [&_img]:rounded-2xl [&_img]:my-4 [&_img]:max-w-full [&_img]:shadow-md [&_img]:border [&_img]:border-gray-150 [&_img]:dark:border-gray-800"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleExpand(b.id)}
                      className="mt-4 inline-flex items-center gap-1.5 self-start text-xs font-black text-brand-500 hover:text-brand-650 dark:text-brand-400 group-hover:underline transition-all cursor-pointer"
                    >
                      Read Full Article
                      <svg className="size-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}

                  {/* Actions Bar */}
                  <div className={`mt-5 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800/60 ${isExpanded ? "w-full" : "hidden group-hover:flex"}`}>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      Published: {formatDate(b.created_at || b.dateCreated)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/blogs/edit/${b.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-150 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-850 dark:bg-gray-955 dark:text-gray-300 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        Modify
                      </Link>
                      <button
                        onClick={() => setShowDeleteConfirm(b.id)}
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9" />
          </svg>
          <h4 className="text-sm font-extrabold text-gray-800 dark:text-gray-350 uppercase tracking-wider">No Matching Articles Found</h4>
          <p className="text-xs text-gray-455 dark:text-gray-500 mt-1 max-w-sm">
            We couldn't locate any blog posts matching "{searchQuery}" under category "{selectedCategoryFilter}". Draft a new post above!
          </p>
        </div>
      )}
    </>
  );
}
