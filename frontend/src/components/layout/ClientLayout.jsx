import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

function ClientLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default ClientLayout;
