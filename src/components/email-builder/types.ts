export type BlockType = 
  | "heading"
  | "text"
  | "image"
  | "button"
  | "divider"
  | "spacer"
  | "social"
  | "columns"
  | "footer";

export interface EmailBlock {
  id: string;
  type: BlockType;
  props: Record<string, any>;
}

export interface HeadingBlockProps {
  content: string;
  level: 1 | 2 | 3;
  align: "left" | "center" | "right";
  color: string;
}

export interface TextBlockProps {
  content: string;
  align: "left" | "center" | "right";
  color: string;
  fontSize: "small" | "medium" | "large";
}

export interface ImageBlockProps {
  src: string;
  alt: string;
  link: string;
  width: string;
  align: "left" | "center" | "right";
}

export interface ButtonBlockProps {
  text: string;
  link: string;
  backgroundColor: string;
  textColor: string;
  align: "left" | "center" | "right";
  borderRadius: number;
}

export interface DividerBlockProps {
  style: "solid" | "dashed" | "dotted";
  color: string;
  thickness: number;
}

export interface SpacerBlockProps {
  height: number;
}

export interface SocialBlockProps {
  platforms: Array<{
    name: string;
    url: string;
    icon: string;
  }>;
  align: "left" | "center" | "right";
}

export interface ColumnsBlockProps {
  columns: number;
  gap: number;
  children: EmailBlock[][];
}

export interface FooterBlockProps {
  companyName: string;
  address: string;
  unsubscribeLink: boolean;
  socialLinks: boolean;
}

export const defaultBlockProps: Record<BlockType, Record<string, any>> = {
  heading: {
    content: "Heading",
    level: 2,
    align: "left",
    color: "#ffffff",
  },
  text: {
    content: "Write your text here...",
    align: "left",
    color: "#ffffff",
    fontSize: "medium",
  },
  image: {
    src: "",
    alt: "Image",
    link: "",
    width: "100%",
    align: "center",
  },
  button: {
    text: "Click Here",
    link: "",
    backgroundColor: "#3b82f6",
    textColor: "#ffffff",
    align: "center",
    borderRadius: 6,
  },
  divider: {
    style: "solid",
    color: "#e5e5e5",
    thickness: 1,
  },
  spacer: {
    height: 20,
  },
  social: {
    platforms: [
      { name: "facebook", url: "", icon: "facebook" },
      { name: "twitter", url: "", icon: "twitter" },
      { name: "instagram", url: "", icon: "instagram" },
    ],
    align: "center",
  },
  columns: {
    columns: 2,
    gap: 16,
    children: [[], []],
  },
  footer: {
    companyName: "Your Company",
    address: "123 Main Street, City, Country",
    unsubscribeLink: true,
    socialLinks: false,
  },
};

export const blockLabels: Record<BlockType, string> = {
  heading: "Heading",
  text: "Text",
  image: "Image",
  button: "Button",
  divider: "Divider",
  spacer: "Spacer",
  social: "Social Links",
  columns: "Columns",
  footer: "Footer",
};
