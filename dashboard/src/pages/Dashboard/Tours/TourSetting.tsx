import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Package, ClipboardCheck, Plus, MapPin, Trash2 } from "lucide-react"

const TourSetting = () => {
    const [activeTab, setActiveTab] = useState("pricing")
    const [locations, setLocations] = useState([{ name: "Airport", address: "International Airport", mode: "Shuttle" }])
    const [newLocation, setNewLocation] = useState({ name: "", address: "", mode: "" })

    const addLocation = () => {
        if (newLocation.name && newLocation.address) {
            setLocations([...locations, newLocation])
            setNewLocation({ name: "", address: "", mode: "" })
        }
    }

    const removeLocation = (index: number) => {
        setLocations(locations.filter((_, i) => i !== index))
    }

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Left side - Content */}

                <div className="w-full md:w-1/4 order-1 md:order-1">
                    <Card className="border-none shadow-lg sticky top-4">
                        <CardContent className="p-0">
                            <div className="flex flex-col">
                                <button
                                    onClick={() => setActiveTab("pricing")}
                                    className={`flex items-center p-4 border-l-4 ${activeTab === "pricing"
                                        ? "border-blue-500 bg-blue-50 text-blue-700"
                                        : "border-transparent hover:bg-slate-50"
                                        }`}
                                >
                                    <div className={`p-2 rounded-full mr-3 ${activeTab === "pricing" ? "bg-blue-100" : "bg-slate-100"}`}>
                                        <CreditCard className={`h-5 w-5 ${activeTab === "pricing" ? "text-blue-500" : "text-slate-500"}`} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-medium">Pricing</h3>
                                        <p className="text-sm text-slate-500">Payment options</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setActiveTab("logistics")}
                                    className={`flex items-center p-4 border-l-4 ${activeTab === "logistics"
                                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                        : "border-transparent hover:bg-slate-50"
                                        }`}
                                >
                                    <div
                                        className={`p-2 rounded-full mr-3 ${activeTab === "logistics" ? "bg-emerald-100" : "bg-slate-100"}`}
                                    >
                                        <Package
                                            className={`h-5 w-5 ${activeTab === "logistics" ? "text-emerald-500" : "text-slate-500"}`}
                                        />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-medium">Logistics</h3>
                                        <p className="text-sm text-slate-500">Transport & locations</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setActiveTab("policies")}
                                    className={`flex items-center p-4 border-l-4 ${activeTab === "policies"
                                        ? "border-amber-500 bg-amber-50 text-amber-700"
                                        : "border-transparent hover:bg-slate-50"
                                        }`}
                                >
                                    <div
                                        className={`p-2 rounded-full mr-3 ${activeTab === "policies" ? "bg-amber-100" : "bg-slate-100"}`}
                                    >
                                        <ClipboardCheck
                                            className={`h-5 w-5 ${activeTab === "policies" ? "text-amber-500" : "text-slate-500"}`}
                                        />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-medium">Policies</h3>
                                        <p className="text-sm text-slate-500">Rules & requirements</p>
                                    </div>
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="w-full md:w-3/4 order-2 md:order-2">
                    <Card className="border-none shadow-lg h-full">
                        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg border-b p-6">
                            <Badge variant="outline" className="w-fit mb-2 text-slate-600 bg-white">
                                Settings
                            </Badge>
                            <h2 className="text-2xl font-bold text-slate-800">Tour Configuration</h2>
                            <p className="text-slate-600 mt-2">Configure default settings that will apply to all tours</p>
                        </div>

                        <CardContent className="p-6">
                            {/* Pricing Content */}
                            {activeTab === "pricing" && (
                                <div className="space-y-6">
                                    <div className="bg-slate-50 p-4 rounded-lg mb-4">
                                        <h3 className="text-sm font-medium text-slate-500 mb-1">PRICING OPTIONS</h3>
                                        <p className="text-slate-700">Configure how customers can pay for your tours</p>
                                    </div>

                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="partial-payments" className="border rounded-lg px-4 shadow-sm">
                                            <AccordionTrigger className="py-4 hover:no-underline">
                                                <div className="flex items-center">
                                                    <div className="bg-blue-50 p-2 rounded-full mr-3">
                                                        <CreditCard className="h-5 w-5 text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-left">Partial Payments / Installments</h3>
                                                        <p className="text-sm text-slate-500 text-left">Allow customers to pay in installments</p>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="pt-2 pb-4">
                                                <div className="bg-slate-50 p-4 rounded-lg mb-4">
                                                    <div className="flex items-center space-x-4">
                                                        <Switch id="partial-payments" />
                                                        <Label htmlFor="partial-payments" className="font-medium">
                                                            Enable partial payments
                                                        </Label>
                                                    </div>
                                                </div>
                                                <div className="mt-4 space-y-2">
                                                    <Label className="text-sm text-slate-600">Deposit percentage</Label>
                                                    <div className="flex items-center">
                                                        <Input type="number" placeholder="e.g. 20" className="max-w-[180px]" />
                                                        <span className="ml-2 text-slate-500">%</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        This is the minimum percentage customers must pay upfront
                                                    </p>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>
                            )}

                            {/* Logistics Content */}
                            {activeTab === "logistics" && (
                                <div className="space-y-6">
                                    <div className="bg-slate-50 p-4 rounded-lg mb-4">
                                        <h3 className="text-sm font-medium text-slate-500 mb-1">LOGISTICS OPTIONS</h3>
                                        <p className="text-slate-700">Configure transportation and location details</p>
                                    </div>

                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="pickup-locations" className="border rounded-lg px-4 shadow-sm">
                                            <AccordionTrigger className="py-4 hover:no-underline">
                                                <div className="flex items-center">
                                                    <div className="bg-emerald-50 p-2 rounded-full mr-3">
                                                        <MapPin className="h-5 w-5 text-emerald-500" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-left">Pickup/Drop Locations</h3>
                                                        <p className="text-sm text-slate-500 text-left">
                                                            Manage available pickup and drop-off points
                                                        </p>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="pt-2 pb-4">
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                        <Input
                                                            placeholder="Location name"
                                                            value={newLocation.name}
                                                            onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                                                        />
                                                        <Input
                                                            placeholder="Address"
                                                            value={newLocation.address}
                                                            onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                                                        />
                                                        <Select
                                                            value={newLocation.mode}
                                                            onValueChange={(value) => setNewLocation({ ...newLocation, mode: value })}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Transfer Mode" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Shuttle">Shuttle</SelectItem>
                                                                <SelectItem value="Private Car">Private Car</SelectItem>
                                                                <SelectItem value="Bus">Bus</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        onClick={addLocation}
                                                        className="w-full flex items-center justify-center gap-2"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                        Add Location
                                                    </Button>

                                                    {locations.length > 0 ? (
                                                        <div className="mt-4 space-y-2">
                                                            <h4 className="text-sm font-medium text-slate-600 mb-2">Saved Locations</h4>
                                                            {locations.map((location, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-center justify-between bg-slate-50 p-3 rounded-lg"
                                                                >
                                                                    <div className="flex-1">
                                                                        <div className="font-medium">{location.name}</div>
                                                                        <div className="text-sm text-slate-500 flex items-center gap-2">
                                                                            <span>{location.address}</span>
                                                                            <span className="inline-block w-1 h-1 bg-slate-300 rounded-full"></span>
                                                                            <Badge variant="outline" className="bg-white">
                                                                                {location.mode}
                                                                            </Badge>
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => removeLocation(index)}
                                                                        className="text-slate-400 hover:text-red-500"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="border rounded-lg p-6 text-center bg-slate-50">
                                                            <MapPin className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                                            <p className="text-sm text-slate-500">No locations added yet</p>
                                                            <p className="text-xs text-slate-400">Add your first pickup location above</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>
                            )}

                            {/* Policies Content */}
                            {activeTab === "policies" && (
                                <div className="space-y-6">
                                    <div className="bg-slate-50 p-4 rounded-lg mb-4">
                                        <h3 className="text-sm font-medium text-slate-500 mb-1">POLICY OPTIONS</h3>
                                        <p className="text-slate-700">Configure cancellation and travel requirements</p>
                                    </div>

                                    <Accordion type="single" collapsible className="w-full space-y-4">
                                        <AccordionItem value="cancellation" className="border rounded-lg px-4 shadow-sm">
                                            <AccordionTrigger className="py-4 hover:no-underline">
                                                <div className="flex items-center">
                                                    <div className="bg-amber-50 p-2 rounded-full mr-3">
                                                        <ClipboardCheck className="h-5 w-5 text-amber-500" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-left">Cancellation Policy</h3>
                                                        <p className="text-sm text-slate-500 text-left">Set refund rules for cancellations</p>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="pt-2 pb-4">
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-sm text-slate-600">Policy type</Label>
                                                            <Select>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select policy type" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {["Flexible", "Moderate", "Strict", "Custom"].map((policy) => (
                                                                        <SelectItem key={policy} value={policy}>
                                                                            {policy}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label className="text-sm text-slate-600">Refund percentage</Label>
                                                            <div className="flex items-center">
                                                                <Input type="number" placeholder="e.g. 50" className="max-w-[180px]" />
                                                                <span className="ml-2 text-slate-500">%</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-slate-600">Policy details</Label>
                                                        <Input type="text" placeholder="Describe your cancellation policy" />
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            This will be displayed to customers during checkout
                                                        </p>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>

                                        <AccordionItem value="requirements" className="border rounded-lg px-4 shadow-sm">
                                            <AccordionTrigger className="py-4 hover:no-underline">
                                                <div className="flex items-center">
                                                    <div className="bg-purple-50 p-2 rounded-full mr-3">
                                                        <ClipboardCheck className="h-5 w-5 text-purple-500" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-left">Passport/Visa Requirements</h3>
                                                        <p className="text-sm text-slate-500 text-left">Set travel document requirements</p>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="pt-2 pb-4">
                                                <div className="space-y-4">
                                                    <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <Label htmlFor="passport-required" className="font-medium">
                                                                Passport required
                                                            </Label>
                                                            <Switch id="passport-required" />
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <Label htmlFor="visa-required" className="font-medium">
                                                                Visa required
                                                            </Label>
                                                            <Switch id="visa-required" />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-slate-600">Additional requirements</Label>
                                                        <Input type="text" placeholder="e.g. Minimum 6 months passport validity" />
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            Specify any other travel document requirements
                                                        </p>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>
                            )}

                            <div className="mt-8 flex justify-end">
                                <Button className="px-8 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                                    Save Settings
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>


            </div>
        </div>
    )
}

export default TourSetting
