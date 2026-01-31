'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import {
  MenuButtonBold,
  MenuButtonBulletedList,
  MenuButtonEditLink,
  MenuButtonItalic,
  MenuButtonOrderedList,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditorProvider,
  RichTextField,
  RichTextReadOnly,
} from 'mui-tiptap';
import { File } from 'lucide-react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useTranslation } from 'react-i18next';
import { Editor, useEditor } from '@tiptap/react';

type PlaceNoteActionProps = {
  notes: string;
  onSave: (notes: string) => void;
};

const EMPTY_CONTENT = '<p></p>';

const isEmptyHtml = (html?: string) => !html || !html.trim() || html === EMPTY_CONTENT;

/** Components **/
const PlaceNoteAction = ({ notes, onSave }: PlaceNoteActionProps) => {
  const { t } = useTranslation('trip_overview');

  const [isEditing, setIsEditing] = useState(false);
  const [notesHtml, setNotesHtml] = useState<string>(notes ?? '');
  const isToolbarFocused = useRef(false);

  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: true })],
    content: notes || EMPTY_CONTENT,
    editable: true,
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor }: { editor: Editor }) => {
      setNotesHtml(editor.getHTML());
    },
  });

  /** Handlers **/
  const enterEditMode = () => setIsEditing(true);

  const handleSave = useCallback(() => {
    if (notesHtml === notes) {
      setIsEditing(false);
      return;
    }

    onSave(notesHtml);
    setIsEditing(false);
  }, [notesHtml, notes, onSave]);

  const handleTextFieldBlur = () => {
    if (!isToolbarFocused.current) {
      handleSave();
    }
    isToolbarFocused.current = false;
  };

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

  /** Render Helpers **/
  const renderReadOnlyView = () => (
    <Box sx={{ mt: 1 }} onClick={enterEditMode}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
        <File size={18} />
        <Typography variant="subtitle1">{t('sectionCard.wishlistPlace.notes.title')}</Typography>
      </Box>

      <RichTextReadOnly
        key={notesHtml}
        content={notesHtml}
        extensions={[StarterKit, Link]}
        immediatelyRender
      />
    </Box>
  );

  const renderEmptyView = () => (
    <Box
      onClick={enterEditMode}
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

  const renderEditor = () =>
    editor && (
      <RichTextEditorProvider editor={editor}>
        <Box sx={{ mb: 1 }}>
          <MenuControlsContainer
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
    );

  const renderedView = isEmptyHtml(notesHtml) ? renderEmptyView() : renderReadOnlyView();

  return <Box>{isEditing ? renderEditor() : renderedView}</Box>;
};

export default PlaceNoteAction;
