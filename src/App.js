import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import jsPDF from "jspdf";
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

  const [months, setMonths] = useState(12);
  const [useEMI, setUseEMI] = useState(false);

  const [emi, setEmi] = useState(0);
  const [loanData, setLoanData] = useState([]);

  const [risk, setRisk] = useState(0);
  const [result, setResult] = useState("");
  const [reasoning, setReasoning] = useState([]);

  const interestRate = 0.105;

  /* RISK */
  useEffect(() => {
    const surplus = income - expenses;
    const emergency = expenses * 3;

    let r = 0;
    if (savings < emergency) r += 40;
    if (price > savings) r += 30;
    if (surplus < 0) r += 25;

    setRisk(Math.min(100, r));
  }, [income, savings, expenses, price]);

  /* EMI */
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

  /* AI ANALYSIS */
  const analyze = () => {
    if (!price) return setResult("Enter asset price");

    const surplus = income - expenses;
    const emergency = expenses * 3;

    let reasons = [];
    let decision = "";

    if (savings < emergency) reasons.push("Low emergency fund");
    if (price > savings) reasons.push("Asset exceeds savings");
    if (surplus <= 0) reasons.push("No positive cashflow");

    if (risk <= 30) decision = "BUY (Safe)";
    else if (risk <= 60) decision = "WAIT (Moderate Risk)";
    else decision = "INVEST (High Risk)";

    setResult(decision);
    setReasoning(reasons);
  };

  /* PDF GENERATOR */
  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Smart Asset Broker AI Report", 20, 20);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    doc.text(`Income: ${income}`, 20, 40);
    doc.text(`Savings: ${savings}`, 20, 50);
    doc.text(`Expenses: ${expenses}`, 20, 60);
    doc.text(`Asset Price: ${price}`, 20, 70);
    doc.text(`Risk: ${risk}/100`, 20, 90);
    doc.text(`Decision: ${result}`, 20, 100);

    doc.text("Reasoning:", 20, 120);

    reasoning.forEach((r, i) => {
      doc.text(`- ${r}`, 25, 130 + i * 10);
    });

    doc.save("smart-asset-report.pdf");
  };

  const chartData = [
    { name: "Income", value: income },
    { name: "Savings", value: savings },
    { name: "Expenses", value: expenses },
    { name: "Asset", value: price }
  ];

  return (
    <div className="app">

      <Section>
        <Reveal>
          <motion.h1 className="hero">
            Smart Asset Broker AI
            <motion.span className="glow-sweep" />
          </motion.h1>
          <p className="sub">Financial intelligence system</p>
        </Reveal>
      </Section>

      <Section><Reveal><Card title="Income"><Input setValue={setIncome} /></Card></Reveal></Section>
      <Section><Reveal><Card title="Savings"><Input setValue={setSavings} /></Card></Reveal></Section>
      <Section><Reveal><Card title="Expenses"><Input setValue={setExpenses} /></Card></Reveal></Section>
      <Section><Reveal><Card title="Asset Price"><Input setValue={setPrice} /></Card></Reveal></Section>

      <Section>
        <Reveal>
          <Card title="Payment Mode">
            <div className="row">
              <button onClick={() => setUseEMI(false)} className={!useEMI ? "btn active" : "btn"}>Cash</button>
              <button onClick={() => setUseEMI(true)} className={useEMI ? "btn active" : "btn"}>EMI</button>
            </div>

            {useEMI && (
              <>
                <input className="input" value={months} onChange={(e) => setMonths(Number(e.target.value))} />
                <p>EMI: {emi}/month</p>
              </>
            )}
          </Card>
        </Reveal>
      </Section>

      <Section>
        <Reveal>
          <button className="main-btn" onClick={analyze}>
            Run AI Analysis
          </button>

          <div style={{ marginTop: "20px" }}>
            <button className="main-btn" onClick={generatePDF}>
              View Analysis (PDF)
            </button>
          </div>
        </Reveal>
      </Section>

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

      <Section>
        <Reveal>
          <Card title="AI Report">
            <h2>{result}</h2>
            {reasoning.map((r, i) => (
              <p key={i}>• {r}</p>
            ))}
          </Card>
        </Reveal>
      </Section>

      <Section>
        <Reveal>
          <Card title="Financial Overview">
            <ResponsiveContainer width="100%" height={320}>
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

      {useEMI && (
        <Section>
          <Reveal>
            <Card title="EMI Curve">
              <ResponsiveContainer width="100%" height={320}>
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

/* COMPONENTS */
function Section({ children }) {
  return <div className="section">{children}</div>;
}

function Reveal({ children }) {
  const ref = useRef();
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref}>
      <motion.div initial={{ opacity: 0, y: 60 }} animate={inView ? { opacity: 1 } : {}}>
        {children}
      </motion.div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

function Input({ setValue }) {
  return <input className="input" onChange={(e) => setValue(Number(e.target.value || 0))} />;
}