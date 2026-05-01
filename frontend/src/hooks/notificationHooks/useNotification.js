import { useContext } from "react";
import { NotificationContext } from "@/context/NotificationContext";

function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (ctx == null) {
    throw new Error(
      "useNotifications phải được dùng bên trong <NotificationProvider>.",
    );
  }
  return ctx;
}

export default useNotifications;
export { useNotifications };
