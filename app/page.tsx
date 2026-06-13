"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Profile = {
  display_name: string;
  handle: string | null;
  role: "admin" | "user";
  club_id: string | null;
  team_name: string | null;
  team_category: string | null;
  grade: string | null;
  verified: boolean | null;
};

type MenuRow = {
  id: string;
  title: string;
  club_id: string | null;
  visibility: string | null;
  for_sale: boolean | null;
  price_coin: number | null;
  monthly_price_coin: number | null;
  review_status: string | null;
  created_at: string | null;
};

type MenuItemRow = {
  id: string;
  menu_id: string;
  name: string;
  value: string | null;
  unit: string | null;
  duration: string | null;
  duration_unit: string | null;
  sort_order: number | null;
};

type DraftMenuStep = {
  id: string;
  name: string;
  value: string;
  duration: string;
  duration_unit: string;
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState("");
  const [activeTab, setActiveTab] = useState<"home" | "board" | "revenue" | "mypage">("home");
  const [isPcPreview, setIsPcPreview] = useState(false);

  const [menus, setMenus] = useState<MenuRow[]>([]);
  const [boardMenus, setBoardMenus] = useState<MenuRow[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<MenuRow | null>(null);

  const [menuItems, setMenuItems] = useState<MenuItemRow[]>([]);

  const [newMenuTitle, setNewMenuTitle] = useState("");
  const [newMenuDescription, setNewMenuDescription] = useState("");
  const [newMenuDuration, setNewMenuDuration] = useState("30");
  const [newMenuSteps, setNewMenuSteps] = useState<DraftMenuStep[]>([
    { id: "step-1", name: "", value: "", duration: "", duration_unit: "分" },
  ]);
  const [menuPreviewItems, setMenuPreviewItems] = useState<Record<string, DraftMenuStep[]>>({});
  const [newMenuForSale, setNewMenuForSale] = useState(false);
  const [newMenuPrice, setNewMenuPrice] = useState("0");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [postMenuMonth, setPostMenuMonth] = useState("all");
  const [postMenuPage, setPostMenuPage] = useState(0);
  const [boardSearch, setBoardSearch] = useState("");
  const [boardMode, setBoardMode] = useState<"menu" | "recruit">("menu");
  const [boardScope, setBoardScope] = useState<"club" | "all">("club");
  const [boardFilter, setBoardFilter] = useState<"new" | "paid" | "free">("new");
  const [boardApplication, setBoardApplication] = useState<"match" | "camp" | null>(null);
  const [boardRegion, setBoardRegion] = useState("関東");
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [boardChatTarget, setBoardChatTarget] = useState("");
  const [boardChatText, setBoardChatText] = useState("");
  const [boardChatMessages, setBoardChatMessages] = useState<Record<string, string[]>>({});
  const [showRecruitPostForm, setShowRecruitPostForm] = useState(false);
  const [recruitPostType, setRecruitPostType] = useState<"match" | "camp">("match");
  const [recruitPostRegion, setRecruitPostRegion] = useState("関東");
  const [recruitPostTitle, setRecruitPostTitle] = useState("");
  const [recruitPostDetail, setRecruitPostDetail] = useState("");
  const [customBoardOpportunities, setCustomBoardOpportunities] = useState<Array<{ id: string; type: "match" | "camp"; region: string; title: string; team: string; detail: string; created_at: string }>>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<Array<{ id: string; title: string; amount: number; purchasedAt: string; menu: MenuRow }>>([]);
  const [viewHistory, setViewHistory] = useState<Array<{ id: string; title: string; viewedAt: string; menu: MenuRow }>>([]);
  const [proNotifications, setProNotifications] = useState<Array<{ id: string; title: string; body: string; createdAt: string }>>([]);
  const [coinBalance, setCoinBalance] = useState(0);
  const [lastPurchasedMenuId, setLastPurchasedMenuId] = useState("");
  const [isProActive, setIsProActive] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [seenNotificationCount, setSeenNotificationCount] = useState(0);
  const [revenueView, setRevenueView] = useState<"top" | "selling" | "purchases" | "views" | "payout" | "verification" | "pro" | "subscription" | "coins">("top");
  const [mypageView, setMypageView] = useState<"top" | "profile" | "publish" | "verification" | "proCancel">("top");

  const [showCreateMenuForm, setShowCreateMenuForm] = useState(false);
  const [paidPublishPrice, setPaidPublishPrice] = useState("300");
  const [payoutBankName, setPayoutBankName] = useState("");
  const [payoutBranchName, setPayoutBranchName] = useState("");
  const [payoutAccountType, setPayoutAccountType] = useState("普通");
  const [payoutAccountNumber, setPayoutAccountNumber] = useState("");
  const [payoutAccountName, setPayoutAccountName] = useState("");
  const [isPayoutRegistered, setIsPayoutRegistered] = useState(false);
  const [verificationFileName, setVerificationFileName] = useState("");
  const [verificationNote, setVerificationNote] = useState("");
  const [sellerVerificationStatus, setSellerVerificationStatus] = useState<"none" | "pending" | "approved" | "rejected">("none");

  const [selectedClub, setSelectedClub] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamCategory, setTeamCategory] = useState("");
  const [customTeamCategory, setCustomTeamCategory] = useState("");
  const [grade, setGrade] = useState("");
  const [customGrade, setCustomGrade] = useState("");

  useEffect(() => {
    try {
      const savedState = window.localStorage.getItem("clubhub-client-state");
      if (!savedState) return;
      const parsed = JSON.parse(savedState) as {
        coinBalance?: number;
        isProActive?: boolean;
        purchaseHistory?: Array<{ id: string; title: string; amount: number; purchasedAt: string; menu: MenuRow }>;
        viewHistory?: Array<{ id: string; title: string; viewedAt: string; menu: MenuRow }>;
        proNotifications?: Array<{ id: string; title: string; body: string; createdAt: string }>;
        isPayoutRegistered?: boolean;
        menus?: MenuRow[];
        menuPreviewItems?: Record<string, DraftMenuStep[]>;
        customBoardOpportunities?: Array<{ id: string; type: "match" | "camp"; region: string; title: string; team: string; detail: string; created_at: string }>;
        sellerVerificationStatus?: "none" | "pending" | "approved" | "rejected";
        verificationFileName?: string;
        verificationNote?: string;
      };
      if (typeof parsed.coinBalance === "number") setCoinBalance(parsed.coinBalance);
      if (typeof parsed.isProActive === "boolean") setIsProActive(parsed.isProActive);
      if (Array.isArray(parsed.purchaseHistory)) setPurchaseHistory(parsed.purchaseHistory);
      if (Array.isArray(parsed.viewHistory)) setViewHistory(parsed.viewHistory);
      if (Array.isArray(parsed.proNotifications)) setProNotifications(parsed.proNotifications);
      if (typeof parsed.isPayoutRegistered === "boolean") setIsPayoutRegistered(parsed.isPayoutRegistered);
      if (Array.isArray(parsed.menus)) setMenus(parsed.menus);
      if (parsed.menuPreviewItems) setMenuPreviewItems(parsed.menuPreviewItems);
      if (Array.isArray(parsed.customBoardOpportunities)) setCustomBoardOpportunities(parsed.customBoardOpportunities);
      if (parsed.sellerVerificationStatus) setSellerVerificationStatus(parsed.sellerVerificationStatus);
      if (typeof parsed.verificationFileName === "string") setVerificationFileName(parsed.verificationFileName);
      if (typeof parsed.verificationNote === "string") setVerificationNote(parsed.verificationNote);
    } catch {
      // 保存データが壊れていてもアプリは通常表示を優先します。
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "clubhub-client-state",
        JSON.stringify({
          coinBalance,
          isProActive,
          purchaseHistory,
          viewHistory,
          proNotifications,
          isPayoutRegistered,
          menus,
          menuPreviewItems,
          customBoardOpportunities,
          sellerVerificationStatus,
          verificationFileName,
          verificationNote,
        })
      );
    } catch {
      // 容量制限などで保存できない場合も操作は継続します。
    }
  }, [coinBalance, isProActive, purchaseHistory, viewHistory, proNotifications, menus, menuPreviewItems, customBoardOpportunities, isPayoutRegistered, sellerVerificationStatus, verificationFileName, verificationNote]);

  const loadSellerVerificationStatus = async (userId: string, isVerified: boolean | null) => {
    if (isVerified) {
      setSellerVerificationStatus("approved");
      return;
    }

    const { data } = await supabase
      .from("verification_requests")
      .select("status, note")
      .eq("user_id", userId)
      .eq("doc_type", "seller_verification")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data?.status === "approved" || data?.status === "pending" || data?.status === "rejected") {
      setSellerVerificationStatus(data.status);
      if (data.note) setVerificationNote(data.note);
    } else {
      setSellerVerificationStatus("none");
    }
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
      .select("display_name, handle, role, club_id, team_name, team_category, grade, verified")
      .eq("id", user.id)
      .single();

    if (profileError) {
      setStatus(`プロフィール取得エラー: ${profileError.message}`);
      return;
    }

    setProfile(profileData);
    setDisplayName(profileData.display_name ?? "");
    setSelectedClub(profileData.club_id ?? "");
    setTeamName(profileData.team_name ?? "");
    setTeamCategory(profileData.team_category ?? "");
    setGrade(profileData.grade ?? "");
    await loadSellerVerificationStatus(user.id, profileData.verified);
    setStatus("");
  };

  const signup = async () => {
    setStatus("新規登録中...");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setStatus(`新規登録エラー: ${error.message}`);
      return;
    }

    const user = data.user;

    if (!user) {
      setStatus("確認メールを送信しました。メールを確認してください。");
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("display_name, handle, role, club_id, team_name, team_category, grade, verified")
      .eq("id", user.id)
      .single();

    if (profileError) {
      const baseHandle = email.split("@")[0] || "user";
      const fallbackProfile: Profile = {
        display_name: baseHandle,
        handle: `${baseHandle}-${user.id.slice(0, 6)}`,
        role: "user",
        club_id: null,
        team_name: null,
        team_category: null,
        grade: null,
        verified: false,
      };

      await supabase.from("profiles").upsert({
        id: user.id,
        handle: fallbackProfile.handle,
        display_name: fallbackProfile.display_name,
        role: "user",
        verified: false,
      });

      setProfile(fallbackProfile);
      setDisplayName(fallbackProfile.display_name);
      setSelectedClub("");
      setTeamName("");
      setTeamCategory("");
      setGrade("");
      setSellerVerificationStatus("none");
      setStatus("新規登録しました。続けて部活と所属を設定してください。");
      return;
    }

    setProfile(profileData);
    setDisplayName(profileData.display_name ?? "");
    setSelectedClub(profileData.club_id ?? "");
    setTeamName(profileData.team_name ?? "");
    setTeamCategory(profileData.team_category ?? "");
    setGrade(profileData.grade ?? "");
    await loadSellerVerificationStatus(user.id, profileData.verified);

    setStatus("新規登録しました");
  };

  const saveProfileSettings = async () => {

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setStatus(`ユーザー確認エラー: ${userError.message}`);
      return;
    }

    if (!user) {
      setStatus("ログイン情報を確認できませんでした");
      return;
    }

    const finalTeamCategory =
      teamCategory === "その他" ? customTeamCategory : teamCategory;

    const finalGrade = grade === "その他" ? customGrade : grade;

    const { error } = await supabase
	      .from("profiles")
	      .update({
	        display_name: displayName || profile?.display_name || "ユーザー",
	        club_id: selectedClub || null,
	        team_name: teamName || null,
        team_category: finalTeamCategory || null,
        grade: finalGrade || null,
      })
      .eq("id", user.id);

    if (error) {
      setStatus(`保存エラー: ${error.message}`);
      return;
    }

    setProfile((current) =>
      current
        ? {
	            ...current,
	            display_name: displayName || current.display_name,
	            club_id: selectedClub || null,
            team_name: teamName || null,
            team_category: finalTeamCategory || null,
            grade: finalGrade || null,
          }
        : current
    );

    setStatus("所属情報を保存しました");
  };

  const loadMenus = async () => {
    if (!selectedClub) {
      setStatus("先に部活を選択してください");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const query = supabase
      .from("menus")
      .select(
        "id, title, club_id, visibility, for_sale, price_coin, monthly_price_coin, review_status, created_at"
      )
      .order("created_at", { ascending: false });

    const { data, error } = user
      ? await query.eq("owner_id", user.id)
      : await query.eq("club_id", selectedClub).eq("review_status", "approved");

    if (error) {
      setStatus(`メニュー取得エラー: ${error.message}`);
      return;
    }

    setMenus(data ?? []);
    const menuIds = (data ?? []).map((menu) => menu.id);
    if (menuIds.length > 0) {
      const { data: itemData } = await supabase
        .from("menu_items")
        .select("id, menu_id, name, value, unit, duration, duration_unit, sort_order")
        .in("menu_id", menuIds)
        .order("sort_order", { ascending: true });

      const previews = (itemData ?? []).reduce<Record<string, DraftMenuStep[]>>((acc, item) => {
        acc[item.menu_id] = [
          ...(acc[item.menu_id] ?? []),
          {
            id: item.id,
            name: item.name,
            value: item.value ?? "",
            duration: item.duration ?? "",
            duration_unit: item.duration_unit ?? "分",
          },
        ];
        return acc;
      }, {});
      setMenuPreviewItems((current) => ({ ...current, ...previews }));
    }
    setStatus("");
  };

  useEffect(() => {
    if (!profile || !selectedClub) return;
    loadMenus();
  }, [profile?.handle, selectedClub]);

  const loadBoardMenus = async () => {
    const { data, error } = await supabase
      .from("menus")
      .select(
        "id, title, club_id, visibility, for_sale, price_coin, monthly_price_coin, review_status, created_at"
      )
      .eq("review_status", "approved")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      setStatus(`掲示板メニュー取得エラー: ${error.message}`);
      return;
    }

    setBoardMenus(data ?? []);
    setStatus(`掲示板に表示中: ${data?.length ?? 0}件`);
  };

  const purchaseMenu = async (menu: MenuRow) => {
    const amount = menu.for_sale ? menu.price_coin ?? 0 : 0;
    if (amount > coinBalance) {
      setLastPurchasedMenuId("");
      setStatus("コイン残高が不足しています");
      return;
    }

    const ok = window.confirm(`「${menu.title}」を${amount > 0 ? `${amount} coinで` : "無料で"}購入しますか？`);
    if (!ok) return;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setStatus("購入にはログインが必要です");
      return;
    }

    const { error } = await supabase.from("purchases").insert({
      buyer_id: user.id,
      menu_id: menu.id,
      amount_coin: amount,
      status: "paid",
    });

    if (error) {
      setStatus(`購入エラー: ${error.message}`);
      return;
    }

    setPurchaseHistory((current) => [
      {
        id: `${menu.id}-${Date.now()}`,
        title: menu.title,
        amount,
        purchasedAt: new Date().toLocaleString("ja-JP"),
        menu,
      },
      ...current,
    ]);
    setSeenNotificationCount((current) => Math.max(0, current));
    setCoinBalance((current) => Math.max(0, current - amount));
    setLastPurchasedMenuId(menu.id);
    if (selectedMenu?.id === menu.id) {
      const { data: itemData } = await supabase
        .from("menu_items")
        .select("id, menu_id, name, value, unit, duration, duration_unit, sort_order")
        .eq("menu_id", menu.id)
        .order("sort_order", { ascending: true });
      setMenuItems(itemData ?? []);
    }
    setStatus("");
  };

  const sendBoardChat = (targetId: string) => {
    const message = boardChatText.trim();
    if (!message) {
      setStatus("チャット内容を入力してください");
      return;
    }

    setBoardChatMessages((current) => ({
      ...current,
      [targetId]: [...(current[targetId] ?? []), message],
    }));
    setBoardChatText("");
    setStatus("チャットを送信しました");
  };

  const createRecruitPost = () => {
    if (!recruitPostTitle.trim() || !recruitPostDetail.trim()) {
      setStatus("募集タイトルと内容を入力してください");
      return;
    }

    setCustomBoardOpportunities((current) => [
      {
        id: `custom-${Date.now()}`,
        type: recruitPostType,
        region: recruitPostRegion,
        title: recruitPostTitle.trim(),
        team: [teamName, teamCategory === "その他" ? customTeamCategory : teamCategory].filter(Boolean).join("・") || "自分のチーム",
        detail: recruitPostDetail.trim(),
        created_at: new Date().toISOString(),
      },
      ...current,
    ]);
    setBoardRegion(recruitPostRegion);
    setBoardApplication(recruitPostType);
    setRecruitPostTitle("");
    setRecruitPostDetail("");
    setShowRecruitPostForm(false);
    setStatus("募集を投稿しました");
  };

  const getNotificationTotal = () =>
    purchaseHistory.length +
    Object.values(boardChatMessages).reduce((total, messages) => total + messages.length, 0);

  const formatNotificationBadge = (count: number) => {
    const circledNumbers = ["", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"];
    return count < circledNumbers.length ? circledNumbers[count] : "9+";
  };

  const formatMenuDate = (value: string | null) => {
    if (!value) return "日時未設定";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "日時未設定";
    return date.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
  };

  const getMenuMonthKey = (value: string | null) => {
    if (!value) return "unknown";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "unknown";
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  };

  const formatMenuMonth = (key: string) => {
    if (key === "all") return "すべての月";
    if (key === "unknown") return "日時未設定";
    const [year, month] = key.split("-");
    return `${year}年${Number(month)}月`;
  };

  const isTodayMenu = (menu: MenuRow) => {
    if (!menu.created_at) return false;
    const date = new Date(menu.created_at);
    if (Number.isNaN(date.getTime())) return false;
    const today = new Date();
    return date.toLocaleDateString("ja-JP") === today.toLocaleDateString("ja-JP");
  };

  const openLatestNotification = () => {
    const total = getNotificationTotal();
    setIsNotificationPanelOpen(true);
    setSeenNotificationCount(total);
    setStatus("");
  };

  const subscribePro = () => {
    const ok = window.confirm("Proに加入しますか？ 月額3,980円として購入します。");
    if (!ok) return;
    setIsProActive(true);
    setProNotifications((current) => [
      {
        id: `pro-subscribe-${Date.now()}`,
        title: "Proに加入しました",
        body: "月額3,980円のPro特典が利用できるようになりました。",
        createdAt: new Date().toLocaleString("ja-JP"),
      },
      ...current,
    ]);
    setStatus("Proに加入しました（月額3,980円）");
  };

  const cancelPro = () => {
    const ok = window.confirm("Proを解約しますか？");
    if (!ok) return;
    setIsProActive(false);
    setProNotifications((current) => [
      {
        id: `pro-cancel-${Date.now()}`,
        title: "Proを解約しました",
        body: "Pro特典は停止されました。必要な時に再加入できます。",
        createdAt: new Date().toLocaleString("ja-JP"),
      },
      ...current,
    ]);
    setStatus("Proを解約しました");
  };

  const canViewMenu = (menu: MenuRow) =>
    isProActive ||
    !menu.for_sale ||
    purchaseHistory.some((purchase) => purchase.menu.id === menu.id);

  const canSellPaidMenus = Boolean(profile?.verified) || sellerVerificationStatus === "approved";

  const goToSellerVerification = () => {
    setActiveTab("mypage");
    setMypageView("verification");
    setRevenueView("top");
    setSelectedMenu(null);
    setStatus("有料メニューの公開には、販売者登録と管理者承認が必要です。");
  };

  const buyCoins = (amount: number) => {
    const ok = window.confirm(`${amount.toLocaleString()} coinを購入しますか？`);
    if (!ok) return;
    setCoinBalance((current) => current + amount);
    setProNotifications((current) => [
      {
        id: `coin-buy-${Date.now()}`,
        title: "コインを購入しました",
        body: `${amount.toLocaleString()} coinが残高に追加されました。`,
        createdAt: new Date().toLocaleString("ja-JP"),
      },
      ...current,
    ]);
    setStatus(`${amount.toLocaleString()} coinを購入しました`);
  };

  const publishMenuAsPaid = async (menu: MenuRow) => {
    if (!canSellPaidMenus) {
      goToSellerVerification();
      return;
    }

    const price = Number(paidPublishPrice || 0);
    if (!price || price < 1) {
      setStatus("有料公開する価格を入力してください");
      return;
    }

    const { data, error } = await supabase
      .from("menus")
      .update({
        for_sale: true,
        price_coin: price,
        review_status: "approved",
      })
      .eq("id", menu.id)
      .select("id, title, club_id, visibility, for_sale, price_coin, monthly_price_coin, review_status, created_at")
      .single();

    if (error) {
      setStatus(`有料公開への変更エラー: ${error.message}`);
      return;
    }

    setSelectedMenu(data);
    setMenus((current) => current.map((item) => (item.id === data.id ? data : item)));
    setBoardMenus((current) => current.map((item) => (item.id === data.id ? data : item)));
    setStatus("有料公開に変更しました。");
  };

  const openMenuDetail = async (menu: MenuRow) => {
    setSelectedMenu(menu);
    setViewHistory((current) => [
      {
        id: `${menu.id}-${Date.now()}`,
        title: menu.title,
        viewedAt: new Date().toLocaleString("ja-JP"),
        menu,
      },
      ...current.filter((item) => item.menu.id !== menu.id),
    ]);
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (!canViewMenu(menu)) {
      setMenuItems([]);
      setStatus("");
      return;
    }

    setStatus("メニュー詳細を読み込み中...");

    const { data, error } = await supabase
      .from("menu_items")
      .select("id, menu_id, name, value, unit, duration, duration_unit, sort_order")
      .eq("menu_id", menu.id)
      .order("sort_order", { ascending: true });

    if (error) {
      setStatus(`メニュー詳細取得エラー: ${error.message}`);
      return;
    }

    setMenuItems(data ?? []);
    setStatus("");
  };

  const deleteMenu = async (menu: MenuRow) => {
    const ok = window.confirm(`「${menu.title}」を削除しますか？`);
    if (!ok) return;

    const { error } = await supabase.from("menus").delete().eq("id", menu.id);

    setMenus((current) => current.filter((item) => item.id !== menu.id));
    setBoardMenus((current) => current.filter((item) => item.id !== menu.id));
    setPurchaseHistory((current) => current.filter((item) => item.menu.id !== menu.id));
    setViewHistory((current) => current.filter((item) => item.menu.id !== menu.id));
    setSelectedMenu(null);
    setStatus(error ? "画面上からメニューを削除しました。本番では管理者権限設定後にデータベースから削除されます。" : "メニューを削除しました");
  };

  const openBlankCreateMenu = () => {
    setNewMenuTitle("");
    setSelectedTemplate("");
    setNewMenuForSale(false);
    setNewMenuPrice("0");
    setNewMenuSteps([
      { id: `step-${Date.now()}`, name: "", value: "", duration: "", duration_unit: "分" },
    ]);
    setShowCreateMenuForm(true);
  };

  const addMenuStep = () => {
    setNewMenuSteps((current) => [
      ...current,
      {
        id: `step-${Date.now()}`,
        name: "",
        value: "",
        duration: "",
        duration_unit: "分",
      },
    ]);
  };

  const updateMenuStep = (
    stepId: string,
    field: keyof Omit<DraftMenuStep, "id">,
    value: string
  ) => {
    setNewMenuSteps((current) =>
      current.map((step) =>
        step.id === stepId ? { ...step, [field]: value } : step
      )
    );
  };

  const removeMenuStep = (stepId: string) => {
    setNewMenuSteps((current) =>
      current.length <= 1 ? current : current.filter((step) => step.id !== stepId)
    );
  };

  const shareMenuAsText = async (menu: MenuRow) => {
    const detailText = menuItems.length
      ? menuItems
          .map((item, index) => {
            const duration = `${item.duration ?? 0}${item.duration_unit ?? "分"}`;
            return `${index + 1}. ${item.name || "練習項目"}\n${item.value ?? "説明なし"}\n目安: ${duration}`;
          })
          .join("\n\n")
      : "練習内容はまだ登録されていません。";
    const text = [
      "CLUB HUB 練習メニュー",
      `メニュー名: ${menu.title}`,
      `部活: ${clubs.find((club) => club.id === menu.club_id)?.name ?? selectedClubName}`,
      `価格: ${menu.for_sale ? String(menu.price_coin ?? 0) + " coin" : "無料"}`,
      "",
      "【練習内容】",
      detailText,
    ].join("\n");

    if (navigator.share) {
      try {
        await navigator.share({ title: menu.title, text });
        setStatus("文字で共有しました");
        return;
      } catch {
        // 共有をキャンセルした場合はLINE共有リンクへ進めます。
      }
    }

    const url = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setStatus("LINEで共有する文章を開きました");
  };

  const printMenuPdf = (menu: MenuRow) => {
    const detail = menuItems
      .map((item) => `<li><strong>${item.name}</strong><br/>${item.value ?? "説明なし"}<br/>目安: ${item.duration ?? 0}${item.duration_unit ?? "分"}</li>`)
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${menu.title}</title><style>body{font-family:-apple-system,BlinkMacSystemFont,'Hiragino Sans',sans-serif;padding:32px;color:#17211e}h1{font-size:28px}li{margin:14px 0;line-height:1.7}.meta{color:#5e6d68}.card{border:1px solid #dfe7e2;border-radius:18px;padding:20px}</style></head><body><p class="meta">CLUB HUB 練習メニュー</p><div class="card"><h1>${menu.title}</h1><p class="meta">${menu.for_sale ? String(menu.price_coin ?? 0) + " coin" : "無料"}</p><h2>練習内容</h2><ol>${detail || "<li>練習内容はまだ登録されていません。</li>"}</ol></div><script>setTimeout(() => window.print(), 300)</script></body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const createMenu = async () => {
    if (!selectedClub) {
      setStatus("先に部活を選択してください");
      return;
    }

    if (!newMenuTitle.trim()) {
      setStatus("メニュータイトルを入力してください");
      return;
    }

    const validSteps = newMenuSteps.filter((step) => step.name.trim());

    if (validSteps.length === 0) {
      setStatus("練習項目を1つ以上入力してください");
      return;
    }

    if (newMenuForSale && !canSellPaidMenus) {
      goToSellerVerification();
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setStatus(`ユーザー確認エラー: ${userError.message}`);
      return;
    }

    if (!user) {
      setStatus("ログイン情報を確認できませんでした");
      return;
    }

    const { data: menuData, error: menuError } = await supabase
      .from("menus")
      .insert({
        owner_id: user.id,
        club_id: selectedClub,
        title: newMenuTitle.trim(),
        visibility: "public",
        for_sale: newMenuForSale,
        price_coin: Number(newMenuPrice || 0),
        monthly_price_coin: 0,
        rights_confirmed: true,
        review_status: "approved",
      })
      .select("id, title, club_id, visibility, for_sale, price_coin, monthly_price_coin, review_status, created_at")
      .single();

    if (menuError) {
      setStatus(`投稿エラー: ${menuError.message}`);
      return;
    }

    const { error: itemError } = await supabase.from("menu_items").insert(
      validSteps.map((step, index) => ({
        menu_id: menuData.id,
        sort_order: index + 1,
        name: step.name.trim(),
        value: step.value.trim() || null,
        unit: null,
        duration: step.duration || "0",
        duration_unit: step.duration_unit || "分",
      }))
    );

    if (itemError) {
      setStatus(`練習内容保存エラー: ${itemError.message}`);
      return;
    }

    setNewMenuTitle("");
    setNewMenuDescription("");
    setNewMenuDuration("30");
    setNewMenuSteps([
      { id: "step-1", name: "", value: "", duration: "", duration_unit: "分" },
    ]);
    setMenus((current) => [menuData, ...current.filter((menu) => menu.id !== menuData.id)]);
    setMenuPreviewItems((current) => ({
      ...current,
      [menuData.id]: validSteps.map((step, index) => ({
        ...step,
        id: `preview-${menuData.id}-${index}`,
      })),
    }));
    setNewMenuForSale(false);
    setNewMenuPrice("0");
    setShowCreateMenuForm(false);

    setSelectedTemplate("");
    setStatus(
      !newMenuForSale || canSellPaidMenus
        ? "メニューを投稿しました。公開済みです。"
        : "有料メニューを投稿しました。管理者の承認後に表示されます。"
    );
  };

  const submitSellerVerification = async () => {
    if (profile?.verified || sellerVerificationStatus === "approved") {
      setSellerVerificationStatus("approved");
      setStatus("販売者登録は承認済みです。有料メニューを公開できます。");
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setStatus("申請にはログインが必要です");
      return;
    }

    const noteLines = [
      verificationNote.trim() || "販売者登録・本人確認・権利確認の申請",
      verificationFileName ? `添付ファイル名: ${verificationFileName}` : "添付ファイル名: 未選択",
      `表示名: ${displayName || profile?.display_name || "未設定"}`,
      `所属: ${teamName || "未設定"}`,
      `部活: ${(clubs.find((club) => club.id === selectedClub)?.name ?? selectedClub) || "未設定"}`,
    ];

    const { error } = await supabase.from("verification_requests").insert({
      user_id: user.id,
      doc_type: "seller_verification",
      note: noteLines.join("\n"),
      status: "pending",
    });

    if (error) {
      setStatus(`販売者登録申請エラー: ${error.message}`);
      return;
    }

    setSellerVerificationStatus("pending");
    setStatus("販売者登録を申請しました。管理者の承認後、有料メニューを公開できます。");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setEmail("");
    setPassword("");
    setStatus("");
  };

  const clubs = [
    { id: "soccer", name: "サッカー", description: "判断力・基礎技術・チーム連携を高める" },
    { id: "baseball", name: "野球", description: "守備・打撃・走塁をバランスよく強化" },
    { id: "basketball", name: "バスケ", description: "個人スキルとチーム戦術を磨く" },
    { id: "volleyball", name: "バレー", description: "基礎動作と連携プレーを高める" },
    { id: "track", name: "陸上", description: "走る・跳ぶ・投げる力を伸ばす" },
    { id: "tennis", name: "テニス", description: "フォームと試合展開を整える" },
    { id: "soft_tennis", name: "ソフトテニス", description: "前衛・後衛の連携と基礎を磨く" },
    { id: "badminton", name: "バドミントン", description: "フットワークとラリー力を伸ばす" },
    { id: "table_tennis", name: "卓球", description: "回転・コース・反応を鍛える" },
    { id: "swimming", name: "水泳", description: "フォーム・持久力・タイム向上を目指す" },
    { id: "judo", name: "柔道", description: "受け身・組み手・技の精度を高める" },
    { id: "kendo", name: "剣道", description: "足さばき・打突・礼法を磨く" },
    { id: "rugby", name: "ラグビー", description: "コンタクト・走力・連携を鍛える" },
    { id: "handball", name: "ハンドボール", description: "シュート・パス・速攻を高める" },
    { id: "gymnastics", name: "体操", description: "柔軟性・体幹・技の完成度を高める" },
    { id: "dance", name: "ダンス", description: "表現力・リズム・チーム演技を磨く" },
    { id: "other", name: "その他", description: "上記以外の競技・活動を登録する" },
  ];

  const teamCategories = ["小学校","中学校", "高校", "大学", "クラブチーム", "スポーツスクール", "その他"];
  const grades = [
    "ジュニア・小学生",
    "中学1年",
    "中学2年",
    "中学3年",
    "高校1年",
    "高校2年",
    "高校3年",
    "大学1年",
    "大学2年",
    "大学3年",
    "大学4年",
    "大学5年",
    "大学6年",
    "社会人",
    "指導者・コーチ",
    "保護者",
    "その他",
  ];

  const visibleBoardMenus = (boardMenus.length > 0 ? boardMenus : menus)
    .filter((menu) => {
      if (boardScope === "club" && selectedClub && menu.club_id !== selectedClub) return false;
      if (boardFilter === "paid" && !menu.for_sale) return false;
      if (boardFilter === "free" && menu.for_sale) return false;
      if (!boardSearch) return true;
      const keyword = boardSearch.toLowerCase();
      const clubName = clubs.find((club) => club.id === menu.club_id)?.name ?? "";
      return (
        menu.title.toLowerCase().includes(keyword) ||
        clubName.toLowerCase().includes(keyword) ||
        (menu.club_id ?? "").toLowerCase().includes(keyword)
      );
    })
    .sort((a, b) => {
      if (boardFilter !== "new") return 0;
      return String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""));
    });

  const getMenuSeed = (menu: MenuRow) =>
    Array.from(menu.id || menu.title).reduce((total, char) => total + char.charCodeAt(0), 0);
  const getMenuViews = (menu: MenuRow) => 80 + (getMenuSeed(menu) % 420);
  const getMenuPurchases = (menu: MenuRow) =>
    purchaseHistory.filter((purchase) => purchase.menu.id === menu.id).length + (menu.for_sale ? getMenuSeed(menu) % 18 : getMenuSeed(menu) % 7);
  const getMenuScore = (menu: MenuRow) =>
    getMenuViews(menu) + getMenuPurchases(menu) * 24 + (menu.for_sale ? 35 : 10);
  const rankedBoardMenus = [...visibleBoardMenus].sort((a, b) => getMenuScore(b) - getMenuScore(a));
  const getMenuOrganization = (menu: MenuRow) => {
    if (menu.club_id === selectedClub && teamName) return teamName;
    const clubName = clubs.find((club) => club.id === menu.club_id)?.name ?? "選択中の部活";
    const samples = [
      `${clubName}強化クラブ`,
      "青葉学園高校",
      "港北スポーツ少年団",
      "西宮スポーツスクール",
      "中央中学校",
      "南町クラブ",
    ];
    return samples[getMenuSeed(menu) % samples.length];
  };
  const organizationRankings = Array.from(
    rankedBoardMenus.reduce((map, menu) => {
      const name = getMenuOrganization(menu);
      const current = map.get(name) ?? { name, score: 0, count: 0 };
      current.score += getMenuScore(menu);
      current.count += 1;
      map.set(name, current);
      return map;
    }, new Map<string, { name: string; score: number; count: number }>())
  )
    .map(([, value]) => value)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  const selectedOrganizationMenus = selectedOrganization
    ? rankedBoardMenus.filter((menu) => getMenuOrganization(menu) === selectedOrganization)
    : [];
  const sellingMenus = menus.filter((menu) => menu.for_sale);
  const draftRevenueRows = sellingMenus.slice(0, 4);

  const boardRegions = ["北海道", "東北", "関東", "中部", "関西", "中国・四国", "九州", "オンライン"];
  const boardOpportunities = [
    ...customBoardOpportunities,
    { id: "match-tokyo-1", type: "match" as const, region: "関東", title: "週末に練習試合できるチーム募集", team: "青葉学園高校・Aチーム", detail: "土曜午後、野球。グラウンド確保済み。レベルは中級くらいです。", created_at: "2026-06-12T09:00:00.000Z" },
    { id: "match-kanagawa-1", type: "match" as const, region: "関東", title: "中学生バスケの練習試合募集", team: "港北クラブ", detail: "日曜午前、体育館あり。男女どちらも相談できます。", created_at: "2026-06-11T09:00:00.000Z" },
    { id: "camp-kansai-1", type: "camp" as const, region: "関西", title: "夏休み合同合宿の参加チーム募集", team: "西宮スポーツスクール", detail: "2泊3日。基礎練、試合形式、夜のミーティングまで合同で実施予定。", created_at: "2026-06-10T09:00:00.000Z" },
    { id: "camp-online-1", type: "camp" as const, region: "オンライン", title: "オンライン分析会の参加者募集", team: "CLUB HUB コーチ陣", detail: "動画を共有してフォーム・戦術を一緒に確認します。", created_at: "2026-06-09T09:00:00.000Z" },
  ];
  const visibleBoardOpportunities = boardOpportunities.filter(
    (item) => item.region === boardRegion && (!boardApplication || item.type === boardApplication)
  );

  const menuTemplates = [
    {
      id: "basic",
      title: "基本練習",
      steps: [
        { name: "ジョグ", value: "軽く体を温める", duration: "30", duration_unit: "分" },
        { name: "素振り", value: "フォームを確認しながら行う", duration: "100", duration_unit: "回" },
        { name: "ゲーム練習", value: "実戦形式で確認する", duration: "1", duration_unit: "時間" },
      ],
    },
    {
      id: "match",
      title: "試合前",
      steps: [
        { name: "軽いアップ", value: "疲労を残さない強度で動く", duration: "10", duration_unit: "分" },
        { name: "確認練習", value: "試合で使う動きを短時間で確認", duration: "15", duration_unit: "分" },
        { name: "作戦確認", value: "役割と声かけを確認する", duration: "10", duration_unit: "分" },
      ],
    },
    {
      id: "strength",
      title: "強化練習",
      steps: [
        { name: "基礎反復", value: "正確さを優先して反復する", duration: "20", duration_unit: "分" },
        { name: "負荷練習", value: "試合より少し高い強度で行う", duration: "30", duration_unit: "分" },
        { name: "振り返り", value: "改善点を1つ記録する", duration: "5", duration_unit: "分" },
      ],
    },
  ];

  const applyMenuTemplate = (template: (typeof menuTemplates)[number]) => {
    setSelectedTemplate(template.id);
    setNewMenuTitle(template.title + "メニュー");
    setNewMenuSteps(
      template.steps.map((step, index) => ({
        id: `template-${template.id}-${index}`,
        ...step,
      }))
    );
  };

  const homeActionStyle: React.CSSProperties = {
    textAlign: "left",
    padding: "14px 16px",
    borderRadius: 16,
    border: "1px solid #dfe7e2",
    background: "#f7faf8",
    color: "#163b2f",
    fontWeight: 800,
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

  if (
    profile &&
    (!profile.club_id || !profile.team_name || !profile.team_category || !profile.grade)
  ) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#e8eee9",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Hiragino Sans", "Yu Gothic", sans-serif',
          color: "#17211e",
          padding: 20,
        }}
      >
        <div
          style={{
            maxWidth: isPcPreview ? 1240 : 430,
            minHeight: "calc(100vh - 40px)",
            margin: "0 auto",
            background: "#fbfcf8",
            borderRadius: 30,
            padding: 22,
            boxShadow: "0 28px 90px rgba(23, 33, 30, 0.18)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background: "#b96317",
                display: "grid",
                placeItems: "center",
                color: "#fff",
                fontWeight: 900,
              }}
            >
              C
            </div>
            <div>
              <p style={{ margin: 0, color: "#7b8780", fontSize: 12, fontWeight: 900 }}>
                CLUB HUB
              </p>
              <strong style={{ fontSize: 18 }}>初期設定</strong>
            </div>
          </div>

          <section
            style={{
              marginTop: 24,
              background: "#fff",
              border: "1px solid #edf1ed",
              borderRadius: 28,
              padding: 24,
              boxShadow: "0 24px 54px rgba(75, 94, 86, 0.12)",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#2c765f",
                letterSpacing: 2,
                fontSize: 11,
                fontWeight: 900,
              }}
            >
              STEP 2
            </p>
            <h1 style={{ margin: "10px 0 0", fontSize: 28, lineHeight: 1.25 }}>
              部活と所属を設定
            </h1>
            <p style={{ color: "#7b8780", lineHeight: 1.8, fontSize: 14 }}>
              最初にあなたの部活・学校名・学年を設定します。ここまで終わるとホーム、練習メニュー、マイページに進めます。
            </p>

            {status && (
              <p
                style={{
                  marginTop: 12,
                  padding: "11px 12px",
                  borderRadius: 14,
                  background: "#fff8e8",
                  color: "#8a5a10",
                  border: "1px solid #ead5a8",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                {status}
              </p>
            )}
          </section>

          <section style={{ marginTop: 20 }}>
            <h2 style={{ margin: "0 0 12px", color: "#65746e", fontSize: 13, letterSpacing: 1.2 }}>
              部活を選択
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
              {clubs.map((club) => (
                <button
                  key={club.id}
                  type="button"
                  onClick={() => setSelectedClub(club.id)}
                  style={{
                    textAlign: "left",
                    minHeight: 74,
                    border: selectedClub === club.id ? "2px solid #0f6b55" : "1px solid #edf1ed",
                    background: selectedClub === club.id ? "#e7f3ee" : "#fff",
                    borderRadius: 18,
                    padding: 14,
                    cursor: "pointer",
                    boxShadow: selectedClub === club.id ? "0 12px 26px rgba(15, 107, 85, 0.12)" : "none",
                  }}
                >
                  <strong style={{ fontSize: 14 }}>{club.name}</strong>
                </button>
              ))}
            </div>
          </section>

          <section
            style={{
              marginTop: 20,
              background: "#fff",
              border: "1px solid #edf1ed",
              borderRadius: 24,
              padding: 18,
            }}
          >
            <h2 style={{ margin: "0 0 12px", fontSize: 16 }}>所属情報</h2>
            <div style={{ display: "grid", gap: 10 }}>
              <input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="学校名・チーム名"
                style={inputStyle}
              />
              <select
                value={teamCategory}
                onChange={(e) => setTeamCategory(e.target.value)}
                style={inputStyle}
              >
                <option value="">チーム区分を選択</option>
                {teamCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {teamCategory === "その他" && (
                <input
                  value={customTeamCategory}
                  onChange={(e) => setCustomTeamCategory(e.target.value)}
                  placeholder="チーム区分を入力"
                  style={inputStyle}
                />
              )}
              <select value={grade} onChange={(e) => setGrade(e.target.value)} style={inputStyle}>
                <option value="">学年を選択</option>
                {grades.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {grade === "その他" && (
                <input
                  value={customGrade}
                  onChange={(e) => setCustomGrade(e.target.value)}
                  placeholder="学年・立場を入力"
                  style={inputStyle}
                />
              )}
            </div>
          </section>

          <button
            type="button"
            onClick={saveProfileSettings}
            disabled={!selectedClub || !teamName || !teamCategory || !grade}
            style={{
              width: "100%",
              marginTop: 18,
              border: "none",
              borderRadius: 18,
              background:
                !selectedClub || !teamName || !teamCategory || !grade ? "#cad6d1" : "#0f6b55",
              color: "#fff",
              padding: "15px 18px",
              fontWeight: 900,
              fontSize: 15,
              boxShadow:
                !selectedClub || !teamName || !teamCategory || !grade
                  ? "none"
                  : "0 16px 30px rgba(15, 107, 85, 0.22)",
              cursor:
                !selectedClub || !teamName || !teamCategory || !grade
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            保存してホームへ進む
          </button>

          <button
            type="button"
            onClick={logout}
            style={{
              width: "100%",
              marginTop: 10,
              border: "1px solid #dfe7e2",
              borderRadius: 16,
              background: "#fff",
              color: "#5e6d68",
              padding: "13px 16px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            ログアウト
          </button>
        </div>
      </main>
    );
  }

  if (profile) {
    const selectedClubName =
      clubs.find((club) => club.id === selectedClub)?.name ?? "部活未選択";
    const currentSellerStatus = profile.verified ? "approved" : sellerVerificationStatus;
    const sellerStatusLabel =
      currentSellerStatus === "approved"
        ? "販売者承認済み"
        : currentSellerStatus === "pending"
          ? "販売者申請中"
          : currentSellerStatus === "rejected"
            ? "販売者申請差し戻し"
            : "販売者未登録";
    const teamLine = [teamName, teamCategory === "その他" ? customTeamCategory : teamCategory]
      .filter(Boolean)
      .join("・") || "所属を設定してください";
    const menuMonthOptions = Array.from(new Set(menus.map((menu) => getMenuMonthKey(menu.created_at)))).sort((a, b) => b.localeCompare(a));
    const filteredPostMenus = postMenuMonth === "all" ? menus : menus.filter((menu) => getMenuMonthKey(menu.created_at) === postMenuMonth);
    const postMenuPageSize = 8;
    const postMenuTotalPages = Math.max(1, Math.ceil(filteredPostMenus.length / postMenuPageSize));
    const safePostMenuPage = Math.min(postMenuPage, postMenuTotalPages - 1);
    const visibleMenus = filteredPostMenus.slice(safePostMenuPage * postMenuPageSize, safePostMenuPage * postMenuPageSize + postMenuPageSize);
    const todayMenus = menus.filter(isTodayMenu);
    const chatNotifications = Object.entries(boardChatMessages).flatMap(([targetId, messages]) =>
      messages.map((message, index) => ({
        id: `chat-${targetId}-${index}`,
        type: "chat" as const,
        title: "チャットに返信があります",
        body: message,
        targetId,
      }))
    );
    const purchaseNotifications = purchaseHistory.map((purchase) => ({
      id: `purchase-${purchase.id}`,
      type: "purchase" as const,
      title: "メニューを購入しました",
      body: `${purchase.title} / ${purchase.amount > 0 ? `${purchase.amount} coin` : "無料"}`,
      menu: purchase.menu,
    }));
    const proStatusNotifications = proNotifications.map((notification) => ({
      id: notification.id,
      type: "pro" as const,
      title: notification.title,
      body: `${notification.body} / ${notification.createdAt}`,
    }));
    const notifications = [...proStatusNotifications, ...chatNotifications, ...purchaseNotifications];
    const notificationCount = notifications.length;
    const unreadNotificationCount = Math.max(0, notificationCount - seenNotificationCount);

    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#e8eee9",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Hiragino Sans", "Yu Gothic", sans-serif',
          color: "#17211e",
          paddingBottom: 210,
        }}
      >
        <div
          style={{
	            maxWidth: isPcPreview ? 1180 : 430,
            minHeight: "100vh",
            margin: "0 auto",
            background: "#fbfcf8",
            boxShadow: "0 28px 90px rgba(23, 33, 30, 0.18)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <header
            style={{
              height: 64,
              display: "flex",
              alignItems: "center",
              gap: 12,
	              padding: isPcPreview ? "0 34px" : "0 20px",
              background: "rgba(251, 252, 248, 0.92)",
              borderBottom: "1px solid #edf1ec",
              position: "sticky",
              top: 0,
              zIndex: 10,
              backdropFilter: "blur(14px)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: "#b96317",
                display: "grid",
                placeItems: "center",
                color: "#fff",
                fontWeight: 900,
                boxShadow: "0 10px 24px rgba(185, 99, 23, 0.24)",
              }}
            >
              C
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  color: "#8b968f",
                  fontSize: 11,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {teamLine}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <strong
                  style={{
                    fontSize: 16,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {selectedClubName}
                </strong>
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 999,
                    background: selectedClub ? "#9fc6b6" : "#d8ded8",
                    display: "inline-block",
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("revenue");
                    setRevenueView(isProActive ? "subscription" : "pro");
                    setMypageView("top");
                    setSelectedMenu(null);
                    setIsNotificationPanelOpen(false);
                  }}
                  style={{
                    borderRadius: 999,
                    background: "#dcefe7",
                    color: "#2f7b62",
                    fontSize: 10,
                    fontWeight: 900,
                    padding: "2px 7px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {isProActive ? "PRO加入中" : "Pro未加入"}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPcPreview((current) => !current)}
              aria-label="PCプレビュー切替"
              style={{
                borderRadius: 999,
                background: isPcPreview ? "#17211e" : "#edf3ef",
                border: "none",
                color: isPcPreview ? "#fff" : "#52655e",
                padding: "8px 10px",
                fontSize: 12,
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              {isPcPreview ? "SP" : "PC"}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("revenue");
                setRevenueView("coins");
                setMypageView("top");
                setSelectedMenu(null);
                setIsNotificationPanelOpen(false);
              }}
              aria-label="コインを購入"
              style={{
                borderRadius: 999,
                background: "#fff8ea",
                border: "1px solid #f0dfbd",
                color: "#9a6d16",
                padding: "8px 12px",
                fontSize: 13,
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              {coinBalance.toLocaleString()} coin
            </button>
            <button
              type="button"
              onClick={openLatestNotification}
              aria-label="通知"
              style={{
                minWidth: 48,
                height: 34,
                border: "none",
                borderRadius: 999,
                background: "#edf3ef",
                color: "#52655e",
                fontWeight: 900,
                fontSize: 12,
                cursor: "pointer",
                position: "relative",
                padding: "0 10px",
              }}
            >
              通知
              {unreadNotificationCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -7,
                    minWidth: 20,
                    height: 20,
                    borderRadius: 999,
                    background: "#b96317",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 13,
                    lineHeight: 1,
                    border: "2px solid #fbfcf8",
                  }}
                >
                  {formatNotificationBadge(unreadNotificationCount)}
                </span>
              )}
            </button>
          </header>

          {isNotificationPanelOpen && (
            <>
              <button
                type="button"
                aria-label="通知を閉じる"
                onClick={() => setIsNotificationPanelOpen(false)}
                style={{ position: "fixed", inset: 0, border: "none", background: "rgba(23, 33, 30, 0.42)", zIndex: 1000, cursor: "pointer" }}
              />
              <section style={{ position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", width: isPcPreview ? "min(760px, calc(100% - 80px))" : "min(390px, calc(100% - 28px))", maxHeight: "82vh", overflowY: "auto", zIndex: 1001, background: "#fff", border: "1px solid #edf1ed", borderRadius: 26, padding: 20, boxShadow: "0 24px 64px rgba(23, 33, 30, 0.24)" }}>
                <button type="button" onClick={() => setIsNotificationPanelOpen(false)} style={{ position: "absolute", top: 14, right: 14, width: 36, height: 36, borderRadius: 999, border: "1px solid #dfe7e2", background: "#fff", color: "#17211e", fontWeight: 900, cursor: "pointer" }}>×</button>
                <h3 style={{ margin: 0, fontSize: 20, letterSpacing: 0.3, color: "#17211e" }}>通知</h3>
                <p style={{ color: "#7b8780", lineHeight: 1.75, fontSize: 13, fontWeight: 700, margin: "12px 0 16px" }}>
	                  チャット返信、メニュー購入、コイン購入、Pro加入・解約のお知らせを確認できます。
                </p>
                {notifications.length === 0 ? (
                  <div style={{ border: "1px solid #edf1ed", borderRadius: 18, background: "#fbfcf8", padding: 18, color: "#7b8780", fontSize: 14, fontWeight: 900, textAlign: "center" }}>
                    通知はありません
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 10 }}>
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => {
                          if (notification.type === "chat") {
                            setActiveTab("board");
                            setBoardMode("recruit");
                            setBoardChatTarget(notification.targetId);
                            setRevenueView("top");
                            setMypageView("top");
                            setSelectedMenu(null);
                            setStatus("");
	                          } else if (notification.type === "purchase") {
	                            setActiveTab("revenue");
	                            setRevenueView("purchases");
	                            setMypageView("top");
	                            setSelectedMenu(null);
	                            setStatus("");
	                          } else {
	                            setActiveTab("revenue");
	                            setRevenueView("pro");
	                            setMypageView("top");
	                            setSelectedMenu(null);
	                            setStatus("");
	                          }
                          setIsNotificationPanelOpen(false);
                        }}
                        style={{ textAlign: "left", border: "1px solid #edf1ed", borderRadius: 18, background: "#fbfcf8", padding: 14, color: "#17211e", cursor: "pointer" }}
                      >
                        <strong style={{ display: "block", fontSize: 14, lineHeight: 1.5 }}>▶︎ {notification.title}</strong>
                        <span style={{ display: "block", marginTop: 6, color: "#7b8780", fontSize: 12, fontWeight: 800, lineHeight: 1.6 }}>
                          {notification.body}
                        </span>
                      </button>
			                      ))}
				                    </div>
			                  )}
              </section>
            </>
          )}

		          <div style={{ padding: isPcPreview ? "30px 44px 112px" : "18px 20px 92px" }}>
            {activeTab === "home" && (
              <section
                style={{
                position: "relative",
                overflow: "hidden",
                background: "#fff",
                border: "1px solid #eef1ed",
                borderRadius: 28,
                padding: "58px 24px 22px",
                boxShadow: "0 24px 54px rgba(75, 94, 86, 0.12)",
                minHeight: 190,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: 180,
                  height: 180,
                  borderRadius: "50%",
                  right: -42,
                  top: -58,
                  background: "#f4eee8",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: 74,
                  height: 74,
                  borderRadius: 22,
                  right: 24,
                  top: 92,
                  background: "#f6faf8",
                  border: "1px solid #e8efea",
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 18px 34px rgba(75, 94, 86, 0.12)",
                  color: "#b58a2c",
                  fontWeight: 900,
                  fontSize: 28,
                }}
              >
                ◎
              </div>
              <p
                style={{
                  margin: 0,
                  color: "#2c765f",
                  letterSpacing: 2.4,
                  fontSize: 11,
                  fontWeight: 900,
                }}
              >
                TODAY&apos;S TRAINING
              </p>
              <h1 style={{ margin: "10px 0 0", fontSize: 31, lineHeight: 1.16 }}>
                {profile.display_name}さん
              </h1>
              <p style={{ margin: "10px 0 0", color: "#7b8780", fontSize: 13, fontWeight: 700 }}>
                {teamLine}
              </p>
              <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                <span style={{ borderRadius: 999, background: "#e4f3ed", color: "#2b765f", padding: "7px 11px", fontSize: 12, fontWeight: 900 }}>
                  認証済み
                </span>
                <span style={{ borderRadius: 999, background: "#fff5dc", color: "#9a6d16", padding: "7px 11px", fontSize: 12, fontWeight: 900 }}>
	                  今日 {todayMenus.length} 件
                </span>
              </div>
              </section>
            )}

            {activeTab === "home" && status && (
              <p
                style={{
                  margin: "16px 0 0",
                  padding: "12px 14px",
                  borderRadius: 16,
                  background: "#fff8e8",
                  color: "#8a5a10",
                  border: "1px solid #ead5a8",
                  fontSize: 13,
                  fontWeight: 800,
                  lineHeight: 1.6,
                }}
              >
                {status}
              </p>
            )}

            {activeTab === "home" && (
              <>
                <section style={{ marginTop: 26 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <h2 style={{ margin: 0, color: "#65746e", fontSize: 13, letterSpacing: 1.2 }}>
                      今日のメニュー
                    </h2>
	                    <button
	                      type="button"
	                      onClick={() => (showCreateMenuForm ? setShowCreateMenuForm(false) : openBlankCreateMenu())}
                      style={{
                        border: "none",
                        borderRadius: 16,
                        background: "#0f6b55",
                        color: "#fff",
                        padding: "11px 16px",
                        fontWeight: 900,
                        boxShadow: "0 14px 28px rgba(15, 107, 85, 0.22)",
                        cursor: "pointer",
                      }}
                    >
                      + 作成
                    </button>
                  </div>

	                  {todayMenus.length === 0 ? (
                    <div
                      style={{
                        borderRadius: 26,
                        background: "#eff7f3",
                        minHeight: 146,
                        display: "grid",
                        placeItems: "center",
                        padding: 24,
                        textAlign: "center",
                      }}
                    >
                      <div>
                        <p style={{ margin: "0 0 14px", color: "#82908a", fontWeight: 800 }}>
	                          今日作成したメニューはまだありません
                        </p>
	                        <button
	                          type="button"
	                          onClick={openBlankCreateMenu}
                          style={{
                            border: "none",
                            borderRadius: 15,
                            background: "#0f6b55",
                            color: "#fff",
                            padding: "13px 22px",
                            fontWeight: 900,
                            boxShadow: "0 14px 28px rgba(15, 107, 85, 0.22)",
                            cursor: "pointer",
                          }}
                        >
                          最初のメニューを作る
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: 12 }}>
		                      {todayMenus.slice(0, 2).map((menu) => (
	                        <article
	                          key={menu.id}
	                          onClick={() => openMenuDetail(menu)}
	                          onKeyDown={(event) => {
	                            if (event.key === "Enter" || event.key === " ") {
	                              event.preventDefault();
	                              openMenuDetail(menu);
	                            }
	                          }}
	                          role="button"
	                          tabIndex={0}
	                          style={{
	                            textAlign: "left",
	                            border: "1px solid #edf1ed",
                            borderRadius: 22,
                            background: "#fff",
	                            padding: 18,
	                            boxShadow: "0 18px 40px rgba(75, 94, 86, 0.1)",
	                            cursor: "pointer",
	                            position: "relative",
	                          }}
	                        >
	                          <button
	                            type="button"
	                            onClick={(event) => {
	                              event.stopPropagation();
	                              deleteMenu(menu);
	                            }}
	                            aria-label="今日のメニューを削除"
	                            style={{ position: "absolute", top: 10, right: 12, width: 24, height: 24, borderRadius: 999, border: "1px solid #f1d4d4", background: "#fff", color: "#a33a3a", fontSize: 12, fontWeight: 900, cursor: "pointer" }}
	                          >
	                            ×
	                          </button>
	                          <span style={{ position: "absolute", top: 38, right: 16, color: "#9aa59f", fontSize: 10, fontWeight: 900 }}>
	                            {formatMenuDate(menu.created_at)}
	                          </span>
	                          <p style={{ margin: 0, color: "#7f8c86", fontSize: 12, fontWeight: 800 }}>
                            {selectedClubName}
                          </p>
	                          <strong style={{ display: "block", marginTop: 10, fontSize: 18, lineHeight: 1.4 }}>
	                            {menu.title}
	                          </strong>
	                          {menuPreviewItems[menu.id]?.length > 0 && (
	                            <div style={{ marginTop: 12, display: "grid", gap: 7 }}>
	                              {menuPreviewItems[menu.id].slice(0, 3).map((step) => (
	                                <div key={step.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, color: "#5e6d68", fontSize: 12, fontWeight: 800 }}>
	                                  <span>{step.name}</span>
	                                  <span>{step.duration}{step.duration_unit}</span>
	                                </div>
	                              ))}
	                            </div>
	                          )}
	                          <p style={{ margin: "12px 0 0", color: "#87918c", fontSize: 12, fontWeight: 800 }}>
	                            {menu.for_sale ? String(menu.price_coin ?? 0) + " coin" : "無料"} ・ 詳細を見る
	                          </p>
	                        </article>
	                      ))}
                    </div>
                  )}
                </section>

                {showCreateMenuForm && (
                  <section
                    style={{
                      background: "#fff",
                      border: "1px solid #edf1ed",
                      borderRadius: 26,
                      padding: 20,
                      marginTop: 22,
                      boxShadow: "0 18px 42px rgba(75, 94, 86, 0.1)",
                    }}
                  >
                    <h2 style={{ margin: 0, fontSize: 18 }}>練習メニューを作成</h2>
                    <p style={{ margin: "8px 0 16px", color: "#7b8780", fontSize: 13, lineHeight: 1.7 }}>
                      テンプレートから選ぶと、練習内容の型をすぐに入れられます。
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
                      {menuTemplates.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => applyMenuTemplate(template)}
                          style={{
                            border: selectedTemplate === template.id ? "2px solid #0f6b55" : "1px solid #dfe7e2",
                            borderRadius: 14,
                            background: selectedTemplate === template.id ? "#e7f3ee" : "#fff",
                            color: "#163b2f",
                            padding: "10px 8px",
                            fontSize: 12,
                            fontWeight: 900,
                            cursor: "pointer",
                          }}
                        >
                          {template.title.replace("メニュー", "")}
                        </button>
                      ))}
                    </div>
                    <input value={newMenuTitle} onChange={(e) => setNewMenuTitle(e.target.value)} placeholder="例: バッティング強化30日プログラム" style={{ ...inputStyle, background: "#fbfcf8" }} />

                    <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                      {newMenuSteps.map((step, index) => (
                        <div key={step.id} style={{ border: "1px solid #edf1ed", borderRadius: 18, padding: 12, background: "#fbfcf8" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                            <strong style={{ fontSize: 13 }}>練習 {index + 1}</strong>
                            <button type="button" onClick={() => removeMenuStep(step.id)} style={{ border: "none", background: "transparent", color: "#a33a3a", fontWeight: 900, cursor: "pointer" }}>
                              削除
                            </button>
                          </div>
                          <input value={step.name} onChange={(e) => updateMenuStep(step.id, "name", e.target.value)} placeholder="例: ジョグ / 素振り / ゲーム練習" style={{ ...inputStyle, marginTop: 8, background: "#fff" }} />
                          <input value={step.value} onChange={(e) => updateMenuStep(step.id, "value", e.target.value)} placeholder="ポイント・説明" style={{ ...inputStyle, marginTop: 8, background: "#fff" }} />
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 96px", gap: 8, marginTop: 8 }}>
                            <input value={step.duration} onChange={(e) => updateMenuStep(step.id, "duration", e.target.value)} placeholder="30 / 100 / 1" style={{ ...inputStyle, background: "#fff" }} />
                            <select value={step.duration_unit} onChange={(e) => updateMenuStep(step.id, "duration_unit", e.target.value)} style={{ ...inputStyle, background: "#fff" }}>
                              <option value="分">分</option>
                              <option value="時間">時間</option>
                              <option value="回">回</option>
                              <option value="本">本</option>
                              <option value="セット">セット</option>
                            </select>
                          </div>
                        </div>
                      ))}
                      <button type="button" onClick={addMenuStep} style={{ border: "1px dashed #0f6b55", borderRadius: 16, background: "#f7faf8", color: "#0f6b55", padding: "12px", fontWeight: 900, cursor: "pointer" }}>
                        + 練習項目を追加
                      </button>
                    </div>
		                    <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, color: "#163b2f", fontWeight: 900, fontSize: 13 }}>
		                      <input
		                        type="checkbox"
		                        checked={newMenuForSale}
		                        onChange={(e) => {
		                          if (e.target.checked && !canSellPaidMenus) {
		                            setNewMenuForSale(false);
		                            goToSellerVerification();
		                            return;
		                          }
		                          setNewMenuForSale(e.target.checked);
		                        }}
		                      />
		                      有料メニューとして投稿する
		                    </label>
		                    {!canSellPaidMenus && (
		                      <div style={{ marginTop: 10, border: "1px solid #ead5a8", borderRadius: 16, background: "#fff8e8", padding: 12, color: "#8a5a10", fontSize: 12, fontWeight: 800, lineHeight: 1.7 }}>
		                        有料販売は販売者登録の承認後に使えます。無料メニューは本人確認なしで投稿できます。
		                        <button type="button" onClick={goToSellerVerification} style={{ display: "block", width: "100%", marginTop: 10, border: "none", borderRadius: 13, background: "#17211e", color: "#fff", padding: "11px 12px", fontWeight: 900, cursor: "pointer" }}>
		                          販売者登録へ進む
		                        </button>
		                      </div>
		                    )}
	                    {newMenuForSale && (
	                      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
	                        <input value={newMenuPrice} onChange={(e) => setNewMenuPrice(e.target.value)} placeholder="価格 coin" style={{ ...inputStyle, background: "#fbfcf8" }} />
	                        <p style={{ margin: 0, color: "#7b8780", fontSize: 12, lineHeight: 1.7, fontWeight: 800 }}>
	                          通常販売は売上の30%が運営手数料、70%が投稿者の売上になります。
	                        </p>
	                      </div>
	                    )}
                    <button type="button" onClick={createMenu} style={{ width: "100%", marginTop: 14, border: "none", borderRadius: 16, background: "#0f6b55", color: "#fff", padding: "14px 18px", fontWeight: 900, boxShadow: "0 16px 30px rgba(15, 107, 85, 0.22)", cursor: "pointer" }}>
                      投稿する
                    </button>
                  </section>
                )}

                <section style={{ marginTop: 28 }}>
	                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h2 style={{ margin: 0, color: "#65746e", fontSize: 13, letterSpacing: 1.2 }}>
	                      自分の投稿メニュー
                    </h2>
	                    <button type="button" onClick={loadMenus} style={{ border: "none", background: "transparent", color: "#0f6b55", fontWeight: 900, cursor: "pointer" }}>
	                      更新
	                    </button>
	                  </div>
	                  {menus.length > 0 && (
	                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", marginBottom: 12 }}>
	                      <select
	                        value={postMenuMonth}
	                        onChange={(event) => {
	                          setPostMenuMonth(event.target.value);
	                          setPostMenuPage(0);
	                        }}
	                        style={{ ...inputStyle, background: "#fff" }}
	                      >
	                        <option value="all">すべての月</option>
	                        {menuMonthOptions.map((month) => (
	                          <option key={month} value={month}>{formatMenuMonth(month)}</option>
	                        ))}
	                      </select>
	                      <span style={{ color: "#7b8780", fontSize: 12, fontWeight: 900 }}>
	                        {filteredPostMenus.length}件
	                      </span>
	                    </div>
	                  )}
	                  {menus.length === 0 ? (
	                    <div style={{ background: "#fff", border: "1px solid #edf1ed", borderRadius: 22, padding: 20, color: "#7b8780", fontWeight: 800 }}>
		                      まだ投稿した練習メニューがありません。
	                    </div>
	                  ) : filteredPostMenus.length === 0 ? (
	                    <div style={{ background: "#fff", border: "1px solid #edf1ed", borderRadius: 22, padding: 20, color: "#7b8780", fontWeight: 800 }}>
	                      この月の投稿メニューはありません。
	                    </div>
	                  ) : (
	                    <>
	                    <div style={{ display: "grid", gridTemplateColumns: isPcPreview ? "repeat(4, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))", gap: 12 }}>
		                      {visibleMenus.map((menu) => (
					                        <article key={menu.id} onClick={() => openMenuDetail(menu)} style={{ minHeight: 178, textAlign: "left", border: "1px solid #edf1ed", borderRadius: 22, background: "#fff", padding: "42px 16px 16px", boxShadow: "0 14px 32px rgba(75, 94, 86, 0.09)", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative" }}>
			                          <button
			                            type="button"
			                            onClick={(event) => {
		                              event.stopPropagation();
		                              deleteMenu(menu);
		                            }}
		                            aria-label="投稿メニューを削除"
			                            style={{ position: "absolute", top: 10, right: 12, width: 26, height: 26, borderRadius: 999, border: "1px solid #f1d4d4", background: "#fff", color: "#a33a3a", fontSize: 12, fontWeight: 900, cursor: "pointer", zIndex: 2, boxShadow: "0 8px 18px rgba(163, 58, 58, 0.12)" }}
		                          >
		                            ×
		                          </button>
			                          <span style={{ position: "absolute", top: 14, left: 16, color: "#9aa59f", fontSize: 10, fontWeight: 900 }}>
			                            {formatMenuDate(menu.created_at)}
			                          </span>
			                          <div>
		                            <div style={{ textAlign: "right", color: "#c29b42", fontWeight: 900, fontSize: 22, paddingTop: 0, paddingRight: 3 }}>◎</div>
	                            <p style={{ margin: "10px 0 0", color: "#7b8780", fontSize: 11, fontWeight: 900 }}>{selectedClubName}</p>
                            <strong style={{ display: "block", marginTop: 8, fontSize: 15, lineHeight: 1.45 }}>{menu.title}</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#8b968f", fontSize: 12, fontWeight: 900 }}>
                            <span>詳細</span>
	                            <span style={{ color: "#b48119" }}>{menu.for_sale ? String(menu.price_coin ?? 0) : "無料"}</span>
	                          </div>
	                        </article>
		                      ))}
			                    </div>
		                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
		                      <button
		                        type="button"
		                        onClick={() => setPostMenuPage((current) => Math.max(0, current - 1))}
		                        disabled={safePostMenuPage === 0}
		                        style={{ border: "1px solid #dfe7e2", borderRadius: 15, background: safePostMenuPage === 0 ? "#f2f5f2" : "#fff", color: safePostMenuPage === 0 ? "#a4aea8" : "#163b2f", padding: "12px 14px", fontWeight: 900, cursor: safePostMenuPage === 0 ? "not-allowed" : "pointer" }}
		                      >
		                        前のページ
		                      </button>
		                      <button
		                        type="button"
		                        onClick={() => setPostMenuPage((current) => Math.min(postMenuTotalPages - 1, current + 1))}
		                        disabled={safePostMenuPage >= postMenuTotalPages - 1}
		                        style={{ border: "none", borderRadius: 15, background: safePostMenuPage >= postMenuTotalPages - 1 ? "#cad6d1" : "#0f6b55", color: "#fff", padding: "12px 14px", fontWeight: 900, cursor: safePostMenuPage >= postMenuTotalPages - 1 ? "not-allowed" : "pointer" }}
		                      >
		                        次のページ
		                      </button>
		                    </div>
		                    <p style={{ margin: "10px 0 0", color: "#7b8780", fontSize: 12, fontWeight: 800, textAlign: "center" }}>
		                      {safePostMenuPage + 1} / {postMenuTotalPages} ページ
		                    </p>
		                    </>
		                  )}
                </section>

                {selectedMenu && (
                  <>
                    <button type="button" aria-label="メニュー詳細を閉じる" onClick={() => setSelectedMenu(null)} style={{ position: "fixed", inset: 0, border: "none", background: "rgba(23, 33, 30, 0.42)", zIndex: 1000, cursor: "pointer" }} />
                    <section style={{ position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", width: isPcPreview ? "min(760px, calc(100% - 80px))" : "min(390px, calc(100% - 28px))", maxHeight: "82vh", overflowY: "auto", zIndex: 1001, background: "#fff", border: "1px solid #edf1ed", borderRadius: 26, padding: 20, boxShadow: "0 24px 64px rgba(23, 33, 30, 0.24)" }}>
                    <button type="button" onClick={() => setSelectedMenu(null)} style={{ position: "absolute", top: 14, right: 14, width: 36, height: 36, borderRadius: 999, border: "1px solid #dfe7e2", background: "#fff", color: "#17211e", fontWeight: 900, cursor: "pointer" }}>×</button>
                    <p style={{ margin: 0, color: "#2c765f", fontSize: 11, fontWeight: 900, letterSpacing: 1.4 }}>
                      MENU DETAIL
                    </p>
                    <h2 style={{ margin: "8px 0 10px", fontSize: 22 }}>{selectedMenu.title}</h2>
                    <p style={{ color: "#7b8780", lineHeight: 1.8, fontSize: 13 }}>
                      部活: {selectedClubName} / 公開範囲: {selectedMenu.visibility ?? "未設定"} / 価格: {selectedMenu.for_sale ? String(selectedMenu.price_coin ?? 0) + " coin" : "無料"}
                    </p>
	                    <div style={{ marginTop: 16 }}>
	                      <h3 style={{ margin: "0 0 10px", fontSize: 15 }}>練習内容</h3>
	                      {!canViewMenu(selectedMenu) ? (
	                        <div style={{ border: "1px solid #ead5a8", borderRadius: 18, background: "#fff8e8", padding: 14, color: "#8a5a10", fontWeight: 800, lineHeight: 1.7 }}>
	                          このメニューは有料です。購入すると内容を見られます。Pro加入中の人は購入せず閲覧できます。
	                        </div>
	                      ) : menuItems.length === 0 ? (
	                        <p style={{ color: "#7b8780" }}>練習内容はまだ登録されていません。</p>
	                      ) : (
                        <div style={{ display: "grid", gap: 10 }}>
                          {menuItems.map((item) => (
                            <div key={item.id} style={{ border: "1px solid #edf1ed", borderRadius: 18, padding: 14, background: "#fbfcf8" }}>
                              <strong>{item.name}</strong>
                              <p style={{ margin: "8px 0", color: "#69756f", lineHeight: 1.7 }}>{item.value ?? "説明なし"}</p>
                              <p style={{ margin: 0, color: "#0f6b55", fontWeight: 900 }}>目安時間: {item.duration ?? 0}{item.duration_unit ?? "分"}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
	                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
	                      <button type="button" onClick={() => printMenuPdf(selectedMenu)} style={{ border: "1px solid #dfe7e2", borderRadius: 15, background: "#fff", color: "#163b2f", padding: "13px 10px", fontWeight: 900, cursor: "pointer" }}>
	                        PDFで表示
	                      </button>
	                      <button type="button" onClick={() => shareMenuAsText(selectedMenu)} style={{ border: "none", borderRadius: 15, background: "#0f6b55", color: "#fff", padding: "13px 10px", fontWeight: 900, cursor: "pointer" }}>
		                        文字で共有
	                      </button>
	                    </div>
			                    {!selectedMenu.for_sale && (
		                      <div style={{ marginTop: 14, border: "1px solid #edf1ed", borderRadius: 18, background: "#fbfcf8", padding: 14 }}>
		                        <strong style={{ display: "block", color: "#17211e" }}>このメニューを有料公開に変更</strong>
			                        <p style={{ margin: "6px 0 10px", color: "#7b8780", fontSize: 12, lineHeight: 1.7 }}>
			                          無料で投稿したメニューも、販売者登録の承認後に価格を設定して販売できます。通常販売は売上の30%が運営手数料です。
			                        </p>
		                        {canSellPaidMenus ? (
		                          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
		                            <input value={paidPublishPrice} onChange={(e) => setPaidPublishPrice(e.target.value)} placeholder="価格 coin" style={{ ...inputStyle, background: "#fff" }} />
		                            <button type="button" onClick={() => publishMenuAsPaid(selectedMenu)} style={{ border: "none", borderRadius: 15, background: "#17211e", color: "#fff", padding: "0 14px", fontWeight: 900, cursor: "pointer" }}>
		                              有料化
		                            </button>
		                          </div>
		                        ) : (
		                          <button type="button" onClick={goToSellerVerification} style={{ width: "100%", border: "none", borderRadius: 15, background: "#17211e", color: "#fff", padding: "13px 16px", fontWeight: 900, cursor: "pointer" }}>
		                            販売者登録へ進む
		                          </button>
		                        )}
		                      </div>
			                    )}
		                    <button type="button" onClick={() => deleteMenu(selectedMenu)} style={{ width: "100%", marginTop: 10, border: "1px solid #f1d4d4", borderRadius: 15, background: "#fff", color: "#a33a3a", padding: "13px 16px", fontWeight: 900, cursor: "pointer" }}>
		                      メニューを削除する
		                    </button>
		                    <button type="button" onClick={() => setSelectedMenu(null)} style={{ width: "100%", marginTop: 10, border: "1px solid #dfe7e2", borderRadius: 15, background: "#fff", color: "#163b2f", padding: "13px 16px", fontWeight: 900, cursor: "pointer" }}>
		                      閉じる
		                    </button>
	                  </section>
                  </>
                )}
              </>
            )}

            {activeTab === "board" && (
              <section style={{ marginTop: 26 }}>
	                <h2 style={{ margin: "0 0 12px", color: "#65746e", fontSize: 13, letterSpacing: 1.2 }}>
	                  掲示板
	                </h2>
	                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
	                  {[
	                    { id: "menu", label: "メニュー" },
	                    { id: "recruit", label: "募集" },
	                  ].map((item) => (
	                    <button
	                      key={item.id}
	                      type="button"
	                      onClick={() => {
	                        const nextMode = item.id as "menu" | "recruit";
	                        setBoardMode(nextMode);
	                        if (nextMode === "menu" && boardMenus.length === 0) {
	                          loadBoardMenus();
	                        }
	                      }}
	                      style={{
	                        border: boardMode === item.id ? "2px solid #0f6b55" : "1px solid #dfe7e2",
	                        borderRadius: 18,
	                        background: boardMode === item.id ? "#0f6b55" : "#fff",
	                        color: boardMode === item.id ? "#fff" : "#163b2f",
	                        padding: "13px 14px",
	                        fontWeight: 900,
	                        boxShadow: boardMode === item.id ? "0 14px 30px rgba(15, 107, 85, 0.18)" : "none",
	                        cursor: "pointer",
	                      }}
	                    >
	                      {item.label}
	                    </button>
	                  ))}
	                </div>
	                {boardMode === "menu" && (
	                  <>
	                <div style={{ background: "#fff", border: "1px solid #edf1ed", borderRadius: 26, padding: 20, boxShadow: "0 18px 42px rgba(75, 94, 86, 0.1)" }}>
                  <p style={{ margin: 0, color: "#2c765f", fontSize: 11, fontWeight: 900, letterSpacing: 1.4 }}>
                    MENU MARKET
                  </p>
                  <h2 style={{ margin: "8px 0 0", fontSize: 24 }}>みんなの公開メニュー</h2>
	                  <p style={{ margin: "8px 0 0", color: "#7b8780", lineHeight: 1.7, fontSize: 13 }}>
	                    他の所属・チームの人が公開した練習メニューを見つけて、無料閲覧や購入ができます。
	                  </p>
	                  <div style={{ marginTop: 12, borderRadius: 16, background: "#fff8e8", border: "1px solid #ead5a8", padding: "10px 12px", color: "#8a5a10", fontSize: 13, fontWeight: 900 }}>
	                    保有コイン: {coinBalance.toLocaleString()} coin
	                  </div>
		                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
	                    {[
	                      { id: "club", label: selectedClubName },
	                      { id: "all", label: "全部活" },
	                    ].map((item) => (
	                      <button key={item.id} type="button" onClick={() => setBoardScope(item.id as "club" | "all")} style={{ border: boardScope === item.id ? "2px solid #0f6b55" : "1px solid #dfe7e2", borderRadius: 14, background: boardScope === item.id ? "#e7f3ee" : "#fff", color: "#0f6b55", padding: "10px 8px", fontWeight: 900 }}>
	                        {item.label}
	                      </button>
	                    ))}
	                  </div>
	                  <input
                    value={boardSearch}
                    onChange={(e) => setBoardSearch(e.target.value)}
                    placeholder="部活名・メニュー名で検索"
                    style={{ ...inputStyle, marginTop: 14, background: "#fbfcf8" }}
                  />
	                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 12 }}>
                    {[
                      { id: "new", label: "新着" },
                      { id: "paid", label: "有料" },
                      { id: "free", label: "無料" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setBoardFilter(item.id as "new" | "paid" | "free")}
                        style={{
                          border: boardFilter === item.id ? "2px solid #0f6b55" : "1px solid #e2ebe5",
                          borderRadius: 14,
                          background: boardFilter === item.id ? "#e7f3ee" : "#f7faf8",
                          padding: "10px 8px",
                          color: "#0f6b55",
                          fontWeight: 900,
                          cursor: "pointer",
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
	                  <button type="button" onClick={loadBoardMenus} style={{ width: "100%", marginTop: 14, border: "none", borderRadius: 16, background: "#0f6b55", color: "#fff", padding: "13px 16px", fontWeight: 900, boxShadow: "0 16px 30px rgba(15, 107, 85, 0.18)" }}>
	                    公開メニューを読み込む
	                  </button>
	                  {!isProActive && (
	                    <div style={{ marginTop: 14, border: "1px solid #dfe7e2", borderRadius: 18, background: "#fbfcf8", padding: 14 }}>
	                      <strong style={{ display: "block", color: "#17211e" }}>Proなら有料メニューも閲覧できます</strong>
	                      <p style={{ margin: "7px 0 10px", color: "#7b8780", fontSize: 12, lineHeight: 1.7, fontWeight: 800 }}>
	                        月額3,980円で、有料メニューの閲覧や検索・視聴数に応じた収益分配の対象になります。
	                      </p>
	                      <button type="button" onClick={() => { setActiveTab("revenue"); setRevenueView("pro"); setSelectedMenu(null); }} style={{ width: "100%", border: "none", borderRadius: 14, background: "#17211e", color: "#fff", padding: "12px 14px", fontWeight: 900, cursor: "pointer" }}>
	                        Pro加入案内を見る
	                      </button>
	                    </div>
	                  )}
	                </div>

                <section style={{ marginTop: 18 }}>
                  <h3 style={{ margin: "0 0 10px", color: "#65746e", fontSize: 13, letterSpacing: 1.2 }}>
                    今月のランキング
                  </h3>
                  <div style={{ display: "grid", gap: 10 }}>
		                    {rankedBoardMenus.slice(0, 3).map((menu, index) => (
		                      <div key={menu.id} style={{ display: "grid", gridTemplateColumns: "34px 1fr auto", gap: 10, alignItems: "center", border: "1px solid #edf1ed", borderRadius: 16, background: "#fff", padding: "20px 12px 12px", boxShadow: "0 10px 22px rgba(75, 94, 86, 0.07)", position: "relative" }}>
		                        <span style={{ position: "absolute", top: 8, right: 12, color: "#9aa59f", fontSize: 10, fontWeight: 900 }}>
		                          {formatMenuDate(menu.created_at)}
		                        </span>
	                        <span style={{ width: 36, height: 36, borderRadius: 13, background: index === 0 ? "#fff3d1" : "#edf3ef", color: index === 0 ? "#b48119" : "#65746e", display: "grid", placeItems: "center", fontWeight: 900 }}>
	                          {index + 1}
	                        </span>
	                        <span style={{ minWidth: 0 }}>
	                          <strong style={{ display: "block", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{menu.title}</strong>
		                          <small style={{ color: "#7b8780", fontWeight: 800 }}>{menu.for_sale ? `${menu.price_coin ?? 0} coin` : "無料"}</small>
		                          <small style={{ display: "block", color: "#9aa59f", fontWeight: 800, marginTop: 3 }}>
		                            視聴 {getMenuViews(menu)} / 購入 {getMenuPurchases(menu)}
		                          </small>
		                        </span>
	                        <div style={{ display: "grid", gap: 6 }}>
	                          <button type="button" onClick={() => openMenuDetail(menu)} style={{ border: "none", borderRadius: 12, background: "#0f6b55", color: "#fff", padding: "8px 9px", fontWeight: 900, fontSize: 12 }}>
	                            内容を見る
	                          </button>
		                          {menu.for_sale && (
		                            <button type="button" onClick={() => purchaseMenu(menu)} style={{ border: "1px solid #dfe7e2", borderRadius: 12, background: "#fff", color: "#163b2f", padding: "8px 9px", fontWeight: 900, fontSize: 12 }}>
		                              購入する
		                            </button>
		                          )}
	                        </div>
	                      </div>
	                    ))}
                    {boardMenus.length === 0 && menus.length === 0 && (
                      <div style={{ background: "#fff", border: "1px solid #edf1ed", borderRadius: 18, padding: 16, color: "#7b8780", fontWeight: 800 }}>
                        まだランキングに表示できるメニューがありません。
                      </div>
                    )}
	                  </div>
	                </section>

	                <section style={{ marginTop: 18 }}>
	                  <h3 style={{ margin: "0 0 10px", color: "#65746e", fontSize: 13, letterSpacing: 1.2 }}>
	                    所属ランキング
	                  </h3>
	                  <div style={{ display: "grid", gap: 10 }}>
	                    {organizationRankings.map((organization, index) => (
	                      <button
	                        key={organization.name}
	                        type="button"
	                        onClick={() => setSelectedOrganization(selectedOrganization === organization.name ? "" : organization.name)}
	                        style={{ display: "grid", gridTemplateColumns: "34px 1fr auto", gap: 10, alignItems: "center", textAlign: "left", border: selectedOrganization === organization.name ? "2px solid #0f6b55" : "1px solid #edf1ed", borderRadius: 16, background: selectedOrganization === organization.name ? "#e7f3ee" : "#fff", padding: 12, boxShadow: "0 10px 22px rgba(75, 94, 86, 0.07)", cursor: "pointer" }}
	                      >
	                        <span style={{ width: 34, height: 34, borderRadius: 13, background: index === 0 ? "#fff3d1" : "#edf3ef", color: index === 0 ? "#b48119" : "#65746e", display: "grid", placeItems: "center", fontWeight: 900 }}>
	                          {index + 1}
	                        </span>
	                        <span style={{ minWidth: 0 }}>
	                          <strong style={{ display: "block", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{organization.name}</strong>
	                          <small style={{ color: "#7b8780", fontWeight: 800 }}>{organization.count}件の公開メニュー</small>
	                        </span>
	                        <span style={{ color: "#0f6b55", fontSize: 12, fontWeight: 900 }}>表示</span>
	                      </button>
	                    ))}
	                  </div>
	                  {selectedOrganization && (
	                    <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
	                      <h4 style={{ margin: 0, color: "#17211e", fontSize: 14 }}>{selectedOrganization} の公開メニュー</h4>
	                      {selectedOrganizationMenus.map((menu) => (
	                        <article key={`${selectedOrganization}-${menu.id}`} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center", background: "#fff", border: "1px solid #edf1ed", borderRadius: 18, padding: 14, boxShadow: "0 12px 26px rgba(75, 94, 86, 0.08)" }}>
	                          <div style={{ minWidth: 0 }}>
	                            <strong style={{ display: "block", fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{menu.title}</strong>
	                            <p style={{ margin: "5px 0 0", color: "#69756f", fontSize: 12, fontWeight: 800 }}>
	                              {menu.for_sale ? `${menu.price_coin ?? 0} coin` : "無料"} / 視聴 {getMenuViews(menu)}
	                            </p>
	                          </div>
	                          <div style={{ display: "grid", gap: 7, minWidth: 88 }}>
	                            <button type="button" onClick={() => openMenuDetail(menu)} style={{ border: "none", borderRadius: 13, background: "#0f6b55", color: "#fff", padding: "9px 10px", fontWeight: 900, fontSize: 12 }}>
	                              内容を見る
	                            </button>
	                            {!isProActive && menu.for_sale && (
	                              <button type="button" onClick={() => purchaseMenu(menu)} style={{ border: "1px solid #dfe7e2", borderRadius: 13, background: "#fff", color: "#163b2f", padding: "9px 10px", fontWeight: 900, fontSize: 12 }}>
	                                購入
	                              </button>
	                            )}
	                          </div>
	                        </article>
	                      ))}
		                    </div>
		                  )}
	                </section>

		                <section style={{ marginTop: 20 }}>
	                  <h3 style={{ margin: "0 0 10px", color: "#65746e", fontSize: 13, letterSpacing: 1.2 }}>
	                    公開メニュー ピックアップ
	                  </h3>
		                  <div style={{ display: "grid", gap: 12 }}>
		                    {visibleBoardMenus.slice(0, 4).map((menu) => {
		                      const clubName = clubs.find((club) => club.id === menu.club_id)?.name ?? menu.club_id ?? "未設定";
		                      return (
					                        <article key={menu.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center", background: "#fff", border: "1px solid #edf1ed", borderRadius: 18, padding: 14, boxShadow: "0 12px 26px rgba(75, 94, 86, 0.08)" }}>
				                          <div style={{ minWidth: 0 }}>
				                            <strong style={{ display: "block", fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{menu.title}</strong>
				                            <p style={{ margin: "5px 0 0", color: "#69756f", fontSize: 12, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
				                              {clubName} / {menu.for_sale ? `${menu.price_coin ?? 0} coin` : "無料"}
				                            </p>
				                            <p style={{ margin: "4px 0 0", color: "#9aa59f", fontSize: 10, fontWeight: 900 }}>
				                              {formatMenuDate(menu.created_at)}
				                            </p>
				                          </div>
				                          <div style={{ display: "grid", gap: 7, minWidth: 88 }}>
			                            <button type="button" onClick={() => openMenuDetail(menu)} style={{ border: "none", borderRadius: 13, background: "#0f6b55", color: "#fff", padding: "9px 10px", fontWeight: 900, fontSize: 12 }}>
			                              内容を見る
			                            </button>
				                            {!isProActive && (
				                              <button type="button" onClick={() => purchaseMenu(menu)} style={{ border: "1px solid #dfe7e2", borderRadius: 13, background: "#fff", color: "#163b2f", padding: "9px 10px", fontWeight: 900, fontSize: 12 }}>
				                                {menu.for_sale ? "購入" : "保存"}
				                              </button>
				                            )}
				                          </div>
				                          {lastPurchasedMenuId === menu.id && (
				                            <div style={{ gridColumn: "1 / -1", borderRadius: 14, background: "#e7f3ee", color: "#0f6b55", padding: "10px 12px", fontSize: 13, fontWeight: 900 }}>
				                              購入しました / 残高 {coinBalance.toLocaleString()} coin
				                            </div>
				                          )}
			                        </article>
		                      );
			                    })}
                    {boardMenus.length === 0 && menus.length === 0 && (
                      <div style={{ background: "#fff", border: "1px solid #edf1ed", borderRadius: 22, padding: 18, color: "#7b8780", fontWeight: 800 }}>
                        「公開メニューを読み込む」を押すと、承認済みの公開メニューが表示されます。
                      </div>
                    )}
                  </div>
                </section>

	                  </>
	                )}
	                {boardMode === "recruit" && (
		                <section style={{ marginTop: 0 }}>
		                  <h3 style={{ margin: "0 0 10px", color: "#65746e", fontSize: 13, letterSpacing: 1.2 }}>
		                    練習試合・合宿
		                  </h3>
			                  <div style={{ background: "#fff", border: "1px solid #edf1ed", borderRadius: 24, padding: 18, boxShadow: "0 16px 36px rgba(75, 94, 86, 0.08)", marginBottom: 12 }}>
			                    <strong style={{ display: "block", fontSize: 18 }}>地域から募集を探す</strong>
			                    <p style={{ margin: "8px 0 0", color: "#7b8780", fontSize: 13, lineHeight: 1.7 }}>
			                      練習試合や合宿の募集をタイムラインで確認し、そのままチャットで連絡できます。
			                    </p>
			                    <button type="button" onClick={() => setShowRecruitPostForm(true)} style={{ width: "100%", marginTop: 14, border: "none", borderRadius: 16, background: "#0f6b55", color: "#fff", padding: "13px 16px", fontWeight: 900, cursor: "pointer" }}>
			                      募集を投稿する
			                    </button>
			                  </div>
			                  {showRecruitPostForm && (
			                    <>
			                      <button type="button" aria-label="募集投稿を閉じる" onClick={() => setShowRecruitPostForm(false)} style={{ position: "fixed", inset: 0, border: "none", background: "rgba(23, 33, 30, 0.42)", zIndex: 1000, cursor: "pointer" }} />
			                      <section style={{ position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", width: isPcPreview ? "min(760px, calc(100% - 80px))" : "min(390px, calc(100% - 28px))", maxHeight: "82vh", overflowY: "auto", zIndex: 1001, background: "#fff", border: "1px solid #edf1ed", borderRadius: 26, padding: 20, boxShadow: "0 24px 64px rgba(23, 33, 30, 0.24)" }}>
			                        <button type="button" onClick={() => setShowRecruitPostForm(false)} style={{ position: "absolute", top: 14, right: 14, width: 36, height: 36, borderRadius: 999, border: "1px solid #dfe7e2", background: "#fff", color: "#17211e", fontWeight: 900, cursor: "pointer" }}>×</button>
			                        <h3 style={{ margin: 0, fontSize: 20, letterSpacing: 0.3, color: "#17211e" }}>募集を投稿</h3>
			                        <p style={{ color: "#7b8780", lineHeight: 1.75, fontSize: 13, fontWeight: 700, margin: "12px 0 16px" }}>
			                          練習試合や合宿の募集を投稿できます。投稿後は募集タイムラインに表示されます。
			                        </p>
			                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
			                          <button type="button" onClick={() => setRecruitPostType("match")} style={{ border: recruitPostType === "match" ? "2px solid #0f6b55" : "1px solid #dfe7e2", borderRadius: 15, background: recruitPostType === "match" ? "#e7f3ee" : "#fff", color: "#163b2f", padding: "12px 10px", fontWeight: 900 }}>練習試合</button>
			                          <button type="button" onClick={() => setRecruitPostType("camp")} style={{ border: recruitPostType === "camp" ? "2px solid #0f6b55" : "1px solid #dfe7e2", borderRadius: 15, background: recruitPostType === "camp" ? "#e7f3ee" : "#fff", color: "#163b2f", padding: "12px 10px", fontWeight: 900 }}>合宿</button>
			                        </div>
			                        <select value={recruitPostRegion} onChange={(e) => setRecruitPostRegion(e.target.value)} style={{ ...inputStyle, marginTop: 12, background: "#fbfcf8" }}>
			                          {boardRegions.map((region) => <option key={region} value={region}>{region}</option>)}
			                        </select>
			                        <input value={recruitPostTitle} onChange={(e) => setRecruitPostTitle(e.target.value)} placeholder="募集タイトル" style={{ ...inputStyle, marginTop: 10, background: "#fbfcf8" }} />
			                        <textarea value={recruitPostDetail} onChange={(e) => setRecruitPostDetail(e.target.value)} placeholder="日程、場所、対象レベル、連絡したい内容" rows={5} style={{ ...inputStyle, marginTop: 10, resize: "vertical", background: "#fbfcf8" }} />
			                        <button type="button" onClick={createRecruitPost} style={{ width: "100%", marginTop: 12, border: "none", borderRadius: 16, background: "#0f6b55", color: "#fff", padding: "13px 16px", fontWeight: 900, cursor: "pointer" }}>
			                          投稿する
			                        </button>
			                      </section>
			                    </>
			                  )}
			                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
	                    {[
	                      { id: "match", title: "練習試合" },
	                      { id: "camp", title: "合宿" },
	                    ].map((item) => (
	                      <button key={item.title} type="button" onClick={() => setBoardApplication(boardApplication === item.id ? null : item.id as "match" | "camp")} style={{ textAlign: "center", border: boardApplication === item.id ? "2px solid #0f6b55" : "1px solid #edf1ed", borderRadius: 16, background: boardApplication === item.id ? "#e7f3ee" : "#fff", padding: 13, color: "#17211e", boxShadow: "0 10px 24px rgba(75, 94, 86, 0.06)", cursor: "pointer", fontWeight: 900 }}>
	                        {item.title}
	                      </button>
	                    ))}
	                  </div>
	                  <select value={boardRegion} onChange={(e) => setBoardRegion(e.target.value)} style={{ ...inputStyle, marginTop: 12, background: "#fff" }}>
	                    {boardRegions.map((region) => <option key={region} value={region}>{region}</option>)}
	                  </select>
	                  <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
	                    {visibleBoardOpportunities.map((item) => (
		                      <article key={item.id} style={{ background: "#fff", border: "1px solid #edf1ed", borderRadius: 22, padding: 16, boxShadow: "0 14px 32px rgba(75, 94, 86, 0.08)" }}>
		                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
		                          <span style={{ borderRadius: 999, background: item.type === "match" ? "#e4f3ed" : "#fff5dc", color: item.type === "match" ? "#2b765f" : "#9a6d16", padding: "5px 9px", fontSize: 11, fontWeight: 900 }}>
		                            {item.type === "match" ? "練習試合" : "合宿"}
		                          </span>
		                          <small style={{ color: "#7b8780", fontWeight: 900 }}>{item.region} ・ {formatMenuDate(item.created_at)}</small>
		                        </div>
	                        <h3 style={{ margin: "10px 0 0", fontSize: 17 }}>{item.title}</h3>
	                        <p style={{ margin: "7px 0 0", color: "#2c765f", fontSize: 12, fontWeight: 900 }}>{item.team}</p>
	                        <p style={{ margin: "8px 0 0", color: "#69756f", lineHeight: 1.7, fontSize: 13 }}>{item.detail}</p>
	                        <button type="button" onClick={() => { setBoardChatTarget(item.id); setBoardChatText(item.type === "match" ? "はじめまして。練習試合について詳しく相談したいです。" : "はじめまして。合宿について参加条件や日程を相談したいです。"); }} style={{ width: "100%", marginTop: 12, border: "none", borderRadius: 15, background: "#0f6b55", color: "#fff", padding: "12px 14px", fontWeight: 900 }}>
	                          チャットで連絡する
	                        </button>
		                        {boardChatTarget === item.id && (
		                          <div style={{ marginTop: 12, borderRadius: 18, background: "#f7faf8", padding: 12 }}>
		                            <p style={{ margin: "0 0 8px", color: "#7b8780", fontSize: 12, fontWeight: 800 }}>チャット</p>
		                            <div style={{ display: "grid", gap: 8, marginBottom: 10 }}>
		                              {(boardChatMessages[item.id] ?? []).map((message, index) => (
		                                <div key={`${item.id}-${index}`} style={{ justifySelf: "end", maxWidth: "86%", borderRadius: "16px 16px 4px 16px", background: "#0f6b55", color: "#fff", padding: "9px 11px", fontSize: 13, lineHeight: 1.6 }}>
		                                  {message}
		                                </div>
		                              ))}
		                              {(boardChatMessages[item.id] ?? []).length === 0 && (
		                                <div style={{ color: "#9aa59f", fontSize: 12, fontWeight: 800 }}>
		                                  ここから相手チームに連絡できます。
		                                </div>
		                              )}
		                            </div>
		                            <textarea value={boardChatText} onChange={(e) => setBoardChatText(e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical", background: "#fff" }} />
		                            <button type="button" onClick={() => sendBoardChat(item.id)} style={{ width: "100%", marginTop: 8, border: "none", borderRadius: 14, background: "#17211e", color: "#fff", padding: "12px 14px", fontWeight: 900 }}>
		                              送信する
		                            </button>
		                          </div>
	                        )}
	                      </article>
	                    ))}
	                    {visibleBoardOpportunities.length === 0 && (
	                      <div style={{ background: "#fff", border: "1px solid #edf1ed", borderRadius: 18, padding: 16, color: "#7b8780", fontWeight: 800 }}>
	                        この地域の募集はまだありません。
	                      </div>
		                    )}
		                  </div>
		                </section>
	                )}
		                {boardMode === "menu" && selectedMenu && (
		                  <>
		                    <button type="button" aria-label="メニュー詳細を閉じる" onClick={() => setSelectedMenu(null)} style={{ position: "fixed", inset: 0, border: "none", background: "rgba(23, 33, 30, 0.42)", zIndex: 1000, cursor: "pointer" }} />
		                    <section style={{ position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", width: isPcPreview ? "min(760px, calc(100% - 80px))" : "min(390px, calc(100% - 28px))", maxHeight: "82vh", overflowY: "auto", zIndex: 1001, background: "#fff", border: "1px solid #edf1ed", borderRadius: 26, padding: 20, boxShadow: "0 24px 64px rgba(23, 33, 30, 0.24)" }}>
		                    <button type="button" onClick={() => setSelectedMenu(null)} style={{ position: "absolute", top: 14, right: 14, width: 36, height: 36, borderRadius: 999, border: "1px solid #dfe7e2", background: "#fff", color: "#17211e", fontWeight: 900, cursor: "pointer" }}>×</button>
	                    <p style={{ margin: 0, color: "#2c765f", fontSize: 11, fontWeight: 900, letterSpacing: 1.4 }}>
                      MENU DETAIL
                    </p>
                    <h2 style={{ margin: "8px 0 10px", fontSize: 22 }}>{selectedMenu.title}</h2>
                    <p style={{ color: "#7b8780", lineHeight: 1.8, fontSize: 13 }}>
                      公開範囲: {selectedMenu.visibility ?? "未設定"} / 価格: {selectedMenu.for_sale ? String(selectedMenu.price_coin ?? 0) + " coin" : "無料"}
                    </p>
	                    <div style={{ marginTop: 16 }}>
	                      <h3 style={{ margin: "0 0 10px", fontSize: 15 }}>練習内容</h3>
	                      {!canViewMenu(selectedMenu) ? (
	                        <div style={{ border: "1px solid #ead5a8", borderRadius: 18, background: "#fff8e8", padding: 14, color: "#8a5a10", fontWeight: 800, lineHeight: 1.7 }}>
	                          このメニューは有料です。購入すると内容を見られます。Pro加入中の人は購入せず閲覧できます。
	                        </div>
	                      ) : menuItems.length === 0 ? (
	                        <p style={{ color: "#7b8780" }}>練習内容はまだ登録されていません。</p>
	                      ) : (
                        <div style={{ display: "grid", gap: 10 }}>
                          {menuItems.map((item) => (
                            <div key={item.id} style={{ border: "1px solid #edf1ed", borderRadius: 18, padding: 14, background: "#fbfcf8" }}>
                              <strong>{item.name}</strong>
                              <p style={{ margin: "8px 0", color: "#69756f", lineHeight: 1.7 }}>{item.value ?? "説明なし"}</p>
                              <p style={{ margin: 0, color: "#0f6b55", fontWeight: 900 }}>目安: {item.duration ?? 0}{item.duration_unit ?? "分"}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
	                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
	                      <button type="button" onClick={() => printMenuPdf(selectedMenu)} style={{ border: "1px solid #dfe7e2", borderRadius: 15, background: "#fff", color: "#163b2f", padding: "13px 10px", fontWeight: 900, cursor: "pointer" }}>
	                        PDFで表示
	                      </button>
	                      <button type="button" onClick={() => shareMenuAsText(selectedMenu)} style={{ border: "none", borderRadius: 15, background: "#0f6b55", color: "#fff", padding: "13px 10px", fontWeight: 900, cursor: "pointer" }}>
	                        文字で共有
	                      </button>
	                    </div>
		                    {!isProActive && !canViewMenu(selectedMenu) && (
		                      <button type="button" onClick={() => purchaseMenu(selectedMenu)} style={{ width: "100%", marginTop: 10, border: "none", borderRadius: 15, background: "#17211e", color: "#fff", padding: "13px 16px", fontWeight: 900, cursor: "pointer" }}>
		                        {selectedMenu.for_sale ? `${selectedMenu.price_coin ?? 0} coinで購入する` : "無料で保存する"}
		                      </button>
		                    )}
		                    {isProActive && (
		                      <div style={{ marginTop: 10, borderRadius: 14, background: "#e7f3ee", color: "#0f6b55", padding: "10px 12px", fontSize: 13, fontWeight: 900 }}>
		                        Pro加入中のため閲覧できます
		                      </div>
		                    )}
			                    {lastPurchasedMenuId === selectedMenu.id && (
		                      <div style={{ marginTop: 10, borderRadius: 14, background: "#e7f3ee", color: "#0f6b55", padding: "10px 12px", fontSize: 13, fontWeight: 900 }}>
		                        購入しました / 残高 {coinBalance.toLocaleString()} coin
		                      </div>
			                    )}
			                    <button type="button" onClick={() => deleteMenu(selectedMenu)} style={{ width: "100%", marginTop: 10, border: "1px solid #f1d4d4", borderRadius: 15, background: "#fff", color: "#a33a3a", padding: "13px 16px", fontWeight: 900, cursor: "pointer" }}>
			                      メニューを削除する
			                    </button>
			                    <button type="button" onClick={() => setSelectedMenu(null)} style={{ width: "100%", marginTop: 10, border: "1px solid #dfe7e2", borderRadius: 15, background: "#fff", color: "#163b2f", padding: "13px 16px", fontWeight: 900, cursor: "pointer" }}>
			                      閉じる
			                    </button>
			                  </section>
		                  </>
		                )}

	              </section>
	            )}

            {activeTab === "revenue" && (
              <section style={{ marginTop: 26 }}>
                <h2 style={{ margin: "0 0 12px", color: "#65746e", fontSize: 13, letterSpacing: 1.2 }}>
                  収益
                </h2>
                <div style={{ background: "#17211e", color: "#fff", borderRadius: 28, padding: 24, boxShadow: "0 24px 54px rgba(23, 33, 30, 0.18)" }}>
                  <p style={{ margin: 0, opacity: 0.72, fontWeight: 900, fontSize: 12, letterSpacing: 1.2 }}>REVENUE</p>
                  <h2 style={{ margin: "10px 0 0", fontSize: 34 }}>¥0</h2>
                  <p style={{ margin: "10px 0 0", opacity: 0.72, lineHeight: 1.7 }}>有料メニューの販売、購入、振込申請をここで確認します。</p>
		                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 18 }}>
		                    {[
		                      { label: "販売", value: `${sellingMenus.length}件`, view: "selling" },
		                      { label: "承認待ち", value: `${sellingMenus.filter((menu) => menu.review_status !== "approved").length}件`, view: "selling" },
		                      { label: "振込", value: isPayoutRegistered ? "✓ 登録済み" : "未申請", view: "payout" },
		                    ].map((item) => (
	                      <button key={item.label} type="button" onClick={() => setRevenueView(item.view as "selling" | "payout")} style={{ textAlign: "left", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.08)", color: "#fff", borderRadius: 16, padding: 12, cursor: "pointer" }}>
	                        <p style={{ margin: 0, opacity: 0.68, fontSize: 11, fontWeight: 900 }}>{item.label}</p>
	                        <strong style={{ display: "block", marginTop: 5 }}>{item.value}</strong>
	                      </button>
		                    ))}
		                  </div>
		                  <button
		                    type="button"
		                    onClick={() => setRevenueView("coins")}
		                    style={{ width: "100%", textAlign: "left", marginTop: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18, background: "rgba(255,255,255,0.08)", padding: 14, color: "#fff", cursor: "pointer" }}
		                  >
		                    <p style={{ margin: 0, opacity: 0.7, fontSize: 11, fontWeight: 900 }}>保有コイン</p>
		                    <strong style={{ display: "block", marginTop: 5, fontSize: 20 }}>{coinBalance.toLocaleString()} coin</strong>
		                    <span style={{ display: "block", marginTop: 7, opacity: 0.72, fontSize: 12, fontWeight: 800 }}>タップしてコイン購入画面へ</span>
		                  </button>
	                </div>

                <div style={{ background: "#fff", border: "1px solid #edf1ed", borderRadius: 22, padding: 18, marginTop: 14, boxShadow: "0 12px 28px rgba(75, 94, 86, 0.08)" }}>
                  <p style={{ margin: 0, color: "#2c765f", fontSize: 11, fontWeight: 900, letterSpacing: 1.2 }}>PRO SUBSCRIPTION</p>
                  <h3 style={{ margin: "8px 0 0", fontSize: 18 }}>{isProActive ? "Pro加入中" : "Pro販売設定"}</h3>
                  <p style={{ margin: "8px 0 0", color: "#7b8780", lineHeight: 1.7, fontSize: 13 }}>
	                    {isProActive ? "Pro特典が利用できます。購入画面は非表示になっています。" : "月額3,980円のPro、クーポン、クラファン特典の無料期間はここに引き継いで管理します。正式決済ではStripeなどのサブスクと連携します。"}
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
                    <button type="button" onClick={() => setRevenueView("pro")} style={{ border: "1px solid #dfe7e2", borderRadius: 15, background: revenueView === "pro" ? "#e7f3ee" : "#fbfcf8", padding: "12px 10px", fontWeight: 900, color: "#163b2f" }}>Pro特典</button>
                    <button type="button" onClick={() => setRevenueView("subscription")} style={{ border: "1px solid #dfe7e2", borderRadius: 15, background: revenueView === "subscription" ? "#e7f3ee" : "#fbfcf8", padding: "12px 10px", fontWeight: 900, color: "#163b2f" }}>サブスク設定</button>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
	                  {[
	                    { id: "selling", title: "販売中メニュー", body: "公開中・販売中のメニューと価格を確認します。" },
	                    { id: "purchases", title: "購入履歴", body: "誰がどのメニューを購入したか確認します。" },
	                    { id: "views", title: "視聴履歴", body: "最近見たメニューを確認し、内容をもう一度開けます。" },
	                    { id: "payout", title: isPayoutRegistered ? "振込申請 ✓ 口座登録済み" : "振込申請", body: "売上が発生したら、振込先情報を登録して申請します。" },
	                    { id: "verification", title: "販売者登録・本人確認", body: "有料販売前に、本人確認と権利確認を済ませます。" },
	                  ].map((item) => (
		                    <button key={item.title} type="button" onClick={() => setRevenueView(item.id as "selling" | "purchases" | "views" | "payout" | "verification")} style={{ textAlign: "left", border: "1px solid #edf1ed", borderRadius: 18, background: revenueView === item.id ? "#e7f3ee" : "#fff", padding: 16, color: "#17211e", boxShadow: "0 10px 24px rgba(75, 94, 86, 0.06)", cursor: "pointer" }}>
                      <strong style={{ display: "block", fontSize: 15 }}>{item.title}</strong>
                      <span style={{ display: "block", marginTop: 5, color: "#7b8780", fontSize: 12, fontWeight: 700, lineHeight: 1.6 }}>{item.body}</span>
                    </button>
                  ))}
                </div>
	                {revenueView !== "top" && (
	                  <>
	                    <button
	                      type="button"
	                      aria-label="閉じる"
	                      onClick={() => setRevenueView("top")}
	                      style={{ position: "fixed", inset: 0, border: "none", background: "rgba(23, 33, 30, 0.42)", zIndex: 55, cursor: "pointer" }}
	                    />
	                    <section style={{ position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", width: isPcPreview ? "min(760px, calc(100% - 80px))" : "min(390px, calc(100% - 28px))", maxHeight: "82vh", overflowY: "auto", zIndex: 60, background: "#fff", border: "1px solid #edf1ed", borderRadius: 26, padding: 20, boxShadow: "0 24px 64px rgba(23, 33, 30, 0.24)" }}>
	                    <button type="button" onClick={() => setRevenueView("top")} style={{ position: "absolute", top: 14, right: 14, width: 36, height: 36, borderRadius: 999, border: "1px solid #dfe7e2", background: "#fff", color: "#17211e", fontWeight: 900, cursor: "pointer" }}>×</button>
		                    <h3 style={{ margin: 0 }}>{revenueView === "selling" ? "販売中メニュー" : revenueView === "purchases" ? "購入履歴" : revenueView === "views" ? "視聴履歴" : revenueView === "payout" ? "振込申請" : revenueView === "verification" ? "販売者登録・本人確認" : revenueView === "pro" ? "Pro特典" : revenueView === "coins" ? "コイン購入" : "サブスク設定"}</h3>
	                    <p style={{ color: "#7b8780", lineHeight: 1.7, fontSize: 13 }}>
		                      {revenueView === "selling" && "販売中メニューの価格変更、公開停止、販売状況をここで管理します。通常販売は売上の30%が運営手数料になります。"}
	                      {revenueView === "purchases" && "購入されたメニュー、購入日時、金額をここで確認します。"}
	                      {revenueView === "views" && "最近見たメニューをここで確認します。メニューを押すと内容を表示できます。"}
	                      {revenueView === "payout" && "振込先情報を登録し、売上の振込申請を行います。"}
	                      {revenueView === "verification" && "有料メニュー販売に必要な販売者登録、本人確認、権利確認の申請状況を確認します。"}
		                      {revenueView === "pro" && "月額3,980円のPro特典、クラファン特典、無料期間の付与状態を管理します。Pro収益は検索流入やメニュー視聴数に応じて分配予定です。"}
		                      {revenueView === "subscription" && "月額3,980円のProプラン、更新日、支払い方法の設定を管理します。"}
		                      {revenueView === "coins" && "メニュー購入に使うコインを購入します。本番ではStripeなどの決済と連携します。"}
		                    </p>
		                    {revenueView === "coins" && (
		                      <div style={{ display: "grid", gap: 12 }}>
		                        <div style={{ border: "1px solid #edf1ed", borderRadius: 18, background: "#fbfcf8", padding: 16 }}>
		                          <p style={{ margin: 0, color: "#7b8780", fontSize: 12, fontWeight: 900 }}>現在の保有コイン</p>
		                          <strong style={{ display: "block", marginTop: 6, fontSize: 24 }}>{coinBalance.toLocaleString()} coin</strong>
		                        </div>
		                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
		                          {[100, 300, 500, 1000, 1500, 3000, 5000, 10000].map((amount) => (
		                            <button
		                              key={amount}
		                              type="button"
		                              onClick={() => buyCoins(amount)}
		                              style={{ border: amount >= 3000 ? "none" : "1px solid #dfe7e2", borderRadius: 16, background: amount >= 3000 ? "#17211e" : "#fff", color: amount >= 3000 ? "#fff" : "#163b2f", padding: "14px 10px", fontWeight: 900, cursor: "pointer" }}
		                            >
		                              {amount.toLocaleString()} coin
		                            </button>
		                          ))}
		                        </div>
		                        <p style={{ margin: 0, color: "#8b968f", fontSize: 12, lineHeight: 1.7, fontWeight: 700 }}>
		                          購入後すぐに残高へ反映されます。正式リリース時は決済完了後に反映される仕組みに接続します。
		                        </p>
		                      </div>
		                    )}
		                    {revenueView === "selling" && (
		                      <div style={{ display: "grid", gap: 10 }}>
	                        {draftRevenueRows.length === 0 ? (
	                          <div style={{ border: "1px solid #edf1ed", borderRadius: 16, padding: 14, background: "#fbfcf8", color: "#7b8780", fontWeight: 800 }}>
	                            まだ有料公開したメニューはありません。練習メニュー詳細から有料化できます。
	                          </div>
	                        ) : draftRevenueRows.map((menu) => (
	                          <div key={menu.id} style={{ border: "1px solid #edf1ed", borderRadius: 16, padding: 14, background: "#fbfcf8" }}>
	                            <strong style={{ display: "block" }}>{menu.title}</strong>
		                            <p style={{ margin: "7px 0 0", color: "#7b8780", fontSize: 12, fontWeight: 800, lineHeight: 1.7 }}>
		                              {menu.price_coin ?? 0} coin / {menu.review_status === "approved" ? "公開中" : "承認待ち"} / 運営手数料30%
		                            </p>
	                          </div>
	                        ))}
	                      </div>
	                    )}
		                    {revenueView === "purchases" && (
		                      <div style={{ display: "grid", gap: 10 }}>
		                          {purchaseHistory.length === 0 ? (
		                            <div style={{ border: "1px solid #edf1ed", borderRadius: 16, padding: 14, background: "#fbfcf8" }}>
		                              <strong>購入履歴はまだありません</strong>
		                              <p style={{ margin: "8px 0 0", color: "#7b8780", fontSize: 13, lineHeight: 1.7 }}>
		                                購入ボタンを押したメニューがここに表示されます。
		                              </p>
		                            </div>
		                          ) : purchaseHistory.map((purchase) => (
		                            <button key={purchase.id} type="button" onClick={() => openMenuDetail(purchase.menu)} style={{ textAlign: "left", border: "1px solid #edf1ed", borderRadius: 16, padding: 14, background: "#fbfcf8", cursor: "pointer" }}>
		                              <strong style={{ display: "block" }}>{purchase.title}</strong>
		                              <p style={{ margin: "7px 0 0", color: "#7b8780", fontSize: 12, fontWeight: 800 }}>
		                                {purchase.purchasedAt} / {purchase.amount > 0 ? `${purchase.amount} coin` : "無料"}
		                              </p>
		                              <span style={{ display: "block", marginTop: 8, color: "#0f6b55", fontSize: 12, fontWeight: 900 }}>内容を見返す</span>
		                            </button>
		                          ))}
		                      </div>
		                    )}
		                    {revenueView === "views" && (
		                      <div style={{ display: "grid", gap: 10 }}>
		                        {viewHistory.length === 0 ? (
		                          <div style={{ border: "1px solid #edf1ed", borderRadius: 16, padding: 14, background: "#fbfcf8", color: "#7b8780", fontWeight: 800 }}>
		                            まだ見たメニューはありません。
		                          </div>
		                        ) : viewHistory.slice(0, 12).map((view) => (
		                          <button key={view.id} type="button" onClick={() => openMenuDetail(view.menu)} style={{ textAlign: "left", border: "1px solid #edf1ed", borderRadius: 16, padding: 14, background: "#fff", cursor: "pointer" }}>
		                            <strong style={{ display: "block" }}>{view.title}</strong>
		                            <p style={{ margin: "7px 0 0", color: "#7b8780", fontSize: 12, fontWeight: 800 }}>
		                              {view.viewedAt}
		                            </p>
		                            <span style={{ display: "block", marginTop: 8, color: "#0f6b55", fontSize: 12, fontWeight: 900 }}>内容を表示する</span>
		                          </button>
		                        ))}
		                      </div>
		                    )}
			                    {revenueView === "payout" && (
			                      <div style={{ display: "grid", gap: 10 }}>
			                        {isPayoutRegistered && (
			                          <div style={{ border: "1px solid #dfe7e2", borderRadius: 16, background: "#e7f3ee", color: "#0f6b55", padding: 14 }}>
			                            <strong style={{ display: "block", marginBottom: 8, fontSize: 14 }}>✓ 登録済みの振込口座</strong>
			                            <p style={{ margin: 0, color: "#285d4d", fontSize: 13, fontWeight: 800, lineHeight: 1.8 }}>
			                              {payoutBankName || "銀行名未入力"} / {payoutBranchName || "支店名未入力"}<br />
			                              {payoutAccountType} {payoutAccountNumber || "口座番号未入力"}<br />
			                              名義: {payoutAccountName || "口座名義未入力"}
			                            </p>
			                          </div>
			                        )}
		                        <input value={payoutBankName} onChange={(e) => setPayoutBankName(e.target.value)} placeholder="銀行名 例: みずほ銀行" style={inputStyle} />
		                        <input value={payoutBranchName} onChange={(e) => setPayoutBranchName(e.target.value)} placeholder="支店名 例: 渋谷支店" style={inputStyle} />
		                        <select value={payoutAccountType} onChange={(e) => setPayoutAccountType(e.target.value)} style={inputStyle}>
		                          <option value="普通">普通</option>
		                          <option value="当座">当座</option>
		                          <option value="貯蓄">貯蓄</option>
		                        </select>
		                        <input value={payoutAccountNumber} onChange={(e) => setPayoutAccountNumber(e.target.value)} placeholder="口座番号 例: 1234567" inputMode="numeric" style={inputStyle} />
		                        <input value={payoutAccountName} onChange={(e) => setPayoutAccountName(e.target.value)} placeholder="口座名義 例: クラブ ハブ" style={inputStyle} />
		                        <div style={{ borderRadius: 16, background: "#fbfcf8", border: "1px solid #edf1ed", padding: 12, color: "#7b8780", fontSize: 12, lineHeight: 1.7 }}>
		                          振込申請前に、口座名義と本人確認情報が一致しているか確認してください。
		                        </div>
			                        <button type="button" onClick={() => { setIsPayoutRegistered(true); setStatus("振込先情報を保存しました"); }} style={{ width: "100%", border: "none", borderRadius: 15, background: "#0f6b55", color: "#fff", padding: "13px 16px", fontWeight: 900 }}>{isPayoutRegistered ? "口座内容を変更する" : "振込先を保存する"}</button>
			                      </div>
			                    )}
	                    {revenueView === "verification" && (
	                      <div style={{ border: "1px solid #edf1ed", borderRadius: 16, padding: 14, background: "#fbfcf8" }}>
	                        <strong>販売者登録: {sellerStatusLabel}</strong>
	                        <p style={{ margin: "8px 0 12px", color: "#7b8780", fontSize: 13, lineHeight: 1.7 }}>
	                          無料メニューは本人確認なしで投稿できます。有料メニューの公開と売上受け取りには、販売者登録の承認が必要です。
	                        </p>
	                        {currentSellerStatus !== "approved" && (
	                          <button type="button" onClick={() => { setActiveTab("mypage"); setMypageView("verification"); }} style={{ width: "100%", border: "none", borderRadius: 15, background: "#0f6b55", color: "#fff", padding: "13px 16px", fontWeight: 900 }}>
	                            マイページで申請する
	                          </button>
	                        )}
	                      </div>
	                    )}
		                    {(revenueView === "pro" || revenueView === "subscription") && (
		                      <div style={{ display: "grid", gap: 10 }}>
		                        {isProActive ? (
		                          <div style={{ border: "1px solid #dfe7e2", borderRadius: 18, background: "#e7f3ee", padding: 16 }}>
		                            <strong style={{ display: "block", color: "#0f6b55" }}>Pro加入中</strong>
		                            <p style={{ margin: "8px 0 0", color: "#5e6d68", fontSize: 13, lineHeight: 1.7 }}>
		                              Pro特典を利用できます。購入画面は表示されません。解約はマイページから行えます。
		                            </p>
		                          </div>
		                        ) : (
		                          <>
			                            <div style={{ border: "1px solid #edf1ed", borderRadius: 18, background: "#fbfcf8", padding: 16 }}>
			                              <strong style={{ display: "block" }}>Pro特典</strong>
			                              <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: "#5e6d68", fontSize: 13, lineHeight: 1.8 }}>
			                                <li>有料メニュー公開の優先審査</li>
			                                <li>PDF・LINE共有の強化機能</li>
			                                <li>販売メニューと収益管理の拡張</li>
			                                <li>チーム募集・チャット機能の優先利用</li>
			                                <li>検索流入やメニュー視聴数に応じたPro収益分配</li>
			                              </ul>
			                              <div style={{ marginTop: 12, borderRadius: 14, background: "#fff", border: "1px solid #edf1ed", padding: 12 }}>
			                                <strong style={{ display: "block", color: "#17211e" }}>月額3,980円</strong>
			                                <p style={{ margin: "6px 0 0", color: "#7b8780", fontSize: 12, lineHeight: 1.7 }}>
			                                  Pro収益は、検索で見つけられた回数やメニューの視聴数をもとに、投稿者へ分配する予定です。
			                                </p>
			                              </div>
			                            </div>
			                            <button type="button" onClick={subscribePro} style={{ width: "100%", border: "none", borderRadius: 15, background: "#0f6b55", color: "#fff", padding: "13px 16px", fontWeight: 900 }}>
			                              月額3,980円でProに加入する
			                            </button>
		                          </>
		                        )}
		                      </div>
			                    )}
			                  </section>
		                  </>
			                )}
		                {activeTab === "revenue" && selectedMenu && (
		                  <>
		                    <button type="button" aria-label="メニュー詳細を閉じる" onClick={() => setSelectedMenu(null)} style={{ position: "fixed", inset: 0, border: "none", background: "rgba(23, 33, 30, 0.42)", zIndex: 1000, cursor: "pointer" }} />
		                    <section style={{ position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", width: isPcPreview ? "min(760px, calc(100% - 80px))" : "min(390px, calc(100% - 28px))", maxHeight: "82vh", overflowY: "auto", zIndex: 1001, background: "#fff", border: "1px solid #edf1ed", borderRadius: 26, padding: 20, boxShadow: "0 24px 64px rgba(23, 33, 30, 0.24)" }}>
		                      <button type="button" onClick={() => setSelectedMenu(null)} style={{ position: "absolute", top: 14, right: 14, width: 36, height: 36, borderRadius: 999, border: "1px solid #dfe7e2", background: "#fff", color: "#17211e", fontWeight: 900, cursor: "pointer" }}>×</button>
		                      <p style={{ margin: 0, color: "#2c765f", fontSize: 11, fontWeight: 900, letterSpacing: 1.4 }}>MENU DETAIL</p>
		                      <h2 style={{ margin: "8px 0 10px", fontSize: 22 }}>{selectedMenu.title}</h2>
		                      <p style={{ color: "#7b8780", lineHeight: 1.8, fontSize: 13 }}>
		                        価格: {selectedMenu.for_sale ? String(selectedMenu.price_coin ?? 0) + " coin" : "無料"}
		                      </p>
		                      <div style={{ marginTop: 16 }}>
		                        <h3 style={{ margin: "0 0 10px", fontSize: 15 }}>練習内容</h3>
		                        {!canViewMenu(selectedMenu) ? (
		                          <div style={{ border: "1px solid #ead5a8", borderRadius: 18, background: "#fff8e8", padding: 14, color: "#8a5a10", fontWeight: 800, lineHeight: 1.7 }}>
		                            このメニューは有料です。購入すると内容を見られます。Pro加入中の人は購入せず閲覧できます。
		                          </div>
		                        ) : menuItems.length === 0 ? (
		                          <p style={{ color: "#7b8780" }}>練習内容はまだ登録されていません。</p>
		                        ) : (
		                          <div style={{ display: "grid", gap: 10 }}>
		                            {menuItems.map((item) => (
		                              <div key={item.id} style={{ border: "1px solid #edf1ed", borderRadius: 18, padding: 14, background: "#fbfcf8" }}>
		                                <strong>{item.name}</strong>
		                                <p style={{ margin: "8px 0", color: "#69756f", lineHeight: 1.7 }}>{item.value ?? "説明なし"}</p>
		                                <p style={{ margin: 0, color: "#0f6b55", fontWeight: 900 }}>目安: {item.duration ?? 0}{item.duration_unit ?? "分"}</p>
		                              </div>
		                            ))}
		                          </div>
		                        )}
		                      </div>
		                      {!isProActive && !canViewMenu(selectedMenu) && (
		                        <button type="button" onClick={() => purchaseMenu(selectedMenu)} style={{ width: "100%", marginTop: 10, border: "none", borderRadius: 15, background: "#17211e", color: "#fff", padding: "13px 16px", fontWeight: 900, cursor: "pointer" }}>
		                          {selectedMenu.for_sale ? `${selectedMenu.price_coin ?? 0} coinで購入する` : "無料で保存する"}
		                        </button>
		                      )}
		                      <button type="button" onClick={() => setSelectedMenu(null)} style={{ width: "100%", marginTop: 10, border: "1px solid #dfe7e2", borderRadius: 15, background: "#fff", color: "#163b2f", padding: "13px 16px", fontWeight: 900, cursor: "pointer" }}>
		                        閉じる
		                      </button>
		                    </section>
		                  </>
		                )}
	              </section>
	            )}

            {activeTab === "mypage" && (
              <section style={{ marginTop: 26 }}>
                <h2 style={{ margin: "0 0 12px", color: "#65746e", fontSize: 13, letterSpacing: 1.2 }}>
                  マイページ
                </h2>
                <div style={{ background: "#0f6b55", color: "#fff", borderRadius: 28, padding: 22, boxShadow: "0 22px 48px rgba(15, 107, 85, 0.18)" }}>
                  <p style={{ margin: 0, opacity: 0.72, fontWeight: 900, fontSize: 12 }}>MY ACCOUNT</p>
	                  <h2 style={{ margin: "10px 0 0", fontSize: 24, lineHeight: 1.25 }}>{profile.display_name}さん</h2>
	                  <p style={{ margin: "8px 0 0", opacity: 0.78, fontWeight: 800, fontSize: 13, lineHeight: 1.6 }}>{teamLine}</p>
                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    <span style={{ borderRadius: 999, background: "rgba(255,255,255,0.16)", padding: "7px 10px", fontSize: 12, fontWeight: 900 }}>{selectedClubName}</span>
                    <span style={{ borderRadius: 999, background: "rgba(255,255,255,0.16)", padding: "7px 10px", fontSize: 12, fontWeight: 900 }}>{isProActive ? "PRO加入中" : "Pro未加入"}</span>
                  </div>
                </div>

                <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
	                  <details style={{ background: "#fff", border: "1px solid #edf1ed", borderRadius: 18, padding: 16 }}>
			                    <summary style={{ fontFamily: "inherit", fontWeight: 900, cursor: "pointer", fontSize: 15, lineHeight: 1.45, color: "#17211e" }}>所属情報を編集</summary>
	                    <p style={{ margin: "12px 0 0", color: "#7b8780", lineHeight: 1.7, fontSize: 13 }}>
	                      部活、学校名・チーム名、チーム区分、学年を変更できます。ここで登録した内容はホームや掲示板の表示に使われます。
	                    </p>
	                    <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                      <select value={selectedClub} onChange={(e) => setSelectedClub(e.target.value)} style={inputStyle}>
                        <option value="">部活を選択</option>
                        {clubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}
                      </select>
                      <input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="学校名・チーム名" style={inputStyle} />
                      <select value={teamCategory} onChange={(e) => setTeamCategory(e.target.value)} style={inputStyle}>
                        <option value="">チーム区分を選択</option>
                        {teamCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                      </select>
                      {teamCategory === "その他" && <input value={customTeamCategory} onChange={(e) => setCustomTeamCategory(e.target.value)} placeholder="チーム区分を入力" style={inputStyle} />}
                      <select value={grade} onChange={(e) => setGrade(e.target.value)} style={inputStyle}>
                        <option value="">学年を選択</option>
                        {grades.map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                      {grade === "その他" && <input value={customGrade} onChange={(e) => setCustomGrade(e.target.value)} placeholder="学年・立場を入力" style={inputStyle} />}
                      <button type="button" onClick={saveProfileSettings} disabled={!selectedClub} style={{ border: "none", borderRadius: 15, background: !selectedClub ? "#cad6d1" : "#0f6b55", color: "#fff", padding: "13px 16px", fontWeight: 900, cursor: !selectedClub ? "not-allowed" : "pointer" }}>
                        保存する
                      </button>
                    </div>
                  </details>

	                  <details style={{ background: "#fff", border: "1px solid #edf1ed", borderRadius: 18, padding: 16 }}>
			                    <summary style={{ fontFamily: "inherit", fontWeight: 900, cursor: "pointer", fontSize: 15, lineHeight: 1.45, color: "#17211e" }}>クーポン利用</summary>
	                    <p style={{ margin: "12px 0", color: "#7b8780", lineHeight: 1.7, fontSize: 13 }}>
	                      クラファン特典、キャンペーン、Pro無料期間などのクーポンを利用できます。コードを入力すると、対象の特典がアカウントに反映されます。
	                    </p>
                    <input placeholder="クーポンコード" style={inputStyle} />
                    <button type="button" style={{ width: "100%", marginTop: 10, border: "none", borderRadius: 15, background: "#0f6b55", color: "#fff", padding: "13px 16px", fontWeight: 900 }}>
                      クーポンを利用する
                    </button>
                  </details>

	                  <details style={{ background: "#fff", border: "1px solid #edf1ed", borderRadius: 18, padding: 16 }}>
			                    <summary style={{ fontFamily: "inherit", fontWeight: 900, cursor: "pointer", fontSize: 15, lineHeight: 1.45, color: "#17211e" }}>利用規約</summary>
	                    <p style={{ margin: "12px 0 0", color: "#7b8780", lineHeight: 1.7, fontSize: 13 }}>
	                      メニューの公開、販売、購入、画像・動画利用に関するルールです。有料公開や本人確認の前に内容を確認してください。
	                    </p>
	                    <div style={{ marginTop: 12, background: "#fbfcf8", borderRadius: 14, padding: 14, color: "#5e6d68", fontSize: 12, lineHeight: 1.8 }}>
                      <strong style={{ color: "#17211e" }}>CLUB HUB 利用規約 v1.0</strong>
                      <p>有料販売するメニューは、自身または自チームで作成した内容であること、第三者の権利を侵害しないこと、学校名や画像・動画の利用許可を確認していることが必要です。</p>
                    </div>
                  </details>

		                  {[
		                    { id: "profile", title: "登録情報", body: "メールアドレス、表示名、プロフィール情報を確認します。" },
		                    { id: "publish", title: "公開・価格管理", body: "自分の投稿メニューの公開範囲と価格を管理します。" },
		                    { id: "verification", title: "販売者登録・本人確認", body: "有料販売に必要な確認状況を管理します。" },
		                  ].map((item) => (
				                    <button key={item.title} type="button" onClick={() => setMypageView(item.id as "profile" | "publish" | "verification")} style={{ textAlign: "left", border: "1px solid #edf1ed", borderRadius: 18, background: mypageView === item.id ? "#e7f3ee" : "#fff", padding: "16px 17px", color: "#17211e", cursor: "pointer", fontFamily: "inherit", fontSize: 15, fontWeight: 900, lineHeight: 1.45 }}>
			                      <strong style={{ display: "block", fontSize: 15, lineHeight: 1.45 }}>▶︎ {item.title}</strong>
			                    </button>
		                  ))}
					                  <button type="button" onClick={() => setMypageView("proCancel")} style={{ textAlign: "left", border: "1px solid #edf1ed", borderRadius: 18, background: mypageView === "proCancel" ? "#e7f3ee" : "#fff", padding: "16px 17px", color: "#17211e", cursor: "pointer", fontFamily: "inherit", fontSize: 15, fontWeight: 900, lineHeight: 1.45 }}>
				                    <strong style={{ display: "block", fontSize: 15, lineHeight: 1.45 }}>▶︎ {isProActive ? "Pro解約" : "Pro加入"}</strong>
				                  </button>
		                  {mypageView !== "top" && (
		                    <>
		                      <button
		                        type="button"
		                        aria-label="閉じる"
		                        onClick={() => setMypageView("top")}
		                        style={{ position: "fixed", inset: 0, border: "none", background: "rgba(23, 33, 30, 0.42)", zIndex: 55, cursor: "pointer" }}
		                      />
		                      <section style={{ position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", width: isPcPreview ? "min(760px, calc(100% - 80px))" : "min(390px, calc(100% - 28px))", maxHeight: "82vh", overflowY: "auto", zIndex: 60, background: "#fff", border: "1px solid #edf1ed", borderRadius: 26, padding: 20, boxShadow: "0 24px 64px rgba(23, 33, 30, 0.24)" }}>
		                      <button type="button" onClick={() => setMypageView("top")} style={{ position: "absolute", top: 14, right: 14, width: 36, height: 36, borderRadius: 999, border: "1px solid #dfe7e2", background: "#fff", color: "#17211e", fontWeight: 900, cursor: "pointer" }}>×</button>
					                      <h3 style={{ margin: 0, fontSize: 18, letterSpacing: 0.3, color: "#17211e" }}>{mypageView === "profile" ? "登録情報" : mypageView === "publish" ? "公開・価格管理" : mypageView === "verification" ? "販売者登録・本人確認" : isProActive ? "Pro解約" : "Pro加入"}</h3>
		                      <p style={{ color: "#7b8780", lineHeight: 1.75, fontSize: 13, fontWeight: 700, margin: "12px 0 16px" }}>
		                        {mypageView === "profile" && "表示名、所属、メールアドレスなどの登録情報を確認します。"}
		                        {mypageView === "publish" && "自分が投稿したメニューの公開範囲、価格、販売状態を管理します。"}
		                        {mypageView === "verification" && "有料販売に必要な販売者登録、本人確認、学校名、画像・動画の権利確認を申請します。"}
			                        {mypageView === "proCancel" && (isProActive ? "Pro特典の利用を停止します。解約後は必要な時に再加入できます。" : "月額3,980円でProに加入できます。有料メニュー閲覧や収益分配の対象になります。")}
		                      </p>
	                      {mypageView === "profile" && (
	                        <div style={{ display: "grid", gap: 10 }}>
	                          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="メールアドレス" style={inputStyle} />
	                          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="表示名" style={inputStyle} />
	                          <select value={selectedClub} onChange={(e) => setSelectedClub(e.target.value)} style={inputStyle}>
	                            <option value="">部活を選択</option>
	                            {clubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}
	                          </select>
	                          <input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="学校名・チーム名" style={inputStyle} />
	                          <button type="button" onClick={saveProfileSettings} style={{ width: "100%", border: "none", borderRadius: 15, background: "#0f6b55", color: "#fff", padding: "13px 16px", fontWeight: 900 }}>登録情報を保存する</button>
	                        </div>
	                      )}
	                      {mypageView === "publish" && (
	                        <div style={{ display: "grid", gap: 10 }}>
	                          {menus.length === 0 ? (
	                            <div style={{ border: "1px solid #edf1ed", borderRadius: 16, padding: 14, background: "#fbfcf8", color: "#7b8780", fontWeight: 800 }}>
	                              まだ投稿したメニューはありません。
	                            </div>
	                          ) : menus.map((menu) => (
	                            <div key={menu.id} style={{ border: "1px solid #edf1ed", borderRadius: 16, padding: 14, background: "#fbfcf8" }}>
	                              <strong style={{ display: "block" }}>{menu.title}</strong>
	                              <p style={{ margin: "7px 0 10px", color: "#7b8780", fontSize: 12, fontWeight: 800 }}>
	                                {menu.for_sale ? `${menu.price_coin ?? 0} coin` : "無料"} / {menu.visibility ?? "public"} / {menu.review_status === "approved" ? "公開中" : "承認待ち"}
	                              </p>
	                              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
	                                <input defaultValue={String(menu.price_coin ?? paidPublishPrice)} onChange={(e) => setPaidPublishPrice(e.target.value)} placeholder="価格 coin" style={{ ...inputStyle, background: "#fff" }} />
	                                <button type="button" onClick={() => publishMenuAsPaid(menu)} style={{ border: "none", borderRadius: 14, background: "#17211e", color: "#fff", padding: "0 12px", fontWeight: 900 }}>
	                                  保存
	                                </button>
	                              </div>
	                            </div>
	                          ))}
	                        </div>
	                      )}
		                      {mypageView === "verification" && (
		                        <div style={{ display: "grid", gap: 10 }}>
	                          <div style={{ border: "1px solid #edf1ed", borderRadius: 16, padding: 14, background: "#fbfcf8" }}>
	                            <strong>販売者登録: {sellerStatusLabel}</strong>
	                            <p style={{ margin: "8px 0 0", color: "#7b8780", fontSize: 13, lineHeight: 1.7 }}>
	                              無料メニュー投稿はこの申請なしで使えます。有料メニューを販売したい場合だけ、本人確認と権利確認を管理者へ送信してください。
	                            </p>
	                            <div style={{ marginTop: 10, borderRadius: 14, background: currentSellerStatus === "approved" ? "#e7f3ee" : currentSellerStatus === "pending" ? "#fff8e8" : "#fff", border: "1px solid #dfe7e2", padding: 12, color: currentSellerStatus === "approved" ? "#0f6b55" : "#5e6d68", fontSize: 12, fontWeight: 900, lineHeight: 1.7 }}>
	                              {currentSellerStatus === "approved" && "承認済みです。有料メニューを公開できます。"}
	                              {currentSellerStatus === "pending" && "申請中です。管理者が承認すると有料販売が使えるようになります。"}
	                              {currentSellerStatus === "rejected" && "申請が差し戻されています。内容を修正して再申請してください。"}
	                              {currentSellerStatus === "none" && "まだ販売者登録は申請されていません。"}
	                            </div>
	                          </div>
	                          <input type="file" accept="image/*" onChange={(e) => setVerificationFileName(e.target.files?.[0]?.name ?? "")} style={inputStyle} />
	                          {verificationFileName && <p style={{ margin: 0, color: "#2c765f", fontSize: 12, fontWeight: 900 }}>選択中: {verificationFileName}</p>}
	                          <textarea value={verificationNote} onChange={(e) => setVerificationNote(e.target.value)} placeholder="確認内容。例: 学校名の使用許可、本人確認、画像の権利確認など" rows={4} style={{ ...inputStyle, resize: "vertical" }} />
	                          <button type="button" onClick={submitSellerVerification} disabled={currentSellerStatus === "approved"} style={{ width: "100%", border: "none", borderRadius: 15, background: currentSellerStatus === "approved" ? "#cad6d1" : "#0f6b55", color: "#fff", padding: "13px 16px", fontWeight: 900, cursor: currentSellerStatus === "approved" ? "not-allowed" : "pointer" }}>
	                            {currentSellerStatus === "pending" ? "再申請・内容を更新する" : currentSellerStatus === "approved" ? "承認済み" : "管理者へ送信する"}
	                          </button>
		                        </div>
		                      )}
		                      {mypageView === "proCancel" && (
		                        <div style={{ display: "grid", gap: 10 }}>
		                          <div style={{ border: "1px solid #edf1ed", borderRadius: 16, padding: 14, background: "#fbfcf8" }}>
		                            <strong style={{ display: "block" }}>{isProActive ? "現在: Pro加入中" : "現在: Pro未加入"}</strong>
		                            <p style={{ margin: "8px 0 0", color: "#7b8780", fontSize: 13, lineHeight: 1.7 }}>
		                              {isProActive ? "解約すると有料メニューの見放題やPro向け機能が停止します。" : "Proに加入すると、有料メニュー閲覧やPro向け機能を利用できます。"}
		                            </p>
		                          </div>
		                          {isProActive ? (
		                            <button type="button" onClick={cancelPro} style={{ width: "100%", border: "1px solid #f1d4d4", borderRadius: 15, background: "#fff", color: "#a33a3a", padding: "13px 16px", fontWeight: 900 }}>
		                              Proを解約する
		                            </button>
		                          ) : (
		                            <button type="button" onClick={subscribePro} style={{ width: "100%", border: "none", borderRadius: 15, background: "#0f6b55", color: "#fff", padding: "13px 16px", fontWeight: 900 }}>
		                              月額3,980円でProに加入する
		                            </button>
		                          )}
		                        </div>
		                      )}
		                    </section>
		                    </>
		                  )}
                  <button type="button" onClick={logout} style={{ textAlign: "left", border: "1px solid #f1d4d4", borderRadius: 18, background: "#fff", padding: 16, fontWeight: 900, color: "#a33a3a" }}>
                    ログアウト
                  </button>
                </div>
              </section>
            )}
          </div>

          <nav
            style={{
              position: "fixed",
              left: "50%",
              bottom: 34,
              transform: "translateX(-50%)",
              width: isPcPreview ? "min(920px, calc(100% - 56px))" : "min(390px, calc(100% - 32px))",
              background: "rgba(255, 255, 255, 0.94)",
              border: "1px solid #edf1ed",
              borderRadius: 22,
              boxShadow: "0 18px 44px rgba(23, 33, 30, 0.16)",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              padding: "10px 8px",
              zIndex: 20,
              backdropFilter: "blur(14px)",
            }}
          >
	            {[
	              { id: "home", label: "ホーム", icon: "⌂" },
	              { id: "board", label: "掲示板", icon: "▤" },
	              { id: "revenue", label: "収益", icon: "¥" },
	              { id: "mypage", label: "マイページ", icon: "◎" },
	            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
	                  key={item.id}
	                  type="button"
	                  onClick={() => {
	                    const nextTab = item.id as "home" | "board" | "revenue" | "mypage";
	                    setActiveTab(nextTab);
	                    setSelectedMenu(null);
		                    if (nextTab !== "revenue") {
		                      setRevenueView("top");
		                    }
		                    if (nextTab !== "mypage") {
		                      setMypageView("top");
		                    }
		                    if (nextTab === "board" && boardMenus.length === 0) {
		                      loadBoardMenus();
	                    }
                  }}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: isActive ? "#0f6b55" : "#65746e",
                    fontSize: 11,
                    fontWeight: 900,
                    display: "grid",
                    gap: 4,
                    placeItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
	                      width: 26,
	                      height: 26,
	                      borderRadius: 10,
	                      background: isActive ? "#0f6b55" : "#eef3ef",
	                      color: isActive ? "#fff" : "#65746e",
	                      display: "grid",
	                      placeItems: "center",
	                      border: isActive ? "1px solid #0f6b55" : "1px solid #dfe7e2",
	                      fontSize: 16,
	                      fontWeight: 900,
	                      lineHeight: 1,
	                    }}
	                  >
	                    {item.icon}
	                  </span>
                  {item.label}
                </button>
              );
            })}
          </nav>
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
          maxWidth: 440,
          background: "#fff",
          border: "1px solid #dfe7e2",
          borderRadius: 24,
          padding: 28,
          boxShadow: "0 20px 60px rgba(20, 40, 34, 0.12)",
        }}
      >
        <p style={{ margin: 0, color: "#5e6d68", fontWeight: 800 }}>
          CLUB HUB
        </p>

        <h1 style={{ margin: "10px 0 0", fontSize: 32 }}>
          部活の練習メニューを、もっと探しやすく。
        </h1>

        <p style={{ color: "#5e6d68", lineHeight: 1.8 }}>
          アカウントを作成して、チームや競技に合った練習メニューを見つけましょう。
        </p>

        <label style={{ display: "block", marginTop: 20, fontWeight: 800 }}>
          メールアドレス
        </label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px 14px",
            marginTop: 8,
            borderRadius: 12,
            border: "1px solid #cad6d1",
            fontSize: 16,
          }}
        />

        <label style={{ display: "block", marginTop: 16, fontWeight: 800 }}>
          パスワード
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px 14px",
            marginTop: 8,
            borderRadius: 12,
            border: "1px solid #cad6d1",
            fontSize: 16,
          }}
        />

        <div style={{ display: "grid", gap: 10, marginTop: 22 }}>
          <button
            type="button"
            onClick={login}
            disabled={!email || !password}
            style={{
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

          <button
            type="button"
            onClick={signup}
            disabled={!email || !password}
            style={{
              padding: "13px 16px",
              borderRadius: 14,
              border: "1px solid #cad6d1",
              background: "#fff",
              color: "#163b2f",
              fontWeight: 800,
              fontSize: 16,
              cursor: !email || !password ? "not-allowed" : "pointer",
            }}
          >
            新規登録
          </button>
        </div>

        <a
          href="/admin"
          style={{
            display: "inline-block",
            marginTop: 18,
            color: "#5e6d68",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          管理者はこちら
        </a>

        {status && (
          <p style={{ marginTop: 16, color: "#17211e", lineHeight: 1.7 }}>
            {status}
          </p>
        )}
      </div>
    </main>
  );
}
