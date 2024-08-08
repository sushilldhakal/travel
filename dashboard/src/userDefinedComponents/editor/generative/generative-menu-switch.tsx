import React, { Fragment, useEffect } from 'react';
import { EditorBubble, useEditor } from 'novel';
import { removeAIHighlight } from 'novel/extensions';
import { Button } from '@/components/ui/button';
import Magic from '@/assets/icons/magic';
import { AISelector } from './ai-selector';

interface GenerativeMenuSwitchProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GenerativeMenuSwitch = ({ children, open, onOpenChange }: GenerativeMenuSwitchProps) => {
  const { editor } = useEditor();



  useEffect(() => {
    if (editor && !open) {
      removeAIHighlight(editor);
    }
  }, [open, editor]);

  const handleOpenChange = () => {
    if (editor && editor.isEditable) {
      onOpenChange(true);
    } else {
      console.error("Editor instance is not available or not editable.", editor);
    }
  };




  return (
    <EditorBubble
      tippyOptions={{
        placement: open ? "bottom-start" : "top",
        onHidden: () => {
          onOpenChange(false);
          if (editor) {
            editor.chain().unsetHighlight().run();
          }
        },
      }}
      className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-muted bg-background shadow-xl"
    >
      {open && <AISelector open={open} onOpenChange={onOpenChange} />}
      {!open && (
        <Fragment>
          <Button
            className="gap-1 rounded-none text-purple-500"
            variant="ghost"
            onClick={handleOpenChange}
            size="sm"
          >
            <Magic className="h-5 w-5" />
            Ask AI
          </Button>
          {children}
        </Fragment>
      )}
    </EditorBubble>
  );
};

export default GenerativeMenuSwitch;
