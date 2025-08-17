import { beforeEach, describe, expect, it, vi } from "vitest";
import { startMcpServer } from "../mcp/server.js";
import { mcpCommand } from "./mcp-command.js";

vi.mock("../mcp/server.js");

describe("MCPコマンド", () => {
  const mockedStartMcpServer = vi.mocked(startMcpServer);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("mcpCommand", () => {
    it("正しい名前と説明を持つ", () => {
      expect(mcpCommand.name).toBe("mcp");
      expect(mcpCommand.description).toBe("Start MCP server");
    });

    it("toKebabがtrueに設定されている", () => {
      expect(mcpCommand.toKebab).toBe(true);
    });

    it("globalArgsを持つ", () => {
      expect(mcpCommand.args).toBeDefined();
    });

    it("startMcpServerを呼び出す", async () => {
      const mockContext = {
        values: {},
        log: vi.fn(),
      };

      await mcpCommand.run?.(
        mockContext as unknown as Parameters<typeof mcpCommand.run>[0],
      );

      expect(mockedStartMcpServer).toHaveBeenCalledOnce();
    });

    it("エラー時は例外を再スローする", async () => {
      const error = new Error("Test error");
      mockedStartMcpServer.mockRejectedValue(error);

      const mockContext = {
        values: {},
        log: vi.fn(),
      };

      await expect(
        mcpCommand.run?.(
          mockContext as unknown as Parameters<typeof mcpCommand.run>[0],
        ),
      ).rejects.toThrow("Test error");
    });
  });
});
