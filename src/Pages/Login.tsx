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
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  Avatar,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

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

  const [showPass, setShowPass] = useState(false);
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

      navigate("/panel", { replace: true });
    } catch (err: any) {

      setError(err?.message ?? "No tienes permisos para acceder");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        background:
          "radial-gradient(circle at top, #e8f5e9 0%, #f8f9fa 45%, #eef7f0 100%)",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              background: "linear-gradient(90deg, #2e7d32, #43a047, #81c784)",
            }}
          />

          <Stack spacing={2} alignItems="center" sx={{ mt: 1 }}>
            {/* 💚 Avatar verde */}
            <Avatar sx={{ bgcolor: "#2e7d32", width: 46, height: 46 }}>
              <LockOutlinedIcon />
            </Avatar>

            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold">
                Iniciar sesión
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.5 }}>
                Accede para gestionar tus campañas
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 2.5 }} />

          <Box component="form" onSubmit={handleLogin} noValidate>
            <Stack spacing={2}>
              <TextField
                label="Usuario o correo"
                type="text"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Contraseña"
                type={showPass ? "text" : "password"}
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPass((p) => !p)}
                        edge="end"
                        aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {error && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  py: 1.2,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: "bold",
                  bgcolor: "#2e7d32",
                  "&:hover": { bgcolor: "#1b5e20" },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Entrar"}
              </Button>

              <Typography variant="caption" sx={{ opacity: 0.7, textAlign: "center" }}>
                Al iniciar sesión aceptas el acceso con tu cuenta registrada.
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}