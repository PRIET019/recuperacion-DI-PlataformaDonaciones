import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Stack
} from "@mui/material"
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism"
import { useNavigate } from "react-router-dom"
import BackButton from "@/Componentes/BotonVolver"   

export default function Header() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("rol") 
    navigate("/")
  }

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        backgroundColor: "#ffffff",
        color: "#1f2937",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <Toolbar sx={{ maxWidth: 1200, width: "100%", mx: "auto" }}>

        <BackButton hideOnPaths={["/", "/login"]} fallbackTo="/" />

        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          <VolunteerActivismIcon sx={{ color: "#16a34a", mr: 1 }} />
          <Typography
            variant="h6"
            fontWeight="bold"
            color="#16a34a"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            Plataforma Donaciones
          </Typography>
        </Box>

        <Stack direction="row" spacing={3} sx={{ mr: 3 }}>
          <Button color="inherit" href="#como-funciona">Cómo funciona</Button>
          <Button color="inherit" href="#proyectos">Proyectos</Button>
          <Button color="inherit" href="#transparencia">Transparencia</Button>
          <Button color="inherit" href="#contacto">Contacto</Button>
        </Stack>

        {token ? (
          <Button
            variant="outlined"
            color="success"
            onClick={handleLogout}
            sx={{ fontWeight: "bold", borderRadius: 2, px: 3 }}
          >
            Cerrar sesión
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={() => navigate("/login")}
            sx={{
              backgroundColor: "#16a34a",
              fontWeight: "bold",
              borderRadius: 2,
              px: 3,
              "&:hover": { backgroundColor: "#15803d" },
            }}
          >
            Iniciar sesión
          </Button>
        )}
      </Toolbar>
    </AppBar>
  )
}