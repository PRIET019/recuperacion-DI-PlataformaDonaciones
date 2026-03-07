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


//Mejorar pagina login, login tengo q ponerlo en medio, boton para volver
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

    if (res.status === 401) {
      throw new Error("Usuario o contraseña incorrectos");
    }

    if (res.status === 403) {
      throw new Error("No tienes permisos para acceder");
    }

      if (!res.ok) {
      throw new Error("Error inesperado al iniciar sesión");
    }

      const data = await res.json();

      if (!data.accessToken) {
        throw new Error("No tienes permisos para acceder");
      }

      const decoded: DecodedToken = jwtDecode(data.accessToken);

      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("rol", decoded.rol);

      navigate("/", { replace: true });

    } catch (err: any) {
      setError("No tienes permisos para acceder");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper elevation={4} sx={{ p: 4, width: "100%", borderRadius: 2 }}>
          <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
            Iniciar sesión
          </Typography>

          <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 2 }}>
            <TextField
              label="Usuario o Correo"
              type="text"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
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

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3, py: 1.2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Entrar"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}