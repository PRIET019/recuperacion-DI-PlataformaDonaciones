import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Typography,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
} from '@mui/material'
import { mostrarCampanas } from '@/services/campañasServices'
import { jwtDecode } from 'jwt-decode'
import LoadingState from "@/Componentes/LoadingState"
import ErrorState from "@/Componentes/ErrorState"
import EmptyState from "@/Componentes/EmptyState"

export type Campana = {
  id: number
  nombre: string
  objetivoRecaudacion: number
  recaudado: number
  estado: 'ACTIVA' | 'FINALIZADA' | string
  fechaFinalizacion?: string | null
}

type DecodedToken = {
  sub: string
  rol: string
  iat: number
  exp: number
}

const estadoLabel = (estado: string) => {
  switch (estado) {
    case 'FINALIZADA':
      return 'Finalizada'
    case 'ACTIVA':
      return 'Activa'
    default:
      return estado || 'Desconocido'
  }
}

const estadoColor = (estado: string) => {
  switch (estado) {
    case 'FINALIZADA':
      return 'default' as const
    case 'ACTIVA':
      return 'success' as const
    default:
      return 'warning' as const
  }
}

const formatearFecha = (fecha?: string | null) => {
  if (!fecha) return 'Sin fecha'

  const d = new Date(fecha)
  if (Number.isNaN(d.getTime())) return '—'

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

const isAdmin = () => {
  const token = localStorage.getItem("token")
  if (!token) return false

  const rolLS = localStorage.getItem("rol")
  if (rolLS && rolLS.toUpperCase() === "ADMIN") return true

  try {
    const decoded: DecodedToken = jwtDecode(token)
    return (decoded.rol ?? "").toUpperCase() === "ADMIN"
  } catch {
    return false
  }
}

export default function Home() {
  const navigate = useNavigate()

  const [campanas, setCampanas] = useState<Campana[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setErrorMsg(null)

    mostrarCampanas(false)
      .then((response) => {
        if (response.ok && response.data) {
          setCampanas(response.data)
        } else if (!response.ok) {
          setErrorMsg(response.error?.message ?? 'Error al cargar campañas')
        }
      })
      .catch((err: Error) => setErrorMsg(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        bgcolor: '#f8f9faee',
        pb: 4
      }}
    >
      <Container maxWidth={false} sx={{ py: 4 }}>

        {isAdmin() && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2, mr: 15 }}>
            <Button
              variant="contained"
              onClick={() => navigate("/panel")}
              sx={{
                backgroundColor: "#16a34a",
                fontWeight: "bold",
                borderRadius: 2,
                px: 3,
                "&:hover": { backgroundColor: "#15803d" },
              }}
            >
              Ir al panel
            </Button>
          </Box>
        )}

        {loading && <LoadingState />}

        {!loading && errorMsg && <ErrorState message={errorMsg} />}

        {!loading && !errorMsg && campanas.length === 0 && (
          <EmptyState message="No hay campañas disponibles" />
        )}

        {!loading && !errorMsg && campanas.length > 0 && (
          <Grid container spacing={4} sx={{ ml: 17, mr: 15 }}>
            {campanas.map((campaña) => {
              const finalizada = campaña.estado === 'FINALIZADA'

              return (
                <Grid item xs={12} sm={6} md={4} key={campaña.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={`https://picsum.photos/seed/campana-${campaña.id}/400/200`}
                      alt={campaña.nombre}
                    />

                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1,
                          gap: 1
                        }}
                      >
                        <Typography variant="h6">
                          {campaña.nombre}
                        </Typography>

                        <Chip
                          label={estadoLabel(campaña.estado)}
                          color={estadoColor(campaña.estado)}
                          size="small"
                        />
                      </Box>

                      {finalizada && (
                        <Typography variant="body2" color="error" sx={{ mt: 1, fontWeight: 'bold' }}>
                          Esta campaña está finalizada
                        </Typography>
                      )}

                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'black' }}>
                        Objetivo: €{campaña.objetivoRecaudacion}
                      </Typography>

                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'black' }}>
                        Recaudado: €{campaña.recaudado}
                      </Typography>

                      <Typography variant="body2" sx={{ mt: 1, color: 'black' }}>
                        <b>Fecha fin:</b> {formatearFecha(campaña.fechaFinalizacion)}
                      </Typography>
                    </CardContent>

                    <CardActions>
                      <Button
                        onClick={() => {
                          const token = localStorage.getItem("token")

                          if (!token) {
                            navigate(`/campana/${campaña.id}`)
                            return
                          }

                          const decoded: DecodedToken = jwtDecode(token)

                          if (decoded.rol === "CREADOR") {
                            navigate(`/mis-campanas/${campaña.id}`)
                          } else {
                            navigate(`/campana/${campaña.id}`)
                          }
                        }}
                      >
                        Ver campaña
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        )}
      </Container>
    </Box>
  )
}