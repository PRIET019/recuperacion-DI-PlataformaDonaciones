import { useEffect, useMemo, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Alert
} from "@mui/material"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

import LoadingState from "@/Componentes/LoadingState"
import ErrorState from "@/Componentes/ErrorState"
import EmptyState from "@/Componentes/EmptyState"

type Metricas = {
  totalRecaudado: number
  numeroDonaciones: number
  donacionMedia: number
  estado: "ACTIVA" | "FINALIZADA" | string
}

type DonacionesDia = {
  fecha: string
  totalRecaudado: number
  numeroDonaciones: number
}

export default function CampanaCreador() {
  const { id } = useParams()
  const token = localStorage.getItem("token")
  const navigate = useNavigate()

  const [metricas, setMetricas] = useState<Metricas | null>(null)
  const [donacionesDia, setDonacionesDia] = useState<DonacionesDia[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)

  const finalizada = useMemo(() => metricas?.estado === "FINALIZADA", [metricas])

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)
        setError(null)
        setOkMsg(null)

        const [metricasRes, donacionesRes] = await Promise.all([
          fetch(`/api/campanas/${id}/metricas`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/campanas/${id}/donaciones-por-dia`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (!metricasRes.ok || !donacionesRes.ok) {
          throw new Error("Error al cargar datos de la campaña")
        }

        const metricasData = await metricasRes.json()
        const donacionesData = await donacionesRes.json()

        setMetricas(metricasData)
        setDonacionesDia(donacionesData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [id, token])

  const finalizarCampana = async () => {
    try {
      setOkMsg(null)
      setError(null)

      const res = await fetch(`/api/campanas/${id}/finalizar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        throw new Error("No se pudo finalizar la campaña, ya esta finalizada")
      }

      setMetricas((prev) => prev ? ({ ...prev, estado: "FINALIZADA" }) : prev)

      setOkMsg("Campaña finalizada correctamente ")
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />
  if (!metricas) return <EmptyState message="No hay métricas disponibles" />

  return (
    <>

      <Box sx={{ width: '100vw', bgcolor: '#f8f9faee' }}>
        <Container sx={{ py: 4 }}>
          <Typography variant="h4" sx={{ color: 'black' }}>
            Panel de campaña
          </Typography>

          <Box sx={{ display: "flex", gap: 2, my: 2, flexWrap: "wrap" }}>
            <Button variant="contained" onClick={() => navigate("/crear-campana")}>
              Crear campaña
            </Button>

            <Button variant="outlined" onClick={() => navigate(`/editar-campana/${id}`)}>
              Editar campaña
            </Button>

            <Button
              color="error"
              variant="contained"
              onClick={finalizarCampana}
              disabled={finalizada}
            >
              {finalizada ? "Campaña finalizada" : "Finalizar campaña"}
            </Button>
          </Box>

          {okMsg && <Alert severity="success" sx={{ mb: 2 }}>{okMsg}</Alert>}
          {metricas.estado === "FINALIZADA" && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Esta campaña está marcada como FINALIZADA.
            </Alert>
          )}

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

      </Box>
    </>
  )
}