import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startMcpServer } from "./server.js";

vi.mock("@modelcontextprotocol/sdk/server/index.js");
vi.mock("@modelcontextprotocol/sdk/server/stdio.js");
vi.mock("../../usecase/content-extractor.js");

describe("MCPサーバ", () => {
  let mockServer: any;
  let mockTransport: any;

  beforeEach(() => {
    mockServer = {
      setRequestHandler: vi.fn(),
      connect: vi.fn(),
      close: vi.fn(),
      sendLoggingMessage: vi.fn(),
    };

    mockTransport = {};

    vi.mocked(Server).mockImplementation(() => mockServer);
    vi.mocked(StdioServerTransport).mockImplementation(() => mockTransport);

    vi.spyOn(process, "on").mockImplementation(() => process);
    vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("startMcpServer", () => {
    it("MCPサーバを正しく初期化して起動する", async () => {
      await startMcpServer();

      expect(Server).toHaveBeenCalledWith(
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

      expect(StdioServerTransport).toHaveBeenCalled();
      expect(mockServer.connect).toHaveBeenCalledWith(mockTransport);
    });

    it("read_url_contentツールハンドラを登録する", async () => {
      await startMcpServer();

      expect(mockServer.setRequestHandler).toHaveBeenCalledTimes(2);
      expect(mockServer.sendLoggingMessage).toHaveBeenCalled();
    });

    it("SIGINTシグナルでグレースフルシャットダウンする", async () => {
      await startMcpServer();

      expect(process.on).toHaveBeenCalledWith("SIGINT", expect.any(Function));

      const sigintHandler = (process.on as any).mock.calls.find(
        (call: any) => call[0] === "SIGINT",
      )?.[1];

      await sigintHandler();

      expect(mockServer.close).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(0);
    });

    it("SIGTERMシグナルでグレースフルシャットダウンする", async () => {
      await startMcpServer();

      expect(process.on).toHaveBeenCalledWith("SIGTERM", expect.any(Function));

      const sigtermHandler = (process.on as any).mock.calls.find(
        (call: any) => call[0] === "SIGTERM",
      )?.[1];

      await sigtermHandler();

      expect(mockServer.close).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(0);
    });

    it("エラー時にstderrにログを出力して終了する", async () => {
      const error = new Error("Test error");
      vi.mocked(Server).mockImplementation(() => {
        throw error;
      });

      await startMcpServer();

      expect(console.error).toHaveBeenCalledWith(
        "Failed to start MCP server:",
        error,
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });
});
