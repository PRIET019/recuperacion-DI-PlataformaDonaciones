import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Card,
  TextField,
  Button,
  Alert,
  Box,
} from "@mui/material";
import Header from "@/Componentes/Header";
import Footer from "@/Componentes/Footer";

export default function CampanaPublica() {
  const { id } = useParams();
  const [campana, setCampana] = useState<any>(null);
  const [importe, setImporte] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/public/campanas/${id}`)
      .then((r) => r.json())
      .then(setCampana)
      .catch(() => setError("Error cargando campaña"));
  }, [id]);

  const donar = async () => {
    setError("");
    setOkMsg("");

    const cantidad = Number(importe);

    // ✅ Validación
    if (!cantidad || cantidad <= 0) {
      setError("Introduce un importe válido");
      return;
    }

    const res = await fetch(`/api/public/campanas/${id}/donaciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ importe: cantidad, mensaje }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.mensaje);
      return;
    }

    setCampana((prev: any) => ({
      ...prev,
      recaudado: prev.recaudado + cantidad,
    }));

    setOkMsg("¡Gracias por tu donación!");
    setImporte("");
    setMensaje("");
  };

  if (!campana) return <Typography>Cargando...</Typography>;

  return (
    <Box sx={{ width: "100vw", bgcolor: "background.default" }}>
      <Header />

      <Container sx={{ py: 4 }}>
        <Typography variant="h4">{campana.name}</Typography>

        <Typography sx={{ fontWeight: "bold", color: "black" }}>
          Objetivo: €{campana.objetivoRecaudacion}
        </Typography>

        <Typography sx={{ fontWeight: "bold", color: "black" }}>
          Recaudado: €{campana.recaudado}
        </Typography>

        <Card sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6">Hacer donación</Typography>

          <TextField
            label="Importe (€)"
            type="number"
            fullWidth
            sx={{ my: 2 }}
            value={importe}
            onChange={(e) => setImporte(e.target.value)}
          />

          <TextField
            label="Mensaje (opcional)"
            fullWidth
            sx={{ mb: 2 }}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
          />

          <Button variant="contained" onClick={donar}>
            Donar
          </Button>

          {okMsg && <Alert severity="success" sx={{ mt: 2 }}>{okMsg}</Alert>}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Card>
      </Container>

      <Footer />
    </Box>
  );
}
