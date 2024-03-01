import { Login } from "./pages/login/Login";
import { Register } from "./pages/register/Register";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import LeftBar from "./components/leftBar/LeftBar";
import RightBar from "./components/rightBar/RightBar";
import { Home } from "./pages/home/Home";
import Profile from "./pages/profile/Profile";
import Chat from "./pages/chat/Chat";
import "./style.scss";
import { useContext, useEffect, useState } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/authContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Datatable from "../src/components/datatable/Datatable";
import User from "./pages/admin/user/User";

function App() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);
  const [isChatPage, setIsChatPage] = useState(() => {
    const savedIsChatPage = localStorage.getItem("isChatPage");
    return savedIsChatPage ? JSON.parse(savedIsChatPage) : false;
  });
  const queryClient = new QueryClient();

  useEffect(() => {
    console.log("currentUser has changed:", currentUser);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("isChatPage", JSON.stringify(isChatPage));
  }, [isChatPage]);

  const Layout = () => {
    return (
      <QueryClientProvider client={queryClient}>
        <div className={`theme-${darkMode ? "dark" : "light"}`}>
          <Navbar isChatPage={isChatPage} setIsChatPage={setIsChatPage} />
          <div style={{ display: "flex" }}>
            <LeftBar
              currentUser={currentUser}
              isChatPage={isChatPage}
              setIsChatPage={setIsChatPage}
            />
            <div style={{ flex: 6 }}>
              <Outlet />
            </div>
            {!isChatPage && <RightBar />}
          </div>
        </div>
      </QueryClientProvider>
    );
  };

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }

    return children;
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/profile/:id",
          element: <Profile />,
        },
        {
          path: "/chat",
          element: <Chat />,
        },
        {
          path: "/admin/data",
          element: <Datatable />,
        },
        {
          path: "/admin/editU/:id",
          element: <User />,
        },
      ],
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
  ]);

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
