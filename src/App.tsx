import React, { useEffect, useRef, useState } from "react";
import {
  Container,
  Typography,
  Divider,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  ButtonGroup,
} from "@mui/material";
import StudentForm from "./components/StudentForm";
import StudentList from "./components/StudentList";
import Footer from "./components/Footer";
import CategoryModal, { CategoryItem } from "./components/CategoryModal";
import { Student } from "./types";

const API_BASE = "http://localhost:3001";

const App: React.FC = () => {
  // States cho sinh viên
  const [students, setStudents] = useState<Student[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // States cho danh mục (dạng đối tượng)
  const [faculties, setFaculties] = useState<CategoryItem[]>([]);
  const [statuses, setStatuses] = useState<CategoryItem[]>([]);
  const [programs, setPrograms] = useState<CategoryItem[]>([]);

  // State cho modal danh mục chung
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [currentCatType, setCurrentCatType] = useState<
    "faculty" | "status" | "program"
  >("faculty");

  // Reference cho input file Excel ẩn
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch danh mục (giả sử API trả về đối tượng có { id, name })
  const fetchFaculties = () => {
    fetch(`${API_BASE}/faculties`)
      .then((res) => res.json())
      .then((data) => setFaculties(data))
      .catch((err) => console.error(err));
  };

  const fetchStatuses = () => {
    fetch(`${API_BASE}/student_statuses`)
      .then((res) => res.json())
      .then((data) => setStatuses(data))
      .catch((err) => console.error(err));
  };

  const fetchPrograms = () => {
    fetch(`${API_BASE}/programs`)
      .then((res) => res.json())
      .then((data) => setPrograms(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchFaculties();
    fetchPrograms();
    fetchStatuses();
  }, []);

  const fetchStudents = (
    search: string,
    faculty: string,
    page: number,
    rowsPerPage: number
  ) => {
    let url = `${API_BASE}/students?search=${encodeURIComponent(
      search
    )}&page=${page}&limit=${rowsPerPage}`;
    if (faculty) {
      url += `&faculty=${encodeURIComponent(faculty)}`;
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setStudents(data.students);
        setTotalStudents(data.total);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchStudents(searchTerm, facultyFilter, page, rowsPerPage);
  }, [searchTerm, facultyFilter, page, rowsPerPage]);

  const addStudent = (student: Student) => {
    fetch(`${API_BASE}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student),
    })
      .then((res) => res.json())
      .then(() => {
        fetchStudents(searchTerm, facultyFilter, page, rowsPerPage);
        setModalOpen(false);
      })
      .catch((err) => console.error(err));
  };

  const updateStudent = (student: Student) => {
    fetch(`${API_BASE}/students/${student.mssv}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student),
    })
      .then((res) => res.json())
      .then(() => {
        fetchStudents(searchTerm, facultyFilter, page, rowsPerPage);
        setEditingStudent(null);
        setModalOpen(false);
      })
      .catch((err) => console.error(err));
  };

  const deleteStudent = (mssv: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sinh viên này?")) {
      fetch(`${API_BASE}/students/${mssv}`, { method: "DELETE" })
        .then((res) => res.json())
        .then(() => {
          fetchStudents(searchTerm, facultyFilter, page, rowsPerPage);
        })
        .catch((err) => console.error(err));
    }
  };

  const handleChangePage = (
    _: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newRows = parseInt(event.target.value, 10);
    setRowsPerPage(newRows);
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFacultyChange = (event: SelectChangeEvent) => {
    setFacultyFilter(event.target.value);
    setPage(0);
  };

  const exportExcel = () => {
    window.open(`${API_BASE}/export?type=excel`, "_blank");
  };

  const exportCSV = () => {
    window.open(`${API_BASE}/export?type=csv`, "_blank");
  };

  const handleImportDataClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Xử lý chọn file Excel và CSV
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const allowedExtensions = [".xlsx", ".xls", ".csv"];
      const fileExtension = file.name
        .slice(file.name.lastIndexOf("."))
        .toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        alert("Vui lòng chọn file .xlsx, .xls hoặc .csv");
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      fetch(`${API_BASE}/import`, {
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

  // Handler cho "Thêm dữ liệu mẫu"
  const importSampleData = () => {
    fetch(`${API_BASE}/import?sample=true`, { method: "POST" })
      .then((res) => res.json())
      .then(() => {
        fetchStudents(searchTerm, facultyFilter, page, rowsPerPage);
      })
      .catch((err) => console.error(err));
  };

  // Handlers cho modal sinh viên
  const handleOpenStudentDialog = (student?: Student) => {
    setEditingStudent(student || null);
    setModalOpen(true);
  };

  // Handlers cho modal danh mục chung
  const openCategoryModal = (type: "faculty" | "status" | "program") => {
    setCurrentCatType(type);
    setCategoryModalOpen(true);
  };

  // Callback cho modal danh mục
  const handleAddCategory = (newValue: string) => {
    const endpoint =
      currentCatType === "faculty"
        ? "/faculties"
        : currentCatType === "status"
        ? "/student_statuses"
        : "/programs";
    fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newValue }),
    })
      .then((res) => res.json())
      .then(() => {
        if (currentCatType === "faculty") fetchFaculties();
        if (currentCatType === "status") fetchStatuses();
        if (currentCatType === "program") fetchPrograms();
      })
      .catch((err) => console.error(err));
  };

  const handleEditCategory = (id: number, newValue: string) => {
    const endpoint =
      currentCatType === "faculty"
        ? "/faculties"
        : currentCatType === "status"
        ? "/student_statuses"
        : "/programs";
    fetch(`${API_BASE}${endpoint}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newValue }),
    })
      .then((res) => res.json())
      .then(() => {
        if (currentCatType === "faculty") fetchFaculties();
        if (currentCatType === "status") fetchStatuses();
        if (currentCatType === "program") fetchPrograms();
      })
      .catch((err) => console.error(err));
  };

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 4,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Quản lý sinh viên
      </Typography>
      <Divider sx={{ width: "100%", mb: 2 }} />
      <Box
        mb={2}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <ButtonGroup variant="text" color="success">
          {/* Nút quản lý danh mục */}
          <Button onClick={() => openCategoryModal("faculty")}>
            Quản lý Khoa
          </Button>
          <Button onClick={() => openCategoryModal("status")}>
            Quản lý Tình trạng
          </Button>
          <Button onClick={() => openCategoryModal("program")}>
            Quản lý Chương trình
          </Button>
        </ButtonGroup>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            color="info"
            onClick={handleImportDataClick}
          >
            Import Data
          </Button>
          <Button variant="outlined" color="secondary" onClick={exportExcel}>
            Export Excel
          </Button>
          <Button variant="outlined" color="secondary" onClick={exportCSV}>
            Export CSV
          </Button>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              handleOpenStudentDialog();
            }}
          >
            Thêm sinh viên
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={importSampleData}
            sx={{ mr: 2 }}
          >
            Thêm dữ liệu mẫu
          </Button>
        </Box>
        {/* File input ẩn */}
        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </Box>
      <Box mb={2} sx={{ display: "flex", width: "100%", gap: 2 }}>
        <TextField
          label="Tìm kiếm theo MSSV hoặc Họ tên"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flex: 2 }}
        />
        <FormControl sx={{ flex: 1 }}>
          <InputLabel id="faculty-select-label">Lọc theo Khoa</InputLabel>
          <Select
            labelId="faculty-select-label"
            value={facultyFilter}
            label="Lọc theo Khoa"
            onChange={handleFacultyChange}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {faculties.map((fac, idx) => (
              <MenuItem key={idx} value={fac.name}>
                {fac.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <StudentList
        students={students}
        total={totalStudents}
        page={page}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onEdit={(student: Student) => {
          handleOpenStudentDialog(student);
        }}
        onDelete={deleteStudent}
      />
      <Dialog
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingStudent ? "Cập nhật sinh viên" : "Thêm sinh viên"}
        </DialogTitle>
        <DialogContent>
          <StudentForm
            defaultValues={editingStudent || undefined}
            faculties={faculties.map((f) => f.name)}
            programs={programs.map((p) => p.name)}
            statuses={statuses.map((s) => s.name)}
            onSubmit={editingStudent ? updateStudent : addStudent}
            onCancel={() => setModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <CategoryModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title={
          currentCatType === "faculty"
            ? "Khoa"
            : currentCatType === "status"
            ? "Tình trạng sinh viên"
            : "Chương trình đào tạo"
        }
        items={
          currentCatType === "faculty"
            ? faculties
            : currentCatType === "status"
            ? statuses
            : programs
        }
        onAdd={handleAddCategory}
        onEdit={handleEditCategory}
      />
      <Footer />
    </Container>
  );
};

export default App;
