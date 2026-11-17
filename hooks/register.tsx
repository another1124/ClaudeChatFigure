import type { Register } from 'claude-code'

// chat-figure：讓 Claude 在對話裡畫圖。
//
// 外掛登記一個工具 draw_figure，Claude 呼叫時傳入完整的 SVG 原始碼。
// 工具本身只檢查輸入、回一句話給 Claude；圖是 ui.render 在這次呼叫那一行底下畫的。
// 沒有 Svg 元件的介面（終端機）照原樣只畫那一行。

/** 外掛登記的工具短名。 */
const TOOL = 'draw_figure'
/** Claude 呼叫時用的完整名稱：mcp__<外掛名>__<工具短名>。 */
const FULL_NAME = 'mcp__chat-figure__draw_figure'
/** Svg 元件收的原始碼上限（字元），跟引擎的上限一致。 */
const MAX_SVG_CHARS = 131072

/** draw_figure 的輸入。 */
type FigureInput = {
  /** 圖的標題，一句話。 */
  title: string
  /** 完整的 SVG 原始碼，<svg ...>...</svg>。 */
  svg: string
  /** 這張圖在講什麼的文字描述：看不到圖的介面顯示它，也留在對話紀錄裡。 */
  alt: string
}

/**
 * 把一個值當成 draw_figure 的輸入讀出來；欄位不齊就回 null。
 * @param value 工具呼叫或工具那一行帶的輸入
 * @returns 讀好的輸入，或 null
 */
function readFigure(value: unknown): FigureInput | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }
  const record = value as Record<string, unknown>
  const { title, svg, alt } = record
  if (typeof title !== 'string' || typeof svg !== 'string' || typeof alt !== 'string') {
    return null
  }
  return { title, svg, alt }
}

/**
 * 檢查輸入能不能畫；能畫回 null，不能畫回給 Claude 看的原因。
 * @param figure 讀好的輸入（null 表示欄位不齊）
 * @returns 錯誤原因，或 null
 */
function problemOf(figure: FigureInput | null): string | null {
  if (figure === null) {
    return 'draw_figure 需要 title、svg、alt 三個文字欄位。'
  }
  const svg = figure.svg.trim()
  if (!/^<svg[\s>]/i.test(svg) || !/<\/svg>$/i.test(svg)) {
    return 'svg 要是一份完整的 SVG 原始碼：<svg ...> 開頭、</svg> 結尾。'
  }
  if (svg.length > MAX_SVG_CHARS) {
    return `svg 有 ${svg.length} 字元，超過上限 ${MAX_SVG_CHARS}。請簡化圖（減少點數或元素）再畫。`
  }
  return null
}

export const register: Register = on => {
  // 開場登記工具。isDeferred: false 讓工具的說明一開始就在 Claude 的工具清單裡，
  // 不必先用 ToolSearch 載入，Claude 才會知道自己能畫圖。
  on('session.start', async ($, e, next) => {
    await $.tool.register({
      name: TOOL,
      description:
        '在對話裡畫一張圖給使用者看。用在圖比文字好懂的時候：流程、架構、時序、數據曲線、比較。' +
        '傳入完整的 SVG 原始碼（<svg ...>...</svg>，最多 131072 字元），圖會畫在這次呼叫那一行底下。' +
        'SVG 請自帶不透明的背景，在深色與淺色主題下都看得清楚；中文字型用 Microsoft JhengHei 這類系統字型。' +
        '使用者看到的是這張圖本身，工具不會把畫好的樣子傳回來。',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: '圖的標題，一句話。' },
          svg: { type: 'string', description: '完整的 SVG 原始碼，<svg ...> 開頭、</svg> 結尾。' },
          alt: {
            type: 'string',
            description: '這張圖在講什麼的文字描述。看不到圖的介面會顯示它，之後回頭看對話紀錄也讀得到。',
          },
        },
        required: ['title', 'svg', 'alt'],
      },
      isDeferred: false,
    })

    return next(e)
  })

  // 回應工具呼叫：輸入不對就拒絕並說原因；對的話回一句話給 Claude。
  // 圖不在這裡畫，由下面的 ui.render 畫在這一行底下。
  on('tool.call', { tool: FULL_NAME }, ($, e) => {
    const figure = readFigure(e)
    const problem = problemOf(figure)
    if (problem !== null || figure === null) {
      return { deny: problem ?? 'draw_figure 的輸入不對。' }
    }

    return { result: `已在對話裡畫出「${figure.title}」（SVG ${figure.svg.length} 字元）。` }
  }).catch(() => ({ deny: 'chat-figure：畫圖工具自己出錯了，這張圖沒有畫出來。' }))

  // 在 draw_figure 那一行底下畫出 SVG；其他工具、還在跑的、出錯的、終端機都照原樣。
  on('ui.render', { component: 'ToolUse' }, async ($, e, next) => {
    if (e.props.tool !== FULL_NAME || e.props.isRunning || e.props.isErrored || e.surface === 'terminal') {
      return next(e)
    }
    const figure = readFigure(e.props.input)
    if (figure === null || problemOf(figure) !== null) {
      return next(e)
    }
    const row = await next(e)
    const { Box, Svg } = $.ui.resolve(e)

    return (
      <Box flexDirection="column">
        {row}
        <Svg source={figure.svg.trim()} alt={figure.alt} />
      </Box>
    )
  })
}
