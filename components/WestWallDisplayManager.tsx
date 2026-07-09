"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  CirclePower,
  KeyRound,
  Plus,
  RefreshCw,
  RotateCw,
  Settings2,
  Signal,
  Sparkles,
  Sun,
  TestTube2,
  Tv,
  Wifi
} from "lucide-react";
import {
  mockWestWallData,
  type WestWallAppearanceSettings,
  type WestWallDashboardData,
  type WestWallRotationScreen
} from "@/data/westwall";

const extendedTabs = ["Overview", "Rotation", "Messages", "Flights", "Stocks", "Weather", "Locations", "Appearance", "Device Settings", "Firmware", "Logs"] as const;

function Panel({ title, eyebrow, children }: { title: string; eyebrow?: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white/82 p-4 shadow-sm">
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay">{eyebrow}</p> : null}
      <h2 className="mt-1 text-lg font-semibold tracking-tight text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-mist/50 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">{label}</p>
        <span className="text-ink/45">{icon}</span>
      </div>
      <p className="mt-2 text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function MatrixPreview({ lines, amber = true }: { lines: string[]; amber?: boolean }) {
  const text = lines.filter(Boolean).join("   ").slice(0, 96) || "WESTWALL READY";
  const dots = Array.from({ length: 32 * 16 }, (_, index) => {
    const active = index % 7 === 0 || text.charCodeAt(index % text.length) % 5 === 0;
    return active;
  });

  return (
    <div className="rounded-lg border border-ink/10 bg-ink p-4 shadow-crisp">
      <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-paper/50">
        <span>128 x 64 Preview</span>
        <span>HUB75</span>
      </div>
      <div className="grid grid-cols-[repeat(32,minmax(0,1fr))] gap-[3px] rounded-md bg-black p-3" aria-label={text}>
        {dots.map((active, index) => (
          <span key={index} className={`aspect-square rounded-full ${active ? (amber ? "bg-amber shadow-[0_0_8px_rgba(212,154,61,0.9)]" : "bg-cobalt") : "bg-white/5"}`} />
        ))}
      </div>
      <div className="mt-3 overflow-hidden rounded-md bg-black px-3 py-2 font-mono text-sm uppercase tracking-[0.12em] text-amber">
        {text}
      </div>
    </div>
  );
}

function asNumber(value: FormDataEntryValue | null, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function WestWallDisplayManager() {
  const [data, setData] = useState<WestWallDashboardData>(mockWestWallData);
  const [activeTab, setActiveTab] = useState<(typeof extendedTabs)[number]>("Overview");
  const [activity, setActivity] = useState("Ready.");
  const [deviceToken, setDeviceToken] = useState("");

  async function loadWestWall() {
    try {
      const response = await fetch("/api/westwall/dashboard");
      const body = await response.json() as { westwall?: WestWallDashboardData };
      setData(body.westwall ?? mockWestWallData);
      setActivity("WestWall settings loaded from MatthewOS.");
    } catch {
      setActivity("Using mock WestWall data until the APIs are available.");
    }
  }

  useEffect(() => {
    const savedToken = window.localStorage.getItem("westwall-device-token") ?? "";
    setDeviceToken(savedToken);
    void loadWestWall();
  }, []);

  const previewLines = useMemo(() => {
    const enabled = data.rotation.filter((screen) => screen.enabled).sort((a, b) => a.priority - b.priority);
    const scheduled = data.messages.find((message) => message.enabled);
    return [scheduled?.message ?? enabled[0]?.preview ?? "WestWall Ready", data.stocks.filter((stock) => stock.enabled).map((stock) => stock.symbol).join("  "), data.weatherLocations.find((location) => location.isDefault)?.name ?? "Dallas, TX"];
  }, [data]);

  async function saveRotation(nextRotation: WestWallRotationScreen[]) {
    setData((current) => ({ ...current, rotation: nextRotation }));
    await fetch("/api/westwall/rotation", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rotation: nextRotation })
    }).catch(() => undefined);
    setActivity("Rotation saved to D1.");
  }

  async function sendCommand(command: string, payload: unknown = {}) {
    if (!deviceToken.trim()) {
      setActivity("Add the WestWall device token before sending commands.");
      return;
    }

    const response = await fetch("/api/westwall/command", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-westwall-token": deviceToken },
      body: JSON.stringify({ command, payload })
    }).catch(() => null);

    setActivity(response?.ok ? `Queued ${command}.` : "Command failed. Check WESTWALL_DEVICE_TOKEN.");
    await loadWestWall();
  }

  async function addFlight(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/westwall/flights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        airline: form.get("airline"),
        flightNumber: form.get("flightNumber"),
        departureAirport: form.get("departureAirport"),
        arrivalAirport: form.get("arrivalAirport"),
        departureTime: form.get("departureTime"),
        arrivalTime: form.get("arrivalTime"),
        gate: form.get("gate"),
        terminal: form.get("terminal"),
        status: form.get("status"),
        seat: form.get("seat"),
        confirmation: form.get("confirmation")
      })
    });
    event.currentTarget.reset();
    setActivity(response.ok ? "Flight saved for WestWall." : "Flight save failed.");
    await loadWestWall();
  }

  async function addTicker(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/westwall/stocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol: form.get("symbol"), label: form.get("label"), assetType: form.get("assetType") })
    });
    event.currentTarget.reset();
    setActivity(response.ok ? "Ticker saved." : "Ticker save failed.");
    await loadWestWall();
  }

  async function addLocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/westwall/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        latitude: asNumber(form.get("latitude"), 32.7767),
        longitude: asNumber(form.get("longitude"), -96.797),
        radiusMiles: asNumber(form.get("radiusMiles"), 25),
        altitudeFilter: form.get("altitudeFilter"),
        airlineFilter: form.get("airlineFilter"),
        aircraftTypeFilter: form.get("aircraftTypeFilter"),
        refreshIntervalSeconds: asNumber(form.get("refreshIntervalSeconds"), 60),
        dataSource: form.get("dataSource"),
        isDefault: form.get("isDefault") === "on"
      })
    });
    event.currentTarget.reset();
    setActivity(response.ok ? "Aircraft location saved." : "Location save failed.");
    await loadWestWall();
  }

  async function addMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/westwall/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        message: form.get("message"),
        startsAt: form.get("startsAt"),
        endsAt: form.get("endsAt"),
        priority: asNumber(form.get("priority"), 1),
        enabled: form.get("enabled") === "on"
      })
    });
    event.currentTarget.reset();
    setActivity(response.ok ? "Custom WestWall message scheduled." : "Message save failed.");
    await loadWestWall();
  }

  async function saveAppearance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const appearance: Partial<WestWallAppearanceSettings> = {
      globalBrightness: asNumber(form.get("globalBrightness"), data.appearance.globalBrightness),
      autoBrightness: form.get("autoBrightness") === "on",
      dayBrightness: asNumber(form.get("dayBrightness"), data.appearance.dayBrightness),
      nightBrightness: asNumber(form.get("nightBrightness"), data.appearance.nightBrightness),
      sleepStart: String(form.get("sleepStart") ?? data.appearance.sleepStart),
      sleepEnd: String(form.get("sleepEnd") ?? data.appearance.sleepEnd),
      colorTheme: String(form.get("colorTheme") ?? data.appearance.colorTheme) as WestWallAppearanceSettings["colorTheme"],
      fontSize: String(form.get("fontSize") ?? data.appearance.fontSize) as WestWallAppearanceSettings["fontSize"],
      scrollSpeed: asNumber(form.get("scrollSpeed"), data.appearance.scrollSpeed),
      animationStyle: String(form.get("animationStyle") ?? data.appearance.animationStyle) as WestWallAppearanceSettings["animationStyle"],
      showIcons: form.get("showIcons") === "on",
      dotMatrixPreview: form.get("dotMatrixPreview") === "on",
      units: String(form.get("units") ?? data.appearance.units) as WestWallAppearanceSettings["units"]
    };
    const response = await fetch("/api/westwall/appearance", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(appearance) });
    setActivity(response.ok ? "Appearance saved." : "Appearance save failed.");
    await loadWestWall();
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-6 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-lg border border-ink/10 bg-white/82 p-5 shadow-crisp">
          <div className="grid gap-5 lg:grid-cols-[1fr_430px] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Private MatthewOS Module</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight">WestWall Display Manager</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65">
                Manage an ESP32-S3 HUB75 128x64 LED matrix display with rotating flights, aircraft, stocks, weather, clock, calendar, and custom dashboard screens.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {extendedTabs.map((tab) => (
                  <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-md px-3 py-2 text-sm font-semibold ${activeTab === tab ? "bg-ink text-paper" : "bg-mist text-ink/65 hover:bg-white"}`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <MatrixPreview lines={previewLines} amber={data.appearance.colorTheme === "Amber"} />
          </div>
          <p className="mt-4 text-sm text-ink/55">{activity}</p>
        </div>

        <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric label="Device" value={data.device.status} icon={<Wifi size={17} />} />
          <Metric label="Last check-in" value={data.device.lastCheckIn} icon={<Activity size={17} />} />
          <Metric label="Active screen" value={data.device.activeScreen} icon={<Tv size={17} />} />
          <Metric label="Brightness" value={`${data.appearance.globalBrightness}%`} icon={<Sun size={17} />} />
          <Metric label="Wi-Fi RSSI" value={`${data.device.wifiRssi} dBm`} icon={<Signal size={17} />} />
          <Metric label="Firmware" value={data.device.firmwareVersion} icon={<Settings2 size={17} />} />
          <Metric label="Enabled screens" value={`${data.rotation.filter((screen) => screen.enabled).length}/${data.rotation.length}`} icon={<RotateCw size={17} />} />
          <Metric label="Heartbeat" value={data.device.status === "online" ? "Fresh" : "Stale"} icon={<Sparkles size={17} />} />
        </section>

        {activeTab === "Overview" ? (
          <section className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <Panel title="Device Controls" eyebrow="Commands">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["reboot", "Reboot Device", <CirclePower key="i" size={16} />],
                  ["sleep", "Sleep Display", <Tv key="i" size={16} />],
                  ["wake", "Wake Display", <Sun key="i" size={16} />],
                  ["refresh", "Manual Refresh", <RefreshCw key="i" size={16} />],
                  ["test_pattern", "Test Display", <TestTube2 key="i" size={16} />]
                ].map(([command, label, icon]) => (
                  <button key={String(command)} type="button" onClick={() => void sendCommand(String(command))} className="inline-flex items-center justify-center gap-2 rounded-md border border-ink/10 bg-mist px-3 py-3 text-sm font-semibold text-ink/70 hover:bg-white">
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            </Panel>
            <Panel title="Current Payload Preview" eyebrow="ESP32 JSON">
              <pre className="max-h-64 overflow-auto rounded-md bg-ink p-4 text-xs leading-5 text-paper">{JSON.stringify({ screen: data.rotation.find((screen) => screen.enabled)?.key, lines: previewLines, brightness: data.appearance.globalBrightness }, null, 2)}</pre>
            </Panel>
          </section>
        ) : null}

        {activeTab === "Messages" ? (
          <section className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <Panel title="Custom Screen Composer" eyebrow="Scheduled messages">
              <form onSubmit={addMessage} className="grid gap-2">
                <input name="title" placeholder="Message title" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <textarea name="message" placeholder="Message shown on WestWall" className="min-h-24 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <input name="startsAt" type="datetime-local" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <input name="endsAt" type="datetime-local" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <input name="priority" placeholder="Priority" defaultValue="1" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                <label className="flex items-center gap-2 text-sm"><input name="enabled" type="checkbox" defaultChecked /> Enabled</label>
                <button type="submit" className="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-paper">Schedule Message</button>
              </form>
            </Panel>
            <Panel title="Message Queue" eyebrow="Custom display screens">
              <div className="space-y-3">
                {data.messages.map((message) => (
                  <div key={message.id} className="rounded-lg bg-mist/60 p-3">
                    <p className="font-semibold">{message.title}</p>
                    <p className="text-sm text-ink/60">{message.message}</p>
                    <p className="mt-1 text-xs text-ink/45">Priority {message.priority} / {message.enabled ? "enabled" : "disabled"} / {message.startsAt || "now"} to {message.endsAt || "open"}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </section>
        ) : null}

        {activeTab === "Rotation" ? (
          <Panel title="Display Rotation Manager" eyebrow="Screens">
            <div className="space-y-3">
              {data.rotation.sort((a, b) => a.priority - b.priority).map((screen, index) => (
                <div key={screen.id} className="grid gap-3 rounded-lg border border-ink/10 bg-mist/50 p-3 lg:grid-cols-[1fr_120px_120px_160px] lg:items-center">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={screen.enabled}
                      onChange={(event) => {
                        const next = data.rotation.map((item) => item.id === screen.id ? { ...item, enabled: event.target.checked } : item);
                        void saveRotation(next);
                      }}
                    />
                    <span>
                      <span className="block font-semibold text-ink">{screen.label}</span>
                      <span className="block text-sm text-ink/55">{screen.preview}</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    value={screen.durationSeconds}
                    min={5}
                    onChange={(event) => {
                      const next = data.rotation.map((item) => item.id === screen.id ? { ...item, durationSeconds: Number(event.target.value) } : item);
                      void saveRotation(next);
                    }}
                    className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <button type="button" disabled={index === 0} onClick={() => void saveRotation(data.rotation.map((item) => item.id === screen.id ? { ...item, priority: Math.max(1, item.priority - 1) } : item))} className="rounded-md border border-ink/10 bg-white p-2 disabled:opacity-30">
                      <ArrowUp size={15} />
                    </button>
                    <button type="button" onClick={() => void saveRotation(data.rotation.map((item) => item.id === screen.id ? { ...item, priority: item.priority + 1 } : item))} className="rounded-md border border-ink/10 bg-white p-2">
                      <ArrowDown size={15} />
                    </button>
                  </div>
                  <span className="rounded-md bg-white px-3 py-2 text-sm text-ink/60">Priority {screen.priority}</span>
                </div>
              ))}
            </div>
          </Panel>
        ) : null}

        {activeTab === "Flights" ? (
          <section className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <Panel title="Manual Flight Entry" eyebrow="Travel">
              <form onSubmit={addFlight} className="grid gap-2">
                {["airline", "flightNumber", "departureAirport", "arrivalAirport", "departureTime", "arrivalTime", "gate", "terminal", "status", "seat", "confirmation"].map((name) => (
                  <input key={name} name={name} placeholder={name} className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
                ))}
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-paper"><Plus size={16} />Add Flight</button>
              </form>
            </Panel>
            <Panel title="Upcoming Flights" eyebrow="Ready for Gmail, Calendar, TripIt, Airline API">
              <div className="space-y-3">
                {data.flights.map((flight) => (
                  <div key={flight.id} className="rounded-lg bg-mist/60 p-3">
                    <p className="font-semibold">{flight.airline} {flight.flightNumber}</p>
                    <p className="text-sm text-ink/60">{flight.departureAirport} to {flight.arrivalAirport} / {flight.status} / Gate {flight.gate || "TBD"}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </section>
        ) : null}

        {activeTab === "Stocks" ? (
          <Panel title="Stock Ticker Watchlist" eyebrow="Market Data">
            <form onSubmit={addTicker} className="mb-4 grid gap-2 md:grid-cols-[1fr_1fr_180px_auto]">
              <input name="symbol" placeholder="Ticker symbol" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
              <input name="label" placeholder="Label" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
              <select name="assetType" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm"><option>Stock</option><option>ETF</option><option>Index</option><option>Crypto</option></select>
              <button type="submit" className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper">Add</button>
            </form>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {data.stocks.map((stock) => <div key={stock.id} className="rounded-lg bg-mist/60 p-3"><p className="font-semibold">{stock.symbol}</p><p className="text-sm text-ink/60">{stock.assetType} / price {stock.showPrice ? "on" : "off"} / change {stock.showPercentChange ? "on" : "off"}</p></div>)}
            </div>
          </Panel>
        ) : null}

        {activeTab === "Locations" ? (
          <Panel title="Flights Above My Location" eyebrow="Provider abstraction: OpenSky, ADS-B Exchange, FlightAware, Custom API">
            <form onSubmit={addLocation} className="mb-4 grid gap-2 md:grid-cols-3">
              <input name="name" placeholder="Location name" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
              <input name="latitude" placeholder="Latitude" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
              <input name="longitude" placeholder="Longitude" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
              <input name="radiusMiles" placeholder="Radius miles" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
              <input name="altitudeFilter" placeholder="Altitude filter" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
              <input name="airlineFilter" placeholder="Airline filter" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
              <input name="aircraftTypeFilter" placeholder="Aircraft type" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
              <input name="refreshIntervalSeconds" placeholder="Refresh seconds" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
              <select name="dataSource" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm"><option>OpenSky</option><option>ADS-B Exchange</option><option>FlightAware</option><option>Custom API</option></select>
              <label className="flex items-center gap-2 text-sm"><input name="isDefault" type="checkbox" /> Default location</label>
              <button type="submit" className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper md:col-span-2">Save Location</button>
            </form>
            <div className="grid gap-3 md:grid-cols-2">
              {data.locations.map((location) => <div key={location.id} className="rounded-lg bg-mist/60 p-3"><p className="font-semibold">{location.name}</p><p className="text-sm text-ink/60">{location.latitude}, {location.longitude} / {location.radiusMiles} mi / {location.dataSource}</p></div>)}
            </div>
          </Panel>
        ) : null}

        {activeTab === "Weather" ? (
          <Panel title="Weather Screen" eyebrow="Current conditions and 3-day forecast scaffold">
            <div className="grid gap-3 md:grid-cols-2">
              {data.weatherLocations.map((location) => <div key={location.id} className="rounded-lg bg-mist/60 p-3"><p className="font-semibold">{location.name}</p><p className="text-sm text-ink/60">Current temp, feels-like, high/low, rain chance, wind, severe alert indicator, and forecast are ready for live weather API wiring.</p></div>)}
            </div>
          </Panel>
        ) : null}

        {activeTab === "Appearance" ? (
          <Panel title="Appearance Customization" eyebrow="Display style">
            <form onSubmit={saveAppearance} className="grid gap-3 md:grid-cols-3">
              <input name="globalBrightness" defaultValue={data.appearance.globalBrightness} placeholder="Global brightness" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
              <input name="dayBrightness" defaultValue={data.appearance.dayBrightness} placeholder="Day brightness" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
              <input name="nightBrightness" defaultValue={data.appearance.nightBrightness} placeholder="Night brightness" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
              <input name="sleepStart" defaultValue={data.appearance.sleepStart} placeholder="Sleep start" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
              <input name="sleepEnd" defaultValue={data.appearance.sleepEnd} placeholder="Sleep end" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
              <input name="scrollSpeed" defaultValue={data.appearance.scrollSpeed} placeholder="Scroll speed" className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm" />
              <select name="colorTheme" defaultValue={data.appearance.colorTheme} className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm"><option>Amber</option><option>Cyan</option><option>White</option><option>Classic RGB</option></select>
              <select name="fontSize" defaultValue={data.appearance.fontSize} className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm"><option>Small</option><option>Medium</option><option>Large</option></select>
              <select name="animationStyle" defaultValue={data.appearance.animationStyle} className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm"><option>None</option><option>Slide</option><option>Fade</option><option>Ticker</option></select>
              <select name="units" defaultValue={data.appearance.units} className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm"><option value="imperial">F / mph / miles</option><option value="metric">C / kmh / km</option></select>
              <label className="flex items-center gap-2 text-sm"><input name="autoBrightness" type="checkbox" defaultChecked={data.appearance.autoBrightness} /> Auto brightness</label>
              <label className="flex items-center gap-2 text-sm"><input name="showIcons" type="checkbox" defaultChecked={data.appearance.showIcons} /> Show icons</label>
              <label className="flex items-center gap-2 text-sm"><input name="dotMatrixPreview" type="checkbox" defaultChecked={data.appearance.dotMatrixPreview} /> Dot matrix preview</label>
              <button type="submit" className="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-paper md:col-span-3">Save Appearance</button>
            </form>
          </Panel>
        ) : null}

        {activeTab === "Device Settings" ? (
          <Panel title="API Key / Device Token Management" eyebrow="Security">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <input value={deviceToken} onChange={(event) => setDeviceToken(event.target.value)} placeholder="Paste WESTWALL_DEVICE_TOKEN for command testing" className="rounded-md border border-ink/10 bg-white px-3 py-3 text-sm" />
              <button type="button" onClick={() => { window.localStorage.setItem("westwall-device-token", deviceToken); setActivity("Device token saved in this browser for command testing."); }} className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-paper">
                <KeyRound size={16} />
                Save Token Locally
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-ink/60">For production firmware, set `WESTWALL_DEVICE_TOKEN` in Cloudflare and send it from the ESP32 as `Authorization: Bearer token` or `x-westwall-token`. Do not put this token on public pages.</p>
          </Panel>
        ) : null}

        {activeTab === "Firmware" ? (
          <section className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <Panel title="ESP32 Firmware Setup" eyebrow="Ready-to-paste config">
              <pre className="overflow-auto rounded-md bg-ink p-4 text-xs leading-5 text-paper">{`#define WESTWALL_API_BASE "https://matthewschuppel.com"
#define WESTWALL_CONFIG_PATH "/api/westwall/config"
#define WESTWALL_CURRENT_PATH "/api/westwall/current"
#define WESTWALL_CHECKIN_PATH "/api/westwall/checkin"
#define WESTWALL_PENDING_COMMANDS_PATH "/api/westwall/commands/pending"
#define WESTWALL_COMMAND_ACK_PATH "/api/westwall/commands/ack"
#define WESTWALL_DEVICE_TOKEN "<set in Cloudflare>"
#define PANEL_WIDTH 128
#define PANEL_HEIGHT 64
#define PANEL_CHAIN 1`}</pre>
            </Panel>
            <Panel title="Device Polling Flow" eyebrow="Command queue">
              <ol className="space-y-2 text-sm leading-6 text-ink/65">
                <li>1. ESP32 calls `/api/westwall/config` at boot.</li>
                <li>2. ESP32 calls `/api/westwall/current` for the current render payload.</li>
                <li>3. ESP32 posts `/api/westwall/checkin` every 30-60 seconds.</li>
                <li>4. ESP32 polls `/api/westwall/commands/pending` and executes queued commands.</li>
                <li>5. ESP32 posts `/api/westwall/commands/ack` after command execution.</li>
              </ol>
            </Panel>
          </section>
        ) : null}

        {activeTab === "Logs" ? (
          <section className="mt-5 grid gap-4 lg:grid-cols-2">
            <Panel title="Command Log" eyebrow="Device commands">
              <div className="space-y-2">{data.commands.map((command) => <div key={command.id} className="rounded-md bg-mist/60 px-3 py-2 text-sm">{command.command} / {command.status} / {command.createdAt}</div>)}</div>
            </Panel>
            <Panel title="Device Check-ins" eyebrow="ESP32 telemetry">
              <div className="space-y-2">{data.checkins.map((checkin) => <div key={checkin.id} className="rounded-md bg-mist/60 px-3 py-2 text-sm">{checkin.firmwareVersion} / {checkin.wifiRssi} dBm / {checkin.freeMemoryBytes} bytes / {checkin.createdAt}</div>)}</div>
            </Panel>
          </section>
        ) : null}
      </div>
    </main>
  );
}
