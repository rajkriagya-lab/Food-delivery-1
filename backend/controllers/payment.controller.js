import crypto from "crypto";
import { prisma } from "../db.js";

const frontendUrl = () => process.env.FRONTEND_URL || "http://localhost:5173";
const backendUrl = () => process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 8000}`;
const clientResultUrl = (provider, status, orderId) => `${frontendUrl()}/payment/result?provider=${provider}&status=${status}&orderId=${orderId}`;
const isLive = () => process.env.PAYMENT_MODE === "live";

const getOwnedOrder = async (id, userId) => {
    const order = await prisma.order.findUnique({ where: { id }, include: { user: true } });
    return order?.userId === userId ? order : null;
};

export const initiateEsewa = async (req, res) => {
    try {
        const order = await getOwnedOrder(req.params.orderId, req.user.id);
        const secret = process.env.ESEWA_SECRET_KEY;
        const productCode = process.env.ESEWA_PRODUCT_CODE;
        if (!order) return res.status(404).json({ success: false, message: "Order not found." });
        if (!secret || !productCode) return res.status(503).json({ success: false, message: "eSewa is not configured. Add ESEWA_SECRET_KEY and ESEWA_PRODUCT_CODE to the backend environment." });

        const totalAmount = String(order.grantTotal);
        const signedFieldNames = "total_amount,transaction_uuid,product_code";
        const message = `total_amount=${totalAmount},transaction_uuid=${order.id},product_code=${productCode}`;
        const signature = crypto.createHmac("sha256", secret).update(message).digest("base64");
        const gatewayUrl = isLive() ? "https://epay.esewa.com.np/api/epay/main/v2/form" : "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

        return res.json({ success: true, gatewayUrl, fields: {
            amount: totalAmount, tax_amount: "0", total_amount: totalAmount, transaction_uuid: order.id,
            product_code: productCode, product_service_charge: "0", product_delivery_charge: "0",
            success_url: `${backendUrl()}/api/payments/esewa/success`,
            failure_url: `${backendUrl()}/api/payments/esewa/failure?orderId=${order.id}`,
            signed_field_names: signedFieldNames, signature,
        }});
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

export const verifyEsewaSuccess = async (req, res) => {
    const encodedData = req.query.data;
    try {
        if (!encodedData || !process.env.ESEWA_SECRET_KEY) throw new Error("Missing eSewa response or configuration.");
        const decoded = JSON.parse(Buffer.from(encodedData, "base64").toString("utf8"));
        const fields = decoded.signed_field_names.split(",");
        const message = fields.map((field) => `${field}=${decoded[field]}`).join(",");
        const expected = crypto.createHmac("sha256", process.env.ESEWA_SECRET_KEY).update(message).digest("base64");
        const signatureMatches = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(decoded.signature || ""));
        const order = await prisma.order.findUnique({ where: { id: decoded.transaction_uuid } });
        const valid = signatureMatches && decoded.status === "COMPLETE" && order && Number(decoded.total_amount) === Number(order.grantTotal);
        if (!valid) return res.redirect(clientResultUrl("esewa", "failed", decoded.transaction_uuid || ""));
        await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID" } });
        return res.redirect(clientResultUrl("esewa", "success", order.id));
    } catch (error) {
        return res.redirect(clientResultUrl("esewa", "failed", ""));
    }
};

export const esewaFailure = (req, res) => res.redirect(clientResultUrl("esewa", "cancelled", req.query.orderId || ""));

export const initiateKhalti = async (req, res) => {
    try {
        const order = await getOwnedOrder(req.params.orderId, req.user.id);
        const secret = process.env.KHALTI_SECRET_KEY;
        if (!order) return res.status(404).json({ success: false, message: "Order not found." });
        if (!secret) return res.status(503).json({ success: false, message: "Khalti is not configured. Add KHALTI_SECRET_KEY to the backend environment." });
        const baseUrl = isLive() ? "https://khalti.com/api/v2" : "https://dev.khalti.com/api/v2";
        const response = await fetch(`${baseUrl}/epayment/initiate/`, {
            method: "POST", headers: { Authorization: `Key ${secret}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                return_url: `${backendUrl()}/api/payments/khalti/return`, website_url: frontendUrl(),
                amount: Math.round(Number(order.grantTotal) * 100), purchase_order_id: order.id,
                purchase_order_name: `Food order ${order.id}`, customer_info: { name: order.user.name, email: order.user.email },
            }),
        });
        const data = await response.json();
        if (!response.ok) return res.status(502).json({ success: false, message: data.detail || "Khalti could not initiate the payment." });
        return res.json({ success: true, paymentUrl: data.payment_url });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

export const verifyKhaltiReturn = async (req, res) => {
    const { pidx, purchase_order_id: orderId } = req.query;
    try {
        if (!pidx || !orderId || !process.env.KHALTI_SECRET_KEY) throw new Error("Missing Khalti payment data.");
        const baseUrl = isLive() ? "https://khalti.com/api/v2" : "https://dev.khalti.com/api/v2";
        const lookup = await fetch(`${baseUrl}/epayment/lookup/`, { method: "POST", headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ pidx }) });
        const payment = await lookup.json();
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        const valid = lookup.ok && payment.status === "Completed" && order && Number(payment.total_amount) === Math.round(Number(order.grantTotal) * 100);
        if (!valid) return res.redirect(clientResultUrl("khalti", "failed", orderId));
        await prisma.order.update({ where: { id: orderId }, data: { paymentStatus: "PAID" } });
        return res.redirect(clientResultUrl("khalti", "success", orderId));
    } catch (error) { return res.redirect(clientResultUrl("khalti", "failed", orderId || "")); }
};
