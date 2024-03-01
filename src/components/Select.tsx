import { Box, Select as Muiselect, Typography } from "@mui/material";
import React, { ComponentProps } from "react";
import { ChevronDownIcon } from "../icons/ChevronDown";

interface Props {
  label?: string;
  value: string;
  onChange: ComponentProps<typeof Muiselect>["onChange"];
  children: React.ReactNode;
  name?: string;
  displayEmpty?: boolean;
  renderValue?: (selected: string) => React.ReactNode;
}

export const Select = ({
  label,
  onChange,
  value,
  children,
  name,
  displayEmpty,
  renderValue,
}: Props) => {
  return (
    <Box>
      <Typography variant="headingMd" color="#212B36" mb={0.5}>
        {label}
      </Typography>
      <Muiselect
        labelId="demo-select-small-label"
        id="demo-select-small"
        displayEmpty={displayEmpty}
        value={value}
        onChange={onChange}
        renderValue={renderValue}
        name={name}
        IconComponent={ChevronDownIcon}
        sx={{
          "& .MuiOutlinedInput-input": {
            py: 1,
            px: 1.5,
            fontSize: "14px",
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            color: "#212B36",
          },
          "& .MuiSvgIcon-root": {
            top: "unset",
            right: 12,
          },
        }}
      >
        {children}
      </Muiselect>
    </Box>
  );
};
