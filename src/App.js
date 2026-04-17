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

/* ================= APP ================= */

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

  const interestRate = 0.105;

  /* ================= RISK ENGINE ================= */

  useEffect(() => {
    //const surplus = income - expenses;
    const emergency = expenses * 3;

    let r = 0;

    if (savings < emergency) r += 40;
    if (price > savings) r += 30;
    if (surplus < 0) r += 25;

    setRisk(Math.min(100, r));
  }, [income, savings, expenses, price]);

  /* ================= LOAN CALC ================= */

  const generateLoanData = (emiValue) => {
    const monthlyRate = interestRate / 12;
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

    return data;
  };

  /* ================= EMI ================= */

  useEffect(() => {
  if (!price || !months) return;

  const monthlyRate = interestRate / 12;

  const emiCalc =
    (price * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  const emiValue = Math.round(emiCalc);

  setEmi(emiValue);

  // move function inside here to avoid dependency error
  const data = (() => {
    let balance = price;
    let arr = [];

    for (let i = 1; i <= months; i++) {
      const interest = balance * monthlyRate;
      const principal = emiValue - interest;
      balance = Math.max(0, balance - principal);

      arr.push({
        month: i,
        remaining: Math.round(balance)
      });
    }

    return arr;
  })();

  setLoanData(data);

}, [price, months]);

  /* ================= ANALYZE ================= */

  const analyze = () => {
    const surplus = income - expenses;

    if (!price) {
      setResult("⚠️ Enter asset price");
      return;
    }

    if (!useEMI) {
      const cashLeft = savings - price;

      if (cashLeft < 0) {
        setResult(`❌ Not affordable in cash — short by ${Math.abs(cashLeft)}`);
      } else {
        setResult(`💰 Cash purchase possible — remaining savings: ${cashLeft}`);
      }
    } else {
      if (savings < expenses * 3) {
        setResult("⚠️ EMI possible but risky (low emergency fund)");
      } else {
        setResult(
          `📊 EMI plan active — monthly payment ${emi} for ${months} months`
        );
      }
    }
  };

  /* ================= CHART DATA ================= */

  const chartData = [
    { name: "Income", value: income },
    { name: "Savings", value: savings },
    { name: "Expenses", value: expenses },
    { name: "Asset", value: price }
  ];

  /* ================= UI ================= */

  return (
    <div className="bg-gradient-to-b from-[#120018] to-[#05000a] text-white min-h-screen w-full overflow-x-hidden">

      {/* HEADER */}
      <Reveal>
        <div className="text-center py-20">
          <h1 className="text-5xl font-bold text-purple-300">
            Smart Asset Broker
          </h1>
          <p className="text-gray-400 mt-2">
            Cash vs EMI financial decision engine
          </p>
        </div>
      </Reveal>

      <div className="space-y-32 pb-40">

        {/* INPUTS */}
        <Reveal><Card title="Income"><Input setValue={setIncome} /></Card></Reveal>
        <Reveal><Card title="Savings"><Input setValue={setSavings} /></Card></Reveal>
        <Reveal><Card title="Expenses"><Input setValue={setExpenses} /></Card></Reveal>
        <Reveal><Card title="Asset Price"><Input setValue={setPrice} /></Card></Reveal>

        {/* CASH OR EMI BUTTON */}
        <Reveal>
          <Card title="Payment Mode">
            <div className="flex gap-4">
              <button
                onClick={() => setUseEMI(false)}
                className={`px-4 py-2 rounded-xl ${
                  !useEMI ? "bg-green-600" : "bg-gray-700"
                }`}
              >
                Cash
              </button>

              <button
                onClick={() => setUseEMI(true)}
                className={`px-4 py-2 rounded-xl ${
                  useEMI ? "bg-purple-600" : "bg-gray-700"
                }`}
              >
                EMI
              </button>
            </div>

            {!useEMI ? (
              <p className="mt-3 text-green-400">
                Cash required: {price}
              </p>
            ) : (
              <>
                <input
                  type="number"
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="w-full p-3 bg-black/40 border border-purple-800 rounded-xl mt-4"
                  placeholder="Months"
                />

                <p className="mt-3 text-purple-300">
                  EMI: {emi} / month
                </p>
              </>
            )}
          </Card>
        </Reveal>

        {/* ANALYZE */}
        <Reveal>
          <div className="text-center">
            <button
              onClick={analyze}
              className="bg-purple-600 px-10 py-4 rounded-xl hover:bg-purple-500"
            >
              Get Broker Advice
            </button>
          </div>
        </Reveal>

        {/* RISK */}
        <Reveal>
          <Card title="Risk Score">
            <div className="text-5xl text-red-400 font-bold">{risk}/100</div>

            <div className="w-full h-3 bg-gray-800 rounded-full mt-4">
              <motion.div
                className="h-full bg-red-500"
                animate={{ width: `${risk}%` }}
              />
            </div>
          </Card>
        </Reveal>

        {/* RESULT */}
        <Reveal>
          <Card title="Broker Recommendation">
            <p className="text-xl text-purple-200">{result}</p>
          </Card>
        </Reveal>

        {/* FINANCIAL CHART */}
        <Reveal>
          <Card title="Financial Overview">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip />
                <Bar dataKey="value" fill="#a855f7" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Reveal>

        {/* LOAN BALANCE CHART */}
        {useEMI && (
          <Reveal>
            <Card title="Loan Payoff Timeline">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={loanData}>
                  <XAxis dataKey="month" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="remaining"
                    stroke="#22c55e"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Reveal>
        )}

      </div>
    </div>
  );
}

/* ================= REVEAL ================= */

function Reveal({ children }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.95, filter: "blur(10px)" }}
        animate={
          inView
            ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
            : {}
        }
        transition={{ duration: 0.8 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ================= CARD ================= */

function Card({ title, children }) {
  return (
    <div className="max-w-2xl mx-auto bg-white/5 border border-purple-500/20 backdrop-blur-xl p-6 rounded-2xl">
      <h2 className="text-purple-300 mb-4">{title}</h2>
      {children}
    </div>
  );
}

/* ================= INPUT ================= */

function Input({ setValue }) {
  return (
    <input
      onChange={(e) => setValue(Number(e.target.value || 0))}
      className="w-full p-3 bg-black/40 border border-purple-800 rounded-xl"
      placeholder="Enter value"
    />
  );
}