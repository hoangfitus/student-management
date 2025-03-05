## Testing

### Các khó khăn khi cài đặt test

- Vì lúc đầu, code hết backend api trong 1 file duy nhất `server.ts` nên việc test khá khó khăn, không thể test được các hàm riêng lẻ.
- Sau đó, cấu trúc lại các thư mục code theo đúng cấu trúc route, controller,... nhưng vẫn không thể test do vấn đề cấu hình Jest với Expressjs và sqlite.

### Cách giải quyết

- Chuyển sang dùng Nestjs để cấu trúc lại project, giúp việc test dễ dàng hơn nhờ có tích hợp sẵn với Jest.
- Đồng thời sử dụng thêm Prisma để thao tác với database, giúp việc test dễ dàng hơn.

### Đề xuất

- Sử dụng Nestjs và Prisma để cấu trúc lại project, giúp việc cài đặt bộ test đơn giản hơn.
- Sử dụng Jest để viết test cho project.
- Sử dụng Github Actions để CI/CD tự động.

## Refactoring

### Các khó khăn gặp phải khi refactoring

- Vì nhận thấy cần thêm 1 page để quản lý các thông tin của trường nên đã thêm page `School` để quản lý các thông tin của trường.
- Lúc đầu do code hết trong 1 file App.tsx nên việc refactoring khá khó khăn.

### Cách giải quyết

- Tạo thêm các component nhỏ hơn sao cho phù hợp với từng page.
- Sắp xếp lại cấu trúc project, thêm các folder như `features`, `middleware`, `services`, `pages`,... để phân loại code.
- Cài đặt thêm một số thư viện hỗ trợ như `react-router`, `redux`,...
