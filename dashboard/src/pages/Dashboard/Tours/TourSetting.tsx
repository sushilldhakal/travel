import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

const TourSetting = () => {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Tour Settings</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Configure default settings that will apply to all tours
                    </p>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="pricing" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="pricing">💳 Pricing</TabsTrigger>
                            <TabsTrigger value="logistics">📦 Logistics</TabsTrigger>
                            <TabsTrigger value="content">🎒 Content</TabsTrigger>
                            <TabsTrigger value="policies">✅ Policies</TabsTrigger>
                        </TabsList>

                        {/* Pricing Tab */}
                        <TabsContent value="pricing">
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="age-pricing">
                                    <AccordionTrigger>Age-based Pricing Rules</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-4">
                                            {['Adult', 'Child', 'Infant', 'Senior'].map((type) => (
                                                <div key={type} className="flex items-center gap-4">
                                                    <Label className="w-24">{type}</Label>
                                                    <Input type="number" placeholder={`${type} price`} />
                                                    <Select>
                                                        <SelectTrigger className="w-[180px]">
                                                            <SelectValue placeholder="Currency" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {['USD', 'EUR', 'GBP', 'AUD'].map((curr) => (
                                                                <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="partial-payments">
                                    <AccordionTrigger>Partial Payments / Installments</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="flex items-center space-x-4">
                                            <Switch id="partial-payments" />
                                            <Label htmlFor="partial-payments">Enable partial payments</Label>
                                        </div>
                                        <div className="mt-4 space-y-2">
                                            <Label>Deposit percentage</Label>
                                            <Input type="number" placeholder="e.g. 20" />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </TabsContent>

                        {/* Logistics Tab */}
                        <TabsContent value="logistics">
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="pickup-locations">
                                    <AccordionTrigger>Pickup/Drop Locations</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <Input placeholder="Location name" />
                                                <Input placeholder="Address" />
                                                <Button variant="outline">Add</Button>
                                            </div>
                                            <div className="border rounded-lg p-4">
                                                <p className="text-sm text-muted-foreground">Saved locations will appear here</p>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="transfer-modes">
                                    <AccordionTrigger>Transfer Modes</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-4">
                                            {['Bus', 'Flight', 'Boat', 'Private Car'].map((mode) => (
                                                <div key={mode} className="flex items-center gap-4">
                                                    <Switch id={mode.toLowerCase()} />
                                                    <Label htmlFor={mode.toLowerCase()}>{mode}</Label>
                                                    <Input type="text" placeholder={`${mode} details`} className="flex-1" />
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </TabsContent>

                        {/* Content Tab */}
                        <TabsContent value="content">
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="difficulty-level">
                                    <AccordionTrigger>Difficulty Level</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid grid-cols-3 gap-4">
                                            {['Easy', 'Moderate', 'Challenging', 'Extreme'].map((level) => (
                                                <div key={level} className="flex items-center space-x-2">
                                                    <Badge variant="outline">{level}</Badge>
                                                    <Input type="text" placeholder={`${level} description`} />
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="themes">
                                    <AccordionTrigger>Themes</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="flex flex-wrap gap-2">
                                            {['Adventure', 'Cultural', 'Luxury', 'Eco', 'Family', 'Solo'].map((theme) => (
                                                <Badge key={theme} variant="secondary">
                                                    {theme}
                                                </Badge>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </TabsContent>

                        {/* Policies Tab */}
                        <TabsContent value="policies">
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="cancellation">
                                    <AccordionTrigger>Cancellation Policy</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-4">
                                            <Select>
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder="Policy type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {['Flexible', 'Moderate', 'Strict', 'Custom'].map((policy) => (
                                                        <SelectItem key={policy} value={policy}>{policy}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input type="text" placeholder="Policy details" />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="requirements">
                                    <AccordionTrigger>Passport/Visa Requirements</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-4">
                                                <Switch id="passport-required" />
                                                <Label htmlFor="passport-required">Passport required</Label>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <Switch id="visa-required" />
                                                <Label htmlFor="visa-required">Visa required</Label>
                                            </div>
                                            <Input type="text" placeholder="Additional requirements" />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </TabsContent>
                    </Tabs>

                    <div className="mt-6 flex justify-end">
                        <Button>Save Settings</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default TourSetting;