import "dotenv/config";
import { corsair } from "./corsair";
import { checkOpenAI } from "@/lib/ai/ai";

// const client = await checkOpenAI();

// const model = "gpt-4.1-nano";
// console.log(client.baseURL);

// const systemPrompt = "You are a intelligent assistant that provides the answers of the user using corsair";
// const userPrompt = "Can you use corsair object ?";

const main = async () => {
  const res =  await corsair.withTenant("dev").gmail.api.drafts.send({
    id: "dev",
    message: {
        raw:"testing msg",
        
    },
    userId: "dev",
  });
  console.log(res);
};
main();
