import fs from 'fs';
import path from 'path';
import { SpecViewerData, DiscoveryBrief } from '../../types/viewer';
import { buildMermaidCard, escapeHtml } from './mermaid-renderer';
import { buildFullHtml } from './dom-template';
import { writeFileSyncSafe } from '../../utils/fs';

export function parseInline(text: string): string {
  if (!text) return '';
  let res = escapeHtml(text);
  res = res.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  res = res.replace(/\*(.*?)\*/g, '<em>$1</em>');
  res = res.replace(/`([^`]+)`/g, '<code class="shadcn-code">$1</code>');
  res = res.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="shadcn-link" target="_blank" rel="noopener noreferrer">$1</a>');
  return res;
}

export function parseMarkdown(content: string, sectionKey: string, sectionTitle: string): string {
  if (!content) return '<p style="color: var(--muted-foreground);">Артефакт не найден или пуст.</p>';

  const lines = content.split(/\r?\n/);
  let html = '';
  let inCodeBlock = false;
  let codeLang = '';
  let codeBuffer: string[] = [];
  let blockIndex = 0;

  let inList = false;
  let listBuffer: string[] = [];

  let inTable = false;
  let tableBuffer: string[] = [];

  let inQuote = false;
  let quoteBuffer: string[] = [];

  function flushList(): void {
    if (inList) {
      html += '<ul class="shadcn-list">\n' + listBuffer.join('\n') + '\n</ul>\n';
      inList = false;
      listBuffer = [];
    }
  }

  function flushQuote(): void {
    if (inQuote) {
      blockIndex++;
      const bId = `${sectionKey}-quote-${blockIndex}`;
      let alertType = 'note';
      let title = 'Примечание';
      const cleanLines = [...quoteBuffer];

      const firstLine = cleanLines[0] || '';
      if (firstLine.startsWith('[!NOTE]')) {
        alertType = 'note';
        title = 'Примечание';
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

  function flushTable(): void {
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
          html += buildMermaidCard(bId, sectionKey, sectionTitle, codeBuffer.join('\n'));
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

    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
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

    const taskMatch = line.match(/^(\s*)-\s+\[([ xX])\]\s+(.+)$/);
    if (taskMatch) {
      flushList();
      blockIndex++;
      const isChecked = taskMatch[2].toLowerCase() === 'x';
      const text = taskMatch[3];
      const bId = `${sectionKey}-task-${blockIndex}`;
      html += `<div class="spec-block task-card ${isChecked ? 'completed' : ''}" id="${bId}" data-block-id="${bId}" data-tab-id="tab-${sectionKey}" data-tab-name="${sectionTitle}">
        <div class="task-left">
          <div class="shadcn-checkbox ${isChecked ? 'checked' : ''}">
            ${isChecked ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
          </div>
          <span class="task-text">${parseInline(text)}</span>
        </div>
        <button class="block-comment-trigger" data-action="comment-trigger" data-block-id="${bId}" data-ref="${escapeHtml(text)}" data-tab-id="tab-${sectionKey}" data-tab-name="${sectionTitle}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          Замечание
        </button>
      </div>\n`;
      continue;
    }

    const listMatch = line.match(/^(\s*)[-*+]\s+(.+)$/);
    if (listMatch) {
      if (!inList) {
        inList = true;
        listBuffer = [];
      }
      blockIndex++;
      const text = listMatch[2];
      const bId = `${sectionKey}-li-${blockIndex}`;
      listBuffer.push(`<li class="spec-block list-item-block" id="${bId}" data-block-id="${bId}" data-tab-id="tab-${sectionKey}" data-tab-name="${sectionTitle}">
        <span>${parseInline(text)}</span>
        <button class="block-comment-trigger" data-action="comment-trigger" data-block-id="${bId}" data-ref="${escapeHtml(text)}" data-tab-id="tab-${sectionKey}" data-tab-name="${sectionTitle}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          Замечание
        </button>
      </li>`);
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

export function generateSpecViewer(targetPath: string = process.cwd()): string {
  let resolvedDir = path.resolve(targetPath);

  if (!fs.existsSync(path.join(resolvedDir, 'tasks.md')) && !fs.existsSync(path.join(resolvedDir, 'explore.md'))) {
    const changesDir = path.join(resolvedDir, 'openspec', 'changes');
    if (fs.existsSync(changesDir)) {
      const entries = fs.readdirSync(changesDir, { withFileTypes: true });
      const activeChange = entries.find(e => e.isDirectory() && e.name !== 'archive');
      if (activeChange) {
        resolvedDir = path.join(changesDir, activeChange.name);
      }
    }
  }

  const changeId = path.basename(resolvedDir);
  const readFile = (filename: string) => {
    const p = path.join(resolvedDir, filename);
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
  };

  const exploreMd = readFile('explore.md');
  const proposalMd = readFile('proposal.md');
  const designMd = readFile('design.md');
  const tasksMd = readFile('tasks.md');

  const discoveryFiles: DiscoveryBrief[] = [];
  const discoveryDir = path.join(resolvedDir, 'discovery');
  if (fs.existsSync(discoveryDir)) {
    const dEntries = fs.readdirSync(discoveryDir, { withFileTypes: true });
    for (const de of dEntries) {
      if (de.isFile() && de.name.endsWith('.md')) {
        const fullP = path.join(discoveryDir, de.name);
        const content = fs.readFileSync(fullP, 'utf8');
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1] : de.name.replace(/^\d+-/, '').replace(/\.md$/, '').replace(/-/g, ' ');
        discoveryFiles.push({
          name: de.name,
          title: title.charAt(0).toUpperCase() + title.slice(1),
          content,
        });
      }
    }
  }

  const totalTasks = (tasksMd.match(/-\s+\[[ xX]\]/g) || []).length;
  const completedTasks = (tasksMd.match(/-\s+\[[xX]\]/g) || []).length;
  const taskPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const data: SpecViewerData = {
    changeId,
    exploreMd,
    proposalMd,
    designMd,
    tasksMd,
    discoveryFiles,
    completedTasks,
    totalTasks,
    taskPercent,
  };

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
    parsedDiscoveryContent = `<div class="discovery-empty-state">
      <div class="empty-icon">🤖</div>
      <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Сабагентные отчёты не найдены</h3>
      <p style="color: var(--muted-foreground); max-width: 500px; margin: 0 auto 1.25rem;">
        При глубоком исследовании кодовой базы сабагенты сохраняют специализированные брифы в папку <code>openspec/changes/${escapeHtml(changeId)}/discovery/*.md</code>.
      </p>
    </div>`;
  }

  const fullHtml = buildFullHtml(data, {
    explore: parsedExplore,
    discovery: parsedDiscoveryContent,
    design: parsedDesign,
    proposal: parsedProposal,
    tasks: parsedTasks,
  });

  const outputPath = path.join(resolvedDir, 'spec-viewer.html');
  writeFileSyncSafe(outputPath, fullHtml, 'utf8');
  return outputPath;
}
