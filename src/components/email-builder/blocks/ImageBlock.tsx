import { ImageBlockProps } from "../types";
import { ImageIcon } from "lucide-react";

export function ImageBlock({
  src,
  alt,
  link,
  width,
  align,
}: ImageBlockProps) {
  const image = src ? (
    <img
      src={src}
      alt={alt}
      style={{ 
        width, 
        maxWidth: "100%", 
        marginInline: align === "center" ? "auto" : align === "right" ? "0 0 0 auto" : "0",
        display: "block"
      }}
      className="rounded"
    />
  ) : (
    <div 
      className="flex items-center justify-center h-28 bg-slate-100 rounded-lg"
      style={{ marginInline: align === "center" ? "auto" : align === "right" ? "0 0 0 auto" : "0" }}
    >
      <div className="text-center text-muted-foreground">
        <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Click to add image</p>
      </div>
    </div>
  );

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer">
        {image}
      </a>
    );
  }

  return image;
}
