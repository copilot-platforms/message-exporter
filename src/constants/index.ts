export const EXPORT_FORMATS = [
  { value: "csv", label: "CSV" },
  { value: "pdf", label: "PDF" },
];

export const MESSAGE_SENDERS = [
  {
    value: "internal_and_client",
    label: "Internal users and client users",
  },
  { value: "internal", label: "Internal users" },
  { value: "client", label: "Client users" },
];

export const EXPORT_SORT_ORDERS = [
  { value: "ascending", label: "Ascending" },
  { value: "descending", label: "Descending" },
];

export const EXPORT_TIMELINES = [
  { value: "last_seven_days", label: "Last 7 days" },
  { value: "last_month", label: "Last month" },
  { value: "all_time", label: "All time" },
];

export type TimeRange = "last_seven_days" | "last_month" | "all_time";

export type SortOrder = "ascending" | "descending";

export type SenderUserType = "internal_and_client" | "internal" | "client";

export type ExportFormat = "csv" | "pdf";
