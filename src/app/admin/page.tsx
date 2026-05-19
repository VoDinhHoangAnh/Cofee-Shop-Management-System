"use client";

import { useEffect, useState } from "react";

interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  activeProducts: number;
  staffActive: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todayOrders: 0,
    todayRevenue: 0,
    activeProducts: 0,
    staffActive: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch("/api/admin/orders"),
        fetch("/api/admin/products"),
      ]);

      const orders = ordersRes.ok ? await ordersRes.json() : [];
      const products = productsRes.ok ? await productsRes.json() : [];

      // Calculate today's stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayOrders = orders.filter(
        (o: any) => new Date(o.createdAt).getTime() >= today.getTime(),
      );
      const todayRevenue = todayOrders.reduce(
        (sum: number, o: any) => sum + (o.totalPrice || 0),
        0,
      );

      setStats({
        todayOrders: todayOrders.length,
        todayRevenue,
        activeProducts: products.filter((p: any) => p.isAvailable).length,
        staffActive: 1, // Could be fetched from users API
      });
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
      <p className="mt-4 text-gray-600">
        Chào mừng đến với hệ thống quản lý quán cafe. Sử dụng sidebar để quản lý
        menu, đơn hàng và nhật ký.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow text-black">
          <p className="text-sm font-medium text-gray-500">Đơn hàng hôm nay</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats.todayOrders}
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow text-black">
          <p className="text-sm font-medium text-gray-500">Doanh thu hôm nay</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats.todayRevenue.toLocaleString()}đ
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow text-black">
          <p className="text-sm font-medium text-gray-500">Sản phẩm hiện có</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats.activeProducts}
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow text-black">
          <p className="text-sm font-medium text-gray-500">
            Nhân viên hoạt động
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats.staffActive}
          </p>
        </div>
      </div>
    </div>
  );
}
