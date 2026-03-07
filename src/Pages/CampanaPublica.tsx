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
  MenuItem
} from "@mui/material";
import Header from "@/Componentes/Header";
import Footer from "@/Componentes/Footer";

export default function CampanaPublica() {
  const { id } = useParams();
  const [campana, setCampana] = useState<any>(null);
  const [importe, setImporte] = useState("");
  const [mensaje, setMensaje] = useState("");

  // NUEVOS CAMPOS
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [metodoPago, setMetodoPago] = useState("");

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

    // validar importe
    if (!cantidad || cantidad <= 0) {
      setError("Introduce un importe válido");
      return;
    }

    // validar email si existe
    if (email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(email)) {
        setError("Email no válido");
        return;
      }
    }

    // validar metodo de pago
    if (!metodoPago) {
      setError("Selecciona un método de pago");
      return;
    }

    const res = await fetch(`/api/public/campanas/${id}/donaciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        importe: cantidad,
        mensaje,
        nombreDonante: nombre,
        emailDonante: email,
        metodoPago
      }),
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
    setNombre("");
    setEmail("");
    setMetodoPago("");
  };

  if (!campana) return <Typography>Cargando...</Typography>;

  return (
    <Box sx={{ width: "100vw",
      bgcolor: '#f8f9faee' 
     }}>
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
            label="Nombre del donante (opcional)"
            fullWidth
            sx={{ mb: 2 }}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <TextField
            label="Email del donante"
            fullWidth
            sx={{ mb: 2 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            select
            label="Método de pago"
            fullWidth
            sx={{ mb: 2 }}
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
          >
            <MenuItem value="tarjeta">Tarjeta</MenuItem>
            <MenuItem value="paypal">PayPal</MenuItem>
            <MenuItem value="transferencia">Transferencia</MenuItem>
          </TextField>

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

          {okMsg && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {okMsg}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Card>
      </Container>

      <Footer />
    </Box>
  );
}