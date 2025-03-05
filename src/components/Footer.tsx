import React from "react";
import { Typography, Box } from "@mui/material";
import { useVersionInfo } from "@app/hooks";

export const Footer: React.FC = () => {
  const versionInfo = useVersionInfo();

  return (
    <Box mt={4} mb={2} sx={{ textAlign: "center" }}>
      {versionInfo ? (
        <Typography variant="caption" color="textSecondary">
          Version: {versionInfo.version} | Build Date:{" "}
          {new Date(versionInfo.buildDate).toLocaleString("vi-VN")}
        </Typography>
      ) : (
        <Typography variant="caption" color="textSecondary">
          Loading version info...
        </Typography>
      )}
    </Box>
  );
};
