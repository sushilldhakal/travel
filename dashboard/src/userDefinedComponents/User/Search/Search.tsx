import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DualRangeSlider } from "@/userDefinedComponents/DualRangeSlider";
import MultipleSelector, { Option } from "@/userDefinedComponents/MultipleSelector";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";

const OPTIONS: Option[] = [
    { label: 'nextjs', value: 'Nextjs' },
    { label: 'React', value: 'react' },
    { label: 'Remix', value: 'remix' },
    { label: 'Vite', value: 'vite' },
    { label: 'Nuxt', value: 'nuxt' },
    { label: 'Vue', value: 'vue' },
    { label: 'Svelte', value: 'svelte' },
    { label: 'Angular', value: 'angular' },
    { label: 'Ember', value: 'ember' },
    { label: 'Gatsby', value: 'gatsby' },
    { label: 'Astro', value: 'astro' },
];
const Search = () => {
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(2024, 0, 20),
        to: addDays(new Date(2024, 0, 20), 20),
    })
    const [localValues, setLocalValues] = useState([0, 3000])
    const handleValueChange = (newValues: number[]) => {
        setLocalValues(newValues)
    }

    return (

        <div className="search-advance w-full dark-layout p-5 [background-color:rgb(37_41_41_/_80%)]  text-white rounded-lg">
            <div className="mx-auto">
                <div className="ws-advance-form text-left" id="ws-advance-form">
                    <form action="">
                        <h3 className="text-white mt-0 text-2xl uppercase mb-4 font-medium">Search Tours</h3>
                        <div className="form-content-wrapper space-y-4">
                            <div className="form-content">
                                <label className="block text-white mb-2" htmlFor="ws-keyword">Search Keyword</label>
                                <input type="text" id="ws-keyword" name="firstname" placeholder="Search by keyboard" className="w-full h-9 focus:[background-color:rgb(0_0_0_/_40%)] [background-color:rgb(0_0_0_/_40%)] border-0 px-4 py-2 rounded" />
                            </div>
                            <div className="form-content">
                                <label className="block text-white mb-2" htmlFor="ws-destination">Choose Destinations</label>
                                <select className="form-control [background-color:rgb(0_0_0_/_40%)] border-0 w-full px-4 py-2 rounded" id="ws-destination" data-live-search="true">
                                    <optgroup label="Asia">
                                        <option value="1">Nepal</option>
                                        <option value="2">Bhutan</option>
                                        <option value="3">India</option>
                                        <option value="4">Thailand</option>
                                    </optgroup>
                                    <optgroup label="Europe">
                                        <option value="11">Germany</option>
                                        <option value="12">England</option>
                                        <option value="13">Spain</option>
                                        <option value="14">France</option>
                                        <option value="15">Austria</option>
                                        <option value="16">Turkey</option>
                                        <option value="17">Russia</option>
                                        <option value="18">Portugal</option>
                                    </optgroup>
                                    <optgroup label="North America">
                                        <option value="21">USA</option>
                                        <option value="22">Canada</option>
                                        <option value="23">Cuba</option>
                                        <option value="24">Mexico</option>
                                    </optgroup>
                                    <optgroup label="South America">
                                        <option value="31">Brazil</option>
                                        <option value="32">Argentina</option>
                                        <option value="33">Cuba</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div className="form-content text-white">
                                <label className="block text-white mb-2" htmlFor="ws-trip-type">Choose Tour Type</label>
                                <MultipleSelector
                                    defaultOptions={OPTIONS}
                                    placeholder="Select Tour Type you like..."
                                    className="[background-color:rgb(0_0_0_/_40%)] border-0"
                                    emptyIndicator={
                                        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                            no results found.
                                        </p>
                                    }
                                />

                            </div>
                            <div className="form-content">
                                <label className="block mb-2" htmlFor="ws-trip-duration">Choose Trip Duration</label>
                                <Select>
                                    <SelectTrigger className="w-380px pt-1 pb-1 h-9 [background-color:rgb(0_0_0_/_40%)] border-0">
                                        <SelectValue placeholder="Days" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="3">3 Days</SelectItem>
                                        <SelectItem value="4">5 Days</SelectItem>
                                        <SelectItem value="7">7 Days</SelectItem>
                                    </SelectContent>
                                </Select>

                            </div>
                            <div className="form-content">
                                <label className="block mb-2">Trip Start End Range</label>
                                <div className={cn("grid gap-1 p-0")}>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                id="date"
                                                variant={"outline"}
                                                className={cn(
                                                    "h-9 pt-1 pb-1 [background-color:rgb(0_0_0_/_40%)] hover:[background-color:rgb(0_0_0_/_40%)] border-0 justify-start text-left hover:text-white font-normal",
                                                    !date && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {date?.from ? (
                                                    date.to ? (
                                                        <>
                                                            {format(date.from, "LLL dd, y")} -{" "}
                                                            {format(date.to, "LLL dd, y")}
                                                        </>
                                                    ) : (
                                                        format(date.from, "LLL dd, y")
                                                    )
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                initialFocus
                                                mode="range"
                                                defaultMonth={date?.from}
                                                selected={date}
                                                onSelect={setDate}
                                                numberOfMonths={2}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                            </div>
                            <div className="form-content">
                                <label className="block text-white mb-2" htmlFor="ws-min-price">Price Range</label>
                                <DualRangeSlider
                                    label={(localValues) => <span>{localValues}$</span>}
                                    value={localValues}
                                    onValueChange={handleValueChange}
                                    min={0}
                                    max={100}
                                    step={1}
                                    className={cn("w-full mt-5 text-xs")}
                                />
                                <div className="flex gap-2 flex-wrap mt-6">
                                    <ol className="flex items-center w-full gap-3">
                                        {localValues.map((_, index) => (
                                            <li key={index} className="flex items-center justify-between w-full border px-3 h-10 rounded-md">
                                                <span>Price:</span>
                                                <span>$ {localValues[index]}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                                <div className="flex justify-between mt-2">

                                </div>
                            </div>
                        </div>
                        <Button type="submit" value="Search" className="mt-4 px-6 py-2 uppercase rounded">Search</Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Search;


