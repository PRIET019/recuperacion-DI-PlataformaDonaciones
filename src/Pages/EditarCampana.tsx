import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Container,
  TextField,
  Button,
  Typography,
  Card,
  Box,
  Alert
} from "@mui/material"
import LoadingState from "@/Componentes/LoadingState"
import ErrorState from "@/Componentes/ErrorState"


type CampanaEdit = {
  id: number
  nombre: string
  descripcion?: string | null
  objetivoRecaudacion: number
  fechaFinalizacion?: string | null
}

export default function EditarCampana() {
  
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const [nombre, setNombre] = useState("")
  const [objetivo, setObjetivo] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [descripcion, setDescripcion] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarCampana = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/campanas/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!res.ok) throw new Error("error cargando campaña")

        const data: CampanaEdit = await res.json()

        setNombre(data.nombre ?? "")
        setObjetivo(String(data.objetivoRecaudacion ?? ""))
        setFechaFin(data.fechaFinalizacion ?? "")

        setDescripcion(data.descripcion ?? "")
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    cargarCampana()
  }, [id, token])

  const guardarCambios = async () => {
    setError(null)

    if (!nombre || !objetivo) {
      setError("completa los campos obligatorios: nombre y objetivo")
      return
    }

    const objetivoNum = Number(objetivo)
    if (!objetivoNum || objetivoNum <= 0) {
      setError("El objetivo debe ser un número mayor que 0")
      return
    }

    try {
      const res = await fetch(`/api/campanas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          nombre,
          descripcion: descripcion ?? "",
          objetivoRecaudacion: objetivoNum,
          fechaFinalizacion: fechaFin || null
        })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.mensaje || "error actualizando campaña")

      navigate(`/mis-campanas/${id}`)
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  return (
    <Box sx={{ width: "100vw", bgcolor: "#f8f9faee" }}>

      <Container sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 3, color: 'black'}} >
          Editar campaña
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
            label="objetivo de recaudacion (€)"
            type="number"
            fullWidth
            sx={{ mb: 2 }}
            value={objetivo}
            onChange={(e) => setObjetivo(e.target.value)}
          />

          <TextField
            label="fecha de finalizacion"
            type="date"
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />

          <Button variant="contained" onClick={guardarCambios}>
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