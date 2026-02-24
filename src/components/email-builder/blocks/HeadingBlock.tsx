import { HeadingBlockProps } from "../types";

export function HeadingBlock({
  content,
  level,
  align,
  color,
}: HeadingBlockProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const sizes = {
    1: "text-2xl",
    2: "text-xl",
    3: "text-lg",
  };

  return (
    <Tag
      className={`font-bold ${sizes[level]}`}
      style={{ textAlign: align, color }}
    >
      {content}
    </Tag>
  );
}
