import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const uploadApi = createApi({
  reducerPath: "uploadApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000" }),
  endpoints: (builder) => ({
    upload: builder.mutation<{ url: string }, FormData>({
      query: (formData) => ({
        url: "upload",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const { useUploadMutation } = uploadApi;
