import Button, { ButtonProps } from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

type BaseButtonProps = ButtonProps & {
  loading?: boolean;
};

export const BaseButton = (props: BaseButtonProps) => {
  return (
    <Button
      size="small"
      sx={{
        border: "1px solid #000",
        borderRadius: "4px",
        background: "#212B36",
        color: "#fff",
        fontSize: "14px",
        fontWeight: 500,
        lineHeight: "22px",
        fontFamily: "Inter, sans-serif",
        textTransform: "initial",
        height: 30,
        width: 132,
        "&:hover": {
          background: "#212B36",
          color: "#fff",
        },
      }}
      {...props}
    >
      {props.loading ? (
        <CircularProgress size={12} color="inherit" />
      ) : (
        props.children
      )}
    </Button>
  );
};
