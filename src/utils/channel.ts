import { SortOrder, TimeRange } from "@/constants";
import { Message, User, Company } from "@/types";

export const getClientMessages = (messages: Message[], clients: User[]) => {
  return messages?.filter((message) => {
    return clients?.some(
      (client) => client?.id?.toString() === message.senderId?.toString()
    );
  });
};

export const getInternalUserMessages = (
  messages: Message[],
  internalUsers: Company[]
) => {
  return messages?.filter((message) => {
    return internalUsers?.some(
      (user) => user?.id?.toString() === message.senderId?.toString()
    );
  });
};

export const sortMessages = (
  messages: Message[] = [],
  order: SortOrder = "ascending"
): Message[] => {
  const sortedMessages = [...messages].sort((a, b) => {
    if (!a?.updatedAt || !b?.updatedAt) {
      return 0;
    }
    const dateA = new Date(a.updatedAt);
    const dateB = new Date(b?.updatedAt);

    const comparison = dateA.getTime() - dateB.getTime();
    return order === "descending" ? -comparison : comparison;
  });

  return sortedMessages;
};

export const getMessagesByTimePeriod = (
  messages: Message[] = [],
  timeRange: TimeRange
) => {
  const isMessagewithinTimeRange = (date: Date | string, days: number) => {
    const currentDate = new Date();
    const targetDate = new Date(date);
    const differenceInDays = Math.floor(
      (currentDate.getTime() - targetDate.getTime()) / (1000 * 3600 * 24)
    );
    return differenceInDays <= days;
  };

  // Filter messages based on time range
  const filterMessages = (message: Message, days: number) => {
    const updatedAt = message?.updatedAt;
    if (!updatedAt) return false;
    return isMessagewithinTimeRange(updatedAt, days);
  };

  if (timeRange === "last_seven_days") {
    return messages.filter((message) => filterMessages(message, 7));
  } else if (timeRange === "last_month") {
    return messages.filter((message) => filterMessages(message, 30));
  } else {
    return messages;
  }
};
