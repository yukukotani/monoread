import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { R } from "@praha/byethrow";
import { z } from "zod";
import { readUrl } from "../../usecase/read-url.js";

const ReadUrlSchema = z.object({
  url: z.string().url().describe("The URL to read content from"),
});

export async function startMcpServer(): Promise<void> {
  try {
    const server = new Server(
      {
        name: "monoread",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          logging: {},
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

      await server.sendLoggingMessage({
        level: "debug",
        data: `Processing read_url_content request for URL: ${url}`,
      });

      try {
        const result = await readUrl(url);

        if (R.isSuccess(result)) {
          await server.sendLoggingMessage({
            level: "debug",
            data: `Content extraction successful for URL: ${url}`,
          });
          return {
            content: [
              {
                type: "text",
                text: result.value,
              },
            ],
          };
        } else {
          await server.sendLoggingMessage({
            level: "warning",
            data: `Content extraction failed for URL: ${url}, error: ${result.error}`,
          });
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
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          `Unexpected error during content extraction for ${url}:`,
          errorMessage,
        );
        return {
          content: [
            {
              type: "text",
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });

    const transport = new StdioServerTransport();

    process.on("SIGINT", async () => {
      await server.sendLoggingMessage({
        level: "info",
        data: "Received SIGINT, shutting down gracefully",
      });
      await server.close();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      await server.sendLoggingMessage({
        level: "info",
        data: "Received SIGTERM, shutting down gracefully",
      });
      await server.close();
      process.exit(0);
    });

    await server.connect(transport);

    await server.sendLoggingMessage({
      level: "info",
      data: "MCP server started successfully",
    });
  } catch (error) {
    console.error("Failed to start MCP server:", error);
    process.exit(1);
  }
}
