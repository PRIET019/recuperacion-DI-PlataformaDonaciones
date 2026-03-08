import { createBrowserRouter } from "react-router-dom"
import PublicLayout from "@/Layouts/PublicLayout"
import PrivateLayout from "@/Layouts/PrivateLayout"
import Home from "@/Pages/Home"
import CampanaPublica from "@/Pages/CampanaPublica"
import CampanaCreador from "@/Pages/CampanaCreador"
import Login from "@/Pages/Login"
import CrearCampana from "@/Pages/CrearCampana"
import EditarCampana from "@/Pages/EditarCampana"
import Unauthorized from "@/Pages/Unauthorized"
import NotFound from "@/Pages/NotFound"
import Panel from "@/Pages/Panel"


export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/campana/:id", element: <CampanaPublica /> },
      { path: "/login", element: <Login /> },
      { path: "/unauthorized", element: <Unauthorized /> },
    ],
  },

  {
    element: <PrivateLayout />,
    children: [
      { path: "/panel", element: <Panel /> },

      { path: "/mis-campanas/:id", element: <CampanaCreador /> },
      { path: "/crear-campana", element: <CrearCampana /> },
      { path: "/editar-campana/:id", element: <EditarCampana /> },

    ],
  },

  { path: "*", element: <NotFound /> },
])
