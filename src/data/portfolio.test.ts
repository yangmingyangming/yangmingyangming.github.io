import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { campusProjects, getProjectNeighbors, internships, projects, skills } from "./portfolio";

describe("portfolio data", () => {
  it("contains five uniquely routed projects with complete media", () => {
    expect(projects).toHaveLength(5);
    expect(new Set(projects.map((project) => project.slug)).size).toBe(projects.length);
    projects.forEach((project) => {
      expect(project.title.length).toBeGreaterThan(0);
      expect(project.teaser.length).toBeGreaterThan(10);
      expect(project.intro.length).toBeGreaterThan(40);
      expect(project.images.length).toBeGreaterThan(0);
      expect(project.cover.width).toBeGreaterThan(0);
      expect(project.cover.height).toBeGreaterThan(0);
      project.images.forEach((image) => {
        expect(image.src).toMatch(/^\.\/media\//);
        expect(image.alt.length).toBeGreaterThan(0);
      });
    });
  });

  it("wraps previous and next project navigation", () => {
    const first = getProjectNeighbors(projects[0].slug);
    expect(first?.previous.slug).toBe(projects.at(-1)?.slug);
    expect(first?.next.slug).toBe(projects[1].slug);
  });

  it("returns null for an unknown project", () => {
    expect(getProjectNeighbors("missing-project")).toBeNull();
  });

  it("points every project entry to an optimized file on disk", () => {
    const assets = projects.flatMap((project) => [project.cover, ...project.images]);
    assets.forEach((asset) => {
      const file = path.join(process.cwd(), "public", asset.src.replace(/^\.\//, ""));
      expect(existsSync(file), file).toBe(true);
    });
  });

  it("does not expose private resume contact details", () => {
    const published = JSON.stringify(projects);
    expect(published).not.toContain("18857900965");
    expect(published).not.toContain("3170943019@qq.com");
    expect(published).not.toContain("2005年5月");
  });

  it("keeps the complete internship and campus experience copy", () => {
    expect(internships).toHaveLength(3);
    expect(internships.every((entry) => entry.points.length === 2)).toBe(true);
    expect(internships[0].points[0].content).toContain("分析 AIGC 在影视工业化中的落地可能性");
    expect(internships[2].points[0].content).toContain("完成 100+ 份商业视觉物料交付");
    expect(internships[2].points[1].content).toContain("熟悉新媒体项目完整协作链路");

    expect(campusProjects).toHaveLength(3);
    expect(campusProjects.map((entry) => entry.points.length)).toEqual([2, 1, 1]);
    expect(campusProjects[0].points[1].content).toContain("推动赛事品牌视觉标准化建设");
    expect(campusProjects[1].points[0].content).toContain("验证了 AIGC 在严肃游戏领域的落地可行性");
    expect(campusProjects[2].points[0].content).toContain("该项目已经落地并在K11展出");
  });

  it("contains the complete ways of making content from the reference", () => {
    expect(skills).toHaveLength(4);
    const copy = skills.flatMap((skill) => skill.items).join("\n");
    expect(copy).toContain("NanoBanana等AI设计工具");
    expect(copy).toContain("DeepSeek Harness 等主流 Coding Agents");
    expect(copy).toContain("独立训练过 LORA 模型");
    expect(copy).toContain("确保上线版本稳定高可玩");
  });
});
