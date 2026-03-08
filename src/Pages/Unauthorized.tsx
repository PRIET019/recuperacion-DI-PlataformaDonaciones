import { Box, Button, Container, Paper, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"


export default function Unauthorized() {
  const navigate = useNavigate()

  return (
    <Box sx={{ width: "100vw", minHeight: "100vh", bgcolor: "#f8f9faee", pb: 4 }}>

      <Container sx={{ py: 6, display: "flex", justifyContent: "center" }}>
        <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 600, width: "100%" }} elevation={6}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Acceso denegado
          </Typography>
          <Typography sx={{ opacity: 0.85 }}>
            No tienes permisos para acceder a esta página.
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mt: 3, flexWrap: "wrap" }}>
            <Button variant="contained" onClick={() => navigate("/")}>
              Ir al inicio
            </Button>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Volver atrás
            </Button>
          </Box>
        </Paper>
      </Container>

    </Box>
  )
}