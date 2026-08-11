import { prisma } from "../db.js";

export const getAdminOverview = async (req, res) => {
  try {
    const [totalUsers, totalCustomers, totalRestaurantOwners, totalRestaurants, totalOrders, pendingOrders, deliveredOrders, cancelledOrders, revenueData] = await Promise.all([
      prisma.user.count(), prisma.user.count({ where: { role: "CUSTOMER" } }), prisma.user.count({ where: { role: "RESTURANT_OWNER" } }), prisma.restaurant.count(), prisma.order.count(), prisma.order.count({ where: { orderStatus: "PENDING" } }), prisma.order.count({ where: { orderStatus: "DELIVERED" } }), prisma.order.count({ where: { orderStatus: "CANCELLED" } }), prisma.order.aggregate({ where: { orderStatus: "DELIVERED" }, _sum: { grantTotal: true } }),
    ]);
    res.status(200).json({ success: true, overview: { totalUsers, totalCustomers, totalRestaurantOwners, totalRestaurants, totalOrders, pendingOrders, deliveredOrders, cancelledOrders, totalRevenue: revenueData._sum.grantTotal || 0 } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true } });
    res.status(200).json({ success: true, totalUsers: users.length, users });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await prisma.restaurant.findMany({ orderBy: { createdAt: "desc" }, include: { owner: { select: { id: true, name: true, email: true } }, _count: { select: { food: true, categories: true, orders: true, reviews: true } } } });
    res.status(200).json({ success: true, totalRestaurants: restaurants.length, restaurants });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { user: { select: { id: true, name: true, email: true } }, restaurant: { select: { id: true, name: true, city: true } }, address: true, items: true } });
    res.status(200).json({ success: true, totalOrders: orders.length, orders });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const toggelRestaurantStatus = async (req, res) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({ where: { id: req.params.id } });
    if (!restaurant) return res.status(404).json({ success: false, message: "Restaurant not found." });
    const updatedRestaurant = await prisma.restaurant.update({ where: { id: restaurant.id }, data: { isOpen: !restaurant.isOpen } });
    res.status(200).json({ success: true, message: `Restaurant is now ${updatedRestaurant.isOpen ? "open" : "closed"}.`, restaurant: updatedRestaurant });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const deleteUsers = async (req, res) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ success: false, message: "Admin cannot delete own account." });
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    await prisma.user.delete({ where: { id: user.id } });
    res.status(200).json({ success: true, message: "User deleted successfully." });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
