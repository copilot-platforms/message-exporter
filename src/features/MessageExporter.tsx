"use client";
import { ComponentProps, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BaseButton } from "@/components/Button";
import { Select } from "@/components/Select";
import {
  EXPORT_TIMELINES,
  EXPORT_FORMATS,
  MESSAGE_SENDERS,
  EXPORT_SORT_ORDERS,
} from "@/constants";
import {
  Box,
  Card,
  MenuItem,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  MessageChannel,
  User,
  MessageFormValues,
  MessageWithUserDetails,
} from "@/types";
import { getMessagesToExport } from "@/actions/export-messages";
import { useFormStatus } from "react-dom";
import { downloadCsv, downloadPdf } from "@/utils/download";

type Props = {
  channels: MessageChannel[];
  clients: User[];
  internalUsers: User[];
};

function ExportMessageButton() {
  const { pending } = useFormStatus();

  return (
    // This quiets an MUI warning:
    // "Warning: Received `false` for a non-boolean attribute `loading`."
    <BaseButton type="submit" loading={pending ? pending : undefined}>
      Export
    </BaseButton>
  );
}

export const MessageExporter = ({
  channels,
  clients,
  internalUsers,
}: Props) => {
  const [values, setValues] = useState<MessageFormValues>({
    exportFormat: "csv",
    channel: "",
    senderUserType: "internal_and_client",
    sortOrder: "ascending",
    date: "last_seven_days",
  });
  const [exportStatus, setExportStatus] = useState({
    error: false,
    message: "",
  });
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? undefined;

  const handleChangeValues: ComponentProps<typeof Select>["onChange"] = (
    event
  ) => {
    const field = event.target.name;
    setValues({
      ...values,
      [field]: event.target.value,
    });
  };

  const handleCloseToast = () => {
    setExportStatus({
      error: false,
      message: "",
    });
  };

  const handleDownloadMessages = (messages: MessageWithUserDetails[]) => {
    if (values.exportFormat === "csv") {
      downloadCsv(messages);
    } else {
      downloadPdf(messages, channels);
    }
  };

  return (
    <form
      action={async () => {
        try {
          const messages = await getMessagesToExport(
            token,
            values,
            clients,
            internalUsers
          );
          handleDownloadMessages(messages);
        } catch (error) {
          const errorMessage = (error as Error).message;
          setExportStatus({
            error: true,
            message: errorMessage,
          });
        }
      }}
    >
      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          padding: "4rem 1.5rem 6.25rem 1.5rem",
        }}
      >
        <Box
          sx={{
            maxWidth: "768px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <Box mb={3}>
            <Typography variant="headingXl" color="#212B36">
              Message exporter configuration
            </Typography>
            <Typography variant="bodyLg" color="#6B6F76">
              Set up export preferences
            </Typography>
          </Box>
          <Card
            sx={{
              padding: 3,
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <Select
              label="Export format"
              value={values.exportFormat}
              name="exportFormat"
              onChange={handleChangeValues}
            >
              {EXPORT_FORMATS.map((option, index) => (
                <MenuItem key={index} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            <Select
              label="Channel"
              value={values.channel}
              name="channel"
              onChange={handleChangeValues}
              // Added placeholder when no channel is selected
              displayEmpty
              renderValue={(selected) => {
                const selectedChannel = channels.find(
                  (channel) => channel.id === selected
                );
                if (!selected) {
                  return <div>Select a channel</div>;
                }
                return selectedChannel?.channelName;
              }}
            >
              {channels.map((option, index) => (
                <MenuItem key={index} value={option.id}>
                  {option.channelName}
                </MenuItem>
              ))}
            </Select>
            <Select
              label="Sender user type"
              value={values.senderUserType}
              name="senderUserType"
              onChange={handleChangeValues}
            >
              {MESSAGE_SENDERS.map((option, index) => (
                <MenuItem key={index} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            <Select
              label="Sort order"
              value={values.sortOrder}
              name="sortOrder"
              onChange={handleChangeValues}
            >
              {EXPORT_SORT_ORDERS.map((option, index) => (
                <MenuItem key={index} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            <Select
              label="Date"
              value={values.date}
              name="date"
              onChange={handleChangeValues}
            >
              {EXPORT_TIMELINES.map((option, index) => (
                <MenuItem key={index} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </Card>
          <Box mt={8}>
            <Typography variant="headingXl" color="#212B36">
              Export
            </Typography>
            <Typography variant="bodyLg" color="#6B6F76" mb={3}>
              Run the export based on the preferences above
            </Typography>
            <ExportMessageButton />
          </Box>
        </Box>
      </Box>
      <Snackbar
        open={exportStatus.error}
        autoHideDuration={3000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity="error"
          sx={{ width: "100%" }}
        >
          {exportStatus.message}
        </Alert>
      </Snackbar>
    </form>
  );
};
