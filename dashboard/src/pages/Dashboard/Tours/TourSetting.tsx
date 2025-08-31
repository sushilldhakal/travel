import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    CreditCard,
    Package,
    ClipboardCheck,
    Plus,
    MapPin,
    Trash2,
    Save,
    Plane,
    Bus,
    Car,
    AlertCircle,
    Calendar,
    StampIcon as Passport,
    FileText,
    Settings2,
    Loader2,
    CheckCircle2,
    Percent,
    DollarSign,
    Copy,
    RefreshCw,
    Tag
} from "lucide-react"

const TourSetting = () => {
    // Location Management State
    const [newLocation, setNewLocation] = useState({ name: "", address: "", mode: "" })
    const [locations, setLocations] = useState([
        {
            name: "Airport Terminal 1",
            address: "123 Airport Road, City",
            mode: "Shuttle",
        },
        {
            name: "Central Station",
            address: "45 Main Street, Downtown",
            mode: "Bus",
        },
    ])

    // Global Discount State - Default settings for tour creation
    const [globalDiscount, setGlobalDiscount] = useState({
        enabled: false,
        defaultType: "percentage", // "percentage" or "fixed" - default for new tours
        defaultValue: 10,
        description: "",
        couponCodes: [] as Array<{
            code: string;
            expiryDate: string;
            isActive: boolean;
        }>
    })
    const [newCouponCode, setNewCouponCode] = useState("")
    const [newCouponExpiry, setNewCouponExpiry] = useState("")

    // Form State
    const [activeTab, setActiveTab] = useState("pricing")
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Location Management Functions
    const addLocation = () => {
        if (newLocation.name && newLocation.address && newLocation.mode) {
            setLocations([...locations, newLocation])
            setNewLocation({ name: "", address: "", mode: "" })
        }
    }

    const removeLocation = (index: number) => {
        const updatedLocations = [...locations]
        updatedLocations.splice(index, 1)
        setLocations(updatedLocations)
    }

    const getTransportIcon = (mode: string) => {
        switch (mode) {
            case "Shuttle":
                return <Bus className="h-3.5 w-3.5" />
            case "Private Car":
                return <Car className="h-3.5 w-3.5" />
            default:
                return <Plane className="h-3.5 w-3.5" />
        }
    }

    // Global Discount Functions
    const generateCouponCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let result = ''
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return result
    }

    const addCouponCode = () => {
        if (newCouponCode.trim() && newCouponExpiry) {
            const expiryDate = new Date(newCouponExpiry)
            const isActive = expiryDate > new Date()
            
            setGlobalDiscount(prev => ({
                ...prev,
                couponCodes: [...prev.couponCodes, {
                    code: newCouponCode.trim().toUpperCase(),
                    expiryDate: newCouponExpiry,
                    isActive
                }]
            }))
            setNewCouponCode("")
            setNewCouponExpiry("")
        }
    }

    const generateRandomCoupon = () => {
        if (newCouponExpiry) {
            const code = generateCouponCode()
            const expiryDate = new Date(newCouponExpiry)
            const isActive = expiryDate > new Date()
            
            setGlobalDiscount(prev => ({
                ...prev,
                couponCodes: [...prev.couponCodes, {
                    code,
                    expiryDate: newCouponExpiry,
                    isActive
                }]
            }))
            setNewCouponExpiry("")
        }
    }

    const removeCouponCode = (index: number) => {
        setGlobalDiscount(prev => ({
            ...prev,
            couponCodes: prev.couponCodes.filter((_, i) => i !== index)
        }))
    }

    const copyCouponCode = (code: string) => {
        navigator.clipboard.writeText(code)
    }

    // Check if coupon codes are expired and update their status
    const updateCouponStatus = () => {
        const now = new Date()
        setGlobalDiscount(prev => ({
            ...prev,
            couponCodes: prev.couponCodes.map(coupon => ({
                ...coupon,
                isActive: new Date(coupon.expiryDate) > now
            }))
        }))
    }

    // Get active and inactive coupons
    const activeCoupons = globalDiscount.couponCodes.filter(coupon => coupon.isActive)
    const inactiveCoupons = globalDiscount.couponCodes.filter(coupon => !coupon.isActive)

    // Update coupon status on component mount and periodically
    useEffect(() => {
        updateCouponStatus()
        // Update coupon status every minute to handle expiration in real-time
        const interval = setInterval(updateCouponStatus, 60000)
        return () => clearInterval(interval)
    }, [globalDiscount.couponCodes])

    // Configuration Status Helper
    const isConfigured = (section: string): boolean => {
        switch (section) {
            case "pricing":
                return true // Replace with actual logic based on pricing fields
            case "logistics":
                return locations.length > 0
            case "policies":
                return true // Replace with actual logic based on policy fields
            case "discounts":
                return globalDiscount.enabled
            default:
                return false
        }
    }

    // Save Settings
    const handleSave = () => {
        setIsSubmitting(true)
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false)
        }, 1500)
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <Settings2 className="h-5 w-5 text-muted-foreground" />
                    <Badge variant="outline" className="bg-card text-muted-foreground font-medium">
                        Settings
                    </Badge>
                </div>
                <h1 className="text-3xl font-bold text-foreground">Tour Configuration</h1>
                <p className="text-muted-foreground mt-2 max-w-3xl">
                    Configure default settings that will apply to all tours in your system. These settings can be overridden for
                    individual tours if needed.
                </p>
            </div>

            <Tabs 
                defaultValue="pricing" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-8"
            >
                <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8">
                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card className="border shadow-xs">
                            <CardContent className="p-4">
                                <TabsList className="flex flex-col h-auto bg-transparent space-y-1">
                                    <TabsTrigger
                                        value="pricing"
                                        className="w-full justify-start gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                                    >
                                        <CreditCard className="h-4 w-4" />
                                        <span>Pricing</span>
                                        {isConfigured("pricing") && <CheckCircle2 className="h-3 w-3 ml-auto text-primary" />}
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="logistics"
                                        className="w-full justify-start gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                                    >
                                        <Package className="h-4 w-4" />
                                        <span>Logistics</span>
                                        {isConfigured("logistics") && <CheckCircle2 className="h-3 w-3 ml-auto text-primary" />}
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="policies"
                                        className="w-full justify-start gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                                    >
                                        <ClipboardCheck className="h-4 w-4" />
                                        <span>Policies</span>
                                        {isConfigured("policies") && <CheckCircle2 className="h-3 w-3 ml-auto text-primary" />}
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="discounts"
                                        className="w-full justify-start gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                                    >
                                        <Tag className="h-4 w-4" />
                                        <span>Global Discounts</span>
                                        {isConfigured("discounts") && <CheckCircle2 className="h-3 w-3 ml-auto text-primary" />}
                                    </TabsTrigger>
                                </TabsList>
                            </CardContent>
                            <CardFooter className="px-4 py-4 border-t">
                                <Button onClick={handleSave} className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save All Settings
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                    
                    {/* Main Content */}
                    <div className="space-y-6">
                        {/* Pricing Tab Content */}
                        <TabsContent value="pricing" className="mt-0 space-y-6">
                            <Card className="border shadow-xs">
                                <CardHeader className="bg-linear-to-r from-primary/5 to-primary/10 border-b">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-primary/10 p-2 rounded-full">
                                            <CreditCard className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle>Pricing Options</CardTitle>
                                            <CardDescription>Configure how customers can pay for your tours</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <Card className="border shadow-xs">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <CreditCard className="h-4 w-4 text-primary" />
                                                Payment Methods
                                            </CardTitle>
                                            <CardDescription>Manage accepted payment options</CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="space-y-4">
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="credit-card" className="font-medium flex items-center gap-2">
                                                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                            Credit Card
                                                        </Label>
                                                        <Switch id="credit-card" defaultChecked />
                                                    </div>
                                                    <Separator />
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="bank-transfer" className="font-medium flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                                            Bank Transfer
                                                        </Label>
                                                        <Switch id="bank-transfer" defaultChecked />
                                                    </div>
                                                    <Separator />
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="paypal" className="font-medium flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                                            PayPal
                                                        </Label>
                                                        <Switch id="paypal" />
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border shadow-xs">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-primary" />
                                                Deposit Options
                                            </CardTitle>
                                            <CardDescription>Configure deposit requirements</CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm">Require deposit</Label>
                                                        <Select defaultValue="percentage">
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select option" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="none">No deposit required</SelectItem>
                                                                <SelectItem value="percentage">Percentage of total</SelectItem>
                                                                <SelectItem value="fixed">Fixed amount</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm">Deposit amount</Label>
                                                        <div className="flex items-center">
                                                            <Input type="number" placeholder="e.g. 20" defaultValue="20" className="max-w-[180px]" />
                                                            <span className="ml-2 text-muted-foreground">%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Alert className="bg-primary/5 border-primary/20 text-foreground">
                                                    <AlertCircle className="h-4 w-4 text-primary" />
                                                    <AlertTitle>Tip</AlertTitle>
                                                    <AlertDescription>
                                                        A 20% deposit is typical for tour bookings. This helps reduce no-shows while keeping the initial payment reasonable.
                                                    </AlertDescription>
                                                </Alert>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Logistics Tab Content */}
                        <TabsContent value="logistics" className="mt-0 space-y-6">
                            <Card className="border shadow-xs">
                                <CardHeader className="bg-linear-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-b">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
                                            <Package className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <CardTitle>Logistics Options</CardTitle>
                                            <CardDescription>Configure transportation and location details</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <Card className="border shadow-xs">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                                                Pickup/Drop Locations
                                            </CardTitle>
                                            <CardDescription>Manage available pickup and drop-off points</CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <div>
                                                        <Label htmlFor="location-name" className="text-xs mb-1 block">
                                                            Location name
                                                        </Label>
                                                        <Input
                                                            id="location-name"
                                                            placeholder="e.g. Airport Terminal 1"
                                                            value={newLocation.name}
                                                            onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="location-address" className="text-xs mb-1 block">
                                                            Address
                                                        </Label>
                                                        <Input
                                                            id="location-address"
                                                            placeholder="Full address"
                                                            value={newLocation.address}
                                                            onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="transfer-mode" className="text-xs mb-1 block">
                                                            Transfer Mode
                                                        </Label>
                                                        <Select
                                                            value={newLocation.mode}
                                                            onValueChange={(value) => setNewLocation({ ...newLocation, mode: value })}
                                                        >
                                                            <SelectTrigger id="transfer-mode">
                                                                <SelectValue placeholder="Select mode" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Shuttle">Shuttle</SelectItem>
                                                                <SelectItem value="Private Car">Private Car</SelectItem>
                                                                <SelectItem value="Bus">Bus</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    onClick={addLocation}
                                                    className="w-full flex items-center justify-center gap-2"
                                                    disabled={!newLocation.name || !newLocation.address || !newLocation.mode}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Add Location
                                                </Button>

                                                {locations.length > 0 ? (
                                                    <div className="mt-6">
                                                        <h4 className="text-sm font-medium mb-3">Saved Locations</h4>
                                                        <div className="space-y-2">
                                                            {locations.map((location, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border"
                                                                >
                                                                    <div className="flex-1">
                                                                        <div className="font-medium">{location.name}</div>
                                                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                                            <span>{location.address}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <Badge className="bg-muted/70 text-foreground hover:bg-muted/90 border-0 flex items-center gap-1">
                                                                            {getTransportIcon(location.mode)}
                                                                            <span>{location.mode}</span>
                                                                        </Badge>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => removeLocation(index)}
                                                                            className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="border rounded-lg p-6 text-center bg-muted/50 mt-4">
                                                        <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                                        <p className="text-sm text-muted-foreground">No locations added yet</p>
                                                        <p className="text-xs text-muted-foreground/70">Add your first pickup location above</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border shadow-xs">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <Plane className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                                                    Transportation Providers
                                                </CardTitle>
                                                <Switch id="transport-providers" defaultChecked />
                                            </div>
                                            <CardDescription>Manage your transportation service providers</CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm">Default provider</Label>
                                                        <Select defaultValue="inhouse">
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select provider" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="inhouse">In-house Fleet</SelectItem>
                                                                <SelectItem value="partner1">Partner Company 1</SelectItem>
                                                                <SelectItem value="partner2">Partner Company 2</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm">Booking lead time</Label>
                                                        <div className="flex items-center">
                                                            <Input type="number" placeholder="24" defaultValue="24" className="max-w-[180px]" />
                                                            <span className="ml-2 text-muted-foreground">hours</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">Minimum time required to arrange transportation</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Policies Tab Content */}
                        <TabsContent value="policies" className="mt-0 space-y-6">
                            <Card className="border shadow-xs">
                                <CardHeader className="bg-linear-to-r from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border-b">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full">
                                            <ClipboardCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <CardTitle>Policy Options</CardTitle>
                                            <CardDescription>Configure cancellation and travel requirements</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card className="border shadow-xs">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                                                    Cancellation Policy
                                                </CardTitle>
                                                <CardDescription>Set refund rules for cancellations</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4 pt-0">
                                                <div className="space-y-2">
                                                    <Label className="text-sm">Policy type</Label>
                                                    <Select defaultValue="moderate">
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select policy type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="flexible">Flexible (Full refund up to 24h before)</SelectItem>
                                                            <SelectItem value="moderate">Moderate (Full refund up to 5 days before)</SelectItem>
                                                            <SelectItem value="strict">Strict (50% refund up to 7 days before)</SelectItem>
                                                            <SelectItem value="custom">Custom</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm">Custom refund percentage</Label>
                                                    <div className="flex items-center">
                                                        <Input type="number" placeholder="e.g. 50" defaultValue="50" className="max-w-[180px]" />
                                                        <span className="ml-2 text-muted-foreground">%</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm">Cancellation deadline</Label>
                                                    <div className="flex items-center">
                                                        <Input type="number" placeholder="e.g. 7" defaultValue="7" className="max-w-[180px]" />
                                                        <span className="ml-2 text-muted-foreground">days before tour</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">Last day to cancel and receive a refund</p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="border shadow-xs">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <Passport className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                                                    Travel Requirements
                                                </CardTitle>
                                                <CardDescription>Set travel document requirements</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4 pt-0">
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="passport-required" className="font-medium flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                                            Passport required
                                                        </Label>
                                                        <Switch id="passport-required" defaultChecked />
                                                    </div>
                                                    <Separator />
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="visa-required" className="font-medium flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                                            Visa required
                                                        </Label>
                                                        <Switch id="visa-required" />
                                                    </div>
                                                    <Separator />
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="vaccination-required" className="font-medium flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                                            Vaccination proof required
                                                        </Label>
                                                        <Switch id="vaccination-required" />
                                                    </div>
                                                </div>

                                                <div className="space-y-2 mt-4">
                                                    <Label className="text-sm">Additional requirements</Label>
                                                    <Input type="text" placeholder="e.g. Minimum 6 months passport validity" />
                                                    <p className="text-xs text-muted-foreground mt-1">Specify any other travel document requirements</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50">
                                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                        <AlertTitle>Legal Notice</AlertTitle>
                                        <AlertDescription className="text-amber-800 dark:text-amber-300">
                                            Ensure your policies comply with local tourism regulations and consumer protection laws. Consider
                                            consulting with a legal professional to review your policies.
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Global Discounts Tab Content */}
                        <TabsContent value="discounts" className="mt-0 space-y-6">
                            <Card className="border shadow-xs">
                                <CardHeader className="bg-linear-to-r from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-b">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                                            <Tag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <CardTitle>Global Discount Settings</CardTitle>
                                            <CardDescription>Configure site-wide discounts and promotional codes</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    {/* Global Discount Toggle */}
                                    <Card className="border shadow-xs">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <Percent className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                                                    Global Discount
                                                </CardTitle>
                                                <Switch 
                                                    id="global-discount" 
                                                    checked={globalDiscount.enabled}
                                                    onCheckedChange={(checked) => setGlobalDiscount(prev => ({ ...prev, enabled: checked }))}
                                                />
                                            </div>
                                            <CardDescription>Set default discount settings for new tour creation</CardDescription>
                                        </CardHeader>
                                        {globalDiscount.enabled && (
                                            <CardContent className="pt-0 space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm">Default Discount Type</Label>
                                                        <Select 
                                                            value={globalDiscount.defaultType} 
                                                            onValueChange={(value) => setGlobalDiscount(prev => ({ ...prev, defaultType: value }))}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select discount type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="percentage">
                                                                    <div className="flex items-center gap-2">
                                                                        <Percent className="h-4 w-4" />
                                                                        Percentage
                                                                    </div>
                                                                </SelectItem>
                                                                <SelectItem value="fixed">
                                                                    <div className="flex items-center gap-2">
                                                                        <DollarSign className="h-4 w-4" />
                                                                        Fixed Amount
                                                                    </div>
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm">Default Discount Value</Label>
                                                        <div className="flex items-center">
                                                            <Input 
                                                                type="number" 
                                                                placeholder={globalDiscount.defaultType === 'percentage' ? 'e.g. 15' : 'e.g. 50'}
                                                                value={globalDiscount.defaultValue}
                                                                onChange={(e) => setGlobalDiscount(prev => ({ ...prev, defaultValue: Number(e.target.value) }))}
                                                                className="max-w-[180px]" 
                                                            />
                                                            <span className="ml-2 text-muted-foreground">
                                                                {globalDiscount.defaultType === 'percentage' ? '%' : '$'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm">Description (Optional)</Label>
                                                    <Input 
                                                        type="text" 
                                                        placeholder="e.g. Summer Sale - Limited Time Offer"
                                                        value={globalDiscount.description}
                                                        onChange={(e) => setGlobalDiscount(prev => ({ ...prev, description: e.target.value }))}
                                                    />
                                                    <p className="text-xs text-muted-foreground">This description will be shown to customers</p>
                                                </div>

                                                <Alert className="bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-900/50">
                                                    <AlertCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                    <AlertTitle>How it works</AlertTitle>
                                                    <AlertDescription className="text-purple-800 dark:text-purple-300">
                                                        When creating new tours, the discount form will be pre-populated with 
                                                        {globalDiscount.defaultType === 'percentage' 
                                                            ? ` ${globalDiscount.defaultValue}% percentage discount`
                                                            : ` $${globalDiscount.defaultValue} fixed amount discount`
                                                        } as the default. Users can still modify or disable it for individual tours.
                                                    </AlertDescription>
                                                </Alert>
                                            </CardContent>
                                        )}
                                    </Card>

                                    {/* Coupon Code Management */}
                                    <Card className="border shadow-xs">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Tag className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                                                Discount Coupon Codes
                                            </CardTitle>
                                            <CardDescription>Generate and manage promotional coupon codes</CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-0 space-y-4">
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm">Coupon Code</Label>
                                                        <Input 
                                                            type="text" 
                                                            placeholder="Enter custom coupon code"
                                                            value={newCouponCode}
                                                            onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm">Expiry Date</Label>
                                                        <Input 
                                                            type="date" 
                                                            value={newCouponExpiry}
                                                            onChange={(e) => setNewCouponExpiry(e.target.value)}
                                                            min={new Date().toISOString().split('T')[0]}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button 
                                                        variant="outline" 
                                                        onClick={addCouponCode}
                                                        disabled={!newCouponCode.trim() || !newCouponExpiry}
                                                        className="flex-1"
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Add Custom Code
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        onClick={generateRandomCoupon}
                                                        disabled={!newCouponExpiry}
                                                        className="flex-1"
                                                    >
                                                        <RefreshCw className="h-4 w-4 mr-2" />
                                                        Generate Random
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Active Coupon Codes */}
                                            {activeCoupons.length > 0 && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-medium">Active Coupon Codes</h4>
                                                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                            {activeCoupons.length}
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {activeCoupons.map((coupon, index) => {
                                                            const originalIndex = globalDiscount.couponCodes.findIndex(c => c.code === coupon.code)
                                                            const daysUntilExpiry = Math.ceil((new Date(coupon.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                                                            return (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-center justify-between bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800"
                                                                >
                                                                    <div className="flex-1">
                                                                        <div className="font-mono text-sm font-medium">{coupon.code}</div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                                                                            {daysUntilExpiry <= 7 && (
                                                                                <span className="ml-2 text-amber-600 dark:text-amber-400">
                                                                                    ({daysUntilExpiry} days left)
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => copyCouponCode(coupon.code)}
                                                                            className="h-8 w-8 p-0"
                                                                        >
                                                                            <Copy className="h-3 w-3" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => removeCouponCode(originalIndex)}
                                                                            className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Inactive Coupon Codes */}
                                            {inactiveCoupons.length > 0 && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-medium text-muted-foreground">Expired Coupon Codes</h4>
                                                        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                                            {inactiveCoupons.length}
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {inactiveCoupons.map((coupon, index) => {
                                                            const originalIndex = globalDiscount.couponCodes.findIndex(c => c.code === coupon.code)
                                                            return (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-center justify-between bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-800 opacity-75"
                                                                >
                                                                    <div className="flex-1">
                                                                        <div className="font-mono text-sm font-medium line-through">{coupon.code}</div>
                                                                        <div className="text-xs text-red-600 dark:text-red-400">
                                                                            Expired: {new Date(coupon.expiryDate).toLocaleDateString()}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => removeCouponCode(originalIndex)}
                                                                            className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Empty State */}
                                            {globalDiscount.couponCodes.length === 0 && (
                                                <div className="border rounded-lg p-6 text-center bg-muted/50">
                                                    <Tag className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                                    <p className="text-sm text-muted-foreground">No coupon codes created yet</p>
                                                    <p className="text-xs text-muted-foreground/70">Add or generate your first coupon code above</p>
                                                </div>
                                            )}

                                            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/50">
                                                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                <AlertTitle>Coupon Code Management</AlertTitle>
                                                <AlertDescription className="text-blue-800 dark:text-blue-300">
                                                    Customers can enter these coupon codes during checkout to receive discounts. 
                                                    Codes automatically expire on their set date and move to the inactive section. 
                                                    Codes are case-insensitive and can be shared via marketing campaigns.
                                                </AlertDescription>
                                            </Alert>
                                        </CardContent>
                                    </Card>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </div>
            </Tabs>
        </div>
    )
}

export default TourSetting
