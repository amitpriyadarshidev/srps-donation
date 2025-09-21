import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { type NavGroup, type NavItem, type NavLink, type NavCollapsible } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function checkIsActive(href: string, item: NavItem) {
    if (!item.url && item.items) {
        return item.items.some(subItem => subItem.url === href);
    }
    return href === item.url || href.split('?')[0] === item.url;
}

const SidebarMenuLink = ({ item, href }: { item: NavLink; href: string }) => {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                isActive={checkIsActive(href, item)}
                tooltip={{ children: item.title }}
            >
                <Link href={item.url} prefetch>
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.title}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
};

const SidebarMenuCollapsedDropdown = ({
    item,
    href,
}: {
    item: NavCollapsible;
    href: string;
}) => {
    return (
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                        tooltip={{ children: item.title }}
                        isActive={checkIsActive(href, item)}
                    >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                        <ChevronRight className="ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden" />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" sideOffset={4} className="min-w-48">
                    <DropdownMenuLabel className="flex items-center gap-2">
                        {item.icon && <item.icon className="h-4 w-4" />}
                        {item.title}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {item.items.map((subItem) => (
                        <DropdownMenuItem key={`${subItem.title}-${subItem.url}`} asChild>
                            <Link
                                href={subItem.url}
                                className={`flex items-center gap-2 w-full ${checkIsActive(href, subItem) ? 'bg-secondary' : ''}`}
                            >
                                {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                <span className="flex-1">{subItem.title}</span>
                            </Link>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    );
};

const SidebarMenuCollapsible = ({
    item,
    href,
}: {
    item: NavCollapsible;
    href: string;
}) => {
    return (
        <Collapsible
            asChild
            defaultOpen={checkIsActive(href, item)}
            className="group/collapsible"
        >
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={{ children: item.title }}>
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                    asChild
                                    isActive={checkIsActive(href, subItem)}
                                >
                                    <Link href={subItem.url} prefetch>
                                        {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                        <span>{subItem.title}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
};

export function NavMain({ items = [] }: { items: NavGroup[] }) {
    const { url: href } = usePage();
    const { state } = useSidebar();

    return (
        <div className="space-y-4">
            {items.map((group) => (
                <SidebarGroup key={group?.title} className="px-2 py-0">
                    <SidebarGroupLabel>{group?.title}</SidebarGroupLabel>
                    <SidebarMenu>
                        {group?.items?.map((item) => {
                            const key = `${item.title}-${item.url || 'group'}`;

                            if (!item.items) {
                                return <SidebarMenuLink key={key} item={item as NavLink} href={href} />;
                            }

                            if (state === 'collapsed') {
                                return <SidebarMenuCollapsedDropdown key={key} item={item as NavCollapsible} href={href} />;
                            }

                            return <SidebarMenuCollapsible key={key} item={item as NavCollapsible} href={href} />;
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </div>
    );
}
