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

/**
 * Alternate URLs for the language versions of a page that actually exist.
 * `undefined` when English is disabled, so production has no `hreflang` and no
 * language switcher.
 */
export function localeAlternatesFor(
  pathname: string,
  exists: (locale: Locale) => boolean,
): Partial<Record<Locale, string>> | undefined {
  if (!isEnglishEnabled) return undefined;
  return Object.fromEntries(
    locales.filter(exists).map((locale) => [locale, localeHref(locale, pathname)]),
  );
}

/** Language names written in their own language; they stay the same on every page. */
export const languageNames: Record<Locale, string> = {
  uk: 'Українська (UK)',
  en: 'English (EN)',
};

export interface LanguageSwitchLink {
  locale: Locale;
  href: string;
}

/**
 * Links for the language switcher. Returns `undefined` when there is nothing to
 * switch. If a language version does not exist, the link goes to the
 * course page, or to the home page when there is no course.
 */
export function getLanguageSwitchLinks(
  alternates: Partial<Record<Locale, string>> | undefined,
  courseSlug?: string,
): LanguageSwitchLink[] | undefined {
  if (!isEnglishEnabled || !alternates) return undefined;
  return locales.map((locale) => ({
    locale,
    href: alternates[locale] ?? localeHref(locale, courseSlug ? `/${courseSlug}/` : '/'),
  }));
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
