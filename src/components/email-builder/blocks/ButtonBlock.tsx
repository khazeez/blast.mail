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
        className="inline-block px-6 py-3 font-medium no-underline transition-opacity hover:opacity-90"
        style={{
          backgroundColor,
          color: textColor,
          borderRadius: `${borderRadius}px`,
        }}
        onClick={(e) => e.preventDefault()}
      >
        {text || "Click Here"}
      </a>
    </div>
  );
}
