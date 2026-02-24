import { EmailBlock, BlockType, defaultBlockProps } from "./types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <h3 className="font-medium text-sm capitalize">{block.type} Settings</h3>

        {block.type === "heading" && (
          <>
            <div className="space-y-2">
              <Label>Content</Label>
              <Input
                value={block.props.content || ""}
                onChange={(e) => handleChange("content", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Level</Label>
              <Select
                value={String(block.props.level || 2)}
                onValueChange={(v) => handleChange("level", Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">H1</SelectItem>
                  <SelectItem value="2">H2</SelectItem>
                  <SelectItem value="3">H3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Align</Label>
              <Select
                value={block.props.align || "left"}
                onValueChange={(v) => handleChange("align", v)}
              >
                <SelectTrigger>
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
              <Label>Color</Label>
              <Input
                type="color"
                value={block.props.color || "#1a1a1a"}
                onChange={(e) => handleChange("color", e.target.value)}
                className="h-10"
              />
            </div>
          </>
        )}

        {block.type === "text" && (
          <>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={block.props.content || ""}
                onChange={(e) => handleChange("content", e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Font Size</Label>
              <Select
                value={block.props.fontSize || "medium"}
                onValueChange={(v) => handleChange("fontSize", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Align</Label>
              <Select
                value={block.props.align || "left"}
                onValueChange={(v) => handleChange("align", v)}
              >
                <SelectTrigger>
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
              <Label>Color</Label>
              <Input
                type="color"
                value={block.props.color || "#4a4a4a"}
                onChange={(e) => handleChange("color", e.target.value)}
                className="h-10"
              />
            </div>
          </>
        )}

        {block.type === "image" && (
          <>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={block.props.src || ""}
                onChange={(e) => handleChange("src", e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Alt Text</Label>
              <Input
                value={block.props.alt || ""}
                onChange={(e) => handleChange("alt", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Link</Label>
              <Input
                value={block.props.link || ""}
                onChange={(e) => handleChange("link", e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Width</Label>
              <Select
                value={block.props.width || "100%"}
                onValueChange={(v) => handleChange("width", v)}
              >
                <SelectTrigger>
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
              <Label>Align</Label>
              <Select
                value={block.props.align || "center"}
                onValueChange={(v) => handleChange("align", v)}
              >
                <SelectTrigger>
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
              <Label>Button Text</Label>
              <Input
                value={block.props.text || ""}
                onChange={(e) => handleChange("text", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Link</Label>
              <Input
                value={block.props.link || ""}
                onChange={(e) => handleChange("link", e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Align</Label>
              <Select
                value={block.props.align || "center"}
                onValueChange={(v) => handleChange("align", v)}
              >
                <SelectTrigger>
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
              <Label>Background Color</Label>
              <Input
                type="color"
                value={block.props.backgroundColor || "#3b82f6"}
                onChange={(e) => handleChange("backgroundColor", e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label>Text Color</Label>
              <Input
                type="color"
                value={block.props.textColor || "#ffffff"}
                onChange={(e) => handleChange("textColor", e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label>Border Radius: {block.props.borderRadius || 6}px</Label>
              <Slider
                value={[block.props.borderRadius || 6]}
                onValueChange={([v]) => handleChange("borderRadius", v)}
                min={0}
                max={20}
                step={1}
              />
            </div>
          </>
        )}

        {block.type === "divider" && (
          <>
            <div className="space-y-2">
              <Label>Style</Label>
              <Select
                value={block.props.style || "solid"}
                onValueChange={(v) => handleChange("style", v)}
              >
                <SelectTrigger>
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
              <Label>Color</Label>
              <Input
                type="color"
                value={block.props.color || "#e5e5e5"}
                onChange={(e) => handleChange("color", e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label>Thickness: {block.props.thickness || 1}px</Label>
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
            <Label>Height: {block.props.height || 20}px</Label>
            <Slider
              value={[block.props.height || 20]}
              onValueChange={([v]) => handleChange("height", v)}
              min={10}
              max={100}
              step={5}
            />
          </div>
        )}

        {block.type === "social" && (
          <>
            <div className="space-y-2">
              <Label>Alignment</Label>
              <Select
                value={block.props.align || "center"}
                onValueChange={(v) => handleChange("align", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Social Platforms</Label>
              {block.props.platforms?.map((platform: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Select
                    value={platform.icon || platform.name}
                    onValueChange={(v) => {
                      const newPlatforms = [...(block.props.platforms || [])];
                      newPlatforms[index] = { ...platform, icon: v, name: v };
                      handleChange("platforms", newPlatforms);
                    }}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="https://..."
                    value={platform.url || ""}
                    onChange={(e) => {
                      const newPlatforms = [...(block.props.platforms || [])];
                      newPlatforms[index] = { ...platform, url: e.target.value };
                      handleChange("platforms", newPlatforms);
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => {
                      const newPlatforms = (block.props.platforms || []).filter((_: any, i: number) => i !== index);
                      handleChange("platforms", newPlatforms);
                    }}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  const newPlatforms = [...(block.props.platforms || []), { name: "facebook", url: "", icon: "facebook" }];
                  handleChange("platforms", newPlatforms);
                }}
              >
                + Add Platform
              </Button>
            </div>
          </>
        )}

        {block.type === "footer" && (
          <>
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={block.props.companyName || ""}
                onChange={(e) => handleChange("companyName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea
                value={block.props.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Unsubscribe Link</Label>
              <Switch
                checked={block.props.unsubscribeLink ?? true}
                onCheckedChange={(v) => handleChange("unsubscribeLink", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Social Links</Label>
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
