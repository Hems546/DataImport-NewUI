
export interface ImportTypeConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  enabled: boolean;
}

// Initial data structure for import types
export const defaultImportTypes: ImportTypeConfig[] = [
  {
    id: "contacts",
    title: "Contacts",
    description: "Import contacts from CSV or Excel files",
    icon: "UserCircle",
    iconColor: "#4F46E5",
    enabled: true,
  },
  {
    id: "products",
    title: "Products",
    description: "Import product data and inventory information",
    icon: "Package",
    iconColor: "#10B981",
    enabled: true,
  },
  {
    id: "transactions",
    title: "Transactions",
    description: "Import transaction and order data",
    icon: "Receipt",
    iconColor: "#F59E0B",
    enabled: true,
  },
  {
    id: "subscribers",
    title: "Subscribers",
    description: "Import subscriber lists from email marketing platforms",
    icon: "Users",
    iconColor: "#6366F1",
    enabled: true,
  },
  {
    id: "rateCards",
    title: "Rate Cards",
    description: "Import pricing rate cards and tariff structures",
    icon: "FileText",
    iconColor: "#ED8936",
    enabled: true,
  },
];
