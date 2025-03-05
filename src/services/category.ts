// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Category } from "@app/types.d";
// Define a service using a base URL and expected endpoints
export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000" }),
  tagTypes: ["Faculty", "Program", "Status"],
  endpoints: (builder) => ({
    getFaculties: builder.query<Category[], void>({
      query: () => "faculty",
      providesTags: ["Faculty"],
    }),
    getPrograms: builder.query<Category[], void>({
      query: () => "program",
      providesTags: ["Program"],
    }),
    getStatuses: builder.query<Category[], void>({
      query: () => "status",
      providesTags: ["Status"],
    }),
    addFaculty: builder.mutation<
      { message: string; faculty: Category },
      Partial<Category>
    >({
      query: (body) => ({
        url: `faculty`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      }),
      invalidatesTags: ["Faculty"],
    }),
    addProgram: builder.mutation<
      { message: string; program: Category },
      Partial<Category>
    >({
      query: (body) => ({
        url: `program`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      }),
      invalidatesTags: ["Program"],
    }),
    addStatus: builder.mutation<
      { message: string; status: Category },
      Partial<Category>
    >({
      query: (body) => ({
        url: `status`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      }),
      invalidatesTags: ["Status"],
    }),
    updateFaculty: builder.mutation<
      { message: string; faculty: Category },
      Partial<Category> & Pick<Category, "id">
    >({
      query: ({ id, ...rest }) => ({
        url: `faculty/${id}`,
        method: "PATCH",
        body: rest,
      }),
      invalidatesTags: ["Faculty"],
    }),
    updateProgram: builder.mutation<
      { message: string; program: Category },
      Partial<Category> & Pick<Category, "id">
    >({
      query: ({ id, ...rest }) => ({
        url: `program/${id}`,
        method: "PATCH",
        body: rest,
      }),
      invalidatesTags: ["Program"],
    }),
    updateStatus: builder.mutation<
      { message: string; status: Category },
      Partial<Category> & Pick<Category, "id">
    >({
      query: ({ id, ...rest }) => ({
        url: `status/${id}`,
        method: "PATCH",
        body: rest,
      }),
      invalidatesTags: ["Status"],
    }),
    removeFaculty: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `faculty/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Faculty"],
    }),
    removeProgram: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `program/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Program"],
    }),
    removeStatus: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `status/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Status"],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetFacultiesQuery,
  useGetProgramsQuery,
  useGetStatusesQuery,
  useAddFacultyMutation,
  useAddProgramMutation,
  useAddStatusMutation,
  useUpdateFacultyMutation,
  useUpdateProgramMutation,
  useUpdateStatusMutation,
} = categoryApi;
