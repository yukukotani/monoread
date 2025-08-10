import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { extractContent } from "../../usecase/content-extractor.js";
import { createMcpLogger } from "./mcp-logger.js";

const ReadUrlSchema = z.object({
  url: z.string().url().describe("The URL to read content from"),
});

export async function startMcpServer(): Promise<void> {
  const logger = createMcpLogger("mcp-server");

  try {
    const server = new Server(
      {
        name: "monoread",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "read_url_content",
          description: "Extract content from a URL using readability",
          inputSchema: {
            type: "object",
            properties: {
              url: {
                type: "string",
                description: "The URL to read content from",
              },
            },
            required: ["url"],
          },
        },
      ],
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== "read_url_content") {
        throw new Error(`Unknown tool: ${request.params.name}`);
      }

      const parsed = ReadUrlSchema.safeParse(request.params.arguments);
      if (!parsed.success) {
        return {
          content: [
            {
              type: "text",
              text: `Invalid arguments: ${parsed.error.message}`,
            },
          ],
          isError: true,
        };
      }

      const { url } = parsed.data;
      logger.debug({ url }, "Processing read_url_content request");

      try {
        const result = await extractContent(url);

        if (result.success) {
          logger.debug({ url }, "Content extraction successful");
          return {
            content: [
              {
                type: "text",
                text: result.content,
              },
            ],
          };
        } else {
          logger.warn(
            { url, error: result.error },
            "Content extraction failed",
          );
          return {
            content: [
              {
                type: "text",
                text: `Failed to extract content: ${result.error}`,
              },
            ],
            isError: true,
          };
        }
      } catch (error) {
        logger.error(
          { url, error: error instanceof Error ? error.message : error },
          "Unexpected error during content extraction",
        );
        return {
          content: [
            {
              type: "text",
              text: `Error: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    });

    const transport = new StdioServerTransport();

    process.on("SIGINT", async () => {
      logger.info("Received SIGINT, shutting down gracefully");
      await server.close();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      logger.info("Received SIGTERM, shutting down gracefully");
      await server.close();
      process.exit(0);
    });

    logger.info("Starting MCP server");
    await server.connect(transport);
    logger.info("MCP server started successfully");
  } catch (error) {
    console.error("Failed to start MCP server:", error);
    process.exit(1);
  }
}
