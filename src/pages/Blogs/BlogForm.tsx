import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { useForm } from "react-hook-form";
import PageMeta from "../../components/common/PageMeta";
import { useAddBlogMutation, useUpdateBlogMutation, useGetBlogsQuery } from "../../store/api/apiSlice";
import { toast } from "react-hot-toast";

interface BlogInputs {
  title: string;
  category: string;
  author: string;
  coverImage: string;
  content: string;
  tags: string[];
}

export default function BlogForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [addBlog, { isLoading: isAdding }] = useAddBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const { data: blogs = [] } = useGetBlogsQuery(undefined);
  const isSaving = isAdding || isUpdating;

  const handleResetForm = () => {
    reset({
      title: "",
      category: "Technology",
      author: "crconi digital",
      coverImage: "",
      content: "",
      tags: [],
    });
    setSelectedFile(null);
    setShowSuccessModal(false);
    setNotification(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setNotification({ type: "error", message: "Image file size exceeds 2MB limit." });
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setValue("coverImage", base64String, { shouldValidate: true, shouldDirty: true });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setNotification({ type: "error", message: "Please upload an image file." });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setNotification({ type: "error", message: "Image file size exceeds 2MB limit." });
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setValue("coverImage", base64String, { shouldValidate: true, shouldDirty: true });
    };
    reader.readAsDataURL(file);
  };

  // Default premium cover graphics
  const defaultCovers: Record<string, string> = {
    Technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60",
    Design: "https://images.unsplash.com/photo-1561070791-26c113006238?w=800&auto=format&fit=crop&q=60",
    Marketing: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60",
    Business: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60",
    Development: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=60",
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BlogInputs>({
    defaultValues: {
      title: "",
      category: "Technology",
      author: "crconi digital",
      coverImage: "",
      content: "",
      tags: [],
    },
  });

  const titleValue = watch("title");
  const categoryValue = watch("category");
  const authorValue = watch("author");
  const coverImageValue = watch("coverImage");
  const contentValue = watch("content");
  const tagsValue = watch("tags") || [];

  const [tagInput, setTagInput] = useState("");

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/,/g, "");
      if (trimmed && !tagsValue.includes(trimmed)) {
        setValue("tags", [...tagsValue, trimmed], { shouldDirty: true });
        setTagInput("");
      }
    }
  };

  const removeTag = (indexToRemove: number) => {
    const newTags = tagsValue.filter((_, idx) => idx !== indexToRemove);
    setValue("tags", newTags, { shouldDirty: true });
  };

  // Dynamically extract the array of blogs from all common API wrapper envelopes safely
  const blogsList: any[] = Array.isArray(blogs)
    ? blogs
    : (blogs && typeof blogs === "object" && Array.isArray((blogs as any).data)
      ? (blogs as any).data
      : (blogs && typeof blogs === "object" && Array.isArray((blogs as any).blogs)
        ? (blogs as any).blogs
        : []));

  // Load existing blog if in edit mode
  useEffect(() => {
    if (id && blogsList && blogsList.length > 0) {
      const blogToEdit = blogsList.find((b: any) => String(b.id) === String(id) || String(b.blog_id) === String(id));
      if (blogToEdit) {
        reset({
          title: blogToEdit.title,
          category: blogToEdit.category,
          author: blogToEdit.author,
          coverImage: blogToEdit.cover_image || blogToEdit.coverImage || "",
          content: blogToEdit.content,
          tags: Array.isArray(blogToEdit.tags)
            ? blogToEdit.tags
            : typeof blogToEdit.tags === "string"
              ? JSON.parse(blogToEdit.tags)
              : [],
        });
      } else {
        setNotification({ type: "error", message: "Blog article not found." });
      }
    }
  }, [id, blogsList, reset]);

  // Insert HTML helper template at current cursor position
  const injectHTML = (template: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const text = textarea.value;

    const newText = text.substring(0, startPos) + template + text.substring(endPos, text.length);

    // Sync React Hook Form
    setValue("content", newText, { shouldValidate: true, shouldDirty: true });

    // Refocus cursor
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = startPos + template.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const onSubmit = async (data: BlogInputs) => {
    setNotification(null);
    try {
      // Calculate approximate read time (e.g. 200 words per minute)
      const wordCount = data.content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
      const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
      const readTimeString = `${readTimeMinutes} min read`;

      const finalCover = data.coverImage.trim() || defaultCovers[data.category] || defaultCovers["Technology"];

      // 1. Submit real API request (visible in DevTools Network tab)
      if (id) {
        // Create FormData payload for update multipart upload matching key schema:
        // id, title, category, author, content, read_time, tags, cover_image (optional)
        const formData = new FormData();
        formData.append("id", id);
        formData.append("title", data.title);
        formData.append("category", data.category);
        formData.append("author", data.author.trim() || "crconi digital");
        formData.append("content", data.content);
        formData.append("read_time", readTimeString);
        formData.append("tags", JSON.stringify(data.tags || []));
        if (selectedFile) {
          formData.append("cover_image", selectedFile);
        }
        await updateBlog(formData).unwrap();
      } else {
        // Create FormData payload for real multipart upload matching key schema:
        // title, category, author, content, read_time, tags, cover_image
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("category", data.category);
        formData.append("author", data.author.trim() || "crconi digital");
        formData.append("content", data.content);
        formData.append("read_time", readTimeString);
        formData.append("tags", JSON.stringify(data.tags || []));
        if (selectedFile) {
          formData.append("cover_image", selectedFile);
        }
        await addBlog(formData).unwrap();
      }

      // 2. Mock fallback removed to prioritize server-side API data

      // 3. Clear/feedback and show overlay success modal or redirect
      toast.success(id ? "Blog post updated successfully!" : "Blog post published successfully!");
      setNotification({
        type: "success",
        message: id ? "Blog article updated successfully!" : "Blog article added successfully!",
      });

      if (id) {
        setTimeout(() => {
          navigate("/blogs");
        }, 1500);
      } else {
        setShowSuccessModal(true);
      }
    } catch (err: any) {
      console.error("Save blog API failed:", err);
      const errMsg = err.data?.message || err.data?.error || err.message || "Failed to publish blog post.";
      setNotification({ type: "error", message: errMsg });
      toast.error(errMsg);
    }
  };

  const { ref: contentFormRef, ...contentRegisterProps } = register("content", {
    required: "Blog content is required",
  });

  return (
    <>
      <PageMeta
        title={`${id ? "Edit" : "Write"} Blog Post | Croconi Digital Admin`}
        description="Draft stunning website blog posts with dynamic HTML integration and live previews."
      />

      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white sm:text-3xl">
            {id ? "Edit Blog Article" : "Write Blog Post"}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {id
              ? "Refine your article's layout, graphics, meta elements, and content structures."
              : "Draft a fresh blog post with premium graphics and HTML styled article blocks."}
          </p>
        </div>
        <div>
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-855 dark:bg-white/[0.02] dark:text-gray-300 dark:hover:bg-white/5 transition-colors"
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
          className={`mb-6 flex items-center gap-3 rounded-2xl border p-4.5 text-xs font-bold shadow-sm transition-all animate-fadeIn ${notification.type === "success"
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

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

        {/* Editor Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-gray-250/60 bg-white p-6 shadow-sm dark:border-gray-800/80 dark:bg-white/[0.02]">
            <h3 className="mb-5 text-base font-bold text-gray-900 dark:text-white">
              Article Content Editor
            </h3>

            <div className="space-y-5">
              {/* Title */}
              <div>
                <label htmlFor="blog-title" className="block text-xs font-bold text-gray-450 uppercase tracking-wider mb-2">
                  Blog Post Title
                </label>
                <input
                  id="blog-title"
                  type="text"
                  placeholder="e.g. Next-Gen Web Optimization Strategies for 2026"
                  {...register("title", { required: "Blog post title is required" })}
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:placeholder-gray-600 dark:focus:border-brand-500 transition-colors ${errors.title ? "border-error-500 focus:border-error-500" : "border-gray-200"
                    }`}
                />
                {errors.title && (
                  <p className="mt-1.5 text-xs text-error-500 font-semibold">{errors.title.message}</p>
                )}
              </div>

              {/* Category & Author */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="blog-category" className="block text-xs font-bold text-gray-450 uppercase tracking-wider mb-2">
                    Topic Category
                  </label>
                  <select
                    id="blog-category"
                    {...register("category")}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:focus:border-brand-500 transition-colors"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Design">Design & UX</option>
                    <option value="Marketing">Growth Marketing</option>
                    <option value="Business">Business Strategy</option>
                    <option value="Development">Engineering & Web dev</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="blog-author" className="block text-xs font-bold text-gray-450 uppercase tracking-wider mb-2">
                    Author Display Name
                  </label>
                  <input
                    id="blog-author"
                    type="text"
                    placeholder="Admin"
                    {...register("author")}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:placeholder-gray-600 dark:focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-450 uppercase tracking-wider mb-2">
                  Cover Image
                </label>

                {coverImageValue ? (
                  <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-gray-955 h-44 group">
                    <img
                      src={coverImageValue}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-200">
                      <button
                        type="button"
                        onClick={() => {
                          setValue("coverImage", "", { shouldDirty: true });
                          setSelectedFile(null);
                        }}
                        className="rounded-xl bg-red-650 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors shadow-md cursor-pointer"
                      >
                        Remove Image
                      </button>
                      <label className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors shadow-md cursor-pointer">
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-250 dark:border-gray-800 rounded-2xl h-44 bg-gray-50/50 dark:bg-white/[0.01] hover:bg-gray-50 dark:hover:bg-white/[0.02] cursor-pointer transition-all hover:border-brand-500/50 group relative"
                  >
                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="size-8 text-gray-400 group-hover:text-brand-500 transition-colors mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mb-1 text-sm text-gray-500 dark:text-gray-400 font-semibold">
                          <span className="text-brand-500">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-400 font-medium">PNG, JPG, GIF or WEBP (Max 2MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                <div className="mt-3">
                  <span className="text-[10px] text-gray-450 dark:text-gray-400 font-semibold block">
                    Leave blank to apply a high-quality stock category cover.
                  </span>
                </div>
              </div>

              {/* Tags Input */}
              <div>
                <label htmlFor="blog-tags" className="block text-xs font-bold text-gray-450 uppercase tracking-wider mb-2">
                  Blog Meta Tags
                </label>
                <div className="flex flex-wrap gap-2 p-2.5 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-955 focus-within:border-brand-500 min-h-12 transition-colors">
                  {tagsValue.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50/70 border border-brand-100 px-2.5 py-1 text-xs font-bold text-brand-600 dark:bg-brand-500/10 dark:border-brand-500/20 dark:text-brand-400 animate-fadeIn"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(idx)}
                        className="text-brand-500 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-350 shrink-0 font-black cursor-pointer text-sm"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                  <input
                    id="blog-tags"
                    type="text"
                    placeholder={tagsValue.length === 0 ? "e.g. SEO, Growth, Tutorial (Press Enter/comma to add)" : "Add tag..."}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="flex-1 min-w-[120px] bg-transparent text-sm font-semibold text-gray-750 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none border-none p-1.5"
                  />
                </div>
              </div>

              {/* Content Textarea */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="blog-content" className="block text-xs font-bold text-gray-450 uppercase tracking-wider">
                    HTML Blog Body Layout
                  </label>
                  <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wide">
                    HTML Enabled
                  </span>
                </div>

                {/* HTML Helper Toolbar */}
                <div className="flex flex-wrap gap-1.5 rounded-t-xl border-t border-x border-gray-200 bg-gray-50/70 p-2 dark:border-gray-800 dark:bg-gray-900/60">
                  <button
                    type="button"
                    onClick={() => injectHTML("<h3>Dynamic Chapter Subtitle</h3>\n")}
                    className="inline-flex items-center justify-center rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm border border-gray-150 hover:bg-gray-50 dark:bg-gray-955 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
                  >
                    H3 Heading
                  </button>
                  <button
                    type="button"
                    onClick={() => injectHTML("<ul>\n  <li>Key takeaway item</li>\n  <li>Another strategic note</li>\n</ul>\n")}
                    className="inline-flex items-center justify-center rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm border border-gray-150 hover:bg-gray-50 dark:bg-gray-955 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
                  >
                    Bullet List
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      injectHTML(
                        '<img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=60" class="rounded-2xl border border-gray-150 my-4 max-h-48 w-full object-cover shadow-sm" alt="Blog graphic" />\n'
                      )
                    }
                    className="inline-flex items-center justify-center rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm border border-gray-150 hover:bg-gray-50 dark:bg-gray-955 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
                  >
                    Add Image
                  </button>
                  <button
                    type="button"
                    onClick={() => injectHTML("<strong>Bold Text</strong>")}
                    className="inline-flex items-center justify-center rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm border border-gray-150 hover:bg-gray-50 dark:bg-gray-955 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
                  >
                    Bold
                  </button>
                  <button
                    type="button"
                    onClick={() => injectHTML('<a href="#" class="text-brand-500 hover:underline font-semibold">Interactive Link</a>')}
                    className="inline-flex items-center justify-center rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm border border-gray-150 hover:bg-gray-50 dark:bg-gray-955 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
                  >
                    Hyperlink
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      injectHTML(
                        '<pre class="bg-gray-950 text-brand-400 p-4 rounded-xl font-mono text-xs my-4 overflow-x-auto border border-gray-800"><code>const example = () => {\n  console.log("Hello, World!");\n};</code></pre>\n'
                      )
                    }
                    className="inline-flex items-center justify-center rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm border border-gray-150 hover:bg-gray-50 dark:bg-gray-955 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
                  >
                    Code Block
                  </button>
                  <button
                    type="button"
                    onClick={() => injectHTML("<code>inline_code</code>")}
                    className="inline-flex items-center justify-center rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm border border-gray-150 hover:bg-gray-50 dark:bg-gray-955 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
                  >
                    Inline Code
                  </button>
                </div>

                <textarea
                  id="blog-content"
                  ref={(el) => {
                    contentFormRef(el);
                    (textareaRef as any).current = el;
                  }}
                  {...contentRegisterProps}
                  placeholder="✍️ Write or paste HTML article contents here..."
                  rows={10}
                  className={`w-full rounded-b-xl border-b border-x bg-white px-4 py-3.5 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-855 dark:text-gray-300 dark:placeholder-gray-600 dark:focus:border-brand-500 transition-colors font-mono ${errors.content ? "border-error-500 focus:border-error-500" : "border-gray-200"
                    }`}
                />
                {errors.content && (
                  <p className="mt-1.5 text-xs text-error-500 font-semibold">{errors.content.message}</p>
                )}
              </div>

            </div>

            {/* Form Actions */}
            <div className=" flex items-center justify-end gap-3 border-t border-gray-100 pt-5 dark:border-gray-800/60">
              <Link
                to="/blogs"
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-brand-500 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/10 hover:bg-brand-650 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "Saving..." : id ? "Update Blog Post" : "Publish Blog Article"}
              </button>
            </div>

          </div>
        </form>

        {/* Live Preview */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="sticky top-20 rounded-3xl border border-gray-250/60 bg-white p-6 shadow-sm dark:border-gray-800/80 dark:bg-white/[0.02] flex flex-col flex-1 min-h-[500px]">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800/60">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Live Article Preview
                </h3>
                <p className="text-xs text-gray-455 dark:text-gray-400 mt-0.5 font-medium">
                  Dynamic visual layout of your blog post
                </p>
              </div>
              <span className="rounded-full bg-brand-50 border border-brand-100 px-2.5 py-0.5 text-[10px] font-extrabold text-brand-600 uppercase dark:bg-brand-500/10 dark:border-brand-500/20 dark:text-brand-400">
                {categoryValue}
              </span>
            </div>

            {/* Layout Preview */}
            <div className="flex-1 overflow-y-auto no-scrollbar rounded-2xl bg-gray-50/50 p-4 border border-gray-150 dark:bg-white/[0.01] dark:border-gray-800/50">
              {titleValue?.trim() || contentValue?.trim() ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {(coverImageValue?.trim() || defaultCovers[categoryValue]) && (
                    <img
                      src={coverImageValue?.trim() || defaultCovers[categoryValue]}
                      alt="Cover Preview"
                      className="rounded-2xl w-full h-36 object-cover border border-gray-200 dark:border-gray-800 mb-4 shadow-sm"
                    />
                  )}

                  {/* Preview Tags */}
                  {tagsValue.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {tagsValue.map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="rounded-md bg-gray-100 border border-gray-250/70 px-2 py-0.5 text-[9px] font-extrabold text-gray-500 uppercase tracking-wide dark:bg-white/5 dark:border-gray-800 dark:text-gray-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <h1 className="text-lg font-black text-gray-900 dark:text-white leading-snug mb-2">
                    {titleValue || "Untitled Blog Post"}
                  </h1>

                  <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-4 border-b border-gray-200/50 dark:border-gray-800/50 pb-3">
                    <span>By {authorValue || "Admin"}</span>
                    <span>•</span>
                    <span>Today</span>
                  </div>

                  <div
                    dangerouslySetInnerHTML={{ __html: contentValue }}
                    className="faq-rich-render text-sm text-gray-650 dark:text-gray-350 leading-relaxed space-y-2.5
                      [&_h3]:text-sm sm:[&_h3]:text-base [&_h3]:font-black [&_h3]:text-gray-900 [&_h3]:dark:text-white [&_h3]:mt-3.5 [&_h3]:mb-1.5
                      [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3.5 [&_ul]:space-y-1.5
                      [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-3.5 [&_ol]:space-y-1.5
                      [&_li]:font-semibold [&_li]:text-gray-600 [&_li]:dark:text-gray-450
                      [&_img]:rounded-2xl [&_img]:my-4 [&_img]:max-w-full [&_img]:shadow-md [&_img]:border [&_img]:border-gray-150 [&_img]:dark:border-gray-800
                      [&_pre]:bg-gray-950 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-gray-800 [&_pre]:dark:border-gray-800/80
                      [&_code]:font-mono [&_code]:text-xs [&_code]:text-brand-400 [&_code]:dark:text-brand-400 [&_code]:bg-transparent [&_code]:p-0
                      [&_p_code]:bg-gray-100 [&_p_code]:dark:bg-white/5 [&_p_code]:px-1.5 [&_p_code]:py-0.5 [&_p_code]:rounded [&_p_code]:text-brand-600 [&_p_code]:dark:text-brand-400 [&_p_code]:text-xs"
                  />
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center text-gray-400 py-24">
                  <svg className="size-10 text-gray-300 mb-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9" />
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Empty Blog Workspace</span>
                  <span className="text-[11px] text-gray-455 mt-1 max-w-[200px]">
                    Draft your post's content to watch the visual layout render live here.
                  </span>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Success Modal Overlay */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-99 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-gray-200/80 bg-white p-8 shadow-2xl dark:border-gray-800/80 dark:bg-gray-955 text-center transform scale-100 transition-all duration-300 animate-scaleUp">
            {/* Visual Animated Checkmark Circle */}
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 animate-pulse">
              <svg className="size-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">
              Blog Published Successfully!
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-8 max-w-md mx-auto leading-relaxed">
              Your article has been successfully uploaded to the backend server with its metadata, tags, and cover image binary.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 border-t border-gray-100 pt-6 dark:border-gray-800/60">
              <button
                type="button"
                onClick={handleResetForm}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-955 dark:text-gray-300 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <svg className="size-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
                </svg>
                Write Another Article
              </button>
              <Link
                to="/blogs"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-xs font-bold text-white shadow-md shadow-brand-500/10 hover:bg-brand-650 hover:shadow-lg transition-all"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Go to Blog Directory
              </Link>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
