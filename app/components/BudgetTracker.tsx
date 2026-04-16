"use client";
import { useState, useEffect } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = ["Dashboard", "Monthly Budget", "Weekly Spending", "Bill Tracker", "Subscriptions", "Savings Goals", "30-Day Challenge"];
const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

const ESSENTIAL_CATS = ["Rent / Mortgage", "Council Tax", "Gas & Electric", "Water", "Broadband & Phone", "TV Licence", "Car Insurance", "Fuel / Transport", "Groceries", "Childcare", "School Dinners / Clubs", "Min Debt Payments", "Home Insurance"];
const WANT_CATS = ["Eating Out / Takeaways", "Clothing", "Subscriptions", "Kids Activities", "Personal Care", "Hobbies", "Entertainment", "Gifts"];
const SAVING_CATS = ["Emergency Fund", "Holiday Fund", "Christmas Fund", "Extra Debt Payments"];
const BILLS_DEFAULT = ["Rent / Mortgage", "Council Tax", "Gas & Electric", "Water", "Broadband", "Mobile Phone", "TV Licence", "Car Insurance", "Home Insurance", "Loan Repayment", "Credit Card", "Childcare", "Gym", "Netflix", "Spotify", "Amazon Prime"];
const SPEND_CATS = ["Groceries", "Eating Out", "Transport", "Kids", "Clothing", "Health/Beauty", "Entertainment", "Home", "Gifts", "Subscriptions", "Other"];
const INCOME_LABELS = ["Salary (after tax)", "Partner's Income", "Child Benefit", "Universal Credit", "Other Income"];
const SUB_DEFAULTS = ["Netflix", "Amazon Prime", "Spotify", "Disney+", "Apple/iCloud", "Gym", "App Subs", "Magazine/News", "Beauty Box", "", "", ""];

const CHALLENGE_DAYS = [
  "Review last 7 days of bank transactions", "List every direct debit and standing order", "Do the subscription audit — cancel/pause/downgrade", "Check council tax band — apply for single person discount", "Run a benefits check at entitledto.co.uk", "Check Marriage Allowance — apply and backdate", "Sunday check-in: total this week's spending",
  "Open cupboards, fridge, freezer — list what you have", "Plan 5 dinners using what you have", "Shop at Aldi/Lidl or use a strict list", "Download Too Good To Go + loyalty apps", "Batch cook one meal in bulk", "Use up all leftovers — no waste today", "Sunday check-in: compare food spend to normal",
  "Check energy tariff — compare on Uswitch", "Call broadband provider — negotiate better deal", "Review mobile contract — switch to SIM-only?", "Compare car insurance on comparison site", "Check if you need your TV licence", "Check social tariff eligibility", "Sunday check-in: calculate this week's savings",
  "Open a separate savings account", "Set up standing order for savings on payday", "Turn on round-ups in banking app", "Set up Topcashback + Quidco", "List 5 things on Vinted / FB Marketplace", "Move savings into a Cash ISA", "Final check-in: compare month to normal", "Write down 3 wins from this month", "Celebrate — you've completed the reset!"
];

// ─── Default state factories ───────────────────────────────────────────────────

function defaultBudget() {
  const b: Record<number, { income: number[]; essentials: number[]; wants: number[]; savings: number[] }> = {};
  MONTHS.forEach((_, i) => {
    b[i] = { income: Array(5).fill(0), essentials: Array(ESSENTIAL_CATS.length).fill(0), wants: Array(WANT_CATS.length).fill(0), savings: Array(SAVING_CATS.length).fill(0) };
  });
  return b;
}

function defaultBills() {
  return BILLS_DEFAULT.map(name => ({ name, amount: 0, paid: Array(12).fill(false) }));
}

function defaultSubs() {
  return SUB_DEFAULTS.map(name => ({ name, cost: 0, used: "", verdict: "" }));
}

function defaultGoals() {
  return [
    { name: "Emergency Fund", target: 500, saved: 0 },
    { name: "Holiday Fund", target: 1000, saved: 0 },
    { name: "Christmas Fund", target: 300, saved: 0 },
  ];
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

const LS = {
  get<T>(key: string, fallback: T): T {
    try {
      const v = localStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch { return fallback; }
  },
  set(key: string, value: unknown) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Safari private */ }
  },
};

// ─── Colours ──────────────────────────────────────────────────────────────────

const colors = {
  purple: "#7C4DFF",
  purpleLight: "#F3EEFF",
  bone: "#F5F0EB",
  mocha: "#6B5B4E",
  terra: "#C4816E",
  sage: "#8FAE8B",
  dark: "#2C2420",
  red: "#D94040",
  green: "#2D8B4E",
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  app: { fontFamily: "'Inter','Segoe UI',sans-serif", color: colors.dark, minHeight: "100vh", background: colors.bone },

  header: { background: colors.purple, color: "#fff", padding: "20px 24px 18px", textAlign: "center" as const },
  headerTitle: { fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, opacity: 0.85, marginTop: 6 },

  // Sticky tab bar — scrollbar hidden via .tab-bar CSS class
  tabs: {
    display: "flex", overflowX: "auto" as const, background: "#fff",
    borderBottom: `2px solid ${colors.purpleLight}`, padding: "0 8px",
    position: "sticky" as const, top: 0, zIndex: 10,
    WebkitOverflowScrolling: "touch" as const,
  },
  tab: (a: boolean) => ({
    padding: "12px 14px", fontSize: 13, fontWeight: a ? 700 : 500,
    color: a ? colors.purple : colors.mocha,
    border: "none", borderBottom: `4px solid ${a ? colors.purple : "transparent"}`,
    cursor: "pointer", whiteSpace: "nowrap" as const, background: "none",
    minHeight: 44, touchAction: "manipulation" as const,
  }),

  page: { padding: "16px 16px 100px" },

  card: { background: "#fff", borderRadius: 16, padding: "20px", marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  cardTitle: { fontSize: 13, fontWeight: 700, color: colors.purple, marginBottom: 12, textTransform: "uppercase" as const, letterSpacing: 1 },

  row: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${colors.bone}` },
  label: { fontSize: 13, color: colors.mocha, flex: 1, paddingRight: 8 },

  // 16px font prevents iOS Safari auto-zoom on focus; 44px height for HIG tap targets
  input: {
    width: 100, padding: "10px", border: `1.5px solid #ddd`, borderRadius: 8,
    fontSize: 16, textAlign: "right" as const, outline: "none",
    height: 44, touchAction: "manipulation" as const, background: "#fff", fontFamily: "inherit",
  },
  inputWide: {
    flex: 1, padding: "10px", border: `1.5px solid #ddd`, borderRadius: 8,
    fontSize: 16, textAlign: "left" as const, outline: "none",
    height: 44, touchAction: "manipulation" as const, background: "#fff", fontFamily: "inherit", width: "auto",
  },
  select: {
    padding: "10px 8px", border: `1.5px solid #ddd`, borderRadius: 8,
    fontSize: 13, outline: "none", background: "#fff",
    height: 44, touchAction: "manipulation" as const, fontFamily: "inherit",
  },

  bigNum: (c?: string): React.CSSProperties => ({ fontSize: 32, fontWeight: 700, color: c || colors.purple }),
  bigLabel: { fontSize: 12, color: colors.mocha, marginTop: 4 } as React.CSSProperties,

  statGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  statCard: (bg?: string): React.CSSProperties => ({ background: bg || colors.purpleLight, borderRadius: 16, padding: "18px 16px", textAlign: "center" }),

  progBar: (): React.CSSProperties => ({ height: 10, borderRadius: 6, background: colors.bone, overflow: "hidden", position: "relative", marginTop: 8, width: "100%" }),
  progFill: (pct: number, col?: string): React.CSSProperties => ({ height: "100%", width: `${Math.min(pct, 100)}%`, background: col || colors.purple, borderRadius: 6, transition: "width 0.4s ease" }),

  check: (done: boolean): React.CSSProperties => ({
    width: 28, height: 28, minWidth: 28, borderRadius: 8,
    border: `2px solid ${done ? colors.green : "#ccc"}`,
    background: done ? colors.green : "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0, color: "#fff", fontSize: 16, fontWeight: 700,
    touchAction: "manipulation", transition: "background 0.15s ease, border-color 0.15s ease",
  }),

  sectionHead: { fontSize: 13, fontWeight: 700, color: "#fff", background: colors.purple, padding: "10px 16px", borderRadius: "8px 8px 0 0", marginTop: 20 },
  totalRow: { display: "flex", justifyContent: "space-between", padding: "12px 0", fontWeight: 700, fontSize: 14, borderTop: `2px solid ${colors.purple}`, marginTop: 4 },

  monthTab: (a: boolean): React.CSSProperties => ({
    padding: "8px 12px", fontSize: 13, fontWeight: a ? 700 : 400,
    color: a ? "#fff" : colors.mocha, background: a ? colors.purple : "transparent",
    borderRadius: 20, cursor: "pointer", border: "none", minHeight: 36, touchAction: "manipulation",
  }),

  addBtn: {
    background: colors.purple, color: "#fff", border: "none", borderRadius: 12,
    padding: "14px 20px", fontSize: 15, fontWeight: 600, cursor: "pointer",
    marginTop: 12, width: "100%", minHeight: 48, touchAction: "manipulation" as const,
    display: "block" as const, textAlign: "center" as const,
  },

  outlineBtn: (col: string): React.CSSProperties => ({
    background: "none", color: col, border: `1.5px solid ${col}`, borderRadius: 8,
    padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer",
    minHeight: 36, touchAction: "manipulation",
  }),

  billMonthBtn: (paid: boolean): React.CSSProperties => ({
    minWidth: 36, height: 32, borderRadius: 6,
    border: `1.5px solid ${paid ? colors.green : "#ddd"}`,
    background: paid ? "#E8F5E9" : "#fff",
    fontSize: 10, color: paid ? colors.green : "#bbb",
    cursor: "pointer", fontWeight: 600, touchAction: "manipulation", padding: "0 4px",
  }),

  emptyCard: { textAlign: "center" as const, padding: "28px 20px" },
};

// ─── Utilities ────────────────────────────────────────────────────────────────

const fmt = (n: number) => `£${(n || 0).toFixed(2)}`;

// ─── NumInput — text field with decimal inputMode (no spinner jank on mobile) ─

const NumInput = ({ value, onChange, placeholder }: { value: number; onChange: (v: number) => void; placeholder?: string }) => (
  <input
    style={s.input}
    type="text"
    inputMode="decimal"
    value={value || ""}
    onChange={e => {
      const v = e.target.value;
      if (v === "" || /^\d*\.?\d{0,2}$/.test(v)) {
        onChange(v === "" ? 0 : parseFloat(v) || 0);
      }
    }}
    placeholder={placeholder || "£0.00"}
  />
);

// ─── Types ────────────────────────────────────────────────────────────────────

type MonthBudget = { income: number[]; essentials: number[]; wants: number[]; savings: number[] };
type BudgetState = Record<number, MonthBudget>;
type Bill = { name: string; amount: number; paid: boolean[] };
type Sub = { name: string; cost: number; used: string; verdict: string };
type Goal = { name: string; target: number; saved: number };
type Transaction = { desc: string; cat: string; amount: number; type: string };

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ totalIncome, leftOver, subSavings, totalSaved, month, setMonth, totalEssentials, totalWants, totalSavings, goals, challengeDone, yearIncome, yearOut, yearLeft }: {
  totalIncome: number; leftOver: number; subSavings: number; totalSaved: number;
  month: number; setMonth: (m: number) => void;
  totalEssentials: number; totalWants: number; totalSavings: number;
  goals: Goal[]; challengeDone: number;
  yearIncome: number; yearOut: number; yearLeft: number;
}) {
  const hasData = totalIncome > 0;

  return (
    <div style={s.page} className="page-fade">
      {!hasData && (
        <div style={{ ...s.card, background: colors.purpleLight, ...s.emptyCard }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>👋</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: colors.purple, marginBottom: 8 }}>Welcome to your Money Reset!</div>
          <div style={{ fontSize: 14, color: colors.mocha, lineHeight: 1.6 }}>
            Head to the <strong>Monthly Budget</strong> tab and pop in your income to see your dashboard come alive ✨
          </div>
        </div>
      )}

      <div style={s.statGrid}>
        <div style={s.statCard(colors.purpleLight)}>
          <div style={s.bigNum()}>{hasData ? fmt(totalIncome) : "—"}</div>
          <div style={s.bigLabel}>Income this month</div>
        </div>
        <div style={s.statCard(leftOver >= 0 ? "#E8F5E9" : "#FFEBEE")}>
          <div style={s.bigNum(leftOver >= 0 ? colors.green : colors.red)}>{hasData ? fmt(leftOver) : "—"}</div>
          <div style={s.bigLabel}>{leftOver >= 0 ? "Left over" : "Over budget"}</div>
        </div>
        <div style={s.statCard("#FFF3E0")}>
          <div style={s.bigNum(colors.terra)}>{subSavings > 0 ? fmt(subSavings) : "—"}</div>
          <div style={s.bigLabel}>Sub savings/mo</div>
        </div>
        <div style={s.statCard("#E8F5E9")}>
          <div style={s.bigNum(colors.sage)}>{totalSaved > 0 ? fmt(totalSaved) : "—"}</div>
          <div style={s.bigLabel}>Total saved</div>
        </div>
      </div>

      <div style={{ ...s.card, marginTop: 4 }}>
        <div style={s.cardTitle}>Monthly Breakdown</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {MONTHS.map((m, i) => <button key={m} style={s.monthTab(i === month)} onClick={() => setMonth(i)}>{m}</button>)}
        </div>
        {!hasData ? (
          <div style={{ fontSize: 13, color: colors.mocha, textAlign: "center", padding: "10px 0" }}>
            Enter your income on the Monthly Budget tab to see your breakdown
          </div>
        ) : (
          <>
            {[
              { label: "Essentials", val: totalEssentials, col: colors.terra, pct: (totalEssentials / totalIncome) * 100 },
              { label: "Wants", val: totalWants, col: colors.purple, pct: (totalWants / totalIncome) * 100 },
              { label: "Savings", val: totalSavings, col: colors.sage, pct: (totalSavings / totalIncome) * 100 },
            ].map(({ label, val, col, pct }) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: col, fontWeight: 600 }}>{label}</span>
                  <span>{fmt(val)} ({Math.round(pct)}%)</span>
                </div>
                <div style={s.progBar()}><div style={s.progFill(pct, col)} /></div>
              </div>
            ))}
            <div style={{ fontSize: 12, color: colors.mocha, marginTop: 10, textAlign: "center" }}>
              Target: 50% needs / 30% wants / 20% savings
            </div>
          </>
        )}
      </div>

      <div style={s.card}>
        <div style={s.cardTitle}>Savings Goals</div>
        {goals.every(g => g.saved === 0 && g.target === 0) ? (
          <div style={{ fontSize: 13, color: colors.mocha, textAlign: "center", padding: "8px 0" }}>
            Head to <strong>Savings Goals</strong> to set your targets 🎯
          </div>
        ) : (
          goals.map((g, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ fontWeight: 600 }}>{g.name}</span>
                <span>{fmt(g.saved)} / {fmt(g.target)}</span>
              </div>
              <div style={s.progBar()}><div style={s.progFill(g.target ? (g.saved / g.target) * 100 : 0, colors.sage)} /></div>
            </div>
          ))
        )}
      </div>

      <div style={s.card}>
        <div style={s.cardTitle}>30-Day Challenge</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13 }}>{challengeDone}/30 days complete</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: colors.purple }}>{Math.round((challengeDone / 30) * 100)}%</span>
        </div>
        <div style={s.progBar()}><div style={s.progFill((challengeDone / 30) * 100, colors.purple)} /></div>
      </div>

      <div style={s.card}>
        <div style={s.cardTitle}>Year Overview</div>
        <div style={s.row}><span style={s.label}>Total income (year)</span><span style={{ fontWeight: 600 }}>{fmt(yearIncome)}</span></div>
        <div style={s.row}><span style={s.label}>Total spending (year)</span><span style={{ fontWeight: 600 }}>{fmt(yearOut)}</span></div>
        <div style={{ ...s.row, borderBottom: "none" }}>
          <span style={{ ...s.label, fontWeight: 700 }}>Year balance</span>
          <span style={{ fontWeight: 700, color: yearLeft >= 0 ? colors.green : colors.red }}>{fmt(yearLeft)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Monthly Budget ───────────────────────────────────────────────────────────

function MonthlyBudget({ month, setMonth, bm, updateBudget, totalIncome, totalEssentials, totalWants, totalSavings, leftOver }: {
  month: number; setMonth: (m: number) => void;
  bm: MonthBudget; updateBudget: (field: string, idx: number, val: number) => void;
  totalIncome: number; totalEssentials: number; totalWants: number; totalSavings: number; leftOver: number;
}) {
  return (
    <div style={s.page} className="page-fade">
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {MONTHS.map((m, i) => <button key={m} style={s.monthTab(i === month)} onClick={() => setMonth(i)}>{m}</button>)}
      </div>

      <div style={s.sectionHead}>Income</div>
      <div style={{ ...s.card, borderRadius: "0 0 16px 16px", marginTop: 0 }}>
        {INCOME_LABELS.map((label, i) => (
          <div key={i} style={s.row}>
            <label className="sr-only" htmlFor={`income-${i}`}>{label}</label>
            <span style={s.label}>{label}</span>
            <NumInput value={bm.income[i]} onChange={v => updateBudget("income", i, v)} />
          </div>
        ))}
        <div style={s.totalRow}><span>Total Income</span><span>{fmt(totalIncome)}</span></div>
      </div>

      <div style={s.sectionHead}>Essentials (Needs)</div>
      <div style={{ ...s.card, borderRadius: "0 0 16px 16px", marginTop: 0 }}>
        {ESSENTIAL_CATS.map((cat, i) => (
          <div key={i} style={s.row}>
            <span style={s.label}>{cat}</span>
            <NumInput value={bm.essentials[i]} onChange={v => updateBudget("essentials", i, v)} />
          </div>
        ))}
        <div style={s.totalRow}><span>Total Essentials</span><span style={{ color: colors.terra }}>{fmt(totalEssentials)}</span></div>
      </div>

      <div style={s.sectionHead}>Wants</div>
      <div style={{ ...s.card, borderRadius: "0 0 16px 16px", marginTop: 0 }}>
        {WANT_CATS.map((cat, i) => (
          <div key={i} style={s.row}>
            <span style={s.label}>{cat}</span>
            <NumInput value={bm.wants[i]} onChange={v => updateBudget("wants", i, v)} />
          </div>
        ))}
        <div style={s.totalRow}><span>Total Wants</span><span style={{ color: colors.purple }}>{fmt(totalWants)}</span></div>
      </div>

      <div style={s.sectionHead}>Savings &amp; Debt</div>
      <div style={{ ...s.card, borderRadius: "0 0 16px 16px", marginTop: 0 }}>
        {SAVING_CATS.map((cat, i) => (
          <div key={i} style={s.row}>
            <span style={s.label}>{cat}</span>
            <NumInput value={bm.savings[i]} onChange={v => updateBudget("savings", i, v)} />
          </div>
        ))}
        <div style={s.totalRow}><span>Total Savings</span><span style={{ color: colors.sage }}>{fmt(totalSavings)}</span></div>
      </div>

      <div style={{ ...s.card, background: leftOver >= 0 ? "#E8F5E9" : "#FFEBEE", textAlign: "center", padding: "24px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{leftOver >= 0 ? "Left Over This Month" : "Over Budget This Month"}</div>
        <div style={s.bigNum(leftOver >= 0 ? colors.green : colors.red)}>{fmt(leftOver)}</div>
      </div>
    </div>
  );
}

// ─── Weekly Spending ──────────────────────────────────────────────────────────

function WeeklySpending({ spending, addSpending, updateSpending, removeSpending, weekBudget, setWeekBudget, weekSpent }: {
  spending: Transaction[];
  addSpending: () => void;
  updateSpending: (i: number, f: string, v: string | number) => void;
  removeSpending: (i: number) => void;
  weekBudget: number;
  setWeekBudget: (v: number) => void;
  weekSpent: number;
}) {
  const remaining = weekBudget - weekSpent;

  return (
    <div style={s.page} className="page-fade">
      <div style={s.card}>
        <div style={s.cardTitle}>Weekly Budget</div>
        <div style={s.row}>
          <span style={s.label}>This week's budget</span>
          <NumInput value={weekBudget} onChange={setWeekBudget} />
        </div>
      </div>

      <div style={s.statGrid}>
        <div style={s.statCard(weekSpent <= weekBudget || weekBudget === 0 ? "#E8F5E9" : "#FFEBEE")}>
          <div style={s.bigNum(weekSpent <= weekBudget || weekBudget === 0 ? colors.green : colors.red)}>{fmt(weekSpent)}</div>
          <div style={s.bigLabel}>Spent this week</div>
        </div>
        <div style={s.statCard(remaining >= 0 ? colors.purpleLight : "#FFEBEE")}>
          <div style={s.bigNum(remaining >= 0 ? colors.purple : colors.red)}>{fmt(remaining)}</div>
          <div style={s.bigLabel}>Remaining</div>
        </div>
      </div>

      <div style={s.card}>
        <div style={s.cardTitle}>Transactions</div>
        {spending.length === 0 && (
          <div style={{ ...s.emptyCard, padding: "20px 0" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🛒</div>
            <div style={{ fontSize: 13, color: colors.mocha, lineHeight: 1.5 }}>
              No transactions yet — tap the button below to add your first one
            </div>
          </div>
        )}
        {spending.map((sp, i) => (
          <div key={i} style={{ padding: "12px 0", borderBottom: `1px solid ${colors.bone}` }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                style={s.inputWide}
                type="text"
                placeholder="What did you buy?"
                value={sp.desc}
                onChange={e => updateSpending(i, "desc", e.target.value)}
              />
              <NumInput value={sp.amount} onChange={v => updateSpending(i, "amount", v)} />
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select style={{ ...s.select, flex: 1 }} value={sp.cat} onChange={e => updateSpending(i, "cat", e.target.value)}>
                {SPEND_CATS.map(c => <option key={c}>{c}</option>)}
              </select>
              <select style={s.select} value={sp.type} onChange={e => updateSpending(i, "type", e.target.value)}>
                {["Need", "Want", "Treat"].map(t => <option key={t}>{t}</option>)}
              </select>
              <button
                onClick={() => removeSpending(i)}
                style={{ background: "none", border: "none", color: colors.red, cursor: "pointer", fontSize: 18, padding: "0 4px", minHeight: 44, touchAction: "manipulation" }}
                aria-label="Remove transaction"
              >✕</button>
            </div>
          </div>
        ))}
        <button style={s.addBtn} onClick={addSpending}>+ Add Transaction</button>
      </div>

      {spending.length > 0 && (
        <div style={s.card}>
          <div style={s.cardTitle}>By Category</div>
          {SPEND_CATS.map(cat => {
            const total = spending.filter(sp => sp.cat === cat).reduce((t, sp) => t + (sp.amount || 0), 0);
            if (total === 0) return null;
            return <div key={cat} style={s.row}><span style={s.label}>{cat}</span><span style={{ fontWeight: 600 }}>{fmt(total)}</span></div>;
          })}
        </div>
      )}
    </div>
  );
}

// ─── Bill Tracker ─────────────────────────────────────────────────────────────

function BillTracker({ bills, setBills, totalBills, month }: {
  bills: Bill[];
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>;
  totalBills: number;
  month: number;
}) {
  const tickAllThisMonth = () => {
    setBills(prev => prev.map(b => {
      const pd = [...b.paid];
      pd[month] = true;
      return { ...b, paid: pd };
    }));
  };

  return (
    <div style={s.page} className="page-fade">
      <div style={s.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={s.cardTitle} >Monthly Bills</div>
          <button style={s.outlineBtn(colors.purple)} onClick={tickAllThisMonth}>
            ✓ Tick {MONTHS[month]} all paid
          </button>
        </div>
        {bills.map((bill, i) => (
          <div key={i} style={{ padding: "12px 0", borderBottom: `1px solid ${colors.bone}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <input
                style={{ ...s.inputWide, fontWeight: 600, maxWidth: 160 }}
                type="text"
                value={bill.name}
                onChange={e => setBills(p => { const n = [...p]; n[i] = { ...n[i], name: e.target.value }; return n; })}
              />
              <NumInput value={bill.amount} onChange={v => setBills(p => { const n = [...p]; n[i] = { ...n[i], amount: v }; return n; })} />
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {MONTHS.map((m, mi) => (
                <button
                  key={m}
                  onClick={() => setBills(p => { const n = [...p]; const pd = [...n[i].paid]; pd[mi] = !pd[mi]; n[i] = { ...n[i], paid: pd }; return n; })}
                  style={s.billMonthBtn(bill.paid[mi])}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div style={s.totalRow}><span>Total Monthly Bills</span><span>{fmt(totalBills)}</span></div>
        <div style={{ ...s.row, borderBottom: "none" }}>
          <span style={s.label}>Annual total</span>
          <span style={{ fontWeight: 600, color: colors.terra }}>{fmt(totalBills * 12)}</span>
        </div>
      </div>
      <div style={{ ...s.card, background: colors.purpleLight }}>
        <p style={{ fontSize: 13, color: colors.mocha, margin: 0, lineHeight: 1.6 }}>
          💡 Remember: Council tax is usually 10 monthly payments, not 12. Use the free months to boost your savings.
        </p>
      </div>
    </div>
  );
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

function Subscriptions({ subs, setSubs, subTotal, subSavings }: {
  subs: Sub[];
  setSubs: React.Dispatch<React.SetStateAction<Sub[]>>;
  subTotal: number;
  subSavings: number;
}) {
  return (
    <div style={s.page} className="page-fade">
      <div style={s.card}>
        <div style={s.cardTitle}>Subscription Audit</div>
        {subs.map((sub, i) => (
          <div key={i} style={{ padding: "12px 0", borderBottom: `1px solid ${colors.bone}` }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <input
                style={s.inputWide}
                type="text"
                value={sub.name}
                placeholder="Subscription name"
                onChange={e => setSubs(p => { const n = [...p]; n[i] = { ...n[i], name: e.target.value }; return n; })}
              />
              <NumInput value={sub.cost} onChange={v => setSubs(p => { const n = [...p]; n[i] = { ...n[i], cost: v }; return n; })} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <select style={{ ...s.select, flex: 1 }} value={sub.used} onChange={e => setSubs(p => { const n = [...p]; n[i] = { ...n[i], used: e.target.value }; return n; })}>
                <option value="">Used?</option>
                <option>Yes</option>
                <option>No</option>
                <option>Can't Remember</option>
              </select>
              <select
                style={{ ...s.select, flex: 1, fontWeight: 600, color: sub.verdict === "Cancel" ? colors.red : sub.verdict === "Keep" ? colors.green : colors.mocha }}
                value={sub.verdict}
                onChange={e => setSubs(p => { const n = [...p]; n[i] = { ...n[i], verdict: e.target.value }; return n; })}
              >
                <option value="">Verdict</option>
                <option>Keep</option>
                <option>Downgrade</option>
                <option>Pause</option>
                <option>Cancel</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      <div style={s.statGrid}>
        <div style={s.statCard("#FFEBEE")}>
          <div style={s.bigNum(colors.red)}>{fmt(subTotal)}</div>
          <div style={s.bigLabel}>Monthly cost</div>
        </div>
        <div style={s.statCard("#E8F5E9")}>
          <div style={s.bigNum(colors.green)}>{fmt(subSavings)}</div>
          <div style={s.bigLabel}>Monthly savings</div>
        </div>
      </div>
      <div style={{ ...s.card, textAlign: "center", marginTop: 4 }}>
        <div style={{ fontSize: 13, color: colors.mocha, marginBottom: 6 }}>Annual savings from changes</div>
        <div style={s.bigNum(colors.green)}>{fmt(subSavings * 12)}</div>
      </div>
    </div>
  );
}

// ─── Savings Goals ────────────────────────────────────────────────────────────

function SavingsGoals({ goals, setGoals, totalSaved }: {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  totalSaved: number;
}) {
  return (
    <div style={s.page} className="page-fade">
      {goals.map((goal, gi) => {
        const pct = goal.target ? (goal.saved / goal.target) * 100 : 0;
        return (
          <div key={gi} style={s.card}>
            <div style={{ marginBottom: 12 }}>
              <input
                style={{ ...s.inputWide, fontWeight: 600, fontSize: 15, width: "100%" }}
                type="text"
                value={goal.name}
                onChange={e => setGoals(p => { const n = [...p]; n[gi] = { ...n[gi], name: e.target.value }; return n; })}
              />
            </div>
            <div style={s.row}>
              <span style={s.label}>Target amount</span>
              <NumInput value={goal.target} onChange={v => setGoals(p => { const n = [...p]; n[gi] = { ...n[gi], target: v }; return n; })} />
            </div>
            <div style={s.row}>
              <span style={s.label}>Amount saved</span>
              <NumInput value={goal.saved} onChange={v => setGoals(p => { const n = [...p]; n[gi] = { ...n[gi], saved: v }; return n; })} />
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: colors.sage }}>{Math.round(pct)}% complete</span>
                <span style={{ color: colors.mocha }}>{fmt(goal.target - goal.saved)} to go</span>
              </div>
              <div style={s.progBar()}><div style={s.progFill(pct, colors.sage)} /></div>
            </div>
          </div>
        );
      })}
      <div style={{ ...s.card, textAlign: "center", background: "#E8F5E9" }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Total Saved Across All Goals</div>
        <div style={s.bigNum(colors.green)}>{fmt(totalSaved)}</div>
      </div>
    </div>
  );
}

// ─── 30-Day Challenge ─────────────────────────────────────────────────────────

function Challenge({ challenge, setChallenge, challengeDone }: {
  challenge: boolean[];
  setChallenge: React.Dispatch<React.SetStateAction<boolean[]>>;
  challengeDone: number;
}) {
  const [popIdx, setPopIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setChallenge(p => { const n = [...p]; n[idx] = !n[idx]; return n; });
    setPopIdx(idx);
    setTimeout(() => setPopIdx(null), 220);
  };

  return (
    <div style={s.page} className="page-fade">
      <div style={{ ...s.card, textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Progress</div>
        <div style={s.bigNum()}>{challengeDone}/30</div>
        <div style={s.progBar()}><div style={s.progFill((challengeDone / 30) * 100)} /></div>
      </div>

      {[
        { title: "Week 1: See Where You Are", days: [0, 6] as [number, number] },
        { title: "Week 2: Fix Your Food", days: [7, 13] as [number, number] },
        { title: "Week 3: Cut Your Bills", days: [14, 20] as [number, number] },
        { title: "Week 4: Build Your Future", days: [21, 29] as [number, number] },
      ].map(({ title, days }, wi) => (
        <div key={wi}>
          <div style={s.sectionHead}>{title}</div>
          <div style={{ ...s.card, borderRadius: "0 0 16px 16px", marginTop: 0 }}>
            {CHALLENGE_DAYS.slice(days[0], days[1] + 1).map((text, di) => {
              const idx = days[0] + di;
              return (
                <div key={idx} style={{ ...s.row, gap: 12, alignItems: "flex-start" }}>
                  <div
                    style={s.check(challenge[idx])}
                    className={popIdx === idx ? "check-pop" : ""}
                    onClick={() => toggle(idx)}
                    role="checkbox"
                    aria-checked={challenge[idx]}
                    tabIndex={0}
                    onKeyDown={e => e.key === " " || e.key === "Enter" ? toggle(idx) : undefined}
                  >
                    {challenge[idx] ? "✓" : ""}
                  </div>
                  <div style={{ flex: 1, paddingTop: 2 }}>
                    <span style={{ fontSize: 11, color: colors.purple, fontWeight: 700 }}>Day {idx + 1}</span>
                    <p style={{ margin: 0, fontSize: 13, color: challenge[idx] ? "#aaa" : colors.dark, textDecoration: challenge[idx] ? "line-through" : "none", lineHeight: 1.5 }}>
                      {text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── App (main) ───────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState(() => LS.get("mbt-tab", 0));
  const [month, setMonth] = useState(() => LS.get("mbt-month", 0));

  const [budget, setBudget] = useState<BudgetState>(() => LS.get("mbt-budget", defaultBudget()));
  const [bills, setBills] = useState<Bill[]>(() => LS.get("mbt-bills", defaultBills()));
  const [subs, setSubs] = useState<Sub[]>(() => LS.get("mbt-subs", defaultSubs()));
  const [goals, setGoals] = useState<Goal[]>(() => LS.get("mbt-goals", defaultGoals()));
  const [challenge, setChallenge] = useState<boolean[]>(() => LS.get("mbt-challenge", Array(30).fill(false)));
  const [spending, setSpending] = useState<Transaction[]>(() => LS.get("mbt-spending", []));
  const [weekBudget, setWeekBudget] = useState<number>(() => LS.get("mbt-weekBudget", 0));

  // Persist all state to localStorage
  useEffect(() => { LS.set("mbt-tab", tab); }, [tab]);
  useEffect(() => { LS.set("mbt-month", month); }, [month]);
  useEffect(() => { LS.set("mbt-budget", budget); }, [budget]);
  useEffect(() => { LS.set("mbt-bills", bills); }, [bills]);
  useEffect(() => { LS.set("mbt-subs", subs); }, [subs]);
  useEffect(() => { LS.set("mbt-goals", goals); }, [goals]);
  useEffect(() => { LS.set("mbt-challenge", challenge); }, [challenge]);
  useEffect(() => { LS.set("mbt-spending", spending); }, [spending]);
  useEffect(() => { LS.set("mbt-weekBudget", weekBudget); }, [weekBudget]);

  // Derived values
  const bm = budget[month];
  const totalIncome = bm.income.reduce((a, b) => a + b, 0);
  const totalEssentials = bm.essentials.reduce((a, b) => a + b, 0);
  const totalWants = bm.wants.reduce((a, b) => a + b, 0);
  const totalSavings = bm.savings.reduce((a, b) => a + b, 0);
  const leftOver = totalIncome - totalEssentials - totalWants - totalSavings;

  const yearIncome = Object.values(budget).reduce((t, m) => t + m.income.reduce((a, b) => a + b, 0), 0);
  const yearOut = Object.values(budget).reduce((t, m) => t + m.essentials.reduce((a, b) => a + b, 0) + m.wants.reduce((a, b) => a + b, 0) + m.savings.reduce((a, b) => a + b, 0), 0);
  const yearLeft = yearIncome - yearOut;

  const totalBills = bills.reduce((t, b) => t + b.amount, 0);
  const subTotal = subs.reduce((t, s) => t + (s.cost || 0), 0);
  const subSavings = subs.reduce((t, s) => t + (
    (s.verdict === "Cancel" || s.verdict === "Pause") ? (s.cost || 0) :
    s.verdict === "Downgrade" ? (s.cost || 0) * 0.3 : 0
  ), 0);
  const totalSaved = goals.reduce((t, g) => t + g.saved, 0);
  const challengeDone = challenge.filter(Boolean).length;
  const weekSpent = spending.reduce((t, s) => t + (s.amount || 0), 0);

  // Handlers
  const updateBudget = (field: string, idx: number, val: number) => {
    setBudget(prev => {
      const n = { ...prev, [month]: { ...prev[month], [field]: [...(prev[month] as Record<string, number[]>)[field]] } };
      (n[month] as Record<string, number[]>)[field][idx] = val;
      return n;
    });
  };

  const addSpending = () => setSpending(p => [...p, { desc: "", cat: SPEND_CATS[0], amount: 0, type: "Want" }]);
  const updateSpending = (i: number, f: string, v: string | number) => setSpending(p => { const n = [...p]; n[i] = { ...n[i], [f]: v }; return n; });
  const removeSpending = (i: number) => setSpending(p => p.filter((_, idx) => idx !== i));

  const pages = [
    <Dashboard key="dashboard" totalIncome={totalIncome} leftOver={leftOver} subSavings={subSavings} totalSaved={totalSaved} month={month} setMonth={setMonth} totalEssentials={totalEssentials} totalWants={totalWants} totalSavings={totalSavings} goals={goals} challengeDone={challengeDone} yearIncome={yearIncome} yearOut={yearOut} yearLeft={yearLeft} />,
    <MonthlyBudget key="monthly" month={month} setMonth={setMonth} bm={bm} updateBudget={updateBudget} totalIncome={totalIncome} totalEssentials={totalEssentials} totalWants={totalWants} totalSavings={totalSavings} leftOver={leftOver} />,
    <WeeklySpending key="weekly" spending={spending} addSpending={addSpending} updateSpending={updateSpending} removeSpending={removeSpending} weekBudget={weekBudget} setWeekBudget={setWeekBudget} weekSpent={weekSpent} />,
    <BillTracker key="bills" bills={bills} setBills={setBills} totalBills={totalBills} month={month} />,
    <Subscriptions key="subs" subs={subs} setSubs={setSubs} subTotal={subTotal} subSavings={subSavings} />,
    <SavingsGoals key="goals" goals={goals} setGoals={setGoals} totalSaved={totalSaved} />,
    <Challenge key="challenge" challenge={challenge} setChallenge={setChallenge} challengeDone={challengeDone} />,
  ];

  return (
    <div style={s.app}>
      <header style={s.header}>
        <h1 style={s.headerTitle}>💜 The UK Mum's Money Reset</h1>
        <div style={s.headerSub}>Take control of your family finances — Budget Tracker 2026/2027</div>
      </header>

      <div style={s.tabs} className="tab-bar" role="tablist" aria-label="Navigation">
        {TABS.map((t, i) => (
          <button
            key={t}
            style={s.tab(i === tab)}
            onClick={() => setTab(i)}
            role="tab"
            aria-selected={i === tab}
            aria-controls={`panel-${i}`}
          >
            {t}
          </button>
        ))}
      </div>

      <main id={`panel-${tab}`} role="tabpanel">
        {pages[tab]}
      </main>
    </div>
  );
}
