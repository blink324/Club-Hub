"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Profile = {
  role: "admin" | "user";
  display_name: string;
  handle: string | null;
};

type DashboardStats = {
  users: number;
  menus: number;
  verificationPending: number;
  payoutPending: number;
};

type UserRow = {
  id: string;
  handle: string | null;
  display_name: string;
  role: "admin" | "user";
  verified: boolean;
};

type MenuRow = {
  id: string;
  title: string;
  club_id: string;
  visibility: string;
  for_sale: boolean;
  price_coin: number;
  monthly_price_coin: number;
  review_status: string;
  created_at: string;
};

type VerificationRow = {
  id: string;
  user_id: string | null;
  team_id: string | null;
  doc_type: string | null;
  note: string | null;
  status: string | null;
  reject_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string | null;
};

type PurchaseRow = {
  id: string;
  buyer_id: string | null;
  menu_id: string | null;
  amount_coin: number | null;
  status: string | null;
  created_at: string | null;
};

type PayoutRow = {
  id: string;
  user_id: string | null;
  amount_yen: number | null;
  bank_name: string | null;
  branch_name: string | null;
  account_number_last4: string | null;
  account_holder: string | null;
  status: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  paid_at: string | null;
  created_at: string | null;
};

type CouponRow = {
  id: string;
  code: string;
  label: string | null;
  campaign_id: string | null;
  type: string | null;
  pro_months: number | null;
  max_redemptions: number | null;
  redeemed_count: number | null;
  status: string | null;
  expires_at: string | null;
  created_at: string | null;
};

type AuditLogRow = {
  id: string;
  admin_id: string | null;
  action: string | null;
  target_table: string | null;
  target_id: string | null;
  detail: unknown;
  created_at: string | null;
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState("");

  const [stats, setStats] = useState<DashboardStats>({
    users: 0,
    menus: 0,
    verificationPending: 0,
    payoutPending: 0,
  });

  const [activeSection, setActiveSection] = useState("dashboard");
  const [users, setUsers] = useState<UserRow[]>([]);

  const [menus, setMenus] = useState<MenuRow[]>([]);

  const [verifications, setVerifications] = useState<VerificationRow[]>([]);

  const [purchases, setPurchases] = useState<PurchaseRow[]>([]);

  const [payouts, setPayouts] = useState<PayoutRow[]>([]);

  const [coupons, setCoupons] = useState<CouponRow[]>([]);

  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>([]);

  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponLabel, setNewCouponLabel] = useState("");
  const [newCouponMonths, setNewCouponMonths] = useState("2");
  const [newCouponMaxRedemptions, setNewCouponMaxRedemptions] = useState("100");

  const loadDashboardStats = async () => {
    const [usersResult, menusResult, verificationResult, payoutResult] =
      await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("menus").select("id", { count: "exact", head: true }),
        supabase
          .from("verification_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("payout_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
      ]);

    setStats({
      users: usersResult.count ?? 0,
      menus: menusResult.count ?? 0,
      verificationPending: verificationResult.count ?? 0,
      payoutPending: payoutResult.count ?? 0,
    });
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, handle, display_name, role, verified")
      .order("created_at", { ascending: false });

    if (error) {
      setStatus(`ユーザー取得エラー: ${error.message}`);
      return;
    }

    setUsers(data ?? []);
    setActiveSection("users");
  };

  const loadMenus = async () => {
    const { data, error } = await supabase
      .from("menus")
      .select(
        "id, title, club_id, visibility, for_sale, price_coin, monthly_price_coin, review_status, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      setStatus(`投稿取得エラー: ${error.message}`);
      setActiveSection("menus");
      return;
    }

    setMenus(data ?? []);
    setStatus(`投稿管理を表示中: ${data?.length ?? 0}件`);
    setActiveSection("menus");
  };

  const loadVerifications = async () => {
    const { data, error } = await supabase
      .from("verification_requests")
      .select(
        "id, user_id, team_id, doc_type, note, status, reject_reason, reviewed_by, reviewed_at, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      setStatus(`本人確認取得エラー: ${error.message}`);
      return;
    }

    setVerifications(data ?? []);
    setActiveSection("verification");
    setStatus(`本人確認・チーム認証を表示中: ${data?.length ?? 0}件`);
  };

  const loadPurchases = async () => {
    const { data, error } = await supabase
      .from("purchases")
      .select("id, buyer_id, menu_id, amount_coin, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setStatus(`決済取得エラー: ${error.message}`);
      return;
    }

    setPurchases(data ?? []);
    setActiveSection("payments");
    setStatus(`決済・売上管理を表示中: ${data?.length ?? 0}件`);
  };

  const loadPayouts = async () => {
    const { data, error } = await supabase
      .from("payout_requests")
      .select(
        "id, user_id, amount_yen, bank_name, branch_name, account_number_last4, account_holder, status, reviewed_by, reviewed_at, paid_at, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      setStatus(`振込申請取得エラー: ${error.message}`);
      return;
    }

    setPayouts(data ?? []);
    setActiveSection("payouts");
    setStatus(`振込・換金管理を表示中: ${data?.length ?? 0}件`);
  };

  const loadCoupons = async () => {
    const { data, error } = await supabase
      .from("coupons")
      .select(
        "id, code, label, campaign_id, type, pro_months, max_redemptions, redeemed_count, status, expires_at, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      setStatus(`クーポン取得エラー: ${error.message}`);
      return;
    }

    setCoupons(data ?? []);
    setActiveSection("coupons");
    setStatus(`クーポン管理を表示中: ${data?.length ?? 0}件`);
  };

  const loadAuditLogs = async () => {
    const { data, error } = await supabase
      .from("admin_audit_logs")
      .select("id, admin_id, action, target_table, target_id, detail, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      setStatus(`管理ログ取得エラー: ${error.message}`);
      return;
    }

    setAuditLogs(data ?? []);
    setActiveSection("logs");
    setStatus(`管理ログを表示中: ${data?.length ?? 0}件`);
  };

  const createAuditLog = async (
    action: string,
    targetTable: string,
    targetId: string,
    detail: Record<string, unknown> = {}
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("admin_audit_logs").insert({
      admin_id: user?.id ?? null,
      action,
      target_table: targetTable,
      target_id: targetId,
      detail,
    });
  };

  const updateVerificationStatus = async (
    requestId: string,
    userId: string | null,
    status: "pending" | "approved" | "rejected"
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("verification_requests")
      .update({
        status,
        reviewed_by: user?.id ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (error) {
      setStatus(`本人確認更新エラー: ${error.message}`);
      return;
    }

    await createAuditLog("verification_status_update", "verification_requests", requestId, {
      status,
      userId,
    });

    if (status === "approved" && userId) {
      await supabase
        .from("profiles")
        .update({ verified: true })
        .eq("id", userId);
    }

    setStatus("本人確認・チーム認証を更新しました");
    await loadVerifications();
    await loadDashboardStats();
  };

  const updateCouponStatus = async (
    couponId: string,
    status: "active" | "disabled" | "expired"
  ) => {
    const { error } = await supabase
      .from("coupons")
      .update({ status })
      .eq("id", couponId);

    if (error) {
      setStatus(`クーポン更新エラー: ${error.message}`);
      return;
    }

    await createAuditLog("coupon_status_update", "coupons", couponId, {
      status,
    });

    setStatus("クーポン状態を更新しました");
    await loadCoupons();
  };

 const createCoupon = async () => {
  if (!newCouponCode.trim()) {
    setStatus("クーポンコードを入力してください");
    return;
  }

  const { data, error } = await supabase
    .from("coupons")
    .insert({
      code: newCouponCode.trim(),
      label: newCouponLabel.trim() || null,
      campaign_id: "manual",
      type: "pro_trial",
      pro_months: Number(newCouponMonths || 0),
      max_redemptions: Number(newCouponMaxRedemptions || 0),
      status: "active",
    })
    .select("id")
    .single();

  if (error) {
    setStatus(`クーポン作成エラー: ${error.message}`);
    return;
  }

  await createAuditLog("coupon_create", "coupons", data.id, {
    code: newCouponCode.trim(),
  });

  setNewCouponCode("");
  setNewCouponLabel("");
  setNewCouponMonths("2");
  setNewCouponMaxRedemptions("100");

  setStatus("クーポンを作成しました");
  await loadCoupons();
};

const downloadCsv = (
  fileName: string,
  rows: Record<string, string | number | boolean | null>[]
) => {
  if (rows.length === 0) {
    setStatus("CSVに出力するデータがありません");
    return;
  }

  const headers = Object.keys(rows[0]);
  const csvBody = rows.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        const safeValue = value === null ? "" : String(value).replaceAll('"', '""');
        return `"${safeValue}"`;
      })
      .join(",")
  );

  const csv = [headers.join(","), ...csvBody].join("\n");
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);

  setStatus("CSVを出力しました");
};

  const login = async () => {
  setStatus("ログイン中...");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setStatus(`ログインエラー: ${error.message}`);
    return;
  }

  const user = data.user;

  if (!user) {
    setStatus("ログインできませんでした");
    return;
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("role, display_name, handle")
    .eq("id", user.id)
    .single();

  if (profileError) {
    setStatus(`プロフィール取得エラー: ${profileError.message}`);
    return;
  }

  if (profileData.role !== "admin") {
    await supabase.auth.signOut();
    setProfile(null);
    setStatus("この画面は管理者専用です。管理者アカウントでログインしてください。");
    return;
  }

  setProfile(profileData);
  setStatus("");
  await loadDashboardStats();
};

  const updatePayoutStatus = async (
    payoutId: string,
    status: "pending" | "approved" | "rejected" | "paid"
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const now = new Date().toISOString();

    const updateData = {
      status,
      reviewed_by: user?.id ?? null,
      reviewed_at: now,
      paid_at: status === "paid" ? now : null,
    };

    const { error } = await supabase
      .from("payout_requests")
      .update(updateData)
      .eq("id", payoutId);

    if (error) {
      setStatus(`振込申請更新エラー: ${error.message}`);
      return;
    }

    await createAuditLog("payout_status_update", "payout_requests", payoutId, {
      status,
    });

    setStatus("振込申請を更新しました");
    await loadPayouts();
    await loadDashboardStats();
  };

  const updateMenuStatus = async (
    menuId: string,
    status: "pending" | "approved" | "rejected"
  ) => {
    const { error } = await supabase
      .from("menus")
      .update({ review_status: status })
      .eq("id", menuId);

    if (error) {
      setStatus(`審査更新エラー: ${error.message}`);
      return;
    }

    await createAuditLog("menu_review_update", "menus", menuId, {
      status,
    });

    setStatus("審査状態を更新しました");
    await loadMenus();
  };

  const smallButtonStyle: React.CSSProperties = {
    border: "1px solid #cfded6",
    background: "#ffffff",
    color: "#163b2f",
    borderRadius: 999,
    padding: "8px 12px",
    fontWeight: 700,
    cursor: "pointer",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #cad6d1",
    fontSize: 15,
    boxSizing: "border-box",
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setEmail("");
    setPassword("");
    setStatus("");
    setStats({
      users: 0,
      menus: 0,
      verificationPending: 0,
      payoutPending: 0,
    });
  };

  if (profile?.role === "admin") {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f3f5f1",
          fontFamily: "sans-serif",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <header
            style={{
              background: "#17211e",
              color: "#fff",
              borderRadius: 24,
              padding: 24,
              marginBottom: 20,
            }}
          >
            <p style={{ margin: 0, opacity: 0.7, fontWeight: 800 }}>
              CLUB HUB ADMIN
            </p>
            <h1 style={{ margin: "8px 0 0", fontSize: 32 }}>
              管理者ダッシュボード
            </h1>
            <p style={{ opacity: 0.75, lineHeight: 1.7 }}>
              ようこそ、{profile.display_name}さん。ユーザー、投稿、本人確認、決済、換金をここで管理します。
            </p>
            <button
              onClick={logout}
              style={{
                marginTop: 12,
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,.2)",
                background: "transparent",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              ログアウト
            </button>
          </header>

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
              marginBottom: 20,
            }}
          >
            {[
              ["ユーザー", String(stats.users)],
              ["投稿", String(stats.menus)],
              ["本人確認待ち", String(stats.verificationPending)],
              ["換金申請", String(stats.payoutPending)],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  background: "#fff",
                  border: "1px solid #dfe7e2",
                  borderRadius: 18,
                  padding: 18,
                }}
              >
                <p style={{ margin: 0, color: "#5e6d68", fontWeight: 800 }}>
                  {label}
                </p>
                <p style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 900 }}>
                  {value}
                </p>
              </div>
            ))}
          </section>

          <section
            style={{
              background: "#fff",
              border: "1px solid #dfe7e2",
              borderRadius: 20,
              padding: 20,
            }}
          >
            <h2 style={{ marginTop: 0 }}>管理メニュー</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                { label: "ユーザー管理", action: () => loadUsers() },
                { label: "投稿管理", action: () => loadMenus() },
                { label: "本人確認・チーム認証", action: loadVerifications },
                { label: "決済・売上管理", action: loadPurchases },
                { label: "振込・換金管理", action: loadPayouts },
                { label: "クーポン管理", action: loadCoupons },
                { label: "管理ログ", action: loadAuditLogs },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  style={{
                    textAlign: "left",
                    padding: "14px 16px",
                    borderRadius: 14,
                    border:
                      (activeSection === "users" && item.label === "ユーザー管理") ||
                      (activeSection === "menus" && item.label === "投稿管理")
                        ? "2px solid #0b5f4a"
                        : "1px solid #dfe7e2",
                    background:
                      (activeSection === "users" && item.label === "ユーザー管理") ||
                      (activeSection === "menus" && item.label === "投稿管理")
                        ? "#e8f3ee"
                        : "#f7faf8",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>
          {status && (
            <p
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 12,
                background: "#fff7e8",
                color: "#8a5a10",
                border: "1px solid #ead5a8",
                fontWeight: 700,
              }}
            >
              {status}
            </p>
          )}
          {activeSection === "users" && (
            <section
              style={{
                background: "#fff",
                border: "1px solid #dfe7e2",
                borderRadius: 20,
                padding: 20,
                marginTop: 20,
              }}
            >
              <h2 style={{ marginTop: 0 }}>ユーザー管理</h2>

              <button
                type="button"
                onClick={() =>
                  downloadCsv(
                    "club-hub-users.csv",
                    users.map((user) => ({
                      id: user.id,
                      handle: user.handle,
                      display_name: user.display_name,
                      role: user.role,
                      verified: user.verified,
                    }))
                  )
                }
                style={{ ...smallButtonStyle, marginBottom: 12 }}
              >
                ユーザーCSV出力
              </button>

              {users.length === 0 ? (
                <p style={{ color: "#5e6d68" }}>ユーザーがいません。</p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {users.map((user) => (
                    <div
                      key={user.id}
                      style={{
                        border: "1px solid #dfe7e2",
                        borderRadius: 14,
                        padding: 14,
                        background: "#f7faf8",
                      }}
                    >
                      <strong>{user.display_name || "名前未設定"}</strong>
                      <p style={{ margin: "6px 0", color: "#5e6d68" }}>
                        @{user.handle || "未設定"}
                      </p>
                      <p style={{ margin: 0, color: "#5e6d68" }}>
                        role: {user.role} / verified: {user.verified ? "true" : "false"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
          {activeSection === "menus" && (
            <section
              style={{
                background: "#fff",
                border: "1px solid #dfe7e2",
                borderRadius: 20,
                padding: 20,
                marginTop: 20,
              }}
            >
              <h2 style={{ marginTop: 0 }}>投稿管理</h2>

              {menus.length === 0 ? (
                <p style={{ color: "#5e6d68" }}>投稿メニューがありません。</p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {menus.map((menu) => (
                    <div
                      key={menu.id}
                      style={{
                        border: "1px solid #dfe7e2",
                        borderRadius: 14,
                        padding: 14,
                        background: "#f7faf8",
                      }}
                    >
                      <strong>{menu.title}</strong>

                      <p style={{ margin: "6px 0", color: "#5e6d68" }}>
                        部活: {menu.club_id ?? "未設定"} / 公開範囲:{" "}
                        {menu.visibility ?? "未設定"}
                      </p>

                      <p style={{ margin: "6px 0", color: "#5e6d68" }}>
                        有料: {menu.for_sale ? "はい" : "いいえ"} / 都度:{" "}
                        {menu.price_coin ?? 0} coin / 月額:{" "}
                        {menu.monthly_price_coin ?? 0} coin
                      </p>

                      <p style={{ margin: 0, color: "#5e6d68" }}>
                        審査状態: {menu.review_status ?? "未設定"}
                      </p>
                      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => updateMenuStatus(menu.id, "approved")}
                          style={smallButtonStyle}
                        >
                          承認
                        </button>

                        <button
                          type="button"
                          onClick={() => updateMenuStatus(menu.id, "rejected")}
                          style={smallButtonStyle}
                        >
                          差し戻し
                        </button>

                        <button
                          type="button"
                          onClick={() => updateMenuStatus(menu.id, "pending")}
                          style={smallButtonStyle}
                        >
                          審査中に戻す
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
          {activeSection === "verification" && (
            <section
              style={{
                background: "#fff",
                border: "1px solid #dfe7e2",
                borderRadius: 20,
                padding: 20,
                marginTop: 20,
              }}
            >
              <h2 style={{ marginTop: 0 }}>本人確認・チーム認証</h2>

              {verifications.length === 0 ? (
                <p style={{ color: "#5e6d68" }}>申請はまだありません。</p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {verifications.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        border: "1px solid #dfe7e2",
                        borderRadius: 14,
                        padding: 14,
                        background: "#f7faf8",
                      }}
                    >
                      <strong>{item.doc_type ?? "申請"}</strong>

                      <p style={{ margin: "6px 0", color: "#5e6d68" }}>
                        チームID: {item.team_id ?? "なし"}
                      </p>

                      <p style={{ margin: "6px 0", color: "#5e6d68" }}>
                        ユーザーID: {item.user_id ?? "未設定"}
                      </p>

                      <p style={{ margin: "6px 0", color: "#5e6d68" }}>
                        状態: {item.status ?? "未設定"}
                      </p>

                      <p style={{ margin: 0, color: "#5e6d68" }}>
                        メモ: {item.note ?? "なし"}
                      </p>
                      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => updateVerificationStatus(item.id, item.user_id, "approved")}
                          style={smallButtonStyle}
                        >
                          承認
                        </button>

                        <button
                          type="button"
                          onClick={() => updateVerificationStatus(item.id, item.user_id, "rejected")}
                          style={smallButtonStyle}
                        >
                          差し戻し
                        </button>

                        <button
                          type="button"
                          onClick={() => updateVerificationStatus(item.id, item.user_id, "pending")}
                          style={smallButtonStyle}
                        >
                          審査中に戻す
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
          {activeSection === "payments" && (
            <section
              style={{
                background: "#fff",
                border: "1px solid #dfe7e2",
                borderRadius: 20,
                padding: 20,
                marginTop: 20,
              }}
            >
              <h2 style={{ marginTop: 0 }}>決済・売上管理</h2>

              {purchases.length === 0 ? (
                <p style={{ color: "#5e6d68" }}>購入履歴はまだありません。</p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {purchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      style={{
                        border: "1px solid #dfe7e2",
                        borderRadius: 14,
                        padding: 14,
                        background: "#f7faf8",
                      }}
                    >
                      <strong>購入ID: {purchase.id}</strong>

                      <p style={{ margin: "6px 0", color: "#5e6d68" }}>
                        購入者: {purchase.buyer_id ?? "未設定"}
                      </p>

                      <p style={{ margin: "6px 0", color: "#5e6d68" }}>
                        メニューID: {purchase.menu_id ?? "未設定"}
                      </p>

                      <p style={{ margin: "6px 0", color: "#5e6d68" }}>
                        金額: {purchase.amount_coin ?? 0} coin
                      </p>

                      <p style={{ margin: 0, color: "#5e6d68" }}>
                        状態: {purchase.status ?? "未設定"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
          {activeSection === "payouts" && (
            <section
              style={{
                background: "#fff",
                border: "1px solid #dfe7e2",
                borderRadius: 20,
                padding: 20,
                marginTop: 20,
              }}
            >
              <h2 style={{ marginTop: 0 }}>振込・換金管理</h2>
              <button
                type="button"
                onClick={() =>
                  downloadCsv(
                    "club-hub-payouts.csv",
                    payouts.map((payout) => ({
                      id: payout.id,
                      user_id: payout.user_id,
                      amount_yen: payout.amount_yen,
                      bank_name: payout.bank_name,
                      branch_name: payout.branch_name,
                      account_number_last4: payout.account_number_last4,
                      account_holder: payout.account_holder,
                      status: payout.status,
                      reviewed_at: payout.reviewed_at,
                      paid_at: payout.paid_at,
                      created_at: payout.created_at,
                    }))
                  )
                }
                style={{ ...smallButtonStyle, marginBottom: 12 }}
              >
                振込申請CSV出力
              </button>

              {payouts.length === 0 ? (
                <p style={{ color: "#5e6d68" }}>振込申請はまだありません。</p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {payouts.map((payout) => (
                    <div
                      key={payout.id}
                      style={{
                        border: "1px solid #dfe7e2",
                        borderRadius: 14,
                        padding: 14,
                        background: "#f7faf8",
                      }}
                    >
                      <strong>申請ID: {payout.id}</strong>

                      <p style={{ margin: "6px 0", color: "#5e6d68" }}>
                        ユーザーID: {payout.user_id ?? "未設定"}
                      </p>

                      <p style={{ margin: "6px 0", color: "#5e6d68" }}>
                        金額: {payout.amount_yen ?? 0} 円
                      </p>

                      <p style={{ margin: "6px 0", color: "#5e6d68" }}>
                        銀行: {payout.bank_name ?? "未設定"} / 支店:{" "}
                        {payout.branch_name ?? "未設定"}
                      </p>

                      <p style={{ margin: "6px 0", color: "#5e6d68" }}>
                        口座番号下4桁: {payout.account_number_last4 ?? "未設定"}
                      </p>

                      <p style={{ margin: "6px 0", color: "#5e6d68" }}>
                        名義: {payout.account_holder ?? "未設定"}
                      </p>

                      <p style={{ margin: 0, color: "#5e6d68" }}>
                        状態: {payout.status ?? "未設定"}
                      </p>

                      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => updatePayoutStatus(payout.id, "approved")}
                          style={smallButtonStyle}
                        >
                          承認
                        </button>

                        <button
                          type="button"
                          onClick={() => updatePayoutStatus(payout.id, "paid")}
                          style={smallButtonStyle}
                        >
                          支払い済み
                        </button>

                        <button
                          type="button"
                          onClick={() => updatePayoutStatus(payout.id, "rejected")}
                          style={smallButtonStyle}
                        >
                          差し戻し
                        </button>

                        <button
                          type="button"
                          onClick={() => updatePayoutStatus(payout.id, "pending")}
                          style={smallButtonStyle}
                        >
                          審査中に戻す
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
          {activeSection === "coupons" && (
            <section
              style={{
                background: "#fff",
                border: "1px solid #dfe7e2",
                borderRadius: 20,
                padding: 20,
                marginTop: 20,
              }}
            >
              <h2 style={{ marginTop: 0 }}>クーポン管理</h2>
              <button
                type="button"
                onClick={() =>
                  downloadCsv(
                    "club-hub-coupons.csv",
                    coupons.map((coupon) => ({
                      id: coupon.id,
                      code: coupon.code,
                      label: coupon.label,
                      campaign_id: coupon.campaign_id,
                      type: coupon.type,
                      pro_months: coupon.pro_months,
                      max_redemptions: coupon.max_redemptions,
                      redeemed_count: coupon.redeemed_count,
                      status: coupon.status,
                      expires_at: coupon.expires_at,
                      created_at: coupon.created_at,
                    }))
                  )
                }
                style={{ ...smallButtonStyle, marginBottom: 12 }}
              >
                クーポンCSV出力
              </button>

              <div
                style={{
                  border: "1px solid #dfe7e2",
                  borderRadius: 16,
                  padding: 14,
                  background: "#fbfdfb",
                  marginBottom: 16,
                  display: "grid",
                  gap: 10,
                }}
              >
                <strong>新規クーポン作成</strong>

                <input
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  placeholder="例: CROWDFUND-PRO-2M"
                  style={inputStyle}
                />

                <input
                  value={newCouponLabel}
                  onChange={(e) => setNewCouponLabel(e.target.value)}
                  placeholder="例: クラファン特典 Pro 2ヶ月"
                  style={inputStyle}
                />

                <input
                  value={newCouponMonths}
                  onChange={(e) => setNewCouponMonths(e.target.value)}
                  placeholder="Pro付与月数"
                  style={inputStyle}
                />

                <input
                  value={newCouponMaxRedemptions}
                  onChange={(e) => setNewCouponMaxRedemptions(e.target.value)}
                  placeholder="利用上限数"
                  style={inputStyle}
                />

                <button type="button" onClick={createCoupon} style={smallButtonStyle}>
                  クーポンを作成
                </button>
              </div>

              {coupons.length === 0 ? (
                <p style={{ color: "#5e6d68" }}>クーポンはまだありません。</p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {coupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      style={{
                        border: "1px solid #dfe7e2",
                        borderRadius: 14,
                        padding: 14,
                        background: "#f7faf8",
                      }}
                    >
                      <strong>{coupon.code}</strong>

                      <p style={{ margin: "6px 0", color: "#5e6d68" }}>
                        内容: {coupon.label ?? "未設定"}
                      </p>

                      <p style={{ margin: "6px 0", color: "#5e6d68" }}>
                        種類: {coupon.type ?? "未設定"} / Pro付与:{" "}
                        {coupon.pro_months ?? 0}ヶ月
                      </p>

                      <p style={{ margin: "6px 0", color: "#5e6d68" }}>
                        使用数: {coupon.redeemed_count ?? 0} / 上限:{" "}
                        {coupon.max_redemptions ?? "なし"}
                      </p>

                      <p style={{ margin: "6px 0", color: "#5e6d68" }}>
                        キャンペーン: {coupon.campaign_id ?? "なし"}
                      </p>

                      <p style={{ margin: 0, color: "#5e6d68" }}>
                        状態: {coupon.status ?? "未設定"} / 期限:{" "}
                        {coupon.expires_at ?? "なし"}
                      </p>
                      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => updateCouponStatus(coupon.id, "active")}
                          style={smallButtonStyle}
                        >
                          有効
                        </button>

                        <button
                          type="button"
                          onClick={() => updateCouponStatus(coupon.id, "disabled")}
                          style={smallButtonStyle}
                        >
                          停止
                        </button>

                        <button
                          type="button"
                          onClick={() => updateCouponStatus(coupon.id, "expired")}
                          style={smallButtonStyle}
                        >
                          期限切れ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
          {activeSection === "logs" && (
            <section
              style={{
                background: "#fff",
                border: "1px solid #dfe7e2",
                borderRadius: 20,
                padding: 20,
                marginTop: 20,
              }}
            >
              <h2 style={{ marginTop: 0 }}>管理ログ</h2>

              {auditLogs.length === 0 ? (
                <p style={{ color: "#5e6d68" }}>管理ログはまだありません。</p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      style={{
                        border: "1px solid #dfe7e2",
                        borderRadius: 14,
                        padding: 14,
                        background: "#f7faf8",
                      }}
                    >
                      <strong>{log.action ?? "操作"}</strong>

                      <p style={{ margin: "6px 0", color: "#5e6d68" }}>
                        対象: {log.target_table ?? "未設定"} / ID:{" "}
                        {log.target_id ?? "なし"}
                      </p>

                      <p style={{ margin: "6px 0", color: "#5e6d68" }}>
                        管理者: {log.admin_id ?? "未設定"}
                      </p>

                      <p style={{ margin: 0, color: "#5e6d68" }}>
                        日時: {log.created_at ?? "未設定"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f5f7f4",
        fontFamily: "sans-serif",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          border: "1px solid #dfe7e2",
          borderRadius: 20,
          padding: 24,
          boxShadow: "0 20px 60px rgba(20, 40, 34, 0.12)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28 }}>CLUB HUB</h1>
        <p style={{ color: "#5e6d68", marginTop: 8 }}>
          Supabaseログイン
        </p>

        <label style={{ display: "block", marginTop: 20, fontWeight: 700 }}>
          メールアドレス
        </label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
          style={{
            width: "100%",
            padding: "12px 14px",
            marginTop: 8,
            borderRadius: 12,
            border: "1px solid #cad6d1",
            fontSize: 16,
          }}
        />

        <label style={{ display: "block", marginTop: 16, fontWeight: 700 }}>
          パスワード
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          style={{
            width: "100%",
            padding: "12px 14px",
            marginTop: 8,
            borderRadius: 12,
            border: "1px solid #cad6d1",
            fontSize: 16,
          }}
        />

        <button
          onClick={login}
          disabled={!email || !password}
          style={{
            width: "100%",
            marginTop: 22,
            padding: "13px 16px",
            borderRadius: 14,
            border: "none",
            background: !email || !password ? "#cad6d1" : "#0b5f4a",
            color: "#fff",
            fontWeight: 800,
            fontSize: 16,
            cursor: !email || !password ? "not-allowed" : "pointer",
          }}
        >
          ログイン
        </button>

        {status && (
          <p style={{ marginTop: 16, color: "#17211e", lineHeight: 1.7 }}>
            {status}
          </p>
        )}
      </div>
    </main>
  );
}