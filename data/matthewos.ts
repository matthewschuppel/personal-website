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
  Repeat2,
  Settings,
  Sun
} from "lucide-react";

export type DashboardSectionKey =
  | "Today"
  | "Notes"
  | "Tasks"
  | "Habits"
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

export type MockHabitFrequency = "Daily" | "Weekdays" | "3x/week" | "2x/week" | "Weekly";

export type MockHabit = {
  id: string;
  title: string;
  frequency: MockHabitFrequency;
  completions: string[];
  color: "moss" | "clay" | "amber" | "ink";
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
  owner: string;
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
  description: string;
};

export type MockEvent = {
  id: string;
  title: string;
  time: string;
  calendar: "Personal" | "Work" | "Home" | "Wedding";
};

export type MockResource = {
  id: string;
  title: string;
  detail: string;
  status: string;
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
  { label: "Habits", icon: Repeat2 },
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
  "Add Habit",
  "Upload Document",
  "Add Trip",
  "Add Home Project",
  "Add Bookmark"
];

function monthDate(day: number) {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export const mockEvents: MockEvent[] = [
  { id: "event-001", title: "Morning planning block", time: "8:30 AM", calendar: "Personal" },
  { id: "event-002", title: "Project follow-up window", time: "1:00 PM", calendar: "Work" },
  { id: "event-003", title: "Home maintenance review", time: "5:30 PM", calendar: "Home" },
  { id: "event-004", title: "Wedding vendor comparison", time: "Sunday", calendar: "Wedding" }
];

export const mockHabits: MockHabit[] = [
  {
    id: "habit-001",
    title: "Morning movement",
    frequency: "Daily",
    completions: [1, 2, 3, 5].map(monthDate),
    color: "moss"
  },
  {
    id: "habit-002",
    title: "Read for 20 minutes",
    frequency: "3x/week",
    completions: [1, 4].map(monthDate),
    color: "clay"
  },
  {
    id: "habit-003",
    title: "Strength training",
    frequency: "2x/week",
    completions: [2].map(monthDate),
    color: "amber"
  },
  {
    id: "habit-004",
    title: "Weekly reset",
    frequency: "Weekly",
    completions: [5].map(monthDate),
    color: "ink"
  }
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
    status: "Today",
    dueDate: "Today",
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
  },
  {
    id: "task-005",
    title: "Add mortgage and insurance links",
    priority: "Medium",
    status: "Next",
    dueDate: "Friday",
    area: "Finance"
  },
  {
    id: "task-006",
    title: "Choose favorite gallery cover photos",
    priority: "Low",
    status: "Next",
    dueDate: "Later",
    area: "Photography"
  }
];

export const mockNotes: MockNote[] = [
  {
    id: "note-001",
    title: "Weekly reset notes",
    summary: "Review calendar, tasks, documents, errands, and anything that needs a decision.",
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
  },
  {
    id: "note-004",
    title: "Home annual maintenance rhythm",
    summary: "Quarterly filters, annual inspection items, seasonal outdoor reminders.",
    tags: ["Home", "Maintenance"],
    updatedAt: "This month"
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
  },
  {
    id: "trip-003",
    destination: "Wedding guest travel",
    dates: "TBD",
    status: "Research",
    detail: "Room blocks, airport notes, rental car considerations, and guest FAQ."
  }
];

export const mockDocuments: MockDocument[] = [
  { id: "doc-001", title: "Resume PDF", category: "Career", type: "PDF", updatedAt: "Ready to upload", owner: "Matthew" },
  { id: "doc-002", title: "Insurance policies", category: "Finance", type: "Folder", updatedAt: "Mock data", owner: "Matthew" },
  { id: "doc-003", title: "Home warranty folder", category: "Home", type: "Folder", updatedAt: "Mock data", owner: "Matthew" },
  { id: "doc-004", title: "Travel confirmations", category: "Travel", type: "Folder", updatedAt: "Mock data", owner: "Matthew" },
  { id: "doc-005", title: "Wedding vendor contracts", category: "Wedding", type: "Folder", updatedAt: "Mock data", owner: "Matthew" },
  { id: "doc-006", title: "Training certificates", category: "Work", type: "PDF", updatedAt: "Mock data", owner: "Matthew" }
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
  },
  {
    id: "project-004",
    title: "Wedding planning command center",
    area: "Wedding",
    status: "Active",
    nextStep: "Confirm vendor contact list and guest travel notes."
  }
];

export const mockBookmarks: MockBookmark[] = [
  {
    id: "bookmark-001",
    title: "Cloudflare dashboard",
    category: "Work",
    url: "https://dash.cloudflare.com",
    description: "Deployment, DNS, D1, R2, and Access controls."
  },
  {
    id: "bookmark-002",
    title: "Mortgage portal",
    category: "Finance",
    url: "#",
    description: "Payment, escrow, and tax document reference."
  },
  {
    id: "bookmark-003",
    title: "Recipe notebook",
    category: "Knowledge Library",
    url: "#",
    description: "Saved recipes, meal ideas, and favorite notes."
  },
  {
    id: "bookmark-004",
    title: "Photo editing workflow",
    category: "Photography",
    url: "#",
    description: "Export settings, presets, and location notes."
  }
];

export const homeResources: MockResource[] = [
  { id: "home-001", title: "HVAC filter schedule", detail: "Replace filters quarterly and log dates.", status: "Next check: August" },
  { id: "home-002", title: "Appliance manuals", detail: "Washer, dryer, dishwasher, fridge, and HVAC references.", status: "Collecting PDFs" },
  { id: "home-003", title: "Property tax documents", detail: "Annual statements and exemption reminders.", status: "Folder ready" },
  { id: "home-004", title: "Insurance links", detail: "Home, auto, and personal policy portals.", status: "Bookmark list" }
];

export const workResources: MockResource[] = [
  { id: "work-001", title: "Clinical trial resource hub", detail: "Study notes, training references, and useful templates.", status: "Planning" },
  { id: "work-002", title: "AI prompt library", detail: "Reusable prompts for summaries, outlines, and documentation.", status: "Active" },
  { id: "work-003", title: "Presentation templates", detail: "Slide structures, talking points, and visual standards.", status: "Drafting" },
  { id: "work-004", title: "Meeting notes", detail: "Weekly project notes and follow-up actions.", status: "Ongoing" }
];

export const photographyResources: MockResource[] = [
  { id: "photo-001", title: "Camera gear", detail: "Bodies, lenses, bags, batteries, and accessories.", status: "Inventory" },
  { id: "photo-002", title: "Editing workflow", detail: "Import, select, color, export, archive.", status: "Draft" },
  { id: "photo-003", title: "Shooting locations", detail: "Dallas spots, travel scenes, and favorite light.", status: "Growing list" },
  { id: "photo-004", title: "Favorite photos", detail: "Shortlist for future public gallery albums.", status: "Needs review" }
];

export const weddingResources: MockResource[] = [
  { id: "wedding-001", title: "Wedding timeline", detail: "Major decisions, deadlines, and month-by-month reminders.", status: "Active" },
  { id: "wedding-002", title: "Vendor contacts", detail: "Planner, venue, photo, video, floral, music, and lodging.", status: "Collecting" },
  { id: "wedding-003", title: "Guest information", detail: "Guest list notes, travel details, and communication items.", status: "Draft" },
  { id: "wedding-004", title: "Photo gallery placeholder", detail: "Future private wedding album storage in R2.", status: "Placeholder" }
];

export const financeResources: MockResource[] = [
  { id: "finance-001", title: "Monthly budget links", detail: "Budget sheet, recurring bills, and review notes.", status: "Monthly" },
  { id: "finance-002", title: "Tax documents", detail: "W-2s, deductions, property tax, and filing checklist.", status: "Annual" },
  { id: "finance-003", title: "Mortgage information", detail: "Portal, payment notes, escrow, and statements.", status: "Reference" },
  { id: "finance-004", title: "Investment links", detail: "Account portals and long-term planning references.", status: "Reference" }
];

export const knowledgeResources: MockResource[] = [
  { id: "knowledge-001", title: "Articles", detail: "Saved reading with tags and summaries.", status: "Library" },
  { id: "knowledge-002", title: "Recipes", detail: "Meals, favorites, and notes for future repeats.", status: "Library" },
  { id: "knowledge-003", title: "Ideas", detail: "Loose concepts, project sparks, and personal systems thoughts.", status: "Inbox" },
  { id: "knowledge-004", title: "AI conversations", detail: "Useful outputs, prompts, and decisions to preserve.", status: "Archive" }
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
    title: "Habits",
    description: "A monthly habit tracker for commitments, check-ins, streaks, and progress.",
    items: ["Habit creation", "Frequency target", "Monthly grid", "Progress percentage", "Streak preview"]
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
