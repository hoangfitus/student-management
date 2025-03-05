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

export const SettingsPage: React.FC = () => {
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [currentCatType, setCurrentCatType] = useState<
    "faculty" | "status" | "program"
  >("faculty");

  const { data: configData } = useGetConfigQuery();
  const [updateConfig] = useUpdateConfigMutation();
  const [createConfig] = useCreateConfigMutation();

  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>({
    name: configData?.find((item) => item.name === "school_name")?.value || "",
    address:
      configData?.find((item) => item.name === "school_address")?.value || "",
    phone:
      configData?.find((item) => item.name === "school_phone")?.value || "",
    email:
      configData?.find((item) => item.name === "school_email")?.value || "",
    allowedDomain:
      configData?.find((item) => item.name === "allowed_domain")?.value ||
      "gmail.com",
    image:
      configData?.find((item) => item.name === "school_image")?.value || "",
    bannerColor:
      configData?.find((item) => item.name === "school_banner_color")?.value ||
      "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (configData) {
      setSchoolConfig({
        name:
          configData.find((item) => item.name === "school_name")?.value || "",
        address:
          configData.find((item) => item.name === "school_address")?.value ||
          "",
        phone:
          configData.find((item) => item.name === "school_phone")?.value || "",
        email:
          configData.find((item) => item.name === "school_email")?.value || "",
        allowedDomain:
          configData.find((item) => item.name === "allowed_domain")?.value ||
          "gmail.com",
        image:
          configData.find((item) => item.name === "school_image")?.value || "",
        bannerColor:
          configData.find((item) => item.name === "school_banner_color")
            ?.value || "",
      });
    }
  }, [configData]);

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
    };

  const handleImageChange = (newFile: File | null) => {
    setImageFile(newFile);
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
          console.log("Creating new config:", item);
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
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveAllConfig}
              >
                Lưu thay đổi
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
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
        </Grid>
      </Grid>

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
