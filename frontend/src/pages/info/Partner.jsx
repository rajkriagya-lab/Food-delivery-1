import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Bike, ChartNoAxesCombined, ChefHat, Store, UtensilsCrossed } from "lucide-react";
import demoVideo from "../../assets/video/Browsing_KHAANA_food_delivery_app_20261017205915.mp4";

const benefits = [
    { icon: ChartNoAxesCombined, title: "Reach more hungry locals", text: "Put your menu in front of customers looking for their next neighborhood favorite." },
    { icon: Store, title: "Show what makes you yours", text: "Share your dishes, photos, opening hours, and the story behind your kitchen." },
    { icon: Bike, title: "Make ordering convenient", text: "Give customers a simple way to discover your food and place an order." },
];

export default function Partner() {
    useEffect(() => { document.title = "Partner with us | KHAANA"; }, []);

    return <main className="min-h-screen bg-primary text-white">
        <section className="relative isolate overflow-hidden border-b border-white/5 bg-[radial-gradient(ellipse_at_top_left,_rgba(249,115,79,0.2),_transparent_48%),linear-gradient(135deg,#111e29_0%,#0a1119_70%)]">
            <div aria-hidden="true" className="absolute -right-20 top-10 -z-10 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-400/10 px-4 py-2 text-xs font-semibold tracking-wide text-orange-200"><UtensilsCrossed size={15} /> For local restaurants</span>
                    <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">More neighbors. More orders. <span className="text-orange-300">Your kitchen.</span></h1>
                    <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">Bring your restaurant to KHAANA and help more people discover the food you love to make.</p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link to="/partner/signup" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-orange-400">Apply to partner <ArrowRight size={17} /></Link>
                        <Link to="/login" className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/5">Restaurant partner sign in</Link>
                    </div>
                    <p className="mt-4 text-xs leading-5 text-slate-500">Already have a restaurant owner account? Sign in to manage your menu and orders.</p>
                </div>
                <div className="relative mx-auto w-full max-w-lg">
                    <div className="absolute -inset-3 rotate-2 rounded-[2rem] bg-gradient-to-br from-orange-400/20 via-emerald-300/10 to-transparent blur-sm" />
                    <div className="relative rounded-[1.75rem] border border-white/10 bg-slate-900/90 p-7 shadow-2xl sm:p-9">
                        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-orange-400/10 text-orange-300"><ChefHat size={27} /></span>
                        <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">A local-first partnership</p>
                        <h2 className="mt-3 text-2xl font-black">Your food deserves to be found.</h2>
                        <p className="mt-3 text-sm leading-6 text-slate-400">Keep your kitchen at the center while KHAANA helps customers discover your menu and place orders.</p>
                        <div className="mt-7 space-y-4 border-t border-white/10 pt-6 text-sm text-slate-300">
                            {["A clear restaurant profile", "A menu customers can browse", "An owner dashboard for daily updates"].map((item) => <p key={item} className="flex items-center gap-3"><BadgeCheck size={18} className="shrink-0 text-emerald-300" />{item}</p>)}
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20">
            <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">Why partner with KHAANA</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">Make it easier for people to find your food.</h2></div>
            <div className="mt-9 grid gap-4 md:grid-cols-3">{benefits.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-3xl border border-white/10 bg-card p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-300/30 hover:shadow-xl hover:shadow-emerald-950/20"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-300"><Icon size={22} /></span><h3 className="mt-5 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></article>)}</div>
        </section>

        <section className="border-y border-white/5 bg-slate-950/35">
            <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:items-center md:py-20">
                <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">See KHAANA in action</p><h2 className="mt-3 text-3xl font-black">A quick look around the app.</h2><p className="mt-3 text-sm leading-6 text-slate-400">Browse the customer experience and see how people discover local meals.</p><Link to="/partner/signup" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-orange-400">Start a partner application <ArrowRight size={16} /></Link></div>
                <video className="w-full rounded-3xl border border-white/10 bg-black shadow-2xl" controls preload="metadata" aria-label="KHAANA food delivery app demo"><source src={demoVideo} type="video/mp4" />Your browser does not support embedded video.</video>
            </div>
        </section>

        <section id="getting-started" className="scroll-mt-24 border-y border-white/5 bg-slate-950/35">
            <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20">
                <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">Getting started</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">A few steps to your first order.</h2></div>
                <ol className="mt-8 grid gap-4 md:grid-cols-3">{[{ n: "01", title: "Talk with our team", text: "Share your restaurant details and let us know you would like to partner." }, { n: "02", title: "Set up your profile", text: "Add your restaurant information, dishes, prices, and photos." }, { n: "03", title: "Welcome your orders", text: "Keep your menu current and manage incoming orders from your dashboard." }].map((step) => <li key={step.n} className="rounded-3xl border border-white/10 bg-card/80 p-6"><span className="text-sm font-black text-emerald-300">{step.n}</span><h3 className="mt-4 text-lg font-bold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{step.text}</p></li>)}</ol>
                <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-3xl border border-orange-300/15 bg-orange-400/[0.06] p-6 sm:p-8 md:flex-row md:items-center"><div><h3 className="text-xl font-black">Ready to partner with KHAANA?</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Send a partner application for review. Approved partners will receive account setup instructions; existing restaurant owners can sign in.</p></div><div className="flex shrink-0 flex-wrap gap-3"><Link to="/partner/signup" className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold transition hover:bg-white/5">Apply to partner</Link><Link to="/login" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold transition hover:bg-orange-400">Sign in <ArrowRight size={16} /></Link></div></div>
            </div>
        </section>

    </main>;
}
