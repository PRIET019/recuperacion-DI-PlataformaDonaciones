import { useEffect, useState, useMemo } from "react"
import { useParams } from "react-router-dom"
import {
  Container,
  Typography,
  Card,
  TextField,
  Button,
  Alert,
  Box,
  MenuItem
} from "@mui/material"

import LoadingState from "@/Componentes/LoadingState"
import ErrorState from "@/Componentes/ErrorState"
import EmptyState from "@/Componentes/EmptyState"

type CampanaPublicaType = {
  id: number
  nombre: string
  objetivoRecaudacion: number
  recaudado: number
  estado: "ACTIVA" | "FINALIZADA" | string
  fechaFinalizacion?: string | null
}

export default function CampanaPublica() {
  const { id } = useParams()

  const [campana, setCampana] = useState<CampanaPublicaType | null>(null)
  const [loading, setLoading] = useState(true)

  const [pageError, setPageError] = useState<string | null>(null)

  const [importe, setImporte] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [metodoPago, setMetodoPago] = useState("")

  const [formError, setFormError] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)

  const finalizada = useMemo(() => campana?.estado === "FINALIZADA", [campana])

  useEffect(() => {
    const cargarCampana = async () => {
      try {
        setLoading(true)
        setPageError(null)

        const res = await fetch(`/api/public/campanas/${id}`)
        if (!res.ok) throw new Error("No se pudo cargar la campaña")

        const data = await res.json()
        setCampana(data)
      } catch (err: any) {
        setPageError(err.message ?? "Error cargando campaña")
      } finally {
        setLoading(false)
      }
    }

    cargarCampana()
  }, [id])

  const donar = async () => {
    if (!campana) return

    setFormError(null)
    setOkMsg(null)

    if (finalizada) {
      setFormError("Esta campaña está finalizada. No admite más donaciones.")
      return
    }

    const cantidad = Number(importe)
    if (!cantidad || cantidad <= 0) {
      setFormError("Introduce un importe válido")
      return
    }

    if (email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!regex.test(email)) {
        setFormError("Email no válido")
        return
      }
    }

    if (!metodoPago) {
      setFormError("Selecciona un método de pago")
      return
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
    })

    if (!res.ok) {
      let msg = "No se pudo realizar la donación"
      try {
        const data = await res.json()
        msg = data.mensaje ?? msg
      } catch { /* empty */ }
      setFormError(msg)
      return
    }

    setCampana(prev => prev ? ({ ...prev, recaudado: prev.recaudado + cantidad }) : prev)

    setOkMsg("¡Gracias por tu donación!")
    setImporte("")
    setMensaje("")
    setNombre("")
    setEmail("")
    setMetodoPago("")
  }

  if (loading) return <LoadingState />
  if (pageError) return <ErrorState message={pageError} />
  if (!campana) return <EmptyState message="Campaña no encontrada" />

  return (
    <Box sx={{ width: "100vw", bgcolor: '#f8f9faee' }}>

      <Container sx={{ py: 4 }}>
        <Typography variant="h4">{campana.nombre}</Typography>

        <Typography sx={{ fontWeight: "bold", color: "black" }}>
          Estado: {campana.estado}
        </Typography>

        <Typography sx={{ fontWeight: "bold", color: "black" }}>
          Objetivo: €{campana.objetivoRecaudacion}
        </Typography>

        <Typography sx={{ fontWeight: "bold", color: "black" }}>
          Recaudado: €{campana.recaudado}
        </Typography>

        {finalizada && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Esta campaña está finalizada y no admite nuevas donaciones.
          </Alert>
        )}

        <Card sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6">Hacer donación</Typography>

          <TextField
            label="Importe (€)"
            type="number"
            fullWidth
            sx={{ my: 2 }}
            value={importe}
            onChange={(e) => setImporte(e.target.value)}
            disabled={finalizada}
          />

          <TextField
            label="Nombre del donante (opcional)"
            fullWidth
            sx={{ mb: 2 }}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={finalizada}
          />

          <TextField
            label="Email del donante"
            fullWidth
            sx={{ mb: 2 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={finalizada}
          />

          <TextField
            select
            label="Método de pago"
            fullWidth
            sx={{ mb: 2 }}
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            disabled={finalizada}
          >
            <MenuItem value="tarjeta">BIZUM</MenuItem>
            <MenuItem value="paypal">EFECTIVO</MenuItem>
            <MenuItem value="transferencia">TRANSFERENCIA</MenuItem>
          </TextField>

          <TextField
            label="Mensaje (opcional)"
            fullWidth
            sx={{ mb: 2 }}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            disabled={finalizada}
          />

          <Button variant="contained" onClick={donar} disabled={finalizada}>
            Donar
          </Button>

          {okMsg && <Alert severity="success" sx={{ mt: 2 }}>{okMsg}</Alert>}
          {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
        </Card>
      </Container>

    </Box>
  )
}
