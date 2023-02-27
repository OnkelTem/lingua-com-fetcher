import yargs from "yargs";
import { OutOfSync } from "./errors";
import { fetchLessons } from "./scripts/lessons.script";
import { listLanguages } from "./scripts/languages.script";
import { createLogger, Logger } from "./services/logger.service";
import { createWebDriver } from "./services/webdriver.service";
import { error } from "selenium-webdriver";
import { targets } from "./scripts/const";

const DEFAULT_CREDENTIALS_FILEPATH = "lingua-com-secret.json";

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
      "ls",
      "Lists available languages.",
      (yargs) => yargs,
      async (argv) => {
        await runWithErrorHandling(createLogger(false), async (logger) => {
          const driver = await createWebDriver(logger);
          await listLanguages(driver, logger);
          await driver.quit();
        });
      }
    )
    .command(
      "fetch <lang> <path>",
      "Fetches lessons for the <lang> into <path>.",
      (yargs) =>
        yargs
          .positional("lang", {
            description:
              "Lessons language. Can be either two-letter code or language name as it's shown by the `ls` command.",
            type: "string",
            demandOption: true,
          })
          .positional("path", {
            description: "Lessons output directory.",
            type: "string",
            demandOption: true,
          })
          .options({
            select: {
              description: "Select what type of files to download. If omitted, then all files.",
              type: "array",
              choices: targets,
            },
            secret: {
              alias: "s",
              description: "Path to the file with your Lingua.com credentials.",
              type: "string",
              default: DEFAULT_CREDENTIALS_FILEPATH,
            },
            dryRun: {
              description: "Don't write anything, only show what's gonna be done",
              type: "boolean",
              default: false,
            },
          }),
      async (argv) => {
        const logger = createLogger(false);
        await runWithErrorHandling(logger, async () => {
          const driver = await createWebDriver(logger);
          await fetchLessons({
            driver,
            langTerm: argv.lang,
            outDirpath: argv.path,
            secretFilepath: argv.secret,
            select: argv.select ?? [...targets],
            logger,
            dryRun: argv.dryRun,
          });
          await driver.quit();
        });
      }
    )
    .strict();
}

async function runWithErrorHandling(logger: Logger, func: (logger: Logger) => any) {
  try {
    await func(logger);
  } catch (e) {
    if (e instanceof OutOfSync || e instanceof error.NoSuchElementError) {
      logger.err(e.message);
      logger.warn(`This script should be updated to match the current version of the website.`);
      logger.warn("Please contact the developer.");
    } else if (e instanceof Error) {
      logger.err(e.message);
    } else {
      throw e;
    }
  }
}
