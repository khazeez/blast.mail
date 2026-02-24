import { TextBlockProps } from "../types";

export function TextBlock({
  content,
  align,
  color,
  fontSize,
}: TextBlockProps) {
  const sizes = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  return (
    <p 
      className={sizes[fontSize]} 
      style={{ textAlign: align, color, lineHeight: 1.6 }}
    >
      {content || "Write your text here..."}
    </p>
  );
}
