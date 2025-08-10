#!/usr/bin/env node

import { Args, Command, Flags } from "@oclif/core";
import { createChildLogger, initializeLogger } from "./libs/logger.js";
import { githubProvider } from "./libs/providers/github-provider.js";
import type { ContentProvider } from "./libs/types.js";
import { extractContent } from "./usecase/content-extractor.js";

const providers: ContentProvider[] = [githubProvider];

export default class MonoreadCommand extends Command {
  static override description =
    "CLI tool for reading any URL in AI-optimized format";

  static override args = {
    url: Args.string({
      description: "URL to extract content from",
      required: true,
    }),
  };

  static override flags = {
    "log-level": Flags.option({
      options: ["silent", "trace", "debug", "info", "warn", "error", "fatal"],
      description: "Set the log level",
      default: "silent",
    })(),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(MonoreadCommand);

    const url = args.url;
    const logLevel = flags["log-level"] as
      | "silent"
      | "trace"
      | "debug"
      | "info"
      | "warn"
      | "error"
      | "fatal";

    // グローバルロガーを初期化
    initializeLogger({
      logging: {
        level: logLevel,
        pretty: logLevel !== "silent",
      },
    });

    const logger = createChildLogger("cli");

    if (!this.isValidUrl(url)) {
      logger.error({ url }, "Invalid URL format");
      this.error("Invalid URL format", { exit: 1 });
    }

    logger.info({ url }, "Processing URL");
    this.logToStderr(`Processing: ${url}`);

    const result = await extractContent(url, providers);

    if (result.success) {
      logger.info(
        {
          metadata: result.metadata,
          contentLength: result.content.length,
        },
        "Content extracted successfully",
      );

      if (result.metadata.title) {
        this.logToStderr(`Title: ${result.metadata.title}`);
      }
      if (result.metadata.fileName) {
        this.logToStderr(`File: ${result.metadata.fileName}`);
      }

      this.log(result.content);
    } else {
      logger.error(
        {
          error: result.error,
          errorType: result.errorType,
          url,
        },
        "Failed to extract content",
      );

      let errorMessage = `Error: ${result.error}`;

      switch (result.errorType) {
        case "not_found":
          errorMessage += "\nThe specified URL or file was not found.";
          break;
        case "auth":
          errorMessage +=
            "\nAuthentication required. This may be a private repository.";
          errorMessage +=
            "\nConsider setting up GitHub token for private repositories.";
          break;
        case "rate_limit":
          errorMessage += "\nAPI rate limit exceeded. Please try again later.";
          break;
        case "invalid_url":
          errorMessage += "\nPlease provide a valid URL.";
          break;
        case "network":
          errorMessage +=
            "\nNetwork error. Please check your connection and try again.";
          break;
      }

      this.error(errorMessage, { exit: 1 });
    }
  }

  private isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  }
}
