import { Box, Button } from "@mui/material";

interface StudentToolbarProps {
  onImportClick: () => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
  onAddStudent: () => void;
  onImportSample: () => void;
}

export const StudentToolbar: React.FC<StudentToolbarProps> = ({
  onImportClick,
  onExportExcel,
  onExportCSV,
  onAddStudent,
  onImportSample,
}) => {
  return (
    <Box
      mb={2}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="outlined" color="info" onClick={onImportClick}>
          Import Data
        </Button>
        <Button variant="outlined" color="secondary" onClick={onExportExcel}>
          Export Excel
        </Button>
        <Button variant="outlined" color="secondary" onClick={onExportCSV}>
          Export CSV
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="contained" color="primary" onClick={onAddStudent}>
          Thêm sinh viên
        </Button>
        <Button variant="contained" color="secondary" onClick={onImportSample}>
          Thêm dữ liệu mẫu
        </Button>
      </Box>
    </Box>
  );
};
