/**
 * Escapes HTML entities.
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Builds the interactive Mermaid card with Pan & Zoom viewport and Fullscreen trigger.
 */
export function buildMermaidCard(bId: string, sectionKey: string, sectionTitle: string, mermaidCode: string): string {
  return `<div class="spec-block mermaid-card" id="${bId}" data-block-id="${bId}" data-tab-id="tab-${sectionKey}" data-tab-name="${sectionTitle}">
  <div class="code-card-header">
    <div class="mermaid-header-left">
      <span class="code-lang-badge">MERMAID DIAGRAM</span>
    </div>
    <div class="mermaid-header-actions">
      <button class="btn btn-ghost diagram-btn" title="Приблизить" onclick="zoomInlineDiagram('${bId}', 1.25)">🔍 +</button>
      <button class="btn btn-ghost diagram-btn" title="Отдалить" onclick="zoomInlineDiagram('${bId}', 0.8)">🔍 -</button>
      <button class="btn btn-ghost diagram-btn" title="Сбросить масштаб" onclick="resetInlineDiagram('${bId}')">1:1</button>
      <button class="btn btn-ghost diagram-btn btn-fullscreen-trigger" title="Развернуть на весь экран" onclick="openDiagramFullscreen('${bId}')">⛶ На весь экран</button>
      <button class="block-comment-trigger-static" data-action="comment-trigger" data-block-id="${bId}" data-ref="Диаграмма Mermaid" data-tab-id="tab-${sectionKey}" data-tab-name="${sectionTitle}">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        Замечание
      </button>
    </div>
  </div>
  <div class="mermaid-viewport" id="viewport-${bId}" data-block-id="${bId}">
    <div class="mermaid-canvas" id="canvas-${bId}">
      <div class="mermaid" id="mermaid-raw-${bId}">${escapeHtml(mermaidCode)}</div>
    </div>
  </div>
  <div class="mermaid-card-footer">
    <span>💡 Колесико мыши: масштаб • Перетаскивание: перемещение • Кнопка <b>⛶ На весь экран</b> для максимального обзора</span>
  </div>
</div>\n`;
}
