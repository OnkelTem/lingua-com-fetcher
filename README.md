# Lingua.com premium lessons fetcher

This respository contains a [Selenium](https://www.selenium.dev/) script which
fetches lessons from the https://lingua.com/ website.

Specifically it downloads:

1. Lesson texts
2. Lesson audio (for Premium users)
3. Lesson PDF (if provided)

## Requirements

You need to have the [Lingua.com premium access](https://lingua.com/premium/) to get things done.

## Usage

Clone this repository and install dependencies:

```
$ git clone git@github.com:OnkelTem/lingua-com-fetcher.git
$ cd lingua-com-fetcher
$ npm i
```

Before running the script, you need to create the `.env` file.

```
# Your Lingua.com username
USERNAME=myuser

# Your Lingua.com password
PASSWORD=mypassword

# Language
LANGUAGE=turkish

# Output dir
OUTDIR=lessons
```

Use `.env.example` as a template.

Now that you're ready, run the script:

```
$ npm run start
```

Sample output:

```
Logging in to LINGUA.COM... ð¹
Discovering lessons for "turkish" language... ð¹
Fetching lessons...
 Section: Level A1
  Getting lesson "01":  TXT ð¹   PDF ð¹   MP3 ð¹
  Getting lesson "02":  TXT ð¹   PDF ð¹   MP3 ð¹
  Getting lesson "03":  TXT ð¹   PDF ð¹   MP3 ð¹
  Getting lesson "04":  TXT ð¹   PDF ð¹   MP3 ð¹
  Getting lesson "05":  TXT ð¹   PDF ð¹   MP3 ð¹
  Getting lesson "06":  TXT ð¹   PDF ð¹   MP3 ð¹
  ...
```

And the corresponding file tree:

```
lessons/
âââ Level A1
âÂ Â  âââ 01 - Ailem ve Ben
âÂ Â  âÂ Â  âââ 01 - Ailem ve Ben.mp3
âÂ Â  âÂ Â  âââ 01 - Ailem ve Ben.pdf
âÂ Â  âÂ Â  âââ 01 - Ailem ve Ben.txt
âÂ Â  âââ 02 - Benim Odam
âÂ Â  âÂ Â  âââ 02 - Benim Odam.mp3
âÂ Â  âÂ Â  âââ 02 - Benim Odam.pdf
âÂ Â  âÂ Â  âââ 02 - Benim Odam.txt
âÂ Â  âââ 03 - CanÄ±m Ailem
âÂ Â  âÂ Â  âââ 03 - CanÄ±m Ailem.mp3
âÂ Â  âÂ Â  âââ 03 - CanÄ±m Ailem.pdf
âÂ Â  âÂ Â  âââ 03 - CanÄ±m Ailem.txt
âÂ Â  âââ 04 - DoÄum GÃ¼nÃ¼
âÂ Â  âÂ Â  âââ 04 - DoÄum GÃ¼nÃ¼.mp3
âÂ Â  âÂ Â  âââ 04 - DoÄum GÃ¼nÃ¼.pdf
âÂ Â  âÂ Â  âââ 04 - DoÄum GÃ¼nÃ¼.txt
âÂ Â  âââ 05 - Melis ve KardeÅi
âÂ Â  âÂ Â  âââ 05 - Melis ve KardeÅi.mp3
âÂ Â  âÂ Â  âââ 05 - Melis ve KardeÅi.pdf
âÂ Â  âÂ Â  âââ 05 - Melis ve KardeÅi.txt
âÂ Â  âââ 06 - Tren Ä°stasyonu
âÂ Â  âÂ Â  âââ 06 - Tren Ä°stasyonu.mp3
âÂ Â  âÂ Â  âââ 06 - Tren Ä°stasyonu.pdf
âÂ Â  âÂ Â  âââ 06 - Tren Ä°stasyonu.txt

```

Happy Languages Learning!
