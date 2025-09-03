import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    content: React.ReactNode;
    isValid?: boolean;
}

interface StepperWizardProps {
    steps: Step[];
    onComplete: () => void;
    onStepChange?: (stepIndex: number) => void;
    isSubmitting?: boolean;
    className?: string;
}

export const StepperWizard = ({ 
    steps, 
    onComplete, 
    onStepChange, 
    isSubmitting = false,
    className 
}: StepperWizardProps) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            const nextStep = currentStep + 1;
            setCurrentStep(nextStep);
            onStepChange?.(nextStep);
        } else {
            onComplete();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            const prevStep = currentStep - 1;
            setCurrentStep(prevStep);
            onStepChange?.(prevStep);
        }
    };

    const handleStepClick = (stepIndex: number) => {
        // Only allow navigation to completed steps or the next step
        if (stepIndex <= currentStep) {
            setCurrentStep(stepIndex);
            onStepChange?.(stepIndex);
        }
    };

    const isLastStep = currentStep === steps.length - 1;
    const currentStepData = steps[currentStep];

    return (
        <div className={cn("w-full max-w-5xl mx-auto", className)}>
            {/* Progress Stepper */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStep;
                        const isCurrent = index === currentStep;
                        const isClickable = index <= currentStep;

                        return (
                            <div key={step.id} className="flex items-center">
                                <div
                                    className={cn(
                                        "flex items-center cursor-pointer transition-all duration-200",
                                        isClickable ? "hover:scale-105" : "cursor-not-allowed"
                                    )}
                                    onClick={() => isClickable && handleStepClick(index)}
                                >
                                    <div
                                        className={cn(
                                            "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200",
                                            isCompleted
                                                ? "bg-primary border-primary text-primary-foreground"
                                                : isCurrent
                                                ? "border-primary text-primary bg-primary/10"
                                                : "border-muted-foreground/30 text-muted-foreground bg-background"
                                        )}
                                    >
                                        {isCompleted ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            <span className="text-sm font-medium">{index + 1}</span>
                                        )}
                                    </div>
                                    <div className="ml-3 hidden sm:block">
                                        <p
                                            className={cn(
                                                "text-sm font-medium transition-colors",
                                                isCurrent
                                                    ? "text-primary"
                                                    : isCompleted
                                                    ? "text-foreground"
                                                    : "text-muted-foreground"
                                            )}
                                        >
                                            {step.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={cn(
                                            "flex-1 h-0.5 mx-4 transition-colors duration-200",
                                            isCompleted ? "bg-primary" : "bg-muted-foreground/20"
                                        )}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Step Content */}
            <Card className="border border-border shadow-sm">
                <CardHeader className="bg-muted/30">
                    <CardTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            {currentStepData.icon}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">{currentStepData.title}</h2>
                            <CardDescription className="mt-1">
                                {currentStepData.description}
                            </CardDescription>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="min-h-[400px]">
                        {currentStepData.content}
                    </div>
                </CardContent>
            </Card>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Step {currentStep + 1} of {steps.length}</span>
                    <span>•</span>
                    <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentStep === 0}
                        className="gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </Button>

                    <Button
                        type={isLastStep ? "submit" : "button"}
                        onClick={handleNext}
                        disabled={isSubmitting || (currentStepData.isValid === false)}
                        className="gap-2"
                    >
                        {isSubmitting ? (
                            "Submitting..."
                        ) : isLastStep ? (
                            "Submit Application"
                        ) : (
                            <>
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
