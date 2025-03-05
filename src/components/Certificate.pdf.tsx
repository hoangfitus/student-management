import { Student } from "@app/types";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({ family: "Times-New-Roman", src: "/times.ttf" });

const styles = StyleSheet.create({
  page: {
    fontFamily: "Times-New-Roman",
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },
  content: {
    margin: 20,
  },
  subContent: {
    marginBottom: 10,
  },
  subContentContent: {
    paddingLeft: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  header: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
  },
  value: {
    fontSize: 12,
  },
  signature: {
    fontSize: 12,
  },
  signatureContent: {
    marginTop: 10,
    alignItems: "flex-end",
    textAlign: "center",
  },
  signatureContentHeader: {
    fontSize: 12,
    fontWeight: "bold",
  },
});

interface CertificatePDFProps {
  student: Student;
  school: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  from: string;
  to: string;
  reason: string;
}

export const CertificatePDF: React.FC<CertificatePDFProps> = ({
  student,
  school,
  from,
  to,
  reason,
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.title}>GIẤY XÁC NHẬN TÌNH TRẠNG SINH VIÊN</Text>
          <View style={styles.content}>
            <Text style={styles.header}>Trường {school.name} xác nhận:</Text>
            <View style={styles.subContent}>
              <Text style={styles.subHeader}>1. Thông tin sinh viên:</Text>
              <View style={styles.subContentContent}>
                <Text style={styles.value}>
                  <Text style={styles.label}>Họ và tên:</Text> {student.name}
                </Text>
                <Text style={styles.value}>
                  <Text style={styles.label}>Mã số sinh viên:</Text>{" "}
                  {student.mssv}
                </Text>
                <Text style={styles.value}>
                  <Text style={styles.label}>Ngày sinh:</Text> {student.dob}
                </Text>
                <Text style={styles.value}>
                  <Text style={styles.label}>Giới tính:</Text> {student.gender}
                </Text>
                <Text style={styles.value}>
                  <Text style={styles.label}>Khoa:</Text> {student.faculty}
                </Text>
                <Text style={styles.value}>
                  <Text style={styles.label}>Chương trình đào tạo:</Text>{" "}
                  {student.program}
                </Text>
                <Text style={styles.value}>
                  <Text style={styles.label}>Khóa:</Text> K{student.course}
                </Text>
              </View>
            </View>

            <View style={styles.subContent}>
              <Text style={styles.subHeader}>
                2. Tình trạng sinh viên hiện tại:
              </Text>
              <View style={styles.subContentContent}>
                <Text style={styles.value}>{student.status}</Text>
              </View>
            </View>

            <View style={styles.subContent}>
              <Text style={styles.subHeader}>3. Mục đích xác nhận:</Text>
              <View style={styles.subContentContent}>
                <Text style={styles.value}>{reason}</Text>
              </View>
            </View>

            <View style={styles.subContent}>
              <Text style={styles.subHeader}>4. Thời gian cấp giấy:</Text>
              <View style={styles.subContentContent}>
                <Text style={styles.value}>
                  Giấy xác nhận có hiệu lực đến ngày: {to}
                </Text>
              </View>
            </View>

            <View style={styles.signatureContent}>
              <Text style={styles.subHeader}>
                Xác nhận của Trường {school.name}
              </Text>
              <View style={styles.subContentContent}>
                <Text style={styles.value}>Ngày cấp: {from}</Text>
              </View>
              <View style={styles.signatureContentHeader}>
                <Text>Trưởng Phòng Đào Tạo</Text>
              </View>
              <Text style={styles.signature}>
                (Ký, ghi rõ họ tên, đóng dấu)
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
