import { Builder, error, Browser } from "selenium-webdriver";
import { WebDriverError } from "../errors";
import { Logger } from "./logger.service";

export async function createWebDriver({ err }: Logger) {
  try {
    const driver = await new Builder().forBrowser(Browser.CHROME).build();
    // await driver.manage().setTimeouts({ implicit: 500 });
    return driver;
  } catch (e) {
    if (e instanceof error.SessionNotCreatedError) {
      throw new WebDriverError(`
        ${err.name}: ${e.message}

        Possible problem with ChromeDriver detected.

        \n1) Download the version of ChromeDriver which matches the version of browser (check out the message above) from here: https://chromedriver.chromium.org/downloads .,
        \n2) Unpack and place the binary somewhere in the PATH.,
        \n3) Rerun this script.
      `);
    } else {
      throw e;
    }
  }
}
