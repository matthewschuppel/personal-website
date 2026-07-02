import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  CheckSquare,
  FileText,
  Heart,
  Home,
  Landmark,
  NotebookPen,
  Plane,
  Settings,
  Sun
} from "lucide-react";

export const osNavigation = [
  { label: "Today", icon: Sun },
  { label: "Notes", icon: NotebookPen },
  { label: "Tasks", icon: CheckSquare },
  { label: "Calendar", icon: CalendarDays },
  { label: "Documents", icon: FileText },
  { label: "Home", icon: Home },
  { label: "Work", icon: BriefcaseBusiness },
  { label: "Travel", icon: Plane },
  { label: "Photography", icon: Camera },
  { label: "Wedding", icon: Heart },
  { label: "Finance", icon: Landmark },
  { label: "Knowledge Library", icon: BookOpen },
  { label: "Settings", icon: Settings }
];

export const quickActions = [
  "New Note",
  "New Task",
  "Upload Document",
  "Add Trip",
  "Add Home Project",
  "Add Bookmark"
];

export const mockTasks = [
  { title: "Review calendar and pick top three priorities", status: "Today", area: "Today" },
  { title: "Update travel packing checklist", status: "Next", area: "Travel" },
  { title: "Collect appliance warranty PDFs", status: "Next", area: "Home" }
];

export const mockNotes = [
  { title: "Weekly reset notes", meta: "Planning" },
  { title: "Clinical trial resource ideas", meta: "Work" },
  { title: "Photography locations shortlist", meta: "Photography" }
];

export const mockTrips = [
  { destination: "Dallas weekend", detail: "Hotel, dinner, and parking details" },
  { destination: "Future beach trip", detail: "Inspiration, packing, and flight watchlist" }
];

export const mockDocuments = [
  { title: "Resume PDF", type: "Career" },
  { title: "Insurance policies", type: "Finance" },
  { title: "Home warranty folder", type: "Home" }
];

export const mockProjects = [
  { title: "Organize home documents", status: "In progress" },
  { title: "Create appliance manual library", status: "Backlog" }
];

export const featureSections = [
  {
    title: "Home",
    items: [
      "Home documents",
      "Warranty information",
      "Appliance manuals",
      "Maintenance schedule",
      "Home projects",
      "Property tax documents",
      "Insurance links"
    ]
  },
  {
    title: "Work",
    items: [
      "Meeting notes",
      "Current projects",
      "Clinical trial resources",
      "Training documents",
      "AI prompts",
      "Presentation templates",
      "Important links"
    ]
  },
  {
    title: "Travel",
    items: [
      "Upcoming trips",
      "Flight details",
      "Hotel reservations",
      "Packing lists",
      "Itinerary notes",
      "Travel inspiration"
    ]
  },
  {
    title: "Photography",
    items: [
      "Portfolio placeholder",
      "Camera gear",
      "Editing workflow",
      "Shooting locations",
      "Favorite photos"
    ]
  },
  {
    title: "Wedding",
    items: [
      "Wedding timeline",
      "Vendor contacts",
      "Guest information",
      "Travel information",
      "Important documents",
      "Photo gallery placeholder"
    ]
  },
  {
    title: "Finance",
    items: [
      "Budget links",
      "Tax documents",
      "Mortgage information",
      "Insurance policies",
      "Investment links",
      "Recurring bills"
    ]
  },
  {
    title: "Knowledge Library",
    items: ["Notes", "Bookmarks", "Articles", "Recipes", "Ideas", "Quotes", "AI conversations"]
  }
];
