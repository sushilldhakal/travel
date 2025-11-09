import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Input, InputProps } from '@/components/ui/input';
import { FormFieldWrapper } from './FormFieldWrapper';

interface FormInputProps<T extends FieldValues> extends Omit<InputProps, 'name'> {
    control: Control<T>;
    name: FieldPath<T>;
    label?: string;
    description?: string;
    required?: boolean;
}

/**
 * Reusable form input component
 */
export function FormInput<T extends FieldValues>({
    control,
    name,
    label,
    description,
    required,
    ...inputProps
}: FormInputProps<T>) {
    return (
        <FormFieldWrapper
            control={control}
            name={name}
            label={label}
            description={description}
            required={required}
            render={(field) => <Input {...field} {...inputProps} />}
        />
    );
}
