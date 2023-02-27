import { By, until, WebDriver, error } from "selenium-webdriver";
import http from "https";
import { existsSync, mkdirSync, createWriteStream } from "fs";
import { writeFile } from "fs/promises";
import path from "path";
import { Logger } from "../services/logger.service";
import { LoginError, OutOfSync } from "../errors";
import { Target, TargetsEnum, LINGUA_COM_BASE_URL, SPEED_BAN_DELAY } from "./const";
import { getLanguages } from "./languages.script";
import { Language } from "./types";
import { readCredentials } from "../services/credentials.service";
import { doneBox, errBox, missedBox, premiumBox, skipBox } from "./utils";

const IDENT = "  ";

type FetchLessonsProps = {
  driver: WebDriver;
  langTerm: string;
  outDirpath: string;
  secretFilepath: string;
  select: Target[];
  logger: Logger;
  dryRun: boolean;
};

type Lesson = {
  url: string | null;
  lessonNo: string;
  premium: boolean;
};

export async function fetchLessons({
  driver,
  langTerm,
  outDirpath,
  secretFilepath,
  select,
  logger,
  dryRun,
}: FetchLessonsProps) {
  async function login() {
    const credentials = await readCredentials(secretFilepath);
    if (credentials == null) {
      warn("Credentials file not found, proceeding anonynously");
      return;
    }
    info.raw(`Logging in as "${credentials.username}"… `);
    await driver.get(LINGUA_COM_BASE_URL);
    await delay(1000);
    await driver.findElement(By.css(".button.open-account")).click();
    await driver.findElement(By.css(".input-text.input-username")).sendKeys(credentials.username);
    await driver.findElement(By.css(".input-text.input-password")).sendKeys(credentials.password);
    await driver.findElement(By.css("button[type='submit']")).click();
    try {
      const errText = await driver.findElement(By.css(".form-error-message")).getText();
      throw new LoginError(`Cannot log in: ${errText}`);
    } catch (e) {
      if (e instanceof error.NoSuchElementError) {
        await driver.wait(until.titleIs("Lingua.com: My Account"), 3000);
      } else {
        throw e;
      }
    }
    info(doneBox());
  }

  async function findLessons(language: Language, url: string) {
    info.raw(`Discovering lessons for "${language.title}"… `);
    await driver.get(url);

    const lessonsBySections = new Map<string, Lesson[]>();

    let sectionName = "";
    let lessonIndex = 0;

    const els = await driver.findElements(By.css(".panel-exercises>*"));

    for (const el of els) {
      const clx = (await el.getAttribute("class")).split(/\s+/);
      if (clx.includes("exercise-list-headline")) {
        sectionName = await el.getText();
        lessonIndex = 0;
        lessonsBySections.set(sectionName, []);
      } else if (clx.includes("exercise-list")) {
        const exerciseEls = await el.findElements(By.css(".exercise-list-item"));
        for (const exerciseEl of exerciseEls) {
          const premium = (await exerciseEl.getAttribute("class")).split(/\s+/).includes("premium-content");
          lessonIndex++;
          const linkEls = await exerciseEl.findElements(By.xpath("descendant::a[position() = 1]"));
          const url = linkEls.length > 0 ? await linkEls[0].getAttribute("href") : null;
          lessonsBySections.get(sectionName)!.push({
            url,
            lessonNo: formatLessonNo(lessonIndex),
            premium,
          });
        }
      }
    }
    if (lessonsBySections.size === 0) {
      throw new OutOfSync("Found 0 lessons");
    }
    info(doneBox());
    info(
      `Found sections:\n${[...lessonsBySections.entries()]
        .map(([key, items]) => {
          return `${IDENT}"${key}" with ${items.length} lessons`;
        })
        .join("\n")}`
    );

    return lessonsBySections;
  }

  async function getLessons(lessonsBySections: Map<string, Lesson[]>) {
    info(`Fetching lessons...`);
    try {
      for (const sectionName of lessonsBySections.keys()) {
        info(`${IDENT}Section: "${sectionName}"`);
        for (const lesson of lessonsBySections.get(sectionName)!) {
          const title = `Lesson "${lesson.lessonNo}"`;
          info.raw(`${IDENT}${IDENT}${lesson.premium ? premiumBox(title) : title}:`);
          await getLesson(sectionName, lesson);
          await delay(SPEED_BAN_DELAY);
        }
      }
    } finally {
      info("");
    }
  }

  async function getLesson(sectionName: string, { url, lessonNo, premium }: Lesson) {
    if (url == null) {
      info(`\t${premiumBox("premium")}`);
      return;
    }
    await driver.get(url);

    const exercise = await driver.findElement(By.id("exercise"));
    const title = await exercise.findElement(By.xpath("div[position() = 1]/h1")).getText();

    const lessonName = `${lessonNo} - ${title}`;
    const dirpath = path.join(outDirpath, sectionName, lessonName);

    !dryRun && mkdirSync(dirpath, { recursive: true });

    if (select.includes(TargetsEnum.TXT)) {
      info.raw(`\tTXT `);
      const paras = await exercise.findElements(By.xpath("div[position() = 1]/p"));
      let outText = title + "\n";
      for (let p of paras) {
        outText += "\n" + (await p.getText()) + "\n";
      }
      !dryRun && (await writeFile(path.join(dirpath, `${lessonName}.txt`), outText));
      info.raw(doneBox());
    } else {
      info.raw(skipBox(`\tTXT `) + skipBox());
    }

    if (select.includes(TargetsEnum.PDF)) {
      info.raw(`\tPDF `);
      try {
        const pdfUrl = await driver
          .findElement(By.xpath("//a[substring(@href, string-length(@href) - string-length('.pdf') + 1)  = '.pdf']"))
          .getAttribute("href");
        !dryRun && (await downloadFile(pdfUrl, path.join(dirpath, `${lessonName}.pdf`)));
        info.raw(doneBox());
      } catch (e) {
        if (e instanceof error.NoSuchElementError) {
          info.raw(missedBox());
        }
      }
    } else {
      info.raw(skipBox(`\tPDF `) + skipBox());
    }

    if (select.includes(TargetsEnum.MP3)) {
      info.raw(`\tMP3 `);
      try {
        const audioEls = await exercise.findElements(By.css(".lingua-player > audio"));
        if (audioEls.length > 0) {
          const audioSource = await audioEls[0].findElement(By.css("source"));
          const audioUrl = await audioSource.getAttribute("src");
          await delay(1000);
          !dryRun && (await downloadFile(audioUrl, path.join(dirpath, `${lessonName}.mp3`)));
          info.raw(doneBox());
        } else {
          info.raw(premiumBox());
        }
      } catch (e) {
        if (e instanceof error.NoSuchElementError) {
          info.raw(errBox());
        } else {
          throw e;
        }
      }
    } else {
      info.raw(skipBox(`\tMP3 `) + skipBox());
    }

    info("");
  }

  //
  // Main function body
  //

  const { info, warn } = logger;

  // Check output dirpath
  if (existsSync(outDirpath) && !dryRun) {
    throw new Error(`Output directory "${outDirpath}" must not exist.`);
  }

  const language = findLanguage(langTerm, await getLanguages(driver, logger));
  if (language == null) {
    throw new Error(`Can't find language: "${langTerm}"`);
  }
  const lessonsUrl = language.url;

  await login();

  const lessonsBySections = await findLessons(language, lessonsUrl);
  await getLessons(lessonsBySections);
}

// Utility functions

function findLanguage(term: string, languages: Language[]): Language | undefined {
  return languages.find((l) => (term.length === 2 ? l.lang === term : l.name === term));
}

async function downloadFile(url: string, filepath: string) {
  const file = createWriteStream(filepath);
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

function delay(ms: number) {
  return new Promise((r) => {
    setTimeout(r, ms);
  });
}

function formatLessonNo(num: number) {
  return num.toString().padStart(2, "0");
}
