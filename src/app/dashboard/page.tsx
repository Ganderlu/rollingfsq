"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore, Timestamp } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebaseClient";
import DashboardLayout from "@/components/dashboard-layout";
import {
  History,
  User,
  PieChart,
  Box,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";

type UserProfile = {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  joinedDate?: Timestamp | Date;
  lastAccess?: Timestamp | Date;
  balance?: number;
  totalEarnings?: number;
  totalDeposits?: number;
  activeDeposits?: number;
  lastDeposit?: number;
  totalWithdrawals?: number;
  pendingWithdrawals?: number;
  lastWithdrawal?: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    const db = getFirestore(app);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        setProfile(userDoc.data() as UserProfile);
      } else {
        setProfile({
          email: currentUser.email ?? "",
          joinedDate: new Date(), // Fallback
        });
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (checkingAuth) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <div className="animate-pulse text-slate-400">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  const fullName =
    profile && (profile.firstName || profile.lastName)
      ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
      : "User";

  const username = profile?.username || profile?.email?.split("@")[0] || "User";

  // Format date helper
  const formatDate = (timestamp: Timestamp | Date | undefined | null) => {
    if (!timestamp) return "N/A";
    // Handle Firestore timestamp or Date object
    const date =
      timestamp instanceof Timestamp
        ? timestamp.toDate()
        : new Date(timestamp as Date);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(date);
  };

  // Format currency helper
  const formatCurrency = (amount?: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Profile Card */}
          <div className="rounded-3xl bg-slate-50 p-8 text-center text-slate-900 lg:col-span-1 dark:bg-slate-900 dark:text-slate-50 border border-white/5">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-slate-800 text-slate-400 ring-4 ring-slate-700">
              <User className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-bold">{fullName}</h2>
            <p className="mt-1 text-sm text-slate-400">{username}</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push("/deposit")}
                className="rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
              >
                Deposit
              </button>
              <button
                onClick={() => router.push("/withdraw")}
                className="rounded-lg bg-slate-800 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                Withdraw
              </button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6 text-center">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Joined Date
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {formatDate(profile?.joinedDate)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Last Access
                </p>
                <p className="mt-1 text-sm font-semibold">Now</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Username</p>
                <p className="mt-1 text-sm font-semibold truncate">
                  {username}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Stats & History */}
          <div className="space-y-6 lg:col-span-2">
            {/* Stats Row */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Balance Card */}
              <div className="rounded-3xl border border-white/5 bg-slate-900 p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-400">
                      Balance
                    </p>
                    <h3 className="mt-2 text-3xl font-bold text-slate-50">
                      {formatCurrency(profile?.balance)}
                    </h3>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                      <History className="h-3.5 w-3.5" />
                      <span>Updated: now</span>
                    </div>
                    <p className="mt-4 text-xs font-medium text-slate-400">
                      Your account balance
                    </p>
                  </div>
                  <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-500">
                    <PieChart className="h-8 w-8" />
                  </div>
                </div>
              </div>

              {/* Total Earnings Card */}
              <div className="rounded-3xl border border-white/5 bg-slate-900 p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-400">
                      Total Earnings
                    </p>
                    <h3 className="mt-2 text-3xl font-bold text-slate-50">
                      {formatCurrency(profile?.totalEarnings)}
                    </h3>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                      <History className="h-3.5 w-3.5" />
                      <span>Updated: now</span>
                    </div>
                    <p className="mt-4 text-xs font-medium text-slate-400">
                      Your total Earnings
                    </p>
                  </div>
                  <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-500">
                    <Box className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>

            {/* History Row */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Deposit History */}
              <div className="rounded-3xl border border-white/5 bg-slate-900 p-6">
                <div className="mb-4 flex items-center gap-2 border-l-4 border-amber-500 pl-3">
                  <h3 className="text-lg font-bold text-slate-50">
                    Deposit History
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-slate-950/50 p-4">
                    <div>
                      <p className="text-xl font-bold text-slate-50">
                        {formatCurrency(profile?.totalDeposits)}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        Total Deposits
                      </p>
                    </div>
                    <ArrowDownLeft className="h-5 w-5 text-slate-400" />
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-950/50 p-4">
                    <div>
                      <p className="text-xl font-bold text-slate-50">
                        {formatCurrency(profile?.activeDeposits)}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        Active Deposits
                      </p>
                    </div>
                    <ArrowDownLeft className="h-5 w-5 text-slate-400" />
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-950/50 p-4">
                    <div>
                      <p className="text-xl font-bold text-slate-50">
                        {profile?.lastDeposit
                          ? formatCurrency(profile.lastDeposit)
                          : "$n/a"}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        Last Deposit
                      </p>
                    </div>
                    <ArrowDownLeft className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Withdrawal History */}
              <div className="rounded-3xl border border-white/5 bg-slate-900 p-6">
                <div className="mb-4 flex items-center gap-2 border-l-4 border-amber-500 pl-3">
                  <h3 className="text-lg font-bold text-slate-50">
                    Withdrawal History
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-slate-950/50 p-4">
                    <div>
                      <p className="text-xl font-bold text-slate-50">
                        {formatCurrency(profile?.totalWithdrawals)}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        Total Withdrawals
                      </p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-400" />
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-950/50 p-4">
                    <div>
                      <p className="text-xl font-bold text-slate-50">
                        {formatCurrency(profile?.pendingWithdrawals)}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        Pending Withdrawals
                      </p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-400" />
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-950/50 p-4">
                    <div>
                      <p className="text-xl font-bold text-slate-50">
                        {profile?.lastWithdrawal
                          ? formatCurrency(profile.lastWithdrawal)
                          : "$n/a"}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        Last Withdrawal
                      </p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
