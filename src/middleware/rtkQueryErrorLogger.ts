import { isRejectedWithValue, Middleware } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

export const rtkQueryErrorLogger: Middleware = () => (next) => (action) => {
  // Check if the action is a rejected RTK Query action
  if (isRejectedWithValue(action)) {
    if (
      action.payload &&
      typeof action.payload === "object" &&
      "data" in action.payload
    ) {
      toast.error((action.payload.data as { message: string }).message);
    }
  }
  return next(action);
};
