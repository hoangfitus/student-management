import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { AppBar, Container, Fab, Toolbar } from "@mui/material";
import { BackToTop, Footer, Header } from "@app/components";
import { Outlet } from "react-router";

export const Layout: React.FC = () => {
  return (
    <Container>
      <AppBar>
        <Header />
      </AppBar>
      <Toolbar id="back-to-top-anchor" />
      <main style={{ marginTop: 44, width: "100%" }}>
        <Outlet />
      </main>
      <Footer />
      <BackToTop>
        <Fab size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </BackToTop>
    </Container>
  );
};
