import yargs from "yargs";
import { OutOfSync } from "./errors";
import { readCredentials } from "./services/credentials.service";
import { fetchLessons } from "./services/fetcher.service";
import { createLogger } from "./services/logger.service";

const DEFAULT_CREDENTIALS_FILEPATH = "credentials.json";

export default function app(params: string[]) {
  return yargs(params)
    .demandCommand(1)
    .fail(function (msg: string | null, err: Error | null, yargs: any) {
      if (err != null) {
        console.error("\n\x1b[31m%s\x1b[0m", err.message);
        if (err.stack) {
          console.log(err.stack);
        }
      } else if (msg != null) console.error("\n\x1b[31m%s\x1b[0m", msg);
      process.exit(1);
    })
    .command(
      "$0 <lang> <path>",
      "Fetches lessons for the <lang> into <path>.",
      (yargs) =>
        yargs
          .positional("lang", {
            description: "Lessons language",
            type: "string",
            demandOption: true,
          })
          .positional("path", {
            description: "Lessons output directory",
            type: "string",
            demandOption: true,
          })
          .options({
            credentials: {
              alias: "c",
              description: "Path to the credentials.json file",
              type: "string",
              default: DEFAULT_CREDENTIALS_FILEPATH,
            },
            debug: {
              alias: "d",
              description: "Output debugging information",
              type: "boolean",
              default: false,
            },
            dryRun: {
              description: "Don't write anything, only show what's gonna be done",
              type: "boolean",
              default: false,
            },
          }),
      async (argv) => {
        const logger = createLogger(argv.debug);
        try {
          const credentials = await readCredentials(argv.credentials, logger);
          await fetchLessons(
            {
              language: argv.lang,
              outDirpath: argv.path,
              credentials,
              debug: argv.debug,
            },
            logger
          );
        } catch (e) {
          if (e instanceof OutOfSync) {
            logger.err(e.message);
            logger.log(`This script should be updated to match the current version of the website.`);
            logger.log("Please contact the developer.");
          } else if (e instanceof Error) {
            logger.err(e.message);
          } else {
            throw e;
          }
        }
      }
    );
}
