import { Box, Button, Container, Paper, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"


export default function NotFound() {
  const navigate = useNavigate()

  return (
    <Box sx={{ width: "100vw", minHeight: "100vh", bgcolor: "#f8f9faee", pb: 4 }}>

      <Container sx={{ py: 6, display: "flex", justifyContent: "center" }}>
        <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 600, width: "100%" }} elevation={6}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            404
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            Página no encontrada
          </Typography>
          <Typography sx={{ mt: 1, opacity: 0.85 }}>
            La URL a la que has entrado no existe o se ha movido.
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mt: 3, flexWrap: "wrap" }}>
            <Button variant="contained" onClick={() => navigate("/")}>
              Volver al inicio
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