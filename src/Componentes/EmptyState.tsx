import { Typography } from "@mui/material";

type Props = {
  message?: string;
};

export default function EmptyState({ message }: Props) {
  return (
    <Typography sx={{ textAlign: "center", mt: 5 }}>
      {message ?? "No hay datos disponibles"}
    </Typography>
  );
}