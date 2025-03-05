import { configureStore } from "@reduxjs/toolkit";
import { studentApi } from "../services/student";
import { categoryApi } from "@app/services/category";
import { rtkQueryErrorLogger } from "@app/middleware/rtkQueryErrorLogger";
import { configApi } from "@app/services/config";
import { uploadApi } from "@app/services/upload";

export const store = configureStore({
  reducer: {
    [studentApi.reducerPath]: studentApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [configApi.reducerPath]: configApi.reducer,
    [uploadApi.reducerPath]: uploadApi.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(
      studentApi.middleware,
      categoryApi.middleware,
      configApi.middleware,
      uploadApi.middleware,
      rtkQueryErrorLogger
    );
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
