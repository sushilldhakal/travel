import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Building2, Upload, CheckCircle2, FileText, Phone, MapPin, DollarSign, User, CreditCard, Loader2, CloudUpload } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getUserId } from "@/util/authUtils";
import { api } from "@/http/apiClient";
import { FormDatePicker } from "@/components/ui/FormDatePicker";
import { UnifiedDocumentUpload } from "@/components/ui/UnifiedDocumentUpload";
import { StepperWizard } from "@/components/ui/StepperWizard";
import { Skeleton } from "@/components/ui/skeleton";

// Zod schema for form validation
const sellerSchema = z.object({
    // Company Information
    companyName: z.string().min(2, "Company name must be at least 2 characters"),
    companyRegistrationNumber: z.string().min(1, "Registration number is required"),
    companyType: z.string().min(1, "Company type is required"),
    registrationDate: z.string().min(1, "Registration date is required"),
    taxId: z.string().min(1, "Tax ID is required"),
    website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),

    // Contact Information
    contactPerson: z.string().min(2, "Contact person name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    alternatePhone: z.string().optional(),

    // Business Address
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().min(2, "City must be at least 2 characters"),
    state: z.string().min(2, "State must be at least 2 characters"),
    postalCode: z.string().min(3, "Postal code must be at least 3 characters"),
    country: z.string().min(2, "Country must be at least 2 characters"),

    // Banking Information
    bankName: z.string().min(2, "Bank name must be at least 2 characters"),
    branchCode: z.string().min(3, "Branch code must be at least 3 characters"),
    accountNumber: z.string().min(5, "Account number must be at least 5 characters"),
    accountHolderName: z.string().min(2, "Account holder name must be at least 2 characters"),

    // Business Description
    businessDescription: z.string().min(50, "Business description must be at least 50 characters"),
    sellerType: z.string().min(1, "Seller type is required"),

    // Terms and Conditions
    termsAccepted: z.boolean().refine(val => val === true, {
        message: "You must accept the terms and conditions"
    })
});

const SellerWizard = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [documents, setDocuments] = useState<Record<string, File[] | null>>({
        businessRegistration: null,
        taxRegistration: null,
        idVerification: null,
        bankStatement: null,
        businessInsurance: null,
        businessLicense: null
    });

    const userId = getUserId();

    const form = useForm<z.infer<typeof sellerSchema>>({
        resolver: zodResolver(sellerSchema),
        defaultValues: {
            companyName: "",
            companyRegistrationNumber: "",
            companyType: "",
            registrationDate: "",
            taxId: "",
            website: "",
            contactPerson: "",
            email: "",
            phone: "",
            alternatePhone: "",
            address: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
            bankName: "",
            branchCode: "",
            accountNumber: "",
            accountHolderName: "",
            businessDescription: "",
            sellerType: "",
            termsAccepted: false
        }
    });

    const queryClient = useQueryClient();

    // Custom mutation function for seller application
    const submitSellerApplication = async ({ userId, data, files }: { 
        userId: string; 
        data: z.infer<typeof sellerSchema>; 
        files: Record<string, File[] | null>;
    }) => {
        const formData = new FormData();
        
        // Add form data
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, value.toString());
            }
        });
        
        // Add files
        Object.entries(files).forEach(([key, fileArray]) => {
            if (fileArray && fileArray.length > 0) {
                fileArray.forEach((file) => {
                    formData.append(`${key}`, file);
                });
            }
        });
        
        const response = await api.patch(`/api/users/${userId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    };

    const updateUserMutation = useMutation({
        mutationFn: ({ userId, data, files }: { userId: string; data: z.infer<typeof sellerSchema>; files: Record<string, File[] | null> }) => 
            submitSellerApplication({ userId, data, files }),
        onSuccess: (response) => {
            console.log('✅ Form submission successful:', response);
            setIsSubmitted(true);
            toast.success("🎉 Application submitted successfully! We'll review it within 2-3 business days.", {
                duration: 5000,
            });
            form.reset();
            setDocuments({
                businessRegistration: null,
                taxRegistration: null,
                idVerification: null,
                bankStatement: null,
                businessInsurance: null,
                businessLicense: null
            });
            queryClient.invalidateQueries({
                queryKey: ['users'],
            });
        },
        onError: (error: unknown) => {
            console.error('❌ Form submission failed:', error);
            const errorMessage = (error as any)?.response?.data?.message || (error as any)?.message || "Failed to submit application";
            toast.error(errorMessage);
        }
    });

    const onSubmit = async (data: z.infer<typeof sellerSchema>) => {
        if (!userId) {
            toast.error("Please log in to submit seller application");
            return;
        }

        console.log('🚀 Starting form submission...');
        console.log('📋 Form data:', data);
        console.log('📁 Documents:', documents);
        
        try {
            await updateUserMutation.mutateAsync({
                userId,
                data,
                files: documents
            });
            console.log('✅ Mutation completed successfully');
        } catch (error) {
            console.error('❌ Mutation failed:', error);
            // Error is already handled by onError callback
        }
    };

    // Step validation functions - Memoized to prevent re-renders
    const validateCompanyStep = useCallback(() => {
        const requiredFields = ['companyName', 'companyRegistrationNumber', 'companyType', 'sellerType'] as const;
        return requiredFields.every(field => {
            const value = form.getValues(field);
            return value && value.toString().trim() !== '';
        });
    }, [form]);

    const validateContactStep = useCallback(() => {
        const requiredFields = ['contactPerson', 'phone', 'email', 'address'] as const;
        return requiredFields.every(field => {
            const value = form.getValues(field);
            return value && value.toString().trim() !== '';
        });
    }, [form]);

    const validateBankingStep = useCallback(() => {
        const requiredFields = ['bankName', 'accountNumber', 'branchCode', 'accountHolderName'] as const;
        return requiredFields.every(field => {
            const value = form.getValues(field);
            return value && value.toString().trim() !== '';
        });
    }, [form]);

    const validateDocumentsStep = useCallback(() => {
        const requiredDocs = ['businessRegistration', 'taxRegistration', 'idVerification', 'bankStatement'] as const;
        return requiredDocs.every(doc => documents[doc] && documents[doc]!.length > 0) && form.getValues('termsAccepted');
    }, [documents, form]);

    // Company Information Step Content - Memoized to prevent re-renders
    const CompanyStepContent = useCallback(() => (
        <div className="space-y-6">
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
                                        <FormDatePicker
                                            value={field.value ? new Date(field.value) : undefined}
                                            onChange={(date) => field.onChange(date?.toISOString().split('T')[0])}
                                            placeholder="Select registration date"
                                        />
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
        </div>
    ), [form.control]);

    // Contact Information Step Content - Memoized to prevent re-renders
    const ContactStepContent = useCallback(() => (
        <div className="space-y-6">
            <div className="grid gap-6">
                <div className="border-b pb-4">
                    <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                        <Phone className="h-5 w-5 text-primary" />
                        Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="contactPerson"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Person</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Full name" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Primary contact person for business inquiries
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                        <FormField
                            control={form.control}
                            name="alternatePhone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Alternate Phone (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+61 XXX XXX XXX" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Alternative contact number
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                        <MapPin className="h-5 w-5 text-primary" />
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
        </div>
    ), [form.control]);

    // Banking Information Step Content - Memoized to prevent re-renders
    const BankingStepContent = useCallback(() => (
        <div className="space-y-6">
            <div className="grid gap-6">
                <div>
                    <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                        <DollarSign className="h-5 w-5 text-primary" />
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
        </div>
    ), [form.control]);

    // Documents Step Content - Memoized to prevent re-renders
    const DocumentsStepContent = useCallback(() => (
        <div className="space-y-6">
            <div className="grid gap-6">
                <div>
                    <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                        <Upload className="h-5 w-5 text-primary" />
                        Required Documents
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        Please upload the following documents to verify your business. All files should be in PDF, JPG, or PNG format.
                    </p>

                    <UnifiedDocumentUpload
                        documents={documents}
                        onDocumentsChange={setDocuments}
                    />

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
        </div>
    ), [form, documents, setDocuments]);

    // Watch form values to trigger validation updates
    const watchedValues = form.watch();

    // Define wizard steps - Reactive to form changes
    const steps = useMemo(() => {
        const companyValid = validateCompanyStep();
        const contactValid = validateContactStep();
        const bankingValid = validateBankingStep();
        const documentsValid = validateDocumentsStep();

        return [
            {
                id: 'company',
                title: 'Company Information',
                description: 'Tell us about your business',
                icon: <Building2 className="w-5 h-5" />,
                isValid: companyValid,
                content: <CompanyStepContent />
            },
            {
                id: 'contact',
                title: 'Contact Information',
                description: 'Your contact details',
                icon: <User className="w-5 h-5" />,
                isValid: contactValid,
                content: <ContactStepContent />
            },
            {
                id: 'banking',
                title: 'Banking Information',
                description: 'Payment and banking details',
                icon: <CreditCard className="w-5 h-5" />,
                isValid: bankingValid,
                content: <BankingStepContent />
            },
            {
                id: 'documents',
                title: 'Documents & Review',
                description: 'Upload required documents',
                icon: <Upload className="w-5 h-5" />,
                isValid: documentsValid,
                content: <DocumentsStepContent />
            }
        ];
    }, [watchedValues, documents, CompanyStepContent, ContactStepContent, BankingStepContent, DocumentsStepContent, validateCompanyStep, validateContactStep, validateBankingStep, validateDocumentsStep]);

    // Success confirmation component
    if (isSubmitted) {
        return (
            <div className="container mx-auto py-10 px-4 max-w-4xl">
                <div className="text-center">
                    <div className="mb-8">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2 text-green-600">Application Submitted!</h1>
                        <p className="text-muted-foreground text-lg">
                            Thank you for applying to become a seller. Your application has been received and is being reviewed.
                        </p>
                    </div>

                    <div className="bg-muted p-6 rounded-lg mb-8 text-left max-w-2xl mx-auto">
                        <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                            What happens next?
                        </h3>
                        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2 pl-2">
                            <li>Our team will review your application within 2-3 business days</li>
                            <li>You may be contacted for additional information if needed</li>
                            <li>Once approved, you'll receive an email with instructions to set up your seller dashboard</li>
                            <li>You can then start listing your tours and services on our platform</li>
                        </ol>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => setIsSubmitted(false)}
                            className="px-6 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors"
                        >
                            Submit Another Application
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                        >
                            Return to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Loading overlay component
    if (updateUserMutation.isPending) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
                    <div className="mb-6">
                        <CloudUpload className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
                        <h3 className="text-xl font-semibold mb-2">Submitting Your Application</h3>
                        <p className="text-muted-foreground mb-4">
                            Please wait while we process your seller application and upload your documents...
                        </p>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <span className="text-sm">Uploading documents to secure storage...</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <span className="text-sm">Processing application data...</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <span className="text-sm">Saving to database...</span>
                        </div>
                    </div>
                    
                    <div className="mt-6 space-y-2">
                        <Skeleton className="h-2 w-full" />
                        <Skeleton className="h-2 w-3/4 mx-auto" />
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-4">
                        This may take a few moments. Please don't close this window.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-2">Become a Seller</h1>
                <p className="text-muted-foreground">
                    Complete the form below to apply for a seller account. Our team will review your application and get back to you soon.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <StepperWizard
                        steps={steps}
                        onComplete={() => form.handleSubmit(onSubmit)()}
                        onStepChange={() => {}}
                        isSubmitting={form.formState.isSubmitting}
                    />
                </form>
            </Form>

            <div className="mt-8 bg-muted p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    What happens next?
                </h3>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2 pl-2">
                    <li>Our team will review your application within 2-3 business days</li>
                    <li>You may be contacted for additional information if needed</li>
                    <li>Once approved, you'll receive an email with instructions to set up your seller dashboard</li>
                    <li>You can then start listing your tours and services on our platform</li>
                </ol>
            </div>
        </div>
    );
};

export default SellerWizard;
