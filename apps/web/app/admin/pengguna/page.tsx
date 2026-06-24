"use client";

import { useEffect, useState, useCallback } from "react";

type UserRow = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  roles: { role: string }[];
  _count: { enrollments: number };
};

export default function AdminPenggunaPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const LIMIT = 20;

  const fetchUsers = useCallback(async () => {
    const token = sessionStorage.getItem("access_token");
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) params.set("search", search);
      const res = await fetch(`${API}/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const body = await res.json();
      if (body.success) {
        setUsers(body.data);
        setTotal(body.meta?.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [API, page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function toggleStatus(userId: string, currentStatus: boolean) {
    const token = sessionStorage.getItem("access_token");
    if (!token) return;
    setTogglingId(userId);
    try {
      const res = await fetch(`${API}/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const body = await res.json();
      if (body.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isActive: !currentStatus } : u))
        );
      }
    } finally {
      setTogglingId(null);
    }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1D1F]">Manajemen Pengguna</h1>
          <p className="text-[#6E6E73] text-sm mt-1">{total.toLocaleString("id-ID")} pengguna terdaftar</p>
        </div>
      </div>

      {/* Search */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setSearch(searchInput);
        }}
        className="flex gap-2"
      >
        <input
          type="search"
          placeholder="Cari nama atau email..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="input-dark flex-1 max-w-sm"
        />
        <button type="submit" className="btn-primary px-4 py-2 text-sm">
          Cari
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-[#3C3C43]">Nama</th>
                <th className="text-left px-4 py-3 font-semibold text-[#3C3C43]">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-[#3C3C43]">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-[#3C3C43]">Kursus</th>
                <th className="text-left px-4 py-3 font-semibold text-[#3C3C43]">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-[#3C3C43]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5EA]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#6E6E73]">
                    Memuat...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#6E6E73]">
                    Tidak ada pengguna ditemukan.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#F5F5F7] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#1D1D1F]">{user.name}</td>
                    <td className="px-4 py-3 text-[#3C3C43]">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-[#E8F4F9] text-[#0077A8] font-medium">
                        {user.roles[0]?.role ?? "student"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#3C3C43]">{user._count.enrollments}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {user.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={togglingId === user.id}
                        onClick={() => toggleStatus(user.id, user.isActive)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                          user.isActive
                            ? "bg-red-50 text-red-700 hover:bg-red-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {togglingId === user.id ? "..." : user.isActive ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-[#E5E5EA] flex items-center justify-between">
            <p className="text-sm text-[#6E6E73]">
              Halaman {page} dari {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-sm rounded-lg border border-[#E5E5EA] text-[#3C3C43] hover:bg-[#F5F5F7] disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-sm rounded-lg border border-[#E5E5EA] text-[#3C3C43] hover:bg-[#F5F5F7] disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
