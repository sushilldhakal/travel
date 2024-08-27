import { Button } from "@/components/ui/button";
import { ImageResource } from "@/Provider/types";
import { ChevronLeft, ChevronRight, XIcon } from "lucide-react";
import { forwardRef, memo, useState } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import type { PDFDocumentProxy } from 'pdfjs-dist';
interface ImageItemProps {
    image: ImageResource;
    onDelete: (imageId: string, mediaType: 'images' | 'videos' | 'PDF') => void;
    onSelect: (imageUrl: string) => void;
}


pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

const options = {
    cMapUrl: '/cmaps/',
    standardFontDataUrl: '/standard_fonts/',
};


const ImageItem = memo(
    forwardRef<HTMLDivElement, ImageItemProps>(
        ({ image, onDelete, onSelect, ...props }, ref) => {

            const [numPages, setNumPages] = useState<number>(1);
            const [pageNumber, setPageNumber] = useState<number>(1);

            function onDocumentLoadSuccess({ numPages }: PDFDocumentProxy): void {
                setNumPages(numPages);
                setPageNumber(1);
            }

            const changePage = (offset: number) => {
                setPageNumber(prevPageNumber => prevPageNumber + offset);
            };

            const nextPage = () => {
                changePage(1);
            };

            const prevPage = () => {
                changePage(-1);
            };


            return (
                <div
                    className="relative group break-inside-avoid mb-2 cursor-pointer"
                    ref={ref}
                    {...props}
                    onClick={() => image.resource_type === "image" && onSelect(image.url)}
                >{
                        image.resource_type === "image" && (
                            <img
                                src={image.secure_url ? image.secure_url : image.url}
                                alt={image.display_name ? image.display_name : image.asset_id}
                                className="rounded-md w-full"
                            />
                        )

                    }

                    {

                        image.resource_type === "video" && (
                            <video src={image.secure_url ? image.secure_url : image.url} width="750" height="500" controls onClick={() => onSelect(image.url)} />
                        )
                    }
                    {
                        image.resource_type === "raw" && (
                            <div className="relative group pdf-container">
                                <Document file={image.url} onLoadSuccess={onDocumentLoadSuccess}>
                                    <Page
                                        pageNumber={pageNumber}
                                        height={400}
                                        width={300}
                                        onClick={() => onSelect(image.url)}
                                        className="w-full" />
                                </Document>
                                <div className="absolute flex justify-center min-w-[155px] leading-10 bottom-5 right-0 left-[50%] transform translate-x-[-50%] z-10 text-center p-2 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity transition-250">
                                    <Button className="p-0 bg-white rounded-md px-2 text-xs hover:bg-white" onClick={prevPage} disabled={pageNumber <= 1}><ChevronLeft /></Button>
                                    <span className="bg-white rounded-md px-2">{` ${pageNumber} of ${numPages} `}</span>
                                    <Button className="p-0 bg-white rounded-md px-2 text-xs hover:bg-white" onClick={nextPage} disabled={pageNumber >= numPages}><ChevronRight /></Button>
                                </div>
                            </div>
                        )
                    }


                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute w-4 h-4 transition ease-in-out delay-150 group-hover:opacity-100 opacity-0 top-2 right-2 bg-background/80 hover:bg-destructive"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(image.public_id, image.resource_type === "image" ? 'images' : image.resource_type === "video" ? 'videos' : 'PDF');
                        }}
                    >
                        <XIcon className="w-4 h-4" />
                        <span className="sr-only">Delete</span>
                    </Button>
                </div>
            );
        }
    )
);

export default ImageItem;
