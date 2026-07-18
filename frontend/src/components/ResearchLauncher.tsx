import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  Code2,
  FileText,
  GitBranch,
  Route,
} from "lucide-react";

export const researchFeatures = [
  {
    id: "paper",
    index: "01",
    label: "论文精读",
    path: "/paper/read",
    icon: FileText,
    accent: "#5b9cff",
    description: "深度解析论文的核心思想、方法与贡献，沉淀可复现的研究线索。",
    meta: ["结构化精读", "引用链路", "关键结论"],
  },
  {
    id: "research",
    index: "02",
    label: "问题拆解",
    path: "/research/decompose",
    icon: GitBranch,
    accent: "#62c98e",
    description: "把研究方向拆成可验证的子问题，建立边界、依赖与优先级。",
    meta: ["问题边界", "依赖关系", "可行性"],
  },
  {
    id: "experiment",
    index: "03",
    label: "项目规划",
    path: "/experiment/roadmap",
    icon: Route,
    accent: "#4e8fff",
    description: "把研究目标拆成可执行阶段，明确里程碑、依赖、风险与验收标准。",
    meta: ["阶段拆解", "里程碑", "风险控制"],
  },
  {
    id: "code",
    index: "04",
    label: "代码复现",
    path: "/code/reproduce",
    icon: Code2,
    accent: "#dd8840",
    description: "解析仓库结构与运行依赖，形成清晰、可追踪的复现路径。",
    meta: ["仓库解析", "环境诊断", "复现步骤"],
  },
  {
    id: "result",
    index: "05",
    label: "结果分析",
    path: "/result/analyze",
    icon: BarChart3,
    accent: "#b36adf",
    description: "验证实验结果，定位差异并生成可用于论文写作的分析证据。",
    meta: ["统计检验", "可视化", "写作证据"],
  },
] as const;

interface ResearchLauncherProps {
  initialIndex?: number;
  compact?: boolean;
  onNavigate: (path: string) => void;
}

function ResearchLauncher({
  initialIndex = 2,
  compact = false,
  onNavigate,
}: ResearchLauncherProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const launcherRef = useRef<HTMLElement>(null);
  const activeFeature = researchFeatures[activeIndex];
  const ActiveIcon = activeFeature.icon;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, select, [contenteditable="true"]'))
        return;
      if (!target || !launcherRef.current?.contains(target)) return;

      if (/^[1-5]$/.test(event.key)) {
        setActiveIndex(Number(event.key) - 1);
        return;
      }

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((current) => (current + 1) % researchFeatures.length);
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex(
          (current) =>
            (current - 1 + researchFeatures.length) % researchFeatures.length,
        );
      }

      if (event.key === "Enter") onNavigate(activeFeature.path);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeFeature.path, onNavigate]);

  return (
    <section
      ref={launcherRef}
      className={`research-launcher ${compact ? "research-launcher--compact" : ""}`}
      aria-label="科研功能选择器"
    >
      <div
        className="research-workspace"
        role="group"
        aria-label="五个科研功能"
      >
        <div className="research-workspace__bar">
          <span className="research-workspace__title">
            <i /> SciPilot Workspace
          </span>
          <code>{activeFeature.path}</code>
        </div>

        <div className="research-workspace__body">
          <nav className="research-modules" aria-label="研究流程模块">
            <div className="research-modules__heading">
              <small>研究流程</small>
              <strong>选择下一步</strong>
            </div>

            {researchFeatures.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = index === activeIndex;
              return (
                <button
                  type="button"
                  key={feature.id}
                  className={`research-module ${isActive ? "is-active" : ""}`}
                  style={
                    { "--feature-accent": feature.accent } as CSSProperties
                  }
                  onPointerDown={() => setActiveIndex(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onClick={() => onNavigate(feature.path)}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`${feature.index} ${feature.label}，进入功能`}
                >
                  <span className="research-module__icon">
                    <Icon size={21} />
                  </span>
                  <span className="research-module__copy">
                    <small>步骤 {feature.index}</small>
                    <strong>{feature.label}</strong>
                  </span>
                  <ChevronRight className="research-module__arrow" size={17} />
                </button>
              );
            })}
          </nav>

          <article
            className="research-detail"
            style={
              { "--feature-accent": activeFeature.accent } as CSSProperties
            }
          >
            <div className="research-detail__content" key={activeFeature.id}>
              <div className="research-detail__topline">
                <span>当前工作流</span>
                <span className="research-detail__ready">功能概览</span>
              </div>

              <div className="research-detail__heading">
                <span className="research-detail__icon">
                  <ActiveIcon size={27} />
                </span>
                <div>
                  <small>{activeFeature.index} / 05</small>
                  <h2>{activeFeature.label}</h2>
                </div>
              </div>

              <p>{activeFeature.description}</p>

              <ul>
                {activeFeature.meta.map((item) => (
                  <li key={item}>
                    <Check size={15} />
                    {item}
                  </li>
                ))}
              </ul>

              <div
                className="research-repository"
                aria-label="当前模块入口信息"
              >
                <div className="research-repository__heading">
                  <span>
                    <GitBranch size={15} /> 工作流入口
                  </span>
                  <code>{activeFeature.path}</code>
                </div>
                <div className="research-repository__branch">
                  <span>当前模块</span>
                  <strong>
                    {activeFeature.index} / 05 · {activeFeature.label}
                  </strong>
                </div>
              </div>

              <button
                className="research-detail__action"
                type="button"
                onClick={() => onNavigate(activeFeature.path)}
              >
                进入{activeFeature.label}
                <ArrowRight size={18} />
              </button>
            </div>
          </article>
        </div>
      </div>

      <div className="research-launcher__hint" aria-hidden="true">
        <span>方向键切换</span>
        <span>数字键 1–5 选择</span>
        <span>Enter 进入</span>
      </div>
    </section>
  );
}

export default ResearchLauncher;
