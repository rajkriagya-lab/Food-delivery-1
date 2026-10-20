import { useEffect, useMemo, useState } from "react";
import { ChevronDown, HelpCircle, Search, UtensilsCrossed } from "lucide-react";
import { Link } from "react-router-dom";

const faqItems = [
    { category: "Account", question: "How do I create an account?", answer: "Choose Register in the navigation and enter your name, email, and password. New public accounts are customer accounts." },
    { category: "Account", question: "How do I log in or log out?", answer: "Use the Login page with your registered email and password. Use the Logout button in the navigation to end your session." },
    { category: "Restaurants & food", question: "How can I find a restaurant or dish?", answer: "Browse Restaurants or Cuisines, or use the search controls on those pages. Open a restaurant to see its available menu." },
    { category: "Restaurants & food", question: "Why can’t I add a dish to my cart?", answer: "You need to be signed in as a customer. A dish may also be unavailable or the restaurant may be closed." },
    { category: "Orders & delivery", question: "How do I place an order?", answer: "Add menu items to your cart, review your cart, choose a saved delivery address, and continue through checkout." },
    { category: "Orders & delivery", question: "Where can I track my order?", answer: "Sign in and open Orders or Track Order. The app shows statuses including pending, processing, out for delivery, delivered, or cancelled." },
    { category: "Orders & delivery", question: "How long will delivery take?", answer: "Delivery time depends on the restaurant and order. The app does not currently provide a guaranteed delivery-time estimate." },
    { category: "Payments", question: "Which payment methods are available?", answer: "Checkout supports Cash on Delivery and the configured eSewa and Khalti payment flows. Online options require those services to be configured." },
    { category: "Payments", question: "What should I do if an online payment fails?", answer: "Check the payment result page and your order status before trying again. If you were charged but the order is not marked paid, keep your transaction details and order ID." },
    { category: "Payments", question: "How do cancellations and refunds work?", answer: "Customers can request cancellation for eligible orders from order history. The app does not currently provide an in-app refund workflow; online refunds need to be handled through the payment provider." },
    { category: "Privacy & security", question: "How is my account protected?", answer: "Passwords are stored as password hashes, and signed-in sessions use an HTTP-only cookie. Do not share your password or payment credentials." },
];
const categories = ["All topics", ...new Set(faqItems.map((item) => item.category))];

export default function FAQ() {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("All topics");
    const [expanded, setExpanded] = useState(-1);
    useEffect(() => { document.title = "FAQs | KHAANA"; }, []);
    const filtered = useMemo(() => faqItems.filter((item) =>
        (category === "All topics" || category === item.category) &&
        (!query.trim() || (item.question + " " + item.answer + " " + item.category).toLowerCase().includes(query.trim().toLowerCase())),
    ), [category, query]);

    return <main className="min-h-screen bg-primary px-5 pb-20 text-white sm:px-8">
        <header className="mx-auto max-w-4xl py-16 text-center sm:py-20"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-orange-500/15 text-orange-400"><HelpCircle size={27} /></span><p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-orange-400">Help, served simply</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">Frequently asked questions</h1><p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">Quick answers about your account, menu, orders, delivery, and payments.</p>
            <label className="mx-auto mt-8 flex max-w-2xl items-center gap-3 rounded-2xl border border-white/10 bg-card px-4 py-3 focus-within:border-orange-400/70"><Search className="shrink-0 text-slate-400" size={19} /><span className="sr-only">Search frequently asked questions</span><input value={query} onChange={(event) => { setQuery(event.target.value); setExpanded(-1); }} placeholder="Search questions or topics..." className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500" /></label>
        </header>
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[230px_1fr]"><aside aria-label="FAQ categories" className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-visible">{categories.map((item) => <button key={item} type="button" onClick={() => { setCategory(item); setExpanded(-1); }} aria-pressed={category === item} className={"shrink-0 rounded-xl px-4 py-3 text-left text-sm font-medium transition " + (category === item ? "bg-orange-500 text-white" : "border border-white/10 bg-card text-slate-300 hover:border-white/20")}>{item}</button>)}</aside>
            <section aria-live="polite" className="space-y-3">{filtered.length ? filtered.map((item, index) => { const open = expanded === index; return <article key={item.question} className="overflow-hidden rounded-2xl border border-white/10 bg-card"><h2><button type="button" aria-expanded={open} onClick={() => setExpanded(open ? -1 : index)} className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left font-semibold hover:text-orange-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-400"><span>{item.question}</span><ChevronDown size={18} className={"shrink-0 transition-transform " + (open ? "rotate-180 text-orange-400" : "text-slate-500")} /></button></h2>{open && <p className="border-t border-white/5 px-5 pb-5 pt-4 text-sm leading-7 text-slate-400">{item.answer}</p>}</article>; }) : <div className="rounded-3xl border border-dashed border-white/15 px-6 py-12 text-center"><Search className="mx-auto text-slate-500" /><h2 className="mt-4 text-lg font-bold">No matching questions</h2><p className="mt-2 text-sm text-slate-400">Try another search or choose a different topic.</p><button onClick={() => { setQuery(""); setCategory("All topics"); }} className="mt-5 text-sm font-semibold text-orange-400 hover:text-orange-300">Clear filters</button></div>}</section>
        </div>
        <section id="support" className="mx-auto mt-14 flex max-w-7xl flex-col items-start justify-between gap-5 rounded-3xl border border-white/10 bg-card p-7 sm:flex-row sm:items-center sm:p-9"><div className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-500/15 text-orange-400"><UtensilsCrossed size={20} /></span><div><h2 className="text-lg font-bold">Need to check an order?</h2><p className="mt-1 text-sm text-slate-400">Your order history has the latest status available in the app.</p></div></div><Link to="/orders" className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold hover:bg-orange-600">View my orders</Link></section>
    </main>;
}