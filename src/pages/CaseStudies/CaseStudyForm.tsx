import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import PageMeta from "../../components/common/PageMeta";
import { useAddCaseStudyMutation, useUpdateCaseStudyMutation, useGetCaseStudiesQuery } from "../../store/api/apiSlice";
import { toast } from "react-hot-toast";

interface CaseStudyItem {
  id: string;
  title: string;
  category: string;
  client: string;
  year: string;
  coverImage: string;
  content: string;
  dateCreated: string;
}

interface CaseStudyInputs {
  title: string;
  category: string;
  client: string;
  year: string;
  coverImage: string;
  content: string;
}

export default function CaseStudyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { data: apiCases = [] } = useGetCaseStudiesQuery(undefined);
  const [addCaseStudy, { isLoading: isAdding }] = useAddCaseStudyMutation();
  const [updateCaseStudy, { isLoading: isUpdating }] = useUpdateCaseStudyMutation();
  const isPending = isAdding || isUpdating;

  const casesList: any[] = Array.isArray(apiCases)
    ? apiCases
    : (apiCases && typeof apiCases === "object" && Array.isArray((apiCases as any).data)
      ? (apiCases as any).data
      : (apiCases && typeof apiCases === "object" && Array.isArray((apiCases as any).casestudies)
        ? (apiCases as any).casestudies
        : []));

  const handleResetForm = () => {
    reset({
      title: "",
      category: "Web Development",
      client: "",
      year: new Date().getFullYear().toString(),
      coverImage: "",
      content: "",
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

  const defaultCovers: Record<string, string> = {
    "Web Development": "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=60",
    "SEO Optimization": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60",
    "SaaS Platform": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60",
    "Mobile App Development": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=60",
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CaseStudyInputs>({
    defaultValues: {
      title: "",
      category: "Web Development",
      client: "",
      year: new Date().getFullYear().toString(),
      coverImage: "",
      content: "",
    },
  });

  const titleValue = watch("title");
  const categoryValue = watch("category");
  const clientValue = watch("client");
  const yearValue = watch("year");
  const coverImageValue = watch("coverImage");
  const contentValue = watch("content");

  // Load existing case study if in edit mode
  useEffect(() => {
    if (id) {
      // 1. Try finding in API query results first
      let caseToEdit = casesList.find((c: any) => String(c.id) === String(id));

      // 2. Fall back to local storage if not found
      if (!caseToEdit) {
        const savedCases = localStorage.getItem("croconi_casestudies");
        if (savedCases) {
          const cases: CaseStudyItem[] = JSON.parse(savedCases);
          caseToEdit = cases.find((c) => String(c.id) === String(id));
        }
      }

      if (caseToEdit) {
        reset({
          title: caseToEdit.title,
          category: caseToEdit.category,
          client: caseToEdit.client,
          year: caseToEdit.year,
          coverImage: caseToEdit.coverImage || caseToEdit.cover_image || "",
          content: caseToEdit.content,
        });
      } else {
        setNotification({ type: "error", message: "Case study not found." });
      }
    }
  }, [id, casesList, reset]);

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

  const onSubmit = async (data: CaseStudyInputs) => {
    setNotification(null);
    try {
      const finalCover = data.coverImage.trim() || defaultCovers[data.category] || defaultCovers["Web Development"];

      const payload = {
        title: data.title,
        category: data.category,
        client: data.client,
        year: data.year.trim() || new Date().getFullYear().toString(),
        coverImage: finalCover,
        content: data.content,
      };

      // 1. Dispatch FormData payload to real API depending on edit mode
      if (id) {
        const formData = new FormData();
        formData.append("id", id);
        formData.append("title", data.title);
        formData.append("category", data.category);
        formData.append("client", data.client);
        formData.append("year", data.year.trim() || new Date().getFullYear().toString());
        formData.append("content", data.content);
        if (selectedFile) {
          formData.append("cover_image", selectedFile);
        }
        await updateCaseStudy(formData).unwrap();
      } else {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("category", data.category);
        formData.append("client", data.client);
        formData.append("year", data.year.trim() || new Date().getFullYear().toString());
        formData.append("content", data.content);
        if (selectedFile) {
          formData.append("cover_image", selectedFile);
        }
        await addCaseStudy(formData).unwrap();
      }

      // 2. Synchronize with localStorage for list preview showroom consistency
      const savedCases = localStorage.getItem("croconi_casestudies");
      let casesListLocal: CaseStudyItem[] = savedCases ? JSON.parse(savedCases) : [];

      if (id) {
        casesListLocal = casesListLocal.map((c) =>
          c.id === id
            ? {
                ...c,
                ...payload,
              }
            : c
        );
      } else {
        const newCase: CaseStudyItem = {
          id: Date.now().toString(),
          ...payload,
          dateCreated: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
        };
        casesListLocal.unshift(newCase);
      }

      localStorage.setItem("croconi_casestudies", JSON.stringify(casesListLocal));
      queryClient.invalidateQueries({ queryKey: ["casestudies"] });

      toast.success(id ? "Case study updated successfully!" : "Case study published successfully!");
      setNotification({
        type: "success",
        message: id ? "Case study updated successfully!" : "Case study published successfully!",
      });

      if (id) {
        setTimeout(() => navigate("/case-studies"), 1200);
      } else {
        setShowSuccessModal(true);
      }
    } catch (err: any) {
      console.error("Save case study failed:", err);
      const errMsg = err.data?.message || err.message || "Failed to publish case study.";
      setNotification({ type: "error", message: errMsg });
      toast.error(errMsg);
    }
  };

  const { ref: contentFormRef, ...contentRegisterProps } = register("content", {
    required: "Case study milestones are required",
  });

  return (
    <>
      <PageMeta
        title={`${id ? "Edit" : "Create"} Case Study | Croconi Digital Admin`}
        description="Publish beautifully formatted HTML case studies showing real client success metrics."
      />

      {/* Header Section */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white sm:text-3xl">
            {id ? "Edit Case Study" : "Publish Case Study"}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {id
              ? "Modify project parameters, client milestones, cover images, and HTML text components."
              : "Draft a new project showcase describing your client's digital acceleration."}
          </p>
        </div>
        <div>
          <Link
            to="/case-studies"
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
            : "border-rose-250 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-955/20 dark:text-rose-455"
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
              Case Study Information
            </h3>

            <div className="space-y-5">
              {/* Project Title */}
              <div>
                <label htmlFor="case-title" className="block text-xs font-bold text-gray-450 uppercase tracking-wider mb-2">
                  Project Title
                </label>
                <input
                  id="case-title"
                  type="text"
                  placeholder="e.g. Next-Gen Enterprise eCommerce Replatform"
                  {...register("title", { required: "Project title is required" })}
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-955 dark:text-gray-300 dark:placeholder-gray-600 dark:focus:border-brand-500 transition-colors ${errors.title ? "border-error-500 focus:border-error-500" : "border-gray-200"
                    }`}
                />
                {errors.title && (
                  <p className="mt-1.5 text-xs text-error-500 font-semibold">{errors.title.message}</p>
                )}
              </div>

              {/* Category selector */}
              <div>
                <label htmlFor="case-category" className="block text-xs font-bold text-gray-450 uppercase tracking-wider mb-2">
                  Case Category
                </label>
                <select
                  id="case-category"
                  {...register("category")}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-955 dark:text-gray-300 dark:focus:border-brand-500 transition-colors"
                >
                  <option value="Web Development">Web Development</option>
                  <option value="SEO Optimization">SEO Optimization</option>
                  <option value="SaaS Platform">SaaS Platform</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                </select>
              </div>

              {/* Client & Launch Year */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="case-client" className="block text-xs font-bold text-gray-450 uppercase tracking-wider mb-2">
                    Client Name
                  </label>
                  <input
                    id="case-client"
                    type="text"
                    placeholder="e.g. Wayne Enterprises"
                    {...register("client", { required: "Client name is required" })}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-955 dark:text-gray-300 dark:placeholder-gray-600 dark:focus:border-brand-500 transition-colors ${errors.client ? "border-error-500 focus:border-error-500" : "border-gray-200"
                      }`}
                  />
                  {errors.client && (
                    <p className="mt-1.5 text-xs text-error-500 font-semibold">{errors.client.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="case-year" className="block text-xs font-bold text-gray-450 uppercase tracking-wider mb-2">
                    Project Launch Year
                  </label>
                  <input
                    id="case-year"
                    type="text"
                    placeholder="2026"
                    {...register("year", { required: "Launch year is required" })}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-955 dark:text-gray-300 dark:placeholder-gray-600 dark:focus:border-brand-500 transition-colors ${errors.year ? "border-error-500 focus:border-error-500" : "border-gray-200"
                      }`}
                  />
                  {errors.year && (
                    <p className="mt-1.5 text-xs text-error-500 font-semibold">{errors.year.message}</p>
                  )}
                </div>
              </div>

              {/* Cover Image Upload Container */}
              <div>
                <label className="block text-xs font-bold text-gray-450 uppercase tracking-wider mb-2">
                  Project Cover Image
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
                    Leave blank to apply a high-quality stock cover matching the selected category.
                  </span>
                </div>
              </div>

              {/* Content Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="case-content" className="block text-xs font-bold text-gray-450 uppercase tracking-wider">
                    HTML Case Details Layout
                  </label>
                  <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wide">
                    HTML Enabled
                  </span>
                </div>

                {/* HTML Helper Toolbar */}
                <div className="flex flex-wrap gap-1.5 rounded-t-xl border-t border-x border-gray-200 bg-gray-50/70 p-2 dark:border-gray-800 dark:bg-gray-900/60">
                  <button
                    type="button"
                    onClick={() => injectHTML("<h3>Project Challenges & Solutions</h3>\n")}
                    className="inline-flex items-center justify-center rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm border border-gray-150 hover:bg-gray-50 dark:bg-gray-955 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
                  >
                    H3 Heading
                  </button>
                  <button
                    type="button"
                    onClick={() => injectHTML("<ul>\n  <li><strong>Milestone:</strong> 45% load speed boost</li>\n  <li><strong>Revenue impact:</strong> +28% conversions</li>\n</ul>\n")}
                    className="inline-flex items-center justify-center rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm border border-gray-150 hover:bg-gray-50 dark:bg-gray-955 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
                  >
                    Bullet List
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      injectHTML(
                        '<img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=60" class="rounded-2xl border border-gray-150 my-4 max-h-48 w-full object-cover shadow-sm" alt="Case analytics graphic" />\n'
                      )
                    }
                    className="inline-flex items-center justify-center rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm border border-gray-155 hover:bg-gray-50 dark:bg-gray-955 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
                  >
                    Add Image
                  </button>
                  <button
                    type="button"
                    onClick={() => injectHTML("<strong>Significant Milestone</strong>")}
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
                </div>

                <textarea
                  id="case-content"
                  ref={(el) => {
                    contentFormRef(el);
                    (textareaRef as any).current = el;
                  }}
                  {...contentRegisterProps}
                  placeholder="✍️ Write or paste HTML case study details here..."
                  rows={10}
                  className={`w-full rounded-b-xl border-b border-x bg-white px-4 py-3.5 text-sm font-semibold text-gray-700 placeholder-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-955 dark:text-gray-300 dark:placeholder-gray-600 dark:focus:border-brand-500 transition-colors font-mono ${errors.content ? "border-error-500 focus:border-error-500" : "border-gray-200"
                    }`}
                />
                {errors.content && (
                  <p className="mt-1.5 text-xs text-error-500 font-semibold">{errors.content.message}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5 dark:border-gray-800/60">
              <Link
                to="/case-studies"
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-850 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-brand-500 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/10 hover:bg-brand-650 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isPending ? "Saving..." : id ? "Update Case Study" : "Publish Case Study"}
              </button>
            </div>

          </div>
        </form>

        {/* Live Preview Panel */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="sticky top-20 rounded-3xl border border-gray-250/60 bg-white p-6 shadow-sm dark:border-gray-800/80 dark:bg-white/[0.02] flex flex-col flex-1 min-h-[500px]">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800/60">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Live Case Study Preview
                </h3>
                <p className="text-xs text-gray-455 dark:text-gray-400 mt-0.5 font-medium">
                  Dynamic visual layout of your client portfolio
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

                  <h1 className="text-lg font-black text-gray-900 dark:text-white leading-snug mb-2">
                    {titleValue || "Untitled Portfolio Project"}
                  </h1>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-4 border-y border-gray-200/50 dark:border-gray-800/50 py-3">
                    <div>Client: <span className="text-gray-800 dark:text-white">{clientValue || "TBD"}</span></div>
                    <div>Year Released: <span className="text-gray-800 dark:text-white">{yearValue || "TBD"}</span></div>
                  </div>

                  <div
                    dangerouslySetInnerHTML={{ __html: contentValue }}
                    className="faq-rich-render text-sm text-gray-650 dark:text-gray-350 leading-relaxed space-y-2.5
                      [&_h3]:text-sm sm:[&_h3]:text-base [&_h3]:font-black [&_h3]:text-gray-900 [&_h3]:dark:text-white [&_h3]:mt-3.5 [&_h3]:mb-1.5
                      [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3.5 [&_ul]:space-y-1.5
                      [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-3.5 [&_ol]:space-y-1.5
                      [&_li]:font-semibold [&_li]:text-gray-600 [&_li]:dark:text-gray-450
                      [&_img]:rounded-2xl [&_img]:my-4 [&_img]:max-w-full [&_img]:shadow-md [&_img]:border [&_img]:border-gray-150 [&_img]:dark:border-gray-800"
                  />
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center text-gray-400 py-24">
                  <svg className="size-10 text-gray-300 mb-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4" />
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Empty Portfolio Workspace</span>
                  <span className="text-[11px] text-gray-455 mt-1 max-w-[200px]">
                    Draft your case study milestones to watch the visual layout render live here.
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
              Case Study Published Successfully!
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-8 max-w-md mx-auto leading-relaxed">
              Your client project case study has been successfully uploaded to the backend server with its metadata, category tags, and cover graphic binary.
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
                Publish Another Project
              </button>
              <Link
                to="/case-studies"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-xs font-bold text-white shadow-md shadow-brand-500/10 hover:bg-brand-650 hover:shadow-lg transition-all"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Go to Case Studies
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
