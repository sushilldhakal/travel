import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@radix-ui/react-label';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';



function makeid(length) {
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
const TabContent = ({ activeTab, formData, handleInputChange, tabs }) => {

    const [disabled, setDisabled] = useState(true);

    const tab = tabs.find(t => t.id === activeTab);

    if (!tab) return <div>Select a tab to see its content</div>;

    function handleTripCode(event) {
        event.preventDefault();
        setDisabled(!disabled);
    }

    switch (tab.id) {
        case 'overview':
            return (
                <Form>
                    <form className="w-full space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tour Details</CardTitle>
                                <CardDescription>Enter title and description</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-6">
                                    <div className="grid gap-3">
                                        <Label htmlFor="name">Tour Title</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            className="w-full"
                                            placeholder="Enter tour title"
                                        />
                                    </div>
                                    <div className="grid grid-flow-col gap-3">
                                        <div className='col-span-4'>
                                            Trip Code:
                                        </div>
                                        <div className='col-span-5'>
                                            <Input id="tourCode" type="text" name="tourCode" defaultValue={makeid(6).toUpperCase()} onChange={handleInputChange} disabled={disabled} className="w-full" placeholder={makeid(6).toUpperCase()} />
                                        </div>
                                        <div className='col-span-4'>
                                            <Button onClick={handleTripCode} variant="outline">Edit</Button>
                                        </div>
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="description">Tour Description</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Enter tour description"
                                            className="min-h-32"
                                        />
                                    </div>
                                    <div className="grid gap-3 auto-rows-max grid-cols-2">
                                        <Label htmlFor="status">Tour Status</Label>
                                        <Select id="status">
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
                                                <h3 className="text-2xl font-semibold leading-none tracking-tight">
                                                    Cover Image</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Please upload a cover image</p>
                                            </div>
                                            <div className="p-6 pt-0">
                                                <div className="grid gap-2">
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <Input id="picture" type="file" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='col-span-5 rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden'>
                                            <div className="flex flex-col space-y-1.5 p-6">
                                                <h3 className="text-2xl font-semibold leading-none tracking-tight">
                                                    Tour file</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Please upload a tour description file pdf</p>
                                            </div>
                                            <div className="p-6 pt-0">
                                                <div className="grid gap-2">
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <Input id="picture" type="file" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t px-6 py-4">
                                <Button>Save</Button>
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
            );
        case 'itinerary':
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Plugins Directory</CardTitle>
                        <CardDescription>The directory within your project, in which your plugins are located.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="flex flex-col gap-4">
                            <Input
                                name="projectName"
                                placeholder="Project Name"
                                value={formData.projectName}
                                onChange={handleInputChange}
                            />
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="include"
                                    name="allowChangeDirectory"
                                    checked={formData.allowChangeDirectory}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="include" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Allow administrators to change the directory.
                                </label>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button>Save</Button>
                    </CardFooter>
                </Card>
            );
        // Add more cases for other tabs as needed
        default:
            return <div>{tab.content}</div>;
    }
};

export default TabContent;
