import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  type JSONContent,
} from "novel";
import { ImageResizer, handleCommandNavigation } from "novel/extensions";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import { ColorSelector } from "./selectors/color-selector";
import { LinkSelector } from "./selectors/link-selector";
import { NodeSelector } from "./selectors/node-selector";
import { MathSelector } from "./selectors/math-selector";
import { Separator } from "@/components/ui/separator";
import { handleImageDrop, handleImagePaste } from "novel/plugins";
import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { uploadFn } from "./image-upload";
import { TextButtons } from "./selectors/text-buttons";
import { slashCommand, suggestionItems } from "./slash-command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import hljs from 'highlight.js';
import '@/assets/css/editor.css';
import GalleryPage from "@/pages/Dashboard/Gallery/GalleryPage";
import CustomEditorCommandItem from "./CustomEditorCommandItem";
const extensions = [...defaultExtensions, slashCommand];
interface EditorProps {
  initialValue: JSONContent | null;
  onContentChange: (content: JSONContent) => void;
}
const Editor: React.FC<EditorProps> = ({ initialValue, onContentChange }) => {
  const [initialContent, setInitialContent] = useState<JSONContent | undefined>(
    initialValue && Object.keys(initialValue).length > 0 ? initialValue : undefined
  );
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [charsCount, setCharsCount] = useState<number | undefined>();
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);
  const [editorInstance, setEditorInstance] = useState<EditorInstance | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);


  const handleImageSelect = (image: string | string[] | null) => {
    const imageUrl = Array.isArray(image) ? image[0] : image || "";
    if (editorInstance) {
      const { schema, view } = editorInstance;
      const { dispatch, state } = view;
      const imageNode = schema.nodes.image.create({
        src: imageUrl,
      });
      const { $from } = state.selection;
      const commandStart = $from.pos - '/gallery'.length;
      // Insert image node at the current cursor position
      dispatch(
        state.tr
          .insert($from.pos, imageNode)
          .deleteRange(commandStart, $from.pos)
      );
      if (imageUrl) {
        setDialogOpen(!dialogOpen);
      }
    }
  };
  // Apply Codeblock Highlighting on the HTML from editor.getHTML()
  const highlightCodeblocks = (content: string) => {
    const doc = new DOMParser().parseFromString(content, 'text/html');
    doc.querySelectorAll('pre code').forEach((el) => {
      // @ts-expect-error highlight.js expects HTMLElement
      hljs.highlightElement(el);
    });
    return new XMLSerializer().serializeToString(doc);
  };
  const debouncedUpdates = useDebouncedCallback(async (editor: EditorInstance) => {
    setEditorInstance(editor);
    const json = editor.getJSON();
    setCharsCount(editor.storage.characterCount.words());
    window.localStorage.setItem("html-content", highlightCodeblocks(editor.getHTML()));
    window.localStorage.setItem("novel-content", JSON.stringify(json));
    window.localStorage.setItem("markdown", editor.storage.markdown.getMarkdown());
    setSaveStatus("Saved");
    onContentChange(json);
  }, 500);

  useEffect(() => {
    if (initialValue && Object.keys(initialValue).length > 0) {
      setInitialContent(initialValue);
    } else {
      setInitialContent(undefined);
    }
  }, [initialValue]);


  return (
    <div className="relative w-full max-w-(--breakpoint-xl)">
      <div className="flex absolute right-3 top-3 z-10 mb-2 gap-2">
        <div className="rounded-lg bg-accent px-2 py-1 text-xs text-muted-foreground">{saveStatus}</div>
        <div className={charsCount ? "rounded-lg bg-accent px-2 py-1 text-xs text-muted-foreground" : "hidden"}>
          {charsCount} Words
        </div>
      </div>
      <EditorRoot key={initialValue ? JSON.stringify(initialValue).length : 'empty'}>
        <EditorContent
          initialContent={initialContent || undefined}
          extensions={extensions}
          className="relative pl-10 pr-5 pt-10 min-h-[300px] w-full max-w-(--breakpoint-xl) border-muted bg-background sm:mb-[calc(5vh)] sm:rounded-lg sm:border sm:shadow-lg"
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
            handleDrop: (view, event, _slice, moved) => handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              class:
                "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-hidden max-w-full",
            },
          }}
          onUpdate={({ editor }: { editor: EditorInstance }) => {
            debouncedUpdates(editor);
            setSaveStatus("Unsaved");
          }}
          slotAfter={<ImageResizer />}
        >
          <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">No results</EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <CustomEditorCommandItem
                  key={item.title}
                  value={item.title}
                  onCommand={({ editor, range }) => {
                    if (item.command) {
                      item.command({ editor, range });
                    }
                  }}
                  onEnterPress={() => {
                    if (item.title === "Gallery Image") {
                      setDialogOpen(true); // Open the dialog when Enter is pressed
                    }
                  }}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                    {item.icon}
                  </div>
                  <div>
                    {
                      item.title === "Gallery Image" ? (
                        <>
                          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger><p className="font-medium text-left">{item.title}</p>
                              <p className="text-xs text-muted-foreground">{item.description}</p></DialogTrigger>
                            <DialogContent className="z-99999 asDialog max-w-[90%] max-h-[90%] overflow-auto"
                              onInteractOutside={(e) => {
                                e.preventDefault();
                              }}
                            >
                              <DialogHeader >
                                <DialogTitle className="mb-3">Choose Image From Gallery</DialogTitle>
                                <div className="upload dialog">
                                  <GalleryPage isGalleryPage={false} onImageSelect={handleImageSelect} />
                                </div>
                              </DialogHeader>
                            </DialogContent>
                          </Dialog>
                        </>
                      ) : (
                        <>
                          <span>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </span>
                        </>
                      )
                    }
                  </div>
                </CustomEditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>
          <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
            <Separator orientation="vertical" />
            <NodeSelector open={openNode} onOpenChange={setOpenNode} />
            <Separator orientation="vertical" />
            <LinkSelector open={openLink} onOpenChange={setOpenLink} />
            <Separator orientation="vertical" />
            <MathSelector />
            <Separator orientation="vertical" />
            <TextButtons />
            <Separator orientation="vertical" />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
          </GenerativeMenuSwitch>
        </EditorContent>

      </EditorRoot>
    </div>
  );
};
export default Editor;
