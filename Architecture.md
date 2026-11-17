# Architecture

## 大架構圖

```
┌──────────────┐  呼叫 mcp__chat-figure__draw_figure    ┌──────────────┐
│ Claude（模型）│ ─────── (title, svg, alt) ───────────▶ │ Claude Code  │
└──────────────┘ ◀────── 一句話 或 退回原因 ─────────── │ 引擎          │
                                                        └──────────────┘
                                                          │         │
                                               tool.call  │         │  ui.render（ToolUse）
                                                          ▼         ▼
                                                        ┌──────────────┐
                                                        │ chat-figure  │
                                                        │ 外掛          │
                                                        └──────────────┘
                                                                    │ 工具那一行 + Svg
                                                                    ▼
                                                        ┌──────────────┐
                                                        │ 聊天面板      │
                                                        └──────────────┘
```

## 中架構圖

```
.claude-plugin/
├── plugin.json          外掛名稱、版本、作者
└── marketplace.json     Repo 當安裝來源的清單
hooks/
├── hooks.json           指向 register.tsx
├── register.tsx         工具登記、輸入檢查、畫圖
└── register.test.tsx    測試
docs/                    開發報告
tsconfig.json            型別檢查設定（引擎產生）
```

## 小架構圖

### hooks/register.tsx

| 名稱 | 種類 | 內容 |
|---|---|---|
| `TOOL` | 常數 | `'draw_figure'` |
| `FULL_NAME` | 常數 | `'mcp__chat-figure__draw_figure'` |
| `MAX_SVG_CHARS` | 常數 | `131072` |
| `FigureInput` | 型別 | `title`、`svg`、`alt`（都是字串） |
| `readFigure(value)` | 函數 | 輸入 → `FigureInput` 或 `null` |
| `problemOf(figure)` | 函數 | `FigureInput` → 錯誤原因或 `null` |
| `session.start` | 掛勾 | `e.surface === 'terminal'` → 不登記；其他（含 `null`）→ `$.tool.register`（`isDeferred: false`） |
| `tool.call`（`tool: FULL_NAME`） | 掛勾 | 不合格 → `{ deny }`；合格 → `{ result }` 一句話；出錯 → `.catch` 回 `{ deny }` |
| `ui.render`（`component: 'ToolUse'`） | 掛勾 | 本工具、已完成、沒出錯、不是終端機 → `<Box>` 原本那一行 + `<Svg>`；其他 → `next(e)` |

### hooks/register.test.tsx

| 測試 | 檢查 |
|---|---|
| 開場登記 | `vscode`、`desktop`、`mobile`、`null` 各登記一次，共 4 次 |
| 終端機開場 | `terminal` 登記 0 次 |
| 合法的輸入 | `$.tool.call` 回 `result`，內容含標題 |
| 不是 SVG 的輸入 | `$.tool.call` 回 `deny`，原因含 `<svg` |
| 有 Svg 元件的介面 | `vscode`、`desktop`、`mobile` 都找得到 `Svg` |
| 終端機與別的工具 | `terminal`、`Bash` 那一行都找不到 `Svg` |
