import {
  BriefcaseBusiness,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  FileText,
  Heart,
  Home,
  Link,
  Map,
  NotebookPen,
  Plane,
  Sun
} from "lucide-react";

export const dashboardSections = [
  {
    title: "Today",
    icon: Sun,
    items: [
      "Morning review and plan top three priorities",
      "Confirm dinner reservation",
      "Scan calendar for prep blocks"
    ]
  },
  {
    title: "Calendar",
    icon: CalendarDays,
    items: ["9:00 AM Team sync", "12:30 PM Lunch walk", "4:00 PM Vendor call"]
  },
  {
    title: "Tasks",
    icon: CheckSquare,
    items: ["Send insurance paperwork", "Book oil change", "Update weekly budget"]
  },
  {
    title: "Notes",
    icon: NotebookPen,
    items: ["Ideas for personal CRM", "Questions for next financial review", "Recipe list"]
  },
  {
    title: "Quick Links",
    icon: Link,
    items: ["Banking", "Calendar", "Password manager", "Cloud drive"]
  },
  {
    title: "Documents",
    icon: FileText,
    items: ["Resume", "Lease documents", "Medical forms", "Tax folder"]
  },
  {
    title: "Travel",
    icon: Plane,
    items: ["Upcoming itinerary", "Packing checklist", "Loyalty numbers"]
  },
  {
    title: "Home",
    icon: Home,
    items: ["Maintenance tracker", "Utilities", "Inventory", "Contractors"]
  },
  {
    title: "Wedding",
    icon: Heart,
    items: ["Guest list", "Vendor contacts", "Budget", "Timeline"]
  },
  {
    title: "Work Resources",
    icon: BriefcaseBusiness,
    items: ["Onboarding docs", "Travel policy", "Team dashboard", "Templates"]
  }
];

export const todayMetrics = [
  { label: "Open tasks", value: "12" },
  { label: "Meetings", value: "3" },
  { label: "Focus blocks", value: "2" },
  { label: "Upcoming trips", value: "1" }
];

export const planningQueue = [
  {
    label: "Review",
    icon: ClipboardList,
    text: "Weekly reset on Sunday with calendar, money, travel, and home."
  },
  {
    label: "Next Trip",
    icon: Map,
    text: "Chicago weekend: confirm hotel, dinner, parking, and packing list."
  }
];

export type DashboardSection = (typeof dashboardSections)[number];
export type DashboardMetric = (typeof todayMetrics)[number];
export type DashboardPlan = (typeof planningQueue)[number];
