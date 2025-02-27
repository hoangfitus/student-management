import multer from "multer";

// Cấu hình multer để lưu file tạm vào folder "uploads"
const upload = multer({ dest: "uploads/" });

export default upload;
