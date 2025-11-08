'use client';

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLocale, type Locale } from '@/store/i18n-slice';
import { UserPreference } from '@/api/users';
import { useUpdatePreference } from '@/app/profile/hooks';
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
    <div
      className="relative flex w-[85px] h-[34px] rounded-full overflow-hidden cursor-pointer select-none"
      style={{ backgroundColor: '#D7D8DB' }}
    >
      {/* พื้นหลังเลื่อน */}
      <span
        className="absolute top-[3px] left-[3px] h-[28px] w-[43px] rounded-full transition-transform duration-300"
        style={{
          backgroundColor: '#2ECC71',
          transform: currentLang?.toUpperCase() === 'EN' ? 'translateX(36px)' : 'translateX(0)',
        }}
      />
      {/* TH */}
      <span
        onClick={() => switchTo({ language: 'TH' } as UserPreference)}
        className={`w-1/2 text-center z-10 flex items-center justify-center font-semibold text-[13px] transition-colors ${
          currentLang?.toUpperCase() === 'TH' ? 'text-white' : 'text-gray-700'
        }`}
      >
        TH
      </span>
      {/* EN */}
      <span
        onClick={() => switchTo({ language: 'EN' } as UserPreference)}
        className={`w-1/2 text-center z-10 flex items-center justify-center font-semibold text-[13px] transition-colors ${
          currentLang?.toUpperCase() === 'EN' ? 'text-white' : 'text-gray-700'
        }`}
      >
        EN
      </span>
    </div>
  );
};

export default LangSwitcher;
