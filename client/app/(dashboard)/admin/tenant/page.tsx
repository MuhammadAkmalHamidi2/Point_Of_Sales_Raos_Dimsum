"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Tenant = {
  id: number;
  outletName: string;
  address: string | null;
  status: boolean;
  userId: number | null;
  user?: { username: string } | null;
  karyawans: { id: number; name: string; phone: string | null }[];
};
function getTenantPhoneLabel(tenant: Tenant) {
  const phones = tenant.karyawans.map((employee) => employee.phone).filter(Boolean);
  if (phones.length === 0) return "Belum ada karyawan jaga";
  return phones.join(" - ");
}

function TenantRow({
  tenant,
  onEdit,
  onDelete,
}: {
  tenant: Tenant;
  onEdit: (tenant: Tenant, event: React.MouseEvent) => void;
  onDelete: (id: number, event: React.MouseEvent) => void;
}) {
  return (
    <Link
      href={`/admin/tenant/${tenant.id}`}
      className="py-3.5 flex justify-between items-center hover:bg-zinc-50 -mx-5 px-5 transition-all"
    >
      <div>
        <p className="text-xs font-bold text-[#212121]">{tenant.outletName}</p>
      <p className="text-[11px] text-zinc-400 mt-0.5">{getTenantPhoneLabel(tenant)}</p>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
            tenant.status ? "bg-green-50 text-green-600" : "bg-zinc-100 text-zinc-500"
          }`}
        >
          {tenant.status ? "Aktif" : "Nonaktif"}
        </span>
        <button
          onClick={(e) => onEdit(tenant, e)}
          title="Edit"
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
          </svg>
        </button>
        <button
          onClick={(e) => onDelete(tenant.id, e)}
          title="Hapus"
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166M4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397M4.772 5.79c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </Link>
  );
}

export default function TenantPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formStatus, setFormStatus] = useState(true);

  const fetchTenants = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<{ data?: Tenant[] }>("/api/outlets");
      setTenants(response.data.data ?? []);
      setErrorMessage("");
    } catch (error) {
      console.error("Gagal mengambil data tenant:", error);
      setErrorMessage("Gagal mengambil data tenant.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadTenants = async () => {
      await fetchTenants();
    };

    void loadTenants();
  }, []);

  const openAddForm = () => {
    setEditingId(null);
    setFormName("");
    setFormAddress("");
    setFormStatus(true);
    setIsFormOpen(true);
  };

  const openEditForm = (tenant: Tenant) => {
    setEditingId(tenant.id);
    setFormName(tenant.outletName);
    setFormAddress(tenant.address ?? "");
    setFormStatus(tenant.status);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const payload = { outletName: formName.trim(), address: formAddress.trim(), status: formStatus };
      if (editingId !== null) {
        await api.put(`/api/outlets/${editingId}`, payload);
      } else {
        await api.post("/api/outlets", payload);
      }
      await fetchTenants();
      closeForm();
    } catch (error) {
      console.error("Gagal menyimpan tenant:", error);
      alert("Gagal menyimpan tenant.");
    }
  };

  const handleDelete = async (id: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const confirmed = confirm("Yakin ingin menghapus tenant ini?");
    if (!confirmed) return;
    try {
      await api.delete(`/api/outlets/${id}`);
      await fetchTenants();
    } catch (error) {
      console.error("Gagal menghapus tenant:", error);
      alert("Gagal menghapus tenant.");
    }
  };

  const handleEditClick = (tenant: Tenant, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    openEditForm(tenant);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-zinc-200/80 flex justify-between items-center shadow-2xs">
        <div>
          <h1 className="text-base md:text-xl font-bold text-[#212121]">Kelola Tenant</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Menampilkan data tenant dari server</p>
        </div>
        <button
          onClick={openAddForm}
          className="bg-[#E52424] text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-[#D91F1F] transition-all"
        >
          + Tambah Tenant
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
          <p className="text-xs text-zinc-400 py-6 text-center">Memuat data tenant...</p>
        </div>
      ) : errorMessage ? (
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
          <p className="text-xs text-red-500 py-6 text-center">{errorMessage}</p>
        </div>
      ) : tenants.length === 0 ? (
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
          <p className="text-xs text-zinc-400 py-6 text-center">Belum ada tenant.</p>
        </div>
      ) : (
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
          <div className="divide-y divide-zinc-100">
            {tenants.map((tenant) => (
              <TenantRow
                key={tenant.id}
                tenant={tenant}
                onEdit={handleEditClick}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* MODAL FORM TAMBAH/EDIT TENANT */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-[#212121]">
                {editingId !== null ? "Edit Tenant" : "Tambah Tenant"}
              </h3>
              <button
                onClick={closeForm}
                className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Nama Tenant</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Raos Dimsum - Cibiru"
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-[#E52424]"
                />
              </div>

              <p className="text-[10px] text-zinc-400 -mt-2">
                Nomor HP yang tampil di daftar diambil otomatis dari karyawan yang ditempatkan di tenant ini
                (atur di menu Karyawan).
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Alamat</label>
                <input type="text" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} placeholder="Alamat tenant" className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-[#E52424]" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Status</label>
                <select value={formStatus ? "true" : "false"} onChange={(e) => setFormStatus(e.target.value === "true")} className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-[#E52424] bg-white">
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 text-xs font-semibold hover:bg-zinc-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#E52424] text-white text-xs font-semibold hover:bg-[#D91F1F] transition-all"
                >
                  {editingId !== null ? "Simpan Perubahan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
