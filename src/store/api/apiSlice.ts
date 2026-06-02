import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { prepareApiHeaders } from "./apiHeaders";

// Get base URL from environment variables, fallback to default if not defined
const baseUrl = import.meta.env.VITE_API_URL;

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { endpoint }) => {
      return prepareApiHeaders(headers, endpoint);
    },
  }),
  tagTypes: ["User", "Blogs", "CaseStudies", "Faqs"],
  endpoints: (builder) => ({
    // Admin login API endpoint
    login: builder.mutation({
      query: (credentials) => ({
        url: "/api/admin/login.php",
        method: "POST",
        body: credentials,
      }),
    }),
    // Resend OTP API endpoint
    resendOtp: builder.mutation({
      query: (data) => ({
        url: "/api/admin/resend-otp.php",
        method: "POST",
        body: data,
      }),
    }),
    // Verify OTP API endpoint
    verifyOtp: builder.mutation({
      query: (data) => ({
        url: "/api/admin/verify-otp.php",
        method: "POST",
        body: data,
      }),
    }),
    // Forgot Password API endpoint
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: "/api/admin/forgot-password.php",
        method: "POST",
        body: data,
      }),
    }),
    // Reset Password API endpoint
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/api/admin/reset-password.php",
        method: "POST",
        body: data,
      }),
    }),
    // Logout API endpoint
    logoutApi: builder.mutation({
      query: () => ({
        url: "/api/admin/logout.php",
        method: "POST",
      }),
    }),
    // Add Blog API endpoint
    addBlog: builder.mutation({
      query: (data) => ({
        url: "/api/blogs/create.php",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Blogs"],
    }),
    // Update Blog API endpoint
    updateBlog: builder.mutation({
      query: (data) => ({
        url: "/api/blogs/update.php",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Blogs"],
    }),
    // Fetch Blogs List API endpoint
    getBlogs: builder.query({
      query: (params?: { page?: number; limit?: number; category?: string }) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.page !== undefined) queryParams.append("page", String(params.page));
          if (params.limit !== undefined) queryParams.append("limit", String(params.limit));
          if (params.category && params.category !== "All") {
            queryParams.append("category", params.category);
          }
        }
        const queryString = queryParams.toString();
        return {
          url: `/api/blogs/list.php${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["Blogs"],
    }),
    // Delete Blog API endpoint
    deleteBlog: builder.mutation({
      query: (blogId) => ({
        url: `/api/blogs/delete.php?id=${blogId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Blogs"],
    }),
    // Add Case Study API endpoint (real network upload payload)
    addCaseStudy: builder.mutation({
      query: (formData) => ({
        url: "/api/case-studies/create.php",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["CaseStudies"],
    }),
    // Update Case Study API endpoint (real network upload payload)
    updateCaseStudy: builder.mutation({
      query: (formData) => ({
        url: "/api/case-studies/update.php",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["CaseStudies"],
    }),
    // Delete Case Study API endpoint
    deleteCaseStudy: builder.mutation({
      query: (caseId) => ({
        url: `/api/case-studies/delete.php?id=${caseId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CaseStudies"],
    }),
    // Get Case Studies list API query with filters
    getCaseStudies: builder.query({
      query: (params?: { page?: number; limit?: number; category?: string; year?: string; client?: string }) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.page !== undefined) queryParams.append("page", String(params.page));
          if (params.limit !== undefined) queryParams.append("limit", String(params.limit));
          if (params.category && params.category !== "All") {
            queryParams.append("category", params.category);
          }
          if (params.year !== undefined && params.year.trim() !== "") {
            queryParams.append("year", params.year);
          }
          if (params.client !== undefined && params.client.trim() !== "") {
            queryParams.append("client", params.client);
          }
        }
        const queryString = queryParams.toString();
        return {
          url: `/api/case-studies/list.php${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["CaseStudies"],
    }),
    // Add FAQ API endpoint
    addFaq: builder.mutation({
      query: (faqData) => ({
        url: "/api/faqs/create.php",
        method: "POST",
        body: faqData,
      }),
      invalidatesTags: ["Faqs"],
    }),
    // Update FAQ API endpoint
    updateFaq: builder.mutation({
      query: (faqData) => ({
        url: "/api/faqs/update.php",
        method: "POST",
        body: faqData,
      }),
      invalidatesTags: ["Faqs"],
    }),
    // Delete FAQ API endpoint
    deleteFaq: builder.mutation({
      query: (faqId) => ({
        url: `/api/faqs/delete.php?id=${faqId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Faqs"],
    }),
    // Get FAQs list API query with optional filters and pagination
    getFaqs: builder.query({
      query: (params?: { page?: string; pageNumber?: number; limit?: number }) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.page && params.page !== "All") {
            queryParams.append("page", params.page);
          }
          if (params.pageNumber !== undefined) {
            queryParams.append("pageNumber", String(params.pageNumber));
          }
          if (params.limit !== undefined) {
            queryParams.append("limit", String(params.limit));
          }
        }
        const queryString = queryParams.toString();
        return {
          url: `/api/faqs/list.php${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["Faqs"],
    }),
  }),
});

export const {
  useLoginMutation,
  useResendOtpMutation,
  useVerifyOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutApiMutation,
  useAddBlogMutation,
  useUpdateBlogMutation,
  useGetBlogsQuery,
  useDeleteBlogMutation,
  useAddCaseStudyMutation,
  useUpdateCaseStudyMutation,
  useDeleteCaseStudyMutation,
  useGetCaseStudiesQuery,
  useAddFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
  useGetFaqsQuery,
} = apiSlice;


