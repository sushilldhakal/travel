import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FormFieldWrapper } from './FormFieldWrapper';

interface SelectOption {
    label: string;
    value: string;
}

interface FormSelectProps<T extends FieldValues> {
    control: Control<T>;
    name: FieldPath<T>;
    label?: string;
    description?: string;
    required?: boolean;
    placeholder?: string;
    options: SelectOption[];
}

/**
 * Reusable form select component
 */
export function FormSelect<T extends FieldValues>({
    control,
    name,
    label,
    description,
    required,
    placeholder,
    options,
}: FormSelectProps<T>) {
    return (
        <FormFieldWrapper
            control={control}
            name={name}
            label={label}
            description={description}
            required={required}
            render={(field) => (
                <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        />
    );
}
