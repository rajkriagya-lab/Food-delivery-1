import { useState } from "react";
import { ArrowLeft, Loader2, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../Api/axios";

const initialForm = {
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nepal",
    isDefault: true,
};

export default function AddAddress() {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [saving, setSaving] = useState(false);

    const updateField = (event) => {
        const { name, value, type, checked } = event.target;
        setForm((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            setSaving(true);
            const { data } = await axiosInstance.post("/address/create", form);
            toast.success(data.message || "Address added successfully");
            navigate("/checkout", { replace: true });
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to add address");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary text-white py-10 px-5">
            <div className="max-w-2xl mx-auto">
                <button
                    type="button"
                    onClick={() => navigate("/checkout")}
                    className="mb-6 flex items-center gap-2 text-sm text-gray-300 hover:text-white cursor-pointer"
                >
                    <ArrowLeft size={18} /> Back to checkout
                </button>

                <form onSubmit={handleSubmit} className="bg-card/70 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                    <h1 className="text-2xl font-black flex items-center gap-2 mb-1">
                        <MapPin className="text-btn" /> Add delivery address
                    </h1>
                    <p className="text-sm text-gray-400 mb-6">This address will be available at checkout.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Full name" name="fullName" value={form.fullName} onChange={updateField} required />
                        <Field label="Phone number" name="phone" type="tel" value={form.phone} onChange={updateField} required />
                        <div className="sm:col-span-2">
                            <Field label="Street address" name="street" value={form.street} onChange={updateField} required />
                        </div>
                        <Field label="City" name="city" value={form.city} onChange={updateField} required />
                        <Field label="State / Province" name="state" value={form.state} onChange={updateField} />
                        <Field label="Country" name="country" value={form.country} onChange={updateField} />
                    </div>

                    <label className="mt-5 flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input name="isDefault" type="checkbox" checked={form.isDefault} onChange={updateField} className="accent-btn" />
                        Set as my default delivery address
                    </label>

                    <button
                        type="submit"
                        disabled={saving}
                        className="mt-6 w-full bg-btn rounded-xl py-3 font-bold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                        {saving && <Loader2 size={18} className="animate-spin" />}
                        {saving ? "Saving address..." : "Save address"}
                    </button>
                </form>
            </div>
        </div>
    );
}

function Field({ label, ...inputProps }) {
    return (
        <label className="block text-sm font-medium text-gray-300">
            {label}
            <input
                {...inputProps}
                className="mt-1.5 w-full rounded-xl bg-primary/60 border border-gray-700 px-3 py-2.5 text-white outline-none focus:border-btn"
            />
        </label>
    );
}
