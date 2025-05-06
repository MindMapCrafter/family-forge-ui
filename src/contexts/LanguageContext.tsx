
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define all language options and their translations
export const translations = {
  en: {
    name: "Name",
    gender: "Gender",
    relationship: "Relation",
    hideChildren: "Hide Children",
    showChildren: "Show Children",
    edit: "Edit",
    delete: "Delete",
    addMember: "Add Member",
    import: "Import",
    export: "Export",
    reset: "Reset",
    language: "Language",
    male: "Male",
    female: "Female",
    other: "Other"
  },
  ur: {
    name: "نام",
    gender: "جنس",
    relationship: "رشتہ",
    hideChildren: "بچوں کو چھپائیں",
    showChildren: "بچوں کو دکھائیں",
    edit: "ترمیم",
    delete: "حذف",
    addMember: "رکن شامل کریں",
    import: "درآمد",
    export: "برآمد",
    reset: "دوبارہ ترتیب دیں",
    language: "زبان",
    male: "مرد",
    female: "عورت",
    other: "دیگر"
  },
  pa: {
    name: "ਨਾਂ",
    gender: "ਲਿੰਗ",
    relationship: "ਰਿਸ਼ਤਾ",
    hideChildren: "ਬੱਚਿਆਂ ਨੂੰ ਛੁਪਾਓ",
    showChildren: "ਬੱਚਿਆਂ ਨੂੰ ਦਿਖਾਓ",
    edit: "ਸੋਧ",
    delete: "ਮਿਟਾਓ",
    addMember: "ਮੈਂਬਰ ਸ਼ਾਮਲ ਕਰੋ",
    import: "ਆਯਾਤ",
    export: "ਨਿਰਯਾਤ",
    reset: "ਰੀਸੈੱਟ",
    language: "ਭਾਸ਼ਾ",
    male: "ਪੁਰਸ਼",
    female: "ਔਰਤ",
    other: "ਹੋਰ"
  }
};

export type LanguageCode = 'en' | 'ur' | 'pa';

type LanguageContextType = {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Record<string, string>;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<LanguageCode>('en');
  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
