"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

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
    const [viewMode, setViewMode] = useState<"all" | "bySet">("all")

    // Process icons for all sets or current set
    const getAllFilteredIcons = useMemo(() => {
        const allIcons: Array<{ iconName: string; fullIconName: string; IconComponent: any; setName: string; setPath: string }> = []

        iconSets.forEach((set) => {
            const allKeys = Object.keys(set.icons)
            const iconKeys = allKeys.filter((key) => {
                return typeof (set.icons as any)[key] === "function" && key.toLowerCase().includes(searchTerm.toLowerCase())
            })

            iconKeys.forEach((iconName) => {
                allIcons.push({
                    iconName,
                    fullIconName: `${set.path}/${iconName}`,
                    IconComponent: (set.icons as any)[iconName],
                    setName: set.name,
                    setPath: set.path,
                })
            })
        })

        // Limit results for performance
        return allIcons.slice(0, 500)
    }, [searchTerm])

    const getFilteredIconsBySet = (setPrefix: string) => {
        const selectedIconSet = iconSets.find((set) => set.prefix === setPrefix)
        if (!selectedIconSet) return []

        const allKeys = Object.keys(selectedIconSet.icons)
        const iconKeys = allKeys.filter((key) => {
            return typeof (selectedIconSet.icons as any)[key] === "function" && key.toLowerCase().includes(searchTerm.toLowerCase())
        })

        return iconKeys.map((iconName) => ({
            iconName,
            fullIconName: `${selectedIconSet.path}/${iconName}`,
            IconComponent: (selectedIconSet.icons as any)[iconName],
            setName: selectedIconSet.name,
            setPath: selectedIconSet.path,
        }))
    }

    return (
        <div className="w-full">
            <div className="mb-4 space-y-3">
                <Input
                    type="text"
                    placeholder="Search icons across all sets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                />

                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode("all")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "all"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                    >
                        All Icons
                    </button>
                    <button
                        onClick={() => setViewMode("bySet")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "bySet"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                    >
                        By Icon Set
                    </button>
                </div>
            </div>

            {viewMode === "all" ? (
                <ScrollArea className="h-[calc(80vh-200px)]">
                    {getAllFilteredIcons.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                            {getAllFilteredIcons.map((icon, index) => (
                                <div
                                    key={`${icon.fullIconName}-${index}`}
                                    className="flex flex-col items-center p-2 border rounded-md hover:bg-primary/10 cursor-pointer transition-colors group"
                                    onClick={() => onSelectIcon(icon.fullIconName)}
                                    title={icon.fullIconName}
                                >
                                    <div className="h-8 flex items-center justify-center">
                                        <icon.IconComponent className="text-2xl" />
                                    </div>
                                    <span className="text-xs text-center truncate w-full mt-1">{icon.iconName}</span>
                                    <Badge variant="outline" className="text-[10px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {icon.setPath}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-4">No icons found matching "{searchTerm}"</p>
                    )}

                    {getAllFilteredIcons.length === 500 && (
                        <p className="text-xs text-muted-foreground mt-4 text-center">
                            Showing first 500 results. Refine your search to see more specific icons.
                        </p>
                    )}
                </ScrollArea>
            ) : (
                <Tabs defaultValue="Fa">
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
                            <ScrollArea className="h-[calc(80vh-250px)]">
                                {(() => {
                                    const filteredIcons = getFilteredIconsBySet(set.prefix)
                                    return filteredIcons.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                                            {filteredIcons.map((icon, index) => (
                                                <div
                                                    key={`${icon.fullIconName}-${index}`}
                                                    className="flex flex-col items-center p-2 border rounded-md hover:bg-primary/10 cursor-pointer transition-colors"
                                                    onClick={() => onSelectIcon(icon.fullIconName)}
                                                    title={icon.fullIconName}
                                                >
                                                    <div className="h-8 flex items-center justify-center">
                                                        <icon.IconComponent className="text-2xl" />
                                                    </div>
                                                    <span className="text-xs text-center truncate w-full mt-1">{icon.iconName}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center py-4">No icons found matching "{searchTerm}"</p>
                                    )
                                })()}
                            </ScrollArea>
                        </TabsContent>
                    ))}
                </Tabs>
            )}
        </div>
    )
}
