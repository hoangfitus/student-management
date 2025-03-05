// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Student } from "../types.d";

// Define a service using a base URL and expected endpoints
export const studentApi = createApi({
  reducerPath: "studentApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000" }),
  tagTypes: ["Student"],
  endpoints: (builder) => ({
    getStudentsWithFilter: builder.query<
      { students: Student[]; total: number },
      { search: string; faculty: string; page: number; rowsPerPage: number }
    >({
      query: ({ search, faculty, page, rowsPerPage }) => {
        let url = `/student?search=${encodeURIComponent(
          search
        )}&page=${page}&limit=${rowsPerPage}`;
        if (faculty) url += `&faculty=${encodeURIComponent(faculty)}`;
        return url;
      },
      providesTags: ["Student"],
    }),
    addStudent: builder.mutation<Student, Partial<Student>>({
      query: (body) => ({
        url: `student`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      }),
      invalidatesTags: ["Student"],
    }),
    updateStudent: builder.mutation<
      Student,
      Partial<Student> & Pick<Student, "mssv">
    >({
      query: ({ mssv, ...rest }) => ({
        url: `student/${mssv}`,
        method: "PATCH",
        body: rest,
      }),
      invalidatesTags: ["Student"],
    }),
    deleteStudentById: builder.mutation<Student, string>({
      query: (mssv) => ({
        url: `student/${mssv}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Student"],
    }),
    importStudentsFromFile: builder.mutation<
      Student[],
      { type: string; sample: string; file: File }
    >({
      query: ({ type, sample, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: `import?type=${type}&sample=${sample}`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Student"],
    }),
    generateCertificate: builder.query<
      {
        school: {
          name: string;
          address: string;
          phone: string;
          email: string;
        };
        from: string;
        to: string;
      },
      { id: string; reason: string }
    >({
      query: ({ id, reason }) =>
        `export/certificate/${id}?type=pdf&reason=${reason}`,
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetStudentsWithFilterQuery,
  useAddStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentByIdMutation,
  useImportStudentsFromFileMutation,
  useLazyGenerateCertificateQuery,
} = studentApi;
