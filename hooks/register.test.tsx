import { expect, test } from 'claude-code/testing'

// chat-figure 的測試：工具輸入的檢查，以及 draw_figure 那一行底下有沒有畫出 Svg。

/** Claude 呼叫時用的完整工具名稱。 */
const FULL_NAME = 'mcp__chat-figure__draw_figure'
/** 一份最小、合法的 SVG。 */
const SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><rect width="40" height="20" fill="#2b6cb0"/></svg>'

/**
 * 組一個 ToolUse 的掛載參數。
 * @param surface 要畫在哪個介面
 * @param tool 這一行是哪個工具
 * @param input 這次呼叫的輸入
 * @returns 給 $.ui.mount 的參數
 */
function toolRow(surface: 'terminal' | 'desktop' | 'vscode' | 'mobile', tool: string, input: unknown) {
  return {
    plugin: 'chat-figure',
    surface,
    component: 'ToolUse',
    requestId: 'toolu_test',
    props: {
      tool_use_id: 'toolu_test',
      tool,
      input,
      isRunning: false,
      isErrored: false,
      isInterrupted: false,
      output: '已在對話裡畫出「測試」。',
    },
  } as const
}

test('開場：VS Code、桌面版、手機版、沒有介面的對話都登記畫圖工具', async ($, on) => {
  let registered = 0
  on('tool.register', () => {
    registered += 1
    return { value: { tool: FULL_NAME } }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  for (const surface of ['vscode', 'desktop', 'mobile', null] as const) {
    await $.session.start({ cwd: '/', surface, isInteractive: surface !== null })
  }
  expect(registered).toBe(4)
})

test('開場：終端機的對話不登記畫圖工具', async ($, on) => {
  let registered = 0
  on('tool.register', () => {
    registered += 1
    return { value: { tool: FULL_NAME } }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  expect(registered).toBe(0)
})

test('合法的輸入：工具回一句話給 Claude', async ($, on) => {
  on('tool.register', () => ({ value: { tool: FULL_NAME } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '/', surface: 'vscode', isInteractive: true })

  const ran = await $.tool.call({ tool: FULL_NAME, title: '測試', svg: SVG, alt: '一個藍色方塊' })
  expect(ran.deny).toBeUndefined()
  expect(String(ran.result)).toContain('測試')
})

test('不是 SVG 的輸入：拒絕並說原因', async ($, on) => {
  on('tool.register', () => ({ value: { tool: FULL_NAME } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '/', surface: 'vscode', isInteractive: true })

  const ran = await $.tool.call({ tool: FULL_NAME, title: '測試', svg: 'hello', alt: '不是圖' })
  expect(ran.deny).toContain('<svg')
})

test('有 Svg 元件的介面：那一行底下畫出圖', async $ => {
  for (const surface of ['vscode', 'desktop', 'mobile'] as const) {
    const ui = await $.ui.mount(toolRow(surface, FULL_NAME, { title: '測試', svg: SVG, alt: '一個藍色方塊' }))
    const figure = await ui.find({ type: 'Svg' })
    expect(figure).toBeDefined()
    await ui.unmount()
  }
})

test('終端機與別的工具：不畫圖', async $ => {
  const terminal = await $.ui.mount(toolRow('terminal', FULL_NAME, { title: '測試', svg: SVG, alt: '一個藍色方塊' }))
  expect(await terminal.find({ type: 'Svg' })).toBeUndefined()
  await terminal.unmount()

  const other = await $.ui.mount(toolRow('vscode', 'Bash', { command: 'ls' }))
  expect(await other.find({ type: 'Svg' })).toBeUndefined()
  await other.unmount()
})
