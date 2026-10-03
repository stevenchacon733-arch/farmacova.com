import {
  ClipboardList,
  HeartPulse,
  Pill,
  Leaf,
  Wind,
  type LucideProps,
} from "lucide-react";

export function CategoryIcon({
  name,
  ...props
}: LucideProps & { name: string }) {
  const icons = {
    pill: Pill,
    leaf: Leaf,
    wind: Wind,
    heart: HeartPulse,
    clipboard: ClipboardList,
  };
  const Icon = icons[name as keyof typeof icons] ?? Pill;
  return <Icon aria-hidden="true" {...props} />;
}
