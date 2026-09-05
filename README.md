# 杨茗个人作品集

基于 React、TypeScript、Three.js 与 GSAP 构建的视觉设计师个人作品集。首页包含液态球体、滚动叙事、精选作品、履历内容与彩色十字转场；五个作品详情页由统一数据模型生成。

## 本地运行

```bash
npm install
npm run dev
```

## 质量检查

```bash
npm run check
npm run test:e2e
```

## 内容与素材

- 作品、实习、校园经历和技能：`src/data/portfolio.ts`
- 滚动中的球体位置：`src/lib/motion.ts`
- 原始素材导入与优化：`npm run assets:build`
- 构建输出：`dist/client`

`assets:build` 只读取相邻旧站仓库的 Git 历史，不修改或恢复其工作区。
