import React from 'react';
import { useTourForm } from '@/Provider/hooks/useTourForm';

/**
 * Test component to verify pricing options synchronization between TourPricing and TourDates
 * This can be temporarily added to any tour form page to debug the data flow
 */
export function PricingSyncTest() {
    const { form } = useTourForm();
    
    // Watch both possible pricing option paths
    const rootPricingOptions = form.watch('pricingOptions') || [];
    const nestedPricingOptions = form.watch('pricing.pricingOptions') || [];
    
    // This is the same logic used in TourDates
    const finalPricingOptions = rootPricingOptions.length > 0 ? rootPricingOptions : nestedPricingOptions;
    
    return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <h3 className="font-semibold text-yellow-800 mb-2">🔍 Pricing Sync Debug</h3>
            <div className="text-sm space-y-1">
                <p><strong>Root pricing options:</strong> {rootPricingOptions.length} items</p>
                <p><strong>Nested pricing options:</strong> {nestedPricingOptions.length} items</p>
                <p><strong>Final options (used by TourDates):</strong> {finalPricingOptions.length} items</p>
                {finalPricingOptions.length > 0 && (
                    <div className="mt-2">
                        <p><strong>Available options with IDs:</strong></p>
                        <ul className="list-disc list-inside ml-2">
                            {finalPricingOptions.map((option: any, index: number) => (
                                <li key={option.id || index} className="font-mono text-xs">
                                    <strong>ID:</strong> "{option.id}" | <strong>Name:</strong> "{option.name}" | <strong>Category:</strong> "{option.category}" | <strong>Price:</strong> ${option.price}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
