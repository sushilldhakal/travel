'use client';

import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import {
    Plus,
    Trash2,
    Info,
    MapPin,
    Clock,
    Users,
    Star,
    Calendar,
    Globe,
    Heart,
    Award,
    Briefcase,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getDefaultFact } from '@/lib/utils/defaultTourValues';

/**
 * TourFacts Component
 * Handles tour facts with dynamic field types and icon selection
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

// Available icons for facts
const FACT_ICONS = [
    { value: 'info', label: 'Info', icon: Info },
    { value: 'map-pin', label: 'Location', icon: MapPin },
    { value: 'clock', label: 'Time', icon: Clock },
    { value: 'users', label: 'Group', icon: Users },
    { value: 'star', label: 'Rating', icon: Star },
    { value: 'calendar', label: 'Date', icon: Calendar },
    { value: 'globe', label: 'Language', icon: Globe },
    { value: 'heart', label: 'Favorite', icon: Heart },
    { value: 'award', label: 'Award', icon: Award },
    { value: 'briefcase', label: 'Business', icon: Briefcase },
];

export function TourFacts() {
    const { control, formState: { errors } } = useFormContext();

    // Field array for facts
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'facts',
    });

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Tour Facts</CardTitle>
                    <CardDescription>
                        Add key information about the tour that customers should know
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {fields.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No facts added yet. Add your first fact to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <FactItem
                                    key={field.id}
                                    index={index}
                                    onRemove={() => remove(index)}
                                />
                            ))}
                        </div>
                    )}

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => append(getDefaultFact())}
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Fact
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

/**
 * Fact Item Component
 * Individual fact with field type selector and icon picker
 */
interface FactItemProps {
    index: number;
    onRemove: () => void;
}

function FactItem({ index, onRemove }: FactItemProps) {
    const { register, setValue, watch, formState: { errors } } = useFormContext();
    const fact = watch(`facts.${index}`) || {};
    const fieldType = fact.field_type || 'Plain Text';
    const selectedIcon = fact.icon || 'info';

    // Handle icon selection
    const handleIconSelect = (iconValue: string) => {
        setValue(`facts.${index}.icon`, iconValue);
    };

    // Get icon component
    const getIconComponent = (iconValue: string) => {
        const iconData = FACT_ICONS.find(i => i.value === iconValue);
        return iconData ? iconData.icon : Info;
    };

    const IconComponent = getIconComponent(selectedIcon);

    return (
        <Card>
            <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between">
                    <h4 className="font-semibold">Fact {index + 1}</h4>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onRemove}
                    >
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>

                {/* Icon Picker */}
                <div className="space-y-2">
                    <Label>Icon</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-start"
                            >
                                <IconComponent className="h-4 w-4 mr-2" />
                                {FACT_ICONS.find(i => i.value === selectedIcon)?.label || 'Select Icon'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                            <div className="grid grid-cols-3 gap-2">
                                {FACT_ICONS.map((iconData) => {
                                    const Icon = iconData.icon;
                                    return (
                                        <Button
                                            key={iconData.value}
                                            type="button"
                                            variant={selectedIcon === iconData.value ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handleIconSelect(iconData.value)}
                                            className="flex flex-col items-center gap-1 h-auto py-2"
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span className="text-xs">{iconData.label}</span>
                                        </Button>
                                    );
                                })}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <Label htmlFor={`facts.${index}.title`}>
                        Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id={`facts.${index}.title`}
                        placeholder="e.g., Duration, Group Size, Difficulty"
                        {...register(`facts.${index}.title`)}
                    />
                </div>

                {/* Field Type */}
                <div className="space-y-2">
                    <Label htmlFor={`facts.${index}.field_type`}>
                        Field Type
                    </Label>
                    <Select
                        value={fieldType}
                        onValueChange={(value) => setValue(`facts.${index}.field_type`, value)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Plain Text">Plain Text</SelectItem>
                            <SelectItem value="Single Select">Single Select</SelectItem>
                            <SelectItem value="Multi Select">Multi Select</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Value Input - Changes based on field type */}
                <div className="space-y-2">
                    <Label htmlFor={`facts.${index}.value`}>
                        Value
                    </Label>
                    {fieldType === 'Plain Text' && (
                        <Input
                            id={`facts.${index}.value`}
                            placeholder="Enter value"
                            value={Array.isArray(fact.value) ? fact.value[0] || '' : ''}
                            onChange={(e) => setValue(`facts.${index}.value`, [e.target.value])}
                        />
                    )}
                    {fieldType === 'Single Select' && (
                        <Input
                            id={`facts.${index}.value`}
                            placeholder="Enter comma-separated options"
                            value={Array.isArray(fact.value) ? fact.value.join(', ') : ''}
                            onChange={(e) => {
                                const values = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                                setValue(`facts.${index}.value`, values);
                            }}
                        />
                    )}
                    {fieldType === 'Multi Select' && (
                        <Input
                            id={`facts.${index}.value`}
                            placeholder="Enter comma-separated options"
                            value={
                                Array.isArray(fact.value) && fact.value.length > 0 && typeof fact.value[0] === 'object'
                                    ? fact.value.map((v: any) => v.label || v.value).join(', ')
                                    : Array.isArray(fact.value)
                                        ? fact.value.join(', ')
                                        : ''
                            }
                            onChange={(e) => {
                                const values = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                                const options = values.map(v => ({
                                    label: v,
                                    value: v.toLowerCase().replace(/\s+/g, '-'),
                                    disable: false,
                                }));
                                setValue(`facts.${index}.value`, options);
                            }}
                        />
                    )}
                    <p className="text-sm text-muted-foreground">
                        {fieldType === 'Plain Text' && 'Enter a single value'}
                        {fieldType === 'Single Select' && 'Enter options separated by commas'}
                        {fieldType === 'Multi Select' && 'Enter options separated by commas'}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
