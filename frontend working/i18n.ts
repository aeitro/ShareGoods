import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

const locales = ['en', 'hi', 'bn', 'ta'];
const defaultLocale = 'en';

export default getRequestConfig(async (params) => {
  // Use the locale from params, or fallback to default if it's undefined
  const locale = params.locale || defaultLocale;
  
  console.log(`[i18n] Resolved locale: "${locale}" (original: "${params.locale}")`);

  if (!locales.includes(locale as any)) {
    console.error(`[i18n] Unsupported locale: "${locale}". Fallback to "${defaultLocale}"`);
    return {
      locale: defaultLocale,
      messages: (await import(`./messages/${defaultLocale}.json`)).default
    };
  }

  try {
    const messages = (await import(`./messages/${locale}.json`)).default;
    return {
      locale,
      messages
    };
  } catch (error) {
    console.error(`[i18n] Error loading messages for "${locale}":`, error);
    notFound();
  }
});
