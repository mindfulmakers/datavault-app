import { ChatOpenAI } from "@langchain/openai";
import { createAgent, tool } from "langchain";
import { z } from "zod";

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => {
      resolve(data);
    });
    process.stdin.on("error", reject);
  });
}

function formatLocations(points) {
  if (points.length === 0) {
    return "No location points were found in that range.";
  }

  return points
    .map(
      (point) =>
        `${point.recorded_at}: ${point.label} (${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)})`
    )
    .join("\n");
}

const payload = JSON.parse(await readStdin());
const locationHistory = payload.locationHistory ?? [];
const messageHistory = payload.messageHistory ?? [];

const queryLocationHistory = tool(
  async ({ startDate, endDate }) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const matchingPoints = locationHistory.filter((point) => {
      const recordedAt = new Date(point.recorded_at);
      return recordedAt >= start && recordedAt <= end;
    });

    return formatLocations(matchingPoints);
  },
  {
    name: "query_location_history",
    description:
      "Query saved location history points between two ISO-8601 date strings.",
    schema: z.object({
      startDate: z
        .string()
        .describe("Inclusive ISO-8601 start datetime, for example 2026-03-08T00:00:00Z"),
      endDate: z
        .string()
        .describe("Inclusive ISO-8601 end datetime, for example 2026-03-12T23:59:59Z"),
    }),
  }
);

const model = new ChatOpenAI({
  model: "gpt-4.1-mini",
  temperature: 0,
});

const agent = createAgent({
  model,
  tools: [queryLocationHistory],
  systemPrompt:
    "You are a concise assistant for a personal location history app. Use the query_location_history tool whenever the user asks about where they were between dates or on a time range. Base your answer only on the provided tool data.",
});

const messages = [
  ...messageHistory.map((message) => ({
    role: message.role,
    content: message.content,
  })),
  { role: "user", content: payload.userMessage },
];

const result = await agent.invoke({ messages });
const finalMessage = result.messages[result.messages.length - 1];
const response =
  typeof finalMessage.content === "string"
    ? finalMessage.content
    : JSON.stringify(finalMessage.content);

process.stdout.write(JSON.stringify({ response }));
