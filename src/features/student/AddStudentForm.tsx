import React, { useEffect, useMemo } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { TextField, Button, Grid2, MenuItem, Box } from "@mui/material";
import type { Student } from "@app/types";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

interface AddStudentFormProps {
  defaultValues?: Student;
  faculties?: string[];
  programs?: string[];
  statuses?: string[];
  isDomainRuleActive: boolean;
  allowedDomain: string;
  onSubmit: (data: Student) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

const genders = ["Nam", "Nữ", "Khác"];

const createSchema = (isDomainRuleActive: boolean, allowedDomain: string) => {
  if (!isDomainRuleActive) {
    return yup
      .object({
        mssv: yup.string().required("MSSV là bắt buộc"),
        name: yup.string().required("Họ tên là bắt buộc"),
        dob: yup.string().required("Ngày sinh là bắt buộc"),
        gender: yup.string().required("Giới tính là bắt buộc"),
        faculty: yup.string().required("Khoa là bắt buộc"),
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
  }
  const domainRegex = new RegExp(
    `^[a-zA-Z0-9._%+-]+@${allowedDomain.replace(/\./g, "\\.")}$`
  );
  return yup
    .object({
      mssv: yup.string().required("MSSV là bắt buộc"),
      name: yup.string().required("Họ tên là bắt buộc"),
      dob: yup.string().required("Ngày sinh là bắt buộc"),
      gender: yup.string().required("Giới tính là bắt buộc"),
      faculty: yup.string().required("Khoa là bắt buộc"),
      course: yup.string().required("Khóa là bắt buộc"),
      program: yup.string().required("Chương trình là bắt buộc"),
      address: yup.string().required("Địa chỉ là bắt buộc"),
      email: yup
        .string()
        .email("Email không hợp lệ")
        .matches(domainRegex, `Email phải có domain là ${allowedDomain}`)
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
};

export const AddStudentForm: React.FC<AddStudentFormProps> = ({
  defaultValues,
  faculties,
  programs,
  statuses,
  isDomainRuleActive,
  allowedDomain,
  onSubmit,
  isSubmitting,
  onCancel,
}) => {
  const schema = useMemo(
    () => createSchema(isDomainRuleActive, allowedDomain),
    [isDomainRuleActive, allowedDomain]
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Student>({
    resolver: yupResolver(schema),
    defaultValues: defaultValues,
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
          <Controller
            name="dob"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Ngày sinh"
                format="DD/MM/YYYY"
                defaultValue={dayjs(defaultValues?.dob, "DD/MM/YYYY")}
                value={field.value ? dayjs(field.value, "DD/MM/YYYY") : null}
                onChange={(date) => field.onChange(date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.dob,
                    helperText: errors.dob ? errors.dob.message : "",
                  },
                }}
              />
            )}
          />
        </Grid2>
        {/* Gender field using Controller */}
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <Controller
            name="gender"
            control={control}
            defaultValue={defaultValues?.gender || ""}
            render={({ field }) => (
              <TextField
                select
                label="Giới tính"
                fullWidth
                value={field.value}
                onChange={field.onChange}
                error={!!errors.gender}
                helperText={errors.gender?.message}
              >
                {genders.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid2>
        {/* Faculty field using Controller */}
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <Controller
            name="faculty"
            control={control}
            defaultValue={defaultValues?.faculty || ""}
            render={({ field }) => (
              <TextField
                select
                label="Khoa"
                fullWidth
                value={field.value}
                onChange={field.onChange}
                error={!!errors.faculty}
                helperText={errors.faculty?.message}
              >
                {faculties?.map((faculty) => (
                  <MenuItem key={faculty} value={faculty}>
                    {faculty}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid2>
        {/* Course field using Controller */}
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <Controller
            name="course"
            control={control}
            defaultValue={defaultValues?.course || ""}
            render={({ field }) => (
              <TextField
                label="Khóa"
                fullWidth
                value={field.value}
                onChange={field.onChange}
                error={!!errors.course}
                helperText={errors.course?.message}
              />
            )}
          />
        </Grid2>
        {/* Program field using Controller */}
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <Controller
            name="program"
            control={control}
            defaultValue={defaultValues?.program || ""}
            render={({ field }) => (
              <TextField
                select
                label="Chương trình"
                fullWidth
                value={field.value}
                onChange={field.onChange}
                error={!!errors.program}
                helperText={errors.program?.message}
              >
                {programs?.map((program) => (
                  <MenuItem key={program} value={program}>
                    {program}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid2>
        {/* Status field using Controller */}
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <Controller
            name="status"
            control={control}
            defaultValue={defaultValues?.status || ""}
            render={({ field }) => (
              <TextField
                select
                label="Tình trạng sinh viên"
                fullWidth
                value={field.value}
                onChange={field.onChange}
                error={!!errors.status}
                helperText={errors.status?.message}
              >
                {statuses?.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            )}
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
            label="Địa chỉ"
            fullWidth
            {...register("address")}
            error={!!errors.address}
            helperText={errors.address?.message}
          />
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
                loading={isSubmitting}
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
            <Button
              loading={isSubmitting}
              type="submit"
              variant="contained"
              color="primary"
            >
              {defaultValues ? "Cập nhật" : "Thêm"}
            </Button>
          </Grid2>
        </Grid2>
      </Grid2>
    </Box>
  );
};
