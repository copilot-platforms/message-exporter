import Papa from "papaparse";
import jsPDF from "jspdf";
import { MessageChannel, MessageWithUserDetails } from "@/types";

const EXPORT_HEADERS = ["Sender Name", "Sender Email", "Time Stamp", "Message"];

const getMessagesParticipants = (messages: MessageWithUserDetails[]) => {
  const sendersIds = [...new Set(messages?.map((item) => item?.senderId))];

  const participants = sendersIds?.map((id) => {
    const sender = messages?.find((item) => item?.senderId === id);
    return {
      senderName: sender?.senderName,
      senderEmail: sender?.senderEmail,
    };
  });

  return participants;
};

const getCsvMessages = (messages: MessageWithUserDetails[]) => {
  return [
    ...messages.map((item) => {
      return [
        item.senderName ?? "",
        item.senderEmail ?? "",
        item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "",
        item.text ?? "",
      ];
    }),
  ];
};

const getPdfMessages = (
  messages: MessageWithUserDetails[],
  channels: MessageChannel[]
) => {
  return [
    ...messages.map((item) => {
      const channelName =
        channels.find((channel) => channel.id === item.channelId)
          ?.channelName ?? "";
      return {
        title: channelName,
        senderName: item.senderName ?? "",
        senderEmail: item.senderEmail ?? "",
        date: item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "",
        text: item.text ?? "",
        isAttachmentIncluded: item?.isAttachmentIncluded ? "Yes" : "No",
      } as const;
    }),
  ];
};

export const downloadCsv = (messages: MessageWithUserDetails[]) => {
  const csvMessages = getCsvMessages(messages);

  const csv = Papa.unparse({
    fields: EXPORT_HEADERS,
    data: csvMessages,
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `messages.csv`;
  link.click();
};

export const downloadPdf = (
  messages: MessageWithUserDetails[],
  channels: MessageChannel[]
) => {
  let currentPage = 1;
  let yCoordinate = 20;

  const pdf = new jsPDF({
    format: "a4",
  });
  const pageHeight = pdf.internal.pageSize.height;

  const messagesParticipats = getMessagesParticipants(messages);

  const addNewPageIfNeeded = (blockHeight: number) => {
    if (yCoordinate + blockHeight > pageHeight - 20) {
      pdf.addPage();
      yCoordinate = 20;
      currentPage++;
      addHeader();
    }
  };

  const addHeader = () => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text(`Page ${currentPage}`, 10, 10);

    // reset the font and size
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
  };

  // show channel name at the top
  const pdfMessages = getPdfMessages(messages, channels);
  if (!pdfMessages.length) {
    pdf.text("No messages found", 10, yCoordinate);
    pdf.save("messages.pdf");
    return;
  }

  const channelName = pdfMessages?.[0].title;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text(channelName, 10, yCoordinate);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);

  // show print copy generated date
  pdf.text(
    `Print copy generated on ${new Date().toLocaleString()}`,
    10,
    yCoordinate + 5
  );
  // show participants
  const participantsText = `Current participants: ${messagesParticipats
    ?.map((item) => {
      if (item?.senderName) {
        pdf.setFont("helvetica", "bold");
      } else if (item?.senderEmail) {
        pdf.setFont("helvetica", "normal");
      }

      // Return the formatted string
      return `${item?.senderName} (${item?.senderEmail})`;
    })
    .join(", ")}`;

  const maxWidth = pdf.internal.pageSize.width - 36;
  const participantsLines = pdf.splitTextToSize(participantsText, maxWidth);
  const textHeight = participantsLines.length * 14;

  // Page number
  addHeader();

  // Participants
  pdf.text(participantsLines, 10, yCoordinate + 12);

  yCoordinate += textHeight;

  pdfMessages?.forEach((row) => {
    // Move to the next row
    yCoordinate += 5;

    const { senderName, senderEmail, date, text, isAttachmentIncluded } = row;
    const nameHeight = pdf.getTextDimensions(senderName, {
      fontSize: 12,
      maxWidth: 180,
    }).h;
    const textHeight = pdf.getTextDimensions(text, {
      fontSize: 10,
      maxWidth,
    }).h;
    const blockHeight = textHeight + nameHeight + 12;

    // Now that we've got the dimensions, check if we need to add a new page
    addNewPageIfNeeded(blockHeight);

    pdf.text(`${senderName}`, 12, yCoordinate + 5);
    pdf.setFontSize(10);
    // Set the draw color to gray for the sender email
    pdf.setTextColor(128, 128, 128); // Adjust the RGB values as needed
    pdf.text(
      `(${senderEmail})`,
      12 + pdf?.getStringUnitWidth(senderName) * 4,
      yCoordinate + 5
    );

    // Reset the draw color to black
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "normal");

    // Draw the text with dynamic height
    pdf.text(text, 12, yCoordinate + 16, {
      align: "left",
      maxWidth,
    });

    pdf.text(` ${date}`, 150, yCoordinate + 5);
    pdf.text(
      ` ${isAttachmentIncluded === "Yes" ? "attachement is included" : ""}`,
      12,
      yCoordinate
    );

    // Set the draw color to gray for the border
    pdf.setDrawColor(128, 128, 128);

    // Draw a border around the message details with dynamic height
    pdf.rect(10, yCoordinate, maxWidth + 12, blockHeight);
    pdf.setFont("helvetica", "bold");

    yCoordinate += blockHeight + 21;
  });

  // Save the PDF
  pdf.save("messages.pdf");
};
