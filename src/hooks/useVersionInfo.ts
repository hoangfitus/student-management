import { useState, useEffect } from "react";

export interface VersionInfo {
  version: string;
  buildDate: string;
}

const API_BASE = "http://localhost:3000";

export function useVersionInfo() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);

  useEffect(() => {
    async function fetchVersion() {
      const url = `${API_BASE}/build`;
      try {
        const res = await fetch(url);
        const data: VersionInfo = await res.json();
        setVersionInfo(data);
      } catch (error) {
        console.error("Error fetching version info:", error);
      }
    }
    fetchVersion();
  }, []);

  return versionInfo;
}
