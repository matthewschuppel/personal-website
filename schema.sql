CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  tags TEXT DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  notes TEXT,
  priority TEXT NOT NULL DEFAULT 'Medium',
  status TEXT NOT NULL DEFAULT 'Today',
  due_date TEXT,
  area TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'Daily',
  color TEXT NOT NULL DEFAULT 'moss',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS habit_checkins (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL,
  completed_on TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(habit_id, completed_on),
  FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  r2_key TEXT NOT NULL,
  content_type TEXT,
  size_bytes INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  destination TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  status TEXT,
  itinerary_notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dashboard_resources (
  id TEXT PRIMARY KEY,
  section TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT,
  status TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dashboard_projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  area TEXT NOT NULL,
  status TEXT,
  next_step TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dashboard_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS home_projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT,
  next_step TEXT,
  due_date TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS work_projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT,
  notes TEXT,
  next_step TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gallery_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  album TEXT NOT NULL,
  location TEXT,
  r2_key TEXT,
  alt_text TEXT,
  is_public INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS westwall_devices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  api_key_hash TEXT,
  status TEXT NOT NULL DEFAULT 'offline',
  last_check_in TEXT,
  active_screen TEXT,
  brightness INTEGER NOT NULL DEFAULT 64,
  wifi_rssi INTEGER,
  firmware_version TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS westwall_settings (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  global_brightness INTEGER NOT NULL DEFAULT 64,
  auto_brightness INTEGER NOT NULL DEFAULT 1,
  day_brightness INTEGER NOT NULL DEFAULT 80,
  night_brightness INTEGER NOT NULL DEFAULT 20,
  sleep_start TEXT NOT NULL DEFAULT '23:00',
  sleep_end TEXT NOT NULL DEFAULT '06:30',
  color_theme TEXT NOT NULL DEFAULT 'Amber',
  font_size TEXT NOT NULL DEFAULT 'Medium',
  scroll_speed INTEGER NOT NULL DEFAULT 40,
  animation_style TEXT NOT NULL DEFAULT 'Ticker',
  show_icons INTEGER NOT NULL DEFAULT 1,
  dot_matrix_preview INTEGER NOT NULL DEFAULT 1,
  units TEXT NOT NULL DEFAULT 'imperial',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES westwall_devices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS westwall_rotation_screens (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  screen_key TEXT NOT NULL,
  label TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  duration_seconds INTEGER NOT NULL DEFAULT 15,
  priority INTEGER NOT NULL DEFAULT 1,
  preview TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES westwall_devices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS westwall_upcoming_flights (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  airline TEXT NOT NULL,
  flight_number TEXT NOT NULL,
  departure_airport TEXT NOT NULL,
  arrival_airport TEXT NOT NULL,
  departure_time TEXT,
  arrival_time TEXT,
  gate TEXT,
  terminal TEXT,
  status TEXT,
  seat TEXT,
  confirmation TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES westwall_devices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS westwall_saved_locations (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  name TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  radius_miles INTEGER NOT NULL DEFAULT 25,
  altitude_filter TEXT,
  airline_filter TEXT,
  aircraft_type_filter TEXT,
  refresh_interval_seconds INTEGER NOT NULL DEFAULT 60,
  data_source TEXT NOT NULL DEFAULT 'OpenSky',
  is_default INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES westwall_devices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS westwall_stock_tickers (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  label TEXT,
  enabled INTEGER NOT NULL DEFAULT 1,
  asset_type TEXT NOT NULL DEFAULT 'Stock',
  show_price INTEGER NOT NULL DEFAULT 1,
  show_change INTEGER NOT NULL DEFAULT 1,
  show_percent_change INTEGER NOT NULL DEFAULT 1,
  show_trend_arrow INTEGER NOT NULL DEFAULT 1,
  refresh_interval_seconds INTEGER NOT NULL DEFAULT 120,
  priority INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES westwall_devices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS westwall_weather_locations (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  name TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES westwall_devices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS westwall_command_logs (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  command TEXT NOT NULL,
  payload TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES westwall_devices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS westwall_custom_messages (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  starts_at TEXT,
  ends_at TEXT,
  priority INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES westwall_devices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS westwall_device_checkins (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  firmware_version TEXT,
  wifi_rssi INTEGER,
  uptime_seconds INTEGER,
  free_memory_bytes INTEGER,
  current_screen TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES westwall_devices(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dashboard_calendar_drafts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  starts_at TEXT,
  ends_at TEXT,
  notes TEXT,
  source_item_type TEXT,
  source_item_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dashboard_unified_items (
  id TEXT PRIMARY KEY,
  item_type TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT,
  section TEXT,
  tags TEXT DEFAULT '[]',
  status TEXT,
  due_at TEXT,
  source_table TEXT,
  source_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_habit_checkins_habit_id ON habit_checkins(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_checkins_completed_on ON habit_checkins(completed_on);
CREATE INDEX IF NOT EXISTS idx_dashboard_resources_section ON dashboard_resources(section);
CREATE INDEX IF NOT EXISTS idx_dashboard_projects_area ON dashboard_projects(area);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_bookmarks_category ON bookmarks(category);
CREATE INDEX IF NOT EXISTS idx_gallery_items_album ON gallery_items(album);
CREATE INDEX IF NOT EXISTS idx_westwall_devices_slug ON westwall_devices(slug);
CREATE INDEX IF NOT EXISTS idx_westwall_rotation_device ON westwall_rotation_screens(device_id);
CREATE INDEX IF NOT EXISTS idx_westwall_flights_device ON westwall_upcoming_flights(device_id);
CREATE INDEX IF NOT EXISTS idx_westwall_commands_device ON westwall_command_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_westwall_checkins_device ON westwall_device_checkins(device_id);
CREATE INDEX IF NOT EXISTS idx_westwall_messages_device ON westwall_custom_messages(device_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_calendar_status ON dashboard_calendar_drafts(status);
CREATE INDEX IF NOT EXISTS idx_dashboard_unified_items_type ON dashboard_unified_items(item_type);
