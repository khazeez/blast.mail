import { EmailBlock } from "./types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BlockConfigPanelProps {
  block: EmailBlock | null;
  onUpdate: (id: string, props: Record<string, any>) => void;
}

export function BlockConfigPanel({ block, onUpdate }: BlockConfigPanelProps) {
  if (!block) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p className="text-sm">Select a block to configure</p>
      </div>
    );
  }

  const handleChange = (key: string, value: any) => {
    onUpdate(block.id, { ...block.props, [key]: value });
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-5">
        {block.type === "heading" && (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Content</Label>
              <Input
                value={block.props.content || ""}
                onChange={(e) => handleChange("content", e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Level</Label>
              <Select
                value={String(block.props.level || 2)}
                onValueChange={(v) => handleChange("level", Number(v))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Heading 1</SelectItem>
                  <SelectItem value="2">Heading 2</SelectItem>
                  <SelectItem value="3">Heading 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Alignment</Label>
              <Select
                value={block.props.align || "left"}
                onValueChange={(v) => handleChange("align", v)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={block.props.color || "#1a1a1a"}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="w-12 h-9 p-1 cursor-pointer"
                />
                <Input
                  value={block.props.color || "#1a1a1a"}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="flex-1 h-9 font-mono text-xs"
                />
              </div>
            </div>
          </>
        )}

        {block.type === "text" && (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Content</Label>
              <Textarea
                value={block.props.content || ""}
                onChange={(e) => handleChange("content", e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Font Size</Label>
              <Select
                value={block.props.fontSize || "medium"}
                onValueChange={(v) => handleChange("fontSize", v)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (14px)</SelectItem>
                  <SelectItem value="medium">Medium (16px)</SelectItem>
                  <SelectItem value="large">Large (18px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Alignment</Label>
              <Select
                value={block.props.align || "left"}
                onValueChange={(v) => handleChange("align", v)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={block.props.color || "#4a4a4a"}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="w-12 h-9 p-1 cursor-pointer"
                />
                <Input
                  value={block.props.color || "#4a4a4a"}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="flex-1 h-9 font-mono text-xs"
                />
              </div>
            </div>
          </>
        )}

        {block.type === "image" && (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Image URL</Label>
              <Input
                value={block.props.src || ""}
                onChange={(e) => handleChange("src", e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Alt Text</Label>
              <Input
                value={block.props.alt || ""}
                onChange={(e) => handleChange("alt", e.target.value)}
                placeholder="Image description"
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Link (optional)</Label>
              <Input
                value={block.props.link || ""}
                onChange={(e) => handleChange("link", e.target.value)}
                placeholder="https://..."
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Width</Label>
              <Select
                value={block.props.width || "100%"}
                onValueChange={(v) => handleChange("width", v)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100%">Full Width</SelectItem>
                  <SelectItem value="75%">75%</SelectItem>
                  <SelectItem value="50%">50%</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Alignment</Label>
              <Select
                value={block.props.align || "center"}
                onValueChange={(v) => handleChange("align", v)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {block.type === "button" && (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Button Text</Label>
              <Input
                value={block.props.text || ""}
                onChange={(e) => handleChange("text", e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Link</Label>
              <Input
                value={block.props.link || ""}
                onChange={(e) => handleChange("link", e.target.value)}
                placeholder="https://..."
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Alignment</Label>
              <Select
                value={block.props.align || "center"}
                onValueChange={(v) => handleChange("align", v)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={block.props.backgroundColor || "#3b82f6"}
                  onChange={(e) => handleChange("backgroundColor", e.target.value)}
                  className="w-12 h-9 p-1 cursor-pointer"
                />
                <Input
                  value={block.props.backgroundColor || "#3b82f6"}
                  onChange={(e) => handleChange("backgroundColor", e.target.value)}
                  className="flex-1 h-9 font-mono text-xs"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={block.props.textColor || "#ffffff"}
                  onChange={(e) => handleChange("textColor", e.target.value)}
                  className="w-12 h-9 p-1 cursor-pointer"
                />
                <Input
                  value={block.props.textColor || "#ffffff"}
                  onChange={(e) => handleChange("textColor", e.target.value)}
                  className="flex-1 h-9 font-mono text-xs"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Border Radius: {block.props.borderRadius || 6}px</Label>
              <Slider
                value={[block.props.borderRadius || 6]}
                onValueChange={([v]) => handleChange("borderRadius", v)}
                min={0}
                max={24}
                step={1}
              />
            </div>
          </>
        )}

        {block.type === "divider" && (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Style</Label>
              <Select
                value={block.props.style || "solid"}
                onValueChange={(v) => handleChange("style", v)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                  <SelectItem value="dotted">Dotted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={block.props.color || "#e5e5e5"}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="w-12 h-9 p-1 cursor-pointer"
                />
                <Input
                  value={block.props.color || "#e5e5e5"}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="flex-1 h-9 font-mono text-xs"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Thickness: {block.props.thickness || 1}px</Label>
              <Slider
                value={[block.props.thickness || 1]}
                onValueChange={([v]) => handleChange("thickness", v)}
                min={1}
                max={5}
                step={1}
              />
            </div>
          </>
        )}

        {block.type === "spacer" && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Height: {block.props.height || 20}px</Label>
            <Slider
              value={[block.props.height || 20]}
              onValueChange={([v]) => handleChange("height", v)}
              min={10}
              max={100}
              step={5}
            />
          </div>
        )}

        {block.type === "footer" && (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Company Name</Label>
              <Input
                value={block.props.companyName || ""}
                onChange={(e) => handleChange("companyName", e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Address</Label>
              <Textarea
                value={block.props.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <Label className="text-xs">Unsubscribe Link</Label>
              <Switch
                checked={block.props.unsubscribeLink ?? true}
                onCheckedChange={(v) => handleChange("unsubscribeLink", v)}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <Label className="text-xs">Social Links</Label>
              <Switch
                checked={block.props.socialLinks ?? false}
                onCheckedChange={(v) => handleChange("socialLinks", v)}
              />
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );
}
