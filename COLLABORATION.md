# 协作流程说明

## 1. 目标

本文件用于说明小程序模板在 GitHub 上的协作方式，帮助团队在多端、鉴权与发布节奏上形成统一流程。

## 2. 建议启用的协作能力

建议在 GitHub 中启用：

- Discussions：承接跨端兼容、平台配置与使用问答
- Projects：管理版本迭代、平台问题与待办事项
- Releases：记录发版说明、兼容性提醒与升级建议

## 3. 建议的 Discussions 分类

- `Q&A`：构建、平台联调、登录排障
- `Ideas`：页面、体验与跨端能力增强建议
- `Show and tell`：二次开发成果展示
- `Announcements`：版本变更、平台兼容性提醒、迁移说明

## 4. 建议的 Projects 看板泳道

- `Inbox`
- `Ready`
- `In Progress`
- `Review`
- `Blocked`
- `Done`

## 5. 标签治理建议

建议采用三层标签结构：

- 类型：`type:bug`、`type:feature`、`type:docs`、`type:chore`、`type:breaking`
- 状态：`status:needs-triage`、`status:ready`、`status:blocked`
- 优先级：`priority:p1`、`priority:p2`、`priority:p3`

小程序模板建议保留的领域标签：

- `area:pages`
- `area:auth`
- `area:platform`
- `area:infra`

## 6. Pull Request 协作链路

1. 开发者发起 Pull Request
2. `CODEOWNERS` 自动请求维护者评审
3. `pr-labeler` 自动按目录打标签
4. `release-drafter` 汇总版本草稿
5. 构建与人工验证通过后合并

## 7. 发布协作建议

- 发布前更新 [CHANGELOG.md](./CHANGELOG.md)
- 按 [RELEASE.md](./RELEASE.md) 执行类型检查与目标平台构建
- 如涉及统一认证契约变化，需同步通知后端与后台模板维护者
