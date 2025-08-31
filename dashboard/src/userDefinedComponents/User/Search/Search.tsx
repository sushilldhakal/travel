import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DualRangeSlider } from "@/userDefinedComponents/DualRangeSlider";
import { format } from "date-fns";
import { CalendarIcon, Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

const Search = () => {
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState("");
    const [destination, setDestination] = useState("");
    const [tourType, setTourType] = useState("");
    const [duration, setDuration] = useState("");
    const [date, setDate] = useState<DateRange | undefined>({
        from: undefined,
        to: undefined,
    });
    const [priceRange, setPriceRange] = useState([0, 10000]);

    const handleValueChange = (newValues: number[]) => {
        setPriceRange(newValues);
    };

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();

        // Build query parameters
        const params = new URLSearchParams();

        if (keyword) params.append("keyword", keyword);
        if (destination) params.append("destination", destination);
        if (tourType) params.append("type", tourType);
        if (duration) params.append("duration", duration);
        if (date?.from) params.append("startDate", date.from.toISOString());
        if (date?.to) params.append("endDate", date.to.toISOString());
        params.append("minPrice", priceRange[0].toString());
        params.append("maxPrice", priceRange[1].toString());

        // Navigate to search results page with query parameters
        navigate(`/tours/search?${params.toString()}`);

        toast({
            title: "Searching tours",
            description: "Finding the best tours for you...",
            duration: 2000,
        });
    };

    return (
        <div className="search-form w-full text-white">
            <form onSubmit={handleSearch} className="space-y-4">
                {/* Search Keyword */}
                <div className="form-group">
                    <label className="block text-sm font-medium mb-1">Search Keyword</label>
                    <input
                        type="text"
                        placeholder="Search by keyword"
                        className="w-full h-10 bg-white bg-opacity-20 border-0 px-4 py-2 rounded text-white placeholder:text-gray-300"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>

                {/* Choose Destination */}
                <div className="form-group">
                    <label className="block text-sm font-medium mb-1">Choose Destinations</label>
                    <Select value={destination} onValueChange={setDestination}>
                        <SelectTrigger className="w-full h-10 bg-white bg-opacity-20 border-0 text-white">
                            <SelectValue placeholder="Nepal" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="nepal">Nepal</SelectItem>
                            <SelectItem value="india">India</SelectItem>
                            <SelectItem value="bhutan">Bhutan</SelectItem>
                            <SelectItem value="tibet">Tibet</SelectItem>
                            <SelectItem value="peru">Peru</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Choose Trip Type */}
                <div className="form-group">
                    <label className="block text-sm font-medium mb-1">Choose Trip Type</label>
                    <Select value={tourType} onValueChange={setTourType}>
                        <SelectTrigger className="w-full h-10 bg-white bg-opacity-20 border-0 text-white">
                            <SelectValue placeholder="Nothing selected" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="adventure">Adventure</SelectItem>
                            <SelectItem value="cultural">Cultural</SelectItem>
                            <SelectItem value="historical">Historical</SelectItem>
                            <SelectItem value="nature">Nature</SelectItem>
                            <SelectItem value="wildlife">Wildlife</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Choose Trip Duration */}
                <div className="form-group">
                    <label className="block text-sm font-medium mb-1">Choose Trip Duration</label>
                    <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger className="w-full h-10 bg-white bg-opacity-20 border-0 text-white">
                            <SelectValue placeholder="2 days" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1-3">1-3 days</SelectItem>
                            <SelectItem value="4-7">4-7 days</SelectItem>
                            <SelectItem value="8-14">8-14 days</SelectItem>
                            <SelectItem value="15+">15+ days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Trip Start/End Range */}
                <div className="form-group">
                    <label className="block text-sm font-medium mb-1">Trip Start End Range</label>
                    <div className="grid gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline-solid"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-10 bg-white bg-opacity-20 border-0 text-white",
                                        !date && "text-gray-300"
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
                                        <span>Select a date range</span>
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

                {/* Price Range */}
                <div className="form-group">
                    <label className="block text-sm font-medium mb-1">Price Range</label>
                    <div className="px-2">
                        <DualRangeSlider
                            min={0}
                            max={10000}
                            step={100}
                            defaultValue={[0, 10000]}
                            value={priceRange}
                            onValueChange={handleValueChange}
                            label={(value: number) => `$${value}`}
                            showEditableInputs={true}
                            currency="$"
                            className="py-4"
                        />
                    </div>
                </div>

                {/* Search Button */}
                <Button
                    type="submit"
                    className="w-full font-medium py-2 px-4 rounded"
                >
                    <SearchIcon className="w-4 h-4 mr-2" />
                    Search
                </Button>
            </form>
        </div>
    );
};

export default Search;
