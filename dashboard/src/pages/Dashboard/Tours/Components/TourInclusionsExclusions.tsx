import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from 'react-hook-form';
import Editor from '@/userDefinedComponents/editor/advanced-editor';
import { Check, PackagePlus, PackageMinus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface TourInclusionsExclusionsProps {
    form: UseFormReturn<any>;
}

const TourInclusionsExclusions: React.FC<TourInclusionsExclusionsProps> = ({
    form
}) => {
    // Handle initial values for the editors with proper default initialization
    const includeContent = React.useMemo(() => {
        try {
            const includeValue = form.getValues('include');
            return includeValue ? JSON.parse(includeValue) : {
                type: "doc",
                content: [{ type: "paragraph", content: [{ type: "text", text: "" }] }]
            };
        } catch (e) {
            // Return a valid empty editor document structure
            return {
                type: "doc",
                content: [{ type: "paragraph", content: [{ type: "text", text: "" }] }]
            };
        }
    }, [form]);

    const excludeContent = React.useMemo(() => {
        try {
            const excludeValue = form.getValues('exclude');
            return excludeValue ? JSON.parse(excludeValue) : {
                type: "doc",
                content: [{ type: "paragraph", content: [{ type: "text", text: "" }] }]
            };
        } catch (e) {
            // Return a valid empty editor document structure
            return {
                type: "doc",
                content: [{ type: "paragraph", content: [{ type: "text", text: "" }] }]
            };
        }
    }, [form]);

    return (
        <Card className="shadow-sm">
            <CardHeader className="border-b bg-secondary pb-6">
                <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl font-semibold">Inclusions & Exclusions</CardTitle>
                </div>
                <CardDescription>
                    Specify what's included and excluded in your tour package
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
                {/* Inclusions Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <PackagePlus className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Inclusions</h3>
                    </div>
                    <FormField
                        control={form.control}
                        name="include"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>What's included in this tour?</FormLabel>
                                <FormControl>
                                    <div className="prose min-h-[250px] max-w-full rounded-md border border-input">
                                        <Editor
                                            initialValue={includeContent}
                                            onContentChange={(content) => {
                                                const contentString = JSON.stringify(content);
                                                form.setValue('include', contentString, {
                                                    shouldDirty: true,
                                                    shouldTouch: true,
                                                    shouldValidate: true
                                                });
                                                field.onChange(contentString);
                                            }}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                                <p className="text-xs text-muted-foreground mt-1">
                                    List all the items and services included in the tour price
                                </p>
                            </FormItem>
                        )}
                    />
                </div>

                <Separator />

                {/* Exclusions Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <PackageMinus className="h-5 w-5 text-destructive" />
                        <h3 className="text-lg font-semibold">Exclusions</h3>
                    </div>
                    <FormField
                        control={form.control}
                        name="exclude"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>What's excluded from this tour?</FormLabel>
                                <FormControl>
                                    <div className="prose min-h-[250px] max-w-full rounded-md border border-input">
                                        <Editor
                                            initialValue={excludeContent}
                                            onContentChange={(content) => {
                                                const contentString = JSON.stringify(content);
                                                form.setValue('exclude', contentString, {
                                                    shouldDirty: true,
                                                    shouldTouch: true,
                                                    shouldValidate: true
                                                });
                                                field.onChange(contentString);
                                            }}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                                <p className="text-xs text-muted-foreground mt-1">
                                    List all the items and services not included in the tour price
                                </p>
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default TourInclusionsExclusions;
