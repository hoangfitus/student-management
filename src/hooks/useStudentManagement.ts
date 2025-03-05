import { useState } from "react";
import {
  useAddStudentMutation,
  useDeleteStudentByIdMutation,
  useGetStudentsWithFilterQuery,
  useUpdateStudentMutation,
} from "@app/services/student";
import useDebounce from "./useDebounce";

export const useStudentManagement = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: studentData } = useGetStudentsWithFilterQuery({
    search: debouncedSearchTerm,
    faculty: facultyFilter,
    page,
    rowsPerPage,
  });

  const [addStudent] = useAddStudentMutation();
  const [updateStudent] = useUpdateStudentMutation();
  const [deleteStudent] = useDeleteStudentByIdMutation();

  return {
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
    updateStudent,
    deleteStudent,
  };
};
