import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Textarea, TextareaProps } from '@/components/ui/textarea';
import { FormFieldWrapper } from './FormFieldWrapper';

interface FormTextareaProps<T extends FieldValues> extends Omit<TextareaProps, 'name'> {
    control: Control<T>;
    name: FieldPath<T>;
    label?: string;
    description?: string;
    required?: boolean;
}

/**
 * Reusable form textarea component
 */
export function FormTextarea<T extends FieldValues>({
    control,
    name,
    label,
    description,
    required,
    ...textareaProps
}: FormTextareaProps<T>) {
    return (
        <FormFieldWrapper
            control={control}
            name={name}
            label={label}
            description={description}
            required={required}
            render={(field) => <Textarea {...field} {...textareaProps} />}
        />
    );
}
