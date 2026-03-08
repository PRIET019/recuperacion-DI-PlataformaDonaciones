import { Box, CircularProgress } from "@mui/material";

export default function LoadingState() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        mt: 10,
      }}
    >
      <CircularProgress />
    </Box>
  );
}