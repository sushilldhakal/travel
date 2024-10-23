
import { Input } from "@/components/ui/input";
import Icon from "@/userDefinedComponents/Icon";
import { icons } from 'lucide-react'
import { FC, useState } from "react";


interface AllIconsProps {
    onSelectIcon: (iconName: string) => void; // Prop to handle icon selection
}

const AllIcons: FC<AllIconsProps> = ({ onSelectIcon }) => {
    const [searchTerm, setSearchTerm] = useState(""); // State to hold the search term
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value.toLowerCase()); // Update search term
    };
    // Filter icons based on search term
    const filteredIcons = Object.keys(icons).filter((iconName) => {
        if (iconName.startsWith("Lucide") || iconName.endsWith("Icon")) return false; // Skip invalid icons
        return iconName.toLowerCase().includes(searchTerm); // Filter by the search term
    });

    return (
        <>
            <div className="mb-4">
                <Input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search icons..."
                    className="p-2 border border-gray-300 rounded-lg w-full"
                />
            </div>
            <div className="grid grid-cols-12 gap-4 overflow-y-auto">
                {filteredIcons.map((iconName) => {
                    const LucideIcon = icons[iconName as keyof typeof icons] as FC<{ color?: string; size?: number | string }>;
                    if (!LucideIcon) return null; // Skip undefined icons

                    return (
                        <div
                            onClick={() => onSelectIcon(iconName)}
                            data-value={iconName}
                            key={iconName}
                            className="col-span-1 bg-primary-foreground rounded-lg p-4 flex items-center justify-center cursor-pointer hover:bg-primary-foreground/80 max-h-[60px] max-w-[60px]"
                        >
                            <Icon name={iconName} size={24} />
                        </div>
                    );
                })}
            </div>
        </>

    )
}

export default AllIcons;






