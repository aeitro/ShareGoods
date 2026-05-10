import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'hi', 'bn', 'ta'],

  // Used when no locale matches
  defaultLocale: 'en',
  
  // Always include the locale in the URL
  localePrefix: 'always'
});

export const {Link, redirect, usePathname, useRouter, useSearchParams} = createNavigation(routing);
