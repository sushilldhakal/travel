import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { FormFieldWrapper } from './FormFieldWrapper';

interface FormCheckboxProps<T extends FieldValues> {
    control: Control<T>;
    name: FieldPath<T>;
    label?: string;
    description?: string;
}

/**
 * Reusable form checkbox component
 */
export function FormCheckbox<T extends FieldValues>({
    control,
    name,
    label,
    description,
}: FormCheckboxProps<T>) {
    return (
        <FormFieldWrapper
            control={control}
            name={name}
            label={label}
            description={description}
            render={(field) => (
                <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                />
            )}
        />
    );
}
