import manifest from "./media-manifest.json";

export type MediaAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type Project = {
  slug: string;
  title: string;
  englishTitle: string;
  category: string;
  year?: string;
  company?: string;
  role?: string;
  teaser: string;
  cardTone: "light" | "dark";
  intro: string;
  cover: MediaAsset;
  images: MediaAsset[];
};

export type TimelineEntry = {
  period: string;
  organization: string;
  role: string;
  points: {
    label?: string;
    content: string;
  }[];
};

type MediaKey = keyof typeof manifest;

const media = (key: MediaKey, alt: string): MediaAsset => ({
  ...manifest[key],
  alt,
});

const sequence = (prefix: string, count: number, alt: string) =>
  Array.from({ length: count }, (_, index) => {
    const id = String(index + 1).padStart(2, "0");
    return media(`${prefix}${id}` as MediaKey, `${alt} ${index + 1}`);
  });

export const projects: Project[] = [
  {
    slug: "business-internship",
    title: "商业实习",
    englishTitle: "COMMERCIAL PRACTICE",
    category: "AIGC / 商业视觉 / UED",
    year: "2025.06—2025.09",
    company: "东方明珠新媒体股份有限公司",
    role: "百视通 UED 设计",
    teaser: "以 AIGC 工作流完成教育内容与商业传播视觉。",
    cardTone: "dark",
    intro:
      "在东方明珠新媒体股份有限公司实习期间，参与 AIGC 视觉商业化项目，完成推荐图、专题页、策划页及 AI 动画等视觉设计，并将 AI 生成内容转化为适配真实业务目标的商业视觉成果。",
    cover: media("businessCover", "商业实习项目封面"),
    images: [media("businessCover", "商业实习项目主视觉"), ...sequence("business", 4, "商业实习项目视觉成果")],
  },
  {
    slug: "wisp",
    title: "浮愿 WiSP",
    englishTitle: "WISP",
    category: "数字产品 / UI / AIGC",
    role: "研究、系统与核心界面",
    teaser: "让愿望被创造、回应，并生长为新的数字神性 IP。",
    cardTone: "light",
    intro:
      "浮愿 WiSP 是一款从日常愿望出发的当代新神祈愿与创作平台。用户写下愿望，由 AI 生成神名、神像与回答，并通过持续互动让新神逐步沉淀为可收藏、可传播的神性 IP。",
    cover: media("wispCover", "浮愿 WiSP 项目封面"),
    images: sequence("wisp", 11, "浮愿 WiSP 项目展示"),
  },
  {
    slug: "aya",
    title: "AYA / 阿娅",
    englishTitle: "AYA GAME",
    category: "游戏视觉 / UI / 交互",
    role: "世界观、界面与风格方案",
    teaser: "以沉浸氛围和反馈节奏构建游戏视觉体验。",
    cardTone: "light",
    intro:
      "AYA / 阿娅是一组从世界观到核心玩法的游戏视觉与交互设计实践，以沉浸氛围、界面可读性和反馈节奏为重点，完成角色、场景、关卡与关键页面的统一视觉表达。",
    cover: media("ayaCover", "AYA / 阿娅游戏视觉封面"),
    images: sequence("aya", 16, "AYA / 阿娅游戏视觉展示"),
  },
  {
    slug: "reground",
    title: "RE:GROUND",
    englishTitle: "RE:GROUND",
    category: "品牌体验 / IP / 空间",
    role: "品牌、活动与传播设计",
    teaser: "用街头运动重新连接身体、社交与城市空间。",
    cardTone: "light",
    intro:
      "“重返地面·时光市集”是一场面向都市青年的城市线下体验。项目以原创 IP“嘻呱雨蛙”为叙事核心，融合街头运动、主题市集、互动装置与青年文化展演，重新连接身体、社交与城市空间。",
    cover: media("regroundCover", "RE:GROUND 重返地面项目封面"),
    images: sequence("reground", 10, "RE:GROUND 品牌与空间展示"),
  },
  {
    slug: "everlife",
    title: "EVERLIFE",
    englishTitle: "EVERLIFE",
    category: "品牌系统 / 叙事 IP",
    role: "品牌定位、规范与应用",
    teaser: "围绕希望、连结与承诺建立原创叙事品牌系统。",
    cardTone: "light",
    intro:
      "EVERLIFE（伊甸天穹）是由合光重黎工作室发起的原创叙事 IP，以 Hope、Unity、Promise 为核心价值。本项目从品牌定位出发，建立完整的标志、色彩、字体和应用视觉规范。",
    cover: media("everlifeCover", "EVERLIFE 品牌设计封面"),
    images: sequence("everlife", 23, "EVERLIFE 品牌设计手册")
  },
];

export const internships: TimelineEntry[] = [
  {
    period: "2026.05-至今",
    organization: "腾讯科技有限公司",
    role: "内容公共事务",
    points: [
      {
        label: "工作内容",
        content:
          "跟进影视剧备案、内容审核到上线申报的流程，了解影视行业相关法规与合规标准，协助把控项目内容安全风险。跨部门协同，对接各方业务同学梳理需求、同步项目排期与进度，配合协调解决项目卡点，帮助提升整体推进效率。开展行业与 AIGC 方向调研，结合行业数据观察用户偏好与市场趋势，了解 AI 漫画、短剧等新兴赛道，分析 AIGC 在影视工业化中的落地可能性。",
      },
      {
        label: "实习收获",
        content:
          "建立内容风险意识，对文娱行业 AI 新赛道形成自己的观察与思考；提升多方沟通对接、材料整理和项目协同推进能力，并熟悉影视行业备案上线环节。",
      },
    ],
  },
  {
    period: "2026.03-2026.05",
    organization: "滴滴出行科技有限公司",
    role: "运营视觉设计",
    points: [
      {
        label: "工作内容",
        content:
          "根据运营策划，完成 banner、H5、海报等线上物料，以及宣传册、单页、易拉宝等线下物料设计，把控设计质量与交付周期；针对素材零散、视觉不统一、复用率低的现状，尝试搭建素材库，梳理统一视觉规范，优化设计流程。",
      },
      {
        label: "实习收获",
        content:
          "熟悉大厂视觉设计规范，提升多个物料并行情况下的排期管理与交付把控能力，以及跨部门沟通能力与责任心。",
      },
    ],
  },
  {
    period: "2025.06-2025.09",
    organization: "东方明珠新媒体股份有限公司（央国企）",
    role: "百视通 UED 设计师",
    points: [
      {
        label: "工作内容",
        content:
          "参与 AIGC 视觉商业化落地实践，独立完成推荐图、专题、策划等设计。搭建 AI 设计工作流，使用即梦、Midjourney、Comfy UI 完成商业视觉输出，用 AI 辅助提升设计产出效率；参与 AI 动画制作，协助搭建动画视觉体系，完成 AI 素材生成、画面调整与效果把控，输出 50 余组标准化视觉素材；对接跨部门业务，拆解业务诉求，输出 AI 设计解决方案，完成 100+ 份商业视觉物料交付，获得业务方正向反馈。",
      },
      {
        label: "实习收获",
        content:
          "掌握多类 AI 设计工具，积累业务导向 AI 设计工作流的实操经验；理解商业项目中 AI 设计不是单纯出图，而是要贴合业务目标做落地输出；提升需求拆解、跨部门沟通能力，熟悉新媒体项目完整协作链路。",
      },
    ],
  },
];

export const campusProjects: TimelineEntry[] = [
  {
    period: "2024.06-2024.10",
    organization: "2024 中国国际大学生创新大赛视觉形象设计",
    role: "AIGC视觉设计师",
    points: [
      {
        content:
          "承接国家级视觉形象打造任务，围绕赛事“我敢闯，我会创”主题，运用AIGC完成IP形象、主KV、服装设计、奖状奖杯等全系列视觉设计，搭建覆盖线上线下的完整视觉体系；融合上海城市特色与上海交大学府底蕴，赋予赛事独特的文化价值与品牌记忆点；",
      },
      {
        content:
          "设计方案全流程落地，精准转化赛事传播需求为视觉成果，输出的设计方案覆盖赛事宣传、线下场域等全场景，助力赛事提升国际影响力与青年群体参与度，推动赛事品牌视觉标准化建设。",
      },
    ],
  },
  {
    period: "2025.06-2025.09",
    organization: "AIGC赋能精神卫生康复游戏项目探索",
    role: "AIGC游戏设计师",
    points: [
      {
        content:
          "深度对接医疗专业需求，以精神卫生康复为核心目标，搭建 AIGC 驱动的严肃游戏设计工作流，运用 AI 工具完成游戏视觉资产全链路生成，打造面向心理健康、康复期精神障碍人群的轻量化数字康复游戏体系，探索 AI 在心理健康领域的创新应用；结合数字疗法逻辑优化游戏风格，实现个性化康复内容的规模化产出，设计效率较传统流程提升，验证了 AIGC 在严肃游戏领域的落地可行性；",
      },
    ],
  },
  {
    period: "2023.08-2023.12",
    organization: "15号地铁紫竹高新区交大板块墙绘设计",
    role: "视觉设计师",
    points: [
      {
        content:
          "143米长的公共艺术墙画《校园》，该项目旨在通过在地铁站内部的墙绘设计展示交大的整体面貌，其中包括具有代表性的建筑、学生的生活形态，以及学校杰出人物及特色。我在其中担任视觉插画设计师的身份。该项目已经落地并在K11展出。",
      },
    ],
  },
];

export const recognitions = [
  "网易雷火校园比赛最佳艺术奖",
  "中国国际大学生创新大赛上海赛区金奖",
  "创新大赛吉祥物备选方案入选",
  "中国传统文化复兴二十四节气创作展入选",
  "《祈的愿会圆》圆点设计奖二等奖",
  "校奖学金 · 校三好学生",
];

export const skills = [
  {
    index: "01",
    title: "AIGC 核心能力",
    items: [
      "熟练运用即梦、Midjourney、Comfy UI、NanoBanana等AI设计工具，独立完成视觉内容生成、优化与落地。",
      "具备 AI 模型实操能力，独立训练过 LORA 模型，根据需求定制化调整生成效果，适配不同创作场景。",
      "掌握 AIGC 与传统设计融合流程，能够将 AI 生成内容二次加工，满足商业设计规范与创意要求。",
      "Vibe Coding：熟悉 Git 版本管理与团队协作开发，具备前端 Web 应用独立开发经验，熟练使用 Codex、Claude Code、OpenCode、DeepSeek Harness 等主流 Coding Agents。",
    ],
  },
  {
    index: "02",
    title: "设计软件能力",
    items: [
      "Photoshop / Illustrator / Figma（精通）",
      "Blender（熟练）：可完成基础 3D 视觉元素创作。",
      "UE / Unity（掌握）：理解虚拟视觉内容制作逻辑。",
    ],
  },
  {
    index: "03",
    title: "设计专业能力",
    items: [
      "精通 IP 设计、UI 设计、海报设计、新媒体交互、书籍装帧等全品类平面视觉设计。",
      "具备扎实手绘基础与审美素养，独立完成从需求分析到成品交付的全流程。",
      "熟悉新媒体视觉传播规律，结合平台特性设计高适配内容。",
    ],
  },
  {
    index: "04",
    title: "游戏交互设计能力",
    items: [
      "从 0 到 1 主导游戏项目开发，完成世界观构建、角色系统、关卡设计及交互逻辑。",
      "参与 UE/Unity 场景搭建、UI 动效、用户体验统筹与核心玩法反馈闭环。",
      "实现数据驱动迭代，结合用户测试与可玩性分析持续打磨，确保上线版本稳定高可玩。",
    ],
  },
];

export const getProjectNeighbors = (slug: string) => {
  const index = projects.findIndex((project) => project.slug === slug);
  if (index < 0) return null;
  return {
    previous: projects[(index - 1 + projects.length) % projects.length],
    next: projects[(index + 1) % projects.length],
  };
};
