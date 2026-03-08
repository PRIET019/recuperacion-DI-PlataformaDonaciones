import { Typography } from "@mui/material";

type Props = {
  message?: string;
};

export default function ErrorState({ message }: Props) {
  return (
    <Typography color="error" sx={{ textAlign: "center", mt: 5 }}>
      {message ?? "Ha ocurrido un error"}
    </Typography>
  );
}