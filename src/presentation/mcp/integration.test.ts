import { spawn } from "node:child_process";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

describe("MCP統合テスト", () => {
  let mcpProcess: any;

  afterEach(() => {
    if (mcpProcess && !mcpProcess.killed) {
      mcpProcess.kill();
    }
  });

  describe("MCPサーバ起動", () => {
    it("monoread mcpコマンドでMCPサーバが起動する", async () => {
      const binPath = join(process.cwd(), "bin", "run.js");

      const promise = new Promise<void>((resolve, reject) => {
        mcpProcess = spawn("node", [binPath, "mcp"], {
          env: { ...process.env, LOG_LEVEL: "silent" },
        });

        mcpProcess.stderr.on("data", (data: Buffer) => {
          const output = data.toString();
          if (output.includes("error")) {
            reject(new Error(output));
          }
        });

        mcpProcess.on("spawn", () => {
          setTimeout(() => {
            resolve();
          }, 100);
        });

        mcpProcess.on("error", reject);
      });

      await expect(promise).resolves.toBeUndefined();
      expect(mcpProcess.killed).toBe(false);
    });

    it("初期化リクエストに応答する", async () => {
      const binPath = join(process.cwd(), "bin", "run.js");

      const promise = new Promise<any>((resolve, reject) => {
        mcpProcess = spawn("node", [binPath, "mcp"], {
          env: { ...process.env, LOG_LEVEL: "silent" },
        });

        let responseData = "";

        mcpProcess.stdout.on("data", (data: Buffer) => {
          responseData += data.toString();
          try {
            const lines = responseData.split("\n");
            for (const line of lines) {
              if (line.trim()) {
                const json = JSON.parse(line);
                if (json.result) {
                  resolve(json.result);
                }
              }
            }
          } catch {}
        });

        mcpProcess.stderr.on("data", (data: Buffer) => {
          const output = data.toString();
          if (output.includes("error")) {
            reject(new Error(output));
          }
        });

        mcpProcess.on("spawn", () => {
          const initRequest = {
            jsonrpc: "2.0",
            id: 1,
            method: "initialize",
            params: {
              protocolVersion: "2024-11-05",
              capabilities: {},
              clientInfo: {
                name: "test-client",
                version: "1.0.0",
              },
            },
          };
          mcpProcess.stdin.write(JSON.stringify(initRequest) + "\n");
        });

        mcpProcess.on("error", reject);

        setTimeout(() => {
          reject(new Error("Timeout waiting for response"));
        }, 5000);
      });

      const result = await promise;
      expect(result).toHaveProperty("protocolVersion");
      expect(result).toHaveProperty("capabilities");
      expect(result.serverInfo).toEqual({
        name: "monoread",
        version: "1.0.0",
      });
    });

    it("ツール一覧リクエストに応答する", async () => {
      const binPath = join(process.cwd(), "bin", "run.js");

      const promise = new Promise<any>((resolve, reject) => {
        mcpProcess = spawn("node", [binPath, "mcp"], {
          env: { ...process.env, LOG_LEVEL: "silent" },
        });

        let responseData = "";
        let initialized = false;

        mcpProcess.stdout.on("data", (data: Buffer) => {
          responseData += data.toString();
          try {
            const lines = responseData.split("\n");
            for (const line of lines) {
              if (line.trim()) {
                const json = JSON.parse(line);
                if (!initialized && json.result?.protocolVersion) {
                  initialized = true;
                  const toolsRequest = {
                    jsonrpc: "2.0",
                    id: 2,
                    method: "tools/list",
                    params: {},
                  };
                  mcpProcess.stdin.write(JSON.stringify(toolsRequest) + "\n");
                } else if (json.id === 2 && json.result) {
                  resolve(json.result);
                }
              }
            }
          } catch {}
        });

        mcpProcess.on("spawn", () => {
          const initRequest = {
            jsonrpc: "2.0",
            id: 1,
            method: "initialize",
            params: {
              protocolVersion: "2024-11-05",
              capabilities: {},
              clientInfo: {
                name: "test-client",
                version: "1.0.0",
              },
            },
          };
          mcpProcess.stdin.write(JSON.stringify(initRequest) + "\n");
        });

        mcpProcess.on("error", reject);

        setTimeout(() => {
          reject(new Error("Timeout waiting for response"));
        }, 5000);
      });

      const result = await promise;
      expect(result.tools).toHaveLength(1);
      expect(result.tools[0]).toEqual({
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
      });
    });

    it("SIGINTでグレースフルにシャットダウンする", async () => {
      const binPath = join(process.cwd(), "bin", "run.js");

      const promise = new Promise<void>((resolve, reject) => {
        mcpProcess = spawn("node", [binPath, "mcp"], {
          env: { ...process.env, LOG_LEVEL: "silent" },
        });

        mcpProcess.on("spawn", () => {
          setTimeout(() => {
            mcpProcess.kill("SIGINT");
          }, 100);
        });

        mcpProcess.on("exit", (code: number) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Process exited with code ${code}`));
          }
        });

        mcpProcess.on("error", reject);

        setTimeout(() => {
          reject(new Error("Timeout waiting for shutdown"));
        }, 5000);
      });

      await expect(promise).resolves.toBeUndefined();
    });
  });
});
