import en from "./messages/en.json";
import ta from "./messages/ta.json";
import te from "./messages/te.json";
import kn from "./messages/kn.json";
import ml from "./messages/ml.json";

export const SUPPORTED_LANGUAGES = ["en", "ta", "te", "kn", "ml"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export type Messages = Record<string, string>;

export const dictionaries: Record<Language, Messages> = {
  en,
  ta,
  te,
  kn,
  ml,
};
