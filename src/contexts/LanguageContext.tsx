import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

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
    other: "Other",
    // Form and modal translations
    addFamilyMember: "Add Family Member",
    editFamilyMember: "Edit Family Member",
    addFirstMember: "Add the first member to start your family tree.",
    addNewMember: "Add a new member and define their relationship.",
    enterName: "Enter name",
    selectGender: "Select gender",
    selectRelationship: "Select relationship",
    selectExistingMember: "Select existing member",
    uploadPhoto: "Upload Photo",
    changePhoto: "Change Photo",
    removePhoto: "Remove Photo",
    parent: "Parent",
    child: "Child",
    spouse: "Spouse",
    sibling: "Sibling",
    grandfather: "Grandfather",
    grandmother: "Grandmother",
    uncle: "Uncle",
    aunt: "Aunt",
    cousin: "Cousin",
    nephew: "Nephew",
    niece: "Niece",
    grandchild: "Grandchild",
    save: "Save Changes",
    cancel: "Cancel",
    add: "Add",
    relatedTo: "Related to",
    relationship_readonly: "Relationship (Read-only)",
    title_optional: "Title (Optional)",
    enterTitle: "Enter title (e.g. Prophet, Hazrat)",
    profilePicture: "Profile Picture",
    supportedFormats: "Supported formats: JPG, PNG, WEBP (max 2MB)",
    imageTooLarge: "Image too large",
    imageSizeLimit: "The image must be less than 2MB",
    invalidFileType: "Invalid file type",
    validFileTypes: "Please upload JPG, PNG, or WEBP files only",
    importSuccess: "Import successful",
    importFailed: "Import failed",
    invalidFileFormat: "The file format is not valid.",
    exportSuccess: "Export successful",
    familyTreeExported: "Family tree has been exported as JSON.",
    resetComplete: "Reset complete",
    resetConfirm: "Are you sure you want to reset the family tree?",
    nothingToReset: "Nothing to reset",
    emptyTree: "Your family tree is empty.",
    memberAdded: "Member added",
    memberAddedDesc: "{name} has been added to your family tree.",
    rootMemberAdded: "Root member added",
    rootMemberAddedDesc: "{name} has been added as the root of your family tree.",
    memberUpdated: "Member updated",
    memberUpdatedDesc: "{name} has been updated in your family tree.",
    updateFailed: "Update failed",
    updateFailedDesc: "Failed to update family member. Please try again.",
    memberDeleted: "Member deleted",
    memberDeletedDesc: "Family member has been removed from the tree.",
    deleteConfirm: "Are you sure you want to delete this family member?",
    childrenHidden: "Children hidden",
    childrenShown: "Children shown",
    childrenToggleDesc: "{state} children nodes for this family member.",
    hidden: "Hidden",
    showing: "Showing",
    nothingToExport: "Nothing to export",
    familyTreeTitle: "Family Tree App",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    fitView: "Fit View",
    error: "Error",
    noMemberFound: "Could not find the family member."
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
    other: "دیگر",
    // Form and modal translations
    addFamilyMember: "خاندان کا رکن شامل کریں",
    editFamilyMember: "خاندان کا رکن ترمیم کریں",
    addFirstMember: "اپنے خاندانی شجرے کو شروع کرنے کے لیے پہلا رکن شامل کریں۔",
    addNewMember: "ایک نیا رکن شامل کریں اور ان کا رشتہ بیان کریں۔",
    enterName: "نام درج کریں",
    selectGender: "جنس منتخب کریں",
    selectRelationship: "رشتہ منتخب کریں",
    selectExistingMember: "موجودہ رکن منتخب کریں",
    uploadPhoto: "تصویر اپلوڈ کریں",
    changePhoto: "تصویر تبدیل کریں",
    removePhoto: "تصویر ہٹا دیں",
    parent: "والدین",
    child: "بچہ",
    spouse: "شریک حیات",
    sibling: "بھائی بہن",
    brother: "بھائی",
    sister: "بہن",
    grandfather: "دادا/نانا",
    grandmother: "دادی/نانی",
    uncle: "چچا/ماموں",
    aunt: "چچی/خالہ",
    cousin: "کزن",
    nephew: "بھتیجا/بھانجا",
    niece: "بھتیجی/بھانجی",
    grandchild: "پوتا/پوتی/نواسا/نواسی",
    grandson: "پوتا/نواسا",
    granddaughter: "پوتی/نواسی",
    father: "والد",
    mother: "والدہ",
    husband: "شوہر",
    wife: "بیوی",
    son: "بیٹا",
    daughter: "بیٹی",
    save: "تبدیلیاں محفوظ کریں",
    cancel: "منسوخ کریں",
    add: "شامل کریں",
    relatedTo: "سے متعلق",
    relationship_readonly: "رشتہ (صرف پڑھنے کے لیے)",
    title_optional: "عنوان (اختیاری)",
    enterTitle: "عنوان درج کریں (مثلاً نبی، حضرت)",
    profilePicture: "پروفائل تصویر",
    supportedFormats: "سپورٹڈ فارمیٹس: JPG، PNG، WEBP (زیادہ سے زیادہ 2MB)",
    imageTooLarge: "تصویر بہت بڑی ہے",
    imageSizeLimit: "تصویر 2MB سے کم ہونی چاہیے",
    invalidFileType: "غلط فائل ٹائپ",
    validFileTypes: "براہ کرم صرف JPG، PNG، یا WEBP فائلز اپلوڈ کریں",
    importSuccess: "درآمد کامیاب",
    importFailed: "درآمد ناکام",
    invalidFileFormat: "فائل فارمیٹ درست نہیں ہے۔",
    exportSuccess: "برآمد کامیاب",
    familyTreeExported: "خاندانی شجرہ JSON کے طور پر برآمد کیا گیا ہے۔",
    resetComplete: "دوبارہ ترتیب مکمل",
    resetConfirm: "کیا آپ واقعی خاندانی شجرے کو دوبارہ ترتیب دینا چاہتے ہیں؟",
    nothingToReset: "دوبارہ ترتیب دینے کے لیے کچھ نہیں",
    emptyTree: "آپ کا خاندانی شجرہ خالی ہے۔",
    memberAdded: "رکن شامل کیا گیا",
    memberAddedDesc: "{name} آپ کے خاندانی شجرے میں شامل کیا گیا ہے۔",
    rootMemberAdded: "بنیادی رکن شامل کیا گیا",
    rootMemberAddedDesc: "{name} آپ کے خاندانی شجرے کی بنیاد کے طور پر شامل کیا گیا ہے۔",
    memberUpdated: "رکن کی تازہ کاری",
    memberUpdatedDesc: "{name} آپ کے خاندانی شجرے میں اپ ڈیٹ کیا گیا ہے۔",
    updateFailed: "اپ ڈیٹ ناکام",
    updateFailedDesc: "خاندان کے رکن کو اپ ڈیٹ کرنے میں ناکامی۔ براہ کرم دوبارہ کوشش کریں۔",
    memberDeleted: "رکن حذف کر دیا گیا",
    memberDeletedDesc: "خاندان کا رکن درخت سے ہٹا دیا گیا ہے۔",
    deleteConfirm: "کیا آپ واقعی اس خاندان کے رکن کو حذف کرنا چاہتے ہیں؟",
    childrenHidden: "بچے چھپائے گئے",
    childrenShown: "بچے دکھائے گئے",
    childrenToggleDesc: "اس خاندان کے رکن کے لیے بچوں کے نوڈز {state}。",
    hidden: "چھپائے گئے",
    showing: "دکھائے جا رہے ہیں",
    nothingToExport: "برآمد کرنے کے لیے کچھ نہیں",
    familyTreeTitle: "خاندانی شجرہ ایپ",
    zoomIn: "زوم ان",
    zoomOut: "زوم آؤٹ",
    fitView: "فٹ ویو",
    error: "خرابی",
    noMemberFound: "خاندان کا رکن نہیں مل سکا۔"
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
    other: "ਹੋਰ",
    // Form and modal translations
    addFamilyMember: "ਪਰਿਵਾਰਕ ਮੈਂਬਰ ਸ਼ਾਮਲ ਕਰੋ",
    editFamilyMember: "ਪਰਿਵਾਰਕ ਮੈਂਬਰ ਸੋਧੋ",
    addFirstMember: "ਆਪਣੇ ਪਰਿਵਾਰਕ ਰੁੱਖ ਨੂੰ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਪਹਿਲਾ ਮੈਂਬਰ ਸ਼ਾਮਲ ਕਰੋ।",
    addNewMember: "ਇੱਕ ਨਵਾਂ ਮੈਂਬਰ ਸ਼ਾਮਲ ਕਰੋ ਅਤੇ ਉਨ੍ਹਾਂ ਦੇ ਰਿਸ਼ਤੇ ਨੂੰ ਪਰਿਭਾਸ਼ਿਤ ਕਰੋ।",
    enterName: "ਨਾਮ ਦਰਜ ਕਰੋ",
    selectGender: "ਲਿੰਗ ਚੁਣੋ",
    selectRelationship: "ਰਿਸ਼ਤਾ ਚੁਣੋ",
    selectExistingMember: "ਮੌਜੂਦਾ ਮੈਂਬਰ ਚੁਣੋ",
    uploadPhoto: "ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ",
    changePhoto: "ਫੋਟੋ ਬਦਲੋ",
    removePhoto: "ਫੋਟੋ ਹਟਾਓ",
    parent: "ਮਾਪੇ",
    child: "ਬੱਚਾ",
    spouse: "ਜੀਵਨ ਸਾਥੀ",
    sibling: "ਭਰਾ-ਭੈਣ",
    brother: "ਭਰਾ",
    sister: "ਭੈਣ",
    grandfather: "ਦਾਦਾ/ਨਾਨਾ",
    grandmother: "ਦਾਦੀ/ਨਾਨੀ",
    uncle: "ਚਾਚਾ/ਮਾਮਾ",
    aunt: "ਚਾਚੀ/ਮਾਸੀ",
    cousin: "ਚਚੇਰਾ ਭਰਾ/ਭੈਣ",
    nephew: "ਭਤੀਜਾ/ਭਾਣਜਾ",
    niece: "ਭਤੀਜੀ/ਭਾਣਜੀ",
    grandchild: "ਪੋਤਾ/ਪੋਤੀ/ਦੋਹਤਾ/ਦੋਹਤੀ",
    grandson: "ਪੋਤਾ/ਦੋਹਤਾ",
    granddaughter: "ਪੋਤੀ/ਦੋਹਤੀ",
    father: "ਪਿਤਾ",
    mother: "ਮਾਤਾ",
    husband: "ਪਤੀ",
    wife: "ਪਤਨੀ",
    son: "ਪੁੱਤਰ",
    daughter: "ਧੀ",
    save: "ਤਬਦੀਲੀਆਂ ਸੁਰੱਖਿਅਤ ਕਰੋ",
    cancel: "ਰੱਦ ਕਰੋ",
    add: "ਸ਼ਾਮਲ ਕਰੋ",
    relatedTo: "ਨਾਲ ਸੰਬੰਧਿਤ",
    relationship_readonly: "ਰਿਸ਼ਤਾ (ਸਿਰਫ਼-ਪੜ੍ਹਨਯੋਗ)",
    title_optional: "ਸਿਰਲੇਖ (ਵਿਕਲਪਿਕ)",
    enterTitle: "ਸਿਰਲੇਖ ਦਰਜ ਕਰੋ (ਜਿਵੇਂ ਨਬੀ, ਹਜ਼ਰਤ)",
    profilePicture: "ਪ੍ਰੋਫਾਈਲ ਚਿੱਤਰ",
    supportedFormats: "ਸਮਰਥਿਤ ਫਾਰਮੈਟ: JPG, PNG, WEBP (ਵੱਧ ਤੋਂ ਵੱਧ 2MB)",
    imageTooLarge: "ਚਿੱਤਰ ਬਹੁਤ ਵੱਡਾ ਹੈ",
    imageSizeLimit: "ਚਿੱਤਰ 2MB ਤੋਂ ਘੱਟ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ",
    invalidFileType: "ਅਵੈਧ ਫਾਈਲ ਕਿਸਮ",
    validFileTypes: "ਕਿਰਪਾ ਕਰਕੇ ਸਿਰਫ JPG, PNG, ਜਾਂ WEBP ਫਾਈਲਾਂ ਅਪਲੋਡ ਕਰੋ",
    importSuccess: "ਆਯਾਤ ਸਫਲ",
    importFailed: "ਆਯਾਤ ਅਸਫਲ",
    invalidFileFormat: "ਫਾਈਲ ਫਾਰਮੈਟ ਵੈਧ ਨਹੀਂ ਹੈ।",
    exportSuccess: "ਨਿਰਯਾਤ ਸਫਲ",
    familyTreeExported: "ਪਰਿਵਾਰਕ ਰੁੱਖ ਨੂੰ JSON ਵਜੋਂ ਨਿਰਯਾਤ ਕੀਤਾ ਗਿਆ ਹੈ।",
    resetComplete: "ਰੀਸੈੱਟ ਪੂਰਾ",
    resetConfirm: "ਕੀ ਤੁਸੀਂ ਪੱਕਾ ਪਰਿਵਾਰਕ ਰੁੱਖ ਨੂੰ ਰੀਸੈੱਟ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?",
    nothingToReset: "ਰੀਸੈੱਟ ਕਰਨ ਲਈ ਕੁਝ ਨਹੀਂ",
    emptyTree: "ਤੁਹਾਡਾ ਪਰਿਵਾਰਕ ਰੁੱਖ ਖਾਲੀ ਹੈ।",
    memberAdded: "ਮੈਂਬਰ ਸ਼ਾਮਲ ਕੀਤਾ ਗਿਆ",
    memberAddedDesc: "{name} ਤੁਹਾਡੇ ਪਰਿਵਾਰਕ ਰੁੱਖ ਵਿੱਚ ਸ਼ਾਮਲ ਕੀਤਾ ਗਿਆ ਹੈ।",
    rootMemberAdded: "ਮੁੱਖ ਮੈਂਬਰ ਸ਼ਾਮਲ ਕੀਤਾ ਗਿਆ",
    rootMemberAddedDesc: "{name} ਤੁਹਾਡੇ ਪਰਿਵਾਰਕ ਰੁੱਖ ਦੇ ਮੁੱਢ ਵਜੋਂ ਸ਼ਾਮਲ ਕੀਤਾ ਗਿਆ ਹੈ।",
    memberUpdated: "ਮੈਂਬਰ ਅੱਪਡੇਟ ਕੀਤਾ ਗਿਆ",
    memberUpdatedDesc: "{name} ਤੁਹਾਡੇ ਪਰਿਵਾਰਕ ਰੁੱਖ ਵਿੱਚ ਅੱਪਡੇਟ ਕੀਤਾ ਗਿਆ ਹੈ।",
    updateFailed: "ਅੱਪਡੇਟ ਅਸਫਲ",
    updateFailedDesc: "ਪਰਿਵਾਰਕ ਮੈਂਬਰ ਨੂੰ ਅੱਪਡੇਟ ਕਰਨ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    memberDeleted: "ਮੈਂਬਰ ਮਿਟਾਇਆ ਗਿਆ",
    memberDeletedDesc: "ਪਰਿਵਾਰਕ ਮੈਂਬਰ ਨੂੰ ਰੁੱਖ ਤੋਂ ਹਟਾ ਦਿੱਤਾ ਗਿਆ ਹੈ।",
    deleteConfirm: "ਕੀ ਤੁਸੀਂ ਯਕੀਨੀ ਤੌਰ 'ਤੇ ਇਸ ਪਰਿਵਾਰਕ ਮੈਂਬਰ ਨੂੰ ਮਿਟਾਉਣਾ ਚਾਹੁੰਦੇ ਹੋ?",
    childrenHidden: "ਬੱਚੇ ਛੁਪਾਏ ਗਏ",
    childrenShown: "ਬੱਚੇ ਦਿਖਾਏ ਗਏ",
    childrenToggleDesc: "ਇਸ ਪਰਿਵਾਰਕ ਮੈਂਬਰ ਲਈ ਬੱਚਿਆਂ ਦੇ ਨੋਡਸ {state}。",
    hidden: "ਛੁਪਾਏ ਗਏ",
    showing: "ਦਿਖਾਏ ਜਾ ਰਹੇ",
    nothingToExport: "ਨਿਰਯਾਤ ਕਰਨ ਲਈ ਕੁਝ ਨਹੀਂ",
    familyTreeTitle: "ਪਰਿਵਾਰਕ ਰੁੱਖ ਐਪ",
    zoomIn: "ਜ਼ੂਮ ਇਨ",
    zoomOut: "ਜ਼ੂਮ ਆਉਟ",
    fitView: "ਫਿੱਟ ਵਿਊ",
    error: "ਗਲਤੀ",
    noMemberFound: "ਪਰਿਵਾਰਕ ਮੈਂਬਰ ਨਹੀਂ ਮਿਲਿਆ।"
  }
};

export type LanguageCode = 'en' | 'ur' | 'pa';

type LanguageContextType = {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Record<string, string>;
  formatMessage: (key: string, values?: Record<string, string>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Try to get the language from localStorage or default to 'en'
  const [language, setLanguage] = useState<LanguageCode>(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    return (savedLanguage as LanguageCode) || 'en';
  });
  
  // Set up translations object based on selected language
  const t = translations[language];
  
  // Helper function to format messages with placeholders like {name}
  const formatMessage = (key: string, values?: Record<string, string>): string => {
    let message = t[key] || key;
    
    if (values) {
      Object.entries(values).forEach(([k, v]) => {
        message = message.replace(new RegExp(`{${k}}`, 'g'), v);
      });
    }
    
    return message;
  };

  // Save the language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatMessage }}>
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
