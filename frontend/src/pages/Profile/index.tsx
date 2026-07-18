import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Clock,
  FileText,
  Loader2,
  Mail,
  MessageSquare,
  RefreshCw,
  Star,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { conversationAPI, getErrorMessage } from "@/services/api";

interface ConversationSummary {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

function isConversationSummary(value: unknown): value is ConversationSummary {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.created_at === "string" &&
    typeof item.updated_at === "string"
  );
}

function formatDate(value?: string, includeTime = false) {
  if (!value) return "尚无数据";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "时间未知";

  return date.toLocaleString(
    "zh-CN",
    includeTime
      ? {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      : { year: "numeric", month: "short", day: "numeric" },
  );
}

function Profile() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    "overview" | "history" | "settings"
  >("overview");
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await conversationAPI.getConversations();
      const records = Array.isArray(response.data)
        ? response.data.filter(isConversationSummary)
        : [];

      records.sort(
        (left, right) =>
          Date.parse(right.updated_at) - Date.parse(left.updated_at),
      );
      setConversations(records);
    } catch (error) {
      setConversations([]);
      setLoadError(getErrorMessage(error, "会话记录加载超时，请稍后重试。"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  const latestConversation = conversations[0];
  const stats = useMemo(
    () => [
      {
        label: "会话总数",
        value: isLoading || loadError ? "—" : String(conversations.length),
        detail: isLoading
          ? "正在加载"
          : loadError
            ? "加载失败"
            : "来自真实会话记录",
        icon: MessageSquare,
      },
      {
        label: "最近更新",
        value:
          isLoading || loadError
            ? "—"
            : formatDate(latestConversation?.updated_at),
        detail: latestConversation ? "最近一条会话" : "尚无数据",
        icon: Clock,
      },
      {
        label: "论文统计",
        value: "—",
        detail: "尚无数据",
        icon: FileText,
      },
      {
        label: "收藏统计",
        value: "—",
        detail: "尚无数据",
        icon: Star,
      },
    ],
    [conversations.length, isLoading, latestConversation, loadError],
  );

  const conversationList = (limit?: number) => {
    if (isLoading) {
      return (
        <div className="min-h-40 flex flex-col items-center justify-center text-sci-muted">
          <Loader2 size={22} className="animate-spin text-sci-accent mb-3" />
          <p className="text-sm">正在读取真实会话记录…</p>
        </div>
      );
    }

    if (loadError) {
      return (
        <div className="min-h-40 flex flex-col items-center justify-center text-center">
          <AlertCircle size={22} className="text-sci-warning mb-3" />
          <p className="font-medium">会话记录加载失败</p>
          <p className="text-sm text-sci-muted mt-1 max-w-md">{loadError}</p>
          <button
            type="button"
            onClick={() => void loadConversations()}
            className="sci-btn-secondary mt-4"
          >
            重新加载
          </button>
        </div>
      );
    }

    const visibleConversations =
      typeof limit === "number" ? conversations.slice(0, limit) : conversations;

    if (visibleConversations.length === 0) {
      return (
        <div className="min-h-40 flex flex-col items-center justify-center text-center">
          <MessageSquare size={22} className="text-sci-muted mb-3" />
          <p className="font-medium">尚无会话数据</p>
          <p className="text-sm text-sci-muted mt-1">
            开始一次真实智能体对话后，记录会显示在这里。
          </p>
        </div>
      );
    }

    return (
      <div className="divide-y divide-sci-border">
        {visibleConversations.map((conversation) => (
          <div
            key={conversation.id}
            className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="w-9 h-9 rounded-xl bg-sci-bg3 flex items-center justify-center flex-shrink-0">
              <MessageSquare size={15} className="text-sci-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">
                {conversation.title.trim() || "未命名会话"}
              </p>
              <p className="text-xs text-sci-muted mt-1">
                更新于 {formatDate(conversation.updated_at, true)}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-0">
      <div className="sci-card-glow">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sci-primary to-sci-accent flex items-center justify-center text-white text-2xl font-bold">
            {user?.username?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">{user?.username || "用户"}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-sci-muted">
              <span className="flex items-center gap-1 min-w-0">
                <Mail size={14} className="flex-shrink-0" />
                <span className="truncate">{user?.email || "未提供邮箱"}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                注册于 {formatDate(user?.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 border-b border-sci-border">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { key: "overview", label: "概览" },
            { key: "history", label: "历史记录" },
            { key: "settings", label: "设置" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-sci-accent text-sci-accent"
                  : "border-transparent text-sci-muted hover:text-sci-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {!isLoading && (
          <button
            type="button"
            onClick={() => void loadConversations()}
            className="hidden sm:inline-flex items-center gap-1.5 pb-2.5 text-xs text-sci-muted hover:text-sci-accent transition-colors"
          >
            <RefreshCw size={13} />
            刷新会话
          </button>
        )}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="sci-card text-center">
                  <Icon size={20} className="text-sci-accent mx-auto mb-2" />
                  <div className="text-xl font-bold break-words">
                    {stat.value}
                  </div>
                  <div className="text-sm text-sci-muted mt-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-sci-muted mt-1">
                    {stat.detail}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="sci-card">
            <h3 className="font-semibold mb-4">最近会话</h3>
            {conversationList(5)}
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="sci-card">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="font-semibold">会话历史</h3>
              <p className="text-xs text-sci-muted mt-1">
                仅展示后端返回的真实会话摘要。
              </p>
            </div>
            {!isLoading && !loadError && (
              <span className="sci-badge-info">{conversations.length} 条</span>
            )}
          </div>
          {conversationList()}
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="sci-card">
            <h3 className="font-semibold mb-4">个人信息</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-sci-muted mb-2">
                  用户名
                </label>
                <input
                  type="text"
                  value={user?.username || ""}
                  disabled
                  className="sci-input w-full max-w-md opacity-70 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-sci-muted mb-2">
                  邮箱
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="sci-input w-full max-w-md opacity-70 cursor-not-allowed"
                />
              </div>
              <p className="text-sm text-sci-muted">
                账户资料编辑接口尚未提供，当前仅支持查看。
              </p>
            </div>
          </div>

          <div className="sci-card">
            <h3 className="font-semibold mb-2">偏好设置</h3>
            <p className="text-sm text-sci-muted leading-6">
              消息通知与自动保存偏好尚未接入后端，当前没有可展示或修改的真实设置。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
