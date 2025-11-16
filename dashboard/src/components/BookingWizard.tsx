import { ShoppingCart, CreditCard, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface BookingWizardProps {
    currentStep: number; // 0: Cart, 1: Checkout, 2: Confirmation
    itemCount?: number;
}

export function BookingWizard({ currentStep, itemCount = 0 }: BookingWizardProps) {
    const navigate = useNavigate();

    const steps = [
        { title: 'Shopping Cart', icon: ShoppingCart, path: '/cart' },
        { title: 'Checkout', icon: CreditCard, path: '/checkout' },
        { title: 'Confirmation', icon: Check, path: '/confirmation' }
    ];

    const handleStepClick = (index: number) => {
        // Allow navigation to previous steps or current step
        if (index <= currentStep && index < currentStep) {
            navigate(steps[index].path);
        }
    };

    return (
        <div className="bg-background border-b sticky top-0 z-40 shadow-sm">
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Complete Your Booking</h1>
                    {itemCount > 0 && currentStep === 0 && (
                        <div className="text-sm text-muted-foreground">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </div>
                    )}
                </div>

                {/* Step Indicators */}
                <div className="flex items-center justify-center gap-2 max-w-2xl mx-auto">
                    {steps.map((step, index) => {
                        const StepIcon = step.icon;
                        const isClickable = index < currentStep;

                        return (
                            <div key={index} className="flex items-center flex-1">
                                <button
                                    onClick={() => handleStepClick(index)}
                                    disabled={!isClickable}
                                    className={cn(
                                        'flex items-center gap-3 flex-1 transition-all',
                                        isClickable && 'cursor-pointer hover:opacity-80',
                                        !isClickable && 'cursor-default'
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-200',
                                            index < currentStep && 'bg-primary text-primary-foreground',
                                            index === currentStep && 'bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110',
                                            index > currentStep && 'bg-muted text-muted-foreground'
                                        )}
                                    >
                                        {index < currentStep ? (
                                            <Check className="w-8 h-8" />
                                        ) : (
                                            <StepIcon className="w-8 h-8" />
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            'text-sm font-medium hidden sm:block transition-colors',
                                            index === currentStep && 'text-foreground',
                                            index < currentStep && 'text-foreground',
                                            index > currentStep && 'text-muted-foreground'
                                        )}
                                    >
                                        {step.title}
                                    </span>
                                </button>
                                {index < steps.length - 1 && (
                                    <div
                                        className={cn(
                                            'h-0.5 flex-1 mx-2 transition-all duration-300',
                                            index < currentStep ? 'bg-primary' : 'bg-border'
                                        )}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
