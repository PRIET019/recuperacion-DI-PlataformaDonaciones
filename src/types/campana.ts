export type Campana = {
  id: number
  nombre: string
  objetivoRecaudacion: number
  recaudado: number
  estado: 'ACTIVA' | 'FINALIZADA'
  fechaFinalizacion: string
}
