import type { LucideIcon } from "lucide-react";
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

export type DashboardSectionKey =
  | "Today"
  | "Notes"
  | "Tasks"
  | "Calendar"
  | "Documents"
  | "Home"
  | "Work"
  | "Travel"
  | "Photography"
  | "Wedding"
  | "Finance"
  | "Knowledge Library"
  | "Settings";

export type DashboardNavItem = {
  label: DashboardSectionKey;
  icon: LucideIcon;
};

export type MockTask = {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  status: "Today" | "Next" | "Waiting" | "Done";
  dueDate: string;
  area: DashboardSectionKey;
};

export type MockNote = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  updatedAt: string;
};

export type MockDocument = {
  id: string;
  title: string;
  category: DashboardSectionKey | "Career";
  type: string;
  updatedAt: string;
};

export type MockTrip = {
  id: string;
  destination: string;
  dates: string;
  status: string;
  detail: string;
};

export type MockProject = {
  id: string;
  title: string;
  area: DashboardSectionKey;
  status: string;
  nextStep: string;
};

export type MockBookmark = {
  id: string;
  title: string;
  category: DashboardSectionKey;
  url: string;
};

export type MockGalleryItem = {
  id: string;
  album: "Photography" | "Travel" | "Wedding" | "Projects";
  title: string;
  location: string;
  image: string;
};

export type FeatureSection = {
  title: DashboardSectionKey;
  description: string;
  items: string[];
};

export const osNavigation: DashboardNavItem[] = [
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

export const mockTasks: MockTask[] = [
  {
    id: "task-001",
    title: "Review calendar and pick top three priorities",
    priority: "High",
    status: "Today",
    dueDate: "Today",
    area: "Today"
  },
  {
    id: "task-002",
    title: "Collect appliance warranty PDFs",
    priority: "Medium",
    status: "Next",
    dueDate: "Friday",
    area: "Home"
  },
  {
    id: "task-003",
    title: "Update travel packing checklist",
    priority: "Medium",
    status: "Next",
    dueDate: "This weekend",
    area: "Travel"
  },
  {
    id: "task-004",
    title: "Organize work presentation templates",
    priority: "Low",
    status: "Waiting",
    dueDate: "Next week",
    area: "Work"
  }
];

export const mockNotes: MockNote[] = [
  {
    id: "note-001",
    title: "Weekly reset notes",
    summary: "A short checklist for reviewing calendar, tasks, documents, and errands.",
    tags: ["Planning", "Today"],
    updatedAt: "Today"
  },
  {
    id: "note-002",
    title: "Clinical trial resource ideas",
    summary: "Links, prompts, and references for organizing clinical trial material.",
    tags: ["Work", "Research"],
    updatedAt: "Yesterday"
  },
  {
    id: "note-003",
    title: "Photography locations shortlist",
    summary: "Places worth shooting at sunrise, blue hour, or while traveling.",
    tags: ["Photography", "Travel"],
    updatedAt: "This week"
  }
];

export const mockTrips: MockTrip[] = [
  {
    id: "trip-001",
    destination: "Dallas weekend",
    dates: "Upcoming",
    status: "Planning",
    detail: "Hotel, dinner, parking, and a light packing list."
  },
  {
    id: "trip-002",
    destination: "Future beach trip",
    dates: "TBD",
    status: "Inspiration",
    detail: "Flight watchlist, lodging ideas, and photography locations."
  }
];

export const mockDocuments: MockDocument[] = [
  { id: "doc-001", title: "Resume PDF", category: "Career", type: "PDF", updatedAt: "Ready to upload" },
  { id: "doc-002", title: "Insurance policies", category: "Finance", type: "Folder", updatedAt: "Mock data" },
  { id: "doc-003", title: "Home warranty folder", category: "Home", type: "Folder", updatedAt: "Mock data" },
  { id: "doc-004", title: "Travel confirmations", category: "Travel", type: "Folder", updatedAt: "Mock data" }
];

export const mockProjects: MockProject[] = [
  {
    id: "project-001",
    title: "Organize home documents",
    area: "Home",
    status: "In progress",
    nextStep: "Upload insurance, tax, and warranty files to the document vault."
  },
  {
    id: "project-002",
    title: "Create appliance manual library",
    area: "Home",
    status: "Backlog",
    nextStep: "Add model numbers and manual PDFs."
  },
  {
    id: "project-003",
    title: "Build clinical trial resource hub",
    area: "Work",
    status: "Planning",
    nextStep: "Group bookmarks, prompts, and training notes."
  }
];

export const mockBookmarks: MockBookmark[] = [
  { id: "bookmark-001", title: "Cloudflare dashboard", category: "Work", url: "https://dash.cloudflare.com" },
  { id: "bookmark-002", title: "Mortgage portal", category: "Finance", url: "#" },
  { id: "bookmark-003", title: "Recipe notebook", category: "Knowledge Library", url: "#" }
];

export const mockGalleryItems: MockGalleryItem[] = [
  {
    id: "gallery-001",
    album: "Photography",
    title: "Portfolio selects",
    location: "Favorite frames",
    image: "/images/hero-workspace.png"
  },
  {
    id: "gallery-002",
    album: "Travel",
    title: "Travel album",
    location: "Trips and places",
    image: "/images/hero-workspace.png"
  },
  {
    id: "gallery-003",
    album: "Wedding",
    title: "Wedding moments",
    location: "Private placeholders",
    image: "/images/hero-workspace.png"
  },
  {
    id: "gallery-004",
    album: "Projects",
    title: "Project visuals",
    location: "Work in progress",
    image: "/images/hero-workspace.png"
  }
];

export const featureSections: FeatureSection[] = [
  {
    title: "Notes",
    description: "A private notebook for plans, references, ideas, and running logs.",
    items: ["Note cards", "Tags", "Recent notes", "Empty state", "Future AI categorization"]
  },
  {
    title: "Tasks",
    description: "A practical task list with priority, due dates, and status.",
    items: ["Task list", "Priority", "Due date", "Status", "Today top three"]
  },
  {
    title: "Calendar",
    description: "A planning surface for upcoming events and future calendar integrations.",
    items: ["Calendar preview", "Upcoming events", "Apple or Google Calendar integration placeholder"]
  },
  {
    title: "Documents",
    description: "A file vault interface prepared for Cloudflare R2 document storage.",
    items: ["Upload document placeholder", "Document list", "Categories", "Download and delete placeholders"]
  },
  {
    title: "Home",
    description: "The operating center for property, maintenance, and house documents.",
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
    description: "A focused area for current projects, clinical resources, and templates.",
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
    description: "Trip planning, reservations, packing, and travel inspiration.",
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
    description: "A private workspace for portfolio planning, gear, and locations.",
    items: ["Portfolio placeholder", "Camera gear", "Editing workflow", "Shooting locations", "Favorite photos"]
  },
  {
    title: "Wedding",
    description: "A private planning hub for timeline, vendors, guests, and documents.",
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
    description: "A private index for recurring financial documents and important links.",
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
    description: "A searchable library for notes, bookmarks, ideas, quotes, and conversations.",
    items: ["Notes", "Bookmarks", "Articles", "Recipes", "Ideas", "Quotes", "AI conversations"]
  },
  {
    title: "Settings",
    description: "Preferences and future integration controls.",
    items: ["Profile placeholder", "Theme placeholder", "Dashboard preferences", "Future integrations"]
  }
];
