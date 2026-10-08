import { ChefHat, Camera, Users, Database } from "lucide-react";

export const TABS = [
  { id: "ask" as const, label: "Ask Mario", icon: ChefHat },
  { id: "scan" as const, label: "Vision Scanner", icon: Camera },
  { id: "agents" as const, label: "3-Agent Pipeline", icon: Users },
  { id: "memory" as const, label: "Vector Search", icon: Database },
];

export type TabId = (typeof TABS)[number]["id"];

export const AGENT_META = {
  chef: {
    title: "Chef Mario",
    accent: "var(--color-terracotta)",
    bgTint: "bg-terracotta-muted",
    borderColor: "border-terracotta/30",
    textColor: "text-terracotta",
  },
  nutri: {
    title: "Dr. Nutri",
    accent: "var(--color-sage)",
    bgTint: "bg-sage-muted",
    borderColor: "border-sage/30",
    textColor: "text-sage",
  },
  penny: {
    title: "Penny Wise",
    accent: "var(--color-dusty-blue)",
    bgTint: "bg-dusty-blue-muted",
    borderColor: "border-dusty-blue/30",
    textColor: "text-dusty-blue",
  },
} as const;
