import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Clock,
  Loader2,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { conversationAPI, getErrorMessage } from "@/services/api";
import ResearchLauncher from "@/components/ResearchLauncher";

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

function formatDate(value: string, includeTime = true) {
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

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const handleNavigate = useCallback(
    (path: string) => navigate(path),
    [navigate],
  );

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

  const recentlyUpdatedCount = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    return conversations.filter((conversation) => {
      const updatedAt = Date.parse(conversation.updated_at);
      return !Number.isNaN(updatedAt) && updatedAt >= sevenDaysAgo;
    }).length;
  }, [conversations]);

  const latestConversation = conversations[0];

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="dashboard-launcher-heading">
        <div>
          <span>研究工作区 / main</span>
          <h1>欢迎回来，{user?.username || "研究者"}</h1>
        </div>
        <p>选择一个模块，继续构建今天的研究提交。</p>
      </div>

      <ResearchLauncher compact initialIndex={2} onNavigate={handleNavigate} />

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="sci-section-title">最近会话</h2>
            {!isLoading && (
              <button
                type="button"
                onClick={() => void loadConversations()}
                className="inline-flex items-center gap-1.5 text-xs text-sci-muted hover:text-sci-accent transition-colors"
              >
                <RefreshCw size={13} />
                刷新
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="sci-card min-h-48 flex flex-col items-center justify-center text-sci-muted">
              <Loader2
                size={24}
                className="animate-spin text-sci-accent mb-3"
              />
              <p className="text-sm">正在读取真实会话记录…</p>
            </div>
          ) : loadError ? (
            <div className="sci-card min-h-48 flex flex-col items-center justify-center text-center">
              <AlertCircle size={24} className="text-sci-warning mb-3" />
              <p className="font-medium">会话记录加载失败</p>
              <p className="text-sm text-sci-muted mt-1 max-w-md">
                {loadError}
              </p>
              <button
                type="button"
                onClick={() => void loadConversations()}
                className="sci-btn-secondary mt-4"
              >
                重新加载
              </button>
            </div>
          ) : conversations.length === 0 ? (
            <div className="sci-card min-h-48 flex flex-col items-center justify-center text-center">
              <MessageSquare size={24} className="text-sci-muted mb-3" />
              <p className="font-medium">尚无会话数据</p>
              <p className="text-sm text-sci-muted mt-1">
                从上方选择研究模块并开始一次真实对话后，记录会显示在这里。
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.slice(0, 6).map((conversation) => (
                <article key={conversation.id} className="sci-card">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-sci-bg3 flex items-center justify-center flex-shrink-0">
                      <MessageSquare size={16} className="text-sci-accent" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate">
                        {conversation.title.trim() || "未命名会话"}
                      </h3>
                      <p className="text-xs text-sci-muted mt-1 flex items-center gap-1.5">
                        <Clock size={12} />
                        更新于 {formatDate(conversation.updated_at)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <div>
            <h2 className="sci-section-title mb-4">工作区概览</h2>
            <div className="sci-card space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-sci-muted">会话总数</span>
                <span className="text-xl font-semibold text-sci-accent">
                  {isLoading || loadError ? "—" : conversations.length}
                </span>
              </div>
              <div className="h-px bg-sci-border" />
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-sci-muted">近 7 天更新</span>
                <span className="text-xl font-semibold text-sci-success">
                  {isLoading || loadError ? "—" : recentlyUpdatedCount}
                </span>
              </div>
              <div className="h-px bg-sci-border" />
              <div>
                <p className="text-sm text-sci-muted">最近同步</p>
                <p className="text-sm font-medium mt-1">
                  {isLoading
                    ? "正在加载"
                    : loadError
                      ? "加载失败"
                      : latestConversation
                        ? formatDate(latestConversation.updated_at, false)
                        : "尚无数据"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="sci-section-title mb-4">数据说明</h2>
            <div className="sci-card">
              <p className="text-sm text-sci-muted leading-6">
                当前仅展示后端已经提供的真实会话数据。论文统计、学习进度和研究趋势尚未接入，
                因此不会用示例内容代替。
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Dashboard;
