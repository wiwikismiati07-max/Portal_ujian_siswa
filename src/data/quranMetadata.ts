export interface QuranSurah {
  number: number;
  nameArabic: string;
  nameLatin: string;
  englishName: string;
  totalAyahs: number;
  revelation: 'Makkiyah' | 'Madaniyah';
  juzList: number[];
}

export interface QuranJuz {
  juz: number;
  name: string;
  start: string;
  end: string;
  surahs: number[];
}

export interface AyahItem {
  numberInSurah: number;
  text: string;
  surahNumber?: number;
  surahNameLatin?: string;
}

export const QURAN_SURAHS: QuranSurah[] = [
  {
    "number": 1,
    "nameArabic": "سُورَةُ ٱلْفَاتِحَةِ",
    "nameLatin": "Al-Fatihah",
    "englishName": "Al-Faatiha",
    "totalAyahs": 7,
    "revelation": "Makkiyah",
    "juzList": [
      1
    ]
  },
  {
    "number": 2,
    "nameArabic": "سُورَةُ البَقَرَةِ",
    "nameLatin": "Al-Baqarah",
    "englishName": "Al-Baqara",
    "totalAyahs": 286,
    "revelation": "Madaniyah",
    "juzList": [
      1,
      2,
      3
    ]
  },
  {
    "number": 3,
    "nameArabic": "سُورَةُ آلِ عِمۡرَانَ",
    "nameLatin": "Ali Imran",
    "englishName": "Aal-i-Imraan",
    "totalAyahs": 200,
    "revelation": "Madaniyah",
    "juzList": [
      3,
      4
    ]
  },
  {
    "number": 4,
    "nameArabic": "سُورَةُ النِّسَاءِ",
    "nameLatin": "An-Nisa",
    "englishName": "An-Nisaa",
    "totalAyahs": 176,
    "revelation": "Madaniyah",
    "juzList": [
      4,
      5,
      6
    ]
  },
  {
    "number": 5,
    "nameArabic": "سُورَةُ المَائـِدَةِ",
    "nameLatin": "Al-Maidah",
    "englishName": "Al-Maaida",
    "totalAyahs": 120,
    "revelation": "Madaniyah",
    "juzList": [
      6,
      7
    ]
  },
  {
    "number": 6,
    "nameArabic": "سُورَةُ الأَنۡعَامِ",
    "nameLatin": "Al-Anam",
    "englishName": "Al-An'aam",
    "totalAyahs": 165,
    "revelation": "Makkiyah",
    "juzList": [
      7,
      8
    ]
  },
  {
    "number": 7,
    "nameArabic": "سُورَةُ الأَعۡرَافِ",
    "nameLatin": "Al-Araf",
    "englishName": "Al-A'raaf",
    "totalAyahs": 206,
    "revelation": "Makkiyah",
    "juzList": [
      8,
      9
    ]
  },
  {
    "number": 8,
    "nameArabic": "سُورَةُ الأَنفَالِ",
    "nameLatin": "Al-Anfal",
    "englishName": "Al-Anfaal",
    "totalAyahs": 75,
    "revelation": "Madaniyah",
    "juzList": [
      9,
      10
    ]
  },
  {
    "number": 9,
    "nameArabic": "سُورَةُ التَّوۡبَةِ",
    "nameLatin": "At-Taubah",
    "englishName": "At-Tawba",
    "totalAyahs": 129,
    "revelation": "Madaniyah",
    "juzList": [
      10,
      11
    ]
  },
  {
    "number": 10,
    "nameArabic": "سُورَةُ يُونُسَ",
    "nameLatin": "Yunus",
    "englishName": "Yunus",
    "totalAyahs": 109,
    "revelation": "Makkiyah",
    "juzList": [
      11
    ]
  },
  {
    "number": 11,
    "nameArabic": "سُورَةُ هُودٍ",
    "nameLatin": "Hud",
    "englishName": "Hud",
    "totalAyahs": 123,
    "revelation": "Makkiyah",
    "juzList": [
      11,
      12
    ]
  },
  {
    "number": 12,
    "nameArabic": "سُورَةُ يُوسُفَ",
    "nameLatin": "Yusuf",
    "englishName": "Yusuf",
    "totalAyahs": 111,
    "revelation": "Makkiyah",
    "juzList": [
      12,
      13
    ]
  },
  {
    "number": 13,
    "nameArabic": "سُورَةُ الرَّعۡدِ",
    "nameLatin": "Ar-Rad",
    "englishName": "Ar-Ra'd",
    "totalAyahs": 43,
    "revelation": "Madaniyah",
    "juzList": [
      13
    ]
  },
  {
    "number": 14,
    "nameArabic": "سُورَةُ إِبۡرَاهِيمَ",
    "nameLatin": "Ibrahim",
    "englishName": "Ibrahim",
    "totalAyahs": 52,
    "revelation": "Makkiyah",
    "juzList": [
      13
    ]
  },
  {
    "number": 15,
    "nameArabic": "سُورَةُ الحِجۡرِ",
    "nameLatin": "Al-Hijr",
    "englishName": "Al-Hijr",
    "totalAyahs": 99,
    "revelation": "Makkiyah",
    "juzList": [
      14
    ]
  },
  {
    "number": 16,
    "nameArabic": "سُورَةُ النَّحۡلِ",
    "nameLatin": "An-Nahl",
    "englishName": "An-Nahl",
    "totalAyahs": 128,
    "revelation": "Makkiyah",
    "juzList": [
      14
    ]
  },
  {
    "number": 17,
    "nameArabic": "سُورَةُ الإِسۡرَاءِ",
    "nameLatin": "Al-Isra",
    "englishName": "Al-Israa",
    "totalAyahs": 111,
    "revelation": "Makkiyah",
    "juzList": [
      15
    ]
  },
  {
    "number": 18,
    "nameArabic": "سُورَةُ الكَهۡفِ",
    "nameLatin": "Al-Kahfi",
    "englishName": "Al-Kahf",
    "totalAyahs": 110,
    "revelation": "Makkiyah",
    "juzList": [
      15,
      16
    ]
  },
  {
    "number": 19,
    "nameArabic": "سُورَةُ مَرۡيَمَ",
    "nameLatin": "Maryam",
    "englishName": "Maryam",
    "totalAyahs": 98,
    "revelation": "Makkiyah",
    "juzList": [
      16
    ]
  },
  {
    "number": 20,
    "nameArabic": "سُورَةُ طه",
    "nameLatin": "Ta-Ha",
    "englishName": "Taa-Haa",
    "totalAyahs": 135,
    "revelation": "Makkiyah",
    "juzList": [
      16
    ]
  },
  {
    "number": 21,
    "nameArabic": "سُورَةُ الأَنبِيَاءِ",
    "nameLatin": "Al-Anbiya",
    "englishName": "Al-Anbiyaa",
    "totalAyahs": 112,
    "revelation": "Makkiyah",
    "juzList": [
      17
    ]
  },
  {
    "number": 22,
    "nameArabic": "سُورَةُ الحَجِّ",
    "nameLatin": "Al-Hajj",
    "englishName": "Al-Hajj",
    "totalAyahs": 78,
    "revelation": "Madaniyah",
    "juzList": [
      17
    ]
  },
  {
    "number": 23,
    "nameArabic": "سُورَةُ المُؤۡمِنُونَ",
    "nameLatin": "Al-Muminun",
    "englishName": "Al-Muminoon",
    "totalAyahs": 118,
    "revelation": "Makkiyah",
    "juzList": [
      18
    ]
  },
  {
    "number": 24,
    "nameArabic": "سُورَةُ النُّورِ",
    "nameLatin": "An-Nur",
    "englishName": "An-Noor",
    "totalAyahs": 64,
    "revelation": "Madaniyah",
    "juzList": [
      18
    ]
  },
  {
    "number": 25,
    "nameArabic": "سُورَةُ الفُرۡقَانِ",
    "nameLatin": "Al-Furqan",
    "englishName": "Al-Furqaan",
    "totalAyahs": 77,
    "revelation": "Makkiyah",
    "juzList": [
      18,
      19
    ]
  },
  {
    "number": 26,
    "nameArabic": "سُورَةُ الشُّعَرَاءِ",
    "nameLatin": "Asy-Syuara",
    "englishName": "Ash-Shu'araa",
    "totalAyahs": 227,
    "revelation": "Makkiyah",
    "juzList": [
      19
    ]
  },
  {
    "number": 27,
    "nameArabic": "سُورَةُ النَّمۡلِ",
    "nameLatin": "An-Naml",
    "englishName": "An-Naml",
    "totalAyahs": 93,
    "revelation": "Makkiyah",
    "juzList": [
      19,
      20
    ]
  },
  {
    "number": 28,
    "nameArabic": "سُورَةُ القَصَصِ",
    "nameLatin": "Al-Qasas",
    "englishName": "Al-Qasas",
    "totalAyahs": 88,
    "revelation": "Makkiyah",
    "juzList": [
      20
    ]
  },
  {
    "number": 29,
    "nameArabic": "سُورَةُ العَنكَبُوتِ",
    "nameLatin": "Al-Ankabut",
    "englishName": "Al-Ankaboot",
    "totalAyahs": 69,
    "revelation": "Makkiyah",
    "juzList": [
      20,
      21
    ]
  },
  {
    "number": 30,
    "nameArabic": "سُورَةُ الرُّومِ",
    "nameLatin": "Ar-Rum",
    "englishName": "Ar-Room",
    "totalAyahs": 60,
    "revelation": "Makkiyah",
    "juzList": [
      21
    ]
  },
  {
    "number": 31,
    "nameArabic": "سُورَةُ لُقۡمَانَ",
    "nameLatin": "Luqman",
    "englishName": "Luqman",
    "totalAyahs": 34,
    "revelation": "Makkiyah",
    "juzList": [
      21
    ]
  },
  {
    "number": 32,
    "nameArabic": "سُورَةُ السَّجۡدَةِ",
    "nameLatin": "As-Sajdah",
    "englishName": "As-Sajda",
    "totalAyahs": 30,
    "revelation": "Makkiyah",
    "juzList": [
      21
    ]
  },
  {
    "number": 33,
    "nameArabic": "سُورَةُ الأَحۡزَابِ",
    "nameLatin": "Al-Ahzab",
    "englishName": "Al-Ahzaab",
    "totalAyahs": 73,
    "revelation": "Madaniyah",
    "juzList": [
      21,
      22
    ]
  },
  {
    "number": 34,
    "nameArabic": "سُورَةُ سَبَإٍ",
    "nameLatin": "Saba",
    "englishName": "Saba",
    "totalAyahs": 54,
    "revelation": "Makkiyah",
    "juzList": [
      22
    ]
  },
  {
    "number": 35,
    "nameArabic": "سُورَةُ فَاطِرٍ",
    "nameLatin": "Fathir",
    "englishName": "Faatir",
    "totalAyahs": 45,
    "revelation": "Makkiyah",
    "juzList": [
      22
    ]
  },
  {
    "number": 36,
    "nameArabic": "سُورَةُ يسٓ",
    "nameLatin": "Yasin",
    "englishName": "Yaseen",
    "totalAyahs": 83,
    "revelation": "Makkiyah",
    "juzList": [
      22,
      23
    ]
  },
  {
    "number": 37,
    "nameArabic": "سُورَةُ الصَّافَّاتِ",
    "nameLatin": "Ash-Shaffat",
    "englishName": "As-Saaffaat",
    "totalAyahs": 182,
    "revelation": "Makkiyah",
    "juzList": [
      23
    ]
  },
  {
    "number": 38,
    "nameArabic": "سُورَةُ صٓ",
    "nameLatin": "Shad",
    "englishName": "Saad",
    "totalAyahs": 88,
    "revelation": "Makkiyah",
    "juzList": [
      23
    ]
  },
  {
    "number": 39,
    "nameArabic": "سُورَةُ الزُّمَرِ",
    "nameLatin": "Az-Zumar",
    "englishName": "Az-Zumar",
    "totalAyahs": 75,
    "revelation": "Makkiyah",
    "juzList": [
      23,
      24
    ]
  },
  {
    "number": 40,
    "nameArabic": "سُورَةُ غَافِرٍ",
    "nameLatin": "Ghafir",
    "englishName": "Ghafir",
    "totalAyahs": 85,
    "revelation": "Makkiyah",
    "juzList": [
      24
    ]
  },
  {
    "number": 41,
    "nameArabic": "سُورَةُ فُصِّلَتۡ",
    "nameLatin": "Fushshilat",
    "englishName": "Fussilat",
    "totalAyahs": 54,
    "revelation": "Makkiyah",
    "juzList": [
      24,
      25
    ]
  },
  {
    "number": 42,
    "nameArabic": "سُورَةُ الشُّورَىٰ",
    "nameLatin": "Asy-Syura",
    "englishName": "Ash-Shura",
    "totalAyahs": 53,
    "revelation": "Makkiyah",
    "juzList": [
      25
    ]
  },
  {
    "number": 43,
    "nameArabic": "سُورَةُ الزُّخۡرُفِ",
    "nameLatin": "Az-Zukhruf",
    "englishName": "Az-Zukhruf",
    "totalAyahs": 89,
    "revelation": "Makkiyah",
    "juzList": [
      25
    ]
  },
  {
    "number": 44,
    "nameArabic": "سُورَةُ الدُّخَانِ",
    "nameLatin": "Ad-Dukhan",
    "englishName": "Ad-Dukhaan",
    "totalAyahs": 59,
    "revelation": "Makkiyah",
    "juzList": [
      25
    ]
  },
  {
    "number": 45,
    "nameArabic": "سُورَةُ الجَاثِيَةِ",
    "nameLatin": "Al-Jatsiyah",
    "englishName": "Al-Jaathiya",
    "totalAyahs": 37,
    "revelation": "Makkiyah",
    "juzList": [
      25
    ]
  },
  {
    "number": 46,
    "nameArabic": "سُورَةُ الأَحۡقَافِ",
    "nameLatin": "Al-Ahqaf",
    "englishName": "Al-Ahqaf",
    "totalAyahs": 35,
    "revelation": "Makkiyah",
    "juzList": [
      26
    ]
  },
  {
    "number": 47,
    "nameArabic": "سُورَةُ مُحَمَّدٍ",
    "nameLatin": "Muhammad",
    "englishName": "Muhammad",
    "totalAyahs": 38,
    "revelation": "Madaniyah",
    "juzList": [
      26
    ]
  },
  {
    "number": 48,
    "nameArabic": "سُورَةُ الفَتۡحِ",
    "nameLatin": "Al-Fath",
    "englishName": "Al-Fath",
    "totalAyahs": 29,
    "revelation": "Madaniyah",
    "juzList": [
      26
    ]
  },
  {
    "number": 49,
    "nameArabic": "سُورَةُ الحُجُرَاتِ",
    "nameLatin": "Al-Hujurat",
    "englishName": "Al-Hujuraat",
    "totalAyahs": 18,
    "revelation": "Madaniyah",
    "juzList": [
      26
    ]
  },
  {
    "number": 50,
    "nameArabic": "سُورَةُ قٓ",
    "nameLatin": "Qaf",
    "englishName": "Qaaf",
    "totalAyahs": 45,
    "revelation": "Makkiyah",
    "juzList": [
      26
    ]
  },
  {
    "number": 51,
    "nameArabic": "سُورَةُ الذَّارِيَاتِ",
    "nameLatin": "Adz-Dzariyat",
    "englishName": "Adh-Dhaariyat",
    "totalAyahs": 60,
    "revelation": "Makkiyah",
    "juzList": [
      26,
      27
    ]
  },
  {
    "number": 52,
    "nameArabic": "سُورَةُ الطُّورِ",
    "nameLatin": "Ath-Thur",
    "englishName": "At-Tur",
    "totalAyahs": 49,
    "revelation": "Makkiyah",
    "juzList": [
      27
    ]
  },
  {
    "number": 53,
    "nameArabic": "سُورَةُ النَّجۡمِ",
    "nameLatin": "An-Najm",
    "englishName": "An-Najm",
    "totalAyahs": 62,
    "revelation": "Makkiyah",
    "juzList": [
      27
    ]
  },
  {
    "number": 54,
    "nameArabic": "سُورَةُ القَمَرِ",
    "nameLatin": "Al-Qamar",
    "englishName": "Al-Qamar",
    "totalAyahs": 55,
    "revelation": "Makkiyah",
    "juzList": [
      27
    ]
  },
  {
    "number": 55,
    "nameArabic": "سُورَةُ الرَّحۡمَٰن",
    "nameLatin": "Ar-Rahman",
    "englishName": "Ar-Rahmaan",
    "totalAyahs": 78,
    "revelation": "Madaniyah",
    "juzList": [
      27
    ]
  },
  {
    "number": 56,
    "nameArabic": "سُورَةُ الوَاقِعَةِ",
    "nameLatin": "Al-Waqiah",
    "englishName": "Al-Waaqia",
    "totalAyahs": 96,
    "revelation": "Makkiyah",
    "juzList": [
      27
    ]
  },
  {
    "number": 57,
    "nameArabic": "سُورَةُ الحَدِيدِ",
    "nameLatin": "Al-Hadid",
    "englishName": "Al-Hadid",
    "totalAyahs": 29,
    "revelation": "Madaniyah",
    "juzList": [
      27
    ]
  },
  {
    "number": 58,
    "nameArabic": "سُورَةُ المُجَادلَةِ",
    "nameLatin": "Al-Mujadilah",
    "englishName": "Al-Mujaadila",
    "totalAyahs": 22,
    "revelation": "Madaniyah",
    "juzList": [
      28
    ]
  },
  {
    "number": 59,
    "nameArabic": "سُورَةُ الحَشۡرِ",
    "nameLatin": "Al-Hasyr",
    "englishName": "Al-Hashr",
    "totalAyahs": 24,
    "revelation": "Madaniyah",
    "juzList": [
      28
    ]
  },
  {
    "number": 60,
    "nameArabic": "سُورَةُ المُمۡتَحنَةِ",
    "nameLatin": "Al-Mumtahanah",
    "englishName": "Al-Mumtahana",
    "totalAyahs": 13,
    "revelation": "Madaniyah",
    "juzList": [
      28
    ]
  },
  {
    "number": 61,
    "nameArabic": "سُورَةُ الصَّفِّ",
    "nameLatin": "Ash-Shaff",
    "englishName": "As-Saff",
    "totalAyahs": 14,
    "revelation": "Madaniyah",
    "juzList": [
      28
    ]
  },
  {
    "number": 62,
    "nameArabic": "سُورَةُ الجُمُعَةِ",
    "nameLatin": "Al-Jumuah",
    "englishName": "Al-Jumu'a",
    "totalAyahs": 11,
    "revelation": "Madaniyah",
    "juzList": [
      28
    ]
  },
  {
    "number": 63,
    "nameArabic": "سُورَةُ المُنَافِقُونَ",
    "nameLatin": "Al-Munafiqun",
    "englishName": "Al-Munaafiqoon",
    "totalAyahs": 11,
    "revelation": "Madaniyah",
    "juzList": [
      28
    ]
  },
  {
    "number": 64,
    "nameArabic": "سُورَةُ التَّغَابُنِ",
    "nameLatin": "At-Taghabun",
    "englishName": "At-Taghaabun",
    "totalAyahs": 18,
    "revelation": "Madaniyah",
    "juzList": [
      28
    ]
  },
  {
    "number": 65,
    "nameArabic": "سُورَةُ الطَّلَاقِ",
    "nameLatin": "Ath-Thalaq",
    "englishName": "At-Talaaq",
    "totalAyahs": 12,
    "revelation": "Madaniyah",
    "juzList": [
      28
    ]
  },
  {
    "number": 66,
    "nameArabic": "سُورَةُ التَّحۡرِيمِ",
    "nameLatin": "At-Tahrim",
    "englishName": "At-Tahrim",
    "totalAyahs": 12,
    "revelation": "Madaniyah",
    "juzList": [
      28
    ]
  },
  {
    "number": 67,
    "nameArabic": "سُورَةُ المُلۡكِ",
    "nameLatin": "Al-Mulk",
    "englishName": "Al-Mulk",
    "totalAyahs": 30,
    "revelation": "Makkiyah",
    "juzList": [
      29
    ]
  },
  {
    "number": 68,
    "nameArabic": "سُورَةُ القَلَمِ",
    "nameLatin": "Al-Qalam",
    "englishName": "Al-Qalam",
    "totalAyahs": 52,
    "revelation": "Makkiyah",
    "juzList": [
      29
    ]
  },
  {
    "number": 69,
    "nameArabic": "سُورَةُ الحَاقَّةِ",
    "nameLatin": "Al-Haqqah",
    "englishName": "Al-Haaqqa",
    "totalAyahs": 52,
    "revelation": "Makkiyah",
    "juzList": [
      29
    ]
  },
  {
    "number": 70,
    "nameArabic": "سُورَةُ المَعَارِجِ",
    "nameLatin": "Al-Marij",
    "englishName": "Al-Ma'aarij",
    "totalAyahs": 44,
    "revelation": "Makkiyah",
    "juzList": [
      29
    ]
  },
  {
    "number": 71,
    "nameArabic": "سُورَةُ نُوحٍ",
    "nameLatin": "Nuh",
    "englishName": "Nooh",
    "totalAyahs": 28,
    "revelation": "Makkiyah",
    "juzList": [
      29
    ]
  },
  {
    "number": 72,
    "nameArabic": "سُورَةُ الجِنِّ",
    "nameLatin": "Al-Jinn",
    "englishName": "Al-Jinn",
    "totalAyahs": 28,
    "revelation": "Makkiyah",
    "juzList": [
      29
    ]
  },
  {
    "number": 73,
    "nameArabic": "سُورَةُ المُزَّمِّلِ",
    "nameLatin": "Al-Muzzammil",
    "englishName": "Al-Muzzammil",
    "totalAyahs": 20,
    "revelation": "Makkiyah",
    "juzList": [
      29
    ]
  },
  {
    "number": 74,
    "nameArabic": "سُورَةُ المُدَّثِّرِ",
    "nameLatin": "Al-Muddatstsir",
    "englishName": "Al-Muddaththir",
    "totalAyahs": 56,
    "revelation": "Makkiyah",
    "juzList": [
      29
    ]
  },
  {
    "number": 75,
    "nameArabic": "سُورَةُ القِيَامَةِ",
    "nameLatin": "Al-Qiyamah",
    "englishName": "Al-Qiyaama",
    "totalAyahs": 40,
    "revelation": "Makkiyah",
    "juzList": [
      29
    ]
  },
  {
    "number": 76,
    "nameArabic": "سُورَةُ الإِنسَانِ",
    "nameLatin": "Al-Insan",
    "englishName": "Al-Insaan",
    "totalAyahs": 31,
    "revelation": "Madaniyah",
    "juzList": [
      29
    ]
  },
  {
    "number": 77,
    "nameArabic": "سُورَةُ المُرۡسَلَاتِ",
    "nameLatin": "Al-Mursalat",
    "englishName": "Al-Mursalaat",
    "totalAyahs": 50,
    "revelation": "Makkiyah",
    "juzList": [
      29
    ]
  },
  {
    "number": 78,
    "nameArabic": "سُورَةُ النَّبَإِ",
    "nameLatin": "An-Naba",
    "englishName": "An-Naba",
    "totalAyahs": 40,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 79,
    "nameArabic": "سُورَةُ النَّازِعَاتِ",
    "nameLatin": "An-Naziat",
    "englishName": "An-Naazi'aat",
    "totalAyahs": 46,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 80,
    "nameArabic": "سُورَةُ عَبَسَ",
    "nameLatin": "Abasa",
    "englishName": "Abasa",
    "totalAyahs": 42,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 81,
    "nameArabic": "سُورَةُ التَّكۡوِيرِ",
    "nameLatin": "At-Takwir",
    "englishName": "At-Takwir",
    "totalAyahs": 29,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 82,
    "nameArabic": "سُورَةُ الانفِطَارِ",
    "nameLatin": "Al-Infithar",
    "englishName": "Al-Infitaar",
    "totalAyahs": 19,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 83,
    "nameArabic": "سُورَةُ المُطَفِّفِينَ",
    "nameLatin": "Al-Muthaffifin",
    "englishName": "Al-Mutaffifin",
    "totalAyahs": 36,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 84,
    "nameArabic": "سُورَةُ الانشِقَاقِ",
    "nameLatin": "Al-Insyiqaq",
    "englishName": "Al-Inshiqaaq",
    "totalAyahs": 25,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 85,
    "nameArabic": "سُورَةُ البُرُوجِ",
    "nameLatin": "Al-Buruj",
    "englishName": "Al-Burooj",
    "totalAyahs": 22,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 86,
    "nameArabic": "سُورَةُ الطَّارِقِ",
    "nameLatin": "Ath-Thariq",
    "englishName": "At-Taariq",
    "totalAyahs": 17,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 87,
    "nameArabic": "سُورَةُ الأَعۡلَىٰ",
    "nameLatin": "Al-Ala",
    "englishName": "Al-A'laa",
    "totalAyahs": 19,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 88,
    "nameArabic": "سُورَةُ الغَاشِيَةِ",
    "nameLatin": "Al-Ghasyiyah",
    "englishName": "Al-Ghaashiya",
    "totalAyahs": 26,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 89,
    "nameArabic": "سُورَةُ الفَجۡرِ",
    "nameLatin": "Al-Fajr",
    "englishName": "Al-Fajr",
    "totalAyahs": 30,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 90,
    "nameArabic": "سُورَةُ البَلَدِ",
    "nameLatin": "Al-Balad",
    "englishName": "Al-Balad",
    "totalAyahs": 20,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 91,
    "nameArabic": "سُورَةُ الشَّمۡسِ",
    "nameLatin": "Asy-Syams",
    "englishName": "Ash-Shams",
    "totalAyahs": 15,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 92,
    "nameArabic": "سُورَةُ اللَّيۡلِ",
    "nameLatin": "Al-Lail",
    "englishName": "Al-Lail",
    "totalAyahs": 21,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 93,
    "nameArabic": "سُورَةُ الضُّحَىٰ",
    "nameLatin": "Adh-Dhuha",
    "englishName": "Ad-Dhuhaa",
    "totalAyahs": 11,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 94,
    "nameArabic": "سُورَةُ الشَّرۡحِ",
    "nameLatin": "Al-Insyirah",
    "englishName": "Ash-Sharh",
    "totalAyahs": 8,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 95,
    "nameArabic": "سُورَةُ التِّينِ",
    "nameLatin": "At-Tin",
    "englishName": "At-Tin",
    "totalAyahs": 8,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 96,
    "nameArabic": "سُورَةُ العَلَقِ",
    "nameLatin": "Al-Alaq",
    "englishName": "Al-Alaq",
    "totalAyahs": 19,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 97,
    "nameArabic": "سُورَةُ القَدۡرِ",
    "nameLatin": "Al-Qadr",
    "englishName": "Al-Qadr",
    "totalAyahs": 5,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 98,
    "nameArabic": "سُورَةُ البَيِّنَةِ",
    "nameLatin": "Al-Bayyinah",
    "englishName": "Al-Bayyina",
    "totalAyahs": 8,
    "revelation": "Madaniyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 99,
    "nameArabic": "سُورَةُ الزَّلۡزَلَةِ",
    "nameLatin": "Az-Zalzalah",
    "englishName": "Az-Zalzala",
    "totalAyahs": 8,
    "revelation": "Madaniyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 100,
    "nameArabic": "سُورَةُ العَادِيَاتِ",
    "nameLatin": "Al-Adiyat",
    "englishName": "Al-Aadiyaat",
    "totalAyahs": 11,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 101,
    "nameArabic": "سُورَةُ القَارِعَةِ",
    "nameLatin": "Al-Qariah",
    "englishName": "Al-Qaari'a",
    "totalAyahs": 11,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 102,
    "nameArabic": "سُورَةُ التَّكَاثُرِ",
    "nameLatin": "At-Takatsur",
    "englishName": "At-Takaathur",
    "totalAyahs": 8,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 103,
    "nameArabic": "سُورَةُ العَصۡرِ",
    "nameLatin": "Al-Ashr",
    "englishName": "Al-Asr",
    "totalAyahs": 3,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 104,
    "nameArabic": "سُورَةُ الهُمَزَةِ",
    "nameLatin": "Al-Humazah",
    "englishName": "Al-Humaza",
    "totalAyahs": 9,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 105,
    "nameArabic": "سُورَةُ الفِيلِ",
    "nameLatin": "Al-Fil",
    "englishName": "Al-Fil",
    "totalAyahs": 5,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 106,
    "nameArabic": "سُورَةُ قُرَيۡشٍ",
    "nameLatin": "Quraisy",
    "englishName": "Quraish",
    "totalAyahs": 4,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 107,
    "nameArabic": "سُورَةُ المَاعُونِ",
    "nameLatin": "Al-Maun",
    "englishName": "Al-Maa'un",
    "totalAyahs": 7,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 108,
    "nameArabic": "سُورَةُ الكَوۡثَرِ",
    "nameLatin": "Al-Kautsar",
    "englishName": "Al-Kawthar",
    "totalAyahs": 3,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 109,
    "nameArabic": "سُورَةُ الكَافِرُونَ",
    "nameLatin": "Al-Kafirun",
    "englishName": "Al-Kaafiroon",
    "totalAyahs": 6,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 110,
    "nameArabic": "سُورَةُ النَّصۡرِ",
    "nameLatin": "An-Nashr",
    "englishName": "An-Nasr",
    "totalAyahs": 3,
    "revelation": "Madaniyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 111,
    "nameArabic": "سُورَةُ المَسَدِ",
    "nameLatin": "Al-Lahab",
    "englishName": "Al-Masad",
    "totalAyahs": 5,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 112,
    "nameArabic": "سُورَةُ الإِخۡلَاصِ",
    "nameLatin": "Al-Ikhlas",
    "englishName": "Al-Ikhlaas",
    "totalAyahs": 4,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 113,
    "nameArabic": "سُورَةُ الفَلَقِ",
    "nameLatin": "Al-Falaq",
    "englishName": "Al-Falaq",
    "totalAyahs": 5,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  },
  {
    "number": 114,
    "nameArabic": "سُورَةُ النَّاسِ",
    "nameLatin": "An-Nas",
    "englishName": "An-Naas",
    "totalAyahs": 6,
    "revelation": "Makkiyah",
    "juzList": [
      30
    ]
  }
];

export const QURAN_JUZ_LIST: QuranJuz[] = [
  {
    "juz": 1,
    "name": "Juz 1",
    "start": "Al-Fatihah 1",
    "end": "Al-Baqarah 141",
    "surahs": [
      1,
      2
    ]
  },
  {
    "juz": 2,
    "name": "Juz 2",
    "start": "Al-Baqarah 142",
    "end": "Al-Baqarah 252",
    "surahs": [
      2
    ]
  },
  {
    "juz": 3,
    "name": "Juz 3",
    "start": "Al-Baqarah 253",
    "end": "Ali Imran 92",
    "surahs": [
      2,
      3
    ]
  },
  {
    "juz": 4,
    "name": "Juz 4",
    "start": "Ali Imran 93",
    "end": "An-Nisa 23",
    "surahs": [
      3,
      4
    ]
  },
  {
    "juz": 5,
    "name": "Juz 5",
    "start": "An-Nisa 24",
    "end": "An-Nisa 147",
    "surahs": [
      4
    ]
  },
  {
    "juz": 6,
    "name": "Juz 6",
    "start": "An-Nisa 148",
    "end": "Al-Maidah 81",
    "surahs": [
      4,
      5
    ]
  },
  {
    "juz": 7,
    "name": "Juz 7",
    "start": "Al-Maidah 82",
    "end": "Al-Anam 110",
    "surahs": [
      5,
      6
    ]
  },
  {
    "juz": 8,
    "name": "Juz 8",
    "start": "Al-Anam 111",
    "end": "Al-Araf 87",
    "surahs": [
      6,
      7
    ]
  },
  {
    "juz": 9,
    "name": "Juz 9",
    "start": "Al-Araf 88",
    "end": "Al-Anfal 40",
    "surahs": [
      7,
      8
    ]
  },
  {
    "juz": 10,
    "name": "Juz 10",
    "start": "Al-Anfal 41",
    "end": "At-Taubah 92",
    "surahs": [
      8,
      9
    ]
  },
  {
    "juz": 11,
    "name": "Juz 11",
    "start": "At-Taubah 93",
    "end": "Hud 5",
    "surahs": [
      9,
      10,
      11
    ]
  },
  {
    "juz": 12,
    "name": "Juz 12",
    "start": "Hud 6",
    "end": "Yusuf 52",
    "surahs": [
      11,
      12
    ]
  },
  {
    "juz": 13,
    "name": "Juz 13",
    "start": "Yusuf 53",
    "end": "Ibrahim 52",
    "surahs": [
      12,
      13,
      14
    ]
  },
  {
    "juz": 14,
    "name": "Juz 14",
    "start": "Al-Hijr 1",
    "end": "An-Nahl 128",
    "surahs": [
      15,
      16
    ]
  },
  {
    "juz": 15,
    "name": "Juz 15",
    "start": "Al-Isra 1",
    "end": "Al-Kahfi 74",
    "surahs": [
      17,
      18
    ]
  },
  {
    "juz": 16,
    "name": "Juz 16",
    "start": "Al-Kahfi 75",
    "end": "Ta-Ha 135",
    "surahs": [
      18,
      19,
      20
    ]
  },
  {
    "juz": 17,
    "name": "Juz 17",
    "start": "Al-Anbiya 1",
    "end": "Al-Hajj 78",
    "surahs": [
      21,
      22
    ]
  },
  {
    "juz": 18,
    "name": "Juz 18",
    "start": "Al-Muminun 1",
    "end": "Al-Furqan 20",
    "surahs": [
      23,
      24,
      25
    ]
  },
  {
    "juz": 19,
    "name": "Juz 19",
    "start": "Al-Furqan 21",
    "end": "An-Naml 55",
    "surahs": [
      25,
      26,
      27
    ]
  },
  {
    "juz": 20,
    "name": "Juz 20",
    "start": "An-Naml 56",
    "end": "Al-Ankabut 45",
    "surahs": [
      27,
      28,
      29
    ]
  },
  {
    "juz": 21,
    "name": "Juz 21",
    "start": "Al-Ankabut 46",
    "end": "Al-Ahzab 30",
    "surahs": [
      29,
      30,
      31,
      32,
      33
    ]
  },
  {
    "juz": 22,
    "name": "Juz 22",
    "start": "Al-Ahzab 31",
    "end": "Yasin 27",
    "surahs": [
      33,
      34,
      35,
      36
    ]
  },
  {
    "juz": 23,
    "name": "Juz 23",
    "start": "Yasin 28",
    "end": "Az-Zumar 31",
    "surahs": [
      36,
      37,
      38,
      39
    ]
  },
  {
    "juz": 24,
    "name": "Juz 24",
    "start": "Az-Zumar 32",
    "end": "Fussilat 46",
    "surahs": [
      39,
      40,
      41
    ]
  },
  {
    "juz": 25,
    "name": "Juz 25",
    "start": "Fussilat 47",
    "end": "Al-Jatsiyah 37",
    "surahs": [
      41,
      42,
      43,
      44,
      45
    ]
  },
  {
    "juz": 26,
    "name": "Juz 26",
    "start": "Al-Ahqaf 1",
    "end": "Adz-Dzariyat 30",
    "surahs": [
      46,
      47,
      48,
      49,
      50,
      51
    ]
  },
  {
    "juz": 27,
    "name": "Juz 27",
    "start": "Adz-Dzariyat 31",
    "end": "Al-Hadid 29",
    "surahs": [
      51,
      52,
      53,
      54,
      55,
      56,
      57
    ]
  },
  {
    "juz": 28,
    "name": "Juz 28",
    "start": "Al-Mujadilah 1",
    "end": "At-Tahrim 12",
    "surahs": [
      58,
      59,
      60,
      61,
      62,
      63,
      64,
      65,
      66
    ]
  },
  {
    "juz": 29,
    "name": "Juz 29 (Tabarak)",
    "start": "Al-Mulk 1",
    "end": "Al-Mursalat 50",
    "surahs": [
      67,
      68,
      69,
      70,
      71,
      72,
      73,
      74,
      75,
      76,
      77
    ]
  },
  {
    "juz": 30,
    "name": "Juz 30 (Juz Amma)",
    "start": "An-Naba 1",
    "end": "An-Nas 6",
    "surahs": [
      78,
      79,
      80,
      81,
      82,
      83,
      84,
      85,
      86,
      87,
      88,
      89,
      90,
      91,
      92,
      93,
      94,
      95,
      96,
      97,
      98,
      99,
      100,
      101,
      102,
      103,
      104,
      105,
      106,
      107,
      108,
      109,
      110,
      111,
      112,
      113,
      114
    ]
  }
];

export const OFFLINE_VERSES: Record<number, AyahItem[]> = {
  "1": [
    {
      "numberInSurah": 1,
      "text": "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ"
    },
    {
      "numberInSurah": 2,
      "text": "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ"
    },
    {
      "numberInSurah": 3,
      "text": "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ"
    },
    {
      "numberInSurah": 4,
      "text": "مَٰلِكِ يَوْمِ ٱلدِّينِ"
    },
    {
      "numberInSurah": 5,
      "text": "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ"
    },
    {
      "numberInSurah": 6,
      "text": "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ"
    },
    {
      "numberInSurah": 7,
      "text": "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ"
    }
  ],
  "103": [
    {
      "numberInSurah": 1,
      "text": "وَٱلْعَصْرِ"
    },
    {
      "numberInSurah": 2,
      "text": "إِنَّ ٱلْإِنسَٰنَ لَفِى خُسْرٍ"
    },
    {
      "numberInSurah": 3,
      "text": "إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ"
    }
  ],
  "108": [
    {
      "numberInSurah": 1,
      "text": "إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ"
    },
    {
      "numberInSurah": 2,
      "text": "فَصَلِّ لِرَبِّكَ وَٱنْحَرْ"
    },
    {
      "numberInSurah": 3,
      "text": "إِنَّ شَانِئَكَ هُوَ ٱلْأَبْتَرُ"
    }
  ],
  "109": [
    {
      "numberInSurah": 1,
      "text": "قُلْ يَٰٓأَيُّهَا ٱلْكَٰفِرُونَ"
    },
    {
      "numberInSurah": 2,
      "text": "لَآ أَعْبُدُ مَا تَعْبُدُونَ"
    },
    {
      "numberInSurah": 3,
      "text": "وَلَآ أَنتُمْ عَٰبِدُونَ مَآ أَعْبُدُ"
    },
    {
      "numberInSurah": 4,
      "text": "وَلَآ أَنَا۠ عَابِدٌ مَّا عَبَدتُّمْ"
    },
    {
      "numberInSurah": 5,
      "text": "وَلَآ أَنتُمْ عَٰبِدُونَ مَآ أَعْبُدُ"
    },
    {
      "numberInSurah": 6,
      "text": "لَكُمْ دِينُكُمْ وَلِىَ دِينِ"
    }
  ],
  "110": [
    {
      "numberInSurah": 1,
      "text": "إِذَا جَآءَ نَصْرُ ٱللَّهِ وَٱلْفَتْحُ"
    },
    {
      "numberInSurah": 2,
      "text": "وَرَأَيْتَ ٱلنَّاسَ يَدْخُلُونَ فِى دِينِ ٱللَّهِ أَفْوَاجًا"
    },
    {
      "numberInSurah": 3,
      "text": "فَسَبِّحْ بِحَمْدِ رَبِّكَ وَٱسْتَغْفِرْهُ ۚ إِنَّهُۥ كَانَ تَوَّابًۢا"
    }
  ],
  "112": [
    {
      "numberInSurah": 1,
      "text": "قُلْ هُوَ ٱللَّهُ أَحَدٌ"
    },
    {
      "numberInSurah": 2,
      "text": "ٱللَّهُ ٱلصَّمَدُ"
    },
    {
      "numberInSurah": 3,
      "text": "لَمْ يَلِدْ وَلَمْ يُولَدْ"
    },
    {
      "numberInSurah": 4,
      "text": "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ"
    }
  ],
  "113": [
    {
      "numberInSurah": 1,
      "text": "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ"
    },
    {
      "numberInSurah": 2,
      "text": "مِن شَرِّ مَا خَلَقَ"
    },
    {
      "numberInSurah": 3,
      "text": "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ"
    },
    {
      "numberInSurah": 4,
      "text": "وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ"
    },
    {
      "numberInSurah": 5,
      "text": "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ"
    }
  ],
  "114": [
    {
      "numberInSurah": 1,
      "text": "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ"
    },
    {
      "numberInSurah": 2,
      "text": "مَلِكِ ٱلنَّاسِ"
    },
    {
      "numberInSurah": 3,
      "text": "إِلَٰهِ ٱلنَّاسِ"
    },
    {
      "numberInSurah": 4,
      "text": "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ"
    },
    {
      "numberInSurah": 5,
      "text": "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ"
    },
    {
      "numberInSurah": 6,
      "text": "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ"
    }
  ]
};

// In-memory runtime cache
const memorySurahCache = new Map<number, AyahItem[]>();
const memoryJuzCache = new Map<number, AyahItem[]>();

export const getSurahByNumber = (num: number): QuranSurah | undefined => {
  return QURAN_SURAHS.find(s => s.number === num);
};

export const getSurahsByJuz = (juzNum: number): QuranSurah[] => {
  const juz = QURAN_JUZ_LIST.find(j => j.juz === juzNum);
  if (!juz) return [];
  return QURAN_SURAHS.filter(s => juz.surahs.includes(s.number));
};

export const fetchSurahVerses = async (surahNumber: number): Promise<AyahItem[]> => {
  if (memorySurahCache.has(surahNumber)) {
    return memorySurahCache.get(surahNumber)!;
  }

  // Check localStorage cache
  try {
    const local = localStorage.getItem(`cbt_quran_surah_${surahNumber}`);
    if (local) {
      const parsed = JSON.parse(local) as AyahItem[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        memorySurahCache.set(surahNumber, parsed);
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }

  // Fetch from free public API (CORS enabled)
  try {
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`);
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data.ayahs)) {
        const surahInfo = getSurahByNumber(surahNumber);
        const ayahs: AyahItem[] = json.data.ayahs.map((a: any) => ({
          numberInSurah: a.numberInSurah,
          text: a.text,
          surahNumber: surahNumber,
          surahNameLatin: surahInfo?.nameLatin || `Surah ${surahNumber}`
        }));
        memorySurahCache.set(surahNumber, ayahs);
        try {
          localStorage.setItem(`cbt_quran_surah_${surahNumber}`, JSON.stringify(ayahs));
        } catch (e) {}
        return ayahs;
      }
    }
  } catch (err) {
    console.warn(`Failed fetching verses for surah ${surahNumber}: `, err);
  }

  // Fallback to preloaded offline verses if available
  if (OFFLINE_VERSES[surahNumber]) {
    const surahInfo = getSurahByNumber(surahNumber);
    return OFFLINE_VERSES[surahNumber].map(a => ({
      ...a,
      surahNumber,
      surahNameLatin: surahInfo?.nameLatin || `Surah ${surahNumber}`
    }));
  }

  return [];
};

export const fetchJuzVerses = async (juzNumber: number): Promise<AyahItem[]> => {
  if (memoryJuzCache.has(juzNumber)) {
    return memoryJuzCache.get(juzNumber)!;
  }

  try {
    const local = localStorage.getItem(`cbt_quran_juz_${juzNumber}`);
    if (local) {
      const parsed = JSON.parse(local) as AyahItem[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryJuzCache.set(juzNumber, parsed);
        return parsed;
      }
    }
  } catch (e) {}

  try {
    const res = await fetch(`https://api.alquran.cloud/v1/juz/${juzNumber}/quran-uthmani`);
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data.ayahs)) {
        const ayahs: AyahItem[] = json.data.ayahs.map((a: any) => ({
          numberInSurah: a.numberInSurah,
          text: a.text,
          surahNumber: a.surah?.number,
          surahNameLatin: a.surah?.englishName
        }));
        memoryJuzCache.set(juzNumber, ayahs);
        try {
          localStorage.setItem(`cbt_quran_juz_${juzNumber}`, JSON.stringify(ayahs.slice(0, 100)));
        } catch (e) {}
        return ayahs;
      }
    }
  } catch (err) {
    console.warn(`Failed fetching verses for juz ${juzNumber}: `, err);
  }

  return [];
};
