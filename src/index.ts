import { Builder, By, Key, until, WebDriver, error } from "selenium-webdriver";
import http from "https";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { langs, BASE_URL, IDENT } from "./const";

dotenv.config({ override: true });

const config = ensureConfig([
  "USERNAME",
  "PASSWORD",
  "LANGUAGE",
  "OUTDIR",
] as const);

(async function main() {
  let driver = await new Builder().forBrowser("chrome").build();
  try {
    const lessonsUrl = getLessonsUrl(BASE_URL, config.LANGUAGE);

    log(`Logging in to LINGUA.COM... `);
    await login(driver, BASE_URL, config.USERNAME, config.PASSWORD);
    log(`🗹\n`);

    log(`Discovering lessons for "${config.LANGUAGE}" language... `);
    const lessonsBySections = await getLessons(driver, lessonsUrl);
    log(`🗹\n`);

    log(`Fetching lessons...\n`);
    for (const sectionName of lessonsBySections.keys()) {
      log(`${IDENT}Section: ${sectionName}\n`);
      for (const lesson of lessonsBySections.get(sectionName)!) {
        log(`${IDENT}${IDENT}Getting lesson "${lesson.lessonNo}": `);
        await getLesson(driver, lesson, sectionName, config.OUTDIR);
        log(`\n`);
      }
    }
    log(`🗹 Done.\n`);
  } finally {
    await delay(5000);
    await driver.quit();
  }
})();

async function login(
  driver: WebDriver,
  url: string,
  username: string,
  password: string
) {
  try {
    await driver.get(url);
    await delay(2000);
    await driver.findElement(By.css(".button.open-account")).click();
    await driver
      .findElement(By.css(".input-text.input-username"))
      .sendKeys(username);
    await driver
      .findElement(By.css(".input-text.input-password"))
      .sendKeys(password);
    await driver.findElement(By.css("input.button")).click();
    await driver.wait(until.titleIs("Lingua.com: My Account"), 3000);
  } catch (e) {
    if (e instanceof Error) {
      err(e.message);
      halt();
    } else {
      throw e;
    }
  }
}

type Lesson = {
  url: string;
  lessonNo: string;
};

async function getLessons(driver: WebDriver, url: string) {
  await driver.get(`${url}`);

  const lessonsBySections = new Map<string, Lesson[]>();

  let sectionName = "";
  let lessonIndex = 0;

  const exerciseEls = await driver.findElements(
    By.xpath("//div[@id='exercises']/*")
  );

  for (const exerciseEl of exerciseEls) {
    const tag = await exerciseEl.getTagName();
    if (tag === "h2") {
      sectionName = await exerciseEl.getText();
      lessonIndex = 0;
      lessonsBySections.set(sectionName, []);
    } else {
      const linkEls = await exerciseEl.findElements(
        By.xpath("descendant::tr/td[position() = 1][a]/a")
      );
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

async function getLesson(
  driver: WebDriver,
  { url, lessonNo }: Lesson,
  section: string,
  outDir: string
) {
  await driver.get(url);
  const exercise = await driver.findElement(By.id("exercise"));
  const title = await exercise
    .findElement(By.xpath("div[position() = 1]/h1"))
    .getText();

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
      .findElement(
        By.xpath(
          "//a[substring(@href, string-length(@href) - string-length('.pdf') + 1)  = '.pdf']"
        )
      )
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
  const audioSource = await exercise.findElement(
    By.xpath("//audio/source[position() = 1]")
  );
  const audioUrl = await audioSource.getAttribute("src");
  await downloadFile(audioUrl, path.join(dir, `${lessonName}.mp3`));
  log(`🗹`);
}

function getLessonsUrl(baseUrl: string, lang: string) {
  if (!langs.has(lang)) {
    err(`Language not found: "${lang}"`);
    err(`Allowed languages: ${[...langs.keys()].join(", ")}.`);
    halt();
  }
  return `${baseUrl}/${langs.get(lang)!}/reading/`;
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

function log(message: string) {
  process.stdout.write(message);
}

function err(message: string) {
  process.stderr.write("\n" + message);
}

function halt() {
  process.exit(1);
}
