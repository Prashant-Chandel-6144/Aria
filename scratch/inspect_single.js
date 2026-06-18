import { corsair } from "../src/server/corsair";

async function test() {
  try {
    const res1 = await corsair
      .withTenant("prashant")
      .gmail.api.messages.get({
        id: "19eccbc516372388",
        format: "metadata"
      });
    console.log("metadata without headers field list count:", res1.payload?.headers?.length);
    if (res1.payload?.headers) {
      console.log("metadata headers sample:", res1.payload.headers.slice(0, 3));
    }

    const res2 = await corsair
      .withTenant("prashant")
      .gmail.api.messages.get({
        id: "19eccbc516372388",
        format: "full"
      });
    console.log("full format headers count:", res2.payload?.headers?.length);
    if (res2.payload?.headers) {
      console.log("full headers sample:", res2.payload.headers.slice(0, 3));
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
