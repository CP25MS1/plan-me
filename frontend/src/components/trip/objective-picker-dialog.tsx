'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Box, IconButton, Chip, Dialog, DialogContent, Divider } from '@mui/material';
import { X as XIcon } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { RootState } from '@/store';
import { DefaultObjective, CustomObjective, Objective } from '@/api/trips';
import { generateRandomLightColor } from '@/lib/color';
import { useI18nSelector } from '@/store/selectors';

export const MAX_OBJECTIVES = 3;
export const MAX_OBJECTIVE_NAME_LENGTH = 25;

export const useDefaultObjectives = () =>
  useSelector((s: RootState) => s.constant.defaultObjectives);

export const getKey = (obj: Objective) => {
  return (obj as DefaultObjective).boId
    ? `bo:${(obj as DefaultObjective).boId}`
    : `c:${(obj as CustomObjective).name}`;
};

type ObjectivePickerDialogProps = {
  open: boolean;
  selected: Objective[];
  defaultObjectives: DefaultObjective[];
  onClose: () => void;
  onChange: (next: Objective[]) => void;
};

const ObjectivePickerDialog = ({
  open,
  selected,
  defaultObjectives,
  onClose,
  onChange,
}: ObjectivePickerDialogProps) => {
  const { t } = useTranslation('trip_create');
  const { locale } = useI18nSelector();
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const selectedMap = useMemo(() => new Map(selected.map((s) => [getKey(s), s])), [selected]);

  const canAddMore = selected.length < MAX_OBJECTIVES;

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleAddFromInput = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!canAddMore) {
      setInput('');
      return;
    }
    if (trimmed.length > MAX_OBJECTIVE_NAME_LENGTH) {
      setInput(trimmed.slice(0, MAX_OBJECTIVE_NAME_LENGTH));
      return;
    }

    if (selected.some((s) => s.name === trimmed)) {
      setInput('');
      return;
    }
    const newObj: CustomObjective = {
      id: null,
      name: trimmed,
      badgeColor: generateRandomLightColor(),
    };
    onChange([...selected, newObj]);
    setInput('');
  }, [input, selected, onChange, canAddMore]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFromInput();
    }
  };

  const handleDeleteSelected = useCallback(
    (obj: Objective) => {
      onChange(selected.filter((s) => getKey(s) !== getKey(obj)));
    },
    [onChange, selected]
  );

  const handleSelectDefault = useCallback(
    (def: DefaultObjective) => {
      if (!canAddMore) return;
      const key = `bo:${def.boId}`;
      if (selectedMap.has(key)) return;
      onChange([...selected, def]);
    },
    [canAddMore, selectedMap, onChange, selected]
  );

  const bottomDefaults = useMemo(
    () => defaultObjectives.filter((d) => !selectedMap.has(getKey(d as Objective))),
    [defaultObjectives, selectedMap]
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: '100%', maxWidth: 560 } } }}
    >
      <DialogContent sx={{ px: { xs: 2, sm: 3 }, pb: 2 }}>
        <Box
          onClick={focusInput}
          sx={{
            minHeight: 30,
            display: 'flex',
            justifyContent: 'space-between',
            p: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexWrap: 'wrap',
              width: '100%',
            }}
          >
            {selected.map((s) => (
              <Chip
                key={getKey(s)}
                label={s.name}
                onDelete={() => handleDeleteSelected(s)}
                deleteIcon={<XIcon size={14} />}
                variant="filled"
                size="medium"
                sx={{
                  bgcolor: s.badgeColor,
                }}
              />
            ))}

            <input
              ref={inputRef}
              value={input}
              onChange={(e) => {
                const v = e.target.value;
                if (v.length <= MAX_OBJECTIVE_NAME_LENGTH) setInput(v);
                else setInput(v.slice(0, MAX_OBJECTIVE_NAME_LENGTH));
              }}
              onKeyDown={handleInputKeyDown}
              maxLength={MAX_OBJECTIVE_NAME_LENGTH}
              disabled={!canAddMore}
              style={{
                minWidth: 80,
                maxWidth: '60%',
                flex: '1 1 auto',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 14,
                padding: '6px 4px',
              }}
              placeholder={
                selected.length === 0 ? `${t('fields.objectives.placeholder_modal')}` : undefined
              }
            />
          </Box>

          <IconButton aria-label="close" size="small" onClick={onClose}>
            <XIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {bottomDefaults.map((d) => (
              <Chip
                key={getKey(d as Objective)}
                label={locale === 'en' ? d.EN : d.TH}
                onClick={() => handleSelectDefault(d)}
                clickable
                size="medium"
                sx={{
                  bgcolor: d.badgeColor,
                  cursor: canAddMore ? 'pointer' : 'not-allowed',
                  opacity: canAddMore ? 1 : 0.5,
                }}
              />
            ))}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ObjectivePickerDialog;
