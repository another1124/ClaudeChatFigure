# Claude Chat Figure

讓 Claude 在聊天視窗裡畫圖給你看。

Claude Code 的聊天視窗不會顯示 Claude 回覆裡的圖片。這個外掛給 Claude 一個「畫圖」工具：
Claude 需要用圖說明時，把圖寫成 SVG（用文字描述一張圖的格式）交給工具，
圖就畫在聊天視窗裡、這次工具呼叫的那一行底下。

## 在哪裡看得到圖

| 介面 | 結果 |
|---|---|
| VS Code 擴充套件（2.1.299 以上） | 畫出圖（已實測） |
| 桌面版、手機版 | 官方文件寫支援，沒有實測 |
| 終端機 | 沒有畫圖工具：終端機畫不出 SVG，所以在終端機開的對話裡不登記這個工具 |
| 指令列模式（`claude -p`）、程式（SDK）主控的對話 | 有畫圖工具，但沒有畫面可以畫 |

最後一列沒有排除，是因為 VS Code 擴充套件的對話在開場時，跟指令列模式一樣看不到自己接在哪個介面，
排除它們就會連 VS Code 也沒有畫圖工具。

## 安裝

這是私人 Repo：要有 `another1124/ClaudeChatFigure` 的讀取權限，
電腦上也要已經登入過 GitHub（安裝過程不會問帳號密碼）。

在終端機開的 Claude Code 輸入框打：

```
/plugin install chat-figure --marketplace another1124/ClaudeChatFigure
```

或在命令列打：

```
claude plugin install chat-figure --marketplace another1124/ClaudeChatFigure
```

問要不要加入 marketplace 時按 `y`，範圍選使用者層級（user）。之後這台電腦開的每個新對話都有畫圖工具。

更新：`claude plugin update chat-figure`（更新後要重開 Claude Code 才生效）。
移除：`claude plugin uninstall chat-figure`。

## Claude 怎麼用它

- 對話一開始，畫圖工具（`draw_figure`）連同說明就在 Claude 的工具清單裡，所以 Claude 知道自己能畫圖。
- 你也可以直接說「畫一張圖說明……」。
- 工具收三個欄位：

| 欄位 | 內容 |
|---|---|
| `title` | 圖的標題，一句話 |
| `svg` | 完整的 SVG 原始碼，`<svg ...>` 開頭、`</svg>` 結尾，最多 131,072 字元 |
| `alt` | 這張圖在講什麼的文字描述：看不到圖的介面顯示它，之後回頭看對話紀錄也讀得到 |

SVG 不完整或超過上限時，工具會退回並說明原因，不會畫出壞掉的圖。

## 限制

- 只能畫 SVG。照片、截圖這類點陣圖不能直接放。
- 工具不會把畫好的樣子傳回給 Claude：Claude 知道自己寫了什麼，但看不到你螢幕上那一張。
- 對話被壓縮之後，Claude 只剩摘要裡寫到的內容，圖本身不會留下。

## 開發

```
claude plugin validate .
claude plugin test .
```

- 程式架構：`Architecture.md`
- 開發報告：`docs/`
