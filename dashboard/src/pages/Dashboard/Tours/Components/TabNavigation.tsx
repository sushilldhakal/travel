import { HashLink } from 'react-router-hash-link';
import { tabs } from './tabs';

interface TabNavigationProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
    return (
        <nav className="flex flex-col gap-2 p-2 text-sm rounded-xl">
            {tabs.map((tab) => (
                <HashLink
                    smooth
                    key={tab.id}
                    to={`#${tab.id}`}
                    className={`inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 justify-start p-1 ${activeTab === tab.id ? 'text-primary bg-muted hover:bg-muted' : 'hover:bg-muted'
                        }`}
                    // scroll={(el) => el.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    onClick={() => setActiveTab(tab.id)}
                >
                    {tab.title}
                </HashLink>
            ))}
        </nav>
    );
};

export default TabNavigation;
