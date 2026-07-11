export type ZodiacSector = {
  id: string;
  month: string;
  hebrewMonth: string;
  sign: string;
  signTransliteration: string;
  glyph: string;
  tribe: string;
  letter: string;
  letterName: string;
  faculty: string;
  figure: string;
};

export const ZODIAC_SECTORS: readonly ZodiacSector[] = [
  { id: "nisan", month: "Nisan", hebrewMonth: "ניסן", sign: "Aries", signTransliteration: "T'leh", glyph: "♈", tribe: "Judah", letter: "ה", letterName: "Hei", faculty: "Speech", figure: "The Ram" },
  { id: "iyar", month: "Iyar", hebrewMonth: "אייר", sign: "Taurus", signTransliteration: "Shor", glyph: "♉", tribe: "Issachar", letter: "ו", letterName: "Vav", faculty: "Thought", figure: "The Bull" },
  { id: "sivan", month: "Sivan", hebrewMonth: "סיון", sign: "Gemini", signTransliteration: "Teomim", glyph: "♊", tribe: "Zebulun", letter: "ז", letterName: "Zayin", faculty: "Walking", figure: "The Twins" },
  { id: "tammuz", month: "Tammuz", hebrewMonth: "תמוז", sign: "Cancer", signTransliteration: "Sartan", glyph: "♋", tribe: "Reuben", letter: "ח", letterName: "Chet", faculty: "Sight", figure: "The Crab" },
  { id: "av", month: "Av", hebrewMonth: "אב", sign: "Leo", signTransliteration: "Aryeh", glyph: "♌", tribe: "Shimon", letter: "ט", letterName: "Tet", faculty: "Hearing", figure: "The Lion" },
  { id: "elul", month: "Elul", hebrewMonth: "אלול", sign: "Virgo", signTransliteration: "Betulah", glyph: "♍", tribe: "Gad", letter: "י", letterName: "Yud", faculty: "Action", figure: "The Maiden" },
  { id: "tishrei", month: "Tishrei", hebrewMonth: "תשרי", sign: "Libra", signTransliteration: "Moznayim", glyph: "♎", tribe: "Ephraim", letter: "ל", letterName: "Lamed", faculty: "Relationship", figure: "The Scales" },
  { id: "cheshvan", month: "Cheshvan", hebrewMonth: "חשון", sign: "Scorpio", signTransliteration: "Akrav", glyph: "♏", tribe: "Menasheh", letter: "נ", letterName: "Nun", faculty: "Smell", figure: "The Scorpion" },
  { id: "kislev", month: "Kislev", hebrewMonth: "כסלו", sign: "Sagittarius", signTransliteration: "Keshet", glyph: "♐", tribe: "Benjamin", letter: "ס", letterName: "Samech", faculty: "Sleep", figure: "The Archer" },
  { id: "tevet", month: "Tevet", hebrewMonth: "טבת", sign: "Capricorn", signTransliteration: "Gedi", glyph: "♑", tribe: "Dan", letter: "ע", letterName: "Ayin", faculty: "Intensity", figure: "The Sea-Goat" },
  { id: "shevat", month: "Shevat", hebrewMonth: "שבט", sign: "Aquarius", signTransliteration: "D'li", glyph: "♒", tribe: "Asher", letter: "צ", letterName: "Tzadi", faculty: "Taste", figure: "The Water Bearer" },
  { id: "adar", month: "Adar", hebrewMonth: "אדר", sign: "Pisces", signTransliteration: "Dagim", glyph: "♓", tribe: "Naftali", letter: "ק", letterName: "Qof", faculty: "Laughter", figure: "The Fish" }
];
