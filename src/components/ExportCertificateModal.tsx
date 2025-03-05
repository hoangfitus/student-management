import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Stack,
  Box,
  SelectChangeEvent,
} from "@mui/material";
import { CertificatePDF } from "@app/components/Certificate.pdf";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Student } from "@app/types";
import { useLazyGenerateCertificateQuery } from "@app/services/student";

interface ExportCertificateModalProps {
  open: boolean;
  student: Student;
  onClose: () => void;
  onExport: (reason: string) => void;
}

export const ExportCertificateModal: React.FC<ExportCertificateModalProps> = ({
  open,
  student,
  onClose,
  onExport,
}) => {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isOtherReason, setIsOtherReason] = useState(false);

  const [generateCertificate, { data: pdfData }] =
    useLazyGenerateCertificateQuery();

  const handleMdExport = () => {
    const finalReason = reason === "other" ? customReason : reason;

    if (!finalReason.trim()) {
      return;
    }
    onExport(finalReason);
    onClose();
    // Reset form
    setReason("");
    setCustomReason("");
    setIsOtherReason(false);
  };

  const handleReasonChange = (event: SelectChangeEvent<string>) => {
    setReason(event.target.value);
    setIsOtherReason(false);
    console.log("event.target.value", event.target.value);
    setCustomReason("");
    if (event.target.value !== "other") {
      generateCertificate({
        id: student.mssv,
        reason: event.target.value,
      });
    }
  };

  const handleSubmitOtherReason = () => {
    console.log("customReason", customReason);
    setIsOtherReason(true);
    generateCertificate({
      id: student.mssv,
      reason: customReason,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Xuất chứng chỉ sinh viên</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Lý do xin cấp giấy xác nhận</InputLabel>
            <Select
              value={reason}
              onChange={handleReasonChange}
              label="Lý do xin cấp giấy xác nhận"
            >
              <MenuItem value="Xác nhận đang học để vay vốn ngân hàng">
                Xác nhận đang học để vay vốn ngân hàng
              </MenuItem>
              <MenuItem value="Xác nhận làm thủ tục tạm hoãn nghĩa vụ quân sự">
                Xác nhận làm thủ tục tạm hoãn nghĩa vụ quân sự
              </MenuItem>
              <MenuItem value="Xác nhận làm hồ sơ xin việc / thực tập">
                Xác nhận làm hồ sơ xin việc / thực tập
              </MenuItem>
              <MenuItem value="other">Khác</MenuItem>
            </Select>
          </FormControl>
          {reason === "other" && (
            <Box display="flex" flexDirection="row" gap={1}>
              <TextField
                fullWidth
                label={
                  reason === "other"
                    ? "Nhập lý do"
                    : "Lý do bổ sung (không bắt buộc)"
                }
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                multiline
                required={reason === "other"}
                disabled={isOtherReason}
              />
              <Button
                variant="contained"
                color="warning"
                onClick={handleSubmitOtherReason}
                disabled={!customReason.trim() || isOtherReason}
              >
                Ok
              </Button>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Hủy
        </Button>
        <Button
          color="primary"
          disabled={
            !reason ||
            (reason === "other" && (!customReason.trim() || !isOtherReason))
          }
        >
          <PDFDownloadLink
            document={
              <CertificatePDF
                student={student}
                reason={isOtherReason ? customReason : reason}
                school={
                  pdfData?.school || {
                    name: "",
                    address: "",
                    phone: "",
                    email: "",
                  }
                }
                from={pdfData?.from || ""}
                to={pdfData?.to || ""}
              />
            }
            fileName="certificate.pdf"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            Xuất PDF
          </PDFDownloadLink>
        </Button>
        <Button
          onClick={() => handleMdExport()}
          color="primary"
          disabled={
            !reason ||
            (reason === "other" && (!customReason.trim() || !isOtherReason))
          }
        >
          Xuất Markdown
        </Button>
      </DialogActions>
    </Dialog>
  );
};
