import { ExternalLink } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Wordmark } from "./Wordmark";

const links = [
  { href: "/", label: "Overview" },
  { href: "/sample", label: "Sample vault" },
  { href: "/docs", label: "Publishing" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteNavigation({
  currentPath = "/",
}: {
  currentPath?: string;
}) {
  return (
    <SidebarProvider className="contents">
      <Sidebar className="border-r border-border">
        <SidebarHeader className="px-6 pt-8 pb-10">
          <Wordmark />
        </SidebarHeader>
        <SidebarContent className="px-4">
          <nav aria-label="Main navigation">
            <SidebarMenu>
              {links.map((link, index) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={currentPath === link.href}
                    className="h-11 px-3 text-sm"
                  >
                    <a
                      href={link.href}
                      aria-current={
                        currentPath === link.href ? "page" : undefined
                      }
                    >
                      <span className="text-muted-foreground">
                        [{index + 1}]
                      </span>
                      {link.label}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </nav>
        </SidebarContent>
        <SidebarFooter className="gap-4 px-6 pb-6 text-xs">
          <Badge variant="outline" className="w-fit">
            In development
          </Badge>
          <Separator />
          <a
            className="flex items-center gap-2 hover:text-foreground"
            href="https://github.com/labsbytir/obsidi.xyz"
          >
            Source on GitHub{" "}
            <ExternalLink className="size-3" aria-hidden="true" />
          </a>
          <p className="text-muted-foreground">A quiet home for your notes.</p>
        </SidebarFooter>
      </Sidebar>
      <div className="flex items-center justify-between border-b border-border px-5 py-4 md:hidden">
        <Wordmark />
        <SidebarTrigger aria-label="Open navigation" className="size-11" />
      </div>
    </SidebarProvider>
  );
}
