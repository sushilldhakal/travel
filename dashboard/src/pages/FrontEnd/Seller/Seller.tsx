import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Building2,
    CircleDollarSign,
    Store,
    FileText,
    Phone,
    CheckCircle2,
    Map,
    Upload
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserId } from '@/util/authUtils';
import { updateUser } from '@/http';

// Define the schema for the seller application form
const sellerFormSchema = z.object({
    // Company Information
    companyName: z.string().min(2, {
        message: 'Company name must be at least 2 characters.',
    }),
    companyRegistrationNumber: z.string().min(5, {
        message: 'Registration number must be at least 5 characters.',
    }),
    companyType: z.string({
        required_error: 'Please select a company type.',
    }),
    registrationDate: z.string({
        required_error: 'Registration date is required.',
    }),
    taxId: z.string().min(5, {
        message: 'Tax ID must be at least 5 characters.',
    }),
    website: z.string().url({
        message: 'Please enter a valid URL.',
    }).optional().or(z.literal('')),

    // Contact Information
    email: z.string().email({
        message: 'Please enter a valid email address.',
    }),
    phone: z.string().min(8, {
        message: 'Phone number must be at least 8 characters.',
    }),

    // Address Information
    address: z.string().min(5, {
        message: 'Address must be at least 5 characters.',
    }),
    city: z.string().min(2, {
        message: 'City must be at least 2 characters.',
    }),
    state: z.string().min(2, {
        message: 'State must be at least 2 characters.',
    }),
    postalCode: z.string().min(4, {
        message: 'Postal code must be at least 4 characters.',
    }),
    country: z.string().min(2, {
        message: 'Country must be at least 2 characters.',
    }),

    // Bank Information
    bankName: z.string().min(2, {
        message: 'Bank name must be at least 2 characters.',
    }),
    accountNumber: z.string().min(5, {
        message: 'Account number must be at least 5 characters.',
    }),
    accountHolderName: z.string().min(2, {
        message: 'Account holder name must be at least 2 characters.',
    }),
    branchCode: z.string().min(2, {
        message: 'Branch code must be at least 2 characters.',
    }),

    // Additional Information
    businessDescription: z.string().min(20, {
        message: 'Business description must be at least 20 characters.',
    }).max(500, {
        message: 'Business description must not exceed 500 characters.'
    }),
    sellerType: z.string({
        required_error: 'Please select a seller type.',
    }),

    // Confirmation
    termsAccepted: z.boolean().refine(value => value === true, {
        message: 'You must accept the terms and conditions.',
    }),
});

type SellerFormValues = z.infer<typeof sellerFormSchema>;

const Seller = () => {
    const { toast } = useToast();
    const [uploadSubmit, setUploadSubmit] = useState(false);
    // Default values for the form
    const defaultValues: Partial<SellerFormValues> = {
        companyType: '',
        sellerType: '',
        website: '',
        termsAccepted: false,
    };

    const form = useForm<SellerFormValues>({
        resolver: zodResolver(sellerFormSchema),
        defaultValues,
    });

    const userId = getUserId();
    const queryClient = useQueryClient();

    const updateUserMutation = useMutation({
        mutationFn: (data: FormData) => updateUser(userId || '', data),
        onSuccess: () => {
            toast({
                title: 'Category updated successfully',
                description: 'Your changes have been saved.',
                variant: 'default',
            });
            setUploadSubmit(!uploadSubmit);
            queryClient.invalidateQueries({
                queryKey: ['users'], // Match the query key used in useQuery
            });
        },
        onError: (error) => {
            toast({
                title: 'Failed to update category',
                description: 'An error occurred while saving changes.',
                variant: 'destructive',
            });
            console.error('Error updating category:', error);
        },
    });

    const onSubmit = async (data: SellerFormValues) => {
        try {
            // Create a FormData object to properly handle the submission
            const formData = new FormData();
            
            // Add all form fields to FormData
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value.toString());
                }
            });
            
            // Show success message
            setUploadSubmit(true);
            await updateUserMutation.mutateAsync(formData);
            toast({
                title: "Application Submitted",
                description: "Your seller application has been submitted successfully. We'll review it and get back to you soon.",
                variant: "default",
            });
            // Reset the form
            //form.reset();
        } catch (error) {
            console.error('Error submitting form:', error);

            toast({
                title: "Submission Failed",
                description: "There was an error submitting your application. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-2">Become a Seller</h1>
                <p className="text-muted-foreground">
                    Complete the form below to apply for a seller account. Our team will review your application and get back to you soon.
                </p>
            </div>

            <Card className="border border-border shadow-xs mb-6">
                <CardHeader className="bg-muted/50">
                    <CardTitle className="flex items-center gap-2">
                        <Store className="h-5 w-5 text-primary" />
                        Seller Application
                    </CardTitle>
                    <CardDescription>
                        Please provide accurate information about your business to expedite the approval process
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <Tabs defaultValue="company" className="w-full">
                                <TabsList className="grid grid-cols-4 mb-6">
                                    <TabsTrigger value="company">Company</TabsTrigger>
                                    <TabsTrigger value="contact">Contact</TabsTrigger>
                                    <TabsTrigger value="banking">Banking</TabsTrigger>
                                    <TabsTrigger value="documents">Documents</TabsTrigger>
                                </TabsList>

                                {/* Company Information Tab */}
                                <TabsContent value="company" className="space-y-6">
                                    <div className="grid gap-6">
                                        <div className="border-b pb-4">
                                            <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                                                <Building2 className="h-5 w-5 text-primary" />
                                                Company Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="companyName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Company Name</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Your company name" {...field} />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Enter the legal name of your company
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="companyRegistrationNumber"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Registration Number</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Registration number" {...field} />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Business registration/license number
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="companyType"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Company Type</FormLabel>
                                                            <Select
                                                                onValueChange={field.onChange}
                                                                defaultValue={field.value}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select company type" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                                                                    <SelectItem value="partnership">Partnership</SelectItem>
                                                                    <SelectItem value="corporation">Corporation</SelectItem>
                                                                    <SelectItem value="llc">Limited Liability Company (LLC)</SelectItem>
                                                                    <SelectItem value="nonprofit">Non-profit Organization</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormDescription>
                                                                Legal structure of your business
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="registrationDate"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Registration Date</FormLabel>
                                                            <FormControl>
                                                                <div className="flex">
                                                                    <Input type="date" {...field} />
                                                                </div>
                                                            </FormControl>
                                                            <FormDescription>
                                                                Date your company was registered
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="taxId"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Tax ID / ABN</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Tax Identification Number" {...field} />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Tax Identification Number or ABN
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="website"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Website (Optional)</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="https://yourcompany.com" {...field} />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Your company website if available
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                                                <FileText className="h-5 w-5 text-primary" />
                                                Business Profile
                                            </h3>
                                            <div className="grid gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="businessDescription"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Business Description</FormLabel>
                                                            <FormControl>
                                                                <Textarea
                                                                    placeholder="Describe your business and the products or services you offer..."
                                                                    className="min-h-[120px]"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Briefly describe your business, products, and target market
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="sellerType"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Seller Type</FormLabel>
                                                            <Select
                                                                onValueChange={field.onChange}
                                                                defaultValue={field.value}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select seller type" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="tour_operator">Tour Operator</SelectItem>
                                                                    <SelectItem value="accommodation">Accommodation Provider</SelectItem>
                                                                    <SelectItem value="travel_agency">Travel Agency</SelectItem>
                                                                    <SelectItem value="experience_host">Experience Host</SelectItem>
                                                                    <SelectItem value="transport">Transportation Provider</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormDescription>
                                                                Category that best describes your business
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Contact Information Tab */}
                                <TabsContent value="contact" className="space-y-6">
                                    <div className="grid gap-6">
                                        <div className="border-b pb-4">
                                            <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                                                <Phone className="h-5 w-5 text-primary" />
                                                Contact Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Business Email</FormLabel>
                                                            <FormControl>
                                                                <Input type="email" placeholder="contact@yourcompany.com" {...field} />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Email address for business communication
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="phone"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Business Phone</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="+61 XXX XXX XXX" {...field} />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Phone number for business inquiries
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                                                <Map className="h-5 w-5 text-primary" />
                                                Business Address
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="address"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Street Address</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="123 Business St" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="city"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>City</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Sydney" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="state"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>State/Province</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="NSW" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="postalCode"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Postal Code</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="2000" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="country"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Country</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Australia" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Banking Information Tab */}
                                <TabsContent value="banking" className="space-y-6">
                                    <div className="grid gap-6">
                                        <div>
                                            <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                                                <CircleDollarSign className="h-5 w-5 text-primary" />
                                                Banking Information
                                            </h3>
                                            <p className="text-muted-foreground mb-4">
                                                This information will be used for payouts. Please ensure all details are accurate.
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="bankName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Bank Name</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Bank name" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="branchCode"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>BSB / Branch Code</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="BSB Number" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="accountNumber"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Account Number</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Account number" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="accountHolderName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Account Holder Name</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Account holder name" {...field} />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Name as it appears on your bank account
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Documents Tab */}
                                <TabsContent value="documents" className="space-y-6">
                                    <div className="grid gap-6">
                                        <div>
                                            <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                                                <Upload className="h-5 w-5 text-primary" />
                                                Required Documents
                                            </h3>
                                            <p className="text-muted-foreground mb-4">
                                                Please upload the following documents to verify your business. All files should be in PDF, JPG, or PNG format.
                                            </p>

                                            <div className="space-y-4">
                                                {/* Document upload fields will go here */}
                                                <div className="p-6 border border-dashed rounded-md bg-muted/50 text-center">
                                                    <Button variant="outline" type="button" className="mb-2">
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        Business Registration
                                                    </Button>
                                                    <p className="text-xs text-muted-foreground">
                                                        Upload your business registration certificate or license
                                                    </p>
                                                </div>

                                                <div className="p-6 border border-dashed rounded-md bg-muted/50 text-center">
                                                    <Button variant="outline" type="button" className="mb-2">
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        Tax Registration
                                                    </Button>
                                                    <p className="text-xs text-muted-foreground">
                                                        Upload your tax registration certificate (ABN, etc.)
                                                    </p>
                                                </div>

                                                <div className="p-6 border border-dashed rounded-md bg-muted/50 text-center">
                                                    <Button variant="outline" type="button" className="mb-2">
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        ID Verification
                                                    </Button>
                                                    <p className="text-xs text-muted-foreground">
                                                        Upload a valid government-issued ID of the business owner
                                                    </p>
                                                </div>

                                                <div className="p-6 border border-dashed rounded-md bg-muted/50 text-center">
                                                    <Button variant="outline" type="button" className="mb-2">
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        Bank Statement
                                                    </Button>
                                                    <p className="text-xs text-muted-foreground">
                                                        Upload a recent bank statement (within the last 3 months)
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-6">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id="termsAccepted"
                                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                        {...form.register("termsAccepted")}
                                                    />
                                                    <label htmlFor="termsAccepted" className="text-sm font-medium">
                                                        I confirm that all information provided is accurate and I agree to the <a href="#" className="text-primary hover:underline">Terms and Conditions</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                                                    </label>
                                                </div>
                                                {form.formState.errors.termsAccepted && (
                                                    <p className="text-sm font-medium text-destructive mt-2">
                                                        {form.formState.errors.termsAccepted.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="border-t pt-6 flex justify-between items-center">
                                <div className="text-sm text-muted-foreground">
                                    <p>Your application will be reviewed by our team.</p>
                                    <p>Average approval time: 2-3 business days</p>
                                </div>
                                <Button type="submit" className="gap-2" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? (
                                        "Submitting..."
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-4 w-4" />
                                            Submit Application
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <div className="bg-muted p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">What happens next?</h3>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 pl-2">
                    <li>Our team will review your application within 2-3 business days</li>
                    <li>You may be contacted for additional information if needed</li>
                    <li>Once approved, you'll receive an email with instructions to set up your seller dashboard</li>
                    <li>You can then start listing your tours and services on our platform</li>
                </ol>
            </div>
        </div>
    );
};

export default Seller;