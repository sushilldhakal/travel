import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@radix-ui/react-label';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoaderCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

// interface DivType {
//     id: number;
//     date: Date | undefined;
//     content: string;
// }



function makeid(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}
const TabContent = ({ form, activeTab, formData, tabs, mutation, coverImageRef, fileRef, singleTour }: {
    //@ts-ignore
    form: any;
    activeTab: string;
    //@ts-ignore
    formData: any; Data
    //@ts-ignore
    tabs: { id: string; content: React.ReactNode }[];
    mutation: { isPending: boolean };
    coverImageRef: React.RefObject<HTMLInputElement>;
    fileRef: React.RefObject<HTMLInputElement>;
    //@ts-ignore
    singleTour: string;
}) => {
    const [tripCode] = useState(makeid(6).toUpperCase());
    const tab = tabs.find(t => t.id === activeTab);

    if (!tab) return <div>Select a tab to see its content</div>;

    console.log(form)

    switch (tab.id) {
        case tabs[0].id: // Overview tab
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Tour Details</CardTitle>
                        <CardDescription>Enter title and description</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6">
                            <div className="grid grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tour Title</FormLabel>
                                            <FormControl>
                                                {
                                                    singleTour ? <Input
                                                        type="text"
                                                        className="w-full"
                                                        {...field}
                                                        value={formData?.tour?.title}
                                                    /> : <Input
                                                        type="text"
                                                        className="w-full"
                                                        {...field}
                                                        placeholder='Tour Title'
                                                    />
                                                }
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="tripCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel> Trip Code:</FormLabel>
                                            <FormControl className="relative">
                                                {
                                                    singleTour ? <Input
                                                        type="text"
                                                        className="w-full"
                                                        {...field}
                                                        value={formData?.tour?.tripCode}
                                                        disabled
                                                    /> : <Input
                                                        type="text"
                                                        className="w-full"
                                                        {...field}
                                                        placeholder={tripCode}
                                                        value={tripCode}
                                                        disabled
                                                    />
                                                }
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid gap-3">
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                {
                                                    singleTour ? <Textarea
                                                        className="min-h-32"
                                                        {...field}
                                                        value={formData?.tour?.description}
                                                    /> : <Textarea
                                                        className="min-h-32"
                                                        {...field}
                                                        placeholder='Description'
                                                    />
                                                }
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid gap-3 auto-rows-max grid-cols-2">
                                <Label htmlFor="status">Tour Status</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="expired">Expired</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-flow-col gap-3">
                                <div className="col-span-5 rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                                    <div className="flex flex-col space-y-1.5 p-6">
                                        <FormField
                                            control={form.control}
                                            name="coverImage"
                                            render={() => (
                                                <FormItem>
                                                    <FormLabel>Cover Image</FormLabel>
                                                    <FormControl>
                                                        {
                                                            singleTour && formData?.tour?.coverImage ? (
                                                                <span className="">
                                                                    <img src={formData.tour.coverImage} alt={formData.tour.title} />
                                                                </span>
                                                            ) : (<Input
                                                                type="file"
                                                                className="w-full"
                                                                ref={coverImageRef}
                                                            />)
                                                        }
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                                <div className='col-span-5 rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden'>
                                    <div className="flex flex-col space-y-1.5 p-6">
                                        <FormField
                                            control={form.control}
                                            name="file"
                                            render={() => (
                                                <FormItem>
                                                    <FormLabel>Tour PDF File</FormLabel>
                                                    <FormControl>
                                                        {
                                                            singleTour && formData?.tour?.file ?
                                                                <div className='mt-3'>
                                                                    <Link target='_blank' to={formData.tour.file} download>Download File</Link>
                                                                </div>
                                                                : <Input
                                                                    type="file"
                                                                    className="w-full"
                                                                    ref={fileRef}
                                                                />
                                                        }
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button type="submit" size="sm" disabled={mutation.isPending}>
                            {mutation.isPending && <LoaderCircle className="animate-spin" />}
                            <span className="ml-2">Save</span>
                        </Button>
                    </CardFooter>
                </Card>
            );
        case tabs[1].id: // Itinerary tab
            return (
                <Card>
                    {/* Itinerary content */}
                </Card>
            );
        case tabs[2].id: // Price & Dates tab
            return (
                <Card>
                    Price & Dates
                </Card>
            );
        case tabs[3].id: // Includes/Excludes tab
            return (
                <Card>
                    Inc+/Exc-
                </Card>
            );
        case tabs[4].id: // Facts tab
            return (
                <Card>
                    Facts
                </Card>
            );
        case tabs[5].id: // Gallery tab
            return (
                <Card>
                    Gallery
                </Card>
            );
        case tabs[6].id: // Locations tab
            return (
                <Card>
                    Locations
                </Card>
            );
        case tabs[7].id: // FAQ's tab
            return (
                <Card>
                    FAQ's
                </Card>
            );
        case tabs[8].id: // Downloads tab
            return (
                <Card>
                    Downloads
                </Card>
            );
        case tabs[9].id: // Tabs in Display tab
            return (
                <Card>
                    Tabs in Display
                </Card>
            );
        case tabs[10].id: // Enquiry tab
            return (
                <Card>
                    Enquiry
                </Card>
            );
        default:
            return <div>{tab.content}</div>;
    }
};

export default TabContent;
