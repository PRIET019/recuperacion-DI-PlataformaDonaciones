import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Button, Fab, Tooltip } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import { jwtDecode } from "jwt-decode"

type DecodedToken = {
  rol?: string
  exp?: number 
  sub?: string
}


export default function AdminCrearCampana({
  to = "/crear-campana",
  label = "Crear campaña",
  variant = "button",
  allowedRoles = ["ADMIN"],
  fullWidth = false,
}: {
  to?: string
  label?: string
  variant?: "button" | "fab"
  allowedRoles?: string[]
  fullWidth?: boolean
}) {
  const navigate = useNavigate()

  const canSee = useMemo(() => {
    const token = localStorage.getItem("token")
    if (!token) return false

    try {
      const decoded = jwtDecode<DecodedToken>(token)

      const rol = decoded.rol?.toUpperCase()
      if (!rol) return false

      if (decoded.exp) {
        const now = Math.floor(Date.now() / 1000)
        if (decoded.exp <= now) return false
      }

 
      return allowedRoles.map(r => r.toUpperCase()).includes(rol)
    } catch {
      return false
    }
  }, [allowedRoles])

  if (!canSee) return null

  if (variant === "fab") {
    return (
      <Tooltip title={label}>
        <Fab
          color="primary"
          onClick={() => navigate(to)}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1300
          }}
          aria-label={label}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
    )
  }

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={() => navigate(to)}
      fullWidth={fullWidth}
    >
      {label}
    </Button>
  )
}