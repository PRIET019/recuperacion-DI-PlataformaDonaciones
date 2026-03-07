import { createBrowserRouter } from "react-router-dom";
import Home from "../Pages/Home";
import CampanaPublica from "@/Pages/CampanaPublica";
import CampanaCreador from "@/Pages/CampanaCreador";
import Login from "@/Pages/Login";
import PrivateRouter from "@/Componentes/PrivateRouter";
import Preferencias from "../Pages/Preferencias";

export const router = createBrowserRouter([

  
  { path: "/", element: <Home /> },
  { path: "/campana/:id", element: <CampanaPublica />},
  {path: "/mis-campanas/:id",element: (<PrivateRouter> <CampanaCreador/> </PrivateRouter>),},
  { path: "/login", element: <Login /> },
  {path: "/preferencias", element: <Preferencias/>}

]);
