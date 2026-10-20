import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowRight, BriefcaseBusiness, Building2, CheckCircle2, Clock3, MapPin, Search, Send, Users } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../Api/axios";

const initialForm = { fullName: "", email: "", phone: "", jobId: "" };
export default function Careers() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [query, setQuery] = useState("");
    const [department, setDepartment] = useState("All departments");
    const [employmentType, setEmploymentType] = useState("All types");
    const [form, setForm] = useState(initialForm);
    const [cv, setCv] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        document.title = "Careers | KHAANA";
        let active = true;
        axiosInstance.get("/careers/jobs").then(({ data }) => { if (active) setJobs(data.jobs || []); })
            .catch(() => { if (active) setLoadError("We couldn’t load current roles. Please try again shortly."); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    const departments = useMemo(() => ["All departments", ...new Set(jobs.map((job) => job.department))], [jobs]);
    const types = useMemo(() => ["All types", ...new Set(jobs.map((job) => job.type))], [jobs]);
    const filtered = jobs.filter((job) => {
        const term = query.trim().toLowerCase();
        const matches = !term || [job.title, job.department, job.location, job.summary].some((value) => value?.toLowerCase().includes(term));
        return matches && (department === "All departments" || job.department === department) && (employmentType === "All types" || job.type === employmentType);
    });
    const chooseJob = (jobId) => {
        setForm((current) => ({ ...current, jobId }));
        document.getElementById("apply")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const submit = async (event) => {
        event.preventDefault();
        const formElement = event.currentTarget;
        if (!form.jobId) { toast.error("Choose an open position first."); return; }
        if (!cv || cv.type !== "application/pdf" || cv.size > 5 * 1024 * 1024) { toast.error("Choose a PDF CV no larger than 5 MB."); return; }
        const body = new FormData();
        Object.entries(form).forEach(([key, value]) => body.append(key, value));
        body.append("cv", cv);
        setSubmitting(true);
        setSubmitted(false);
        try {
            const { data } = await axiosInstance.post("/careers/applications", body, { headers: { "Content-Type": "multipart/form-data" } });
            toast.success(data.message || "Application received.");
            setSubmitted(true);
            setForm(initialForm);
            setCv(null);
            formElement.reset();
        } catch (error) {
            toast.error(error.response?.data?.message || "We couldn’t submit your application. Please try again.");
        } finally { setSubmitting(false); }
    };

    return <main className="min-h-screen bg-primary text-white">
        <section className="border-b border-white/5 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/20 via-primary to-primary"><div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"><div className="max-w-3xl"><span className="inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-300"><Users size={15} /> Careers at KHAANA</span><h1 className="mt-6 text-4xl font-black leading-tight sm:text-6xl">Make good food easier to find.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">Help build a thoughtful connection between local kitchens and the people who love them.</p><a href="#open-roles" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold hover:bg-orange-600">Explore open roles <ArrowDown size={16} /></a></div></div></section>
        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20"><div className="grid gap-4 md:grid-cols-3"><article className="rounded-3xl border border-white/10 bg-card p-6"><span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-500/15 text-orange-400"><HeartIcon /></span><h2 className="mt-5 text-lg font-bold">Work with purpose</h2><p className="mt-2 text-sm leading-6 text-slate-400">Help make everyday food discovery more useful for customers and local restaurants.</p></article><article className="rounded-3xl border border-white/10 bg-card p-6"><span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-500/15 text-orange-400"><Building2 /></span><h2 className="mt-5 text-lg font-bold">Build together</h2><p className="mt-2 text-sm leading-6 text-slate-400">Bring your perspective, share what you learn, and make the product better as a team.</p></article><article className="rounded-3xl border border-white/10 bg-card p-6"><span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-500/15 text-orange-400"><BriefcaseBusiness /></span><h2 className="mt-5 text-lg font-bold">Grow your craft</h2><p className="mt-2 text-sm leading-6 text-slate-400">Take on meaningful work and keep learning as we grow the experience.</p></article></div></section>
        <section id="open-roles" className="scroll-mt-24 border-y border-white/5 bg-slate-950/30"><div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">Come build with us</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">Open roles</h2><p className="mt-3 text-sm text-slate-400">Explore opportunities currently accepting applications.</p></div><span className="text-sm text-slate-400">{loading ? "Loading roles…" : filtered.length + " roles"}</span></div>
            <div className="mt-7 grid gap-3 rounded-2xl border border-white/10 bg-card p-4 md:grid-cols-[1fr_220px_190px]"><label className="flex items-center gap-3 rounded-xl border border-white/10 bg-primary px-3"><Search size={17} className="text-slate-500" /><span className="sr-only">Search jobs</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, team, location…" className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-500" /></label><label className="sr-only" htmlFor="department-filter">Filter by department</label><select id="department-filter" value={department} onChange={(event) => setDepartment(event.target.value)} className="rounded-xl border border-white/10 bg-primary px-3 py-3 text-sm text-slate-200">{departments.map((item) => <option key={item}>{item}</option>)}</select><label className="sr-only" htmlFor="type-filter">Filter by employment type</label><select id="type-filter" value={employmentType} onChange={(event) => setEmploymentType(event.target.value)} className="rounded-xl border border-white/10 bg-primary px-3 py-3 text-sm text-slate-200">{types.map((item) => <option key={item}>{item}</option>)}</select></div>
            <div className="mt-6 space-y-4">{loading && <p className="rounded-2xl border border-white/10 bg-card p-8 text-center text-sm text-slate-400">Finding current opportunities…</p>}{!loading && loadError && <p role="alert" className="rounded-2xl border border-red-400/20 bg-red-500/5 p-8 text-center text-sm text-red-200">{loadError}</p>}
                {!loading && !loadError && filtered.map((job) => <article key={job.id} className="rounded-3xl border border-white/10 bg-card p-6 transition hover:border-orange-400/30 sm:p-7"><div className="flex flex-col justify-between gap-5 md:flex-row"><div className="max-w-3xl"><div className="flex flex-wrap gap-2"><span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">{job.department}</span><span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">{job.type}</span></div><h3 className="mt-4 text-xl font-bold">{job.title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{job.summary}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400"><span className="inline-flex items-center gap-1.5"><MapPin size={14} />{job.location}</span>{job.deadline && <span className="inline-flex items-center gap-1.5"><Clock3 size={14} />Apply by {new Date(job.deadline).toLocaleDateString()}</span>}</div><details className="mt-5 text-sm"><summary className="cursor-pointer font-semibold text-slate-200">Role details</summary><div className="grid gap-5 pt-4 sm:grid-cols-2"><div><h4 className="font-semibold text-orange-300">Responsibilities</h4><p className="mt-2 whitespace-pre-line leading-6 text-slate-400">{job.responsibilities}</p></div><div><h4 className="font-semibold text-orange-300">Qualifications</h4><p className="mt-2 whitespace-pre-line leading-6 text-slate-400">{job.qualifications}</p></div></div></details></div><button type="button" onClick={() => chooseJob(job.id)} className="inline-flex h-fit shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold hover:bg-orange-600">Apply now <ArrowRight size={16} /></button></div></article>)}
                {!loading && !loadError && filtered.length === 0 && <div className="rounded-3xl border border-dashed border-white/15 px-6 py-12 text-center"><BriefcaseBusiness className="mx-auto text-slate-500" /><h3 className="mt-4 text-lg font-bold">{jobs.length ? "No roles match those filters" : "No open roles just yet"}</h3><p className="mt-2 text-sm text-slate-400">{jobs.length ? "Try another keyword or filter." : "Check back soon for new opportunities."}</p></div>}
            </div></div></section>
        <section id="apply" className="mx-auto max-w-4xl scroll-mt-24 px-5 py-16 sm:px-8 md:py-20"><div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">Take the next step</p><h2 className="mt-3 text-3xl font-black">Apply for a role</h2><p className="mt-3 text-sm leading-6 text-slate-400">Choose an open position and share your details.</p></div>
            {submitted && <p role="status" className="mt-7 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200"><CheckCircle2 size={18} />Your application was received.</p>}
            <form onSubmit={submit} className="mt-7 grid gap-5 rounded-3xl border border-white/10 bg-card p-6 sm:grid-cols-2 sm:p-8">
                <label className="text-sm font-medium text-slate-200">Full name<input required minLength="2" maxLength="120" autoComplete="name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-primary px-4 py-3 text-sm outline-none focus:border-orange-400" /></label>
                <label className="text-sm font-medium text-slate-200">Email<input required type="email" maxLength="254" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-primary px-4 py-3 text-sm outline-none focus:border-orange-400" /></label>
                <label className="text-sm font-medium text-slate-200">Phone<input required type="tel" minLength="7" maxLength="24" autoComplete="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-primary px-4 py-3 text-sm outline-none focus:border-orange-400" /></label>
                <label className="text-sm font-medium text-slate-200">Position<select required value={form.jobId} onChange={(event) => setForm({ ...form, jobId: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-primary px-4 py-3 text-sm outline-none focus:border-orange-400"><option value="">Choose an open role</option>{jobs.map((job) => <option key={job.id} value={job.id}>{job.title} · {job.department}</option>)}</select></label>
                <label className="text-sm font-medium text-slate-200 sm:col-span-2">CV (PDF, up to 5 MB)<input required type="file" accept=".pdf,application/pdf" onChange={(event) => setCv(event.target.files?.[0] || null)} className="mt-2 block w-full rounded-xl border border-white/10 bg-primary px-4 py-3 text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-orange-500/15 file:px-3 file:py-2 file:text-xs file:font-bold file:text-orange-300" /><span className="mt-2 block text-xs text-slate-500">PDF files only. Your CV is stored privately and available only to administrators reviewing applications.</span></label>
                <button disabled={submitting || loading || jobs.length === 0} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2">{submitting ? "Sending application…" : "Submit application"} <Send size={16} /></button>
            </form>
        </section>
    </main>;
}
function HeartIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg>; }