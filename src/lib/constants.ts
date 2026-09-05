export const EVENT_LIMITS: Record<string, number> = {
  "Announcing": 50,
  "Announcing (Tamil)": 50,
  "Sports Commentary": 50,
  "Dubbing": 50,
  "Cartoon Drawing": 50,
  "Photography": 50,
  "Graphic Designing": 40,
  "Technical": 50,
  "Short Film": 40,
  "Special Event": 40,
  "Editing": 35,
};

export const CATEGORIES = [
  "Announcing",
  "Announcing (Tamil)",
  "Sports Commentary",
  "Dubbing",
  "Cartoon Drawing",
  "Photography",
  "Graphic Designing",
  "Technical",
  "Short Film",
  "Special Event",
  "Editing",
];

export const LANGUAGES_BY_CATEGORY: Record<string, string[]> = {
  "Announcing": ["Sinhala", "English"],
  "Announcing (Tamil)": ["Tamil"],
  "Sports Commentary": ["Sinhala", "English"],
  "Dubbing": ["Sinhala", "English"],
  "Cartoon Drawing": ["Sinhala", "English"],
  "Graphic Designing": ["Sinhala", "English"],
  "Technical": ["Sinhala", "English"],
  "Short Film": ["Sinhala", "English"],
  "Special Event": ["Sinhala", "English"],
  "Editing": ["Sinhala", "English"],
};

export const AGE_CATEGORIES_BY_CATEGORY: Record<string, string[]> = {
  "Announcing": ["Junior", "Intermediate", "Senior"],
  "Special Event": ["Open"],
  "Editing": ["Junior", "Intermediate", "Senior"],
};
