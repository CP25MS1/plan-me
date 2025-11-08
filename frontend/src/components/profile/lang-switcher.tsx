'use client';

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLocale, type Locale } from '@/store/i18n-slice';
import { UserPreference } from '@/api/users';
import { useUpdatePreference } from '@/app/profile/hooks';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { RootState } from '@/store';

export const LangSwitcher = () => {
  const dispatch = useDispatch();
  const updatePreference = useUpdatePreference();
  const currentLang = useSelector((s: RootState) => s.i18n.locale);

  const switchTo = useCallback(
    (pref: UserPreference) => {
      updatePreference.mutate(pref, {
        onSuccess: () => {
          const locale = pref.language.toLowerCase() as Locale;
          dispatch(setLocale(locale));
          window.localStorage.setItem('lang', locale);
        },
      });
    },
    [dispatch, updatePreference]
  );

  return (
    <ToggleGroup
      type="single"
      value={currentLang}
      onValueChange={(lng) => {
        if (!lng) return;
        switchTo({ language: lng } as UserPreference);
      }}
      className="flex gap-2"
    >
      <ToggleGroupItem value="EN" aria-label="Switch to English">
        EN
      </ToggleGroupItem>
      <ToggleGroupItem value="TH" aria-label="เปลี่ยนเป็นภาษาไทย">
        TH
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default LangSwitcher;
