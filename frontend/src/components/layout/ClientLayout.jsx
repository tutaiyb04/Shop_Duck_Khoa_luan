import { Outlet } from "react-router-dom";
import Header from "./Header";

function ClientLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

export default ClientLayout;
