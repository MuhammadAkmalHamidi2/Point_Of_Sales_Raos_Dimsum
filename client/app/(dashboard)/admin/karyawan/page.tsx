"use client";

import { useState, FormEvent } from "react";

// ==== SIMULASI USER YANG LOGIN (nanti diganti baca dari localStorage) ====
// role: "master" -> pemilik brand, lihat SEMUA karyawan di semua tenant, dikelompokkan per owner
// role: "admin"  -> akun milik Owner A/B, lihat karyawan tenant miliknya sendiri saja
// NOTE: samain currentUser.id ini dengan yang di admin/tenant/page.tsx pas simulasi manual.
const currentUser = {
  id: 10, // ganti angka ini untuk simulasi admin/owner yang beda (misal jadi 20)
  role: "master" as "master" | "admin", // ganti ke "master" untuk simulasi akun pemilik brand
};

const ownerOptions = [
  { id: 10, name: "Owner A - Budi" },
  { id: 20, name: "Owner B - Rina" },
];

// =====================================================
// TYPES
// =====================================================

type Karyawan = {
  id: number;
  name: string;
  role: "Produksi" | "Tenant";
  // Field di bawah ini cuma kepake kalau role === "Tenant",
  // karena cuma karyawan tenant yang butuh akun login kasir.
  tenantId?: number;
  tenantName?: string;
  username?: string;
  mustChangePassword?: boolean;
};

// Password default buat akun kasir yang baru dibuat.
// Kasir wajib ganti password ini pas pertama kali login.
// TODO: sambungkan ke API backend nanti — ini cuma placeholder di frontend.
const DEFAULT_KASIR_PASSWORD = "karyawan123";

// =====================================================
// DUMMY DATA
// =====================================================

// TODO: nanti diganti fetch dari GET /api/tenant
// ownerId ditambahin biar bisa nge-filter tenant (dan karyawannya) sesuai owner yang login,
// samain isinya dengan initialTenants di admin/tenant/page.tsx.
const dummyTenants = [
  { id: 1, name: "Raos Dimsum - DU", ownerId: 10 },
  { id: 2, name: "Raos Dimsum - Dago", ownerId: 10 },
  { id: 3, name: "Raos Dimsum - Unpas", ownerId: 20 },
  { id: 4, name: "Raos Dimsum - UPI", ownerId: 20 },
];

const initialKaryawan: Karyawan[] = [
  { id: 1, name: "Budi Santoso", role: "Tenant", tenantId: 1, tenantName: "Raos Dimsum - DU", username: "budisantoso", mustChangePassword: true },
  { id: 2, name: "Siti Aminah", role: "Tenant", tenantId: 1, tenantName: "Raos Dimsum - DU", username: "sitiaminah", mustChangePassword: false },
  { id: 3, name: "Ahmad Fauzi", role: "Tenant", tenantId: 2, tenantName: "Raos Dimsum - Dago", username: "ahmadfauzi", mustChangePassword: true },
  { id: 4, name: "Dewi Lestari", role: "Produksi" },
];

const dummyAbsensi = [
  { id: 1, name: "Budi Santoso", checkIn: "08:05", checkOut: "17:02", status: "Hadir" },
  { id: 2, name: "Siti Aminah", checkIn: "08:10", checkOut: "17:15", status: "Hadir" },
  { id: 3, name: "Ahmad Fauzi", checkIn: "-", checkOut: "-", status: "Izin" },
  { id: 4, name: "Dewi Lestari", checkIn: "-", checkOut: "-", status: "Sakit" },
];

// =====================================================
// HELPER
// =====================================================

// Ubah "Budi Santoso" -> "budisantoso" buat saran username otomatis
function suggestUsername(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

// =====================================================
// ROW KARYAWAN (dipakai di tampilan flat maupun grouped per owner)
// =====================================================

function KaryawanRow({
  emp,
  onEdit,
  onDelete,
}: {
  emp: Karyawan;
  onEdit: (emp: Karyawan) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="py-3.5 flex justify-between items-center">
      <div>
        <p className="text-xs font-bold text-[#212121]">{emp.name}</p>
        {emp.role === "Tenant" ? (
          <div className="mt-0.5 space-y-0.5">
            <p className="text-[11px] text-zinc-400">
              {emp.tenantName ?? "Belum ditempatkan"} · @{emp.username}
            </p>
            {emp.mustChangePassword && (
              <p className="text-[10px] text-amber-600 font-semibold">Belum ganti password default</p>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-zinc-400 mt-0.5">{emp.role}</p>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onEdit(emp)}
          title="Edit"
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5v4.875c0 .621-.504 1.125-1.125 1.125H5.625A1.125 1.125 0 014.5 18.375V6.375c0-.621.504-1.125 1.125-1.125h4.875" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(emp.id)}
          title="Hapus"
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function KaryawanPage() {
  const [mainTab, setMainTab] = useState<"Data" | "Absensi">("Data");
  const [subCategory, setSubCategory] = useState<"Produksi" | "Tenant">("Tenant");

  const [karyawanList, setKaryawanList] = useState<Karyawan[]>(initialKaryawan);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState<"Produksi" | "Tenant">("Tenant");
  const [formTenantId, setFormTenantId] = useState<number | "">("");
  const [formUsername, setFormUsername] = useState("");
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  // Modal kecil buat nampilin username + password default setelah karyawan baru berhasil ditambah
  const [newAccountInfo, setNewAccountInfo] = useState<{ username: string; password: string } | null>(null);

  // INTI FITUR "tampil karyawan by tenant yang dipegang owner"
  // Tenant yang boleh dilihat/dipilih: master -> semua tenant, admin -> tenant miliknya sendiri saja.
  const visibleTenants =
    currentUser.role === "master"
      ? dummyTenants
      : dummyTenants.filter((t) => t.ownerId === currentUser.id);
  const visibleTenantIds = new Set(visibleTenants.map((t) => t.id));

  // Karyawan kategori "Produksi" gak nempel ke tenant manapun jadi tetap tampil apa adanya.
  // Karyawan kategori "Tenant" cuma ditampilkan kalau tenantId-nya termasuk tenant yang visible di atas.
  const filteredKaryawan = karyawanList.filter(
    (emp) =>
      emp.role === subCategory &&
      (emp.role === "Produksi" || (emp.tenantId !== undefined && visibleTenantIds.has(emp.tenantId)))
  );

  // Khusus role master & kategori Tenant: kelompokkan karyawan per owner, sama seperti di admin/tenant/page.tsx
  const groupedByOwner = ownerOptions
    .map((owner) => ({
      owner,
      karyawan: filteredKaryawan.filter((emp) => {
        const tenant = dummyTenants.find((t) => t.id === emp.tenantId);
        return tenant?.ownerId === owner.id;
      }),
    }))
    .filter((group) => group.karyawan.length > 0);

  // ---------------------------------------------------
  // FORM HELPERS
  // ---------------------------------------------------

  const openAddForm = () => {
    setEditingId(null);
    setFormName("");
    setFormRole(subCategory);
    setFormTenantId("");
    setFormUsername("");
    setUsernameTouched(false);
    setUsernameError("");
    setIsFormOpen(true);
  };

  const openEditForm = (emp: Karyawan) => {
    setEditingId(emp.id);
    setFormName(emp.name);
    setFormRole(emp.role);
    setFormTenantId(emp.tenantId ?? "");
    setFormUsername(emp.username ?? "");
    setUsernameTouched(true); // pas edit, jangan auto-override username yang udah ada
    setUsernameError("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  // Setiap nama diketik, saran username ikut update otomatis —
  // tapi kalau admin udah pernah ngedit username manual, jangan ditimpa lagi.
  const handleNameChange = (value: string) => {
    setFormName(value);
    if (!usernameTouched) {
      setFormUsername(suggestUsername(value));
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsernameTouched(true);
    setFormUsername(value);
    setUsernameError("");
  };

  // ---------------------------------------------------
  // SUBMIT
  // ---------------------------------------------------

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validasi khusus kalau kategorinya Tenant (butuh akun login)
    if (formRole === "Tenant") {
      if (!formTenantId) {
        alert("Pilih tenant penempatan karyawan ini dulu.");
        return;
      }

      const cleanUsername = formUsername.trim().toLowerCase();
      if (!cleanUsername) {
        setUsernameError("Username wajib diisi untuk karyawan tenant.");
        return;
      }

      // Cek username udah dipakai karyawan lain atau belum
      // TODO: nanti ini diganti pengecekan ke database lewat API,
      // bukan cuma ngecek array lokal di frontend.
      const isDuplicate = karyawanList.some(
        (emp) => emp.username === cleanUsername && emp.id !== editingId
      );
      if (isDuplicate) {
        setUsernameError("Username ini sudah dipakai, coba username lain.");
        return;
      }
    }

    const tenant = dummyTenants.find((t) => t.id === formTenantId);

    if (editingId !== null) {
      // ---- MODE EDIT ----
      setKaryawanList((prev) =>
        prev.map((emp) =>
          emp.id === editingId
            ? {
                ...emp,
                name: formName,
                role: formRole,
                tenantId: formRole === "Tenant" ? (formTenantId as number) : undefined,
                tenantName: formRole === "Tenant" ? tenant?.name : undefined,
                username: formRole === "Tenant" ? formUsername.trim().toLowerCase() : undefined,
              }
            : emp
        )
      );
      // TODO: kalau tenant penempatan berubah, nanti panggil
      // PUT /api/karyawan/:id buat update tenantId-nya di backend.
    } else {
      // ---- MODE TAMBAH BARU ----
      const newId = Math.max(0, ...karyawanList.map((e) => e.id)) + 1;
      const cleanUsername = formUsername.trim().toLowerCase();

      const newKaryawan: Karyawan = {
        id: newId,
        name: formName,
        role: formRole,
        ...(formRole === "Tenant"
          ? {
              tenantId: formTenantId as number,
              tenantName: tenant?.name,
              username: cleanUsername,
              mustChangePassword: true,
            }
          : {}),
      };

      setKaryawanList((prev) => [...prev, newKaryawan]);

      // Kalau karyawan tenant (kasir) baru ditambah, otomatis "dibikinin" akun.
      // TODO: sambungkan ke backend — nanti di sini kita panggil
      // POST /api/karyawan yang di baliknya juga langsung bikin row baru
      // di tabel User (roleId = kasir, tenantId = formTenantId, mustChangePassword = true).
      if (formRole === "Tenant") {
        setNewAccountInfo({ username: cleanUsername, password: DEFAULT_KASIR_PASSWORD });
      }
    }

    closeForm();
  };

  const handleDelete = (id: number) => {
    const confirmed = confirm(
      "Yakin ingin menghapus karyawan ini? Akun login kasirnya (jika ada) juga akan ikut dihapus."
    );
    if (!confirmed) return;
    setKaryawanList((prev) => prev.filter((emp) => emp.id !== id));
    // TODO: DELETE /api/karyawan/:id — backend juga perlu hapus/nonaktifkan
    // akun User yang terhubung (roleId kasir) biar gak bisa login lagi.
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-zinc-200/80 flex justify-between items-center shadow-2xs">
        <div>
          <h1 className="text-base md:text-xl font-bold text-[#212121]">Kelola Karyawan</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {currentUser.role === "master"
              ? "Manajemen staf seluruh tenant, dikelompokkan per owner"
              : "Manajemen staf tenant yang kamu miliki"}
          </p>
        </div>
      </div>

      {/* MOBILE TAB SWITCHER (Hidden on Desktop) */}
      <div className="flex md:hidden bg-white p-1 rounded-2xl border border-zinc-200/80">
        <button
          onClick={() => setMainTab("Data")}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            mainTab === "Data" ? "bg-[#E52424] text-white" : "text-zinc-500"
          }`}
        >
          Data Karyawan
        </button>
        <button
          onClick={() => setMainTab("Absensi")}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            mainTab === "Absensi" ? "bg-[#E52424] text-white" : "text-zinc-500"
          }`}
        >
          Absensi Karyawan
        </button>
      </div>

      {/* RESPONSIVE GRID CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SECTION: DATA KARYAWAN */}
        <div className={`space-y-4 ${mainTab === "Data" ? "block" : "hidden md:block"}`}>
          <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-[#212121]">Data Karyawan</h2>
              <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl">
                {(["Produksi", "Tenant"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSubCategory(cat)}
                    className={`text-xs font-bold px-3 py-1 rounded-lg transition-all ${
                      subCategory === cat ? "bg-white text-[#212121] shadow-xs" : "text-zinc-400"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredKaryawan.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">Belum ada karyawan di kategori ini.</p>
            ) : currentUser.role === "master" && subCategory === "Tenant" ? (
              // TAMPILAN MASTER khusus kategori Tenant: dikelompokkan per owner (mirip admin/tenant/page.tsx)
              <div className="space-y-4">
                {groupedByOwner.map((group) => (
                  <div key={group.owner.id} className="space-y-1">
                    <p className="text-[11px] font-bold text-zinc-500 px-1">
                      {group.owner.name}{" "}
                      <span className="font-normal text-zinc-400">({group.karyawan.length} karyawan)</span>
                    </p>
                    <div className="divide-y divide-zinc-100">
                      {group.karyawan.map((emp) => (
                        <KaryawanRow key={emp.id} emp={emp} onEdit={openEditForm} onDelete={handleDelete} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // TAMPILAN ADMIN (mewakili 1 owner), atau master di kategori Produksi: list rata biasa
              <div className="divide-y divide-zinc-100">
                {filteredKaryawan.map((emp) => (
                  <KaryawanRow key={emp.id} emp={emp} onEdit={openEditForm} onDelete={handleDelete} />
                ))}
              </div>
            )}

            <button
              onClick={openAddForm}
              className="w-full py-2.5 bg-[#E52424] text-white font-semibold text-xs rounded-xl active:scale-98 transition-all"
            >
              + Tambah Karyawan
            </button>
          </div>
        </div>

        {/* SECTION: ABSENSI KARYAWAN */}
        <div className={`space-y-4 ${mainTab === "Absensi" ? "block" : "hidden md:block"}`}>
          <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-[#212121]">Absensi Karyawan</h2>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#212121] bg-zinc-50 px-3 py-1 rounded-xl border border-zinc-200/60">
                <button className="text-zinc-400 font-bold">&lt;</button>
                <span>24 Mei 2024</span>
                <button className="text-zinc-400 font-bold">&gt;</button>
              </div>
            </div>

            <div className="divide-y divide-zinc-100">
              {dummyAbsensi.map((item) => (
                <div key={item.id} className="py-3.5 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-[#212121]">{item.name}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {item.checkIn} - {item.checkOut}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] px-3 py-1 rounded-full font-semibold ${
                      item.status === "Hadir"
                        ? "bg-emerald-50 text-emerald-600"
                        : item.status === "Izin"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL FORM TAMBAH/EDIT KARYAWAN */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-[#212121]">
                {editingId !== null ? "Edit Karyawan" : "Tambah Karyawan"}
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
                <label className="text-xs font-semibold text-zinc-600">Nama Karyawan</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Masukkan nama"
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-[#E52424]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">Kategori</label>
                <div className="flex gap-2">
                  {(["Produksi", "Tenant"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormRole(cat)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                        formRole === cat
                          ? "bg-[#E52424] text-white border-[#E52424]"
                          : "bg-white text-zinc-500 border-zinc-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-400">
                  Kategori &quot;Tenant&quot; otomatis dibuatkan akun login kasir.
                </p>
              </div>

              {/* FIELD TAMBAHAN — CUMA MUNCUL KALAU KATEGORINYA TENANT */}
              {formRole === "Tenant" && (
                <div className="space-y-4 p-3 bg-zinc-50 rounded-xl border border-zinc-200/60">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-600">Penempatan Tenant</label>
                    <select
                      required
                      value={formTenantId}
                      onChange={(e) => setFormTenantId(e.target.value ? Number(e.target.value) : "")}
                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-[#E52424] bg-white"
                    >
                      <option value="">Pilih tenant...</option>
                      {visibleTenants.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-600">Username Login Kasir</label>
                    <input
                      type="text"
                      required
                      value={formUsername}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      placeholder="Otomatis terisi dari nama"
                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-[#E52424] bg-white"
                    />
                    {usernameError ? (
                      <p className="text-[10px] text-red-500 font-semibold">{usernameError}</p>
                    ) : (
                      <p className="text-[10px] text-zinc-400">
                        Saran otomatis dari nama, boleh diubah jika sudah dipakai.
                      </p>
                    )}
                  </div>

                  {editingId === null && (
                    <p className="text-[10px] text-zinc-500 bg-white border border-zinc-200 rounded-lg p-2">
                      Password default <span className="font-mono font-semibold">{DEFAULT_KASIR_PASSWORD}</span> akan
                      dibuatkan otomatis. Kasir wajib menggantinya saat login pertama kali.
                    </p>
                  )}
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

      {/* MODAL INFO AKUN BARU DIBUAT */}
      {newAccountInfo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-[#212121]">Akun Kasir Berhasil Dibuat</h3>
            </div>

            <p className="text-xs text-zinc-500">
              Catat atau screenshot info berikut, lalu sampaikan ke karyawan yang bersangkutan.
            </p>

            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-zinc-400">Username</span>
                <span className="text-xs font-mono font-semibold text-[#212121]">{newAccountInfo.username}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-zinc-400">Password</span>
                <span className="text-xs font-mono font-semibold text-[#212121]">{newAccountInfo.password}</span>
              </div>
            </div>

            <p className="text-[10px] text-amber-600 bg-amber-50 rounded-lg p-2">
              Karyawan wajib mengganti password ini saat login pertama kali.
            </p>

            <button
              onClick={() => setNewAccountInfo(null)}
              className="w-full py-2.5 rounded-xl bg-[#E52424] text-white text-xs font-semibold hover:bg-[#D91F1F] transition-all"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
