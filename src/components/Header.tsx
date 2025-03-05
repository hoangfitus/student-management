import { useGetConfigQuery } from "@app/services/config";

export const Header: React.FC = () => {
  const { data: config } = useGetConfigQuery();
  const schoolName = config?.find((item) => item.name === "school_name")?.value;
  const schoolImage = config?.find(
    (item) => item.name === "school_image"
  )?.value;
  const schoolBannerColor = config?.find(
    (item) => item.name === "school_banner_color"
  )?.value;
  return (
    <header
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: schoolBannerColor,
        width: "100vw",
        height: "100px",
      }}
    >
      <img
        style={{ marginRight: "4rem", maxHeight: "100px" }}
        src={schoolImage}
        alt={schoolName + " logo"}
      />
      <h1 style={{ color: "white" }}>Trường {schoolName}</h1>
    </header>
  );
};
