// Helper function to format a date value to "dd/mm/yyyy"
export function formatDateForCSV(value: string | number | Date): string {
  let d: Date;
  if (typeof value === "number") {
    // Convert Excel serial date to JavaScript Date
    d = new Date((value - 25569) * 86400 * 1000);
  } else if (typeof value === "string") {
    // Try to parse the string as a date
    d = new Date(value);
  } else if (value instanceof Date) {
    d = value;
  } else {
    return "";
  }
  if (isNaN(d.getTime())) {
    return String(value);
  }
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
