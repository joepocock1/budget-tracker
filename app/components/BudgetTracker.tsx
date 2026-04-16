"use client";
import { useState} from "react";

const TABS = ["Dashboard", "Monthly Budget", "Weekly Spending", "Bill Tracker", "Subscriptions", "Savings Goals", "30-Day Challenge"];

const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

const ESSENTIAL_CATS = ["Rent / Mortgage", "Council Tax", "Gas & Electric", "Water", "Broadband & Phone", "TV Licence", "Car Insurance", "Fuel / Transport", "Groceries", "Childcare", "School Dinners / Clubs", "Min Debt Payments", "Home Insurance"];
const WANT_CATS = ["Eating Out / Takeaways", "Clothing", "Subscriptions", "Kids Activities", "Personal Care", "Hobbies", "Entertainment", "Gifts"];
const SAVING_CATS = ["Emergency Fund", "Holiday Fund", "Christmas Fund", "Extra Debt Payments"];

const BILLS = ["Rent / Mortgage", "Council Tax", "Gas & Electric", "Water", "Broadband", "Mobile Phone", "TV Licence", "Car Insurance", "Home Insurance", "Loan Repayment", "Credit Card", "Childcare", "Gym", "Netflix", "Spotify", "Amazon Prime"];

const SPEND_CATS = ["Groceries", "Eating Out", "Transport", "Kids", "Clothing", "Health/Beauty", "Entertainment", "Home", "Gifts", "Subscriptions", "Other"];

const CHALLENGE_DAYS = [
  "Review last 7 days of bank transactions", "List every direct debit and standing order", "Do the subscription audit — cancel/pause/downgrade", "Check council tax band — apply for single person discount", "Run a benefits check at entitledto.co.uk", "Check Marriage Allowance — apply and backdate", "Sunday check-in: total this week's spending",
  "Open cupboards, fridge, freezer — list what you have", "Plan 5 dinners using what you have", "Shop at Aldi/Lidl or use a strict list", "Download Too Good To Go + loyalty apps", "Batch cook one meal in bulk", "Use up all leftovers — no waste today", "Sunday check-in: compare food spend to normal",
  "Check energy tariff — compare on Uswitch", "Call broadband provider — negotiate better deal", "Review mobile contract — switch to SIM-only?", "Compare car insurance on comparison site", "Check if you need your TV licence", "Check social tariff eligibility", "Sunday check-in: calculate this week's savings",
  "Open a separate savings account", "Set up standing order for savings on payday", "Turn on round-ups in banking app", "Set up Topcashback + Quidco", "List 5 things on Vinted / FB Marketplace", "Move savings into a Cash ISA", "Final check-in: compare month to normal", "Write down 3 wins from this month", "Celebrate — you've completed the reset!"
];

const SUB_DEFAULTS = ["Netflix", "Amazon Prime", "Spotify", "Disney+", "Apple/iCloud", "Gym", "App Subs", "Magazine/News", "Beauty Box", "", "", ""];

const colors = { purple: "#7C4DFF", purpleLight: "#F3EEFF", bone: "#F5F0EB", mocha: "#6B5B4E", terra: "#C4816E", sage: "#8FAE8B", white: "#FFFFFF", dark: "#2C2420", red: "#D94040", green: "#2D8B4E" };

const s = {
  app: { fontFamily: "'Inter','Segoe UI',sans-serif", color: colors.dark, minHeight: "100vh", background: colors.bone },
  header: { background: colors.purple, color: "#fff", padding: "20px 24px 16px", textAlign: "center" },
  headerTitle: { fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: -0.5 },
  headerSub: { fontSize: 11, opacity: 0.8, marginTop: 4 },
  tabs: { display: "flex", overflowX: "auto" as const, background: "#fff", borderBottomWidth: 2, borderBottomStyle: "solid" as const, borderBottomColor: colors.purpleLight, padding: "0 8px" },
  tab: (a: boolean) => ({ padding: "10px 14px", fontSize: 11, fontWeight: a ? 700 : 500, color: a ? colors.purple : colors.mocha, borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: 3, borderBottomStyle: "solid" as const, borderBottomColor: a ? colors.purple : "transparent", cursor: "pointer", whiteSpace: "nowrap" as const, background: "none" }),
  page: { padding: "16px 16px 80px" },
  card: { background: "#fff", borderRadius: 12, padding: "16px", marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  cardTitle: { fontSize: 13, fontWeight: 700, color: colors.purple, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${colors.bone}` },
  label: { fontSize: 12, color: colors.mocha, flex: 1 },
  input: { width: 90, padding: "6px 8px", border: `1px solid #ddd`, borderRadius: 6, fontSize: 12, textAlign: "right", outline: "none" },
  select: { padding: "6px 8px", border: `1px solid #ddd`, borderRadius: 6, fontSize: 11, outline: "none", background: "#fff" },
  bigNum: (c) => ({ fontSize: 28, fontWeight: 700, color: c || colors.purple }),
  bigLabel: { fontSize: 11, color: colors.mocha, marginTop: 2 },
  statGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  statCard: (bg) => ({ background: bg || colors.purpleLight, borderRadius: 10, padding: "14px", textAlign: "center" }),
  progBar: (pct, col) => ({ height: 8, borderRadius: 4, background: colors.bone, overflow: "hidden", position: "relative", marginTop: 6, width: "100%" }),
  progFill: (pct, col) => ({ height: "100%", width: `${Math.min(pct, 100)}%`, background: col || colors.purple, borderRadius: 4, transition: "width 0.3s" }),
  check: (done) => ({ width: 22, height: 22, borderRadius: 6, border: `2px solid ${done ? colors.green : "#ccc"}`, background: done ? colors.green : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, color: "#fff", fontSize: 14, fontWeight: 700 }),
  sectionHead: { fontSize: 12, fontWeight: 700, color: "#fff", background: colors.purple, padding: "8px 12px", borderRadius: "8px 8px 0 0", marginTop: 12 },
  totalRow: { display: "flex", justifyContent: "space-between", padding: "10px 0", fontWeight: 700, fontSize: 13, borderTop: `2px solid ${colors.purple}`, marginTop: 4 },
  monthTab: (a) => ({ padding: "6px 10px", fontSize: 11, fontWeight: a ? 700 : 400, color: a ? "#fff" : colors.mocha, background: a ? colors.purple : "transparent", borderRadius: 20, cursor: "pointer", border: "none" }),
  addBtn: { background: colors.purpleLight, color: colors.purple, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", marginTop: 8 },
};

const fmt = (n) => `£${(n || 0).toFixed(2)}`;
const fmtShort = (n) => n >= 1000 ? `£${(n/1000).toFixed(1)}k` : `£${Math.round(n)}`;

const NumInput = ({ value, onChange, placeholder }) => (
  <input style={s.input} type="number" step="0.01" min="0" value={value || ""} onChange={e => onChange(parseFloat(e.target.value) || 0)} placeholder={placeholder || "£0.00"} />
);

export default function App() {
  const [tab, setTab] = useState(0);
  const [month, setMonth] = useState(0);
  const [budget, setBudget] = useState(() => {
    const b = {};
    MONTHS.forEach((m, i) => { b[i] = { income: Array(5).fill(0), essentials: Array(ESSENTIAL_CATS.length).fill(0), wants: Array(WANT_CATS.length).fill(0), savings: Array(SAVING_CATS.length).fill(0) }; });
    return b;
  });
  const [bills, setBills] = useState(() => BILLS.map(name => ({ name, amount: 0, paid: Array(12).fill(false) })));
  const [subs, setSubs] = useState(() => SUB_DEFAULTS.map(name => ({ name, cost: 0, used: "", verdict: "" })));
  const [goals, setGoals] = useState([
    { name: "Emergency Fund", target: 500, saved: 0 },
    { name: "Holiday Fund", target: 1000, saved: 0 },
    { name: "Christmas Fund", target: 300, saved: 0 }
  ]);
  const [challenge, setChallenge] = useState(Array(30).fill(false));
  const [spending, setSpending] = useState([]);
  const [weekBudget, setWeekBudget] = useState(0);

  const incomeLabels = ["Salary (after tax)", "Partner's Income", "Child Benefit", "Universal Credit", "Other Income"];
  const bm = budget[month];
  const totalIncome = bm.income.reduce((a, b) => a + b, 0);
  const totalEssentials = bm.essentials.reduce((a, b) => a + b, 0);
  const totalWants = bm.wants.reduce((a, b) => a + b, 0);
  const totalSavings = bm.savings.reduce((a, b) => a + b, 0);
  const totalOut = totalEssentials + totalWants + totalSavings;
  const leftOver = totalIncome - totalOut;

  const yearIncome = Object.values(budget).reduce((t, m) => t + m.income.reduce((a, b) => a + b, 0), 0);
  const yearOut = Object.values(budget).reduce((t, m) => t + m.essentials.reduce((a, b) => a + b, 0) + m.wants.reduce((a, b) => a + b, 0) + m.savings.reduce((a, b) => a + b, 0), 0);
  const yearLeft = yearIncome - yearOut;
  const totalBills = bills.reduce((t, b) => t + b.amount, 0);
  const subTotal = subs.reduce((t, s) => t + (s.cost || 0), 0);
  const subSavings = subs.reduce((t, s) => t + ((s.verdict === "Cancel" || s.verdict === "Pause") ? (s.cost || 0) : s.verdict === "Downgrade" ? (s.cost || 0) * 0.3 : 0), 0);
  const totalSaved = goals.reduce((t, g) => t + g.saved, 0);
  const challengeDone = challenge.filter(Boolean).length;
  const weekSpent = spending.reduce((t, s) => t + (s.amount || 0), 0);

  const updateBudget = (field, idx, val) => {
    setBudget(prev => {
      const n = { ...prev, [month]: { ...prev[month], [field]: [...prev[month][field]] } };
      n[month][field][idx] = val;
      return n;
    });
  };

  const addSpending = () => setSpending(p => [...p, { desc: "", cat: SPEND_CATS[0], amount: 0, type: "Want" }]);
  const updateSpending = (i, f, v) => setSpending(p => { const n = [...p]; n[i] = { ...n[i], [f]: v }; return n; });
  const removeSpending = (i) => setSpending(p => p.filter((_, idx) => idx !== i));

  // DASHBOARD
  const Dashboard = () => (
    <div style={s.page}>
      <div style={s.statGrid}>
        <div style={s.statCard(colors.purpleLight)}>
          <div style={s.bigNum()}>{fmt(totalIncome)}</div>
          <div style={s.bigLabel}>Income this month</div>
        </div>
        <div style={s.statCard(leftOver >= 0 ? "#E8F5E9" : "#FFEBEE")}>
          <div style={s.bigNum(leftOver >= 0 ? colors.green : colors.red)}>{fmt(leftOver)}</div>
          <div style={s.bigLabel}>{leftOver >= 0 ? "Left over" : "Over budget"}</div>
        </div>
        <div style={s.statCard("#FFF3E0")}>
          <div style={s.bigNum(colors.terra)}>{fmt(subSavings)}</div>
          <div style={s.bigLabel}>Sub savings/mo</div>
        </div>
        <div style={s.statCard("#E8F5E9")}>
          <div style={s.bigNum(colors.sage)}>{fmt(totalSaved)}</div>
          <div style={s.bigLabel}>Total saved</div>
        </div>
      </div>

      <div style={{ ...s.card, marginTop: 14 }}>
        <div style={s.cardTitle}>Monthly Breakdown</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {MONTHS.map((m, i) => <button key={m} style={s.monthTab(i === month)} onClick={() => setMonth(i)}>{m}</button>)}
        </div>
        {[
          { label: "Essentials", val: totalEssentials, col: colors.terra, pct: totalIncome ? (totalEssentials / totalIncome) * 100 : 0 },
          { label: "Wants", val: totalWants, col: colors.purple, pct: totalIncome ? (totalWants / totalIncome) * 100 : 0 },
          { label: "Savings", val: totalSavings, col: colors.sage, pct: totalIncome ? (totalSavings / totalIncome) * 100 : 0 },
        ].map(({ label, val, col, pct }) => (
          <div key={label} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: col, fontWeight: 600 }}>{label}</span>
              <span>{fmt(val)} ({Math.round(pct)}%)</span>
            </div>
            <div style={s.progBar()}><div style={s.progFill(pct, col)} /></div>
          </div>
        ))}
        <div style={{ fontSize: 11, color: colors.mocha, marginTop: 8, textAlign: "center" }}>
          Target: 50% needs / 30% wants / 20% savings
        </div>
      </div>

      <div style={s.card}>
        <div style={s.cardTitle}>Savings Goals</div>
        {goals.map((g, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ fontWeight: 600 }}>{g.name}</span>
              <span>{fmt(g.saved)} / {fmt(g.target)}</span>
            </div>
            <div style={s.progBar()}><div style={s.progFill(g.target ? (g.saved / g.target) * 100 : 0, colors.sage)} /></div>
          </div>
        ))}
      </div>

      <div style={s.card}>
        <div style={s.cardTitle}>30-Day Challenge</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12 }}>{challengeDone}/30 days complete</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: colors.purple }}>{Math.round((challengeDone / 30) * 100)}%</span>
        </div>
        <div style={s.progBar()}><div style={s.progFill((challengeDone / 30) * 100, colors.purple)} /></div>
      </div>

      <div style={s.card}>
        <div style={s.cardTitle}>Year Overview</div>
        <div style={s.row}><span style={s.label}>Total income (year)</span><span style={{ fontWeight: 600 }}>{fmt(yearIncome)}</span></div>
        <div style={s.row}><span style={s.label}>Total spending (year)</span><span style={{ fontWeight: 600 }}>{fmt(yearOut)}</span></div>
        <div style={{ ...s.row, borderBottom: "none" }}><span style={{ ...s.label, fontWeight: 700 }}>Year balance</span><span style={{ fontWeight: 700, color: yearLeft >= 0 ? colors.green : colors.red }}>{fmt(yearLeft)}</span></div>
      </div>
    </div>
  );

  // MONTHLY BUDGET
  const MonthlyBudget = () => (
    <div style={s.page}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {MONTHS.map((m, i) => <button key={m} style={s.monthTab(i === month)} onClick={() => setMonth(i)}>{m}</button>)}
      </div>

      <div style={s.sectionHead}>Income</div>
      <div style={s.card}>
        {incomeLabels.map((label, i) => (
          <div key={i} style={s.row}><span style={s.label}>{label}</span><NumInput value={bm.income[i]} onChange={v => updateBudget("income", i, v)} /></div>
        ))}
        <div style={s.totalRow}><span>Total Income</span><span>{fmt(totalIncome)}</span></div>
      </div>

      <div style={s.sectionHead}>Essentials (Needs)</div>
      <div style={s.card}>
        {ESSENTIAL_CATS.map((cat, i) => (
          <div key={i} style={s.row}><span style={s.label}>{cat}</span><NumInput value={bm.essentials[i]} onChange={v => updateBudget("essentials", i, v)} /></div>
        ))}
        <div style={s.totalRow}><span>Total Essentials</span><span style={{ color: colors.terra }}>{fmt(totalEssentials)}</span></div>
      </div>

      <div style={s.sectionHead}>Wants</div>
      <div style={s.card}>
        {WANT_CATS.map((cat, i) => (
          <div key={i} style={s.row}><span style={s.label}>{cat}</span><NumInput value={bm.wants[i]} onChange={v => updateBudget("wants", i, v)} /></div>
        ))}
        <div style={s.totalRow}><span>Total Wants</span><span style={{ color: colors.purple }}>{fmt(totalWants)}</span></div>
      </div>

      <div style={s.sectionHead}>Savings &amp; Debt</div>
      <div style={s.card}>
        {SAVING_CATS.map((cat, i) => (
          <div key={i} style={s.row}><span style={s.label}>{cat}</span><NumInput value={bm.savings[i]} onChange={v => updateBudget("savings", i, v)} /></div>
        ))}
        <div style={s.totalRow}><span>Total Savings</span><span style={{ color: colors.sage }}>{fmt(totalSavings)}</span></div>
      </div>

      <div style={{ ...s.card, background: leftOver >= 0 ? "#E8F5E9" : "#FFEBEE", textAlign: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{leftOver >= 0 ? "Left Over" : "Over Budget"}</div>
        <div style={s.bigNum(leftOver >= 0 ? colors.green : colors.red)}>{fmt(leftOver)}</div>
      </div>
    </div>
  );

  // WEEKLY SPENDING
  const WeeklySpending = () => (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.cardTitle}>Weekly Budget</div>
        <div style={s.row}><span style={s.label}>This week's budget</span><NumInput value={weekBudget} onChange={setWeekBudget} /></div>
      </div>

      <div style={s.card}>
        <div style={s.cardTitle}>Transactions</div>
        {spending.map((sp, i) => (
          <div key={i} style={{ padding: "10px 0", borderBottom: `1px solid ${colors.bone}` }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              <input style={{ ...s.input, flex: 1, textAlign: "left", width: "auto" }} placeholder="What did you buy?" value={sp.desc} onChange={e => updateSpending(i, "desc", e.target.value)} />
              <NumInput value={sp.amount} onChange={v => updateSpending(i, "amount", v)} />
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <select style={{ ...s.select, flex: 1 }} value={sp.cat} onChange={e => updateSpending(i, "cat", e.target.value)}>
                {SPEND_CATS.map(c => <option key={c}>{c}</option>)}
              </select>
              <select style={s.select} value={sp.type} onChange={e => updateSpending(i, "type", e.target.value)}>
                {["Need", "Want", "Treat"].map(t => <option key={t}>{t}</option>)}
              </select>
              <button onClick={() => removeSpending(i)} style={{ background: "none", border: "none", color: colors.red, cursor: "pointer", fontSize: 16, padding: 4 }}>✕</button>
            </div>
          </div>
        ))}
        <button style={s.addBtn} onClick={addSpending}>+ Add Transaction</button>
      </div>

      <div style={s.statGrid}>
        <div style={s.statCard(weekSpent <= weekBudget ? "#E8F5E9" : "#FFEBEE")}>
          <div style={s.bigNum(weekSpent <= weekBudget ? colors.green : colors.red)}>{fmt(weekSpent)}</div>
          <div style={s.bigLabel}>Spent this week</div>
        </div>
        <div style={s.statCard()}>
          <div style={s.bigNum()}>{fmt(weekBudget - weekSpent)}</div>
          <div style={s.bigLabel}>Remaining</div>
        </div>
      </div>

      {spending.length > 0 && (
        <div style={{ ...s.card, marginTop: 14 }}>
          <div style={s.cardTitle}>By Category</div>
          {SPEND_CATS.map(cat => {
            const total = spending.filter(s => s.cat === cat).reduce((t, s) => t + (s.amount || 0), 0);
            if (total === 0) return null;
            return <div key={cat} style={s.row}><span style={s.label}>{cat}</span><span style={{ fontWeight: 600 }}>{fmt(total)}</span></div>;
          })}
        </div>
      )}
    </div>
  );

  // BILL TRACKER
  const BillTracker = () => (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.cardTitle}>Monthly Bills</div>
        {bills.map((bill, i) => (
          <div key={i} style={{ padding: "10px 0", borderBottom: `1px solid ${colors.bone}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <input style={{ ...s.input, textAlign: "left", width: 140, fontWeight: 600 }} value={bill.name} onChange={e => setBills(p => { const n = [...p]; n[i] = { ...n[i], name: e.target.value }; return n; })} />
              <NumInput value={bill.amount} onChange={v => setBills(p => { const n = [...p]; n[i] = { ...n[i], amount: v }; return n; })} />
            </div>
            <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              {MONTHS.map((m, mi) => (
                <button key={m} onClick={() => setBills(p => { const n = [...p]; const pd = [...n[i].paid]; pd[mi] = !pd[mi]; n[i] = { ...n[i], paid: pd }; return n; })}
                  style={{ width: 28, height: 24, borderRadius: 4, border: `1px solid ${bill.paid[mi] ? colors.green : "#ddd"}`, background: bill.paid[mi] ? "#E8F5E9" : "#fff", fontSize: 9, color: bill.paid[mi] ? colors.green : "#bbb", cursor: "pointer", fontWeight: 600 }}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div style={s.totalRow}><span>Total Monthly Bills</span><span>{fmt(totalBills)}</span></div>
        <div style={{ ...s.row, borderBottom: "none" }}><span style={s.label}>Annual total</span><span style={{ fontWeight: 600, color: colors.terra }}>{fmt(totalBills * 12)}</span></div>
      </div>
      <div style={{ ...s.card, background: colors.purpleLight }}>
        <p style={{ fontSize: 11, color: colors.mocha, margin: 0 }}>💡 Remember: Council tax is usually 10 monthly payments, not 12. Use the free months to boost your savings.</p>
      </div>
    </div>
  );

  // SUBSCRIPTIONS
  const Subscriptions = () => (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.cardTitle}>Subscription Audit</div>
        {subs.map((sub, i) => (
          <div key={i} style={{ padding: "10px 0", borderBottom: `1px solid ${colors.bone}` }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
              <input style={{ ...s.input, textAlign: "left", flex: 1, width: "auto" }} value={sub.name} placeholder="Subscription" onChange={e => setSubs(p => { const n = [...p]; n[i] = { ...n[i], name: e.target.value }; return n; })} />
              <NumInput value={sub.cost} onChange={v => setSubs(p => { const n = [...p]; n[i] = { ...n[i], cost: v }; return n; })} />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <select style={{ ...s.select, flex: 1 }} value={sub.used} onChange={e => setSubs(p => { const n = [...p]; n[i] = { ...n[i], used: e.target.value }; return n; })}>
                <option value="">Used?</option>
                <option>Yes</option>
                <option>No</option>
                <option>Can't Remember</option>
              </select>
              <select style={{ ...s.select, flex: 1, fontWeight: 600, color: sub.verdict === "Cancel" ? colors.red : sub.verdict === "Keep" ? colors.green : colors.mocha }}
                value={sub.verdict} onChange={e => setSubs(p => { const n = [...p]; n[i] = { ...n[i], verdict: e.target.value }; return n; })}>
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
      <div style={{ ...s.card, textAlign: "center", marginTop: 14 }}>
        <div style={{ fontSize: 12, color: colors.mocha }}>Annual savings from changes</div>
        <div style={s.bigNum(colors.green)}>{fmt(subSavings * 12)}</div>
      </div>
    </div>
  );

  // SAVINGS GOALS
  const SavingsGoals = () => (
    <div style={s.page}>
      {goals.map((goal, gi) => {
        const pct = goal.target ? (goal.saved / goal.target) * 100 : 0;
        return (
          <div key={gi} style={s.card}>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input style={{ ...s.input, textAlign: "left", flex: 1, width: "auto", fontWeight: 600 }} value={goal.name} onChange={e => setGoals(p => { const n = [...p]; n[gi] = { ...n[gi], name: e.target.value }; return n; })} />
            </div>
            <div style={s.row}>
              <span style={s.label}>Target amount</span>
              <NumInput value={goal.target} onChange={v => setGoals(p => { const n = [...p]; n[gi] = { ...n[gi], target: v }; return n; })} />
            </div>
            <div style={s.row}>
              <span style={s.label}>Amount saved</span>
              <NumInput value={goal.saved} onChange={v => setGoals(p => { const n = [...p]; n[gi] = { ...n[gi], saved: v }; return n; })} />
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ fontWeight: 600, color: colors.sage }}>{Math.round(pct)}% complete</span>
                <span>{fmt(goal.target - goal.saved)} to go</span>
              </div>
              <div style={s.progBar()}><div style={s.progFill(pct, colors.sage)} /></div>
            </div>
          </div>
        );
      })}
      <div style={{ ...s.card, textAlign: "center", background: "#E8F5E9" }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Total Saved Across All Goals</div>
        <div style={s.bigNum(colors.green)}>{fmt(totalSaved)}</div>
      </div>
    </div>
  );

  // 30-DAY CHALLENGE
  const Challenge = () => (
    <div style={s.page}>
      <div style={{ ...s.card, textAlign: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Progress</div>
        <div style={s.bigNum()}>{challengeDone}/30</div>
        <div style={s.progBar()}><div style={s.progFill((challengeDone / 30) * 100)} /></div>
      </div>

      {[
        { title: "Week 1: See Where You Are", days: [0, 6] },
        { title: "Week 2: Fix Your Food", days: [7, 13] },
        { title: "Week 3: Cut Your Bills", days: [14, 20] },
        { title: "Week 4: Build Your Future", days: [21, 29] }
      ].map(({ title, days }, wi) => (
        <div key={wi}>
          <div style={s.sectionHead}>{title}</div>
          <div style={s.card}>
            {CHALLENGE_DAYS.slice(days[0], days[1] + 1).map((text, di) => {
              const idx = days[0] + di;
              return (
                <div key={idx} style={{ ...s.row, gap: 10, alignItems: "flex-start" }}>
                  <div style={s.check(challenge[idx])} onClick={() => setChallenge(p => { const n = [...p]; n[idx] = !n[idx]; return n; })}>
                    {challenge[idx] ? "✓" : ""}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 10, color: colors.purple, fontWeight: 700 }}>Day {idx + 1}</span>
                    <p style={{ margin: 0, fontSize: 12, color: challenge[idx] ? "#999" : colors.dark, textDecoration: challenge[idx] ? "line-through" : "none" }}>{text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  const pages = [Dashboard, MonthlyBudget, WeeklySpending, BillTracker, Subscriptions, SavingsGoals, Challenge];
  const Page = pages[tab];

  return (
    <div style={s.app}>
      <div style={s.header}>
        <h1 style={s.headerTitle}>The UK Mum's Money Reset</h1>
        <div style={s.headerSub}>Budget Tracker 2026/2027</div>
      </div>
      <div style={s.tabs}>
        {TABS.map((t, i) => <button key={t} style={s.tab(i === tab)} onClick={() => setTab(i)}>{t}</button>)}
      </div>
      <Page />
    </div>
  );
}