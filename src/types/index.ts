import {
  ExportFormat,
  SenderUserType,
  SortOrder,
  TimeRange,
} from "@/constants";

export type MessageChannel = {
  id?: string | undefined;
  object?: string | undefined;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
  membershipType?: string | undefined;
  membershipEntityId?: string | undefined;
  memberIds?: string[] | undefined;
  lastMessageDate?: any;
  channelName?: string;
};

export type Message = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  object: string;
  channelId: string;
  senderId: string;
  text: string;
  isAttachmentIncluded: boolean;
};

export type MessageWithUserDetails = Message & {
  senderName: string;
  senderEmail: string;
};

export type User = {
  id?: string | undefined;
  created?: string | undefined;
  givenName?: string | undefined;
  familyName?: string | undefined;
  email?: string | undefined;
  companyId?: string | undefined;
  status?: string | undefined;
  customFields?: any;
};

export type Company = {
  id?: string | undefined;
  created?: string | undefined;
  name?: string | undefined;
  fallbackColor?: string | undefined;
  iconImageUrl?: string | undefined;
  isPlaceholder?: boolean | undefined;
  leadInternalUserId?: string | undefined;
  assigneeInternalUserIds?: string[] | undefined;
};

export type MessageFormValues = {
  exportFormat: ExportFormat;
  channel: string;
  senderUserType: SenderUserType;
  sortOrder: SortOrder;
  date: TimeRange;
};
