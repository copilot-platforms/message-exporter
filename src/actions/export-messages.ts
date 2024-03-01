"use server";

import { unstable_noStore as noStore } from 'next/cache';
import { SenderUserType } from "@/constants";
import {
  Company,
  Message,
  MessageChannel,
  MessageFormValues,
  MessageWithUserDetails,
  User,
} from "@/types";
import {
  getClientMessages,
  getInternalUserMessages,
  getMessagesByTimePeriod,
  sortMessages,
} from "@/utils/channel";
import { need } from "@/utils/need";
import { copilotApi } from "copilot-node-sdk";

export type CopilotInstance = ReturnType<typeof copilotApi>;

const apiKey = need<string>(process.env.COPILOT_API_KEY);

/**
 *
 * @param values MessageFormValues
 * @returns Message[] after applying filters
 */
export async function getMessagesToExport(
  token: string | undefined,
  values: MessageFormValues,
  clients: User[],
  internalUsers: User[]
) {
  noStore();

  if(!values.channel) {
    throw new Error('Please select a channel to export messages');
  }
  // This utility is called from a client component `MessageExporter`
  // We had to initialize Copilot instance here again because server component can not pass function to client component.
  const copilot = copilotApi({
    apiKey,
    token,
  });
  const { exportFormat, channel, senderUserType, sortOrder, date } = values;

  const messages = await getMessages(copilot, channel);

  const messagesBySenderType = await filterAndFormatMessagesBySenderType(
    messages,
    senderUserType,
    clients,
    internalUsers
  );

  const sortedMessages = sortMessages(
    messagesBySenderType,
    exportFormat === "pdf" ? "descending" : sortOrder
  );

  const messagesByTimePeriod = getMessagesByTimePeriod(sortedMessages, date);

  return messagesByTimePeriod as MessageWithUserDetails[];
}

async function getMessages(
  copilot: CopilotInstance,
  channels: string,
) {
  noStore();
  const messagesData = await listAllMessages(copilot, [], undefined, channels);

  return messagesData;
}

async function filterAndFormatMessagesBySenderType(
  messages: Message[],
  senderUserType: SenderUserType,
  clients: User[],
  internalUsers: User[]
): Promise<Message[]> {
  let fomattedMessages = [...messages];

  if (senderUserType === "client") {
    const clientMessages = getClientMessages(messages, clients);

    fomattedMessages = addUserDetailsToMessage(clientMessages, clients);
  } else if (senderUserType === "internal") {
    const internalUserMessages = getInternalUserMessages(
      messages,
      internalUsers
    );

    fomattedMessages = addUserDetailsToMessage(
      internalUserMessages,
      internalUsers
    );
  } else {
    // if senderUserType is all, return all messages
    fomattedMessages = addUserDetailsToMessage(messages, [
      ...clients,
      ...internalUsers,
    ]);
  }

  return fomattedMessages;
}

function addUserDetailsToMessage(
  messages: Message[],
  clients: User[]
): Message[] {
  return messages.map((message) => {
    const sender = clients?.find(
      (client) => client?.id?.toString() === message?.senderId?.toString()
    );

    return {
      ...message,
      senderName: `${sender?.givenName} ${sender?.familyName}`,
      senderEmail: sender?.email,
    };
  });
}

export async function listAllMessageChannels(
  copilot: CopilotInstance,
  messageChannels: MessageChannel[],
  nextToken: string | undefined = undefined
) {
  noStore();
  const allMessageChannels = await copilot.listMessageChannels({
    nextToken,
    limit: 100,
  });
  const allNotifications: MessageChannel[] = [
    ...messageChannels,
    ...(allMessageChannels?.data ?? []),
  ];
  if (!allMessageChannels?.nextToken) {
    return allNotifications;
  }
  return listAllMessageChannels(
    copilot,
    allNotifications,
    allMessageChannels?.nextToken
  );
}

export async function listAllCompanies(
  copilot: CopilotInstance,
  comapanies: Company[] = [],
  nextToken: string | undefined = undefined
) {
  noStore();
  const companiesList = await copilot.listCompanies({
    nextToken,
    limit: 100,
  });
  const allComapnies = [...comapanies, ...(companiesList?.data as Company[])];
  if (!companiesList?.nextToken) {
    return allComapnies;
  }
  return listAllCompanies(copilot, allComapnies, companiesList?.nextToken);
}

export async function listAllClients(
  copilot: CopilotInstance,
  clients: User[] = [],
  nextToken: string | undefined = undefined
) {
  noStore();
  const clientsList = (await copilot.listClients({
    nextToken,
    limit: 100,
  }));
  const allCompanies = [...clients, ...(clientsList?.data ?? [])].filter(Boolean);
  if (!clientsList?.nextToken) {
    return allCompanies;
  }
  return listAllClients(copilot, allCompanies, clientsList?.nextToken);
}

export async function listAllMessages(
  copilot: CopilotInstance,
  messages: Message[],
  nextToken: string | undefined = undefined,
  channelId: string
) {
  noStore();
  const messagesList = await copilot.listMessages({
    channelId,
    nextToken,
    limit: 100,
  });
  const allMessages = [...messages, ...(messagesList?.data as Message[])];
  if (!messagesList?.nextToken) {
    return allMessages;
  }
  return listAllMessages(
    copilot,
    allMessages,
    messagesList?.nextToken,
    channelId
  );
}

export async function listAllInternalUsers(
  copilot: CopilotInstance,
  internalUsers: User[],
  nextToken: string | undefined = undefined
) {
  noStore();
  const internalUsersList = (await copilot.listInternalUsers({
    nextToken,
    limit: 100,
  })) as any; // Temporary fix since `nextToken` is missing in the type definition
  const allInternalUsers = [
    ...internalUsers,
    ...(internalUsersList?.data as User[]),
  ];
  if (!internalUsersList?.nextToken) {
    return allInternalUsers;
  }
  return listAllInternalUsers(
    copilot,
    allInternalUsers,
    internalUsersList?.nextToken
  );
}
