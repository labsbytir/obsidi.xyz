import { useEffect, useRef, useState } from "react";
import { ChevronDown, Folder, List, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Wordmark } from "./Wordmark";

const notes = [
  { id: "start", title: "Start here", marker: "[-]" },
  { id: "connections", title: "Small connections", marker: "[ ]" },
  { id: "publishing", title: "What to share", marker: "[ ]" },
];

function NoteTree({ onSelect }: { onSelect?: () => void }) {
  return (
    <nav aria-label="Sample notes">
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="mb-3 flex min-h-11 w-full items-center gap-2 text-sm">
          <Folder className="size-4" aria-hidden="true" /> Field notes
          <ChevronDown className="ml-auto size-3" aria-hidden="true" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ScrollArea className="h-56">
            {notes.map((note) => (
              <a
                key={note.id}
                className="block py-3 text-sm text-muted-foreground hover:text-foreground"
                href={`#${note.id}`}
                onClick={onSelect}
              >
                {note.marker} {note.title}
              </a>
            ))}
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>
    </nav>
  );
}

export function SampleReader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [treeOpen, setTreeOpen] = useState(false);
  const [query, setQuery] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <TooltipProvider>
      <div className="reader-frame">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <Wordmark />
          <div className="flex items-center gap-2">
            <Sheet open={treeOpen} onOpenChange={setTreeOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-11 md:hidden"
                  aria-label="Open note tree"
                >
                  <List />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Sample notes</SheetTitle>
                  <SheetDescription>
                    Navigate the public sample notebook.
                  </SheetDescription>
                </SheetHeader>
                <div className="px-5">
                  <NoteTree onSelect={() => setTreeOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            <Dialog
              open={searchOpen}
              onOpenChange={(open) => {
                setSearchOpen(open);
                if (!open) setQuery("");
              }}
            >
              <DialogTrigger asChild>
                <Button
                  ref={trigger}
                  aria-label="Search notes"
                  variant="outline"
                  className="h-11 gap-3 px-4"
                >
                  <Search aria-hidden="true" /> Search{" "}
                  <KbdGroup className="hidden sm:flex">
                    <Kbd>⌘ / Ctrl</Kbd>
                    <Kbd>K</Kbd>
                  </KbdGroup>
                </Button>
              </DialogTrigger>
              <DialogContent
                className="p-0"
                onCloseAutoFocus={(event) => {
                  event.preventDefault();
                  trigger.current?.focus();
                }}
              >
                <DialogHeader className="sr-only">
                  <DialogTitle>Search notes</DialogTitle>
                  <DialogDescription>
                    Search only the notes in this public sample.
                  </DialogDescription>
                </DialogHeader>
                <Command>
                  <CommandInput
                    placeholder="Find a note…"
                    value={query}
                    onValueChange={setQuery}
                    aria-label="Find a note"
                  />
                  <CommandList>
                    <CommandEmpty>
                      <Empty className="border-0 p-4">
                        <EmptyHeader>
                          <EmptyTitle>No matching notes.</EmptyTitle>
                          <EmptyDescription>
                            Try a title such as “Start here”.
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </CommandEmpty>
                    <CommandGroup heading="Field notes">
                      {notes.map((note) => (
                        <CommandItem
                          key={note.id}
                          value={note.title}
                          onSelect={() => {
                            setSearchOpen(false);
                            setQuery("");
                            window.location.hash = note.id;
                          }}
                        >
                          {note.title}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </DialogContent>
            </Dialog>
          </div>
        </header>
        <div className="reader-grid">
          <aside className="reader-tree">
            <NoteTree />
          </aside>
          <main id="main" className="article min-w-0">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">obsidi.xyz</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Sample</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1>Field notes</h1>
            <p>
              A small notebook about noticing things, making connections, and
              sharing a little of what you find.
            </p>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" tabIndex={0}>
                  Public sample
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                This is an intentionally public demonstration notebook.
              </TooltipContent>
            </Tooltip>
            <p className="notice mt-3">Sample vault, not account data.</p>
            <h2 id="start">A place to begin</h2>
            <p>
              A notebook does not need a grand organizing principle. A useful
              sentence, a half-finished question, a link you want to return to:
              that is enough.
            </p>
            <p>
              Start with one note. Give it a name you will remember. Let the
              structure emerge from what you keep coming back to.
            </p>
            <h2 id="connections">Small connections</h2>
            <p>
              Links make a notebook more than a folder. One thought can point to
              another without either needing to belong in the same place.
            </p>
            <Tabs
              defaultValue="reading"
              className="my-6 gap-0 border border-border"
            >
              <TabsList
                variant="line"
                className="w-full justify-start rounded-none border-b border-border px-3"
              >
                <TabsTrigger value="reading">Reading</TabsTrigger>
                <TabsTrigger value="markdown">Markdown</TabsTrigger>
              </TabsList>
              <TabsContent value="reading" className="p-5">
                <p className="mb-0!">
                  A thought becomes more useful when it finds{" "}
                  <a href="#start">a place to begin</a>.
                </p>
              </TabsContent>
              <TabsContent value="markdown">
                <pre className="code-example">
                  {
                    "A thought becomes more useful when it finds\n[[Start here|a place to begin]]."
                  }
                </pre>
              </TabsContent>
            </Tabs>
            <h2 id="publishing">What to share</h2>
            <p>
              Some notes are for thinking out loud. Others are ready for a
              reader. Publishing should be a deliberate boundary between the
              two.
            </p>
            <ul>
              <li>Keep your original notebook private.</li>
              <li>Preview the notes and attachments you select.</li>
              <li>
                Publish a complete release, then change your mind when you need
                to.
              </li>
            </ul>
            <p className="mt-8">
              <a href="/docs">Read about the publishing workflow</a>.
            </p>
          </main>
          <aside className="reader-contents" aria-label="On this page">
            <p className="mb-4 text-xs">On this page</p>
            <a href="#start">A place to begin</a>
            <a href="#connections">Small connections</a>
            <a href="#publishing">What to share</a>
          </aside>
        </div>
      </div>
    </TooltipProvider>
  );
}
