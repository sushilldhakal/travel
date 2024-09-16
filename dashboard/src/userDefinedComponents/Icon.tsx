import { icons } from 'lucide-react';
import { FC } from 'react';


interface IconProps {
    name: string;
    color?: string;
    size?: number | string;
}


const Icon: FC<IconProps> = ({ name, color, size }) => {
    const LucideIcon = icons[name as keyof typeof icons] as FC<{ color?: string; size?: number | string }>;
    if (!LucideIcon) {
        console.log(`Icon '${name}' not found.`);
        return null; // or return a default icon/error message
    }
    return <LucideIcon color={color} size={size} />;
};

export default Icon;