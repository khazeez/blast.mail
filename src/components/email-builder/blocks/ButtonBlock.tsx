import { ButtonBlockProps } from "../types";

export function ButtonBlock({
  text,
  link,
  backgroundColor,
  textColor,
  align,
  borderRadius,
}: ButtonBlockProps) {
  return (
    <div style={{ textAlign: align }}>
      <a
        href={link || "#"}
        className="inline-block px-6 py-3 font-medium no-underline"
        style={{
          backgroundColor,
          color: textColor,
          borderRadius: `${borderRadius}px`,
        }}
      >
        {text}
      </a>
    </div>
  );
}
