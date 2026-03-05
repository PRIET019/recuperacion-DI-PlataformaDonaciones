import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";

type DecodedToken = {
  sub: string;
  rol: string;  
  iat: number;
  exp: number;
};

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);
  
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario: email, contrasena: password }),
    });



    const data = await res.json();
    const decoded: DecodedToken = jwtDecode(data.accessToken);

    // 🔐 Guardamos sesión
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("rol", decoded.rol); 

    // 🔀 Redirección según rol
    if (decoded.rol === "CREADOR") {
      navigate("/", { replace: true });
    } else {
      navigate("/", { replace: true }); // usuario normal
    }

  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};



  return (
    <Container maxWidth="sm">
      <Box
        sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Paper elevation={4} sx={{ p: 4, width: "100%" }}>
          <Typography variant="h5" align="center" gutterBottom>
            Iniciar sesión
          </Typography>

          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              label="Usuario o Correo"
              type="text"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Contraseña"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Entrar"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}