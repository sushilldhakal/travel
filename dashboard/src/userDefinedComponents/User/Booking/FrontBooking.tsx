import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createBooking } from '@/http';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, CalendarDayButton } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tour, DiscountOption } from '@/Provider/types';

interface FrontBookingProps {
    tourData: Tour;
}

interface BookingFormData {
    fullName: string;
    email: string;
    phone: string;
    departureDate: string;
    adults: number;
    children: number;
    specialRequests: string;
}

const FrontBooking: React.FC<FrontBookingProps> = ({ tourData }) => {
    const navigate = useNavigate();
    const [bookingForm, setBookingForm] = useState<BookingFormData>({
        fullName: '',
        email: '',
        phone: '',
        departureDate: '',
        adults: 1,
        children: 0,
        specialRequests: ''
    });

    const [enquiryForm, setEnquiryForm] = useState({
        fullName: '',
        email: '',
        message: ''
    });

    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();
    const [selectedPricingOption, setSelectedPricingOption] = useState<{
        id?: string;
        price: number;
        discount?: {
            enabled: boolean;
            options?: DiscountOption[];
        };
    } | null>(null);
    const [availableDates, setAvailableDates] = useState<Date[]>([]);
    const [datePriceMap, setDatePriceMap] = useState<Map<string, { price: number; discountedPrice?: number }>>(new Map());

    // Generate available dates and prices from tour data
    useEffect(() => {
        const dates: Date[] = [];
        const priceMap = new Map<string, { price: number; discountedPrice?: number }>();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const getPriceForDeparture = (departure: {
            selectedPricingOptions?: string[];
            isRecurring?: boolean;
            recurrenceEndDate?: string | Date;
            dateRange: { from: string | Date; to?: string | Date };
            recurrencePattern?: string;
        }) => {
            let basePrice = tourData.price || 0;
            let discountedPrice: number | undefined;

            // First, check pricing options for this departure
            if (departure.selectedPricingOptions && departure.selectedPricingOptions.length > 0) {
                const optionId = departure.selectedPricingOptions[0];
                let foundOption = null;

                if (tourData.pricingOptions) {
                    foundOption = tourData.pricingOptions.find((opt) => opt.id === optionId);
                }

                if (foundOption) {
                    basePrice = foundOption.price;

                    // Check if discount is enabled (handle both data structures)
                    const discountData = foundOption.discount as any;
                    if (discountData?.discountEnabled && discountData.discountDateRange) {
                        const now = new Date();
                        const discountStart = new Date(discountData.discountDateRange.from);
                        const discountEnd = new Date(discountData.discountDateRange.to);

                        // Check if discount is currently valid
                        if (now >= discountStart && now <= discountEnd) {
                            if (discountData.percentageOrPrice) {
                                // Percentage-based discount
                                const discountPercentage = discountData.discountPercentage || 0;
                                const discountAmount = (basePrice * discountPercentage) / 100;
                                discountedPrice = basePrice - discountAmount;
                            } else {
                                // Fixed price discount
                                discountedPrice = discountData.discountPrice || basePrice;
                            }
                            console.log('✅ DISCOUNT APPLIED: basePrice:', basePrice, 'discountedPrice:', discountedPrice);
                        } else {
                            console.log('⏰ DISCOUNT EXPIRED: now:', now.toISOString(), 'end:', discountEnd.toISOString());
                        }
                    } else {
                        console.log('❌ NO DISCOUNT DATA:', {discountEnabled: discountData?.discountEnabled, hasDateRange: !!discountData?.discountDateRange});
                    }
                }
            }

            // Override with sale price if enabled (matching parent component logic)
            const tourDataAny = tourData as any;
            if (tourDataAny.saleEnabled && tourDataAny.salePrice) {
                basePrice = tourData.price || 0;
                discountedPrice = tourDataAny.salePrice;
                console.log('💰 SALE OVERRIDE: basePrice:', basePrice, 'discountedPrice:', discountedPrice);
            } else {
                console.log('⚠️ NO SALE: saleEnabled:', tourDataAny.saleEnabled, 'salePrice:', tourDataAny.salePrice);
            }

            console.log('📊 Final return for departure:', { price: basePrice, discountedPrice });
            return { price: basePrice, discountedPrice };
        };

        // Access tourDates correctly - it's an object with departures array, not an array itself
        const tourDates = tourData.tourDates as any;
        if (tourDates?.departures) {
            tourDates.departures.forEach((departure: any) => {
                const pricing = getPriceForDeparture(departure);

                if (departure.isRecurring && departure.recurrenceEndDate) {
                    const startDate = new Date(departure.dateRange.from);
                    const recurrenceEnd = new Date(departure.recurrenceEndDate);
                    const currentStart = new Date(startDate);
                    let instanceCount = 0;
                    const maxInstances = 365;

                    while (currentStart <= recurrenceEnd && instanceCount < maxInstances) {
                        if (currentStart >= today) {
                            const dateKey = format(currentStart, 'yyyy-MM-dd');
                            dates.push(new Date(currentStart));
                            priceMap.set(dateKey, pricing);
                        }

                        switch (departure.recurrencePattern) {
                            case 'daily':
                                currentStart.setDate(currentStart.getDate() + 1);
                                break;
                            case 'weekly':
                                currentStart.setDate(currentStart.getDate() + 7);
                                break;
                            case 'biweekly':
                                currentStart.setDate(currentStart.getDate() + 14);
                                break;
                            case 'monthly':
                                currentStart.setMonth(currentStart.getMonth() + 1);
                                break;
                            default:
                                currentStart.setDate(currentStart.getDate() + 7);
                        }
                        instanceCount++;
                    }
                } else {
                    const departureDate = new Date(departure.dateRange.from);
                    if (departureDate >= today) {
                        const dateKey = format(departureDate, 'yyyy-MM-dd');
                        dates.push(departureDate);
                        priceMap.set(dateKey, pricing);
                    }
                }
            });
        }

        setAvailableDates(dates);
        setDatePriceMap(priceMap);

        // Debug logging
        console.log('🔍 Available dates generated:', dates.length);
        console.log('🔍 Price map entries:', priceMap.size);
        console.log('🔍 First 5 available dates:', dates.slice(0, 5).map(d => format(d, 'yyyy-MM-dd')));
        console.log('🔍 Sample prices:', Array.from(priceMap.entries()).slice(0, 5));
        console.log('🔍 Sale enabled:', (tourData as any).saleEnabled, 'Sale price:', (tourData as any).salePrice);
    }, [tourData]);

    // Listen for date changes from the main page
    useEffect(() => {
        const dateInput = document.getElementById('departureDate') as HTMLInputElement;
        if (dateInput) {
            const handleDateChange = () => {
                if (dateInput.value) {
                    const date = new Date(dateInput.value);
                    setSelectedDate(date);
                    setBookingForm(prev => ({ ...prev, departureDate: dateInput.value }));

                    // Find matching pricing option
                    findPricingForDate(date);
                }
            };

            dateInput.addEventListener('input', handleDateChange);
            return () => dateInput.removeEventListener('input', handleDateChange);
        }
    }, []);

    // Find pricing option for selected date
    const findPricingForDate = (date: Date) => {
        const tourDates = tourData.tourDates as any;
        if (!tourDates?.departures) return;

        for (const departure of tourDates.departures) {
            const depDate = new Date(departure.dateRange.from);
            if (depDate.toDateString() === date.toDateString()) {
                if (departure.selectedPricingOptions && departure.selectedPricingOptions.length > 0) {
                    const optionId = departure.selectedPricingOptions[0];
                    let foundOption = null;

                    // Check pricingOptions array
                    if (tourData.pricingOptions) {
                        foundOption = tourData.pricingOptions.find((opt) => opt.id === optionId);
                    }

                    if (foundOption) {
                        setSelectedPricingOption(foundOption);
                        return;
                    }
                }
            }
        }
        setSelectedPricingOption(null);
    };

    // Calculate pricing with discounts (matching parent component logic)
    const calculatePricing = () => {
        let basePrice = tourData.price || 0;
        let originalPrice = basePrice;

        // Priority 1: Check if sale price is enabled (overrides everything)
        const tourDataAny = tourData as any;
        if (tourDataAny.saleEnabled && tourDataAny.salePrice) {
            originalPrice = tourData.price || 0;
            basePrice = tourDataAny.salePrice;
            
            console.log('💰 Sale pricing active');
            console.log('💰 Original price:', originalPrice);
            console.log('💰 Sale price:', basePrice);
        }
        // Priority 2: If a date is selected, use the price from datePriceMap
        else if (selectedDate) {
            const dateKey = format(selectedDate, 'yyyy-MM-dd');
            const priceInfo = datePriceMap.get(dateKey);
            
            if (priceInfo) {
                originalPrice = priceInfo.price;
                // Use discounted price if available, otherwise use regular price
                basePrice = priceInfo.discountedPrice || priceInfo.price;
                
                console.log('💰 Pricing for selected date:', dateKey);
                console.log('💰 Original price:', originalPrice);
                console.log('💰 Discounted price:', priceInfo.discountedPrice);
                console.log('💰 Final base price:', basePrice);
            }
        } 
        // Priority 3: Fallback to selectedPricingOption
        else if (selectedPricingOption) {
            // Fallback to selectedPricingOption if no date selected yet
            basePrice = selectedPricingOption.price;
            originalPrice = basePrice;

            // Check if discount is enabled (use correct field structure)
            const discountData = selectedPricingOption.discount as any;
            if (discountData?.discountEnabled && discountData.discountDateRange) {
                const now = new Date();
                const discountStart = new Date(discountData.discountDateRange.from);
                const discountEnd = new Date(discountData.discountDateRange.to);

                // Check if discount is currently valid
                if (now >= discountStart && now <= discountEnd) {
                    if (discountData.percentageOrPrice) {
                        // Percentage-based discount
                        const discountPercentage = discountData.discountPercentage || 0;
                        const discountAmount = (basePrice * discountPercentage) / 100;
                        basePrice = basePrice - discountAmount;
                    } else {
                        // Fixed price discount
                        basePrice = discountData.discountPrice || basePrice;
                    }
                    console.log('✅ PRICING DISCOUNT: originalPrice:', originalPrice, 'discountedPrice:', basePrice);
                }
            }
        }

        const adultPrice = basePrice * bookingForm.adults;
        const childPrice = basePrice * bookingForm.children * 0.7;
        const totalPrice = adultPrice + childPrice;

        return {
            basePrice,
            originalPrice,
            adultPrice,
            childPrice,
            totalPrice,
            currency: 'USD'
        };
    };

    const pricing = calculatePricing();

    // Format price
    const formatPrice = (price: number): string => {
        return `${price.toFixed(2)}`;
    };

    // Booking mutation
    const bookingMutation = useMutation({
        mutationFn: (bookingData: {
            tourId: string;
            tourTitle: string;
            tourCode: string;
            departureDate: string;
            participants: { adults: number; children: number };
            contactName: string;
            contactEmail: string;
            contactPhone: string;
            specialRequests: string;
            pricing: {
                basePrice: number;
                adultPrice: number;
                childPrice: number;
                totalPrice: number;
                currency: string;
            };
        }) => createBooking(bookingData),
        onSuccess: (response) => {
            const bookingData = response.data;
            toast({
                title: "Booking Successful!",
                description: `Your booking reference is: ${bookingData.bookingReference}. Redirecting to cart...`,
            });
            
            // Store booking in localStorage for cart
            const existingBookings = JSON.parse(localStorage.getItem('cartBookings') || '[]');
            existingBookings.push({
                ...bookingData,
                tourImage: tourData.coverImage,
                quantity: 1
            });
            localStorage.setItem('cartBookings', JSON.stringify(existingBookings));
            
            // Reset form
            setBookingForm({
                fullName: '',
                email: '',
                phone: '',
                departureDate: '',
                adults: 1,
                children: 0,
                specialRequests: ''
            });
            // Redirect to cart page
            setTimeout(() => {
                navigate('/cart', { state: { newBooking: bookingData } });
            }, 1500);
        },
        onError: (error: Error) => {
            toast({
                title: "Booking Failed",
                description: error.message || "Something went wrong. Please try again.",
                variant: "destructive",
            });
        }
    });

    // Handle booking submission
    const handleBookingSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!bookingForm.fullName || !bookingForm.email || !bookingForm.phone || !bookingForm.departureDate) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(bookingForm.email)) {
            toast({
                title: "Invalid Email",
                description: "Please enter a valid email address",
                variant: "destructive",
            });
            return;
        }

        // Date validation
        const selectedDate = new Date(bookingForm.departureDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            toast({
                title: "Invalid Date",
                description: "Departure date cannot be in the past",
                variant: "destructive",
            });
            return;
        }

        // Prepare booking data
        const bookingData = {
            tourId: tourData._id,
            tourTitle: tourData.title,
            tourCode: `TOUR-${(tourData._id || '').slice(-8).toUpperCase()}`,
            departureDate: bookingForm.departureDate,
            participants: {
                adults: bookingForm.adults,
                children: bookingForm.children
            },
            contactInfo: {
                fullName: bookingForm.fullName,
                email: bookingForm.email,
                phone: bookingForm.phone
            },
            specialRequests: bookingForm.specialRequests,
            pricing: {
                basePrice: pricing.basePrice,
                adultPrice: pricing.adultPrice,
                childPrice: pricing.childPrice,
                totalPrice: pricing.totalPrice,
                currency: pricing.currency
            }
        };

        bookingMutation.mutate(bookingData);
    };

    // Handle enquiry submission
    const handleEnquirySubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!enquiryForm.fullName || !enquiryForm.email || !enquiryForm.message) {
            toast({
                title: "Missing Information",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        // For now, just show success message
        toast({
            title: "Enquiry Sent!",
            description: "We'll get back to you soon.",
        });

        setEnquiryForm({
            fullName: '',
            email: '',
            message: ''
        });
    };

    return (
        <div>
            <Tabs defaultValue="booking">
                <TabsList className={`grid w-full ${tourData?.enquiry ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    <TabsTrigger value="booking">Booking Form</TabsTrigger>
                    {tourData?.enquiry && (
                        <TabsTrigger value="enquiry">Enquiry Form</TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="booking" className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium mb-1">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            className="w-full p-2 border border-border rounded-md bg-background"
                            placeholder="Your full name"
                            value={bookingForm.fullName}
                            onChange={(e) => setBookingForm({ ...bookingForm, fullName: e.target.value })}
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className="w-full p-2 border border-border rounded-md bg-background"
                            placeholder="email@example.com"
                            value={bookingForm.email}
                            onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-1">Contact Number</label>
                        <input
                            type="tel"
                            id="phone"
                            className="w-full p-2 border border-border rounded-md bg-background"
                            placeholder="Your phone number"
                            value={bookingForm.phone}
                            onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                        />
                    </div>

                    <div>
                        <label htmlFor="departureDate" className="block text-sm font-medium mb-1">Departure Date</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !selectedDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        <>
                                            {format(dateRange.from, "LLL dd, y")} -{" "}
                                            {format(dateRange.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    defaultMonth={availableDates.length > 0 ? availableDates[0] : new Date()}
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                        if (date) {
                                            setSelectedDate(date);
                                            
                                            // Calculate end date based on tour duration
                                            const tourDates = tourData.tourDates as any;
                                            const days = tourDates?.days || 1;
                                            const endDate = new Date(date);
                                            endDate.setDate(endDate.getDate() + days - 1);
                                            
                                            setDateRange({ from: date, to: endDate });
                                            
                                            const formattedDate = format(date, 'yyyy-MM-dd');
                                            setBookingForm({ ...bookingForm, departureDate: formattedDate });
                                            findPricingForDate(date);
                                        }
                                    }}
                                    disabled={(date) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        date.setHours(0, 0, 0, 0);
                                        
                                        // Disable past dates
                                        if (date < today) return true;

                                        // Disable dates that are not in availableDates
                                        const isAvailable = availableDates.some(
                                            availDate => {
                                                const checkDate = new Date(availDate);
                                                checkDate.setHours(0, 0, 0, 0);
                                                return checkDate.getTime() === date.getTime();
                                            }
                                        );
                                        
                                        return !isAvailable;
                                    }}
                                    fromMonth={new Date()}
                                    toMonth={availableDates.length > 0 ? new Date(Math.max(...availableDates.map(d => d.getTime()))) : new Date(new Date().setFullYear(new Date().getFullYear() + 2))}
                                    numberOfMonths={1}
                                    captionLayout="dropdown"
                                    className="rounded-lg border shadow-sm [--cell-size:--spacing(11)] md:[--cell-size:--spacing(13)]"
                                    formatters={{
                                        formatMonthDropdown: (date) => {
                                            return date.toLocaleString("default", { month: "long" });
                                        },
                                    }}
                                    components={{
                                        DayButton: ({ children, modifiers, day, ...props }) => {
                                            const dateKey = format(day.date, 'yyyy-MM-dd');
                                            const priceInfo = datePriceMap.get(dateKey);
                                            const isAvailable = availableDates.some(
                                                d => d.toDateString() === day.date.toDateString()
                                            );
                                            const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;

                                            // Debug log for first few dates
                                            if (day.date.getDate() <= 5 && !modifiers.outside) {
                                                console.log(`📅 Date: ${dateKey}, Available: ${isAvailable}, PriceInfo:`, priceInfo);
                                            }

                                            return (
                                                <CalendarDayButton day={day} modifiers={modifiers} {...props}>
                                                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                                                        {children}
                                                        {!modifiers.outside && isAvailable && priceInfo && (
                                                            <span className={cn(
                                                                "text-[10px] font-bold mt-0.5 px-1 py-0.5 rounded",
                                                                priceInfo.discountedPrice 
                                                                    ? "text-white bg-green-600" 
                                                                    : isWeekend 
                                                                        ? "text-white bg-orange-500" 
                                                                        : "text-white bg-primary"
                                                            )}>
                                                                ${(priceInfo.discountedPrice || priceInfo.price).toFixed(0)}
                                                            </span>
                                                        )}
                                                        {!modifiers.outside && !isAvailable && (
                                                            <span className="text-[8px] text-muted-foreground mt-0.5">
                                                                N/A
                                                            </span>
                                                        )}
                                                    </div>
                                                </CalendarDayButton>
                                            );
                                        },
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                        <input
                            type="hidden"
                            id="departureDate"
                            value={bookingForm.departureDate}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="adults" className="block text-sm font-medium mb-1">Adults</label>
                            <select
                                id="adults"
                                className="w-full p-2 border border-border rounded-md bg-background"
                                value={bookingForm.adults}
                                onChange={(e) => setBookingForm({ ...bookingForm, adults: parseInt(e.target.value) })}
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="children" className="block text-sm font-medium mb-1">Children</label>
                            <select
                                id="children"
                                className="w-full p-2 border border-border rounded-md bg-background"
                                value={bookingForm.children}
                                onChange={(e) => setBookingForm({ ...bookingForm, children: parseInt(e.target.value) })}
                            >
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                        <div className="flex justify-between mb-2">
                            <span>Price per person:</span>
                            <div className="text-right">
                                {pricing.basePrice < pricing.originalPrice ? (
                                    <div>
                                        <div className="flex items-center gap-2 justify-end">
                                            <span className="text-sm line-through text-muted-foreground">
                                                ${formatPrice(pricing.originalPrice)}
                                            </span>
                                            <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded">
                                                -{Math.round(((pricing.originalPrice - pricing.basePrice) / pricing.originalPrice) * 100)}%
                                            </span>
                                        </div>
                                        <div className="text-lg font-bold text-green-600">
                                            ${formatPrice(pricing.basePrice)}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-lg font-bold text-primary">
                                        ${formatPrice(pricing.basePrice)}
                                    </div>
                                )}
                                {tourData.pricePerPerson && (
                                    <div className="text-xs text-muted-foreground">per person</div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span>Adults ({bookingForm.adults}):</span>
                            <span>${formatPrice(pricing.adultPrice)}</span>
                        </div>
                        {bookingForm.children > 0 && (
                            <div className="flex justify-between mb-2">
                                <span>Children ({bookingForm.children}):</span>
                                <span>${formatPrice(pricing.childPrice)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                            <span>Total:</span>
                            <span className="text-primary">${formatPrice(pricing.totalPrice)}</span>
                        </div>
                    </div>

                    <Button
                        className="w-full"
                        size="lg"
                        onClick={handleBookingSubmit}
                        disabled={bookingMutation.isPending}
                    >
                        {bookingMutation.isPending ? 'Processing...' : 'Book Now'}
                    </Button>
                </TabsContent>

                {tourData?.enquiry && (
                    <TabsContent value="enquiry" className="mt-4 space-y-4">
                        <div>
                            <label htmlFor="enquiryName" className="block text-sm font-medium mb-1">Full Name</label>
                            <input
                                type="text"
                                id="enquiryName"
                                className="w-full p-2 border border-border rounded-md bg-background"
                                placeholder="Your full name"
                                value={enquiryForm.fullName}
                                onChange={(e) => setEnquiryForm({ ...enquiryForm, fullName: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="enquiryEmail" className="block text-sm font-medium mb-1">Email Address</label>
                            <input
                                type="email"
                                id="enquiryEmail"
                                className="w-full p-2 border border-border rounded-md bg-background"
                                placeholder="email@example.com"
                                value={enquiryForm.email}
                                onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="enquiryMessage" className="block text-sm font-medium mb-1">Message</label>
                            <textarea
                                id="enquiryMessage"
                                className="w-full p-2 border border-border rounded-md bg-background"
                                placeholder="I'm interested in this tour and would like more information..."
                                rows={5}
                                value={enquiryForm.message}
                                onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                            />
                        </div>

                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleEnquirySubmit}
                        >
                            Send Enquiry
                        </Button>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
};

export default FrontBooking;
