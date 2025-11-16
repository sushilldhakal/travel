import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookingWizard } from '@/components/BookingWizard';

const Checkout = () => {
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement payment processing
        navigate('/confirmation');
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Booking Wizard Header */}
            <BookingWizard currentStep={1} />

            {/* Main Checkout Content */}
            <div className="container mx-auto px-4 py-8">

            <form onSubmit={handleSubmit}>
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input id="firstName" required />
                                    </div>
                                    <div>
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input id="lastName" required />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" required />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" type="tel" required />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Method */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Method</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        type="button"
                                        variant={paymentMethod === 'card' ? 'default' : 'outline'}
                                        onClick={() => setPaymentMethod('card')}
                                        className="h-20"
                                    >
                                        <CreditCard className="h-6 w-6 mr-2" />
                                        Credit Card
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={paymentMethod === 'paypal' ? 'default' : 'outline'}
                                        onClick={() => setPaymentMethod('paypal')}
                                        className="h-20"
                                    >
                                        PayPal
                                    </Button>
                                </div>

                                {paymentMethod === 'card' && (
                                    <div className="space-y-4 pt-4">
                                        <div>
                                            <Label htmlFor="cardNumber">Card Number</Label>
                                            <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="expiry">Expiry Date</Label>
                                                <Input id="expiry" placeholder="MM/YY" required />
                                            </div>
                                            <div>
                                                <Label htmlFor="cvv">CVV</Label>
                                                <Input id="cvv" placeholder="123" required />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div>
                        <Card className="sticky top-4">
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>$0.00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax</span>
                                    <span>$0.00</span>
                                </div>
                                <div className="border-t pt-4 flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span className="text-primary">$0.00</span>
                                </div>
                                <Button type="submit" className="w-full" size="lg">
                                    <Lock className="h-4 w-4 mr-2" />
                                    Pay Now
                                </Button>
                                <p className="text-xs text-center text-muted-foreground">
                                    Your payment information is secure and encrypted
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
            </div>
        </div>
    );
};

export default Checkout;
