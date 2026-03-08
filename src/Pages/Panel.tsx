import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

import LoadingState from "@/Componentes/LoadingState"
import ErrorState from "@/Componentes/ErrorState"
import EmptyState from "@/Componentes/EmptyState"

type ResumenMetricas = {
  totalRecaudado: number
  numeroDonaciones: number
  donacionMedia: number
  numeroCampanasActivas: number
}

type DonacionDia = {
  fecha: string
  totalRecaudado: number
  numeroDonaciones: number
}

type TopCampana = {
  idCampana: string
  nombreCampana: string
  totalRecaudado: number
  numeroDonaciones: number
}

export default function Panel() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const [resumen, setResumen] = useState<ResumenMetricas | null>(null)
  const [serie, setSerie] = useState<DonacionDia[]>([])
  const [top, setTop] = useState<TopCampana[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarDatos = async () => {
    try {
      setLoading(true)
      setError(null)

      const [resResumen, resSerie, resTop] = await Promise.all([
        fetch("/api/metricas/resumen", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/metricas/donaciones-por-dia", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/metricas/top-campanas?limite=5", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (!resResumen.ok || !resSerie.ok || !resTop.ok) {
        throw new Error("Error al cargar las métricas del panel")
      }

      const resumenData = await resResumen.json()
      const serieData = await resSerie.json()
      const topData = await resTop.json()

      setResumen(resumenData)
      setSerie(Array.isArray(serieData) ? serieData : [])
      setTop(Array.isArray(topData) ? topData : [])
    } catch (err: any) {
      setError(err.message ?? "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />
  if (!resumen) return <EmptyState message="No hay métricas disponibles" />

  return (
    <Box sx={{ width: "100%" }}>
      <Container sx={{ py: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, gap: 2, flexWrap: "wrap" }}>
          <Typography variant="h4" fontWeight="bold" color="black">
            Panel de métricas
          </Typography>

          <Button variant="outlined" onClick={cargarDatos}>
            Reintentar
          </Button>
        </Box>

        {/* KPIs */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2">Total recaudado</Typography>
                <Typography variant="h5" fontWeight="bold">€{resumen.totalRecaudado}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2">Número de donaciones</Typography>
                <Typography variant="h5" fontWeight="bold">{resumen.numeroDonaciones}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2">Donación media</Typography>
                <Typography variant="h5" fontWeight="bold">€{resumen.donacionMedia}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2">Campañas activas</Typography>
                <Typography variant="h5" fontWeight="bold">{resumen.numeroCampanasActivas}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Gráfica donaciones por día */}
        <Card sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
            Donaciones por día (recaudación)
          </Typography>

          {serie.length === 0 ? (
            <EmptyState message="No hay datos para la gráfica" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={serie}>
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="totalRecaudado" stroke="#16a34a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Top campañas */}
        <Card sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
            Top campañas
          </Typography>

          {top.length === 0 ? (
            <EmptyState message="No hay campañas en el ranking" />
          ) : (
            <Box sx={{ width: "100%", overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><b>Campaña</b></TableCell>
                    <TableCell><b>Total recaudado</b></TableCell>
                    <TableCell><b>Nº donaciones</b></TableCell>
                    <TableCell align="right"><b>Acción</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {top.map((c) => (
                    <TableRow key={c.idCampana}>
                      <TableCell>{c.nombreCampana}</TableCell>
                      <TableCell>€{c.totalRecaudado}</TableCell>
                      <TableCell>{c.numeroDonaciones}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="contained"
                          sx={{ bgcolor: "#16a34a", "&:hover": { bgcolor: "#15803d" } }}
                          onClick={() => navigate(`/mis-campanas/${c.idCampana}`)}
                        >
                          Ver campaña
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </Card>
      </Container>
    </Box>
  )
}