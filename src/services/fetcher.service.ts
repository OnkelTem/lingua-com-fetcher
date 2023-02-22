import { Builder, By, Key, until, WebDriver, error, Browser } from "selenium-webdriver";
import http from "https";
import fs from "fs";
import path from "path";
import { Logger } from "./logger.service";
import { OutOfSync } from "../errors";
// import dotenv from "dotenv";

const LINGUA_COM_BASE_URL = "https://lingua.com";
const IDENT = "  ";

// dotenv.config({ override: true });

// const config = ensureConfig(["USERNAME", "PASSWORD", "LANGUAGE", "OUTDIR"] as const);

type FetchLessonsProps = {
  language: string;
  outDirpath: string;
  credentials: {
    username: string;
    password: string;
  };
  debug: boolean;
};

type Lesson = {
  url: string;
  lessonNo: string;
};

export async function fetchLessons({ language, outDirpath, credentials, debug }: FetchLessonsProps, logger: Logger) {
  const { log } = logger;
  try {
    const driver = await new Builder().forBrowser(Browser.CHROME).build();
    try {
      const lessonsUrl = getLessonsUrl(LINGUA_COM_BASE_URL, language);

      // TODO: check that page exists

      log(`Logging in to LINGUA.COM... `);
      await login(driver, LINGUA_COM_BASE_URL, credentials.username, credentials.password);
      log(`🗹\n`);

      log(`Discovering lessons for "${language}" language... `);
      const lessonsBySections = await getLessons(driver, lessonsUrl);
      if (lessonsBySections.size === 0) {
        log(
          `\n\nFound 0 lessons.\nIt seems like this script should be updated to match the current version of the website.\nPlease contact the developer.`
        );
        log(`\n\nAborting...`);
        throw new Error();
      } else {
        log(`\nFound ${lessonsBySections.size} sections with lessons 🗹\n`);
      }

      log(`Fetching lessons...\n`);
      for (const sectionName of lessonsBySections.keys()) {
        log(`${IDENT}Section: ${sectionName}\n`);
        for (const lesson of lessonsBySections.get(sectionName)!) {
          log(`${IDENT}${IDENT}Getting lesson "${lesson.lessonNo}": `);
          await getLesson(driver, lesson, sectionName, outDirpath);
          log(`\n`);
        }
      }
      log(`🗹 Done.\n`);
    } catch (e) {
      if (e instanceof Error) {
        throw new OutOfSync(e.message);
      }
    } finally {
      await delay(2000);
      await driver.quit();
    }
  } catch (err) {
    if (err instanceof error.SessionNotCreatedError) {
      console.log(`${err.name}: ${err.message}`);
      console.log("\nPossible problem with ChromeDriver detected.");
      console.log(
        "\n1) Download the version of ChromeDriver which matches the version of browser (check out the message above) from here: https://chromedriver.chromium.org/downloads .",
        "\n2) Unpack and place the binary somewhere in the PATH.",
        "\n3) Rerun this script."
      );
    }
  }

  // Functions
  async function login(driver: WebDriver, url: string, username: string, password: string) {
    await driver.get(url);
    await delay(2000);
    await driver.findElement(By.css(".button.open-account")).click();
    await driver.findElement(By.css(".input-text.input-username")).sendKeys(username);
    await driver.findElement(By.css(".input-text.input-password")).sendKeys(password);
    await driver.findElement(By.css("button[type='submit']")).click();
    await driver.wait(until.titleIs("Lingua.com: My Account"), 3000);
  }

  async function getLessons(driver: WebDriver, url: string) {
    await driver.get(`${url}`);

    const lessonsBySections = new Map<string, Lesson[]>();

    let sectionName = "";
    let lessonIndex = 0;

    const exerciseEls = await driver.findElements(By.css(".panel-exercises>*"));

    for (const exerciseEl of exerciseEls) {
      const cls = await exerciseEl.getAttribute("class");
      if (cls === "exercise-list-headline") {
        sectionName = await exerciseEl.getText();
        lessonIndex = 0;
        lessonsBySections.set(sectionName, []);
      } else {
        const linkEls = await exerciseEl.findElements(By.xpath("descendant::li/div[position() = 1]/div/a"));
        for (const linkEl of linkEls) {
          lessonIndex++;
          lessonsBySections.get(sectionName)!.push({
            url: await linkEl.getAttribute("href"),
            lessonNo: formatLessonNo(lessonIndex),
          });
        }
      }
    }

    return lessonsBySections;
  }

  async function getLesson(driver: WebDriver, { url, lessonNo }: Lesson, section: string, outDir: string) {
    await driver.get(url);
    const exercise = await driver.findElement(By.id("exercise"));
    const title = await exercise.findElement(By.xpath("div[position() = 1]/h1")).getText();

    const lessonName = `${lessonNo} - ${title}`;
    const dir = path.join(outDir, section, lessonName);
    prepareDirectory(dir);

    log(`\tTXT `);
    const paras = await exercise.findElements(By.xpath("div[position() = 1]/p"));
    let outText = title + "\n";
    for (let p of paras) {
      outText += "\n" + (await p.getText()) + "\n";
    }
    await saveFile(outText, path.join(dir, `${lessonName}.txt`));
    log(`🗹`);

    try {
      log(`\tPDF `);
      const pdfUrl = await driver
        .findElement(By.xpath("//a[substring(@href, string-length(@href) - string-length('.pdf') + 1)  = '.pdf']"))
        .getAttribute("href");
      await downloadFile(pdfUrl, path.join(dir, `${lessonName}.pdf`));
      log(`🗹`);
    } catch (e) {
      if (e instanceof error.NoSuchElementError) {
        log(`𐄂`);
      }
    }

    log(`\tMP3 `);
    await delay(2000);
    const audioSource = await exercise.findElement(By.xpath("//audio/source[position() = 1]"));
    const audioUrl = await audioSource.getAttribute("src");
    await downloadFile(audioUrl, path.join(dir, `${lessonName}.mp3`));
    log(`🗹`);
  }

  function getLessonsUrl(baseUrl: string, language: string) {
    return `${baseUrl}/${language}/reading/`;
  }

  async function downloadFile(url: string, localName: string) {
    const file = fs.createWriteStream(localName);
    return new Promise<undefined>((resolve) => {
      http.get(url, function (response) {
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve(undefined);
        });
      });
    });
  }

  function saveFile(data: string, localName: string) {
    return new Promise<undefined>((resolve) => {
      fs.writeFile(localName, data, (err) => {
        resolve(undefined);
      });
    });
    fs.writeFileSync(localName, data);
  }

  function delay(ms: number) {
    return new Promise((r) => {
      setTimeout(r, ms);
    });
  }

  function prepareDirectory(path: string) {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
  }

  type TupleToObject<T extends readonly any[]> = {
    [k in T[number]]: string;
  };

  function ensureConfig<T extends readonly any[]>(keys: T): TupleToObject<T> {
    return keys.reduce((accum: TupleToObject<T>, item: T[number]) => {
      if (process.env[item] == null) throw new Error(`${item} is not defined`);
      accum[item] = process.env[item]!;
      return accum;
    }, {});
  }

  function formatLessonNo(num: number) {
    return num.toString().padStart(2, "0");
  }
}
