import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

interface FormFieldWrapperProps<T extends FieldValues> {
    control: Control<T>;
    name: FieldPath<T>;
    label?: string;
    description?: string;
    required?: boolean;
    render: (field: any) => React.ReactNode;
}

/**
 * Wrapper component for form fields
 * Reduces boilerplate in form implementations
 */
export function FormFieldWrapper<T extends FieldValues>({
    control,
    name,
    label,
    description,
    required,
    render,
}: FormFieldWrapperProps<T>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    {label && (
                        <FormLabel>
                            {label}
                            {required && <span className="text-destructive ml-1">*</span>}
                        </FormLabel>
                    )}
                    <FormControl>{render(field)}</FormControl>
                    {description && <FormDescription>{description}</FormDescription>}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
