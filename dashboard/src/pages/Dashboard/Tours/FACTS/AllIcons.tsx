"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

// Import specific icon sets
import * as FaIcons from "react-icons/fa"
import * as AiIcons from "react-icons/ai"
import * as FiIcons from "react-icons/fi"
import * as MdIcons from "react-icons/md"
import * as IoIcons from "react-icons/io"
import * as Io5Icons from "react-icons/io5"
import * as RiIcons from "react-icons/ri"
import * as TiIcons from "react-icons/ti"
import * as GiIcons from "react-icons/gi"
import * as HiIcons from "react-icons/hi"
import * as BiIcons from "react-icons/bi"
import * as LuIcons from "react-icons/lu"

// Define icon sets with their names and import paths
const iconSets = [
    { prefix: "Fa", name: "Font Awesome", icons: FaIcons, path: "fa" },
    { prefix: "Ai", name: "Ant Design Icons", icons: AiIcons, path: "ai" },
    { prefix: "Fi", name: "Feather Icons", icons: FiIcons, path: "fi" },
    { prefix: "Md", name: "Material Design Icons", icons: MdIcons, path: "md" },
    { prefix: "Io", name: "Ionicons 4", icons: IoIcons, path: "io" },
    { prefix: "Io5", name: "Ionicons 5", icons: Io5Icons, path: "io5" },
    { prefix: "Ri", name: "Remix Icons", icons: RiIcons, path: "ri" },
    { prefix: "Ti", name: "Typicons", icons: TiIcons, path: "ti" },
    { prefix: "Gi", name: "Game Icons", icons: GiIcons, path: "gi" },
    { prefix: "Hi", name: "Heroicons", icons: HiIcons, path: "hi" },
    { prefix: "Bi", name: "BoxIcons", icons: BiIcons, path: "bi" },
    { prefix: "Lu", name: "Lucide Icons", icons: LuIcons, path: "lu" },
]

interface AllIconsProps {
    onSelectIcon: (iconName: string) => void
}

export default function AllIcons({ onSelectIcon }: AllIconsProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [currentSet, setCurrentSet] = useState("Fa")

    // Get the current icon set
    const selectedIconSet = iconSets.find((set) => set.prefix === currentSet)

    // Process icons for the current set
    const getFilteredIcons = () => {
        if (!selectedIconSet) return []

        // Get all keys from the icon set
        const allKeys = Object.keys(selectedIconSet.icons)

        // Filter for actual icon components (typically they start with the prefix)
        const iconKeys = allKeys.filter((key) => {
            // Check if it's a function (component) and matches search term
            return typeof selectedIconSet.icons[key] === "function" && key.toLowerCase().includes(searchTerm.toLowerCase())
        })

        // Return limited results for performance
        return iconKeys
    }

    const filteredIcons = getFilteredIcons()

    return (
        <div className="w-full">
            <div className="mb-4">
                <Input
                    type="text"
                    placeholder="Search icons..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                />
            </div>

            <Tabs defaultValue={currentSet} onValueChange={setCurrentSet}>
                <ScrollArea className="w-full h-12 whitespace-nowrap rounded-md border mb-4">
                    <TabsList className="inline-flex w-max p-1">
                        {iconSets.map((set) => (
                            <TabsTrigger key={set.prefix} value={set.prefix}>
                                {set.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </ScrollArea>

                {iconSets.map((set) => (
                    <TabsContent key={set.prefix} value={set.prefix} className="mt-0">
                        {set.prefix === currentSet && (
                            <ScrollArea className="h-[calc(80vh-200px)]">
                                {filteredIcons.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                                        {filteredIcons.map((iconName) => {
                                            // Safely get the icon component
                                            const IconComponent = set.icons[iconName]

                                            // Only render if it's a valid component
                                            if (typeof IconComponent !== "function") return null

                                            // Create the full icon name for selection
                                            const fullIconName = `${set.path}/${iconName}`

                                            return (
                                                <div
                                                    key={iconName}
                                                    className="flex flex-col items-center p-2 border rounded-md hover:bg-primary/10 cursor-pointer transition-colors"
                                                    onClick={() => onSelectIcon(fullIconName)}
                                                    title={fullIconName}
                                                >
                                                    <div className="h-8 flex items-center justify-center">
                                                        <IconComponent className="text-2xl" />
                                                    </div>
                                                    <span className="text-xs text-center truncate w-full mt-1">{iconName}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-center py-4">No icons found matching "{searchTerm}"</p>
                                )}
                            </ScrollArea>
                        )}
                    </TabsContent>
                ))}
            </Tabs>

            {filteredIcons.length === 100 && (
                <p className="text-xs text-muted-foreground mt-2">
                    Showing first 100 results. Refine your search to see more specific icons.
                </p>
            )}
        </div>
    )
}
