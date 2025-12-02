"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { PencilIcon, XIcon } from "lucide-react";
import { Input, InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useImperativeHandle, useRef } from "react";

type InputTagsProps = Omit<InputProps, "value" | "onChange"> & {
    value: string[];
    onChange: React.Dispatch<React.SetStateAction<string[]>>;
};

const InputTags = React.forwardRef<HTMLInputElement, InputTagsProps>(
    ({ className, value, onChange, ...props }, ref) => {
        const [pendingDataPoint, setPendingDataPoint] = React.useState("");
        const inputRef = useRef<HTMLInputElement>(null);
        useImperativeHandle(ref, () => inputRef.current!);

        React.useEffect(() => {
            if (pendingDataPoint.includes(",")) {
                const newDataPoints = new Set([
                    ...value,
                    ...pendingDataPoint.split(",").map((chunk) => chunk.trim()),
                ]);
                onChange(Array.from(newDataPoints));
                setPendingDataPoint("");
            }
        }, [pendingDataPoint, onChange, value]);

        const addPendingDataPoint = () => {
            if (pendingDataPoint) {
                const newDataPoints = new Set([...value, pendingDataPoint]);
                onChange(Array.from(newDataPoints));
                setPendingDataPoint("");
            }
        };

        return (
            <div
                className={cn(
                    "has-focus-visible:outline-hidden has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 min-h-10 flex w-full flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
            >
                <div className="flex w-full">
                    <Input
                        className="flex-1 outline-hidden placeholder:text-muted-foreground border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        value={pendingDataPoint}
                        onChange={(e) => setPendingDataPoint(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === ",") {
                                e.preventDefault();
                                addPendingDataPoint();
                            } else if (
                                e.key === "Backspace" &&
                                pendingDataPoint.length === 0 &&
                                value.length > 0
                            ) {
                                e.preventDefault();
                                onChange(value.slice(0, -1));
                            }
                        }}
                        {...props}
                        ref={inputRef}
                    />
                </div>
                {value && value.length > 0 && (
                    <div className="border rounded-md min-h-10 overflow-y-auto p-2 flex gap-2 flex-wrap items-center w-full">
                        {value.map((item, idx) => (
                            <Badge key={idx} variant="secondary">
                                {item}
                                <button
                                    type="button"
                                    className="w-3 ml-2"
                                    onClick={() => {
                                        onChange(value.filter((i) => i !== item));
                                    }}
                                >
                                    <XIcon className="w-3" />
                                </button>
                                <button
                                    type="button"
                                    className="w-3 ml-2"
                                    onClick={() => {
                                        setPendingDataPoint(item);
                                        onChange(value.filter((i) => i !== item));
                                        if (inputRef.current) {
                                            inputRef.current.focus();
                                        }
                                    }}
                                >
                                    <PencilIcon className="w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        );
    }
);

InputTags.displayName = "InputTags";

export { InputTags };
