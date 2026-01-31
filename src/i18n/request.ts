import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { defaultLocale, isValidLocale, type Locale } from './config';

export default getRequestConfig(async () => {
  let locale: Locale = defaultLocale;

  try {
    // Get locale from URL, cookie, or browser preference
    const cookieStore = await cookies();
    const headersList = await headers();

    const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
    const acceptLanguage = headersList.get('accept-language');

    if (cookieLocale && isValidLocale(cookieLocale)) {
      locale = cookieLocale;
    } else if (acceptLanguage) {
      const browserLocale = acceptLanguage.split(',')[0].split('-')[0];
      if (isValidLocale(browserLocale)) {
        locale = browserLocale;
      }
    }
  } catch {
    // Fallback to default locale during prerendering (e.g. _global-error)
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
