import { By, WebDriver } from "selenium-webdriver";
import { OutOfSync } from "../errors";
import { Logger } from "../services/logger.service";
import { assertNotEmpty } from "./asserts";
import { LINGUA_COM_BASE_URL } from "./const";
import { Language } from "./types";
import { doneBox } from "./utils";

export async function listLanguages(driver: WebDriver, logger: Logger) {
  const languages = await getLanguages(driver, logger);
  const { info } = logger;
  info(`Found ${languages.length} languages:`);
  for (const { lang, name, title } of languages) {
    console.log(`code: ${lang}, name: ${name}`);
  }
}

export async function getLanguages(driver: WebDriver, { info }: Logger): Promise<Language[]> {
  info.raw("Fetching language list… ");
  await driver.get(LINGUA_COM_BASE_URL);
  const els = await driver.findElements(By.css(".leader-content a.button_flag"));
  if (els.length === 0) {
    throw new OutOfSync("Can't fetch languages list");
  }
  const languages: Language[] = [];
  for (const el of els) {
    const clsx = (await el.getAttribute("class")).split(/\s+/);
    const lang = clsx.find((cls) => cls.startsWith("flag_"))?.match(/flag_(.+)/)?.[1];
    assertNotEmpty(lang, "Get lang code from class");
    const href = await el.getAttribute("href");
    const name = href.match(/\/([^\/]+)\/reading/)?.[1];
    assertNotEmpty(name, "Get lang name from href");
    languages.push({
      lang,
      name,
      url: await el.getAttribute("href"),
      title: await el.getAttribute("title"),
    });
  }
  info(doneBox());
  return languages;
}
