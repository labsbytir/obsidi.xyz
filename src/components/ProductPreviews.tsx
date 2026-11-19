import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function ProductPreviews() {
  return (
    <div className="preview-grid">
      <Card className="preview-card">
        <AspectRatio ratio={1.15}>
          <div className="preview-inner">
            <p className="mb-4 text-muted-foreground">~/field-notes</p>
            <a href="/sample#start">[−] Start here.md</a>
            <a href="/sample#connections">[ ] Small connections.md</a>
            <a href="/sample#publishing">[ ] What to share.md</a>
          </div>
        </AspectRatio>
        <CardContent>
          <h2 className="feature-title">Familiar by design</h2>
          <p className="preview-subtitle">
            Markdown, folders, and links. Your notebook stays a notebook.
          </p>
        </CardContent>
      </Card>
      <Card className="preview-card">
        <AspectRatio ratio={1.15}>
          <div className="preview-inner">
            <Badge variant="outline" className="mb-5 w-fit">
              Sample note
            </Badge>
            <p className="mb-3 text-lg">Small connections</p>
            <p className="leading-7 text-muted-foreground">
              A thought becomes more useful
              <br />
              when it finds another thought.
            </p>
            <a
              className="mt-3 underline underline-offset-4"
              href="/sample#connections"
            >
              [[a place to begin]]
            </a>
          </div>
        </AspectRatio>
        <CardContent>
          <h2 className="feature-title">A reader, not a feed</h2>
          <p className="preview-subtitle">
            A note tree, a page, and room to think. Nothing competing with your
            words.
          </p>
        </CardContent>
      </Card>
      <Card className="preview-card">
        <AspectRatio ratio={1.15}>
          <div className="preview-inner">
            <p className="mb-3 text-muted-foreground">
              Publication is a choice.
            </p>
            <Separator className="mb-3" />
            <p className="py-2">
              Original vault{" "}
              <span className="float-right text-muted-foreground">Private</span>
            </p>
            <p className="py-2">
              Selected notes{" "}
              <span className="float-right text-muted-foreground">Public</span>
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Publish only what you mean to share.
            </p>
          </div>
        </AspectRatio>
        <CardContent>
          <h2 className="feature-title">Deliberately public</h2>
          <p className="preview-subtitle">
            Private originals. Explicit releases. No accidental whole-vault
            publication.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
