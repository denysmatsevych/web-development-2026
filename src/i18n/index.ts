import { withBase } from '@/lib/paths';

import { ui } from './ui';

export const locales = ['uk', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'uk';

export const isEnglishEnabled =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_ENGLISH === 'true';

export function getEnabledLocales(): Locale[] {
  return isEnglishEnabled ? [...locales] : [defaultLocale];
}

export function isLocale(value: string): value is Locale {
  return locales.some((locale) => locale === value);
}

export function getLocale(value: string | undefined): Locale {
  if (value === undefined) return defaultLocale;
  if (!isLocale(value)) {
    throw new Error(`Unsupported locale "${value}". Expected one of: ${locales.join(', ')}.`);
  }
  return value;
}

export function useTranslations(locale: Locale) {
  return ui[locale];
}

function stripBase(pathname: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (!base) return pathname;
  if (pathname === base) return '/';
  return pathname.startsWith(`${base}/`) ? pathname.slice(base.length) : pathname;
}

function stripLocale(pathname: string, locale: Locale): string {
  if (locale === defaultLocale) return pathname;
  const prefix = `/${locale}`;
  if (pathname === prefix) return '/';
  return pathname.startsWith(`${prefix}/`) ? pathname.slice(prefix.length) : pathname;
}

/** Build a base-aware URL for a route path that does not include a locale prefix. */
export function localeHref(locale: Locale, pathname: string): string {
  const routePath = stripBase(pathname);
  const normalizedPath = routePath.startsWith('/') ? routePath : `/${routePath}`;
  const localePrefix = locale === defaultLocale ? '' : `/${locale}`;
  return withBase(`${localePrefix}${normalizedPath}`);
}

/** Build alternate URLs only when both language versions are enabled. */
export function localeAlternates(pathname: string): Partial<Record<Locale, string>> | undefined {
  if (!isEnglishEnabled) return undefined;
  return {
    uk: localeHref('uk', pathname),
    en: localeHref('en', pathname),
  };
}

/** Switch the locale in a current Astro URL path while preserving its route. */
export function switchLocaleHref(
  pathname: string,
  currentLocale: Locale,
  targetLocale: Locale,
): string {
  const routePath = stripLocale(stripBase(pathname), currentLocale);
  return localeHref(targetLocale, routePath);
}
