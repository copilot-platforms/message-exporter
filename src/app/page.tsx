import { copilotApi } from "copilot-node-sdk";
import { MessageExporter } from "@/features/MessageExporter";
import { need } from "@/utils/need";
import { groupBy } from "@/utils/groupBy";
import {
  listAllClients,
  listAllCompanies,
  listAllInternalUsers,
  listAllMessageChannels,
} from "@/actions/export-messages";

const apiKey = need<string>(process.env.COPILOT_API_KEY);

// One minute
export const maxDuration = 60000;

export default async function Home({
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const copilot = copilotApi({
    apiKey,
    token:
      typeof searchParams.token === "string" ? searchParams.token : undefined,
  });

  const channels = await listAllMessageChannels(copilot, [], undefined);
  const clients = await listAllClients(copilot, [], undefined);
  const companies = await listAllCompanies(copilot, [], undefined);
  const internalUsers = await listAllInternalUsers(copilot, [], undefined);

  const clientsMap = new Map();
  clients.forEach((client) => clientsMap.set(client.id, client));

  // Grouping channels by membership type. This will give us channels with membership type as group, individual and company
  const { group, individual, company } = groupBy(
    channels,
    (channel) => channel.membershipType as string
  );

  // For set channel name for group channel, we need to get client detail based on memberIds
  const groupChannels = (group || [])
    .map((channel) => ({
      ...channel,
      members:
        channel.memberIds
          ?.map((id) => {
            return clientsMap.get(id);
          })
          .filter(Boolean) ?? [],
    }))
    .map((channel) => {
      return {
        ...channel,
        channelName:
          channel.members
            .map((member) =>
              member?.givenName && member?.familyName
                ? `${member.givenName} ${member.familyName}`
                : "Unknown User"
            )
            .join(", ") || "Unnamed Channel",
      };
    });

  // For individual channels, client id is membershipEntityId and we need to get client detail based on that
  const invividualChannels = individual.map((channel) => {
    const clientsChannels = clientsMap.get(channel.membershipEntityId);

    return {
      ...channel,
      channelName:
        clientsChannels?.givenName && clientsChannels?.familyName
          ? `${clientsChannels.givenName} ${clientsChannels.familyName}`
          : "Unnamed Channel",
    };
  });

  // Company channel follows same pattern as individual channel
  const companyChannels = (company ?? []).map((channel) => ({
    ...channel,
    channelName: companies.find(
      (company) => company.id === channel.membershipEntityId
    )?.name,
  }));

  const channelsData = [
    ...groupChannels,
    ...invividualChannels,
    ...companyChannels,
  ];

  return (
    <MessageExporter
      channels={channelsData}
      clients={clients}
      internalUsers={internalUsers}
    />
  );
}
