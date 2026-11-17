# 開發報告 2026-11-17：chat-figure 外掛

## 目的
- 測試 Claude 能不能在 VS Code 的聊天視窗裡畫圖。使用者要看實際效果。
- 效果確認後，依使用者指示獨立成 Repo `another1124/ClaudeChatFigure`。建立時是私人 Repo，之後由使用者改為公開。

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

---

## 修改：終端機的對話不登記畫圖工具（同日，使用者指示）

### 執行的動作
- `hooks/register.tsx` 的 `session.start`：`e.surface === 'terminal'` 時不登記工具，其他情況照常登記。
- 新增 2 項測試：
  - VS Code、桌面版、手機版、沒有介面（`null`）的對話各登記一次。
  - 終端機的對話不登記。
- README 的介面表加上終端機與指令列模式兩列；Architecture.md 同步更新。
- 版號維持 0.1.0：0.1.0 推上 GitHub 之後還沒有人安裝過。

### 驗證
- `claude plugin validate`：通過。
- `claude plugin test`：6 項全部通過。
- 在 VS Code 擴充套件 2.1.325 的對話裡實測：
  - 把新程式同步到這次對話載入的測試版，暫時讓工具的退回訊息帶出 `session.start` 看到的介面。
  - 送一個錯的輸入，回覆是「session.start 看到的介面＝null」。
  - 這代表外掛確實重新載入了，而且 VS Code 對話開場時的介面是 `null`，不是 `terminal`，所以 VS Code 仍有畫圖工具。
  - 實測完，測試版已改回跟 Repo 相同，不含那行檢查。
- 因為 VS Code 開場時也是 `null`，所以只排除 `terminal`：排除 `null` 會讓 VS Code 也沒有畫圖工具。代價是指令列模式（`-p`）與 SDK 主控的對話仍有工具，但沒有畫面可畫。

### 未驗證
- 真正在終端機開的對話裡，工具確實沒有出現：只有自動測試，沒有開終端機實測。

---

## 修改：Repo 改為公開（同日）

### 執行的動作
- 使用者把 Repo 改為公開後，檢查兩次提交裡的所有檔案、提交訊息和提交者資料，找個人資訊。
- 找到三處，都在本開發報告：
  - 一個本機路徑（含使用者的名字）
  - 另一個專案的名稱與檔名
  - 使用者的原話
- 依使用者的選擇改寫歷史：
  - 第一次提交改掉上述三處。
  - 第二次提交原樣接上。
  - 強制推上 GitHub。兩次提交的編號因此改變。
- README 的安裝段改成公開 Repo 的寫法；本報告開頭補上「之後改為公開」。

### 驗證
- 改寫後的每一次提交裡，都搜不到上述三處的字串。
- 提交者資料都是 another1124 與 GitHub 的 noreply 信箱。
- 不帶任何帳號也讀得到這個 Repo（公開後實測）。
- `claude plugin test`：6 項全部通過。

- 強制推上去之後，舊提交用編號在 GitHub 上還打得開，所以由使用者刪掉 Repo、重建同名的空公開 Repo，再推上改寫後的歷史。
  - 重建後用完整編號查舊提交：API 回「No commit found」，網頁回 404。
  - 不帶帳號重新抓一份，搜過全部歷史，都沒有上述三處的字串。

### 已知限制
- 公開期間如果已經有人複製走，那些副本不受這次改寫影響。（重建前查過：沒有 fork，也沒有人加星。）

---

## 修改：README 安裝說明（同日）

### 執行的動作
- 安裝段改寫：
  - 命令列安裝放在最前面。
  - 補上「裝好之後」：怎麼確認、誰會有、已開著的對話要重開、只裝在單一專案的兩種範圍。
  - 更新與移除改成表格。

### 驗證
- 在臨時的設定資料夾（不動到既有安裝）依序跑 README 的三個指令：
  - `claude plugin install chat-figure --marketplace another1124/ClaudeChatFigure`：成功。沒有設定 SSH 的電腦會改用 HTTPS 下載。
  - `claude plugin update chat-figure`：回「已是最新版 0.1.0」。
  - `claude plugin uninstall chat-figure`：成功，之後清單裡沒有它。
- 原本已安裝的那份沒有受影響，仍是 enabled。

### 未驗證
- 在 Claude Code 輸入框打 `/plugin install` 的流程：本機只測了命令列。
- `--scope project`、`--scope local` 兩種範圍。
