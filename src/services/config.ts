// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ConfigItem } from "@app/types";

// Define a service using a base URL and expected endpoints
export const configApi = createApi({
  reducerPath: "configApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000" }),
  tagTypes: ["Config"],
  endpoints: (builder) => ({
    getConfig: builder.query<ConfigItem[], void>({
      query: () => "config",
      providesTags: ["Config"],
    }),
    updateConfig: builder.mutation<
      ConfigItem,
      Partial<ConfigItem> & Pick<ConfigItem, "id">
    >({
      query: ({ id, ...rest }) => ({
        url: `config/${id}`,
        method: "PATCH",
        body: rest,
      }),
      invalidatesTags: ["Config"],
    }),
    createConfig: builder.mutation<ConfigItem, Partial<ConfigItem>>({
      query: (config) => ({
        url: "config",
        method: "POST",
        body: config,
      }),
      invalidatesTags: ["Config"],
    }),
    getConfigByName: builder.query<ConfigItem, string>({
      query: (name) => `config/${name}`,
      providesTags: ["Config"],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetConfigQuery,
  useUpdateConfigMutation,
  useCreateConfigMutation,
  useGetConfigByNameQuery,
} = configApi;
