import { FC, KeyboardEvent, ReactNode } from 'react';
import { EditorCommandItem as OriginalEditorCommandItem } from 'novel';
import { EditorInstance } from 'novel'; // Adjust import according to actual type
import { Range } from '@tiptap/core'; // Adjust import according to actual type

interface CustomEditorCommandItemProps {
  onCommand: ({ editor, range }: { editor: EditorInstance; range: Range }) => void;
  onEnterPress?: () => void;
  value?: string;
  onSelect?: (value: string) => void;
  children?: ReactNode;
  className: string;
}

const CustomEditorCommandItem: FC<CustomEditorCommandItemProps> = ({
  onCommand,
  onEnterPress,
  value,
  onSelect,
  className,
  children,
  ...props
}) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (onEnterPress) {
        onEnterPress();
      }
    }
  };

  return (
    <OriginalEditorCommandItem
      {...props}
      onKeyDown={handleKeyDown}
      onCommand={onCommand}
      value={value}
      className={className}
      onSelect={(selectedValue: string) => {
        if (onSelect) {
          onSelect(selectedValue);
        }
      }}
    >
      {children}
    </OriginalEditorCommandItem>
  );
};

export default CustomEditorCommandItem;
