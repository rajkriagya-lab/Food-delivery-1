import { CircleCheckBig, CircleX, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

export default function PaymentResult() {
    const [params] = useSearchParams();
    const successful = params.get("status") === "success";
    const cancelled = params.get("status") === "cancelled";
    const provider = params.get("provider") === "khalti" ? "Khalti" : "eSewa";
    return <div className="min-h-screen bg-primary text-white flex items-center justify-center p-5"><section className="w-full max-w-md bg-card border border-gray-800 rounded-3xl text-center p-8 shadow-2xl">{successful ? <CircleCheckBig size={52} className="mx-auto text-emerald-400" /> : <CircleX size={52} className="mx-auto text-red-400" />}<h1 className="mt-5 text-2xl font-black">{successful ? "Payment successful" : cancelled ? "Payment cancelled" : "Payment not completed"}</h1><p className="mt-3 text-sm text-gray-400">{successful ? `Your ${provider} payment is verified and your order is confirmed.` : "No payment was confirmed. You can return to your orders or try again from checkout."}</p>{params.get("orderId") && <p className="mt-3 text-xs text-gray-500">Order ID: {params.get("orderId")}</p>}<Link to="/orders" className="mt-7 inline-flex w-full justify-center rounded-xl bg-btn py-3 text-sm font-bold">View my orders</Link></section></div>;
}
