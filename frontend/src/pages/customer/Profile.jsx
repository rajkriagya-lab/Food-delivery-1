import { useEffect, useMemo, useState } from "react";
import { Camera, Check, LoaderCircle, Pencil, RotateCcw, UserRound } from "lucide-react";
import axiosInstance from "../../Api/axios";
import { useAuthStore } from "../../store/authStore";

const blank = { name: "", email: "", phone: "" };
const phonePattern = /^(?:\+?977)?9[78]\d{8}$/;
const normalizePhone = (value) => {
  const digits = value.trim().replace(/[\s()+-]/g, "").replace(/^977/, "");
  return digits ? `+977${digits}` : "";
};
const errorText = (error) => error.response?.data?.message || "We couldn't reach the server. Please try again.";

export default function Profile() {
  const { user, updateProfile } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const preview = useMemo(() => selectedImage ? URL.createObjectURL(selectedImage) : null, [selectedImage]);
  const hasChanges = () => Boolean(profile && (
    form.name !== profile.name || form.email !== profile.email || normalizePhone(form.phone) !== (profile.phone || "") ||
    selectedImage || removeAvatar
  ));

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => {
    let active = true;
    axiosInstance.get("/users/me").then(({ data }) => {
      if (!active) return;
      setProfile(data.user);
      setForm({ name: data.user.name || "", email: data.user.email || "", phone: data.user.phone || "" });
    }).catch((error) => {
      if (active) setErrors({ page: errorText(error) });
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const onBeforeUnload = (event) => {
      if (editing && hasChanges()) { event.preventDefault(); event.returnValue = ""; }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  });


  const cancelEdit = () => {
    setForm({ name: profile.name || "", email: profile.email || "", phone: profile.phone || "" });
    setSelectedImage(null); setRemoveAvatar(false); setErrors({}); setEditing(false);
  };
  const validate = () => {
    const next = {};
    const name = form.name.trim().replace(/\s+/g, " ");
    if (name.length < 2 || name.length > 80) next.name = "Enter a name between 2 and 80 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Please enter a valid email address.";
    const compactPhone = form.phone.trim().replace(/[\s()-]/g, "");
    if (!phonePattern.test(compactPhone)) next.phone = "Please enter a valid Nepal mobile number.";
    if (selectedImage && (!/^image\/(jpeg|png|webp)$/.test(selectedImage.type) || selectedImage.size > 5 * 1024 * 1024)) next.avatar = "Choose a JPEG, PNG, or WebP image up to 5 MB.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };
  const save = async (event) => {
    event.preventDefault();
    if (saving || !validate()) return;
    const payload = new FormData();
    payload.append("name", form.name.trim().replace(/\s+/g, " "));
    payload.append("email", form.email.trim().toLowerCase());
    payload.append("phone", normalizePhone(form.phone));
    if (selectedImage) payload.append("avatar", selectedImage);
    if (removeAvatar) payload.append("removeAvatar", "true");
    setSaving(true); setErrors({});
    try {
      const updated = await updateProfile(payload);
      if (updated) { setProfile(updated); setForm({ name: updated.name, email: updated.email, phone: updated.phone || "" }); setSelectedImage(null); setRemoveAvatar(false); setEditing(false); }
      else setErrors((useAuthStore.getState().errorFields) || { page: "Profile update failed. Please try again." });
    } catch (error) {
      setErrors(error.response?.data?.errors || { page: errorText(error) });
    } finally { setSaving(false); }
  };
  const displayAvatar = preview || (removeAvatar ? null : profile?.avatar || user?.avatar);

  if (loading) return <main className="min-h-[70vh] grid place-items-center bg-primary text-white"><LoaderCircle className="animate-spin text-orange-400" aria-label="Loading profile" /></main>;
  if (!profile) return <main className="min-h-[70vh] bg-primary px-4 py-16 text-center text-white"><p role="alert" className="text-red-300">{errors.page || "Profile unavailable."}</p><button onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-orange-500 px-5 py-3 font-semibold">Try again</button></main>;

  return (
    <main className="min-h-[75vh] bg-primary px-4 py-12 text-white sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8"><p className="text-xs font-bold uppercase tracking-[.24em] text-orange-400">Your account</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">My Profile</h1><p className="mt-2 text-slate-400">Manage your personal details and account photo.</p></header>
        <form onSubmit={save} className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/70 shadow-2xl">
          <div className="flex flex-col gap-6 border-b border-slate-800 p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="relative h-28 w-28 shrink-0">
              <div className="grid h-full w-full place-items-center overflow-hidden rounded-full border-4 border-slate-800 bg-slate-900 text-orange-300">{displayAvatar ? <img src={displayAvatar} alt={`${profile.name} profile`} className="h-full w-full object-cover" /> : <UserRound size={40} />}</div>
              {editing && <label className="absolute bottom-0 right-0 grid h-10 w-10 cursor-pointer place-items-center rounded-full border-4 border-slate-950 bg-orange-500 text-white" aria-label="Choose profile picture"><Camera size={16} /><input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) { setSelectedImage(file); setRemoveAvatar(false); } }} /></label>}
            </div>
            <div className="min-w-0 flex-1"><h2 className="truncate text-2xl font-bold">{profile.name}</h2><p className="mt-1 truncate text-slate-400">{profile.email}</p><p className="mt-3 inline-flex rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold capitalize text-orange-300">{profile.role?.toLowerCase().replaceAll("_", " ")}</p></div>
            {!editing && <button type="button" onClick={() => { setErrors({}); setEditing(true); }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold hover:border-orange-400 hover:text-orange-300"><Pencil size={16} /> Edit profile</button>}
          </div>
          <div className="grid gap-x-6 gap-y-5 p-6 sm:grid-cols-2 sm:p-8">
            {[{ key: "name", label: "Full name", type: "text", auto: "name" }, { key: "email", label: "Email address", type: "email", auto: "email" }, { key: "phone", label: "Nepal mobile number", type: "tel", auto: "tel" }].map(({ key, label, type, auto }) => (
              <label key={key} className="block text-sm font-semibold text-slate-200">{label}<div className="mt-2"><input id={key} type={type} autoComplete={auto} disabled={!editing || saving} value={form[key]} onChange={(event) => { setForm((current) => ({ ...current, [key]: event.target.value })); setErrors((current) => ({ ...current, [key]: undefined })); }} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? `${key}-error` : undefined} placeholder={key === "phone" ? "+977 98XXXXXXXX" : `Enter your ${label.toLowerCase()}`} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none transition focus:border-orange-400 disabled:cursor-default disabled:text-slate-400" />{errors[key] && <span id={`${key}-error`} role="alert" className="mt-1 block text-xs text-red-300">{errors[key]}</span>}</div></label>
            ))}
            <div className="text-sm"><span className="font-semibold text-slate-200">Member since</span><p className="mt-3 text-slate-400">{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-NP", { year: "numeric", month: "long", day: "numeric" }) : "Not available"}</p></div>
            {editing && <div className="sm:col-span-2">{(profile.avatar || selectedImage) && <button type="button" onClick={() => { setSelectedImage(null); setRemoveAvatar(true); }} className="text-sm text-slate-400 underline decoration-slate-600 underline-offset-4 hover:text-white">Remove profile picture</button>}{errors.avatar && <p role="alert" className="mt-2 text-xs text-red-300">{errors.avatar}</p>}{errors.page && <p role="alert" className="mt-3 text-sm text-red-300">{errors.page}</p>}</div>}
          </div>
          {editing && <div className="flex flex-col-reverse gap-3 border-t border-slate-800 p-6 sm:flex-row sm:justify-end sm:px-8"><button type="button" disabled={saving} onClick={cancelEdit} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 hover:text-white disabled:opacity-50"><RotateCcw size={16} /> Cancel</button><button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60">{saving ? <LoaderCircle size={16} className="animate-spin" /> : <Check size={16} />}{saving ? "SavingÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦" : "Save changes"}</button></div>}
        </form>
        {editing && <p className="mt-4 text-center text-xs text-slate-500">Profile photos: JPEG, PNG, or WebP up to 5 MB.</p>}
      </div>
    </main>
  );
}