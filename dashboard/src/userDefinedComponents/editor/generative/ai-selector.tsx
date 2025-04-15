import { Command, CommandInput } from "@/components/ui/command";
import { ArrowUp } from "lucide-react";
import { useEditor } from "novel";
import { addAIHighlight } from "novel/extensions";
import { useState } from "react";
import Markdown from "react-markdown";
import AICompletionCommands from "./ai-completion-command";
import AISelectorCommands from "./ai-selector-commands";
import { ScrollArea } from "@/components/ui/scroll-area";
import Magic from "@/assets/icons/magic";
import CrazySpinner from "@/assets/icons/crazy-spinner";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { generateCompletion } from "@/http"; // Assuming this is your API function
import { toast } from "@/components/ui/use-toast";

interface AISelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AISelector({ onOpenChange }: AISelectorProps) {
  const { editor } = useEditor();
  const [inputValue, setInputValue] = useState("");

  const { mutate: complete, data: completion, isPending } = useMutation({
    mutationFn: generateCompletion,
    onSuccess: (data) => {
      if (data.completion) {
        toast({
          title: "AI Completion",
          description: <Markdown>{data.completion}</Markdown>,
          duration: 9000,
        })
      }
    },
    onError: (error: any) => {
      if (error.response && error.response.status === 429) {
        toast({
          title: "Rate limit exceeded",
          description: "You have reached your request limit for the day.",
          variant: "destructive",
          duration: 9000,
        })
      } else {
        toast({
          title: "Something went wrong",
          description: error.message || 'Internal Server Error',
          variant: "destructive",
          duration: 9000,
        })
      }
    }
  });

  const hasCompletion = completion && completion.completion && completion.completion.length > 0;

  return (
    <Command className="w-[350px]">
      {hasCompletion && (
        <div className="flex max-h-[400px]">
          <ScrollArea>
            <div className="prose p-2 px-4 prose-sm">
              <Markdown>{completion.completion}</Markdown>
            </div>
          </ScrollArea>
        </div>
      )}

      {isPending && (
        <div className="flex h-12 w-full items-center px-4 text-sm font-medium text-muted-foreground text-purple-500">
          <Magic className="mr-2 h-4 w-4 shrink-0" />
          AI is thinking
          <div className="ml-2 mt-1">
            <CrazySpinner />
          </div>
        </div>
      )}
      {!isPending && (
        <>
          <div className="relative">
            <CommandInput
              value={inputValue}
              onValueChange={setInputValue}
              autoFocus
              placeholder={hasCompletion ? "Tell AI what to do next" : "Ask AI to edit or generate..."}
              onFocus={() => addAIHighlight(editor)}
            />
            <Button
              size="icon"
              className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-purple-500 hover:bg-purple-900"
              onClick={(e) => {
                e.preventDefault();
                if (completion) {
                  complete({ prompt: completion.completion, option: "zap", command: inputValue });
                  setInputValue("");
                  return;
                }

                if (editor) {
                  const slice = editor.state.selection.content();
                  const text = editor.storage.markdown.serializer.serialize(slice.content);

                  complete({ prompt: text, option: "zap", command: inputValue });
                  setInputValue("");
                } else {
                  toast({
                    title: "Something went wrong",
                    description: "Editor is not available",
                    variant: "destructive",
                  })
                }
              }}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
          {hasCompletion ? (
            <AICompletionCommands
              onDiscard={() => {
                editor.chain().unsetHighlight().focus().run();
                onOpenChange(false);
              }}
              completion={completion.completion}
            />
          ) : (
            <AISelectorCommands onSelect={(value, option) => complete({ prompt: value, option })} />
          )}
        </>
      )}
    </Command>
  );
}