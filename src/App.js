import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line
} from "recharts";

export default function App() {
  const [income, setIncome] = useState(0);
  const [savings, setSavings] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [price, setPrice] = useState(0);
  const [assetType, setAssetType] = useState("");

  const [months, setMonths] = useState(12);
  const [useEMI, setUseEMI] = useState(false);

  const [emi, setEmi] = useState(0);
  const [loanData, setLoanData] = useState([]);

  const [risk, setRisk] = useState(0);
  const [result, setResult] = useState("");
  const [reasoning, setReasoning] = useState([]);

  const interestRate = 0.105;

  /* RISK ENGINE */
  useEffect(() => {
    const surplus = income - expenses;
    const emergency = expenses * 3;

    let r = 0;
    if (savings < emergency) r += 40;
    if (price > savings) r += 30;
    if (surplus < 0) r += 25;

    setRisk(Math.min(100, r));
  }, [income, savings, expenses, price]);

  /* EMI ENGINE */
  useEffect(() => {
    if (!price || !months) return;

    const monthlyRate = interestRate / 12;

    const emiCalc =
      (price * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    const emiValue = Math.round(emiCalc);
    setEmi(emiValue);

    let balance = price;
    let data = [];

    for (let i = 1; i <= months; i++) {
      const interest = balance * monthlyRate;
      const principal = emiValue - interest;
      balance = Math.max(0, balance - principal);

      data.push({
        month: i,
        remaining: Math.round(balance)
      });
    }

    setLoanData(data);
  }, [price, months]);

  /* AI ENGINE */
  const analyze = () => {
    if (!price) return setResult("Enter asset price");

    const surplus = income - expenses;
    const emergency = expenses * 3;

    let reasons = [];
    let decision = "";

    if (savings < emergency) reasons.push("Low emergency fund (<3 months)");
    if (price > savings) reasons.push("Asset exceeds savings capacity");
    if (surplus <= 0) reasons.push("No positive cashflow");

    if (risk <= 30) decision = "BUY (Safe)";
    else if (risk <= 60) decision = "WAIT (Moderate Risk)";
    else decision = "INVEST (Build capital first)";

    setResult(decision);
    setReasoning(reasons);
  };

  const chartData = [
    { name: "Income", value: income },
    { name: "Savings", value: savings },
    { name: "Expenses", value: expenses },
    { name: "Asset", value: price }
  ];

  return (
    <div className="app">

      {/* HERO */}
      <Section>
        <Reveal>
          <motion.h1
            className="hero"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.6, ease: "easeOut" }}
          >
            Smart Asset Broker AI

            <motion.span
              className="glow-sweep"
              initial={{ x: "-120%" }}
              animate={{ x: "120%" }}
              transition={{
                duration: 2.8,
                delay: 0.8,
                ease: "easeInOut"
              }}
            />
          </motion.h1>

          <p className="sub">
            Scroll-driven financial intelligence system
          </p>
        </Reveal>
      </Section>

      {/* INPUT FLOW */}
      <Section><Reveal><Card title="Asset Type"><input className="input" onChange={(e)=>setAssetType(e.target.value)} /></Card></Reveal></Section>
      <Section><Reveal><Card title="Income"><Input setValue={setIncome} /></Card></Reveal></Section>
      <Section><Reveal><Card title="Savings"><Input setValue={setSavings} /></Card></Reveal></Section>
      <Section><Reveal><Card title="Expenses"><Input setValue={setExpenses} /></Card></Reveal></Section>
      <Section><Reveal><Card title="Asset Price"><Input setValue={setPrice} /></Card></Reveal></Section>

      {/* EMI */}
      <Section>
        <Reveal>
          <Card title="Payment Mode">
            <div className="row">
              <button onClick={()=>setUseEMI(false)} className={!useEMI?"btn active":"btn"}>Cash</button>
              <button onClick={()=>setUseEMI(true)} className={useEMI?"btn active":"btn"}>EMI</button>
            </div>

            {useEMI && (
              <>
                <input className="input" value={months} onChange={(e)=>setMonths(Number(e.target.value))}/>
                <p className="emi">EMI: {emi}/month</p>
              </>
            )}
          </Card>
        </Reveal>
      </Section>

      {/* ANALYZE */}
      <Section>
        <Reveal>
          <button className="main-btn" onClick={analyze}>
            Run AI Analysis
          </button>
        </Reveal>
      </Section>

      {/* RISK */}
      <Section>
        <Reveal>
          <Card title="Risk Score">
            <div className="risk">{risk}/100</div>
            <div className="bar">
              <motion.div className="fill" animate={{ width: `${risk}%` }} />
            </div>
          </Card>
        </Reveal>
      </Section>

      {/* RESULT */}
      <Section>
        <Reveal>
          <Card title="AI Report">
            <h2 className="result">{result}</h2>
            <ul>
              {reasoning.map((r,i)=>(
                <li key={i}>✔ {r}</li>
              ))}
            </ul>
          </Card>
        </Reveal>
      </Section>

      {/* CHART */}
      <Section>
        <Reveal>
          <Card title="Financial Overview">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#a855f7" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Reveal>
      </Section>

      {/* EMI GRAPH */}
      {useEMI && (
        <Section>
          <Reveal>
            <Card title="EMI Curve">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={loanData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="remaining" stroke="#22c55e" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Reveal>
        </Section>
      )}

    </div>
  );
}

/* UI COMPONENTS */
function Section({ children }) {
  return <div className="section">{children}</div>;
}

function Reveal({ children }) {
  const ref = useRef();
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="card">
      <h2 className="title">{title}</h2>
      {children}
    </div>
  );
}

function Input({ setValue }) {
  return (
    <input className="input" onChange={(e)=>setValue(Number(e.target.value||0))}/>
  );
}