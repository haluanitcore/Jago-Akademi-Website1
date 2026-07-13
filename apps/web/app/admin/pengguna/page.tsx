"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  provider: string;
  createdAt: string;
  roles: { role: { name: string } }[];
  _count?: { enrollments: number; orders: number };
};

function getToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("access_token") || sessionStorage.getItem("jg_token");
}

const ROLES_COLOR: Record<string, string> = {
  super_admin: "bg-purple-100 text-purple-700",
  admin: "bg-blue-100 text-blue-700",
  trainer: "bg-orange-100 text-orange-700",
  student: "bg-green-100 text-green-700",
};

export default function AdminPenggunaPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedRole, setSelectedRole] = useState("all");
  const limit = 10;

  function loadUsers() {
    const token = getToken();
    if (!token) return;

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(search ? { search } : {}),
      ...(selectedRole !== "all" ? { role: selectedRole } : {}),
    });

    setLoading(true);
    fetch(`/api/admin/users?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((body) => {
        if (body.success) {
          setUsers(body.data?.users ?? body.data ?? []);
          setTotal(body.data?.total ?? 0);
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadUsers(); }, [page, selectedRole]); // eslint-disable-line

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadUsers();
  }

  function toggleVerify(userId: string, current: boolean) {
    const token = getToken();
    if (!token) return;
    fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ isVerified: !current }),
    }).then(() => loadUsers());
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="up-page">
      {/* Header */}
      <div className="up-header">
        <div>
          <h1 className="up-title">Manajemen Pengguna</h1>
          <p className="up-sub">{total.toLocaleString("id-ID")} pengguna terdaftar</p>
        </div>
      </div>

      {/* Filters */}
      <div className="up-filters">
        <form onSubmit={handleSearch} className="up-search-form">
          <input
            className="up-search-input"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="up-search-btn">🔍 Cari</button>
        </form>
        <div className="up-role-tabs">
          {["all", "student", "trainer", "admin", "super_admin"].map((role) => (
            <button
              key={role}
              onClick={() => { setSelectedRole(role); setPage(1); }}
              className={`up-role-tab ${selectedRole === role ? "up-role-active" : ""}`}
            >
              {role === "all" ? "Semua" : role.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="up-table-wrap">
        {loading ? (
          <div className="up-loading"><span className="up-spinner" /></div>
        ) : users.length === 0 ? (
          <div className="up-empty">
            <p>👥</p><p>Tidak ada pengguna ditemukan</p>
          </div>
        ) : (
          <table className="up-table">
            <thead>
              <tr>
                <th>Pengguna</th>
                <th>Role</th>
                <th>Status</th>
                <th>Provider</th>
                <th>Kursus</th>
                <th>Bergabung</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const roleNames = user.roles?.map((r) => r.role.name) ?? [];
                const primaryRole = roleNames[0] ?? "student";
                const initials = user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="up-user-cell">
                        <div className="up-user-avatar">{initials}</div>
                        <div>
                          <p className="up-user-name">{user.name}</p>
                          <p className="up-user-email">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      {roleNames.map((r) => (
                        <span key={r} className={`up-badge ${ROLES_COLOR[r] ?? "bg-gray-100 text-gray-600"}`}>
                          {r.replace("_", " ")}
                        </span>
                      ))}
                    </td>
                    <td>
                      <span className={`up-badge ${user.isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {user.isVerified ? "✓ Terverifikasi" : "⏳ Belum"}
                      </span>
                    </td>
                    <td><span className="up-provider">{user.provider ?? "email"}</span></td>
                    <td><span className="up-count">{user._count?.enrollments ?? 0}</span></td>
                    <td>
                      <span className="up-date">
                        {new Date(user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </td>
                    <td>
                      <div className="up-actions">
                        <button
                          className={`up-action-btn ${user.isVerified ? "up-btn-warn" : "up-btn-success"}`}
                          onClick={() => toggleVerify(user.id, user.isVerified)}
                          title={user.isVerified ? "Cabut verifikasi" : "Verifikasi email"}
                        >
                          {user.isVerified ? "Cabut" : "Verifikasi"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="up-pagination">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="up-page-btn">← Prev</button>
          <span className="up-page-info">Halaman {page} dari {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="up-page-btn">Next →</button>
        </div>
      )}

      <style jsx>{`
        .up-page { display: flex; flex-direction: column; gap: 20px; max-width: 1200px; }
        .up-header { display: flex; align-items: center; justify-content: space-between; }
        .up-title { font-size: 20px; font-weight: 800; color: #1D1D1F; }
        .up-sub { font-size: 13px; color: #6E6E73; margin-top: 3px; }

        .up-filters { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .up-search-form { display: flex; gap: 8px; flex: 1; min-width: 240px; }
        .up-search-input {
          flex: 1; padding: 9px 14px; border-radius: 10px;
          border: 1.5px solid #E5E5EA; font-size: 13px; outline: none;
        }
        .up-search-input:focus { border-color: #0077A8; box-shadow: 0 0 0 3px rgba(0,119,168,0.1); }
        .up-search-btn {
          padding: 9px 16px; border-radius: 10px; background: #0077A8;
          color: white; border: none; font-size: 13px; font-weight: 600; cursor: pointer;
        }
        .up-search-btn:hover { background: #005f87; }

        .up-role-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
        .up-role-tab {
          padding: 7px 14px; border-radius: 999px; font-size: 12px; font-weight: 600;
          border: 1.5px solid #E5E5EA; background: white; cursor: pointer;
          color: #6E6E73; transition: all 0.18s; text-transform: capitalize;
        }
        .up-role-active { background: #0077A8; color: white; border-color: #0077A8; }

        .up-table-wrap { background: white; border-radius: 18px; overflow: hidden; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        .up-table { width: 100%; border-collapse: collapse; }
        .up-table thead tr { background: #F9FAFB; border-bottom: 1px solid #F0F0F5; }
        .up-table th { padding: 12px 16px; font-size: 11px; font-weight: 700; color: #6E6E73; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; white-space: nowrap; }
        .up-table td { padding: 12px 16px; font-size: 13px; color: #1D1D1F; border-bottom: 1px solid #F5F5F7; }
        .up-table tr:last-child td { border-bottom: none; }
        .up-table tr:hover td { background: #FAFAFA; }

        .up-user-cell { display: flex; align-items: center; gap: 10px; }
        .up-user-avatar {
          width: 34px; height: 34px; border-radius: 10px;
          background: linear-gradient(135deg, #0077A8, #7C3AED);
          color: white; font-size: 11px; font-weight: 800;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .up-user-name { font-size: 13px; font-weight: 600; }
        .up-user-email { font-size: 11px; color: #6E6E73; }

        .up-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 999px; display: inline-block; margin: 1px; text-transform: capitalize; }
        .up-provider { font-size: 12px; color: #6E6E73; background: #F5F5F7; padding: 3px 8px; border-radius: 6px; }
        .up-count { font-size: 13px; font-weight: 700; color: #0077A8; }
        .up-date { font-size: 12px; color: #6E6E73; }

        .up-actions { display: flex; gap: 6px; }
        .up-action-btn { padding: 5px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; border: none; cursor: pointer; transition: all 0.18s; }
        .up-btn-success { background: #DCFCE7; color: #16A34A; }
        .up-btn-success:hover { background: #16A34A; color: white; }
        .up-btn-warn { background: #FEF3C7; color: #D97706; }
        .up-btn-warn:hover { background: #D97706; color: white; }

        .up-loading { display: flex; justify-content: center; align-items: center; padding: 48px; }
        .up-spinner { width: 32px; height: 32px; border-radius: 50%; border: 3px solid #0077A8; border-top-color: transparent; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .up-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 48px; color: #9CA3AF; font-size: 14px; }
        .up-empty p:first-child { font-size: 32px; }

        .up-pagination { display: flex; align-items: center; justify-content: center; gap: 16px; }
        .up-page-btn { padding: 8px 16px; border-radius: 10px; border: 1.5px solid #E5E5EA; background: white; font-size: 13px; font-weight: 600; cursor: pointer; color: #1D1D1F; transition: all 0.18s; }
        .up-page-btn:hover:not(:disabled) { border-color: #0077A8; color: #0077A8; }
        .up-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .up-page-info { font-size: 13px; color: #6E6E73; }
      `}</style>
    </div>
  );
}
