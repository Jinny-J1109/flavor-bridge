"use client";

import { useState, useCallback } from "react";

// Map cuisine types to BCP 47 language tags for SpeechSynthesis
const cuisineLanguageMap: Record<string, string> = {
  Chinese: "zh-CN",
  Japanese: "ja-JP",
  Korean: "ko-KR",
  Thai: "th-TH",
  Vietnamese: "vi-VN",
  Hindi: "hi-IN",
  Arabic: "ar-SA",
  Spanish: "es-ES",
  French: "fr-FR",
  Italian: "it-IT",
  German: "de-DE",
  Portuguese: "pt-BR",
  Greek: "el-GR",
  Turkish: "tr-TR",
  Russian: "ru-RU",
};

function detectLanguage(text: string): string {
  // Simple heuristic: check Unicode ranges
  if (/[\u4e00-\u9fff]/.test(text)) return "zh-CN";
  if (/[\u3040-\u30ff]/.test(text)) return "ja-JP";
  if (/[\uac00-\ud7af]/.test(text)) return "ko-KR";
  if (/[\u0e00-\u0e7f]/.test(text)) return "th-TH";
  if (/[\u0600-\u06ff]/.test(text)) return "ar-SA";
  if (/[\u0900-\u097f]/.test(text)) return "hi-IN";
  if (/[\u0400-\u04ff]/.test(text)) return "ru-RU";
  return "en-US";
}

interface Props {
  text: string;
  pronunciation: string;
  cuisineType?: string;
}

export default function PronunciationPlayer({ text, pronunciation, cuisineType }: Props) {
  const [playing, setPlaying] = useState(false);
  const [slow, setSlow] = useState(false);

  const speak = useCallback(() => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const lang = cuisineType
      ? cuisineLanguageMap[cuisineType] || detectLanguage(text)
      : detectLanguage(text);

    utterance.lang = lang;
    utterance.rate = slow ? 0.5 : 0.8;
    utterance.onstart = () => setPlaying(true);
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);

    // Try to find a voice matching the language
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) => v.lang.startsWith(lang.split("-")[0]));
    if (match) utterance.voice = match;

    window.speechSynthesis.speak(utterance);
  }, [text, cuisineType, slow]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={speak}
        disabled={playing}
        className="inline-flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50"
      >
        <span className="text-base">{playing ? "..." : "🔊"}</span>
        <span className="italic text-gray-500">{pronunciation}</span>
      </button>
      <button
        onClick={() => setSlow((s) => !s)}
        className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
          slow
            ? "bg-orange-100 border-orange-300 text-orange-700"
            : "bg-gray-100 border-gray-300 text-gray-500"
        }`}
      >
        {slow ? "Slow" : "Normal"}
      </button>
    </div>
  );
}
