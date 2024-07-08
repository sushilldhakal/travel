import React from 'react';
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

const TabContent = ({ activeTab, formData, handleInputChange, tabs }) => {
    const tab = tabs.find(t => t.id === activeTab);

    if (!tab) return <div>Select a tab to see its content</div>;

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
                                            onChange={handleInputChange}
                                            className="w-full"
                                            placeholder="Enter tour title"
                                        />
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
