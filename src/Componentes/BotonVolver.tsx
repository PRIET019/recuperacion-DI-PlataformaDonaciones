import { useMemo } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { IconButton, Tooltip } from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"

type Props = {
  fallbackTo?: string
  hideOnPaths?: string[]
  title?: string
}

export default function BotonVolver({
  fallbackTo = "/",
  hideOnPaths = ["/", "/login"],
  title = "Volver",
}: Props) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const canGoBack = useMemo(() => {
    const idx =
      window.history.state && typeof window.history.state.idx === "number"
        ? window.history.state.idx
        : 0

    return idx > 0 || window.history.length > 1
  }, [])

  if (hideOnPaths.includes(pathname)) return null

  const handleBack = () => {
    if (canGoBack) navigate(-1)
    else navigate(fallbackTo, { replace: true })
  }

  return (
    <Tooltip title={title}>
      <IconButton
        onClick={handleBack}
        aria-label={title}
        edge="start"
        sx={{ mr: 1 }}
      >
        <ArrowBackIcon />
      </IconButton>
    </Tooltip>
  )
}