import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  GitBranch,
  GitCommitHorizontal,
  Layers3,
  Moon,
  Play,
  RotateCcw,
  ShieldCheck,
  Sun,
} from "lucide-react";
import ResearchLauncher from "@/components/ResearchLauncher";
import { useUIStore } from "@/store/uiStore";

const buildSteps = [
  "解析研究主题",
  "初始化仓库结构",
  "生成提交节点",
  "运行测试套件",
  "构建依赖图谱",
  "验证通过",
];

function Home() {
  const navigate = useNavigate();
  const { theme, setTheme } = useUIStore();
  const [introVisible, setIntroVisible] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      setIntroVisible(false);
      return;
    }

    const timer = window.setTimeout(() => setIntroVisible(false), 1050);
    return () => window.clearTimeout(timer);
  }, [animationKey]);

  const handleNavigate = useCallback(
    (path: string) => navigate(path),
    [navigate],
  );

  const replayIntro = () => {
    setAnimationKey((value) => value + 1);
    setIntroVisible(true);
  };

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  const scrollToSection = (id: string) => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <div className="launch-page" key={animationKey}>
      {introVisible && (
        <div className="launch-intro" aria-hidden="true">
          <div className="launch-intro__brand">
            <GitBranch size={24} />
            <span>SciPilot</span>
          </div>
          <div className="launch-intro__assembly">
            {[1, 2, 3, 4, 5].map((item) => (
              <span key={item} />
            ))}
          </div>
          <p>正在装配科研工作流</p>
        </div>
      )}

      <header className="launch-header">
        <div className="launch-header__inner">
          <button
            className="launch-brand"
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span className="launch-brand__mark">
              <GitBranch size={21} />
            </span>
            <span>
              <strong>SciPilot</strong>
              <small>软件工程科研工作台</small>
            </span>
          </button>

          <nav aria-label="账户导航">
            <button
              className="launch-icon-button"
              type="button"
              onClick={toggleTheme}
              aria-label="切换明暗主题"
            >
              {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
            </button>
            <button
              className="launch-link-button"
              type="button"
              onClick={() => navigate("/login")}
            >
              登录
            </button>
            <button
              className="launch-register-button"
              type="button"
              onClick={() => navigate("/register")}
            >
              免费开始
            </button>
          </nav>
        </div>
      </header>

      <main className="launch-main">
        <section className="launch-copy">
          <div className="launch-copy__eyebrow">
            <GitBranch size={15} />
            面向软件工程研究的 AI 工作台
          </div>
          <h1>
            把研究，
            <br />
            <span>编译成成果。</span>
          </h1>
          <p>
            从论文精读到结果分析，以提交为节点，让每一步研究都清晰、可复现、可追溯。
          </p>
          <div className="launch-copy__actions">
            <button
              type="button"
              className="launch-primary-button"
              onClick={() => navigate("/register")}
            >
              开始一项研究
              <ArrowRight size={18} />
            </button>
            <button
              type="button"
              className="launch-secondary-button"
              onClick={() => navigate("/login")}
            >
              登录
            </button>
          </div>
          <div className="launch-copy__status">
            <span>面向本地研究工作流</span>
            <span>
              <strong>5</strong> 个研究模块
            </span>
          </div>
          <button
            className="launch-scroll-cue"
            type="button"
            onClick={() => scrollToSection("research-workflow")}
          >
            探索五个研究模块
            <ChevronDown size={17} />
          </button>
        </section>

        <section className="launch-atmosphere" aria-hidden="true">
          <div className="launch-atmosphere__brand">
            <span>Software research, thoughtfully engineered.</span>
            <strong>SciPilot</strong>
          </div>

          <div className="launch-codeflow">
            <div className="launch-codeflow__bar">
              <span>
                <GitBranch size={15} /> research-flow.ts
              </span>
              <code>main</code>
            </div>
            <pre>
              <code>{`const research = pipeline()
  .read(paper)
  .reason(question)
  .build(experiment)
  .reproduce(repository)
  .verify(result);`}</code>
            </pre>
            <div className="launch-codeflow__path">
              <span>paper</span>
              <ArrowRight size={13} />
              <span>experiment</span>
              <ArrowRight size={13} />
              <span>evidence</span>
            </div>
          </div>
        </section>
      </main>

      <section
        className="launch-workflow"
        id="research-workflow"
        aria-labelledby="research-workflow-title"
      >
        <div className="launch-workflow__heading">
          <span>Research Workflow</span>
          <h2 id="research-workflow-title">五个模块，顺着研究自然推进。</h2>
          <p>
            从理解问题到验证结果，每一步都在同一个工作区里清晰衔接，并保留原有操作方式。
          </p>
        </div>

        <ResearchLauncher initialIndex={2} onNavigate={handleNavigate} />

        <button
          className="launch-workflow__next"
          type="button"
          onClick={() => scrollToSection("research-journey")}
        >
          查看完整研究链路
          <ChevronDown size={17} />
        </button>
      </section>

      <section className="launch-journey" id="research-journey">
        <div className="launch-journey__heading">
          <span>一条完整链路</span>
          <h2>
            从一个问题，到一份
            <br />
            经得起复现的结果。
          </h2>
          <p>
            研究过程不再散落在聊天、文件和记忆里。SciPilot
            把关键节点组织成一条连续的提交轨迹。
          </p>
        </div>

        <div className="build-track" aria-label="六步研究链路概览">
          <div className="build-track__topline">
            <div>
              <small>研究链路</small>
              <strong>六步研究闭环</strong>
            </div>
            <span>流程概览</span>
            <button
              type="button"
              onClick={replayIntro}
              aria-label="重放入场动画"
            >
              {introVisible ? <Play size={19} /> : <RotateCcw size={18} />}
            </button>
          </div>

          <div className="build-track__line" role="list">
            {buildSteps.map((step, index) => (
              <div
                className="build-track__step"
                role="listitem"
                key={step}
                style={{ "--step-delay": `${index * 110}ms` } as CSSProperties}
              >
                <span>
                  <small>{String(index + 1).padStart(2, "0")}</small>
                </span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="launch-principles">
          <article>
            <span>
              <GitCommitHorizontal size={22} />
            </span>
            <h3>可追溯</h3>
            <p>每一次判断都回到对应的证据、文件与提交节点。</p>
          </article>
          <article>
            <span>
              <Layers3 size={22} />
            </span>
            <h3>可复现</h3>
            <p>环境、依赖和实验步骤被完整保留，不再依赖记忆。</p>
          </article>
          <article>
            <span>
              <ShieldCheck size={22} />
            </span>
            <h3>可验证</h3>
            <p>测试、指标与结果共同构成清晰可信的研究证据。</p>
          </article>
        </div>
      </section>

      <footer className="launch-footer">
        <div>
          <strong>SciPilot</strong>
          <span>面向软件工程研究全过程</span>
        </div>
        <span>© 2026 SciPilot</span>
      </footer>
    </div>
  );
}

export default Home;
