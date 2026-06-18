import { corsair } from "../src/server/corsair";

async function test() {
  try {
    const listResult = await corsair
      .withTenant("prashant")
      .gmail.api.messages.list({
        maxResults: 10,
        labelIds: ["INBOX"],
      });

    console.log("Total messages found in INBOX list:", listResult.messages?.length);
    const messageIds = listResult.messages ?? [];

    for (const msg of messageIds) {
      if (!msg.id) continue;
      const full = await corsair
        .withTenant("prashant")
        .gmail.api.messages.get({
          id: msg.id,
          format: "metadata",
          metadataHeaders: ["From", "To", "Subject", "Date"],
        });

      const headers_list = full.payload?.headers ?? [];
      const getHeader = (name) =>
        headers_list.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";

      console.log({
        id: full.id,
        subject: getHeader("Subject"),
        from: getHeader("From"),
        to: getHeader("To"),
        labelIds: full.labelIds,
      });
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
