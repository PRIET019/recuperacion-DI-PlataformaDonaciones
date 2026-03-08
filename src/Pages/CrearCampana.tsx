import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Container,
  TextField,
  Button,
  Typography,
  Card,
  Box,
  Alert
} from "@mui/material"


export default function CrearCampana() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("") 
  const [objetivo, setObjetivo] = useState("")
  const [fechaFin, setFechaFin] = useState("")

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const crearCampana = async () => {
    setError(null)

    
    if (!nombre || !descripcion || !objetivo) {
      setError("Completa los campos obligatorios: Nombre, Descripción y Objetivo")
      return
    }

    const objetivoNum = Number(objetivo)
    if (!objetivoNum || objetivoNum <= 0) {
      setError("El objetivo debe ser un número mayor que 0")
      return
    }

    try {
      setLoading(true)

      const res = await fetch("/api/campanas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          nombre,
          descripcion, 
          objetivoRecaudacion: objetivoNum,
          fechaFinalizacion: fechaFin || null
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.mensaje || "Error creando campaña")
      }

      navigate(`/mis-campanas/${data.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ width: "100vw", bgcolor: "#f8f9faee" }}>

      <Container sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 3, color: 'black' }}>
          Crear campaña
        </Typography>

        <Card sx={{ p: 3 }}>
          <TextField
            label="Nombre de la campaña"
            fullWidth
            sx={{ mb: 2 }}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <TextField
            label="Descripción"
            multiline
            rows={4}
            fullWidth
            sx={{ mb: 2 }}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />

          <TextField
            label="Objetivo de recaudación (€)"
            type="number"
            fullWidth
            sx={{ mb: 2 }}
            value={objetivo}
            onChange={(e) => setObjetivo(e.target.value)}
          />

          <TextField
            label="Fecha de finalización"
            type="date"
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />

          <Button variant="contained" onClick={crearCampana} disabled={loading}>
            Confirmar
          </Button>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Card>
      </Container>

    </Box>
  )
}