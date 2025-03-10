import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Button,
  ButtonGroup,
  Typography,
  TextField,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  Stack,
  Badge,
} from "@mui/material";
import { CategoryModal } from "@app/components";
import { useCategories } from "@app/hooks";
import {
  useCreateConfigMutation,
  useGetConfigQuery,
  useUpdateConfigMutation,
} from "@app/services/config";
import { toast } from "react-toastify";
import { MuiColorInput } from "mui-color-input";
import { useUploadMutation } from "@app/services/upload";
import { MuiFileInput } from "mui-file-input";

interface SchoolConfig {
  name: string;
  address: string;
  phone: string;
  email: string;
  allowedDomain: string;
  image: string;
  bannerColor: string;
}

interface SystemConfig {
  deleteStudentInTime: boolean;
  updateStudentStatusWithRule: boolean;
  applyEmailDomainRule: boolean;
}

export const SettingsPage: React.FC = () => {
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [currentCatType, setCurrentCatType] = useState<
    "faculty" | "status" | "program"
  >("faculty");

  const { data: configData } = useGetConfigQuery();
  const [updateConfig, { isLoading: isUpdating }] = useUpdateConfigMutation();
  const [createConfig, { isLoading: isCreating }] = useCreateConfigMutation();

  const getConfigValue = React.useCallback(
    (name: string, defaultValue: string = "") =>
      configData?.find((item) => item.name === name)?.value || defaultValue,
    [configData]
  );

  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>({
    name: getConfigValue("school_name"),
    address: getConfigValue("school_address"),
    phone: getConfigValue("school_phone"),
    email: getConfigValue("school_email"),
    allowedDomain: getConfigValue("allowed_domain", "gmail.com"),
    image: getConfigValue("school_image"),
    bannerColor: getConfigValue("school_banner_color"),
  });

  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    deleteStudentInTime: getConfigValue("delete_student_in_time") === "true",
    updateStudentStatusWithRule:
      getConfigValue("update_student_status_with_rule") === "true",
    applyEmailDomainRule: getConfigValue("apply_email_domain_rule") === "true",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    if (configData) {
      setSchoolConfig({
        name: getConfigValue("school_name"),
        address: getConfigValue("school_address"),
        phone: getConfigValue("school_phone"),
        email: getConfigValue("school_email"),
        allowedDomain: getConfigValue("allowed_domain", "gmail.com"),
        image: getConfigValue("school_image"),
        bannerColor: getConfigValue("school_banner_color"),
      });
      setSystemConfig({
        deleteStudentInTime:
          getConfigValue("delete_student_in_time") === "true",
        updateStudentStatusWithRule:
          getConfigValue("update_student_status_with_rule") === "true",
        applyEmailDomainRule:
          getConfigValue("apply_email_domain_rule") === "true",
      });
    }
  }, [configData, getConfigValue]);

  const {
    facultiesData,
    statusesData,
    programsData,
    handleAddCategory,
    handleEditCategory,
    handleDeleteCategory,
  } = useCategories();

  const [upload] = useUploadMutation();

  const handleConfigChange =
    (field: keyof SchoolConfig) =>
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string
    ) => {
      setSchoolConfig((prev) => ({
        ...prev,
        [field]: typeof event === "string" ? event : event.target.value,
      }));
      setUnsavedChanges(true);
    };

  const handleToggleChange =
    (field: keyof SystemConfig) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSystemConfig((prev) => ({
        ...prev,
        [field]: event.target.checked,
      }));
      setUnsavedChanges(true);
    };

  const handleImageChange = (newFile: File | null) => {
    setImageFile(newFile);
    setUnsavedChanges(true);
  };

  const handleSaveAllConfig = async () => {
    try {
      let imageUrl = schoolConfig.image;
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const response = await upload(formData).unwrap();
        imageUrl = response.url;
      }

      const configItems = [
        { name: "school_name", value: schoolConfig.name },
        { name: "school_address", value: schoolConfig.address },
        { name: "school_phone", value: schoolConfig.phone },
        { name: "school_email", value: schoolConfig.email },
        { name: "allowed_domain", value: schoolConfig.allowedDomain },
        { name: "school_image", value: imageUrl },
        { name: "school_banner_color", value: schoolConfig.bannerColor },
        {
          name: "delete_student_in_time",
          value: systemConfig.deleteStudentInTime ? "true" : "false",
        },
        {
          name: "update_student_status_with_rule",
          value: systemConfig.updateStudentStatusWithRule ? "true" : "false",
        },
        {
          name: "apply_email_domain_rule",
          value: systemConfig.applyEmailDomainRule ? "true" : "false",
        },
      ]
        .filter((item) => item.value.trim() !== "") // Chỉ lấy các mục có giá trị
        .filter((item) => {
          // Chỉ lấy các mục có giá trị thay đổi
          const existingValue = configData?.find(
            (c) => c.name === item.name
          )?.value;
          return existingValue !== item.value;
        });

      if (configItems.length === 0) {
        toast.info("Không có thông tin nào thay đổi!");
        return;
      }

      for (const item of configItems) {
        const existingConfig = configData?.find((c) => c.name === item.name);
        if (existingConfig) {
          await updateConfig({
            id: existingConfig.id,
            value: item.value,
          }).unwrap();
        } else {
          await createConfig({
            name: item.name,
            value: item.value,
          }).unwrap();
        }
      }

      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật thông tin!");
      console.error(error);
    } finally {
      setUnsavedChanges(false);
    }
  };

  return (
    <Container sx={{ my: 4 }}>
      <Typography variant="h4" gutterBottom>
        Cài đặt hệ thống
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin trường
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Tên trường"
                fullWidth
                value={schoolConfig.name}
                onChange={handleConfigChange("name")}
              />
              <TextField
                label="Địa chỉ"
                fullWidth
                value={schoolConfig.address}
                onChange={handleConfigChange("address")}
              />
              <TextField
                label="Số điện thoại"
                fullWidth
                value={schoolConfig.phone}
                onChange={handleConfigChange("phone")}
              />
              <TextField
                label="Email"
                fullWidth
                value={schoolConfig.email}
                onChange={handleConfigChange("email")}
              />
              <MuiFileInput
                value={imageFile}
                onChange={handleImageChange}
                placeholder="Chọn logo trường"
                inputProps={{ accept: "image/*" }}
                fullWidth
                error={Boolean(
                  imageFile && !imageFile.type.startsWith("image/")
                )}
                helperText={
                  imageFile && !imageFile.type.startsWith("image/")
                    ? "Vui lòng chọn file ảnh"
                    : ""
                }
              />
              <MuiColorInput
                label="Màu chủ đạo"
                value={schoolConfig.bannerColor}
                onChange={handleConfigChange("bannerColor")}
              />
              <TextField
                label="Domain cho phép"
                fullWidth
                value={schoolConfig.allowedDomain}
                onChange={handleConfigChange("allowedDomain")}
                helperText="Domain email được phép sử dụng trong hệ thống"
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Quản lý danh mục
              </Typography>
              <ButtonGroup
                variant="outlined"
                color="primary"
                orientation="vertical"
                fullWidth
              >
                <Button
                  onClick={() => {
                    setCurrentCatType("faculty");
                    setCategoryModalOpen(true);
                  }}
                >
                  Quản lý Khoa
                </Button>
                <Button
                  onClick={() => {
                    setCurrentCatType("status");
                    setCategoryModalOpen(true);
                  }}
                >
                  Quản lý Tình trạng
                </Button>
                <Button
                  onClick={() => {
                    setCurrentCatType("program");
                    setCategoryModalOpen(true);
                  }}
                >
                  Quản lý Chương trình
                </Button>
              </ButtonGroup>
            </Paper>
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Quản lý quy định
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={systemConfig.deleteStudentInTime}
                    onChange={handleToggleChange("deleteStudentInTime")}
                  />
                }
                label="Chỉ xóa sinh viên trong thời gian quy định từ khi tạo"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={systemConfig.updateStudentStatusWithRule}
                    onChange={handleToggleChange("updateStudentStatusWithRule")}
                  />
                }
                label="Chỉ cập nhật tình trạng sinh viên theo quy định"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={systemConfig.applyEmailDomainRule}
                    onChange={handleToggleChange("applyEmailDomainRule")}
                  />
                }
                label="Áp dụng quy tắc domain email cho sinh viên"
              />
            </Paper>
          </Stack>
        </Grid>
      </Grid>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Badge color="secondary" variant="dot" invisible={!unsavedChanges}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveAllConfig}
            loading={isUpdating || isCreating}
          >
            Lưu thay đổi
          </Button>
        </Badge>
      </Box>
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
            ? facultiesData
            : currentCatType === "status"
            ? statusesData
            : programsData
        }
        onAdd={(newValue) => handleAddCategory(currentCatType, newValue)}
        onEdit={(id, newValue) =>
          handleEditCategory(currentCatType, id, newValue)
        }
        onDelete={(id) => handleDeleteCategory(currentCatType, id)}
      />
    </Container>
  );
};
