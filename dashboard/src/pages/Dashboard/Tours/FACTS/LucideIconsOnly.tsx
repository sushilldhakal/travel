import { Input } from "@/components/ui/input";
import { icons } from 'lucide-react';
import { FC, useState } from "react";

interface LucideIconsOnlyProps {
    onSelectIcon: (iconName: string) => void; // Prop to handle icon selection
}

const LucideIconsOnly: FC<LucideIconsOnlyProps> = ({ onSelectIcon }) => {
    const [searchTerm, setSearchTerm] = useState(""); // State to hold the search term

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value.toLowerCase()); // Update search term
    };

    // Filter Lucide icons based on search term
    const filteredLucideIcons = Object.keys(icons).filter((iconName) => {
        if (iconName.startsWith("Lucide") || iconName.endsWith("Icon")) return false; // Skip invalid icons
        return iconName.toLowerCase().includes(searchTerm); // Filter by the search term
    });

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="mb-4">
                <Input
                    type="text"
                    placeholder="Search Lucide icons..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full"
                />
            </div>

            <div className="grid grid-cols-12 gap-4 overflow-y-auto max-h-[400px]">
                {filteredLucideIcons.map((iconName) => {
                    // Create icon component safely
                    const IconComponent = icons[iconName as keyof typeof icons];
                    if (!IconComponent) return null;

                    return (
                        <div
                            key={`lucide-${iconName}`}
                            className="flex flex-col items-center justify-center p-2 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-100"
                            onClick={() => onSelectIcon(iconName)}
                        >
                            <div className="w-6 h-6 flex items-center justify-center">
                                {/* Type assertion to help TypeScript understand this is a valid component */}
                                {IconComponent && <IconComponent size={24} />}
                            </div>
                            <span className="text-xs mt-1 truncate w-full text-center">{iconName}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LucideIconsOnly;
