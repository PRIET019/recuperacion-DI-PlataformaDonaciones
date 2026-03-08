import { Outlet } from "react-router-dom"
import { Box } from "@mui/material"
import Header from "@/Componentes/Header"
import Footer from "@/Componentes/Footer"

export default function PublicLayout() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        bgcolor: "#f8f9faee",
      }}
    >

    <Header/>

      <Box sx={{ flex: 1 }}><Outlet /></Box>
      <Box sx={{ mt: "auto" }}><Footer /></Box>
    </Box>
  )
}