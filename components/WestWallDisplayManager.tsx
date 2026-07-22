"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity,
  Plane,
  CalendarSync,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CirclePower,
  CloudSun,
  LayoutGrid,
  MessageSquareText,
  Moon,
  Plus,
  RefreshCw,
  Settings2,
  Signal,
  Sun,
  TestTube2,
  Trash2,
  Tv,
  Wifi
} from "lucide-react";
import {
  mockWestWallData,
  type WestWallAppearanceSettings,
  type WestWallDashboardData,
  type WestWallRotationScreen
} from "@/data/westwall";

const tabs = ["Overview", "Screens", "Flights", "Messages", "Data sources", "Settings"] as const;
type Tab = (typeof tabs)[number];
type CalendarSyncState = { configured: boolean; scannedEvents: number; matchedFlights: number; syncedAt: string };

const fieldClass = "min-h-11 rounded-xl border border-ink/10 bg-white px-3 text-sm outline-none transition focus:border-clay focus:ring-4 focus:ring-clay/10";
const secondaryButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-ink/10 bg-white px-4 text-sm font-semibold text-ink/70 transition hover:border-ink/20 hover:bg-mist disabled:cursor-not-allowed disabled:opacity-50";
const primaryButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-paper transition hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-50";

function Card({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-white/90 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
          {description ? <p className="mt-1 text-sm leading-6 text-ink/55">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Stat({ icon, label, value, tone = "neutral" }: { icon: ReactNode; label: string; value: string; tone?: "good" | "neutral" }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white/85 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">{icon}{label}</div>
      <p className={`mt-2 text-lg font-semibold ${tone === "good" ? "text-moss" : "text-ink"}`}>{value}</p>
    </div>
  );
}

function MatrixPreview({ heading, lines }: { heading: string; lines: string[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#090b0c] p-4 shadow-[0_18px_45px_rgba(18,20,18,0.22)]">
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
        <span>Live display preview</span><span>128 × 64</span>
      </div>
      <div className="mt-4 rounded-xl border border-amber/20 bg-black px-5 py-4 font-mono uppercase shadow-inner">
        <p className="truncate text-[11px] tracking-[0.18em] text-yellow-300">{heading}</p>
        <div className="mt-3 space-y-2 text-sm tracking-[0.08em] text-white">
          {[0, 1, 2].map((index) => <p key={index} className="h-5 truncate">{lines[index] ?? ""}</p>)}
        </div>
        <div className="mt-3 flex gap-1">{Array.from({ length: 24 }, (_, index) => <span key={index} className={`h-1 flex-1 rounded-full ${index % 4 === 0 ? "bg-yellow-300/80" : "bg-white/10"}`} />)}</div>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return "Time TBD";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

function humanize(value: string) {
  return value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function WestWallDisplayManager() {
  const [data, setData] = useState<WestWallDashboardData>(mockWestWallData);
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [calendarSync, setCalendarSync] = useState<CalendarSyncState | null>(null);
  const [notice, setNotice] = useState("Connecting to WestWall…");
  const [busy, setBusy] = useState(false);

  const loadWestWall = useCallback(async ({ quiet = false }: { quiet?: boolean } = {}) => {
    if (!quiet) setBusy(true);
    try {
      const response = await fetch("/api/westwall/dashboard", { cache: "no-store" });
      const body = await response.json() as { westwall?: WestWallDashboardData; calendarSync?: CalendarSyncState | null; calendarError?: string; error?: string };
      if (!response.ok || !body.westwall) throw new Error(body.error || "WestWall could not be loaded.");
      setData(body.westwall);
      setCalendarSync(body.calendarSync ?? null);
      if (!quiet) setNotice(body.calendarError || "WestWall is up to date.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "WestWall could not be loaded.");
    } finally {
      if (!quiet) setBusy(false);
    }
  }, []);

  useEffect(() => {
    void loadWestWall();
    const timer = window.setInterval(() => void loadWestWall({ quiet: true }), 60_000);
    return () => window.clearInterval(timer);
  }, [loadWestWall]);

  const orderedScreens = useMemo(() => [...data.rotation].sort((a, b) => a.priority - b.priority), [data.rotation]);
  const activeMessage = useMemo(() => data.messages.filter((message) => message.enabled).sort((a, b) => a.priority - b.priority)[0], [data.messages]);
  const previewScreen = orderedScreens.find((screen) => screen.enabled) ?? orderedScreens[0];
  const previewLines = activeMessage
    ? [activeMessage.message, "Scheduled message", "Priority " + activeMessage.priority]
    : [previewScreen?.preview || "WestWall Ready", data.stocks.filter((stock) => stock.enabled).map((stock) => stock.symbol).join("  "), data.weatherLocations.find((location) => location.isDefault)?.name || "Dallas, TX"];

  async function request(path: string, init?: RequestInit, success = "Saved.") {
    setBusy(true);
    try {
      const response = await fetch(path, init);
      const body = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(body.error || "The change could not be saved.");
      setNotice(success);
      await loadWestWall({ quiet: true });
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The change could not be saved.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function sendCommand(command: string) {
    await request("/api/westwall/command", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ command }) }, `${humanize(command)} command sent.`);
  }

  async function saveRotation(rotation: WestWallRotationScreen[]) {
    setData((current) => ({ ...current, rotation }));
    await request("/api/westwall/rotation", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rotation }) }, "Screen playlist saved.");
  }

  function moveScreen(id: string, direction: -1 | 1) {
    const next = [...orderedScreens];
    const index = next.findIndex((screen) => screen.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    void saveRotation(next.map((screen, screenIndex) => ({ ...screen, priority: screenIndex + 1 })));
  }

  async function syncFlights() {
    setBusy(true);
    try {
      const response = await fetch("/api/westwall/flights/sync", { method: "POST" });
      const body = await response.json() as { sync?: CalendarSyncState; error?: string };
      if (!response.ok || !body.sync) throw new Error(body.error || "Calendar sync failed.");
      setCalendarSync(body.sync);
      setNotice(`Calendar checked: ${body.sync.matchedFlights} flight${body.sync.matchedFlights === 1 ? "" : "s"} found.`);
      await loadWestWall({ quiet: true });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Calendar sync failed.");
    } finally {
      setBusy(false);
    }
  }

  async function addFlight(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const saved = await request("/api/westwall/flights", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(values)) }, "Flight added to WestWall.");
    if (saved) form.reset();
  }

  async function addMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const saved = await request("/api/westwall/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...Object.fromEntries(values), enabled: values.get("enabled") === "on", priority: Number(values.get("priority") || 1) }) }, "Message scheduled.");
    if (saved) form.reset();
  }

  async function remove(kind: "flights" | "messages" | "stocks" | "weather-locations" | "locations", id: string, label: string) {
    if (!window.confirm(`Remove ${label}?`)) return;
    await request(`/api/westwall/${kind}/${encodeURIComponent(id)}`, { method: "DELETE" }, `${label} removed.`);
  }

  async function saveAppearance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const appearance: Partial<WestWallAppearanceSettings> = {
      globalBrightness: Number(values.get("globalBrightness") || 68),
      autoBrightness: values.get("autoBrightness") === "on",
      dayBrightness: Number(values.get("dayBrightness") || 80),
      nightBrightness: Number(values.get("nightBrightness") || 20),
      sleepStart: String(values.get("sleepStart") || "23:00"),
      sleepEnd: String(values.get("sleepEnd") || "06:30"),
      colorTheme: String(values.get("colorTheme") || "Amber") as WestWallAppearanceSettings["colorTheme"],
      fontSize: String(values.get("fontSize") || "Medium") as WestWallAppearanceSettings["fontSize"],
      scrollSpeed: data.appearance.scrollSpeed,
      animationStyle: data.appearance.animationStyle,
      showIcons: data.appearance.showIcons,
      dotMatrixPreview: true,
      units: String(values.get("units") || "imperial") as WestWallAppearanceSettings["units"]
    };
    await request("/api/westwall/appearance", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(appearance) }, "Display preferences saved.");
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-6 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="grid gap-5 rounded-3xl border border-ink/10 bg-white/90 p-5 shadow-crisp lg:grid-cols-[1fr_430px] lg:items-center lg:p-7">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${data.device.status === "online" ? "bg-moss/10 text-moss" : "bg-clay/10 text-clay"}`}>
                <span className={`h-2 w-2 rounded-full ${data.device.status === "online" ? "bg-moss" : "bg-clay"}`} />{data.device.status}
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/40">MatthewOS · WestWall</span>
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Your wall, at a glance.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60">Control what appears, arrange the screen playlist, and automatically turn calendar itineraries into flight cards.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" disabled={busy} onClick={() => void loadWestWall()} className={secondaryButton}><RefreshCw size={15} className={busy ? "animate-spin" : ""} />Refresh</button>
              <button type="button" disabled={busy} onClick={() => void sendCommand("wake")} className={primaryButton}><Sun size={15} />Wake display</button>
            </div>
          </div>
          <MatrixPreview heading={activeMessage?.title || previewScreen?.label || "WestWall"} lines={previewLines} />
        </header>

        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-sm text-ink/60" aria-live="polite">
          {data.device.status === "online" ? <CheckCircle2 size={16} className="shrink-0 text-moss" /> : <Activity size={16} className="shrink-0 text-clay" />}{notice}
        </div>

        <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={<Wifi size={15} />} label="Device" value={data.device.status === "online" ? "Online" : "Offline"} tone={data.device.status === "online" ? "good" : "neutral"} />
          <Stat icon={<Signal size={15} />} label="Wi-Fi" value={`${data.device.wifiRssi} dBm`} />
          <Stat icon={<Tv size={15} />} label="Now showing" value={humanize(data.device.activeScreen)} />
          <Stat icon={<Settings2 size={15} />} label="Firmware" value={data.device.firmwareVersion} />
        </section>

        <nav className="mt-5 flex gap-2 overflow-x-auto rounded-2xl border border-ink/10 bg-white/70 p-2" aria-label="WestWall sections">
          {tabs.map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${activeTab === tab ? "bg-ink text-paper shadow-sm" : "text-ink/55 hover:bg-white hover:text-ink"}`}>{tab}</button>)}
        </nav>

        {activeTab === "Overview" ? <section className="mt-5 grid gap-4 lg:grid-cols-2">
          <Card title="Quick controls" description="Commands are sent securely through your signed-in MatthewOS session.">
            <div className="grid gap-3 sm:grid-cols-2">
              <button disabled={busy} onClick={() => void sendCommand("refresh")} className={secondaryButton}><RefreshCw size={16} />Refresh content</button>
              <button disabled={busy} onClick={() => void sendCommand("test_pattern")} className={secondaryButton}><TestTube2 size={16} />Test colors</button>
              <button disabled={busy} onClick={() => void sendCommand("sleep")} className={secondaryButton}><Moon size={16} />Sleep display</button>
              <button disabled={busy} onClick={() => void sendCommand("reboot")} className={secondaryButton}><CirclePower size={16} />Restart device</button>
            </div>
          </Card>
          <Card title="At a glance" description="The most useful content currently feeding the display.">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-mist/60 p-4"><Plane size={18} className="text-clay" /><p className="mt-3 text-2xl font-semibold">{data.flights.length}</p><p className="text-xs text-ink/50">Upcoming flights</p></div>
              <div className="rounded-xl bg-mist/60 p-4"><LayoutGrid size={18} className="text-cobalt" /><p className="mt-3 text-2xl font-semibold">{data.rotation.filter((screen) => screen.enabled).length}</p><p className="text-xs text-ink/50">Enabled screens</p></div>
              <div className="rounded-xl bg-mist/60 p-4"><MessageSquareText size={18} className="text-moss" /><p className="mt-3 text-2xl font-semibold">{data.messages.filter((message) => message.enabled).length}</p><p className="text-xs text-ink/50">Active messages</p></div>
            </div>
          </Card>
          <Card title="Upcoming travel" description="Flights detected from Calendar and flights entered manually." action={<button onClick={() => setActiveTab("Flights")} className={secondaryButton}>Manage</button>}>
            <div className="space-y-3">{data.flights.slice(0, 3).map((flight) => <div key={flight.id} className="flex items-center justify-between gap-4 rounded-xl bg-mist/60 p-4"><div><p className="font-semibold">{flight.flightNumber} · {flight.departureAirport} → {flight.arrivalAirport}</p><p className="mt-1 text-sm text-ink/50">{formatDate(flight.departureTime)} · {flight.source === "calendar" ? "Calendar" : "Manual"}</p></div><Plane size={18} className="text-clay" /></div>)}{data.flights.length === 0 ? <p className="text-sm text-ink/50">No upcoming flights.</p> : null}</div>
          </Card>
          <Card title="Recent device activity" description="Latest heartbeat and command acknowledgements.">
            <div className="space-y-2 text-sm">{data.commands.slice(0, 4).map((command) => <div key={command.id} className="flex items-center justify-between rounded-xl bg-mist/60 px-4 py-3"><span>{humanize(command.command)}</span><span className="text-xs font-semibold text-ink/45">{command.status}</span></div>)}</div>
          </Card>
        </section> : null}

        {activeTab === "Screens" ? <Card title="Screen playlist" description="WestWall rotates through enabled screens in this order. Changes are sent to the sign automatically.">
          <div className="space-y-3">{orderedScreens.map((screen, index) => <div key={screen.id} className="grid gap-3 rounded-2xl border border-ink/10 bg-mist/40 p-4 lg:grid-cols-[1fr_130px_110px] lg:items-center">
            <label className="flex items-start gap-3"><input type="checkbox" className="mt-1" checked={screen.enabled} onChange={(event) => void saveRotation(orderedScreens.map((item) => item.id === screen.id ? { ...item, enabled: event.target.checked } : item))} /><span><span className="block font-semibold">{screen.label}</span><span className="mt-1 block text-sm text-ink/50">{screen.preview}</span></span></label>
            <label className="text-xs font-semibold text-ink/45">SECONDS<input type="number" min="5" max="300" value={screen.durationSeconds} onChange={(event) => setData((current) => ({ ...current, rotation: current.rotation.map((item) => item.id === screen.id ? { ...item, durationSeconds: Number(event.target.value) } : item) }))} onBlur={() => void saveRotation(data.rotation)} className={`${fieldClass} mt-1 w-full`} /></label>
            <div className="flex justify-end gap-2"><button disabled={index === 0 || busy} onClick={() => moveScreen(screen.id, -1)} className={secondaryButton} aria-label={`Move ${screen.label} up`}><ChevronUp size={16} /></button><button disabled={index === orderedScreens.length - 1 || busy} onClick={() => moveScreen(screen.id, 1)} className={secondaryButton} aria-label={`Move ${screen.label} down`}><ChevronDown size={16} /></button></div>
          </div>)}</div>
        </Card> : null}

        {activeTab === "Flights" ? <section className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card title="Calendar flight detection" description="MatthewOS scans the next 90 days of Apple Calendar and separates events containing a flight number and route." action={<button disabled={busy} onClick={() => void syncFlights()} className={primaryButton}><CalendarSync size={16} />Sync now</button>}>
            <div className="rounded-2xl bg-mist/60 p-4"><p className="font-semibold">{calendarSync?.configured ? "Apple Calendar connected" : "Calendar connection not detected"}</p><p className="mt-1 text-sm text-ink/55">{calendarSync ? `${calendarSync.scannedEvents} events checked · ${calendarSync.matchedFlights} flights found · ${formatDate(calendarSync.syncedAt)}` : "The manager syncs automatically whenever it opens."}</p></div>
            <div className="mt-4 space-y-3">{data.flights.map((flight) => <article key={flight.id} className="rounded-2xl border border-ink/10 p-4"><div className="flex items-start justify-between gap-4"><div><span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${flight.source === "calendar" ? "bg-cobalt/10 text-cobalt" : "bg-clay/10 text-clay"}`}>{flight.source}</span><h3 className="mt-3 text-lg font-semibold">{flight.flightNumber} · {flight.departureAirport} → {flight.arrivalAirport}</h3><p className="mt-1 text-sm text-ink/55">{formatDate(flight.departureTime)} · {flight.status}{flight.gate ? ` · Gate ${flight.gate}` : ""}</p></div><button onClick={() => void remove("flights", flight.id, flight.flightNumber)} className="rounded-lg p-2 text-ink/35 hover:bg-clay/10 hover:text-clay" aria-label={`Remove ${flight.flightNumber}`}><Trash2 size={16} /></button></div></article>)}{data.flights.length === 0 ? <p className="text-sm text-ink/50">No future flights found yet.</p> : null}</div>
          </Card>
          <Card title="Add a flight" description="Use this when an itinerary is not in your calendar.">
            <form onSubmit={addFlight} className="grid gap-3 sm:grid-cols-2">
              <input required name="flightNumber" placeholder="Flight number · AA 123" className={fieldClass} /><input name="airline" placeholder="Airline" className={fieldClass} />
              <input required name="departureAirport" placeholder="From · DFW" className={fieldClass} /><input required name="arrivalAirport" placeholder="To · LAX" className={fieldClass} />
              <label className="text-xs font-semibold text-ink/45">DEPARTURE<input name="departureTime" type="datetime-local" className={`${fieldClass} mt-1 w-full`} /></label><label className="text-xs font-semibold text-ink/45">ARRIVAL<input name="arrivalTime" type="datetime-local" className={`${fieldClass} mt-1 w-full`} /></label>
              <input name="gate" placeholder="Gate" className={fieldClass} /><input name="seat" placeholder="Seat" className={fieldClass} /><input name="status" placeholder="Status" defaultValue="Scheduled" className={fieldClass} /><input name="confirmation" placeholder="Confirmation" className={fieldClass} />
              <button disabled={busy} type="submit" className={`${primaryButton} sm:col-span-2`}><Plus size={16} />Add flight</button>
            </form>
          </Card>
        </section> : null}

        {activeTab === "Messages" ? <section className="mt-5 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <Card title="Schedule a message" description="An active message temporarily takes priority over the normal screen playlist.">
            <form onSubmit={addMessage} className="grid gap-3"><input required name="title" placeholder="Message title" className={fieldClass} /><textarea required name="message" placeholder="What should WestWall say?" className={`${fieldClass} min-h-28 py-3`} /><div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold text-ink/45">STARTS<input name="startsAt" type="datetime-local" className={`${fieldClass} mt-1 w-full`} /></label><label className="text-xs font-semibold text-ink/45">ENDS<input name="endsAt" type="datetime-local" className={`${fieldClass} mt-1 w-full`} /></label></div><div className="flex items-center justify-between"><label className="flex items-center gap-2 text-sm"><input name="enabled" type="checkbox" defaultChecked />Active</label><input name="priority" type="number" min="1" defaultValue="1" className={`${fieldClass} w-24`} /></div><button disabled={busy} className={primaryButton}><Plus size={16} />Schedule message</button></form>
          </Card>
          <Card title="Message queue" description="Enable, pause, or remove scheduled messages.">
            <div className="space-y-3">{data.messages.map((message) => <article key={message.id} className="rounded-2xl border border-ink/10 p-4"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold">{message.title}</p><p className="mt-1 text-sm text-ink/60">{message.message}</p><p className="mt-2 text-xs text-ink/40">{message.startsAt ? formatDate(message.startsAt) : "Starts now"} · {message.endsAt ? `Ends ${formatDate(message.endsAt)}` : "No end date"}</p></div><button onClick={() => void remove("messages", message.id, message.title)} className="rounded-lg p-2 text-ink/35 hover:bg-clay/10 hover:text-clay"><Trash2 size={16} /></button></div><button disabled={busy} onClick={() => void request(`/api/westwall/messages/${encodeURIComponent(message.id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: !message.enabled }) }, message.enabled ? "Message paused." : "Message activated.")} className={`${secondaryButton} mt-3`}>{message.enabled ? "Pause" : "Activate"}</button></article>)}{data.messages.length === 0 ? <p className="text-sm text-ink/50">No scheduled messages.</p> : null}</div>
          </Card>
        </section> : null}

        {activeTab === "Data sources" ? <section className="mt-5 grid gap-4 lg:grid-cols-2">
          <Card title="Market symbols" description="Symbols appear on the Stocks screen in priority order.">
            <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const values = new FormData(form); const saved = await request("/api/westwall/stocks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(values)) }, "Ticker added."); if (saved) form.reset(); }} className="flex gap-2"><input required name="symbol" placeholder="AAPL" className={`${fieldClass} flex-1`} /><input name="label" placeholder="Apple" className={`${fieldClass} flex-1`} /><input type="hidden" name="assetType" value="Stock" /><button className={primaryButton}><Plus size={16} /></button></form>
            <div className="mt-4 flex flex-wrap gap-2">{data.stocks.map((stock) => <span key={stock.id} className="inline-flex items-center gap-2 rounded-full bg-mist px-3 py-2 text-sm font-semibold">{stock.symbol}<button onClick={() => void remove("stocks", stock.id, stock.symbol)} className="text-ink/30 hover:text-clay"><Trash2 size={13} /></button></span>)}</div>
          </Card>
          <Card title="Weather locations" description="The default location is used by the Weather screen.">
            <form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const values = new FormData(form); const saved = await request("/api/westwall/weather-locations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: values.get("name"), latitude: Number(values.get("latitude")), longitude: Number(values.get("longitude")), isDefault: true }) }, "Weather location added."); if (saved) form.reset(); }} className="grid gap-2 sm:grid-cols-[1fr_120px_120px_auto]"><input required name="name" placeholder="Dallas, TX" className={fieldClass} /><input required name="latitude" type="number" step="any" placeholder="Latitude" className={fieldClass} /><input required name="longitude" type="number" step="any" placeholder="Longitude" className={fieldClass} /><button className={primaryButton}><Plus size={16} /></button></form>
            <div className="mt-4 space-y-2">{data.weatherLocations.map((location) => <div key={location.id} className="flex items-center justify-between rounded-xl bg-mist/60 px-4 py-3"><span className="flex items-center gap-2"><CloudSun size={16} />{location.name}{location.isDefault ? <small className="text-moss">Default</small> : null}</span><button onClick={() => void remove("weather-locations", location.id, location.name)} className="text-ink/30 hover:text-clay"><Trash2 size={15} /></button></div>)}</div>
          </Card>
          <Card title="Calendar" description="Apple Calendar is the source for event previews and automatic flight detection."><div className="rounded-xl bg-mist/60 p-4"><p className="font-semibold">{calendarSync?.configured ? "Connected" : "Not configured"}</p><p className="mt-1 text-sm text-ink/50">Automatic sync runs when this manager opens. Use Flights → Sync now to force a fresh calendar fetch.</p></div></Card>
          <Card title="Aircraft location" description="Saved coordinates define the center point for future nearby-aircraft data."><div className="space-y-2">{data.locations.map((location) => <div key={location.id} className="flex items-center justify-between rounded-xl bg-mist/60 px-4 py-3"><span><strong>{location.name}</strong><small className="ml-2 text-ink/45">{location.radiusMiles} mi</small></span><button onClick={() => void remove("locations", location.id, location.name)} className="text-ink/30 hover:text-clay"><Trash2 size={15} /></button></div>)}</div></Card>
        </section> : null}

        {activeTab === "Settings" ? <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <Card title="Display preferences" description="Saved centrally so future firmware updates use the same profile."><form onSubmit={saveAppearance} className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-ink/45">BRIGHTNESS<input name="globalBrightness" type="range" min="1" max="100" defaultValue={data.appearance.globalBrightness} className="mt-3 w-full" /></label><label className="text-xs font-semibold text-ink/45">COLOR THEME<select name="colorTheme" defaultValue={data.appearance.colorTheme} className={`${fieldClass} mt-1 w-full`}><option>Amber</option><option>Cyan</option><option>White</option><option>Classic RGB</option></select></label><label className="text-xs font-semibold text-ink/45">SLEEP AT<input name="sleepStart" type="time" defaultValue={data.appearance.sleepStart} className={`${fieldClass} mt-1 w-full`} /></label><label className="text-xs font-semibold text-ink/45">WAKE AT<input name="sleepEnd" type="time" defaultValue={data.appearance.sleepEnd} className={`${fieldClass} mt-1 w-full`} /></label><label className="text-xs font-semibold text-ink/45">DAY LEVEL<input name="dayBrightness" type="number" min="1" max="100" defaultValue={data.appearance.dayBrightness} className={`${fieldClass} mt-1 w-full`} /></label><label className="text-xs font-semibold text-ink/45">NIGHT LEVEL<input name="nightBrightness" type="number" min="1" max="100" defaultValue={data.appearance.nightBrightness} className={`${fieldClass} mt-1 w-full`} /></label><label className="flex items-center gap-2 text-sm"><input name="autoBrightness" type="checkbox" defaultChecked={data.appearance.autoBrightness} />Automatic day/night profile</label><label className="text-xs font-semibold text-ink/45">UNITS<select name="units" defaultValue={data.appearance.units} className={`${fieldClass} mt-1 w-full`}><option value="imperial">Imperial</option><option value="metric">Metric</option></select></label><input type="hidden" name="fontSize" value={data.appearance.fontSize} /><button disabled={busy} className={`${primaryButton} sm:col-span-2`}>Save preferences</button></form></Card>
          <Card title="Device details" description="Live telemetry from the physical Matrix Portal."><dl className="space-y-3 text-sm">{[["Name", data.device.name], ["Status", data.device.status], ["Active screen", humanize(data.device.activeScreen)], ["Last check-in", formatDate(data.device.lastCheckIn)], ["Wi-Fi", `${data.device.wifiRssi} dBm`], ["Firmware", data.device.firmwareVersion]].map(([term, value]) => <div key={term} className="flex justify-between gap-4 border-b border-ink/5 pb-3"><dt className="text-ink/45">{term}</dt><dd className="text-right font-semibold">{value}</dd></div>)}</dl></Card>
        </section> : null}
      </div>
    </main>
  );
}
