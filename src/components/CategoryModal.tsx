// src/components/CategoryModal.tsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import type { Category } from "../types.d";

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  title: string; // Ví dụ: "Khoa", "Tình trạng sinh viên", "Chương trình đào tạo"
  items?: Category[];
  onAdd: (newValue: string) => Promise<void> | void;
  onEdit: (id: number, newValue: string) => Promise<void> | void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  open,
  onClose,
  title,
  items,
  onAdd,
  onEdit,
}) => {
  const [newValue, setNewValue] = useState("");
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  // Reset trạng thái chỉnh sửa khi modal đóng
  useEffect(() => {
    if (!open) {
      setEditingItemId(null);
      setEditingValue("");
      setNewValue("");
    }
  }, [open]);

  const handleAdd = () => {
    if (newValue.trim() !== "") {
      onAdd(newValue.trim());
      setNewValue("");
    }
  };

  const startEditing = (id: number, currentValue: string) => {
    setEditingItemId(id);
    setEditingValue(currentValue);
  };

  const handleSaveEdit = () => {
    if (editingItemId !== null && editingValue.trim() !== "") {
      onEdit(editingItemId, editingValue.trim());
      setEditingItemId(null);
      setEditingValue("");
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingValue("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Quản lý {title}</DialogTitle>
      <DialogContent>
        {/* Phần thêm mới */}
        <Box display="flex" alignItems="center" mb={2} p={2}>
          <TextField
            label={`Thêm ${title}`}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAdd}
            sx={{ ml: 2 }}
          >
            Thêm
          </Button>
        </Box>
        {/* Danh sách các mục */}
        <List>
          {items?.map((item) =>
            editingItemId === item.id ? (
              <ListItem key={item.id}>
                <Box sx={{ width: "100%" }} display={"flex"}>
                  <TextField
                    value={editingValue}
                    sx={{ flex: 1 }}
                    onChange={(e) => setEditingValue(e.target.value)}
                  />
                  <Button onClick={handleSaveEdit} color="primary">
                    Lưu
                  </Button>
                  <Button onClick={handleCancelEdit} color="error">
                    Hủy
                  </Button>
                </Box>
              </ListItem>
            ) : (
              <ListItem
                key={item.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => startEditing(item.id, item.name)}
                  >
                    <EditIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={item.name} />
              </ListItem>
            )
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};
