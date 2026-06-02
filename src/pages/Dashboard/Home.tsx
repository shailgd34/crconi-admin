import PageMeta from "../../components/common/PageMeta";
import { Link } from "react-router";


export default function Home() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const recentLeads = [
    {
      id: 1,
      name: "John Doe",
      initials: "JD",
      gradient: "from-blue-500 to-indigo-600",
      email: "john@example.com",
      subject: "Inquiry about SEO & Marketing",
      date: "Today, 12:40 PM",
      status: "Pending Inquiry",
      statusColor: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200/40",
    },
    {
      id: 2,
      name: "Sarah Connor",
      initials: "SC",
      gradient: "from-purple-500 to-pink-600",
      email: "s.connor@cyberdyne.com",
      subject: "Custom Web Application Proposal",
      date: "Yesterday, 3:15 PM",
      status: "Replied",
      statusColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200/40",
    },
    {
      id: 3,
      name: "Bruce Wayne",
      initials: "BW",
      gradient: "from-slate-700 to-slate-900",
      email: "bruce@waynecorp.com",
      subject: "Dashboard Integration Request",
      date: "May 26, 2026",
      status: "Pending Inquiry",
      statusColor: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200/40",
    },
    {
      id: 4,
      name: "Clark Kent",
      initials: "CK",
      gradient: "from-red-500 to-blue-600",
      email: "clark@dailyplanet.com",
      subject: "Media Assets Update Question",
      date: "May 25, 2026",
      status: "Replied",
      statusColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200/40",
    },
  ];

  // Website CMS management dashboard configuration

  return (
    <>
      <PageMeta
        title="Website Management Dashboard | Croconi Digital Admin"
        description="Premium, bespoke content and analytics manager for Croconi Digital."
      />

      {/* Modern Radial-Gradient Glass Welcome Banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-brand-500/10 bg-gradient-to-br from-slate-900 via-brand-950 to-indigo-950 p-6 md:p-8 text-white shadow-xl shadow-brand-500/5">
        <div className="absolute -right-16 -top-16 size-64 rounded-full bg-brand-500/15 blur-[64px]" />
        <div className="absolute -left-20 -bottom-20 size-80 rounded-full bg-indigo-500/10 blur-[80px]" />
        
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/20 px-3.5 py-1 text-xs font-semibold tracking-wider text-brand-300 uppercase border border-brand-500/30 mb-3 animate-pulse">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              System Live & Healthy
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-brand-100">
              Control Center
            </h1>
            <p className="mt-2 text-sm text-gray-350 max-w-xl font-medium">
              Manage your brand’s articles, user case studies, live submissions, and check real-time website Core Web Vitals performance.
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="inline-flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-4.5 py-3 text-sm font-semibold text-white shadow-lg">
              <svg className="size-5 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {currentDate}
            </div>
          </div>
        </div>
      </div>

      {/* Glowing Premium Stat Cards */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Blogs & Articles */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand-500/5 hover:border-brand-500/20 dark:border-gray-800/80 dark:bg-white/[0.02]">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Articles & Press</span>
              <h3 className="mt-2 text-3xl font-black text-gray-900 dark:text-white">24</h3>
            </div>
            <div className="rounded-2xl bg-brand-50 p-3 text-brand-500 transition-colors duration-300 group-hover:bg-brand-500 group-hover:text-white dark:bg-brand-500/10 dark:text-brand-400">
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs text-gray-450 dark:text-gray-400">
              <span className="font-semibold">Goal Progress</span>
              <span className="font-extrabold">80% reached</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
              <div className="h-full w-[80%] rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500" />
            </div>
          </div>
        </div>

        {/* Case Studies */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-500/20 dark:border-gray-800/80 dark:bg-white/[0.02]">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Case Studies</span>
              <h3 className="mt-2 text-3xl font-black text-gray-900 dark:text-white">12</h3>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-500 transition-colors duration-300 group-hover:bg-emerald-500 group-hover:text-white dark:bg-emerald-500/10 dark:text-emerald-400">
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs text-gray-450 dark:text-gray-400">
              <span className="font-semibold">Client Portfolios</span>
              <span className="font-extrabold">60% target</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
              <div className="h-full w-[60%] rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500" />
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-purple-500/5 hover:border-purple-500/20 dark:border-gray-800/80 dark:bg-white/[0.02]">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">FAQ Categories</span>
              <h3 className="mt-2 text-3xl font-black text-gray-900 dark:text-white">36</h3>
            </div>
            <div className="rounded-2xl bg-purple-50 p-3 text-purple-500 transition-colors duration-300 group-hover:bg-purple-500 group-hover:text-white dark:bg-purple-500/10 dark:text-purple-400">
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs text-gray-450 dark:text-gray-400">
              <span className="font-semibold">User Rating</span>
              <span className="font-extrabold">95% score</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
              <div className="h-full w-[95%] rounded-full bg-gradient-to-r from-purple-400 to-purple-650 transition-all duration-500" />
            </div>
          </div>
        </div>

        {/* Lead Inquiries */}
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-amber-500/5 hover:border-amber-500/20 dark:border-gray-800/80 dark:bg-white/[0.02]">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Form Submissions</span>
              <h3 className="mt-2 text-3xl font-black text-gray-900 dark:text-white">8</h3>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-500 transition-colors duration-300 group-hover:bg-amber-500 group-hover:text-white dark:bg-amber-500/10 dark:text-amber-400">
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-gray-450 dark:text-gray-400">Unread Queries</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-extrabold text-rose-600 dark:bg-rose-500/10 dark:text-rose-450 animate-pulse border border-rose-100/50">
              Action Required
            </span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Premium Leads Table */}
        <div className="col-span-12 xl:col-span-8 rounded-3xl border border-gray-250/60 bg-white p-6 shadow-sm dark:border-gray-800/80 dark:bg-white/[0.02]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Recent Contact Submissions
              </h3>
              <p className="text-xs text-gray-450 dark:text-gray-400 mt-0.5 font-medium">
                Customer leads generated from the main website portal
              </p>
            </div>
            <Link
              to="/messages"
              className="text-xs font-extrabold text-brand-500 hover:text-brand-650 dark:text-brand-400 hover:underline transition-colors"
            >
              View All Submissions
            </Link>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs font-medium">
              <thead>
                <tr className="border-b border-gray-150/70 pb-3 text-gray-400 dark:border-gray-800">
                  <th className="pb-3 font-bold uppercase tracking-wider">User Profile</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Inquiry Subject</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Date Submitted</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Action State</th>
                  <th className="pb-3 text-right font-bold uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${lead.gradient} text-[10px] font-black text-white shadow-md`}>
                          {lead.initials}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">{lead.name}</div>
                          <div className="text-[10px] text-gray-450 dark:text-gray-500">{lead.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 max-w-[180px] truncate font-medium text-gray-800 dark:text-gray-200">
                      {lead.subject}
                    </td>
                    <td className="py-4 text-gray-450 dark:text-gray-400">{lead.date}</td>
                    <td className="py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide uppercase ${lead.statusColor}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <Link
                        to="/messages"
                        className="inline-flex items-center justify-center rounded-xl bg-gray-50 border border-gray-150 px-3.5 py-2 text-xs font-bold text-gray-700 shadow-sm transition hover:bg-brand-500 hover:text-white hover:border-brand-500 dark:bg-white/5 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-brand-500 dark:hover:text-white dark:hover:border-brand-500"
                      >
                        Reply
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Operations panel */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          
          <div className="rounded-3xl border border-gray-250/60 bg-white p-6 shadow-sm dark:border-gray-800/80 dark:bg-white/[0.02]">
            <h3 className="mb-4 text-base font-bold text-gray-900 dark:text-white">
              Quick Administrative Actions
            </h3>
            <div className="flex flex-col gap-3">
              <Link
                to="/blogs"
                className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-xs font-bold text-white transition hover:bg-brand-650 shadow-md shadow-brand-500/10 hover:shadow-lg hover:shadow-brand-500/15"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
                </svg>
                Write New Blog Post
              </Link>
              <Link
                to="/case-studies"
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-xs font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Publish Case Study
              </Link>
              <Link
                to="/faqs"
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-xs font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Add New FAQ
              </Link>
            </div>
          </div>

          {/* System resource monitor */}
          <div className="rounded-3xl border border-gray-250/60 bg-white p-6 shadow-sm dark:border-gray-800/80 dark:bg-white/[0.02]">
            <h3 className="mb-4 text-base font-bold text-gray-900 dark:text-white">
              System Health Monitor
            </h3>
            <div className="space-y-4">
              <div>
                <div className="mb-1.5 flex justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <span>Server Database Storage</span>
                  <span>14.5 GB / 100 GB</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                  <div className="h-full w-[14.5%] rounded-full bg-gradient-to-r from-brand-400 to-brand-600"></div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs font-medium dark:border-gray-800/60">
                <span className="text-gray-400">Platform Environment</span>
                <span className="font-bold text-gray-900 dark:text-white uppercase tracking-wider">Production</span>
              </div>
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-gray-400">Server Uptime</span>
                <span className="font-bold text-gray-900 dark:text-white">99.98% (42 Days)</span>
              </div>
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-gray-400">CMS Version</span>
                <span className="font-bold text-gray-900 dark:text-white">v3.5.0-Enterprise</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}
