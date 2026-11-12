import { useEffect, useRef, useState } from "react";

/**
 * Spacing the notch path is drawn against.
 * Buttons sit flush with the top and right edges. CORNER is shared by every
 * outer corner, including where the notch floor meets the right edge.
 * @param {"default" | "compact"} [density="default"]
 * @returns {{
 *   pad: number,
 *   btn: number,
 *   gap: number,
 *   notchW: number,
 *   notchH: number,
 *   radii: { r: number, rt: number, ir: number, rb: number }
 * }}
 */
export function notchLayout(density = "default") {
  const compact = density === "compact";
  const pad = compact ? 12 : 16;
  const btn = compact ? 32 : 44;
  const gap = compact ? 6 : 8;
  const corner = compact ? 14 : 18;
  return {
    pad,
    btn,
    gap,
    notchW: btn * 2 + gap * 2,
    notchH: btn + gap,
    radii: {
      r: corner,
      rb: corner,
      rt: btn / 2,
      ir: btn / 2 + gap,
    },
  };
}

/**
 * Rounded rectangle with a notch cut out of the top-right corner.
 *   w, h  : total card size
 *   nw,nh : notch width / height
 *   r     : outer corner radius (card corners)
 *   rt    : convex corner where the top edge meets the notch wall
 *   ir    : concave corner where the notch wall meets the notch floor
 *   rb    : convex corner where the notch floor meets the right edge
 * @param {number} w
 * @param {number} h
 * @param {number} nw
 * @param {number} nh
 * @param {{ r: number, rt: number, ir: number, rb: number }} radii
 * @returns {string}
 */
export function notchPath(w, h, nw, nh, { r, rt, ir, rb }) {
  const x = w - nw; // x where the notch starts
  return [
    `M ${r} 0`,
    `H ${x - rt}`,
    `A ${rt} ${rt} 0 0 1 ${x} ${rt}`,
    `V ${nh - ir}`,
    `A ${ir} ${ir} 0 0 0 ${x + ir} ${nh}`,
    `H ${w - rb}`,
    `A ${rb} ${rb} 0 0 1 ${w} ${nh + rb}`,
    `V ${h - r}`,
    `A ${r} ${r} 0 0 1 ${w - r} ${h}`,
    `H ${r}`,
    `A ${r} ${r} 0 0 1 0 ${h - r}`,
    `V ${r}`,
    `A ${r} ${r} 0 0 1 ${r} 0`,
    "Z",
  ].join(" ");
}

// Tracks the element's pixel size so the path can be redrawn on resize.
function useSize(ref) {
  const [size, setSize] = useState({ w: 340, h: 260 });
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: width, h: height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

const Icon = ({ children }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const Avatar = ({ initials, size = 44, bg = "#d9d4c7" }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%", background: bg,
    display: "grid", placeItems: "center", fontSize: size * 0.33,
    fontWeight: 600, color: "#1b1b1b", flexShrink: 0,
  }}>
    {initials}
  </div>
);

const circleBtn = {
  width: 46, height: 46, borderRadius: "50%", display: "grid",
  placeItems: "center", cursor: "pointer", flexShrink: 0,
};

const DEFAULT_ITEMS = [
  {
    id: "peter", initials: "PT", name: "Peter Thomas", role: "CEO at Madira Ink",
    title: "Google Meet Call", date: "28.03.2023", time: "2 pm", status: "Call scheduled",
    guest: { initials: "AL", bg: "#c9c2b0" },
    notifications: [
      { text: "Peter accepted the invite", when: "10 min ago" },
      { text: "Agenda added to the call", when: "1 h ago" },
    ],
  },
  {
    id: "sofia", initials: "SM", name: "Sofia Marin", role: "Head of Design at Folio",
    title: "Design Review", date: "30.03.2023", time: "10 am", status: "In progress",
    guest: { initials: "JK", bg: "#c4cfb8" },
    notifications: [
      { text: "Sofia shared 3 new mockups", when: "25 min ago" },
      { text: "Comment on the pricing page", when: "3 h ago" },
      { text: "Review moved to 10 am", when: "Yesterday" },
    ],
  },
  {
    id: "daniel", initials: "DO", name: "Daniel Okafor", role: "Founder at Lattice",
    title: "Intro Call", date: "03.04.2023", time: "4 pm", status: "Awaiting reply",
    guest: { initials: "AL", bg: "#c9c2b0" },
    notifications: [{ text: "Invite sent, no reply yet", when: "2 days ago" }],
  },
];

export function NotchedCard({ items = DEFAULT_ITEMS, color = "#b8ff5a" }) {
  const ref = useRef(null);
  const { w, h } = useSize(ref);

  // Arrow button = next item. Bell button = toggle that item's notifications.
  const [index, setIndex] = useState(0);
  const [view, setView] = useState("details"); // "details" | "notifications"
  const [read, setRead] = useState(() => new Set());

  const item = items[index];
  const unread = !read.has(item.id) && item.notifications.length > 0;

  const next = () => {
    setIndex((i) => (i + 1) % items.length);
    setView("details");
  };
  const toggleNotifications = () => {
    if (view === "details") setRead((prev) => new Set(prev).add(item.id));
    setView((v) => (v === "details" ? "notifications" : "details"));
  };

  // Spacing system. The notch buttons sit flush with the top and right edges
  // of the card, so the green's top edge lines up with the buttons' top.
  // PAD is the inset for the content on ALL four sides.
  // GAP is the space between the buttons and the green around them.
  const { pad: PAD, btn: BTN, gap: GAP, notchW: NOTCH_W, notchH: NOTCH_H, radii } =
    notchLayout();
  const path = notchPath(w, h, NOTCH_W, NOTCH_H, radii);

  const notchBtn = {
    ...circleBtn, width: BTN, height: BTN, border: "1px solid #444",
    background: "#2a2a2a", color: "#fff", position: "relative",
    transition: "background .15s, color .15s",
  };
  const outline = "1px solid rgba(0,0,0,.18)";

  return (
    <div ref={ref} style={{ position: "relative", width: "100%", maxWidth: 360, height: 270 }}>
      <style>{`
        @keyframes ncFade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        .nc-fade { animation: ncFade .18s ease-out; }
        @media (prefers-reduced-motion: reduce) { .nc-fade { animation: none; } }
        .nc-btn:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
        .nc-dark:focus-visible { outline-color: #111; }
      `}</style>

      {/* 1. The shape itself: just an SVG path behind everything */}
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <path d={path} fill={color} />
      </svg>

      {/* 2. Buttons sitting in the notch (real, clickable HTML) */}
      <div style={{
        position: "absolute", top: 0, right: 0, height: BTN,
        display: "flex", alignItems: "center", gap: GAP,
        zIndex: 2, // above the content layer, which covers the whole card
      }}>
        <button className="nc-btn" onClick={toggleNotifications}
          aria-label="Notifications" aria-pressed={view === "notifications"}
          style={view === "notifications"
            ? { ...notchBtn, background: color, color: "#111", borderColor: color }
            : notchBtn}>
          <Icon>
            <path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7" />
            <path d="M10 20a2 2 0 0 0 4 0" />
          </Icon>
          {unread && (
            <span style={{ position: "absolute", top: 9, right: 11, width: 7, height: 7,
                           borderRadius: "50%", background: "#ff4d4d" }} />
          )}
        </button>
        <button className="nc-btn" onClick={next} aria-label="Next call" style={notchBtn}>
          <Icon><path d="M7 17 17 7M8 7h9v9" /></Icon>
        </button>
      </div>

      {/* 3. Card content, laid over the shape. Re-keyed so it fades on change. */}
      <div key={item.id + view} className="nc-fade" style={{
        position: "absolute", inset: 0, padding: PAD,
        display: "flex", flexDirection: "column", color: "#111",
        fontFamily: "'Outfit', 'Helvetica Neue', Arial, sans-serif",
      }}>
        {/* header: kept narrower than the notch so text never runs under it */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, height: BTN,
                      paddingRight: NOTCH_W - PAD + 8 }}>
          <Avatar initials={item.initials} size={BTN} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 500, whiteSpace: "nowrap",
                          overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
            <div style={{ fontSize: 11, opacity: 0.6, whiteSpace: "nowrap",
                          overflow: "hidden", textOverflow: "ellipsis" }}>{item.role}</div>
          </div>
        </div>

        {view === "details" ? (
          <>
            {/* middle: icon + title + date */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ ...circleBtn, width: 52, height: 52, cursor: "default", border: outline }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: "#1a8f5a" }} />
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 500, lineHeight: 1.1 }}>{item.title}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 13 }}>
                  <div style={{ display: "flex" }}>
                    <Avatar initials={item.initials} size={22} />
                    <div style={{ marginLeft: -6 }}>
                      <Avatar initials={item.guest.initials} size={22} bg={item.guest.bg} />
                    </div>
                  </div>
                  <span>{item.date}</span>
                  <span style={{ opacity: 0.5 }}>at</span>
                  <span>{item.time}</span>
                </div>
              </div>
            </div>

            {/* bottom: status pill + actions */}
            <div>
              <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4 }}>Status</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button className="nc-btn nc-dark" style={{
                  flex: 1, height: 52, borderRadius: 26, background: "transparent",
                  border: outline, display: "flex", alignItems: "center",
                  gap: 12, padding: "0 14px 0 6px", font: "inherit", fontSize: 14, cursor: "pointer",
                }}>
                  <Avatar initials={item.guest.initials} size={40} bg={item.guest.bg} />
                  <span style={{ flex: 1, textAlign: "left" }}>{item.status}</span>
                  <Icon><path d="m6 9 6 6 6-6" /></Icon>
                </button>
                <button className="nc-btn nc-dark" aria-label="Email"
                  style={{ ...circleBtn, background: "transparent", border: outline }}>
                  <Icon><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></Icon>
                </button>
                <button className="nc-btn nc-dark" aria-label="Join call"
                  style={{ ...circleBtn, width: 52, height: 52, background: "#000", border: "none", color: "#fff" }}>
                  <Icon><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3" /></Icon>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* notifications replace the body; the header stays */
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
            <div style={{ fontSize: 22, fontWeight: 500 }}>Notifications</div>
            {item.notifications.map((n, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 14px",
                borderRadius: 18, border: outline, fontSize: 14,
              }}>
                <span style={{ flex: 1 }}>{n.text}</span>
                <span style={{ fontSize: 11, opacity: 0.6, whiteSpace: "nowrap" }}>{n.when}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Demo() {
  return (
    <div style={{ minHeight: "100vh", background: "#262626", display: "grid", placeItems: "center", padding: 24 }}>
      <NotchedCard />
    </div>
  );
}
