import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Stack,
  Divider
} from "@mui/material";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#111827",
        color: "#e5e7eb",
        mt: 8,
        pt: 6,
        pb: 3,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          
          <Grid item xs={12} md={4}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <VolunteerActivismIcon sx={{ color: "#22c55e" }} />
              <Typography variant="h6" fontWeight="bold" color="#22c55e">
                PlataformaDonaciones
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Conectamos personas solidarias con causas reales. Cada donación
              genera un impacto directo y transparente.
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Plataforma
            </Typography>
            <Stack spacing={1}>
              <Link href="#" color="inherit" underline="hover">Cómo funciona</Link>
              <Link href="#" color="inherit" underline="hover">Proyectos</Link>
              <Link href="#" color="inherit" underline="hover">Transparencia</Link>
              <Link href="#" color="inherit" underline="hover">Blog</Link>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Legal
            </Typography>
            <Stack spacing={1}>
              <Link href="#" color="inherit" underline="hover">Términos</Link>
              <Link href="#" color="inherit" underline="hover">Privacidad</Link>
              <Link href="#" color="inherit" underline="hover">Cookies</Link>
            </Stack>
          </Grid>

          
        </Grid>

        <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.1)" }} />

        <Typography variant="body2" align="center" sx={{ opacity: 0.6 }}>
          © {new Date().getFullYear()} PlataformaDonaciones. Todos los derechos reservados.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
