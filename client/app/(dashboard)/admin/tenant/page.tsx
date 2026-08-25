"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

// ==== SIMULASI USER YANG LOGIN (nanti diganti baca dari localStorage) ====
// role: "master" -> pemilik brand, lihat SEMUA tenant, dikelompokkan per owner
// role: "admin"  -> akun milik Owner A/B, lihat tenant miliknya sendiri saja
const currentUser = {
  id: 10, // ganti angka ini untuk simulasi admin/owner yang beda (misal jadi 20)
  role: "admin" as "master" | "admin", // ganti ke "master" untuk simulasi akun pemilik brand
};

type Tenant = {
  id: number;
  name: string;
  contact: string;
  status: "Aktif" | "Nonaktif";
  ownerId: number;
  ownerName: string;
};

const ownerOptions = [
  { id: 10, name: "Owner A - Budi" },
  { id: 20, name: "Owner B - Rina" },
];

const initialTenants: Tenant[] = [
  { id: 1, name: "Raos Dimsum - DU", contact: "081234567890", status: "Aktif", ownerId: 10, ownerName: "Owner A - Budi" },
  { id: 2, name: "Raos Dimsum - Dago", contact: "081298765432", status: "Aktif", ownerId: 10, ownerName: "Owner A - Budi" },
  { id: 3, name: "Raos Dimsum - Unpas", contact: "081211112222", status: "Aktif", ownerId: 20, ownerName: "Owner B - Rina" },
  { id: 4, name: "Raos Dimsum - UPI", contact: "081233334444", status: "Nonaktif", ownerId: 20, ownerName: "Owner B - Rina" },
];

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
        <p className="text-xs font-bold text-[#212121]">{tenant.name}</p>
        <p className="text-[11px] text-zinc-400 mt-0.5">{tenant.contact}</p>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
            tenant.status === "Aktif" ? "bg-green-50 text-green-600" : "bg-zinc-100 text-zinc-500"
          }`}
        >
          {tenant.status}
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
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formOwnerId, setFormOwnerId] = useState<number>(ownerOptions[0].id);

  // INTI FITUR "tampil tenant by owner"
  // master -> lihat semua. admin -> cuma tenant yang ownerId-nya sama dengan id dia sendiri
  const visibleTenants =
    currentUser.role === "master"
      ? tenants
      : tenants.filter((t) => t.ownerId === currentUser.id);

  // Khusus role master: kelompokkan tenant per owner untuk ditampilkan dengan sub judul
  const groupedByOwner = ownerOptions
    .map((owner) => ({
      owner,
      tenants: visibleTenants.filter((t) => t.ownerId === owner.id),
    }))
    .filter((group) => group.tenants.length > 0);

  const openAddForm = () => {
    setEditingId(null);
    setFormName("");
    setFormContact("");
    setFormOwnerId(currentUser.role === "admin" ? currentUser.id : ownerOptions[0].id);
    setIsFormOpen(true);
  };

  const openEditForm = (tenant: Tenant) => {
    setEditingId(tenant.id);
    setFormName(tenant.name);
    setFormContact(tenant.contact);
    setFormOwnerId(tenant.ownerId);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const owner = ownerOptions.find((o) => o.id === formOwnerId);

    if (editingId !== null) {
      setTenants((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? { ...t, name: formName, contact: formContact, ownerId: formOwnerId, ownerName: owner?.name || "" }
            : t
        )
      );
    } else {
      const newId = Math.max(0, ...tenants.map((t) => t.id)) + 1;
      setTenants((prev) => [
        ...prev,
        {
          id: newId,
          name: formName,
          contact: formContact,
          status: "Aktif",
          ownerId: formOwnerId,
          ownerName: owner?.name || "",
        },
      ]);
    }

    closeForm();
  };

  const handleDelete = (id: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const confirmed = confirm("Yakin ingin menghapus tenant ini?");
    if (!confirmed) return;
    setTenants((prev) => prev.filter((t) => t.id !== id));
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
          <p className="text-xs text-zinc-400 mt-0.5">
            {currentUser.role === "master"
              ? "Menampilkan seluruh tenant, dikelompokkan per owner"
              : "Menampilkan tenant yang kamu miliki"}
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="bg-[#E52424] text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-[#D91F1F] transition-all"
        >
          + Tambah Tenant
        </button>
      </div>

      {visibleTenants.length === 0 ? (
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
          <p className="text-xs text-zinc-400 py-6 text-center">Belum ada tenant.</p>
        </div>
      ) : currentUser.role === "master" ? (
        // TAMPILAN MASTER: dikelompokkan per owner, tiap grup ada sub judul kecil
        <div className="space-y-5">
          {groupedByOwner.map((group) => (
            <div key={group.owner.id} className="space-y-2">
              <p className="text-xs font-bold text-zinc-500 px-1">
                {group.owner.name}{" "}
                <span className="font-normal text-zinc-400">({group.tenants.length} tenant)</span>
              </p>
              <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
                <div className="divide-y divide-zinc-100">
                  {group.tenants.map((tenant) => (
                    <TenantRow
                      key={tenant.id}
                      tenant={tenant}
                      onEdit={handleEditClick}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // TAMPILAN ADMIN (mewakili 1 owner): list rata biasa, tanpa pengelompokan
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
          <div className="divide-y divide-zinc-100">
            {visibleTenants.map((tenant) => (
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

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Kontak</label>
                <input
                  type="text"
                  required
                  value={formContact}
                  onChange={(e) => setFormContact(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-[#E52424]"
                />
              </div>

              {/* Pemilihan owner cuma muncul kalau yang bikin itu master.
                  Kalau yang login admin (mewakili 1 owner), tenant otomatis nempel ke dia sendiri. */}
              {currentUser.role === "master" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Owner</label>
                  <select
                    value={formOwnerId}
                    onChange={(e) => setFormOwnerId(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-[#E52424] bg-white"
                  >
                    {ownerOptions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
