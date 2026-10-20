import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, BadgeCheck, LoaderCircle, Store } from "lucide-react";
import axiosInstance from "../../Api/axios";

const initialForm = { ownerName: "", email: "", phone: "", restaurantName: "", location: "", cuisine: "", password: "", confirmPassword: "" };

export default function PartnerSignup() {
    const [form, setForm] = useState(initialForm);
    const [submitting, setSubmitting] = useState(false);
    const [application, setApplication] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => { document.title = "Partner signup | KHAANA"; }, []);

    const submit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            const { data } = await axiosInstance.post("/partners/applications", form);
            setApplication(data.application);
            setForm(initialForm);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "We could not send your application. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return <main className="min-h-screen bg-primary px-5 py-12 text-white sm:px-8 sm:py-16">
        <div className="mx-auto max-w-3xl">
            <Link to="/partner" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"><ArrowLeft size={16} /> Back to partner information</Link>
            <div className="mt-8 rounded-[2rem] border border-white/10 bg-card p-6 shadow-2xl sm:p-9">
                {application ? (
                    <div className="py-6 text-center">
                        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-300"><BadgeCheck size={28} /></span>
                        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Application received</p>
                        <h1 className="mt-3 text-3xl font-black">Thanks, {application.ownerName}.</h1>
                        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-300">Your application for <strong className="text-white">{application.restaurantName}</strong> is pending review. Reference: <span className="font-mono text-emerald-200">{application.id}</span>.</p>
                        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">Your account and restaurant profile are created after an administrator approves the application. You can then sign in below with the email and password you chose.</p>
                        <Link to="/login" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold transition hover:bg-orange-400">Go to login <ArrowRight size={16} /></Link>
                    </div>
                ) : (
                    <>
                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-400/10 text-orange-300"><Store size={23} /></span>
                        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-orange-400">Partner application</p>
                        <h1 className="mt-3 text-3xl font-black sm:text-4xl">Tell us about your restaurant.</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Share a few details about your kitchen. Applications are reviewed before restaurant owner accounts are set up.</p>
                        {error && <p role="alert" className="mt-6 rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</p>}
                        <form onSubmit={submit} className="mt-7 grid gap-5 sm:grid-cols-2">
                            <Field label="Owner or contact name" autoComplete="name" value={form.ownerName} onChange={(ownerName) => setForm({ ...form, ownerName })} minLength={2} maxLength={100} />
                            <Field label="Email address" type="email" autoComplete="email" value={form.email} onChange={(email) => setForm({ ...form, email })} maxLength={254} />
                            <Field label="Phone number" type="tel" autoComplete="tel" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} minLength={7} maxLength={24} placeholder="98XXXXXXXX" />
                            <Field label="Restaurant name" autoComplete="organization" value={form.restaurantName} onChange={(restaurantName) => setForm({ ...form, restaurantName })} minLength={2} maxLength={120} />
                            <Field label="City or area" autoComplete="address-level2" value={form.location} onChange={(location) => setForm({ ...form, location })} minLength={2} maxLength={120} />
                            <Field label="Cuisine type" value={form.cuisine} onChange={(cuisine) => setForm({ ...form, cuisine })} minLength={2} maxLength={100} placeholder="e.g. Newari, pizza, bakery" />
                            <Field label="Create password" type="password" autoComplete="new-password" value={form.password} onChange={(password) => setForm({ ...form, password })} minLength={8} maxLength={128} placeholder="At least 8 characters" />
                            <Field label="Confirm password" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={(confirmPassword) => setForm({ ...form, confirmPassword })} minLength={8} maxLength={128} placeholder="Enter the same password" />
                            <p className="text-xs leading-5 text-slate-500 sm:col-span-2">Your password is stored as a secure hash. The owner account is created only after approval, and you will need to sign in after approval.</p>
                            <button disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold transition hover:bg-orange-400 disabled:cursor-wait disabled:opacity-60 sm:col-span-2">{submitting ? <><LoaderCircle size={17} className="animate-spin" /> Sending application</> : <>Send application <ArrowRight size={16} /></>}</button>
                        </form>
                    </>
                )}
            </div>
        </div>
    </main>;
}

function Field({ label, type = "text", value, onChange, placeholder, autoComplete, minLength, maxLength }) {
    return <label className="text-sm font-medium text-slate-200">{label}<input required type={type} autoComplete={autoComplete} value={value} minLength={minLength} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} placeholder={placeholder || label} className="mt-2 w-full rounded-xl border border-white/10 bg-primary px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-orange-400" /></label>;
}
