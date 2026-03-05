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
import Header from '@/Componentes/Header'
import Footer from '@/Componentes/Footer'
import { jwtDecode } from 'jwt-decode'

export type Campana = {
  id: number
  nombre: string
  objetivoRecaudacion: number
  recaudado: number
  estado: string
  fechaFinalizacion?: string
}

type DecodedToken = {
  sub: string;
  rol: string;
  iat: number;
  exp: number;
};




export default function Home() {
  const navigate = useNavigate()

  const [campanas, setCampanas] = useState<Campana[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    mostrarCampanas(true)
      .then((response) => {
        if (response.ok && response.data) {
          setCampanas(response.data)
        } else if (!response.ok) {
          setErrorMsg(response.error?.message ?? 'Error al cargar campañas')
        }
      })
      .catch((err: Error) => {
        setErrorMsg(err.message)
      })
  }, [])

  return (
    <Box
        sx={{

          width: '100vw',
        bgcolor: 'background.default',
        
      }}
    >
      <Header/>

      <Container maxWidth={false} sx={{ py: 4 }}>
        {errorMsg && (
          <Typography color="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Typography>
        )}

        <Grid container spacing={4} item sx={{ml: 17, mr: 15}} >
          {campanas.map((campaña) => {

            return (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={campaña.id}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
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
    }}
  >
    <Typography variant="h6">
      {campaña.nombre}
    </Typography>

    <Chip
      label={
        campaña.estado === 'ACTIVA'
          ? 'Activa'
          : 'Finalizada'
      }
      color={
        campaña.estado === 'ACTIVA'
          ? 'success'
          : 'default'
      }
      size="small"
    />
  </Box>

  <Typography
    variant="body2"
    sx={{ fontWeight: 'bold', color: 'black' }}
  >
    Objetivo: €{campaña.objetivoRecaudacion}
  </Typography>

  <Typography
    variant="body2"
    sx={{ fontWeight: 'bold', color: 'black' }}
  >
    Recaudado: €{campaña.recaudado}
  </Typography>

  {campaña.recaudado >= campaña.objetivoRecaudacion && (
    <Typography
      variant="body2"
      color="error"
      sx={{ mt: 1, fontWeight: 'bold' }}
    >
      Esta campaña está finalizada
    </Typography>
  )}
</CardContent>


                  <CardActions>
                    <Button
                      onClick={() => {
                        const token = localStorage.getItem("token");

                        if (!token) {
                          navigate(`/campana/${campaña.id}`);
                          return;
                        }

                        const decoded: DecodedToken = jwtDecode(token);

                        if (decoded.rol === "CREADOR") {
                          navigate(`/mis-campanas/${campaña.id}`);
                        } else {
                          navigate(`/campana/${campaña.id}`);
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
      </Container>

      <Footer />

    </Box>

    
  )
}
