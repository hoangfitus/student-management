import React, { useState } from "react";
import type { Student } from "@app/types";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  TablePagination,
  TableContainer,
  Paper,
  Box,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import { ExportCertificateModal } from "@app/components/ExportCertificateModal";

interface StudentsTableProps {
  students: Student[];
  total: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => void;
  onRowsPerPageChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onEdit: (student: Student) => void;
  onDelete: (mssv: string) => void;
  onExportCertificate: (mssv: string, reason: string) => void;
}

export const StudentsTable: React.FC<StudentsTableProps> = ({
  students,
  total,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onExportCertificate,
}) => {
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedMssv, setSelectedMssv] = useState<string>("");

  const handleExportClick = (mssv: string) => {
    setSelectedMssv(mssv);
    setExportModalOpen(true);
  };

  const handleExportClose = () => {
    setExportModalOpen(false);
    setSelectedMssv("");
  };

  const handleExport = (reason: string) => {
    onExportCertificate(selectedMssv, reason);
  };

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          mb: 4,
          overflowX: "auto",
          borderRadius: 10,
          minWidth: "800px",
          width: "110%",
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "rgb(249, 250, 251)" }}>
            <TableRow>
              <TableCell
                sx={{ fontWeight: "bold", color: "rgb(102, 112, 133)" }}
              >
                MSSV
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "rgb(102, 112, 133)" }}
              >
                Họ tên
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "rgb(102, 112, 133)" }}
              >
                Ngày sinh
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "rgb(102, 112, 133)" }}
              >
                Giới tính
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "rgb(102, 112, 133)" }}
              >
                Khoa
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "rgb(102, 112, 133)" }}
              >
                Khóa
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "rgb(102, 112, 133)" }}
              >
                Chương trình
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "rgb(102, 112, 133)" }}
              >
                Địa chỉ
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "rgb(102, 112, 133)" }}
              >
                Email
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "rgb(102, 112, 133)" }}
              >
                SĐT
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "rgb(102, 112, 133)" }}
              >
                Tình trạng
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  color: "rgb(102, 112, 133)",
                  textAlign: "center",
                  width: "140px",
                }}
              >
                Hành động
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.mssv}>
                <TableCell>{student.mssv}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.dob}</TableCell>
                <TableCell>{student.gender}</TableCell>
                <TableCell>{student.faculty}</TableCell>
                <TableCell
                  sx={{
                    textAlign: "center",
                  }}
                >
                  {student.course}
                </TableCell>
                <TableCell>{student.program}</TableCell>
                <TableCell>{student.address}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.phone}</TableCell>
                <TableCell>{student.status}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    <Tooltip title="Chỉnh sửa">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEdit(student)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Xuất chứng chỉ">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleExportClick(student.mssv)}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Xóa">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(student.mssv)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </TableContainer>

      <ExportCertificateModal
        student={
          students.find((student) => student.mssv === selectedMssv) ??
          ({} as Student)
        }
        open={exportModalOpen}
        onClose={handleExportClose}
        onExport={handleExport}
      />
    </>
  );
};
