import React, { useState } from "react";
import {
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  StudentToolbar,
  StudentFilters,
  StudentsTable,
  AddStudentForm,
} from "@app/features/student";
import {
  useStudentManagement,
  useImportExport,
  useCategories,
} from "@app/hooks";
import type { Student } from "@app/types";
import { SelectChangeEvent } from "@mui/material";
import { useGetConfigByNameQuery } from "@app/services/config";
import { toast } from "react-toastify";

export const HomePage: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  const {
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    searchTerm,
    setSearchTerm,
    facultyFilter,
    setFacultyFilter,
    studentData,
    addStudent,
    isAdding,
    updateStudent,
    isUpdating,
    deleteStudent,
    isDeleting,
  } = useStudentManagement();

  const {
    fileInputRef,
    handleFileChange,
    importSampleData,
    exportStudents,
    exportCertificate,
  } = useImportExport();

  const { facultiesData, programsData, statusesData } = useCategories();
  const { data: allowedDomain } = useGetConfigByNameQuery("allowed_domain");
  const { data: isDomainRuleActive } = useGetConfigByNameQuery(
    "apply_email_domain_rule"
  );

  const handleOpenStudentDialog = (student?: Student) => {
    setEditingStudent(student || null);
    setModalOpen(true);
  };

  const onSubmitStudent = async (student: Student) => {
    try {
      let data = null;
      if (editingStudent) {
        data = await updateStudent(student).unwrap();
      } else {
        data = await addStudent(student).unwrap();
      }
      toast.success(data?.message);
    } finally {
      setModalOpen(false);
      setEditingStudent(null);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFacultyChange = (event: SelectChangeEvent<string>) => {
    setFacultyFilter(event.target.value);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteStudent = (mssv: string) => {
    setStudentToDelete(mssv);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteStudent = async () => {
    if (studentToDelete) {
      await deleteStudent(studentToDelete)
        .unwrap()
        .then(() => toast.success("Student deleted successfully"))
        .finally(() => {
          setDeleteDialogOpen(false);
          setStudentToDelete(null);
        });
    }
  };

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <StudentToolbar
        onImportClick={() => fileInputRef.current?.click()}
        onExportExcel={() => exportStudents("excel")}
        onExportCSV={() => exportStudents("csv")}
        onAddStudent={() => handleOpenStudentDialog()}
        onImportSample={importSampleData}
      />

      <input
        type="file"
        accept=".xlsx, .xls, .csv"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <StudentFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        facultyFilter={facultyFilter}
        onFacultyChange={handleFacultyChange}
        faculties={facultiesData || []}
      />

      <StudentsTable
        students={studentData?.students ?? []}
        total={studentData?.total ?? 0}
        page={page}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onEdit={handleOpenStudentDialog}
        onDelete={handleDeleteStudent}
        onExportCertificate={exportCertificate}
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
          <AddStudentForm
            defaultValues={editingStudent || undefined}
            faculties={facultiesData?.map((f) => f.name)}
            programs={programsData?.map((p) => p.name)}
            statuses={statusesData?.map((s) => s.name)}
            isDomainRuleActive={isDomainRuleActive?.value === "true"}
            allowedDomain={allowedDomain?.value || "gmail.com"}
            onSubmit={onSubmitStudent}
            isSubmitting={isAdding || isUpdating}
            onCancel={() => setModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Xác nhận xóa sinh viên</DialogTitle>
        <DialogContent>
          Bạn có chắc chắn muốn xóa sinh viên này không?
        </DialogContent>
        <DialogActions>
          <Button
            loading={isDeleting}
            onClick={() => setDeleteDialogOpen(false)}
          >
            Hủy
          </Button>
          <Button
            onClick={confirmDeleteStudent}
            loading={isDeleting}
            color="primary"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
