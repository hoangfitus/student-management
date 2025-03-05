import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  SelectChangeEvent,
} from "@mui/material";
import type { Category } from "@app/types";

interface StudentFiltersProps {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  facultyFilter: string;
  onFacultyChange: (event: SelectChangeEvent<string>) => void;
  faculties: Category[];
}

export const StudentFilters: React.FC<StudentFiltersProps> = ({
  searchTerm,
  onSearchChange,
  facultyFilter,
  onFacultyChange,
  faculties,
}) => {
  return (
    <Box mb={2} sx={{ display: "flex", width: "100%", gap: 2 }}>
      <TextField
        label="Tìm kiếm theo MSSV hoặc Họ tên"
        value={searchTerm}
        onChange={onSearchChange}
        sx={{ flex: 2 }}
      />
      <FormControl sx={{ flex: 1 }}>
        <InputLabel id="faculty-select-label">Lọc theo Khoa</InputLabel>
        <Select
          labelId="faculty-select-label"
          value={facultyFilter}
          label="Lọc theo Khoa"
          onChange={(event) =>
            onFacultyChange(event as SelectChangeEvent<string>)
          }
        >
          <MenuItem value="">Tất cả</MenuItem>
          {faculties?.map((fac, idx) => (
            <MenuItem key={idx} value={fac.name}>
              {fac.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
