# 资源目录规范

本目录用于统一管理网页静态资源，遵循常见前端工程规范。

## 目录结构

- assets/images/projects/: 项目卡片的封面图、视频海报图
- assets/images/projects/placeholder-media.svg: 当图片或视频资源缺失时显示的默认占位图
- assets/videos/projects/: 项目卡片的视频文件

## 命名建议

- 全部使用小写英文与短横线（kebab-case）
- 图片：xxx-cover.jpg / xxx-poster.jpg
- 视频：xxx-demo.mp4 或 xxx-demo.webm

示例：

- assets/images/projects/personal-site-cover.jpg
- assets/images/projects/data-dashboard-poster.jpg
- assets/videos/projects/data-dashboard-demo.mp4

## 推荐格式与体积

- 图片：JPG/WebP，建议宽度 1280px 左右
- 视频：MP4(H.264) 优先，必要时补充 WebM
- 控制体积：单图尽量 < 500KB，单视频尽量 < 8MB

## 替换流程

1. 按命名规则把素材放到对应目录
2. 保持 index.html 中的资源路径不变
3. 提交并部署后检查移动端与桌面端显示效果

## 缺失资源兜底

- 图片加载失败时，会自动替换为 placeholder-media.svg
- 视频资源不可用时，会自动将视频区域替换为同一张占位图
