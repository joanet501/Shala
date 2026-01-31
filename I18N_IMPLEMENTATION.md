# 🌍 Internationalization (i18n) Implementation Guide

## Architecture Overview

### **Technology Stack**
- **Library**: `next-intl` (already installed)
- **Approach**: Cookie-based locale detection (no URL changes needed)
- **Languages**: English (en), Spanish (es)
- **Default**: English

### **File Structure**
```
├── messages/
│   ├── en.json                    # English translations
│   └── es.json                    # Spanish translations
├── src/i18n/
│   ├── config.ts                  # Locale configuration
│   └── request.ts                 # next-intl setup
├── src/components/
│   └── language-switcher.tsx      # Language selector component
```

---

## 🔧 How It Works

### **1. Locale Detection Priority**
1. Cookie (`NEXT_LOCALE`) - User's explicit choice
2. Browser language (`Accept-Language` header)
3. Default locale (English)

### **2. Translation Loading**
- Translations loaded server-side based on detected locale
- All translations available via `useTranslations()` hook

---

## 📝 Usage Examples

### **Client Components**

```tsx
"use client";

import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('registration');

  return (
    <div>
      <h1>{t('title', { programName: 'Yoga 101' })}</h1>
      <button>{t('buttons.next')}</button>
    </div>
  );
}
```

### **Server Components**

```tsx
import { useTranslations } from 'next-intl';

export default function MyPage() {
  const t = useTranslations('registration');

  return (
    <div>
      <h1>{t('steps.personal')}</h1>
    </div>
  );
}
```

### **With Dynamic Values**

```tsx
// Translation file
{
  "greeting": "Hello, {name}!"
}

// Component
const t = useTranslations();
<p>{t('greeting', { name: 'Juan' })}</p>
// Output: "Hello, Juan!" (en) or "¡Hola, Juan!" (es)
```

---

## 🎯 Migration Steps

### **Priority 1: Public-Facing Pages** (Student Experience)
1. ✅ Health Form Component
2. ✅ Registration Form Component
3. ✅ Booking Confirmation Page
4. Teacher Public Page (`/t/[slug]`)
5. Program Registration Page

### **Priority 2: Teacher Dashboard** (Optional)
- Can keep English-only initially
- Add later based on teacher location/preference

---

## 🔄 How to Update a Component

### **Before (Hardcoded)**
```tsx
<Label>First Name</Label>
<p>Please enter your information</p>
```

### **After (Translated)**
```tsx
const t = useTranslations('registration.personalInfo');

<Label>{t('firstName')}</Label>
<p>{t('instruction')}</p>
```

---

## 📚 Translation File Organization

### **Current Structure**
```json
{
  "registration": {
    "personalInfo": { ... },
    "healthForm": { ... },
    "payment": { ... }
  },
  "healthConditions": { ... },
  "booking": { ... }
}
```

### **Adding New Translations**
1. Add to `/messages/en.json`
2. Add same keys to `/messages/es.json`
3. Use in components with `useTranslations()`

---

## 🌐 Language Switcher

### **Add to Any Page**
```tsx
import { LanguageSwitcher } from '@/components/language-switcher';

<LanguageSwitcher />
```

**Best Placement:**
- Teacher public page header
- Registration form header
- Footer of public pages

---

## 🎨 Validation Messages

### **Update Zod Schemas**

```tsx
// Before
z.string().min(2, "First name must be at least 2 characters")

// After (with i18n)
import { useTranslations } from 'next-intl';

const t = useTranslations('registration.errors');
z.string().min(2, t('firstNameMin'))
```

**Note:** For client-side validation in forms, translation strings are embedded in the schema.

---

## 🚀 Next Steps to Complete i18n

### **Immediate (Required for Launch)**
1. Update `HealthForm` component to use `useTranslations()`
2. Update `RegistrationForm` component to use `useTranslations()`
3. Update `BookingConfirmation` page to use `useTranslations()`
4. Add `LanguageSwitcher` to public pages

### **Short-term (Nice to Have)**
1. Teacher public page translations
2. Email notifications (templates in both languages)
3. Toast messages translation

### **Long-term (Future Enhancement)**
1. Add more languages (Portuguese, French, etc.)
2. Teacher language preference in profile
3. Auto-detect region for date/time formatting
4. RTL language support (Arabic, Hebrew)

---

## 📖 Example: Full Component Migration

### **Before**
```tsx
export function HealthForm() {
  return (
    <div>
      <h3>Estado de salud</h3>
      <Label>¿Ha tenido alguna cirugía en los últimos seis meses?</Label>
    </div>
  );
}
```

### **After**
```tsx
import { useTranslations } from 'next-intl';

export function HealthForm() {
  const t = useTranslations('registration.healthForm');

  return (
    <div>
      <h3>{t('healthStatus')}</h3>
      <Label>{t('recentSurgery')}</Label>
    </div>
  );
}
```

---

## ✅ Benefits of This Approach

1. **No URL Changes** - `/t/teacher-slug` works for all languages
2. **User Preference** - Remembers language choice via cookie
3. **Browser Detection** - Auto-selects based on browser language
4. **Type-Safe** - TypeScript knows available translation keys
5. **Scalable** - Easy to add new languages
6. **Performance** - Server-side rendering with translations
7. **SEO-Friendly** - Can add `lang` attribute based on locale

---

## 🔍 Testing

```bash
# Test English
document.cookie = "NEXT_LOCALE=en; path=/"
window.location.reload()

# Test Spanish
document.cookie = "NEXT_LOCALE=es; path=/"
window.location.reload()
```

---

## 📦 What's Already Set Up

✅ next-intl configuration
✅ English translations (messages/en.json)
✅ Spanish translations (messages/es.json)
✅ Locale detection logic
✅ Language switcher component
✅ Health conditions in both languages

**Ready to use!** Just import `useTranslations` and start translating components.
