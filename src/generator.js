/**
 * OpenSpec Interactive HTML Spec Viewer Generator Module
 * Generates standalone, zero-dependency shadcn/ui dark interactive HTML report.
 * Supports SSOT Explore, Subagent Discovery Insights, Design, Proposal, Tasks,
 * Task Completion Progress, Interactive Mermaid Diagrams with Pan/Zoom & Fullscreen,
 * and Feedback Export to AI & feedback.md.
 */

const fs = require('fs');
const path = require('path');

function generateSpecViewer(targetDirectory) {
  const resolvedDir = path.resolve(targetDirectory);
  if (!fs.existsSync(resolvedDir)) {
    throw new Error(`Directory not found: ${resolvedDir}`);
  }

  const changeId = path.basename(resolvedDir);

  function readFileSafe(filename) {
    const filePath = path.join(resolvedDir, filename);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
    return null;
  }

  const exploreMd = readFileSafe('explore.md') || '# Explore\n*No explore.md found.*';
  const proposalMd = readFileSafe('proposal.md') || '# Proposal\n*No proposal.md found.*';
  const designMd = readFileSafe('design.md') || '# Design\n*No design.md found.*';
  const tasksMd = readFileSafe('tasks.md') || '# Tasks\n*No tasks.md found.*';

  // Read subagent discovery briefs if available
  const discoveryDir = path.join(resolvedDir, 'discovery');
  let discoveryFiles = [];
  if (fs.existsSync(discoveryDir)) {
    try {
      discoveryFiles = fs.readdirSync(discoveryDir)
        .filter(f => f.endsWith('.md'))
        .sort()
        .map(f => ({
          name: f,
          title: f.replace(/^\d+[-_]?/, '').replace(/\.md$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          content: fs.readFileSync(path.join(discoveryDir, f), 'utf8')
        }));
    } catch (e) {
      discoveryFiles = [];
    }
  }

  // Calculate task completion progress
  let totalTasks = 0;
  let completedTasks = 0;
  const taskMatches = tasksMd.matchAll(/-\s+\[([ xX])\]/g);
  for (const match of taskMatches) {
    totalTasks++;
    if (match[1].toLowerCase() === 'x') completedTasks++;
  }
  const taskPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  function parseMarkdown(md, sectionKey, sectionTitle) {
    const lines = md.split('\n');
    let html = '';
    let inCodeBlock = false;
    let codeLang = '';
    let codeBuffer = [];
    let inTable = false;
    let tableBuffer = [];
    let inQuote = false;
    let quoteBuffer = [];
    let listType = null;
    let blockIndex = 0;

    function flushList() {
      if (listType === 'tasks') {
        html += '</div>\n';
        listType = null;
      } else if (listType === 'standard') {
        html += '</ul>\n';
        listType = null;
      }
    }

    function flushQuote() {
      if (inQuote && quoteBuffer.length > 0) {
        blockIndex++;
        const bId = `${sectionKey}-quote-${blockIndex}`;
        let alertType = 'note';
        let title = 'Справка';
        let cleanLines = [...quoteBuffer];
        const firstLine = cleanLines[0].trim();

        if (firstLine.startsWith('[!NOTE]')) {
          alertType = 'note';
          title = 'Справка';
          cleanLines[0] = firstLine.replace('[!NOTE]', '').trim();
        } else if (firstLine.startsWith('[!IMPORTANT]')) {
          alertType = 'important';
          title = 'Важно';
          cleanLines[0] = firstLine.replace('[!IMPORTANT]', '').trim();
        } else if (firstLine.startsWith('[!WARNING]')) {
          alertType = 'warning';
          title = 'Внимание';
          cleanLines[0] = firstLine.replace('[!WARNING]', '').trim();
        } else if (firstLine.startsWith('[!TIP]')) {
          alertType = 'note';
          title = 'Совет';
          cleanLines[0] = firstLine.replace('[!TIP]', '').trim();
        }

        const contentText = cleanLines.filter(l => l.length > 0).join(' ');

        html += `<div class="spec-block alert alert-${alertType}" id="${bId}" data-block-id="${bId}" data-tab-id="tab-${sectionKey}" data-tab-name="${sectionTitle}">
          <div class="alert-content">
            <svg class="alert-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            <div class="alert-body">
              <span class="alert-title">${escapeHtml(title)}:</span>
              <span class="alert-text">${parseInline(contentText)}</span>
            </div>
          </div>
          <button class="block-comment-trigger" data-action="comment-trigger" data-block-id="${bId}" data-ref="${escapeHtml(title)}: ${escapeHtml(contentText.substring(0, 50))}" data-tab-id="tab-${sectionKey}" data-tab-name="${sectionTitle}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Замечание
          </button>
        </div>\n`;

        inQuote = false;
        quoteBuffer = [];
      }
    }

    function flushTable() {
      if (inTable) {
        html += '<div class="table-wrapper"><table class="shadcn-table">\n';
        tableBuffer.forEach((row, rIdx) => {
          const cols = row.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1).map(c => c.trim());
          if (rIdx === 0) {
            html += '<thead><tr>' + cols.map(c => `<th>${escapeHtml(c)}</th>`).join('') + '</tr></thead>\n<tbody>\n';
          } else if (rIdx === 1 && cols.every(c => /^:?-+:?$/.test(c))) {
            // separator
          } else {
            html += '<tr>' + cols.map(c => `<td>${parseInline(c)}</td>`).join('') + '</tr>\n';
          }
        });
        html += '</tbody></table></div>\n';
        inTable = false;
        tableBuffer = [];
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('>')) {
        flushList();
        flushTable();
        inQuote = true;
        quoteBuffer.push(line.replace(/^>\s*/, ''));
        continue;
      } else if (inQuote) {
        flushQuote();
      }

      if (line.startsWith('```')) {
        if (inCodeBlock) {
          blockIndex++;
          const bId = `${sectionKey}-block-${blockIndex}`;
          const isTextarea = (!codeLang || codeLang === 'text' || codeLang === 'prompt' || codeLang === 'raw');
          const isMermaid = (codeLang === 'mermaid');
          
          if (isMermaid) {
            html += `<div class="spec-block mermaid-card" id="${bId}" data-block-id="${bId}" data-tab-id="tab-${sectionKey}" data-tab-name="${sectionTitle}">
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
                  <div class="mermaid" id="mermaid-raw-${bId}">${escapeHtml(codeBuffer.join('\n'))}</div>
                </div>
              </div>
              <div class="mermaid-card-footer">
                <span>💡 Колесико мыши: масштаб • Перетаскивание: перемещение • Кнопка <b>⛶ На весь экран</b> для максимального обзора</span>
              </div>
            </div>\n`;
          } else if (isTextarea) {
            html += `<div class="spec-block prompt-textarea-card" id="${bId}" data-block-id="${bId}" data-tab-id="tab-${sectionKey}" data-tab-name="${sectionTitle}">
              <div class="textarea-header">
                <span class="textarea-badge">Исходный запрос / Промпт</span>
                <button class="block-comment-trigger" data-action="comment-trigger" data-block-id="${bId}" data-ref="Промпт: ${escapeHtml(codeBuffer.join(' ').substring(0, 50))}" data-tab-id="tab-${sectionKey}" data-tab-name="${sectionTitle}">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  Замечание
                </button>
              </div>
              <textarea class="shadcn-content-textarea" readonly>${escapeHtml(codeBuffer.join('\n'))}</textarea>
            </div>\n`;
          } else {
            html += `<div class="spec-block code-card" id="${bId}" data-block-id="${bId}" data-tab-id="tab-${sectionKey}" data-tab-name="${sectionTitle}">
              <div class="code-card-header">
                <span class="code-lang-badge">${escapeHtml(codeLang)}</span>
                <button class="block-comment-trigger" data-action="comment-trigger" data-block-id="${bId}" data-ref="Код: ${escapeHtml(codeLang)}" data-tab-id="tab-${sectionKey}" data-tab-name="${sectionTitle}">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  Замечание
                </button>
              </div>
              <pre><code class="language-${codeLang}">${escapeHtml(codeBuffer.join('\n'))}</code></pre>
            </div>\n`;
          }
          inCodeBlock = false;
          codeBuffer = [];
        } else {
          flushList();
          flushTable();
          inCodeBlock = true;
          codeLang = line.replace(/^```/, '').trim();
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        flushList();
        inTable = true;
        tableBuffer.push(line.trim());
        continue;
      } else if (inTable) {
        flushTable();
      }

      if (/^---{1,}$/.test(line.trim())) {
        flushList();
        html += '<hr class="shadcn-divider" />\n';
        continue;
      }

      const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        flushList();
        blockIndex++;
        const level = headingMatch[1].length;
        const text = headingMatch[2];
        const bId = `${sectionKey}-heading-${blockIndex}`;
        html += `<div class="spec-block heading-block" id="${bId}" data-block-id="${bId}" data-tab-id="tab-${sectionKey}" data-tab-name="${sectionTitle}">
          <h${level}>${parseInline(text)}</h${level}>
          <button class="block-comment-trigger" data-action="comment-trigger" data-block-id="${bId}" data-ref="${escapeHtml(text)}" data-tab-id="tab-${sectionKey}" data-tab-name="${sectionTitle}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Замечание
          </button>
        </div>\n`;
        continue;
      }

      const taskMatch = line.match(/^(\s*)-\s+\[([ xX])\]\s+(.*)$/);
      if (taskMatch) {
        if (listType !== 'tasks') {
          flushList();
          html += '<div class="tasks-group">\n';
          listType = 'tasks';
        }
        blockIndex++;
        const isChecked = taskMatch[2].toLowerCase() === 'x';
        const text = taskMatch[3];
        const bId = `${sectionKey}-task-${blockIndex}`;
        html += `<div class="spec-block task-card ${isChecked ? 'completed' : ''}" id="${bId}" data-block-id="${bId}" data-tab-id="tab-${sectionKey}" data-tab-name="${sectionTitle}">
          <div class="task-left">
            <div class="shadcn-checkbox ${isChecked ? 'checked' : ''}">
              ${isChecked ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
            </div>
            <span class="task-text">${parseInline(text)}</span>
          </div>
          <button class="block-comment-trigger" data-action="comment-trigger" data-block-id="${bId}" data-ref="Задача: ${escapeHtml(text)}" data-tab-id="tab-${sectionKey}" data-tab-name="${sectionTitle}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Замечание
          </button>
        </div>\n`;
        continue;
      }

      const listMatch = line.match(/^(\s*)-\s+(.*)$/);
      if (listMatch) {
        if (listType !== 'standard') {
          flushList();
          html += '<ul class="shadcn-list">\n';
          listType = 'standard';
        }
        blockIndex++;
        const text = listMatch[2];
        const bId = `${sectionKey}-li-${blockIndex}`;
        html += `<li class="spec-block list-item-block" id="${bId}" data-block-id="${bId}" data-tab-id="tab-${sectionKey}" data-tab-name="${sectionTitle}">
          <span>${parseInline(text)}</span>
          <button class="block-comment-trigger" data-action="comment-trigger" data-block-id="${bId}" data-ref="${escapeHtml(text)}" data-tab-id="tab-${sectionKey}" data-tab-name="${sectionTitle}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Замечание
          </button>
        </li>\n`;
        continue;
      }

      if (line.trim().length > 0) {
        flushList();
        blockIndex++;
        const bId = `${sectionKey}-p-${blockIndex}`;
        html += `<div class="spec-block paragraph-block" id="${bId}" data-block-id="${bId}" data-tab-id="tab-${sectionKey}" data-tab-name="${sectionTitle}">
          <p>${parseInline(line)}</p>
          <button class="block-comment-trigger" data-action="comment-trigger" data-block-id="${bId}" data-ref="${escapeHtml(line.trim().substring(0, 60)) + '...'}" data-tab-id="tab-${sectionKey}" data-tab-name="${sectionTitle}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Замечание
          </button>
        </div>\n`;
        continue;
      }
    }

    flushQuote();
    flushList();
    flushTable();
    return html;
  }

  function parseInline(text) {
    if (!text) return '';
    let res = escapeHtml(text);
    res = res.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    res = res.replace(/\*(.*?)\*/g, '<em>$1</em>');
    res = res.replace(/`([^`]+)`/g, '<code class="shadcn-code">$1</code>');
    res = res.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="shadcn-link" target="_blank" rel="noopener noreferrer">$1</a>');
    return res;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  const parsedExplore = parseMarkdown(exploreMd, 'explore', 'Explore (SSOT)');
  const parsedProposal = parseMarkdown(proposalMd, 'proposal', 'Proposal');
  const parsedDesign = parseMarkdown(designMd, 'design', 'Design');
  const parsedTasks = parseMarkdown(tasksMd, 'tasks', 'Tasks');

  let parsedDiscoveryContent = '';
  if (discoveryFiles.length > 0) {
    parsedDiscoveryContent = discoveryFiles.map((df, idx) => {
      const parsedFile = parseMarkdown(df.content, `disc-${idx}`, `Discovery: ${df.title}`);
      return `<div class="discovery-section-card" style="margin-bottom: 2rem;">
        <div class="discovery-section-header">
          <span class="discovery-section-badge">🤖 Сабагент / ${escapeHtml(df.name)}</span>
          <h2 style="margin: 0.35rem 0 0.75rem; border-bottom: none; font-size: 1.15rem;">${escapeHtml(df.title)}</h2>
        </div>
        <div class="discovery-section-body">
          ${parsedFile}
        </div>
      </div>`;
    }).join('\n<hr class="shadcn-divider" />\n');
  } else {
    parsedDiscoveryContent = `
      <div class="discovery-empty-state">
        <div class="empty-icon">🤖</div>
        <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Сабагентные отчёты не найдены</h3>
        <p style="color: var(--muted-foreground); max-width: 500px; margin: 0 auto 1.25rem;">
          При глубоком исследовании кодовой базы сабагенты сохраняют специализированные брифы в папку <code>openspec/changes/${escapeHtml(changeId)}/discovery/*.md</code>.
        </p>
        <div class="code-card" style="text-align: left; max-width: 550px; margin: 0 auto;">
          <div class="code-card-header"><span class="code-lang-badge">Структура discovery/</span></div>
          <pre><code>openspec/changes/${escapeHtml(changeId)}/
├── explore.md                # Сводный SSOT
└── discovery/                # Брифы сабагентов
    ├── 01-architecture.md    # Карта модулей
    ├── 02-data-contracts.md  # Аудит схемы БД и API
    └── 03-blast-radius.md    # Оценка рисков</code></pre>
        </div>
      </div>
    `;
  }

  const fullHtml = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OpenSpec — ${changeId}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <style>
    :root {
      --background: #09090b;
      --foreground: #fafafa;
      --card: #09090b;
      --card-inner: #121215;
      --card-foreground: #fafafa;
      --popover: #09090b;
      --popover-foreground: #fafafa;
      --primary: #fafafa;
      --primary-foreground: #18181b;
      --secondary: #27272a;
      --secondary-foreground: #fafafa;
      --muted: #18181b;
      --muted-foreground: #a1a1aa;
      --accent: #27272a;
      --accent-foreground: #fafafa;
      --destructive: #7f1d1d;
      --destructive-foreground: #fef2f2;
      --border: #27272a;
      --border-subtle: #1e1e24;
      --input: #27272a;
      --ring: #d4d4d8;
      --radius: 8px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    html, body {
      width: 100%;
      min-height: 100vh;
      background-color: var(--background);
      color: var(--foreground);
      font-family: 'Geist', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
      display: flex;
      flex-direction: column;
      -webkit-font-smoothing: antialiased;
    }

    header {
      width: 100%;
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(9, 9, 11, 0.95);
      border-bottom: 1px solid var(--border);
      backdrop-filter: blur(12px);
      padding: 0.75rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
    }

    .header-left { display: flex; align-items: center; gap: 1rem; }
    .brand-logo { display: flex; align-items: center; gap: 0.6rem; font-weight: 600; font-size: 0.95rem; color: var(--foreground); text-decoration: none; }
    .logo-icon { width: 22px; height: 22px; background: var(--foreground); color: var(--background); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; }
    .badge-change { display: inline-flex; align-items: center; background: #18181b; border: 1px solid var(--border); color: var(--muted-foreground); padding: 0.2rem 0.65rem; border-radius: 9999px; font-family: 'Geist Mono', monospace; font-size: 0.75rem; font-weight: 500; letter-spacing: -0.2px; }

    .header-right { display: flex; align-items: center; gap: 1rem; }
    .badge-progress-container {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      background: #18181b;
      border: 1px solid var(--border);
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      min-width: 140px;
    }
    .badge-progress-text { font-size: 0.725rem; font-weight: 500; color: var(--muted-foreground); font-family: 'Geist Mono', monospace; display: flex; justify-content: space-between; }
    .badge-progress-track { width: 100%; height: 4px; background: #27272a; border-radius: 9999px; overflow: hidden; }
    .badge-progress-fill { height: 100%; background: #10b981; border-radius: 9999px; transition: width 0.3s ease; }

    .btn {
      appearance: none;
      -webkit-appearance: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      padding: 0.45rem 0.9rem;
      border-radius: calc(var(--radius) - 2px);
      font-size: 0.825rem;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid var(--border);
      background: var(--background);
      color: var(--foreground);
      transition: all 0.15s ease;
      font-family: inherit;
      text-decoration: none;
      white-space: nowrap;
      outline: none;
    }
    .btn:hover { background: var(--secondary); color: var(--foreground); }
    .btn-primary { background: var(--primary); color: var(--primary-foreground); border-color: var(--primary); font-weight: 600; }
    .btn-primary:hover { background: #e4e4e7; border-color: #e4e4e7; color: var(--primary-foreground); }
    .btn-outline { background: transparent; border-color: var(--border); color: var(--muted-foreground); }
    .btn-outline:hover { background: var(--secondary); color: var(--foreground); border-color: #3f3f46; }
    .btn-ghost { background: transparent; border-color: transparent; color: var(--muted-foreground); padding: 0.35rem 0.65rem; }
    .btn-ghost:hover { background: var(--secondary); color: var(--foreground); }
    .btn-danger { color: #f87171; border-color: transparent; background: transparent; }
    .btn-danger:hover { background: rgba(127, 29, 29, 0.2); color: #fca5a5; }

    .badge-count {
      background: #27272a;
      color: #fafafa;
      font-size: 0.7rem;
      padding: 0.05rem 0.45rem;
      border-radius: 9999px;
      font-family: 'Geist Mono', monospace;
      margin-left: 0.3rem;
      border: 1px solid #3f3f46;
    }

    .main-container {
      width: 100%;
      padding: 1.5rem 2rem;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      gap: 2rem;
      align-items: flex-start;
      box-sizing: border-box;
      flex: 1;
    }

    .content-column {
      flex: 1 1 auto;
      min-width: 0;
      max-width: calc(100% - 470px);
    }

    .tabs-nav-wrapper {
      display: inline-flex;
      background: #18181b;
      padding: 4px;
      border-radius: 8px;
      border: 1px solid #27272a;
      margin-bottom: 1.5rem;
      gap: 4px;
      flex-wrap: wrap;
    }

    .tab-trigger {
      appearance: none;
      -webkit-appearance: none;
      background: transparent;
      border: 1px solid transparent;
      outline: none;
      padding: 6px 14px;
      font-size: 0.85rem;
      font-weight: 500;
      color: #a1a1aa;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      user-select: none;
      font-family: inherit;
    }
    .tab-trigger svg { opacity: 0.7; }
    .tab-trigger:hover { color: #fafafa; background: rgba(255, 255, 255, 0.05); }
    .tab-trigger.active { background: #09090b; color: #fafafa; font-weight: 600; border-color: #27272a; box-shadow: 0 1px 3px rgba(0,0,0,0.5); }
    .tab-trigger.active svg { opacity: 1; }

    .spec-card {
      background: var(--card-inner);
      border: 1px solid var(--border);
      border-radius: calc(var(--radius) + 2px);
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }

    .tab-panel { display: none; animation: fadeIn 0.15s ease-out; }
    .tab-panel.active { display: block; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }

    .spec-block {
      position: relative;
      margin: 0.75rem 0;
      border-radius: calc(var(--radius) - 2px);
      transition: all 0.2s ease;
    }
    .spec-block.has-comments {
      border-left: 2px solid #eab308;
      padding-left: 0.75rem;
      background: rgba(234, 179, 8, 0.03);
      border-radius: 0 4px 4px 0;
    }
    .spec-block.highlight-pulse { animation: blockFlash 1.5s ease-in-out; }
    @keyframes blockFlash { 0% { background: rgba(250, 250, 250, 0.15); box-shadow: 0 0 0 2px #fafafa; } 100% { background: transparent; box-shadow: none; } }

    .block-comment-trigger {
      appearance: none;
      -webkit-appearance: none;
      opacity: 0;
      position: absolute;
      right: 0.4rem;
      top: -0.5rem;
      background: #18181b;
      border: 1px solid var(--border);
      color: var(--muted-foreground);
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.2rem 0.5rem;
      border-radius: 5px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.15s ease;
      z-index: 10;
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      font-family: inherit;
    }
    .spec-block:hover .block-comment-trigger { opacity: 1; }
    .block-comment-trigger:hover { background: var(--secondary); color: var(--foreground); border-color: #3f3f46; }

    .block-comment-trigger-static {
      appearance: none;
      -webkit-appearance: none;
      background: #18181b;
      border: 1px solid var(--border);
      color: var(--muted-foreground);
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.25rem 0.6rem;
      border-radius: 5px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.15s ease;
      font-family: inherit;
    }
    .block-comment-trigger-static:hover { background: var(--secondary); color: var(--foreground); border-color: #3f3f46; }

    h1, h2, h3, h4 { color: var(--foreground); font-weight: 600; letter-spacing: -0.02em; }
    h1 { font-size: 1.6rem; margin-bottom: 0.75rem; font-weight: 700; letter-spacing: -0.03em; }
    h2 { font-size: 1.2rem; margin: 1.75rem 0 0.85rem; padding-bottom: 0.35rem; border-bottom: 1px solid var(--border-subtle); }
    h3 { font-size: 0.975rem; margin: 1.25rem 0 0.5rem; color: #e4e4e7; }
    p { color: #d4d4d8; font-size: 0.9rem; margin-bottom: 0.75rem; line-height: 1.65; }

    .shadcn-code { font-family: 'Geist Mono', monospace; background: #18181b; border: 1px solid var(--border); padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.825em; color: #f4f4f5; }
    .shadcn-link { color: #fafafa; text-decoration: underline; text-underline-offset: 4px; }
    .shadcn-link:hover { color: #a1a1aa; }
    .shadcn-divider { border: none; border-top: 1px solid var(--border-subtle); margin: 1.75rem 0; }

    .prompt-textarea-card { background: #09090b; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; margin: 1.25rem 0; }
    .textarea-header { background: #121215; border-bottom: 1px solid var(--border); padding: 0.45rem 0.85rem; display: flex; justify-content: space-between; align-items: center; }
    .textarea-badge { font-size: 0.75rem; font-weight: 500; color: var(--muted-foreground); }
    .shadcn-content-textarea { width: 100%; min-height: 130px; background: #09090b; border: none; color: #fafafa; padding: 0.85rem 1rem; font-family: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 0.875rem; line-height: 1.65; resize: vertical; outline: none; box-sizing: border-box; }
    .shadcn-content-textarea:focus { background: #0c0c0e; }

    .code-card { background: #09090b; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; margin: 1rem 0; }
    .code-card-header { background: #121215; border-bottom: 1px solid var(--border); padding: 0.4rem 0.85rem; display: flex; justify-content: space-between; align-items: center; }
    .code-lang-badge { font-family: 'Geist Mono', monospace; font-size: 0.725rem; color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.5px; }
    pre { padding: 1rem; overflow-x: auto; font-family: 'Geist Mono', monospace; font-size: 0.85rem; color: #e4e4e7; line-height: 1.6; }

    /* Interactive Mermaid Card */
    .mermaid-card { background: #09090b; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; margin: 1.25rem 0; }
    .mermaid-header-left { display: flex; align-items: center; gap: 0.5rem; }
    .mermaid-header-actions { display: flex; align-items: center; gap: 0.35rem; }
    .diagram-btn { font-size: 0.75rem; padding: 0.2rem 0.55rem; color: var(--muted-foreground); }
    .diagram-btn:hover { color: #fafafa; background: #27272a; }
    .btn-fullscreen-trigger { color: #38bdf8 !important; border: 1px solid rgba(56, 189, 248, 0.2) !important; background: rgba(56, 189, 248, 0.05) !important; }
    .btn-fullscreen-trigger:hover { background: rgba(56, 189, 248, 0.15) !important; color: #7dd3fc !important; }

    .mermaid-viewport {
      width: 100%;
      min-height: 360px;
      max-height: 520px;
      overflow: hidden;
      position: relative;
      background: radial-gradient(circle, #18181b 1px, #09090b 1px);
      background-size: 24px 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: grab;
      user-select: none;
    }
    .mermaid-viewport:active { cursor: grabbing; }
    .mermaid-canvas {
      transform-origin: center center;
      transition: transform 0.05s ease-out;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1.5rem;
    }
    .mermaid-canvas svg { max-width: none !important; height: auto !important; }
    .mermaid-card-footer {
      background: #121215;
      border-top: 1px solid var(--border);
      padding: 0.4rem 0.85rem;
      font-size: 0.725rem;
      color: var(--muted-foreground);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* Fullscreen Diagram Modal */
    .diagram-modal-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.88);
      backdrop-filter: blur(8px);
      z-index: 150;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      box-sizing: border-box;
    }
    .diagram-modal-backdrop.active { display: flex !important; }
    .diagram-modal-container {
      background: #09090b;
      border: 1px solid var(--border);
      border-radius: calc(var(--radius) + 4px);
      width: 95vw;
      height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
      animation: dialogScale 0.15s ease-out;
    }
    .diagram-modal-header {
      background: #121215;
      border-bottom: 1px solid var(--border);
      padding: 0.75rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .diagram-modal-title { font-size: 0.95rem; font-weight: 600; color: #fafafa; display: flex; align-items: center; gap: 0.5rem; }
    .diagram-modal-toolbar { display: flex; align-items: center; gap: 0.5rem; }
    .diagram-modal-viewport {
      flex: 1;
      width: 100%;
      height: 100%;
      overflow: hidden;
      position: relative;
      background: radial-gradient(circle, #1e1e24 1.2px, #09090b 1.2px);
      background-size: 28px 28px;
      cursor: grab;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .diagram-modal-viewport:active { cursor: grabbing; }
    .diagram-modal-canvas {
      transform-origin: center center;
      transition: transform 0.05s ease-out;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
    }
    .diagram-modal-canvas svg { max-width: none !important; height: auto !important; }
    .diagram-modal-footer {
      background: #121215;
      border-top: 1px solid var(--border);
      padding: 0.5rem 1.25rem;
      font-size: 0.75rem;
      color: var(--muted-foreground);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .tasks-group { display: flex; flex-direction: column; gap: 0.5rem; margin: 0.85rem 0; }
    .task-card { display: flex; align-items: center; justify-content: space-between; background: #121215; border: 1px solid var(--border); border-radius: calc(var(--radius) - 2px); padding: 0.65rem 0.85rem; transition: border-color 0.15s ease; }
    .task-card:hover { border-color: #3f3f46; }
    .task-card.completed { opacity: 0.6; }
    .task-card.completed .task-text { text-decoration: line-through; color: var(--muted-foreground); }
    .task-left { display: flex; align-items: center; gap: 0.75rem; flex: 1; }
    .shadcn-checkbox { width: 16px; height: 16px; border-radius: 4px; border: 1px solid var(--muted-foreground); display: flex; align-items: center; justify-content: center; background: transparent; flex-shrink: 0; }
    .shadcn-checkbox.checked { background: var(--primary); border-color: var(--primary); color: var(--primary-foreground); }
    .task-text { font-size: 0.875rem; color: #fafafa; }

    .shadcn-list { margin-left: 1.25rem; margin-bottom: 0.75rem; color: #d4d4d8; font-size: 0.9rem; }
    .list-item-block { margin: 0.35rem 0; }

    .table-wrapper { overflow-x: auto; margin: 1.25rem 0; border: 1px solid var(--border); border-radius: var(--radius); }
    .shadcn-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left; }
    .shadcn-table th { background: #121215; color: var(--muted-foreground); font-weight: 500; padding: 0.65rem 0.9rem; border-bottom: 1px solid var(--border); }
    .shadcn-table td { padding: 0.65rem 0.9rem; border-bottom: 1px solid var(--border-subtle); color: #d4d4d8; }
    .shadcn-table tr:last-child td { border-bottom: none; }

    .alert { display: flex; align-items: flex-start; justify-content: space-between; padding: 0.75rem 1rem; border-radius: var(--radius); border: 1px solid var(--border); background: #0d0d10; margin: 1rem 0; gap: 1rem; }
    .alert-content { display: flex; align-items: flex-start; gap: 0.65rem; font-size: 0.85rem; color: #d4d4d8; line-height: 1.55; }
    .alert-icon { color: #a1a1aa; margin-top: 0.15rem; flex-shrink: 0; }
    .alert-body { display: flex; flex-direction: row; flex-wrap: wrap; gap: 0.35rem; align-items: baseline; }
    .alert-title { font-weight: 600; color: #fafafa; }
    .alert-text { color: #a1a1aa; }
    .alert-important { border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.04); }
    .alert-important .alert-icon { color: #f87171; }
    .alert-important .alert-title { color: #fca5a5; }
    .alert-warning { border-color: rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.04); }
    .alert-warning .alert-icon { color: #fbbf24; }
    .alert-warning .alert-title { color: #fde68a; }

    .discovery-section-card { background: #0d0d10; border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; }
    .discovery-section-badge { display: inline-flex; align-items: center; background: #18181b; border: 1px solid var(--border); color: #38bdf8; font-size: 0.75rem; padding: 0.15rem 0.5rem; border-radius: 4px; font-family: 'Geist Mono', monospace; }
    .discovery-empty-state { text-align: center; padding: 3rem 1.5rem; }
    .empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }

    .sidebar-wrapper {
      width: 440px;
      min-width: 440px;
      position: sticky;
      top: 75px;
      display: flex;
      flex-direction: column;
      height: calc(100vh - 95px);
      background: var(--card-inner);
      border: 1px solid var(--border);
      border-radius: calc(var(--radius) + 2px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
      flex-shrink: 0;
      z-index: 20;
    }

    .sidebar-header { padding: 1rem 1.25rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; background: #121215; }
    .sidebar-title { font-size: 0.925rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; color: #fafafa; }
    .sidebar-filter-bar { display: flex; padding: 0.5rem 1rem; gap: 0.35rem; border-bottom: 1px solid var(--border); background: #09090b; }
    .filter-pill { appearance: none; -webkit-appearance: none; flex: 1; padding: 0.3rem 0.4rem; font-size: 0.75rem; border-radius: 4px; border: 1px solid transparent; background: transparent; color: var(--muted-foreground); cursor: pointer; text-align: center; font-family: inherit; transition: all 0.15s ease; outline: none; }
    .filter-pill.active { background: #1e1e24; color: #fafafa; border-color: #2e2e38; font-weight: 500; }
    .sidebar-scroll-content { flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }

    .comment-item { background: #09090b; border: 1px solid var(--border); border-radius: var(--radius); padding: 0.85rem; font-size: 0.825rem; transition: all 0.15s ease; display: flex; flex-direction: column; gap: 0.4rem; }
    .comment-item:hover { border-color: #3f3f46; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
    .comment-item.resolved { opacity: 0.55; border-left: 3px solid #10b981; }
    .comment-header { display: flex; justify-content: space-between; align-items: center; font-size: 0.725rem; color: var(--muted-foreground); }
    .comment-tag-badge { display: inline-flex; align-items: center; background: #18181b; border: 1px solid var(--border); color: #38bdf8; padding: 0.1rem 0.45rem; border-radius: 4px; font-family: 'Geist Mono', monospace; font-size: 0.7rem; }
    .comment-quote { background: #18181b; border-left: 2px solid #52525b; padding: 0.25rem 0.5rem; font-size: 0.775rem; color: #a1a1aa; border-radius: 0 4px 4px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .comment-text { color: #fafafa; line-height: 1.5; white-space: pre-wrap; font-size: 0.85rem; }
    .comment-actions { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 0.5rem; margin-top: 0.25rem; }
    .comment-actions-left { display: flex; gap: 0.35rem; }
    .sidebar-footer { padding: 0.85rem 1.25rem; border-top: 1px solid var(--border); background: #09090b; }
    .sidebar-footer-actions { display: flex; gap: 0.5rem; }

    .dialog-backdrop { display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(4px); z-index: 100; align-items: center; justify-content: center; }
    .dialog-backdrop.active { display: flex !important; }
    .dialog-container { background: #09090b; border: 1px solid var(--border); border-radius: calc(var(--radius) + 4px); width: 100%; max-width: 520px; padding: 1.5rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); animation: dialogScale 0.15s ease-out; }
    @keyframes dialogScale { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
    .dialog-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .dialog-title { font-size: 1.05rem; font-weight: 600; color: #fafafa; }
    .shadcn-textarea { width: 100%; height: 120px; background: #121215; border: 1px solid var(--border); border-radius: var(--radius); color: #fafafa; padding: 0.75rem; font-family: inherit; font-size: 0.875rem; resize: vertical; margin-bottom: 1rem; }
    .shadcn-textarea:focus { outline: none; border-color: #52525b; box-shadow: 0 0 0 1px #52525b; }
    .dialog-footer { display: flex; justify-content: flex-end; gap: 0.5rem; }

    .shadcn-toast { position: fixed; bottom: 1.5rem; right: 1.5rem; background: #fafafa; color: #09090b; padding: 0.65rem 1.15rem; border-radius: var(--radius); font-size: 0.85rem; font-weight: 500; box-shadow: 0 10px 30px rgba(0,0,0,0.6); display: none; z-index: 200; animation: toastSlide 0.2s ease-out; }
    @keyframes toastSlide { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  </style>
</head>
<body>

  <header>
    <div class="header-left">
      <a href="#" class="brand-logo">
        <div class="logo-icon">▲</div>
        <span>OpenSpec</span>
      </a>
      <span class="badge-change">${escapeHtml(changeId)}</span>
    </div>
    <div class="header-right">
      <div class="badge-progress-container" title="Прогресс выполнения задач: ${completedTasks}/${totalTasks}">
        <div class="badge-progress-text">
          <span>Задачи:</span>
          <span>${completedTasks}/${totalTasks} (${taskPercent}%)</span>
        </div>
        <div class="badge-progress-track">
          <div class="badge-progress-fill" style="width: ${taskPercent}%;"></div>
        </div>
      </div>
    </div>
  </header>

  <div class="main-container">
    <div class="content-column">
      <div class="tabs-nav-wrapper">
        <button class="tab-trigger active" data-tab="tab-explore" onclick="switchTab('tab-explore')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <span>Explore (SSOT)</span>
        </button>
        <button class="tab-trigger" data-tab="tab-discovery" onclick="switchTab('tab-discovery')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
          <span>Discovery Insights ${discoveryFiles.length > 0 ? `<span class="badge-count">${discoveryFiles.length}</span>` : ''}</span>
        </button>
        <button class="tab-trigger" data-tab="tab-design" onclick="switchTab('tab-design')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
          <span>Design</span>
        </button>
        <button class="tab-trigger" data-tab="tab-proposal" onclick="switchTab('tab-proposal')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span>Proposal</span>
        </button>
        <button class="tab-trigger" data-tab="tab-tasks" onclick="switchTab('tab-tasks')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
          <span>Tasks</span>
        </button>
      </div>

      <div class="spec-card">
        <div id="tab-explore" class="tab-panel active">
          ${parsedExplore}
        </div>
        <div id="tab-discovery" class="tab-panel">
          ${parsedDiscoveryContent}
        </div>
        <div id="tab-design" class="tab-panel">
          ${parsedDesign}
        </div>
        <div id="tab-proposal" class="tab-panel">
          ${parsedProposal}
        </div>
        <div id="tab-tasks" class="tab-panel">
          ${parsedTasks}
        </div>
      </div>
    </div>

    <aside class="sidebar-wrapper">
      <div class="sidebar-header">
        <div class="sidebar-title">
          <span>💬 Замечания и правки</span>
          <span id="comments-count" class="badge-count">0</span>
        </div>
        <button class="btn btn-ghost" style="font-size: 0.75rem;" onclick="clearAllComments()">Очистить все</button>
      </div>

      <div class="sidebar-filter-bar">
        <button class="filter-pill active" onclick="setCommentFilter('open', this)">Открытые</button>
        <button class="filter-pill" onclick="setCommentFilter('resolved', this)">Решенные</button>
        <button class="filter-pill" onclick="setCommentFilter('all', this)">Все</button>
      </div>

      <div id="comments-list" class="sidebar-scroll-content"></div>

      <div class="sidebar-footer">
        <div class="sidebar-footer-actions">
          <button class="btn btn-primary" style="flex: 1;" onclick="exportFeedbackForAi()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Скопировать для ИИ
          </button>
          <button class="btn btn-outline" title="Скачать feedback.md" onclick="downloadFeedbackMarkdown()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          </button>
        </div>
      </div>
    </aside>
  </div>

  <!-- Fullscreen Diagram Modal -->
  <div id="diagram-modal" class="diagram-modal-backdrop">
    <div class="diagram-modal-container">
      <div class="diagram-modal-header">
        <div class="diagram-modal-title">
          <span>⛶ Интерактивный просмотр схемы</span>
          <span id="modal-zoom-badge" class="badge-count">100%</span>
        </div>
        <div class="diagram-modal-toolbar">
          <button class="btn btn-outline diagram-btn" onclick="zoomFullscreenDiagram(1.25)" title="Приблизить">🔍 +</button>
          <button class="btn btn-outline diagram-btn" onclick="zoomFullscreenDiagram(0.8)" title="Отдалить">🔍 -</button>
          <button class="btn btn-outline diagram-btn" onclick="resetFullscreenDiagram()" title="Сбросить масштаб (1:1)">1:1</button>
          <button class="btn btn-primary diagram-btn" onclick="fitFullscreenDiagram()" title="Вписать в экран">Вписать</button>
          <button class="btn btn-ghost" onclick="closeDiagramFullscreen()" style="padding: 0.2rem 0.6rem; font-size: 1.1rem;" title="Закрыть (Esc)">✕</button>
        </div>
      </div>
      <div class="diagram-modal-viewport" id="diagram-modal-viewport">
        <div class="diagram-modal-canvas" id="diagram-modal-canvas"></div>
      </div>
      <div class="diagram-modal-footer">
        <span>💡 <b>Перетаскивание</b> мышью для перемещения • <b>Колесико мыши</b> для зума • <b>Esc</b> для выхода</span>
        <button class="btn btn-outline" style="font-size: 0.75rem; padding: 0.2rem 0.6rem;" onclick="closeDiagramFullscreen()">Закрыть</button>
      </div>
    </div>
  </div>

  <div id="comment-dialog" class="dialog-backdrop">
    <div class="dialog-container">
      <div class="dialog-header">
        <div id="dialog-title-text" class="dialog-title">Оставить замечание</div>
        <button class="btn btn-ghost" style="padding: 0.2rem 0.5rem;" type="button" onclick="closeCommentModal()">✕</button>
      </div>
      <div id="modal-ref-preview" class="comment-quote" style="display:none; margin-bottom: 0.75rem;"></div>
      <textarea id="modal-comment-text" class="shadcn-textarea" placeholder="Напишите замечание или требование по изменению... (Ctrl+Enter для сохранения)"></textarea>
      <div class="dialog-footer">
        <button class="btn btn-outline" type="button" onclick="closeCommentModal()">Отмена</button>
        <button class="btn btn-primary" type="button" onclick="saveComment()">Сохранить</button>
      </div>
    </div>
  </div>

  <div id="export-dialog" class="dialog-backdrop">
    <div class="dialog-container" style="max-width: 620px;">
      <div class="dialog-header">
        <div class="dialog-title">Скопировать комментарии для ИИ</div>
        <button class="btn btn-ghost" style="padding: 0.2rem 0.5rem;" type="button" onclick="closeExportModal()">✕</button>
      </div>
      <p style="font-size: 0.825rem; color: var(--muted-foreground); margin-bottom: 0.75rem;">
        Скопируйте этот текст и отправьте в чат ассистенту для внесения изменений:
      </p>
      <textarea id="export-textarea" class="shadcn-textarea" style="height: 200px; font-family: 'Geist Mono', monospace; font-size: 0.8rem;" readonly></textarea>
      <div class="dialog-footer">
        <button class="btn btn-outline" type="button" onclick="closeExportModal()">Закрыть</button>
        <button class="btn btn-primary" type="button" onclick="copyExportTextarea()">Скопировать в буфер</button>
      </div>
    </div>
  </div>

  <div id="toast" class="shadcn-toast">✓ Скопировано в буфер обмена</div>

  <script>
    const STORAGE_KEY = 'openspec_comments_${changeId}';
    let currentBlockId = null;
    let currentRefSnippet = null;
    let currentTabId = 'tab-explore';
    let currentTabName = 'Explore (SSOT)';
    let editingCommentId = null;
    let currentFilter = 'open';

    // Interactive Diagram State Map
    const diagramStates = {};
    const fullscreenState = {
      scale: 1,
      panX: 0,
      panY: 0,
      isDragging: false,
      startX: 0,
      startY: 0
    };

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function getComments() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }

    function saveCommentsToStorage(comments) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
      } catch (e) {
        console.error('Failed to save to localStorage', e);
      }
      renderComments();
      updateBlockHighlights();
    }

    // --- Diagram Pan & Zoom Engine ---
    function getDiagramState(blockId) {
      if (!diagramStates[blockId]) {
        diagramStates[blockId] = {
          scale: 1,
          panX: 0,
          panY: 0,
          isDragging: false,
          startX: 0,
          startY: 0
        };
      }
      return diagramStates[blockId];
    }

    function applyDiagramTransform(blockId) {
      const state = getDiagramState(blockId);
      const canvas = document.getElementById('canvas-' + blockId);
      if (canvas) {
        canvas.style.transform = 'translate(' + state.panX + 'px, ' + state.panY + 'px) scale(' + state.scale + ')';
      }
    }

    function zoomInlineDiagram(blockId, factor) {
      const state = getDiagramState(blockId);
      state.scale = Math.min(Math.max(state.scale * factor, 0.2), 5);
      applyDiagramTransform(blockId);
    }

    function resetInlineDiagram(blockId) {
      const state = getDiagramState(blockId);
      state.scale = 1;
      state.panX = 0;
      state.panY = 0;
      applyDiagramTransform(blockId);
    }

    function setupInlinePanZoom(viewport) {
      const blockId = viewport.getAttribute('data-block-id');
      const state = getDiagramState(blockId);

      viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.15 : 0.87;
        state.scale = Math.min(Math.max(state.scale * factor, 0.2), 5);
        applyDiagramTransform(blockId);
      }, { passive: false });

      viewport.addEventListener('mousedown', (e) => {
        if (e.target.closest('button')) return;
        state.isDragging = true;
        state.startX = e.clientX - state.panX;
        state.startY = e.clientY - state.panY;
      });

      window.addEventListener('mousemove', (e) => {
        if (!state.isDragging) return;
        state.panX = e.clientX - state.startX;
        state.panY = e.clientY - state.startY;
        applyDiagramTransform(blockId);
      });

      window.addEventListener('mouseup', () => {
        state.isDragging = false;
      });
    }

    // --- Fullscreen Diagram Modal Engine ---
    function openDiagramFullscreen(blockId) {
      const canvas = document.getElementById('canvas-' + blockId);
      if (!canvas) return;

      const modal = document.getElementById('diagram-modal');
      const modalCanvas = document.getElementById('diagram-modal-canvas');
      if (!modal || !modalCanvas) return;

      modalCanvas.innerHTML = canvas.innerHTML;
      fullscreenState.scale = 1;
      fullscreenState.panX = 0;
      fullscreenState.panY = 0;
      updateFullscreenTransform();

      modal.classList.add('active');
      modal.style.display = 'flex';
      setTimeout(fitFullscreenDiagram, 50);
    }

    function closeDiagramFullscreen() {
      const modal = document.getElementById('diagram-modal');
      if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
      }
    }

    function updateFullscreenTransform() {
      const canvas = document.getElementById('diagram-modal-canvas');
      const badge = document.getElementById('modal-zoom-badge');
      if (canvas) {
        canvas.style.transform = 'translate(' + fullscreenState.panX + 'px, ' + fullscreenState.panY + 'px) scale(' + fullscreenState.scale + ')';
      }
      if (badge) {
        badge.innerText = Math.round(fullscreenState.scale * 100) + '%';
      }
    }

    function zoomFullscreenDiagram(factor) {
      fullscreenState.scale = Math.min(Math.max(fullscreenState.scale * factor, 0.15), 6);
      updateFullscreenTransform();
    }

    function resetFullscreenDiagram() {
      fullscreenState.scale = 1;
      fullscreenState.panX = 0;
      fullscreenState.panY = 0;
      updateFullscreenTransform();
    }

    function fitFullscreenDiagram() {
      const viewport = document.getElementById('diagram-modal-viewport');
      const canvas = document.getElementById('diagram-modal-canvas');
      const svg = canvas ? canvas.querySelector('svg') : null;
      if (!viewport || !svg) return;

      const vRect = viewport.getBoundingClientRect();
      const sRect = svg.getBoundingClientRect();
      const scaleX = (vRect.width - 60) / (svg.clientWidth || sRect.width || 800);
      const scaleY = (vRect.height - 60) / (svg.clientHeight || sRect.height || 600);
      fullscreenState.scale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.3), 2.5);
      fullscreenState.panX = 0;
      fullscreenState.panY = 0;
      updateFullscreenTransform();
    }

    function setupFullscreenPanZoom() {
      const viewport = document.getElementById('diagram-modal-viewport');
      if (!viewport) return;

      viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.15 : 0.87;
        zoomFullscreenDiagram(factor);
      }, { passive: false });

      viewport.addEventListener('mousedown', (e) => {
        if (e.target.closest('button')) return;
        fullscreenState.isDragging = true;
        fullscreenState.startX = e.clientX - fullscreenState.panX;
        fullscreenState.startY = e.clientY - fullscreenState.panY;
      });

      window.addEventListener('mousemove', (e) => {
        if (!fullscreenState.isDragging) return;
        fullscreenState.panX = e.clientX - fullscreenState.startX;
        fullscreenState.panY = e.clientY - fullscreenState.startY;
        updateFullscreenTransform();
      });

      window.addEventListener('mouseup', () => {
        fullscreenState.isDragging = false;
      });
    }

    // --- Mermaid Rendering Engine ---
    function renderMermaidInCurrentTab() {
      if (!window.mermaid) return;
      const activePanel = document.querySelector('.tab-panel.active');
      if (!activePanel) return;

      const mermaidNodes = activePanel.querySelectorAll('.mermaid:not([data-processed="true"])');
      if (mermaidNodes.length === 0) return;

      mermaidNodes.forEach((node, idx) => {
        const rawCode = node.textContent.trim();
        const uniqueId = 'mermaid-svg-' + Date.now() + '-' + idx;
        try {
          mermaid.render(uniqueId, rawCode).then(({ svg }) => {
            node.innerHTML = svg;
            node.setAttribute('data-processed', 'true');
          }).catch(err => {
            console.warn('Mermaid rendering warning:', err);
            node.setAttribute('data-processed', 'true');
            const strayErr = document.getElementById('d' + uniqueId);
            if (strayErr) strayErr.remove();
            node.innerHTML = '<div style="color:#f87171; font-size:0.75rem; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); padding:0.6rem; border-radius:6px; margin-bottom:0.65rem;">⚠️ Ошибка парсинга схемы Mermaid. Исходный код:</div><pre style="margin:0;"><code class="language-mermaid">' + escapeHtml(rawCode) + '</code></pre>';
          });
        } catch (e) {
          node.setAttribute('data-processed', 'true');
          node.innerHTML = '<pre style="margin:0;"><code class="language-mermaid">' + escapeHtml(rawCode) + '</code></pre>';
        }
      });
    }

    function switchTab(tabId) {
      document.querySelectorAll('.tab-trigger').forEach(tab => tab.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(content => content.classList.remove('active'));

      const activeBtn = document.querySelector('[data-tab="' + tabId + '"]');
      if (activeBtn) activeBtn.classList.add('active');

      const targetContent = document.getElementById(tabId);
      if (targetContent) {
        targetContent.classList.add('active');
        setTimeout(renderMermaidInCurrentTab, 30);
      }
    }

    function setCommentFilter(filter, btn) {
      currentFilter = filter;
      document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      renderComments();
    }

    function openCommentModal(blockId, refSnippet, tabId, tabName) {
      editingCommentId = null;
      currentBlockId = blockId || 'general';
      currentRefSnippet = refSnippet || '';
      currentTabId = tabId || 'tab-explore';
      currentTabName = tabName || 'Explore';

      const titleEl = document.getElementById('dialog-title-text');
      if (titleEl) titleEl.innerText = 'Оставить замечание';

      const refPreview = document.getElementById('modal-ref-preview');
      if (refPreview) {
        if (refSnippet) {
          refPreview.innerText = refSnippet;
          refPreview.style.display = 'block';
        } else {
          refPreview.style.display = 'none';
        }
      }

      const input = document.getElementById('modal-comment-text');
      if (input) input.value = '';

      const dialog = document.getElementById('comment-dialog');
      if (dialog) {
        dialog.classList.add('active');
        dialog.style.display = 'flex';
      }

      if (input) setTimeout(() => input.focus(), 50);
    }

    function openEditCommentModal(id) {
      const comments = getComments();
      const item = comments.find(c => c.id === id);
      if (!item) return;

      editingCommentId = id;
      currentBlockId = item.blockId;
      currentRefSnippet = item.refText;
      currentTabId = item.tabId || 'tab-explore';
      currentTabName = item.tabName || 'Explore';

      const titleEl = document.getElementById('dialog-title-text');
      if (titleEl) titleEl.innerText = 'Редактировать замечание';

      const refPreview = document.getElementById('modal-ref-preview');
      if (refPreview) {
        if (item.refText) {
          refPreview.innerText = item.refText;
          refPreview.style.display = 'block';
        } else {
          refPreview.style.display = 'none';
        }
      }

      const input = document.getElementById('modal-comment-text');
      if (input) input.value = item.text || '';

      const dialog = document.getElementById('comment-dialog');
      if (dialog) {
        dialog.classList.add('active');
        dialog.style.display = 'flex';
      }

      if (input) setTimeout(() => input.focus(), 50);
    }

    function closeCommentModal() {
      const dialog = document.getElementById('comment-dialog');
      if (dialog) {
        dialog.classList.remove('active');
        dialog.style.display = 'none';
      }
      const input = document.getElementById('modal-comment-text');
      if (input) input.value = '';
      currentBlockId = null;
      currentRefSnippet = null;
      editingCommentId = null;
    }

    function saveComment() {
      const input = document.getElementById('modal-comment-text');
      if (!input) return;
      const text = input.value.trim();
      if (!text) {
        alert('Пожалуйста, введите текст замечания');
        return;
      }

      let comments = getComments();

      if (editingCommentId) {
        const item = comments.find(c => c.id === editingCommentId);
        if (item) {
          item.text = text;
          item.timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (ред.)';
        }
      } else {
        comments.push({
          id: 'c_' + Date.now(),
          blockId: currentBlockId || 'general',
          tabId: currentTabId || 'tab-explore',
          tabName: currentTabName || 'Explore',
          refText: currentRefSnippet || '',
          text: text,
          status: 'open',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }

      const wasEditing = editingCommentId;
      closeCommentModal();
      saveCommentsToStorage(comments);
      showToast(wasEditing ? '✓ Замечание обновлено' : '✓ Замечание добавлено');
    }

    function toggleCommentStatus(id) {
      const comments = getComments();
      const item = comments.find(c => c.id === id);
      if (item) {
        item.status = item.status === 'open' ? 'resolved' : 'open';
        saveCommentsToStorage(comments);
      }
    }

    function deleteComment(id) {
      if (confirm('Удалить это замечание?')) {
        let comments = getComments();
        comments = comments.filter(c => c.id !== id);
        saveCommentsToStorage(comments);
        showToast('✓ Замечание удалено');
      }
    }

    function clearAllComments() {
      if (confirm('Очистить ВСЕ замечания для этого изменения?')) {
        saveCommentsToStorage([]);
        showToast('✓ Все замечания очищены');
      }
    }

    function jumpToBlock(tabId, blockId) {
      if (tabId) switchTab(tabId);
      setTimeout(() => {
        const el = document.getElementById(blockId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('highlight-pulse');
          setTimeout(() => el.classList.remove('highlight-pulse'), 1600);
        }
      }, 100);
    }

    function renderComments() {
      const listContainer = document.getElementById('comments-list');
      const countBadge = document.getElementById('comments-count');
      if (!listContainer || !countBadge) return;

      const allComments = getComments();
      countBadge.innerText = allComments.filter(c => c.status === 'open').length;

      let filtered = allComments;
      if (currentFilter === 'open') {
        filtered = allComments.filter(c => c.status === 'open');
      } else if (currentFilter === 'resolved') {
        filtered = allComments.filter(c => c.status === 'resolved');
      }

      if (filtered.length === 0) {
        listContainer.innerHTML = '<div style="color: var(--muted-foreground); font-size: 0.825rem; text-align: center; margin-top: 3.5rem; line-height: 1.6;">' +
          (currentFilter === 'open' ? 'Нет открытых замечаний.' : 'Нет комментариев.') + '<br>' +
          '<span style="font-size: 0.75rem; color: #71717a;">Нажмите «Замечание» у любого пункта документа, чтобы добавить правку.</span>' +
        '</div>';
        return;
      }

      listContainer.innerHTML = '';
      filtered.forEach(c => {
        const card = document.createElement('div');
        card.className = 'comment-item ' + (c.status === 'resolved' ? 'resolved' : '');

        const header = document.createElement('div');
        header.className = 'comment-header';
        header.innerHTML = '<span class="comment-tag-badge">' + escapeHtml(c.tabName || 'Спецификация') + '</span>' +
                           '<span>' + escapeHtml(c.timestamp) + '</span>';
        card.appendChild(header);

        if (c.refText) {
          const quote = document.createElement('div');
          quote.className = 'comment-quote';
          quote.title = c.refText;
          quote.innerText = c.refText;
          card.appendChild(quote);
        }

        const body = document.createElement('div');
        body.className = 'comment-text';
        body.innerText = c.text;
        card.appendChild(body);

        const actions = document.createElement('div');
        actions.className = 'comment-actions';

        const actionsLeft = document.createElement('div');
        actionsLeft.className = 'comment-actions-left';

        const jumpBtn = document.createElement('button');
        jumpBtn.className = 'btn btn-outline';
        jumpBtn.style.padding = '0.2rem 0.5rem';
        jumpBtn.style.fontSize = '0.725rem';
        jumpBtn.innerText = '🎯 Перейти';
        jumpBtn.onclick = () => jumpToBlock(c.tabId, c.blockId);
        actionsLeft.appendChild(jumpBtn);

        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-ghost';
        editBtn.style.padding = '0.2rem 0.4rem';
        editBtn.style.fontSize = '0.725rem';
        editBtn.innerText = '✏️';
        editBtn.title = 'Редактировать';
        editBtn.onclick = () => openEditCommentModal(c.id);
        actionsLeft.appendChild(editBtn);

        actions.appendChild(actionsLeft);

        const actionsRight = document.createElement('div');
        actionsRight.style.display = 'flex';
        actionsRight.style.gap = '0.35rem';

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'btn btn-ghost';
        toggleBtn.style.padding = '0.2rem 0.5rem';
        toggleBtn.style.fontSize = '0.725rem';
        toggleBtn.innerText = c.status === 'open' ? '✓ Решено' : '↩ Открыть';
        toggleBtn.onclick = () => toggleCommentStatus(c.id);
        actionsRight.appendChild(toggleBtn);

        const delBtn = document.createElement('button');
        delBtn.className = 'btn btn-danger';
        delBtn.style.padding = '0.2rem 0.4rem';
        delBtn.style.fontSize = '0.725rem';
        delBtn.innerText = '🗑';
        delBtn.title = 'Удалить';
        delBtn.onclick = () => deleteComment(c.id);
        actionsRight.appendChild(delBtn);

        actions.appendChild(actionsRight);
        card.appendChild(actions);

        listContainer.appendChild(card);
      });
    }

    function updateBlockHighlights() {
      const comments = getComments().filter(c => c.status === 'open');
      const commentedBlockIds = new Set(comments.map(c => c.blockId));

      document.querySelectorAll('.spec-block').forEach(el => {
        const bId = el.getAttribute('data-block-id');
        if (commentedBlockIds.has(bId)) {
          el.classList.add('has-comments');
        } else {
          el.classList.remove('has-comments');
        }
      });
    }

    function generateExportMarkdown() {
      const comments = getComments();
      const openComments = comments.filter(c => c.status === 'open');
      const targetComments = openComments.length > 0 ? openComments : comments;

      if (targetComments.length === 0) return '';

      let markdown = '### 📋 Замечания к спецификации OpenSpec: ' + '${changeId}' + '\\n\\n';
      markdown += 'Внесите правки ТОЛЬКО в следующие блоки, где были оставлены замечания:\\n\\n';

      targetComments.forEach((c, idx) => {
        markdown += (idx + 1) + '. **[' + (c.tabName || 'Спецификация') + ']** (Блок: \`' + c.blockId + '\`)\\n';
        if (c.refText) markdown += '   - **Контекст / Текст блока**: "' + c.refText + '"\\n';
        markdown += '   - **Замечание пользователя**: ' + c.text + '\\n\\n';
      });

      markdown += '---\\n';
      markdown += '**Инструкция для ИИ**:\\n';
      markdown += '1. Обновите соответствующие файлы (\`explore.md\`, \`proposal.md\`, \`design.md\`, \`tasks.md\`, \`discovery/\`) только в указанных выше блоках.\\n';
      markdown += '2. Автоматически пересоберите \`spec-viewer.html\`: \`npx openspec-ex view openspec/changes/' + '${changeId}' + '\`\\n';

      return markdown;
    }

    function exportFeedbackForAi() {
      const comments = getComments();
      if (comments.length === 0) {
        alert('Нет комментариев для экспорта. Добавьте замечания перед экспортом.');
        return;
      }

      const markdown = generateExportMarkdown();

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(markdown).then(() => {
          showToast('✓ Комментарии скопированы в буфер');
        }).catch(() => {
          openExportModal(markdown);
        });
      } else {
        openExportModal(markdown);
      }
    }

    function downloadFeedbackMarkdown() {
      const markdown = generateExportMarkdown();
      if (!markdown) {
        alert('Нет замечаний для экспорта. Добавьте замечания перед сохранением.');
        return;
      }
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'feedback.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('✓ Файл feedback.md скачан');
    }

    function openExportModal(text) {
      const textarea = document.getElementById('export-textarea');
      if (textarea) textarea.value = text;
      const dialog = document.getElementById('export-dialog');
      if (dialog) {
        dialog.classList.add('active');
        dialog.style.display = 'flex';
      }
    }

    function closeExportModal() {
      const dialog = document.getElementById('export-dialog');
      if (dialog) {
        dialog.classList.remove('active');
        dialog.style.display = 'none';
      }
    }

    function copyExportTextarea() {
      const textarea = document.getElementById('export-textarea');
      if (textarea) {
        textarea.select();
        document.execCommand('copy');
      }
      closeExportModal();
      showToast('✓ Комментарии скопированы в буфер');
    }

    function showToast(msg) {
      const toast = document.getElementById('toast');
      if (!toast) return;
      toast.innerText = msg;
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 2500);
    }

    document.addEventListener('DOMContentLoaded', () => {
      if (window.mermaid) {
        try {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'loose',
            darkMode: true,
            themeVariables: {
              darkMode: true,
              background: '#09090b',
              primaryColor: '#18181b',
              primaryTextColor: '#fafafa',
              primaryBorderColor: '#3f3f46',
              lineColor: '#a1a1aa',
              secondaryColor: '#121215',
              tertiaryColor: '#27272a'
            }
          });
        } catch (e) {
          console.warn('Mermaid init error:', e);
        }
      }

      // Initialize Pan & Zoom on all inline viewports
      document.querySelectorAll('.mermaid-viewport').forEach(vp => {
        setupInlinePanZoom(vp);
      });

      // Initialize Fullscreen Modal Pan & Zoom
      setupFullscreenPanZoom();

      document.body.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-action="comment-trigger"]');
        if (trigger) {
          const bId = trigger.getAttribute('data-block-id');
          const ref = trigger.getAttribute('data-ref');
          const tabId = trigger.getAttribute('data-tab-id');
          const tabName = trigger.getAttribute('data-tab-name');
          openCommentModal(bId, ref, tabId, tabName);
        }

        if (e.target.id === 'comment-dialog') closeCommentModal();
        if (e.target.id === 'export-dialog') closeExportModal();
        if (e.target.id === 'diagram-modal') closeDiagramFullscreen();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeCommentModal();
          closeExportModal();
          closeDiagramFullscreen();
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
          const dialog = document.getElementById('comment-dialog');
          if (dialog && (dialog.classList.contains('active') || dialog.style.display === 'flex')) {
            saveComment();
          }
        }
      });

      renderComments();
      updateBlockHighlights();
      renderMermaidInCurrentTab();
    });
  </script>
</body>
</html>`;

  const outputPath = path.join(resolvedDir, 'spec-viewer.html');
  fs.writeFileSync(outputPath, fullHtml, 'utf8');
  return outputPath;
}

module.exports = {
  generateSpecViewer
};
