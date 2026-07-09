import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  ReceiptText,
  ShieldCheck,
  Ticket,
  Users,
  Wallet,
} from "lucide-react";
import heroImage from "../assets/hero.png";
import ThemeToggle from "../components/ThemeToggle";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Wallet size={20} />,
      title: "Shared wallet",
      text: "Track group funds, deposits, and spending from one place.",
    },
    {
      icon: <ReceiptText size={20} />,
      title: "Expense splits",
      text: "Record trip, room, event, and friend expenses as they happen.",
    },
    {
      icon: <BarChart3 size={20} />,
      title: "Live insights",
      text: "See balances, activity, and approvals without chasing people.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#EAE1CC] dark:bg-[#171512] text-[#24322E] dark:text-[#EFE7D6] overflow-hidden">
      <section className="min-h-screen flex flex-col">
        <nav className="max-w-7xl w-full mx-auto px-6 md:px-8 py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="bg-[#B23A2E] hover:bg-[#9a3227] text-[#F8F4EA] p-3 rounded-md shadow-xl">
              <Wallet size={22} />
            </span>
            <span className="text-3xl font-black">
              SmartSplit
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/join-group")}
              className="hidden sm:flex items-center gap-2 bg-[#F8F4EA] dark:bg-[#221F1A] border border-[#C7B98F] dark:border-[#3a352b] px-4 py-3 rounded-md shadow font-semibold"
            >
              <Ticket size={18} />
              Join
            </button>
            <button
              onClick={() => navigate("/login")}
              className="bg-[#B23A2E] hover:bg-[#9a3227] text-[#F8F4EA] px-5 py-3 rounded-md shadow-lg font-semibold transition"
            >
              Login
            </button>
            <ThemeToggle />
          </div>
        </nav>

        <div className="max-w-7xl w-full mx-auto px-6 md:px-8 pb-10 flex-1 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
          <div className="py-8 md:py-12">
            <p className="text-sm font-semibold text-[#B23A2E] uppercase tracking-widest mb-5">
              Group wallet for trips, rooms, events
            </p>

            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] max-w-3xl">
              Split money without the awkward math.
            </h1>

            <p className="mt-7 text-lg md:text-xl text-[#6b6350] dark:text-[#a89a6d] leading-relaxed max-w-2xl">
              Create a shared wallet, invite your group, track expenses, approve
              payments, and settle up with a clear ledger everyone can trust.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/login")}
                className="bg-[#B23A2E] hover:bg-[#9a3227] text-[#F8F4EA] px-7 py-4 rounded-md shadow-xl text-xl font-bold flex items-center justify-center gap-2 transition"
              >
                Start splitting
                <ArrowRight size={20} />
              </button>
              <button
                onClick={() => navigate("/join-group")}
                className="bg-[#F8F4EA] dark:bg-[#221F1A] border border-[#C7B98F] dark:border-[#3a352b] px-7 py-4 rounded-md shadow text-xl font-bold flex items-center justify-center gap-2"
              >
                <Ticket size={20} />
                Use invite code
              </button>
            </div>
          </div>

          <div className="relative lg:min-h-[620px] flex items-center">
            <div className="w-full bg-[#F8F4EA] dark:bg-[#221F1A] backdrop-blur-xl border border-[#C7B98F] dark:border-[#3a352b] rounded-md shadow-2xl p-6 md:p-8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#B23A2E]">
                    Active group
                  </p>
                  <h2 className="text-4xl font-black text-[#24322E] dark:text-[#EFE7D6]">
                    Goa Weekend
                  </h2>
                </div>
                <ShieldCheck className="text-[#3F6B4F]" size={30} />
              </div>

              <div className="h-px bg-[#C7B98F] dark:bg-[#3a352b] my-6" />

              <div className="grid sm:grid-cols-[1fr_160px] gap-6 items-center">
                <div className="space-y-4 text-sm">
                  <Metric label="Wallet balance" value="Rs. 12,450" />
                  <Metric label="Food split" value="Rs. 2,150" tone="gold" />
                  <Metric label="Fuel" value="Rs. 950" tone="green" />
                  <Metric label="Members" value="6 people" />
                </div>

                <div className="bg-[#F8F4EA] dark:bg-[#221F1A] border border-[#C7B98F] dark:border-[#3a352b] rounded-md aspect-square flex items-center justify-center p-5">
                  <img
                    src={heroImage}
                    alt="SmartSplit wallet layers"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-3">
                <Status icon={<Users size={18} />} label="Members" value="6" />
                <Status icon={<ReceiptText size={18} />} label="Bills" value="18" />
                <Status icon={<ShieldCheck size={18} />} label="Ready" value="100%" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F8F4EA] dark:bg-[#221F1A] border-y border-[#C7B98F] dark:border-[#3a352b]">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 grid md:grid-cols-3 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="border border-[#C7B98F] dark:border-[#3a352b] rounded-md p-6 bg-[#F8F4EA] dark:bg-[#221F1A] shadow-xl"
            >
              <div className="text-[#B23A2E] mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-black text-[#24322E] dark:text-[#EFE7D6]">
                {feature.title}
              </h3>
              <p className="text-[#6b6350] dark:text-[#a89a6d] mt-2 leading-relaxed">
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value, tone = "red" }) {
  const toneClass = {
    red: "text-[#B23A2E]",
    gold: "text-[#D9A441]",
    green: "text-[#3F6B4F]",
  }[tone];

  return (
    <div className="flex items-center justify-between gap-4 bg-[#F8F4EA] dark:bg-[#221F1A] border border-[#C7B98F] dark:border-[#3a352b] rounded-md p-4">
      <span className="text-[#6b6350] dark:text-[#a89a6d]">{label}</span>
      <span className={`font-bold ${toneClass}`}>{value}</span>
    </div>
  );
}

function Status({ icon, label, value }) {
  return (
    <div className="bg-[#F8F4EA] dark:bg-[#221F1A] border border-[#C7B98F] dark:border-[#3a352b] rounded-md p-4">
      <div className="text-[#B23A2E] mb-2">{icon}</div>
      <p className="text-[10px] uppercase tracking-widest text-[#6b6350] dark:text-[#a89a6d]">
        {label}
      </p>
      <p className="text-2xl font-black text-[#24322E] dark:text-[#EFE7D6]">
        {value}
      </p>
    </div>
  );
}

