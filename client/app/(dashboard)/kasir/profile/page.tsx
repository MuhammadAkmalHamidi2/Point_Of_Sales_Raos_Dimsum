"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import BottomNavigation from "@/components/kasir/BottomNavigation";
import KasirHeader from "@/components/kasir/KasirHeader";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Role = {
    id: number;
    role: string;
};

type UserProfile = {
    id: number;
    username: string;
    createdAt: string;
    updatedAt: string;
    Role: Role;
};

export default function ProfilePage() {
    const router = useRouter();

    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Fetch data profile pengguna
    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            setErrorMsg("");

            const token = localStorage.getItem("token");

            if (!token) {
                router.push("/login");
                return;
            }

            const response = await axios.get<{
                status: boolean;
                message: string;
                data: UserProfile;
            }>(`${API_URL}/api/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.status) {
                setUser(response.data.data);
            } else {
                setErrorMsg("Gagal memuat profil pengguna.");
            }
        } catch (error: any) {
            console.error("GET PROFILE ERROR:", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                localStorage.clear();
                router.push("/login");
            } else {
                setErrorMsg(
                    error.response?.data?.message || "Terjadi kesalahan koneksi ke server."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        window.dispatchEvent(new Event("cart-updated"));
        router.push("/login");
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <main className="min-h-screen bg-[#F8F9FA] text-[#212121] pb-24 selection:bg-[#E52424]/10">
            <KasirHeader title="Akun" />

            {/* Container Konten Main */}
            <div className="max-w-md mx-auto p-4 pt-6">
                {loading ? (
                    /* State Loading Skeleton */
                    <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm animate-pulse space-y-5">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-zinc-200" />
                            <div className="space-y-2 flex-1">
                                <div className="h-5 bg-zinc-200 rounded w-1/2" />
                                <div className="h-4 bg-zinc-200 rounded w-1/3" />
                            </div>
                        </div>
                        <div className="h-20 bg-zinc-100 rounded-2xl" />
                        <div className="h-12 bg-zinc-200 rounded-xl" />
                    </div>
                ) : errorMsg || !user ? (
                    /* State Error */
                    <div className="text-center bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm my-8">
                        <div className="w-12 h-12 rounded-2xl bg-[#E52424]/10 text-[#E52424] flex items-center justify-center mx-auto text-xl mb-3 font-bold">
                            !
                        </div>
                        <h2 className="text-base font-bold text-[#212121]">Gagal Memuat Profil</h2>
                        <p className="text-xs text-zinc-500 mt-1 mb-5">{errorMsg}</p>
                        <button
                            type="button"
                            onClick={fetchUserProfile}
                            className="w-full py-2.5 rounded-xl bg-[#E52424] text-white text-xs font-bold hover:bg-[#D91F1F] active:scale-95 transition"
                        >
                            Coba Lagi
                        </button>
                    </div>
                ) : (
                    /* State Berhasil (Data User) */
                    <div className="space-y-4">
                        {/* Card User Info */}
                        <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#E52424]/5 rounded-full blur-2xl pointer-events-none" />

                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-[#E52424] text-white flex items-center justify-center text-2xl font-black shadow-md shadow-[#E52424]/20 uppercase">
                                    {user.username.slice(0, 2)}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-[#212121] capitalize leading-snug">
                                        {user.username}
                                    </h2>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#E52424]/10 text-[#E52424] uppercase tracking-wider">
                                            {user.Role?.role || "Kasir"}
                                        </span>
                                        <span className="text-[11px] font-medium text-zinc-400">ID: #{user.id}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-5 border-t border-zinc-100 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide">Status Akun</p>
                                    <p className="text-xs font-semibold text-emerald-600 mt-0.5 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Aktif
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide">Terdaftar Sejak</p>
                                    <p className="text-xs font-semibold text-zinc-700 mt-0.5">
                                        {formatDate(user.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Menu Aksi */}
                        <div className="bg-white border border-zinc-200/80 rounded-3xl p-2 shadow-sm space-y-1">
                            <button
                                type="button"
                                onClick={() => setShowLogoutModal(true)}
                                className="w-full flex items-center cursor-pointer  justify-between p-3.5 rounded-2xl hover:bg-red-50/50 transition text-left group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E52424] flex items-center justify-center group-hover:bg-[#E52424] group-hover:text-white transition">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#E52424]">Keluar dari Akun</p>
                                    </div>
                                </div>
                                <svg className="w-4 h-4 text-[#E52424] group-hover:translate-x-0.5 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Logout */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl border border-zinc-100 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E52424] flex items-center justify-center mx-auto text-xl">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </div>

                        <div>
                            <h3 className="text-base font-extrabold text-[#212121]">Konfirmasi Keluar</h3>
                            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                                Apakah Anda yakin ingin keluar? Seluruh data sesi dan keranjang lokal akan dibersihkan.
                            </p>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-50 active:scale-95 transition"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex-1 py-2.5 rounded-xl bg-[#E52424] text-xs font-bold text-white hover:bg-[#D91F1F] active:scale-95 transition shadow-md shadow-[#E52424]/20"
                            >
                                Ya, Keluar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Bawah */}
            <BottomNavigation />
        </main>
    );
}