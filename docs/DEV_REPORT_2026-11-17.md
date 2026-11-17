# 開發報告 2026-11-17：chat-figure 外掛

## 目的
- 測試 Claude 能不能在 VS Code 的聊天視窗裡畫圖。使用者要看實際效果。
- 效果確認後，依使用者指示獨立成 Repo `another1124/ClaudeChatFigure`（私人）。

## 執行的動作

### 測試外掛
- 在 Claude Code 為單一對話準備的外掛資料夾建立 `chat-figure` 外掛。這個資料夾只有那次對話會載入，沒有改動任何專案設定或使用者設定。
- `hooks/register.tsx` 做三件事：
  - 對話開始時登記工具 `draw_figure`，工具說明直接放進 Claude 的工具清單。
  - Claude 呼叫這個工具時先檢查輸入：
    - 三個欄位都要有。
    - SVG 要以 `<svg` 開頭、`</svg>` 結尾。
    - 長度不超過 131,072 字元。
    - 檢查通過就回一句話給 Claude；沒通過就拒絕並說明原因。
  - 在這個工具的那一行底下，用 Svg 元件畫出圖。終端機沒有 Svg 元件，在終端機裡不畫。
- 新增 `hooks/register.test.tsx`，共 4 項測試：
  - 合法輸入
  - 不合法輸入
  - 三個有 Svg 的介面會畫出圖
  - 終端機和其他工具不畫圖
- 測試用的圖是一張流程圖：
  - 流程依據另一個專案的說明文件與程式註解。
  - 這張圖先用 Edge 的無介面模式轉成 PNG，由 Claude 讀過、檢查版面。

### 建立 Repo
- 把外掛複製到本機的 Repo 資料夾，引擎自動產生的 `.claude-plugin/types/` 不複製。
- 在新資料夾執行 `git init`。本機身分設成 another1124，全域 git 設定沒有改。
- 用官方工具掃描金鑰與權杖：掃了 6 個檔案，沒有找到。
- 新增和修改的檔案：
  - 新增 `.claude-plugin/marketplace.json`、`README.md`、`Architecture.md`、`.gitignore`、`.gitattributes`。
  - `plugin.json` 加上作者，說明改成中文。
  - 開發報告移到 `docs/`。
- 這台電腦沒有 GitHub 指令工具，所以 Repo 由使用者在 GitHub 網頁上建立。

## 驗證
- 測試外掛階段，用 Claude Code 2.1.325：
  - `claude plugin validate`：通過。警告是缺作者、README、LICENSE、圖示，這些是上架目錄才要求的項目。
  - `claude plugin test`：4 項全部通過。
- VS Code 聊天視窗裡的實際顯示：外掛載入後，Claude 呼叫一次 `draw_figure`，畫出一張流程圖（SVG 3,738 字元）。使用者確認看得到。

## 未驗證
- 圖是直接顯示，還是要點開工具那一行才看得到：使用者沒有說。
- 桌面版、手機版的顯示。
- SVG 裡內嵌點陣圖會不會被擋。
- 從 Repo 安裝：還沒有人用安裝指令裝過。
- 型別檢查：這台電腦沒有 tsc。

## 未做
- 畫好的圖自動回傳給 Claude。這次是手動用 Edge 轉檔後再讀。
