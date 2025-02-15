import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { TextField, Button, Grid2, MenuItem, Box } from "@mui/material";
import { Student } from "../types";

interface StudentFormProps {
  defaultValues?: Student;
  onSubmit: (data: Student) => void;
  onCancel?: () => void;
}

const departments = [
  "Khoa Luật",
  "Khoa Tiếng Anh thương mại",
  "Khoa Tiếng Nhật",
  "Khoa Tiếng Pháp",
];

const statuses = ["Đang học", "Đã tốt nghiệp", "Đã thôi học", "Tạm dừng học"];

const genders = ["Nam", "Nữ", "Khác"];

const schema = yup
  .object({
    mssv: yup.string().required("MSSV là bắt buộc"),
    name: yup.string().required("Họ tên là bắt buộc"),
    dob: yup.string().required("Ngày sinh là bắt buộc"),
    gender: yup.string().required("Giới tính là bắt buộc"),
    department: yup.string().required("Khoa là bắt buộc"),
    course: yup.string().required("Khóa là bắt buộc"),
    program: yup.string().required("Chương trình là bắt buộc"),
    address: yup.string().required("Địa chỉ là bắt buộc"),
    email: yup
      .string()
      .email("Email không hợp lệ")
      .required("Email là bắt buộc"),
    phone: yup
      .string()
      .matches(
        /^0\d{9}$/,
        "Số điện thoại không hợp lệ. Phải bắt đầu bằng 0 và có 10 chữ số."
      )
      .required("Số điện thoại là bắt buộc"),
    status: yup.string().required("Tình trạng sinh viên là bắt buộc"),
  })
  .required();

const StudentForm: React.FC<StudentFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Student>({
    resolver: yupResolver(schema),
    defaultValues: defaultValues || {
      mssv: "",
      name: "",
      dob: "",
      gender: "",
      department: "",
      course: "",
      program: "",
      address: "",
      email: "",
      phone: "",
      status: "",
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const submitHandler: SubmitHandler<Student> = (data) => {
    onSubmit(data);
    reset();
  };

  return (
    <Box component="form" onSubmit={handleSubmit(submitHandler)} sx={{ p: 2 }}>
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Mã số sinh viên"
            fullWidth
            {...register("mssv")}
            error={!!errors.mssv}
            helperText={errors.mssv?.message}
            disabled={!!defaultValues}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Họ tên"
            fullWidth
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Ngày sinh"
            type="date"
            fullWidth
            {...register("dob")}
            InputLabelProps={{ shrink: true }}
            error={!!errors.dob}
            helperText={errors.dob?.message}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            label="Giới tính"
            fullWidth
            defaultValue=""
            {...register("gender")}
            error={!!errors.gender}
            helperText={errors.gender?.message}
          >
            {genders.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            label="Khoa"
            fullWidth
            defaultValue=""
            {...register("department")}
            error={!!errors.department}
            helperText={errors.department?.message}
          >
            {departments.map((dept) => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </TextField>
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Khóa"
            fullWidth
            {...register("course")}
            error={!!errors.course}
            helperText={errors.course?.message}
          />
        </Grid2>
        <Grid2 size={{ xs: 12 }}>
          <TextField
            label="Chương trình"
            fullWidth
            {...register("program")}
            error={!!errors.program}
            helperText={errors.program?.message}
          />
        </Grid2>
        <Grid2 size={{ xs: 12 }}>
          <TextField
            label="Địa chỉ"
            fullWidth
            {...register("address")}
            error={!!errors.address}
            helperText={errors.address?.message}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Email"
            fullWidth
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Số điện thoại"
            fullWidth
            {...register("phone")}
            error={!!errors.phone}
            helperText={errors.phone?.message}
          />
        </Grid2>
        <Grid2 size={{ xs: 12 }}>
          <TextField
            select
            label="Tình trạng sinh viên"
            fullWidth
            defaultValue=""
            {...register("status")}
            error={!!errors.status}
            helperText={errors.status?.message}
          >
            {statuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
        </Grid2>
        <Grid2
          size={{ xs: 12 }}
          container
          spacing={2}
          justifyContent="flex-end"
        >
          {onCancel && (
            <Grid2>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  reset();
                  onCancel();
                }}
              >
                Hủy
              </Button>
            </Grid2>
          )}
          <Grid2>
            <Button type="submit" variant="contained" color="primary">
              {defaultValues ? "Cập nhật" : "Thêm"}
            </Button>
          </Grid2>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default StudentForm;
