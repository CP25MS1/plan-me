declare module '@tiptap/react' {
  import type React from 'react';

  export type Editor = {
    getHTML: () => string;
    isDestroyed?: boolean;
    chain: () => {
      setContent: (content: string) => { run: () => void };
      focus: () => { run: () => void };
    };
  };

  export type UseEditorOptions = {
    content?: unknown;
    extensions?: unknown;
    editable?: boolean;
    immediatelyRender?: boolean;
    shouldRerenderOnTransaction?: boolean;
    onUpdate?: (props: { editor: Editor }) => void;
  };

  export function useEditor(options?: UseEditorOptions, deps?: React.DependencyList): Editor | null;

  export type EditorContentProps = React.HTMLAttributes<HTMLDivElement> & {
    editor: Editor | null;
  };

  export const EditorContent: React.ComponentType<EditorContentProps>;
}

declare module '@tiptap/extension-link' {
  const Link: { configure: (opts: Record<string, unknown>) => unknown };
  export default Link;
}
