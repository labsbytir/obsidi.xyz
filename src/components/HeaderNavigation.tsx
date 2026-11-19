import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

export function HeaderNavigation() {
  return (
    <NavigationMenu aria-label="Product links">
      <NavigationMenuList className="gap-2">
        <NavigationMenuItem>
          <NavigationMenuLink href="/sample" className="px-3 py-2 text-xs">
            Reader
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/docs" className="px-3 py-2 text-xs">
            Docs
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
