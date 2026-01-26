'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Image from 'next/image';
import { Container, Grid, Box, Typography, IconButton, Divider } from '@mui/material';
import { Star, X, MapPin, Clock, File } from 'lucide-react';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { useEditor, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import {
  RichTextEditorProvider,
  RichTextField,
  RichTextReadOnly,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  MenuButtonBold,
  MenuButtonItalic,
  MenuButtonBulletedList,
  MenuButtonOrderedList,
  MenuButtonEditLink,
} from 'mui-tiptap';
import { useTranslation } from 'react-i18next';

import { WishlistPlace, OpeningHours } from '@/api/trips';
import { RootState } from '@/store';
import { updateWishlistPlace } from '@/store/trip-detail-slice';
import { tokens } from '@/providers/theme/design-tokens';
import { useUpdateWishlistPlace } from '../hooks';
import { TFunction } from 'i18next';

dayjs.extend(localizedFormat);

type ContentProps = {
  wishlistItem: WishlistPlace;
  onCloseAction: () => void;
};

const pad = (n: number) => n.toString().padStart(2, '0');
const formatPoint = (p: { hour: number; minute: number }) => `${pad(p.hour)}:${pad(p.minute)}`;

const parseOpeningHours = (jsonStr?: string): OpeningHours | null => {
  if (!jsonStr) return null;
  try {
    return JSON.parse(jsonStr) as OpeningHours;
  } catch {
    return null;
  }
};

const buildReadableHours = (
  openingHours: OpeningHours | null,
  locale: string,
  t: TFunction
): string[] => {
  if (!openingHours || !openingHours.periods || openingHours.periods.length === 0)
    return [t('sectionCard.wishlistPlace.opening_hours.no_data')];

  const slots: Record<number, string[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

  for (const period of openingHours.periods) {
    const openDay = period.open.day;
    const openTime = formatPoint(period.open);
    const closeTime = formatPoint(period.close);
    slots[openDay].push(`${openTime} - ${closeTime}`);
  }

  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  return Object.keys(slots).map((k) => {
    const dayIdx = Number(k);
    const exampleDate = new Date(2023, 0, 1 + dayIdx);
    const dayLabel = formatter.format(exampleDate);
    const ranges = slots[dayIdx];
    return `${dayLabel}: ${ranges.length ? ranges.join(', ') : t('sectionCard.wishlistPlace.opening_hours.closed')}`;
  });
};

export const WishlistPlaceDetailContent: React.FC<ContentProps> = ({
  wishlistItem,
  onCloseAction,
}) => {
  const dispatch = useDispatch();
  const locale = useSelector((s: RootState) => s.i18n.locale);
  const tripOverview = useSelector((s: RootState) => s.tripDetail.overview);
  const { t } = useTranslation('trip_overview');
  const { t: tCommon } = useTranslation('common');
  const [isEditing, setIsEditing] = useState(false);
  const [notesHtml, setNotesHtml] = useState<string>(wishlistItem.notes || '');
  const { mutate } = useUpdateWishlistPlace();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const isToolbarFocused = useRef(false);

  const updatedWishlistItem =
    tripOverview?.wishlistPlaces.find((wp) => wp.id === wishlistItem.id) || wishlistItem;

  const openingHours = useMemo(
    () => parseOpeningHours(updatedWishlistItem.place.openingHours),
    [updatedWishlistItem.place.openingHours]
  );
  const readableHours = useMemo(
    () => buildReadableHours(openingHours, locale, t),
    [openingHours, locale, t]
  );

  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: true })],
    content: updatedWishlistItem.notes || '<p></p>',
    shouldRerenderOnTransaction: true,
    immediatelyRender: false,
    editable: true,
    onUpdate: ({ editor }: { editor: Editor }) => setNotesHtml(editor.getHTML()),
  });

  const preventToolbarBlur = (e: React.MouseEvent) => {
    e.preventDefault();
    isToolbarFocused.current = true;
  };

  const handleToolbarMouseEnter = () => {
    isToolbarFocused.current = true;
  };

  const handleToolbarMouseLeave = () => {
    isToolbarFocused.current = false;
  };

  const handleTextFieldBlur = () => {
    if (!isToolbarFocused.current) {
      handleSave();
    }
    isToolbarFocused.current = false;
  };

  const handleSave = useCallback(() => {
    if (notesHtml === updatedWishlistItem.notes) {
      setIsEditing(false);
      return;
    }

    mutate(
      { tripId: updatedWishlistItem.tripId, placeId: updatedWishlistItem.id, notes: notesHtml },
      {
        onSuccess: (data) => {
          dispatch(updateWishlistPlace({ wp: { ...updatedWishlistItem, notes: data.notes } }));
          setNotesHtml(data.notes);
          setIsEditing(false);
        },
      }
    );
  }, [notesHtml, updatedWishlistItem, mutate, dispatch]);

  useEffect(() => {
    if (!isEditing) {
      setNotesHtml(updatedWishlistItem.notes || '');
    }
  }, [updatedWishlistItem.notes, isEditing]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const current = editor.getHTML();
    if (current !== notesHtml) {
      editor
        .chain()
        .setContent(notesHtml || '<p></p>')
        .run();
    }
  }, [notesHtml, editor]);

  const nonEditingView =
    notesHtml && notesHtml.trim() && notesHtml !== '<p></p>' ? (
      <Box sx={{ mt: 1 }} onClick={() => setIsEditing(true)}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', marginBottom: '1rem' }}>
          <File size={18} />
          <Typography variant="subtitle1">{t('sectionCard.wishlistPlace.notes.title')}</Typography>
        </Box>
        <RichTextReadOnly
          key={notesHtml}
          content={notesHtml}
          extensions={[StarterKit, Link]}
          immediatelyRender={true}
        />
      </Box>
    ) : (
      <Box
        onClick={() => setIsEditing(true)}
        sx={{
          borderRadius: 1,
          p: 1,
          mt: 1,
          bgcolor: 'background.paper',
          cursor: 'text',
          minHeight: 80,
        }}
      >
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          <em>{t('sectionCard.wishlistPlace.notes.cta_text')}</em>
        </Typography>
      </Box>
    );

  return (
    <Container maxWidth="md" sx={{ py: 3, position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'end' }}>
        <IconButton size="small" onClick={onCloseAction} aria-label="Close" sx={{ paddingX: 0 }}>
          <X size={21} />
        </IconButton>
      </Box>

      <Grid container spacing={2} alignItems="flex-start" paddingTop="0.5rem">
        <Grid size={{ xs: 12, md: 5 }}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: { xs: 220, md: 320 },
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            {wishlistItem.place.defaultPicUrl ? (
              <Image
                src={wishlistItem.place.defaultPicUrl}
                alt={wishlistItem.place.th?.name || wishlistItem.place.en?.name || 'place image'}
                fill
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.100',
                }}
              >
                <Typography variant="subtitle1">{tCommon('empty.image')}</Typography>
              </Box>
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}
          >
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, marginRight: '0.5rem' }}>
                  {locale === 'th' ? wishlistItem.place.th?.name : wishlistItem.place.en?.name}
                </Typography>

                {wishlistItem.place.rating && (
                  <>
                    <Star size={21} fill={tokens.color.warning} strokeWidth={0} />
                    <Typography variant="body1">{wishlistItem.place.rating}</Typography>
                  </>
                )}
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {locale === 'th'
                  ? wishlistItem.place.th?.description
                  : wishlistItem.place.en?.description}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Box
                sx={{
                  flex: '0 0 28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MapPin size={18} aria-hidden />
              </Box>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', ml: 1, flex: 1, wordBreak: 'break-word' }}
              >
                {locale === 'th' ? wishlistItem.place.th?.address : wishlistItem.place.en?.address}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Box
                sx={{
                  flex: '0 0 28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Clock size={18} aria-hidden />
              </Box>
              <Box sx={{ ml: 1, flex: 1 }}>
                {readableHours.map((line) => (
                  <Typography
                    key={line}
                    variant="body2"
                    sx={{ color: 'text.secondary', wordBreak: 'break-word' }}
                  >
                    {line}
                  </Typography>
                ))}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
              {isEditing ? (
                <Box sx={{ mt: 1 }}>
                  {editor ? (
                    <RichTextEditorProvider editor={editor}>
                      <Box sx={{ mb: 1 }}>
                        <MenuControlsContainer
                          ref={toolbarRef}
                          onMouseDown={preventToolbarBlur}
                          onMouseEnter={handleToolbarMouseEnter}
                          onMouseLeave={handleToolbarMouseLeave}
                        >
                          <MenuSelectHeading />
                          <MenuDivider />
                          <MenuButtonBold />
                          <MenuButtonItalic />
                          <MenuButtonBulletedList />
                          <MenuButtonOrderedList />
                          <MenuButtonEditLink />
                        </MenuControlsContainer>
                      </Box>

                      <RichTextField onBlurCapture={handleTextFieldBlur} />
                    </RichTextEditorProvider>
                  ) : null}
                </Box>
              ) : (
                nonEditingView
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default WishlistPlaceDetailContent;
