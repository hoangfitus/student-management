import { useRef } from "react";
import { useImportStudentsFromFileMutation } from "@app/services/student";
import { toast } from "react-toastify";

const API_BASE = "http://localhost:3000";

export const useImportExport = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStudentsFromFile] = useImportStudentsFromFileMutation();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const allowedExtensions = [".xlsx", ".xls", ".csv"];
      const fileExtension = file.name
        .slice(file.name.lastIndexOf("."))
        .toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        alert("Please select an Excel (.xlsx, .xls) or CSV (.csv) file.");
        return;
      }

      importStudentsFromFile({
        type: fileExtension === ".csv" ? "csv" : "excel",
        sample: "",
        file,
      });
    }
  };

  const importSampleData = async () => {
    await importStudentsFromFile({
      type: "excel",
      sample: "true",
      file: null as unknown as File,
    });
    toast.success("Imported sample data successfully");
  };

  const exportStudents = (type: string) => {
    window.open(`${API_BASE}/export?type=${type}`, "_blank");
  };

  const exportCertificate = (id: string, reason: string) => {
    window.open(
      `${API_BASE}/export/certificate/${id}?type=md&reason=${reason}`,
      "_blank"
    );
  };

  return {
    fileInputRef,
    handleFileChange,
    importSampleData,
    exportStudents,
    exportCertificate,
  };
};
