import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { FormFieldWrapper } from './FormFieldWrapper';

interface FormSwitchProps<T extends FieldValues> {
    control: Control<T>;
    name: FieldPath<T>;
    label?: string;
    description?: string;
}

/**
 * Reusable form switch component
 */
export function FormSwitch<T extends FieldValues>({
    control,
    name,
    label,
    description,
}: FormSwitchProps<T>) {
    return (
        <FormFieldWrapper
            control={control}
            name={name}
            label={label}
            description={description}
            render={(field) => (
                <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                />
            )}
        />
    );
}
