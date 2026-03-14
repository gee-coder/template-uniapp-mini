# 发布流程

## 1. 版本建议

建议使用语义化版本：

- `MAJOR`：破坏性结构或接口契约变更
- `MINOR`：新增向后兼容的模板能力
- `PATCH`：缺陷修复、文档更新、构建或兼容性优化

## 2. 发布前检查清单

### 必做检查

- 更新 [CHANGELOG.md](./CHANGELOG.md)
- 核对 README、平台配置说明与接口契约
- 确认目标平台构建命令仍可通过

### 本地校验命令

```powershell
npm ci
npm run type-check
npm run build:mp-weixin
npm run build:mp-toutiao
```

## 3. 建议的发布步骤

1. 合并改动到 `master`
2. 补齐 `CHANGELOG.md`
3. 执行类型检查与目标平台构建
4. 创建标签，例如 `v0.1.0`
5. 在 GitHub Release 中记录新增能力、兼容性说明与升级提示

## 4. 发布说明建议包含

- 登录与鉴权链路的变化
- 页面结构或公共组件调整
- 平台配置、manifest 与构建命令变化
- 已知限制与后续接入建议
