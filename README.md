# template-uniapp-mini

UniApp miniapp template aligned with the shared backend JWT flow. It includes a landing page, login page, and user center page for WeChat and Douyin mini-program targets.

## Stack

- UniApp 3.x
- Vue 3.4.38
- TypeScript 5.9.3
- Pinia 2.1.7
- uView Plus 3.7.13

## Start

```powershell
npm install
npm run dev:mp-weixin
```

## Scripts

```powershell
npm run type-check
npm run dev:mp-weixin
npm run build:mp-weixin
npm run dev:mp-toutiao
npm run build:mp-toutiao
```

## Notes

- The template uses the same JWT and refresh token contract as the backend and admin app.
- Platform code login is intentionally not implemented yet; this repo starts with account-password login for faster reuse.

