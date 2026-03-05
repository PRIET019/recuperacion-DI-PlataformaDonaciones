import type { Campana } from '@/types/campana'
import type { APIError, APIResult } from '@/types/errores'

const baseURL :string="http://localhost:3001";

export async function mostrarCampanas(
  soloActivas?: boolean
): Promise<APIResult<Campana[]>> {
  let url = `${baseURL}/api/public/campanas?`

  if (soloActivas !== undefined) {
    url += `soloActivas=${soloActivas}`
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (response.ok) {
    const campanas: Campana[] = await response.json()
    return { ok: true, data: campanas }
  }

  const error: APIError = await response.json()
  return { ok: false, error }
}

export const obtenerCampanaPorId = async (id: string) => {
  try {
    const res = await fetch(`http://localhost:3001/campanas/${id}`)
    const data = await res.json()

    return { ok: true, data }
  } catch (error: any) {
    return { ok: false, error }
  }
}
