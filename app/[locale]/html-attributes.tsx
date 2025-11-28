"use client";

import { useEffect } from 'react';

interface HtmlAttributesProps {
  locale: string;
  isRTL: boolean;
}

export function HtmlAttributes({ locale, isRTL }: HtmlAttributesProps) {
  useEffect(() => {
    document.documentElement.setAttribute('lang', locale);
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [locale, isRTL]);

  return null;
}

