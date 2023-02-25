# Lingua.com lessons fetcher

This repository contains a [Selenium](https://www.selenium.dev/) script that
fetches lessons from the https://lingua.com/ website.

Specifically, it downloads:

1. Lesson texts
2. Lesson audio files
3. Lesson PDFs (with exercises)

## Lessons Access

This script can function in 3 modes:

- anonymous
- free (signed in)
- premium (signed in)

I didn't see any difference between anonymous and free content. Both can access the same limited set of lessons and almost without audio. With [premium](https://lingua.com/premium/) access, you can download everything.

## Install

```
$ npm i -g lingua-com-fetcher
```

To update to the latest version:

```
$ npm i -g lingua-com-fetcher@latest
```

## Usage

List available languages:

```
$ lingua-com-fetcher ls

Fetching language list… 🗹
Found 16 languages:
code: en, name: english
code: es, name: spanish
...
```

Download lessons for a language:

```
$ lingua-com-fetcher fetch <lang> <path>
```

For example, to fetch lessons for the Spanish language into `outdir` directory:

```
$ lingua-com-fetcher fetch es outdir

Fetching language list… 🗹
Logging in as "username"… 🗹
Discovering lessons for "Spanish"… 🗹
Found sections:
  "Level A1" with 14 lessons
  "Level A2" with 30 lessons
  "Level B1" with 45 lessons
  "Level B2" with 23 lessons
Fetching lessons...
  Section: "Level A1"
    Lesson "01":        TXT 🗹   PDF 🗹   MP3 🗹
    Lesson "02":        TXT 🗹   PDF 🗹   MP3 🗹
...
```

## Providing Credentials

If you create a file called **lingua-com-secret.json**, it will be used to log you in:

```json
{
  "username": "Your-Lingua-Com-Username",
  "password": "Your-Lingua-Com-Password"
}
```

If placed in the current directory, it will be read automatically. You can also provide its path via the `--secret` option:

```
$ lingua-com-fetcher --secret path/to/your/secret.json fetch businessenglish outdir
```

## CLI reference

`$ lingua-com-fetcher --help`:

```
lingua-com-fetcher <command>

Commands:
  lingua-com-fetcher ls                   Lists available languages.
  lingua-com-fetcher fetch <lang> <path>  Fetches lessons for the <lang> into
                                          <path>.

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```

`$ lingua-com-fetcher fetch --help`:

```
lingua-com-fetcher fetch <lang> <path>

Fetches lessons for the <lang> into <path>.

Positionals:
  lang  Lessons language. Can be either two-letter code or language name as it's
        shown by the `ls` command.                           [string] [required]
  path  Lessons output directory.                            [string] [required]

Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
  -s, --secret   Path to the file with your Lingua.com credentials.
                                    [string] [default: "lingua-com-secret.json"]
      --dryRun   Don't write anything, only show what's gonna be done
                                                      [boolean] [default: false]
```

## License
