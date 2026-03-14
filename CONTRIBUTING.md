# 贡献指南

本仓库是小程序模板仓库，目标是保持双端可构建、统一认证契约、页面结构简洁。

## 1. 基本原则

- 优先保持微信 / 抖音双目标可构建
- 接口封装统一放在 `src/api`
- 认证状态统一放在 `src/store`
- 若涉及平台特有能力，尽量通过抽象层隔离

## 2. 推荐开发流程

1. 拉取最新代码
2. 创建功能分支
3. 本地开发与联调
4. 运行类型检查和目标构建
5. 提交并发起 PR

## 3. 提交前检查

```powershell
npm run type-check
npm run build:mp-weixin
npm run build:mp-toutiao
```

## 4. 开发建议

- 新增页面优先放在 `src/pages/<module>`
- 如果更换认证流程，优先改后端认证，再调整前端页面
- 若计划全面接入 uView，请先验证依赖组合稳定性

## 5. 提交规范

请参考 [`COMMIT_CONVENTION.md`](./COMMIT_CONVENTION.md)

