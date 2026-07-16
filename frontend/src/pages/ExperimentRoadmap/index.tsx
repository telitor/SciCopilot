import AgentChatPanel from '@/components/AgentChatPanel';

function ExperimentRoadmap() {
  return (
    <AgentChatPanel
      agentCategory="project-planning"
      title="项目规划"
      description="将项目目标转化为可执行的技术路线、阶段任务与里程碑"
      placeholder="请输入项目目标、科研方向或待规划任务"
      initialExamples={[
        '为 SciPilot 规划下一阶段开发路线',
        '将一个软件工程项目拆解为需求、开发、测试和部署阶段',
        '为论文复现实验设计任务清单和时间计划',
        '分析项目风险并给出里程碑和验收标准',
      ]}
    />
  );
}

export default ExperimentRoadmap;
