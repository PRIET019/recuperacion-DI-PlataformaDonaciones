import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import Header from "@/Componentes/Header";
import Footer from "@/Componentes/Footer";

export default function CampanaCreador() {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [metricas, setMetricas] = useState(null);
  const [donacionesDia, setDonacionesDia] = useState([]);

  useEffect(() => {
    fetch(`/api/campanas/${id}/metricas`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then(setMetricas);

    fetch(`/api/campanas/${id}/donaciones-por-dia`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then(setDonacionesDia);
  }, [id, token]);

  if (!metricas) return <Typography>Cargando métricas...</Typography>;

  return (

    <>
<Header/>

<Box  
sx={{
        width: '100vw',
        bgcolor: 'background.default',
      }}>
    <Container sx={{ py: 4 }}>
      <Typography variant="h4">Panel de campaña</Typography>

      <Grid container spacing={2} sx={{ my: 3 }}>
        <Grid item xs={12} md={4}>
          <Card><CardContent>
            <Typography>Total recaudado</Typography>
            <Typography variant="h5">€{metricas.totalRecaudado}</Typography>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card><CardContent>
            <Typography>Nº donaciones</Typography>
            <Typography variant="h5">{metricas.numeroDonaciones}</Typography>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card><CardContent>
            <Typography>Donación media</Typography>
            <Typography variant="h5">€{metricas.donacionMedia}</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6">Donaciones por día</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={donacionesDia}>
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="totalRecaudado" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card sx={{ p: 3 }}>
        <Typography variant="h6">Donaciones por día (cantidad)</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={donacionesDia}>
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="numeroDonaciones" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </Container>


<Footer/>

    </Box>


    </>
  );
}
