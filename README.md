# Lingua.com premium lessons fetcher

This repository contains a [Selenium](https://www.selenium.dev/) script that
fetches lessons from the https://lingua.com/ website.

Specifically, it downloads:

1. Lesson texts
2. Lesson audio (for Premium users)
3. Lesson PDF (if provided)

## Requirements

You need to have a [Lingua.com (premium) account](https://lingua.com/premium/) to get things done.

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
USERNAME=username

# Your Lingua.com password
PASSWORD=password

# Target language
LANGUAGE=turkish

# Output dir
OUTDIR=lessons
```

Use `.env.example` as a template.

After that, you can run the script as:

```
$ npm run start
```

Sample output:

```
Logging in to LINGUA.COM... 🗹
Discovering lessons for "turkish" language... 🗹
Fetching lessons...
 Section: Level A1
  Getting lesson "01":  TXT 🗹   PDF 🗹   MP3 🗹
  Getting lesson "02":  TXT 🗹   PDF 🗹   MP3 🗹
  Getting lesson "03":  TXT 🗹   PDF 🗹   MP3 🗹
  Getting lesson "04":  TXT 🗹   PDF 🗹   MP3 🗹
  Getting lesson "05":  TXT 🗹   PDF 🗹   MP3 🗹
  Getting lesson "06":  TXT 🗹   PDF 🗹   MP3 🗹
  ...
```

And the corresponding file tree:

```
lessons/
├── Level A1
│   ├── 01 - Ailem ve Ben
│   │   ├── 01 - Ailem ve Ben.mp3
│   │   ├── 01 - Ailem ve Ben.pdf
│   │   └── 01 - Ailem ve Ben.txt
│   ├── 02 - Benim Odam
│   │   ├── 02 - Benim Odam.mp3
│   │   ├── 02 - Benim Odam.pdf
│   │   └── 02 - Benim Odam.txt
│   ├── 03 - Canım Ailem
│   │   ├── 03 - Canım Ailem.mp3
│   │   ├── 03 - Canım Ailem.pdf
│   │   └── 03 - Canım Ailem.txt
│   ├── 04 - Doğum Günü
│   │   ├── 04 - Doğum Günü.mp3
│   │   ├── 04 - Doğum Günü.pdf
│   │   └── 04 - Doğum Günü.txt
│   ├── 05 - Melis ve Kardeşi
│   │   ├── 05 - Melis ve Kardeşi.mp3
│   │   ├── 05 - Melis ve Kardeşi.pdf
│   │   └── 05 - Melis ve Kardeşi.txt
│   ├── 06 - Tren İstasyonu
│   │   ├── 06 - Tren İstasyonu.mp3
│   │   ├── 06 - Tren İstasyonu.pdf
│   │   └── 06 - Tren İstasyonu.txt

```

Happy Languages Learning!
