import { FormEvent, useEffect, useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { agentAPI, conversationAPI, getErrorMessage } from '@/services/api';
import { useUIStore } from '@/store/uiStore';

type AgentChatPanelProps = {
  title: string;
  description: string;
  agentCategory: string;
  placeholder: string;
  initialExamples?: string[];
};

type AgentItem = {
  id: string;
  category?: string;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

function AgentChatPanel({
  title,
  description,
  agentCategory,
  placeholder,
  initialExamples = [],
}: AgentChatPanelProps) {
  const [agentId, setAgentId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const { addNotification } = useUIStore();

  useEffect(() => {
    let isMounted = true;

    const loadAgent = async () => {
      try {
        const response = await agentAPI.getAgents();
        const agents = Array.isArray(response.data)
          ? (response.data as AgentItem[])
          : [];
        const agent = agents.find((item) => item.category === agentCategory);

        if (!agent) {
          addNotification({
            type: 'warning',
            message: '未找到对应智能体，请检查 Supabase agents 表。',
            duration: 5000,
          });
          return;
        }

        if (isMounted) setAgentId(agent.id);
      } catch (error) {
        addNotification({
          type: 'error',
          message: getErrorMessage(error),
          duration: 5000,
        });
      }
    };

    loadAgent();
    return () => {
      isMounted = false;
    };
  }, [addNotification, agentCategory]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSending) return;

    const userInput = input.trim();
    if (!userInput) return;

    if (!agentId) {
      addNotification({
        type: 'warning',
        message: '未找到对应智能体，请检查 Supabase agents 表。',
        duration: 5000,
      });
      return;
    }

    setMessages((previous) => [
      ...previous,
      { id: `user-${Date.now()}`, role: 'user', content: userInput },
    ]);
    setInput('');
    setIsSending(true);

    try {
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        const conversationResponse = await conversationAPI.createConversation({
          agent_id: agentId,
          title: `${title}对话`,
        });
        currentConversationId = String(conversationResponse.data.id);
        setConversationId(currentConversationId);
      }

      const response = await conversationAPI.chat({
        conversation_id: currentConversationId,
        agent_id: agentId,
        message: userInput,
      });
      const reply = String(response.data?.reply || '').trim();

      if (!reply) {
        throw new Error('智能体未返回有效回复。');
      }

      setMessages((previous) => [
        ...previous,
        { id: `assistant-${Date.now()}`, role: 'assistant', content: reply },
      ]);
    } catch (error) {
      addNotification({
        type: 'error',
        message: getErrorMessage(error) || '智能体调用失败，请检查后端或 Agent 配置。',
        duration: 5000,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-sci-muted">{description}</p>
      </div>

      <div className="sci-card-glow">
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={placeholder}
            rows={6}
            disabled={isSending}
            className="sci-input w-full resize-y"
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-sci-muted">可补充目标用户、技术限制、团队规模和计划周期。</span>
            <button
              type="submit"
              disabled={isSending || !agentId}
              className="sci-btn-primary shrink-0"
            >
              {isSending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  规划中
                </>
              ) : (
                <>
                  <Send size={16} />
                  开始规划
                </>
              )}
            </button>
          </div>
        </form>

        {initialExamples.length > 0 && messages.length === 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {initialExamples.map((example) => (
              <button
                key={example}
                type="button"
                disabled={isSending}
                onClick={() => setInput(example)}
                className="sci-badge-info text-left hover:opacity-80"
              >
                {example}
              </button>
            ))}
          </div>
        )}
      </div>

      {isSending && (
        <p className="text-sm text-sci-muted">智能体正在分析，请稍候……</p>
      )}

      {messages.length > 0 && (
        <section className="space-y-4">
          <h2 className="sci-section-title">规划对话</h2>
          {messages.map((message) => (
            <article
              key={message.id}
              className={
                message.role === 'user'
                  ? 'sci-card border-sci-primary/30'
                  : 'sci-card'
              }
            >
              <p className="mb-2 text-xs font-medium text-sci-muted">
                {message.role === 'user' ? '你的需求' : '项目规划助手'}
              </p>
              {message.role === 'user' ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-sci-ink">
                  {message.content}
                </p>
              ) : (
                <div className="prose prose-invert max-w-none text-sm leading-relaxed prose-headings:text-sci-ink prose-p:text-sci-muted prose-strong:text-sci-ink prose-li:text-sci-muted prose-table:text-sci-muted">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default AgentChatPanel;
