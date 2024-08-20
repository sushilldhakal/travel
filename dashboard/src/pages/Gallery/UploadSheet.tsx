import { DropzoneOptions } from "react-dropzone";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Paperclip, UploadIcon } from "lucide-react";
import { FileInput, FileUploader, FileUploaderContent, FileUploaderItem } from "@/userDefinedComponents/FileUploader";
import FileSvgDraw from "./FileSvgDraw";
interface UploadSheetProps {
    files: File[] | null;
    setFiles: (files: File[]) => void;
    handleUpload: () => void;
    dropZoneConfig: DropzoneOptions;
}

const UploadSheet = ({ files, setFiles, handleUpload, dropZoneConfig }: UploadSheetProps) => (
    <Dialog>
        <DialogTrigger asChild>
            <Button className="absolute top-10 right-8">
                <UploadIcon className="w-4 h-4 mr-2" />
                Upload
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Upload Images/PDF</DialogTitle>
                <DialogDescription>
                    Upload your images or PDFs here. Click "Upload" when you're ready.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 items-center gap-4">
                    <div className="grid gap-4 py-4">
                        <div className="grid items-center gap-4">
                            <FileUploader
                                value={files}
                                onValueChange={setFiles}
                                dropzoneOptions={dropZoneConfig}
                            >
                                <FileInput>
                                    <div className="flex items-center justify-center h-32 w-full border bg-background rounded-md">
                                        <div className="flex items-center justify-center flex-col pt-3 pb-4 w-full ">
                                            {files && files.length > 0 ? files.length + " files selected" : "Click to upload"}
                                            <FileSvgDraw />
                                        </div>
                                    </div>
                                </FileInput>
                                <FileUploaderContent className="grid grid-rows-3 grid-cols-3 grid-flow-row gap-2">
                                    {files && files.length > 0 && files.map((file, i) => (
                                        <FileUploaderItem
                                            key={i}
                                            index={i}
                                            className="size-20 p-0 rounded-md overflow-hidden"
                                            aria-roledescription={`file ${i + 1} containing ${file.name}`}
                                        >
                                            <Paperclip className="h-4 w-4 stroke-current" />
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={file.name}
                                                height={80}
                                                width={80}
                                                className="size-20 p-0 object-cover"
                                            />
                                        </FileUploaderItem>
                                    ))}
                                </FileUploaderContent>
                            </FileUploader>
                        </div>
                    </div>
                </div>

            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button onClick={handleUpload} type="button">Upload</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

export default UploadSheet;