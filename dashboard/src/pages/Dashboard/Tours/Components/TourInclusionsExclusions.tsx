import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Editor from '@/userDefinedComponents/editor/advanced-editor';
import { Check, PackagePlus, PackageMinus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useTourContext } from '@/Provider/hooks/useTourContext';


const TourInclusionsExclusions = () => {
    // Get editor content from unified context
    const { form, inclusionsContent, setInclusionsContent, exclusionsContent, setExclusionsContent } = useTourContext();

    return (
        <Card className="shadow-xs">
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
                        render={() => (
                            <FormItem>
                                <FormLabel>What's included in this tour?</FormLabel>
                                <FormControl>
                                    <div className="prose min-h-[250px] max-w-full rounded-md border border-input">
                                        <Editor
                                            initialValue={inclusionsContent}
                                            onContentChange={(content) => {
                                                setInclusionsContent(content);
                                                form.setValue('include', JSON.stringify(content));
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
                        render={() => (
                            <FormItem>
                                <FormLabel>What's excluded from this tour?</FormLabel>
                                <FormControl>
                                    <div className="prose min-h-[250px] max-w-full rounded-md border border-input">
                                        <Editor
                                            initialValue={exclusionsContent}
                                            onContentChange={(content) => {
                                                setExclusionsContent(content);
                                                form.setValue('exclude', JSON.stringify(content));
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
