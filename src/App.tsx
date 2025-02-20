import React, { useEffect, useState } from 'react';
import { Container, Typography, Divider, Button, TextField, Dialog, DialogTitle, DialogContent, Box } from '@mui/material';
import StudentForm from './components/StudentForm';
import StudentList from './components/StudentList';
import { Student } from './types";
import Footer from "./components/Footer";

const API_BASE = "http://localhost:3001";

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Reference cho input file CSV ẩn
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStudents = (search: string, page: number, rowsPerPage:number) => {
    fetch(`${API_BASE}/students?search=${encodeURIComponent(search)}&page=${page}&limit=${rowsPerPage}`)
      .then(res => res.json())
      .then(data => {
        setStudents(data.students);
        setTotalStudents(data.total);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchStudents(searchTerm, page, rowsPerPage);
  }, [searchTerm, page, rowsPerPage]);

  const addStudent = (student: Student) => {
    fetch(`${API_BASE}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student)
    })
      .then(res => res.json())
      .then(() => {
        fetchStudents(searchTerm, page, rowsPerPage);
        setModalOpen(false);
      })
      .catch(err => console.error(err));
  };

  const updateStudent = (student: Student) => {
    fetch(`${API_BASE}/students/${student.mssv}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student)
    })
      .then(res => res.json())
      .then(() => {
        fetchStudents(searchTerm, page, rowsPerPage);
        setEditingStudent(null);
        setModalOpen(false);
      })
      .catch(err => console.error(err));
  };

  const deleteStudent = (mssv: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sinh viên này?")) {
      fetch(`${API_BASE}/students/${mssv}`, { method: "DELETE" })
        .then(res => res.json())
        .then(() => {
          fetchStudents(searchTerm, page, rowsPerPage);
        })
        .catch(err => console.error(err));
    }
  };

  const handleChangePage = (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = event.target.value;
    setSearchTerm(newSearch);
    setPage(0);
  };

  const exportExcel = () => {
    window.open(`${API_BASE}/export`, "_blank");
  };

  const handleImportExcelClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Hàm xử lý khi chọn file Excel
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Kiểm tra phần mở rộng file
      const allowedExtensions = [".xlsx", ".xls"];
      const fileExtension = file.name
        .slice(file.name.lastIndexOf("."))
        .toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        alert("Vui lòng chọn file Excel (.xlsx, .xls)");
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      fetch(`${API_BASE}/import/excel`, {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then(() => {
          fetchStudents(searchTerm, facultyFilter, page, rowsPerPage);
        })
        .catch((err) => console.error(err));
    }
  };

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: 4
      }}
    >
      <Typography variant="h4" gutterBottom>
        Quản lý sinh viên
      </Typography>
      <Divider sx={{ width: '100%', mb: 2 }} />

      <Box mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setEditingStudent(null);
            setModalOpen(true);
          }}
          sx={{ mr: 2 }}
        >
          Thêm sinh viên
        </Button>
        <Button
          variant="outlined"
          color="info"
          onClick={handleImportExcelClick}
          sx={{ mr: 2 }}
        >
          Import CSV
        </Button>
        <Button variant="outlined" color="secondary" onClick={exportExcel}>
          Export Excel
        </Button>
        {/* File input ẩn */}
        <input
          type="file"
          accept=".xlsx, .xls"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </Box>

      <TextField
        label="Tìm kiếm theo MSSV hoặc Họ tên"
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mb: 2, width: '50%' }}
      />

      <StudentList
        students={students}
        total={totalStudents}
        page={page}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onEdit={(student: Student) => {
          setEditingStudent(student);
          setModalOpen(true);
        }}
        onDelete={deleteStudent}
      />

      <Dialog open={isModalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingStudent ? "Cập nhật sinh viên" : "Thêm sinh viên"}</DialogTitle>
        <DialogContent>
          <StudentForm
            defaultValues={editingStudent || undefined}
            onSubmit={editingStudent ? updateStudent : addStudent}
            onCancel={() => setModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Footer />
    </Container>
  );
};

export default App;
