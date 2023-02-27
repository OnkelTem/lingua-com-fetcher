export const LINGUA_COM_BASE_URL = "https://lingua.com";
export const SPEED_BAN_DELAY = 1000;
export enum TargetsEnum {
  TXT = "txt",
  PDF = "pdf",
  MP3 = "mp3",
  // QUIZ = "quiz",
}
export const targets = [TargetsEnum.TXT, TargetsEnum.PDF, /* TargetsEnum.QUIZ, */ TargetsEnum.MP3] as const;
export type Target = typeof targets[number];
