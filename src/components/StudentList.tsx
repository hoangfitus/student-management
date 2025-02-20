import React from "react";
import { Student } from "../types";
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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface StudentListProps {
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
}

const StudentList: React.FC<StudentListProps> = ({
  students,
  total,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
}) => {
  return (
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
            <TableCell sx={{ fontWeight: "bold", color: "rgb(102, 112, 133)" }}>
              MSSV
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "rgb(102, 112, 133)" }}>
              Họ tên
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "rgb(102, 112, 133)" }}>
              Ngày sinh
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "rgb(102, 112, 133)" }}>
              Giới tính
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "rgb(102, 112, 133)" }}>
              Khoa
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "rgb(102, 112, 133)" }}>
              Khóa
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "rgb(102, 112, 133)" }}>
              Chương trình
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "rgb(102, 112, 133)" }}>
              Địa chỉ
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "rgb(102, 112, 133)" }}>
              Email
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "rgb(102, 112, 133)" }}>
              SĐT
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "rgb(102, 112, 133)" }}>
              Tình trạng
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", color: "rgb(102, 112, 133)" }}>
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
              <TableCell>{student.department}</TableCell>
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
              <TableCell
                sx={{
                  textAlign: "center",
                }}
              >
                <IconButton color="primary" onClick={() => onEdit(student)}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="secondary"
                  onClick={() => onDelete(student.mssv)}
                >
                  <DeleteIcon />
                </IconButton>
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
  );
};

export default StudentList;
