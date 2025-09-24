import katex from 'katex';
import htmlToImage from 'node-html-to-image';
import * as fs from 'fs';
import * as path from 'path';
import { marked } from 'marked';
import hljs from 'highlight.js';

export interface LatexRenderOptions {
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  padding?: number;
  lineHeight?: number;
  maxWidth?: number;
  textAlign?: 'left' | 'center' | 'right';
}

export class LatexRenderer {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
    
    // Настройка marked для работы с LaTeX и подсветки синтаксиса
    marked.setOptions({
      breaks: true, // Поддержка переносов строк
      gfm: true, // GitHub Flavored Markdown
    });
  }

  // ⬇️ НОВОЕ: рендер Markdown + LaTeX в изображение
  async renderMarkdownWithLatexToPng(
    markdownText: string,
    options: LatexRenderOptions = {}
  ): Promise<string> {
    const {
      fontSize = 18,
      color = 'black',
      backgroundColor = 'white',
      padding = 15,
      lineHeight = 1.3,
      maxWidth = 900,
      textAlign = 'left',
    } = options;

    // Сначала обрабатываем LaTeX формулы, затем Markdown
    const contentWithLatex = this.buildInlineHtmlFromText(markdownText);
    let htmlContent = await marked.parse(contentWithLatex);
    
    // Добавляем подсветку синтаксиса для блоков кода
    htmlContent = htmlContent.replace(/<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g, (match: string, lang: string, code: string) => {
      try {
        if (hljs.getLanguage(lang)) {
          const highlighted = hljs.highlight(code, { language: lang }).value;
          return `<pre><code class="language-${lang} hljs">${highlighted}</code></pre>`;
        }
      } catch (err) {
        console.warn('Ошибка подсветки синтаксиса:', err);
      }
      return match;
    });

    const filename = `markdown_latex_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 9)}.png`;
    const filepath = path.join(this.tempDir, filename);

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
  <style>
    html, body { margin:0; padding:0; }
    body {
      background: ${backgroundColor};
      color: ${color};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: ${fontSize}px;
      line-height: ${lineHeight};
      padding: ${padding}px;
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      min-height: 100vh;
      width: 100vw;
      box-sizing: border-box;
    }
    .wrap {
      max-width: ${maxWidth}px;
      white-space: pre-wrap;
      word-wrap: break-word;
      text-align: ${textAlign};
    }
    
    /* Markdown стили */
    h1, h2, h3, h4, h5, h6 {
      margin: 0.5em 0 0.2em 0;
      font-weight: bold;
      line-height: 1.2;
    }
    h1 { font-size: 1.8em; border-bottom: 2px solid #eee; padding-bottom: 0.2em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.1em; }
    h3 { font-size: 1.3em; }
    h4 { font-size: 1.1em; }
    h5 { font-size: 1em; }
    h6 { font-size: 0.9em; color: #666; }
    
    p { margin: 0.3em 0; }
    
    ul, ol { margin: 0.3em 0; padding-left: 1.5em; }
    li { margin: 0.2em 0; }
    
    blockquote {
      margin: 0.5em 0;
      padding: 0.3em 0.8em;
      border-left: 4px solid #ddd;
      background: #f9f9f9;
      font-style: italic;
    }
    
    code {
      background: #f4f4f4;
      padding: 0.1em 0.3em;
      border-radius: 3px;
      font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
      font-size: 0.9em;
    }
    
    pre {
      background: #f8f8f8;
      padding: 0.5em;
      border-radius: 5px;
      overflow-x: auto;
      margin: 0.5em 0;
    }
    
    pre code {
      background: none;
      padding: 0;
    }
    
    table {
      border-collapse: collapse;
      margin: 0.5em 0;
      width: 100%;
    }
    
    th, td {
      border: 1px solid #ddd;
      padding: 0.5em;
      text-align: left;
    }
    
    th {
      background: #f5f5f5;
      font-weight: bold;
    }
    
    strong, b { font-weight: bold; }
    em, i { font-style: italic; }
    
    /* LaTeX стили */
    .katex { font-size: ${fontSize}px !important; }
    .katex-display { margin: 0.2em 0; }
  </style>
</head>
<body>
  <div class="wrap">${htmlContent}</div>
</body>
</html>`;

    await htmlToImage({
      html,
      output: filepath,
      type: 'png',
      puppeteerArgs: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    return filepath;
  }

  // ⬇️ НОВОЕ: рендер цельного текста с инлайновыми формулами
  async renderTextWithInlineLatexToPng(
    text: string,
    options: LatexRenderOptions = {}
  ): Promise<string> {
    const {
      fontSize = 18,
      color = 'black',
      backgroundColor = 'white',
      padding = 20,
      lineHeight = 1.4,
      maxWidth = 900,
      textAlign = 'left',
    } = options;

    // Строим HTML, в котором обычный текст остается, а формулы подменяются KaTeX
    const contentHtml = this.buildInlineHtmlFromText(text);

    const filename = `latex_inline_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 9)}.png`;
    const filepath = path.join(this.tempDir, filename);

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <style>
    html, body { margin:0; padding:0; }
    body {
      background: ${backgroundColor};
      color: ${color};
      font-family: "Times New Roman", serif;
      font-size: ${fontSize}px;
      line-height: ${lineHeight};
      padding: ${padding}px;
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      min-height: 100vh;
      width: 100vw;
      box-sizing: border-box;
    }
    .wrap {
      max-width: ${maxWidth}px;
      white-space: pre-wrap; /* сохраняем переносы и пробелы */
      word-wrap: break-word;
      text-align: ${textAlign};
    }
    /* Пусть инлайн формулы ведут себя как текст */
    .katex { font-size: ${fontSize}px !important; }
    .katex-display { margin: 0.35em 0; } /* если попадется блочная */
  </style>
</head>
<body>
  <div class="wrap">${contentHtml}</div>
</body>
</html>`;

    await htmlToImage({
      html,
      output: filepath,
      type: 'png',
      puppeteerArgs: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    return filepath;
  }

  /**
   * СТАРЫЕ МЕТОДЫ — можно оставить как есть
   */
  async renderMultipleLatexToPng(
    formulas: string[],
    options: LatexRenderOptions = {}
  ): Promise<string> {
    const {
      fontSize = 18,
      color = 'black',
      backgroundColor = 'white',
      padding = 20,
    } = options;

    if (formulas.length === 0) {
      throw new Error('Не найдено LaTeX формул в тексте');
    }

    const filename = `latex_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.png`;
    const filepath = path.join(this.tempDir, filename);

    const renderedFormulas = formulas.map((formula) => {
      try {
        const cleanFormula = this.cleanLatex(formula);
        return katex.renderToString(cleanFormula, {
          displayMode: true,
          throwOnError: false,
          output: 'html',
        });
      } catch (error) {
        console.warn(`Ошибка рендеринга формулы "${formula}":`, error);
        return `<span style="color: red;">Ошибка: ${this.htmlEscape(formula)}</span>`;
      }
    });

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <style>
    body {
      margin: 0;
      padding: ${padding}px;
      background-color: ${backgroundColor};
      font-family: 'Times New Roman', serif;
      font-size: ${fontSize}px;
      color: ${color};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      width: 100vw;
    }
    .katex { font-size: ${fontSize}px !important; margin: 10px 0; }
    .katex-display { margin: 10px 0; }
    .formula-container { text-align: center; margin: 5px 0; }
  </style>
</head>
<body>
  ${renderedFormulas
    .map((f) => `<div class="formula-container">${f}</div>`)
    .join('')}
</body>
</html>`;

    await htmlToImage({
      html,
      output: filepath,
      type: 'png',
      puppeteerArgs: { args: ['--no-sandbox', '--disable-setuid-sandbox'] },
    });

    return filepath;
  }

  async renderLatexToPng(
    latex: string,
    options: LatexRenderOptions = {}
  ): Promise<string> {
    const {
      fontSize = 18,
      color = 'black',
      backgroundColor = 'white',
      padding = 20,
    } = options;

    const cleanLatex = this.cleanLatex(latex);
    const filename = `latex_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.png`;
    const filepath = path.join(this.tempDir, filename);

    const isDisplayMode = !cleanLatex.includes('$') && !cleanLatex.includes('\\(');

    const htmlOutput = katex.renderToString(cleanLatex, {
      displayMode: isDisplayMode,
      throwOnError: false,
      output: 'html',
    });

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <style>
    body {
      margin: 0;
      padding: ${padding}px;
      background-color: ${backgroundColor};
      font-family: 'Times New Roman', serif;
      font-size: ${fontSize}px;
      color: ${color};
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      width: 100vw;
    }
    .katex { font-size: ${fontSize}px !important; }
    .katex-display { margin: 0; }
  </style>
</head>
<body>
  ${htmlOutput}
</body>
</html>`;

    await htmlToImage({
      html,
      output: filepath,
      type: 'png',
      puppeteerArgs: { args: ['--no-sandbox', '--disable-setuid-sandbox'] },
    });

    return filepath;
  }

  // ⬇️ Хелперы

  /** Собираем HTML с инлайновыми формулами, сохраняя обычный текст */
  private buildInlineHtmlFromText(text: string): string {
    // Нормализуем «незакрытый $»: превращаем висячий в обычный символ
    // Пример: " ... $\\sqrt{x}$ и еще $" -> последнюю `$` экранируем
    const normalized = this.fixDanglingDollar(text);

    // Паттерны:
    // 1) $$...$$      (display)
    // 2) \[...\]      (display)
    // 3) $...$        (inline)
    // 4) \(...\)      (inline)
    const re =
      /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\$([^$]+?)\$|\\\(([\s\S]+?)\\\)/g;

    let out = '';
    let last = 0;
    let m: RegExpExecArray | null;

    while ((m = re.exec(normalized)) !== null) {
      // текст до формулы
      if (m.index > last) {
        out += this.htmlEscape(normalized.slice(last, m.index));
      }

      let formula = '';
      let display = false;

      if (m[1] != null) {
        formula = m[1]; // $$...$$
        display = true;
      } else if (m[2] != null) {
        formula = m[2]; // \[...\]
        display = true;
      } else if (m[3] != null) {
        formula = m[3]; // $...$
        display = false;
      } else if (m[4] != null) {
        formula = m[4]; // \(...\)
        display = false;
      }

      try {
        const html = katex.renderToString(this.cleanLatex(formula), {
          displayMode: display,
          throwOnError: false,
          output: 'html',
        });
        out += html;
      } catch (e) {
        // В случае ошибки показываем исходный текст
        out += `<span style="color:red;">${this.htmlEscape(m[0])}</span>`;
      }

      last = re.lastIndex;
    }

    // хвост после последней формулы
    if (last < normalized.length) {
      out += this.htmlEscape(normalized.slice(last));
    }

    return out;
  }

  /** Экранируем HTML */
  private htmlEscape(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /** Чистим обрамления у голой формулы */
  private cleanLatex(latex: string): string {
    let cleaned = latex.trim();
    cleaned = cleaned.replace(/^\$+|\$+$/g, '');
    cleaned = cleaned.replace(/^\\\(|\\\)$/g, '');
    cleaned = cleaned.replace(/^\\\[|\\\]$/g, '');
    return cleaned;
  }

  /** Если в конце остался одиночный $, превращаем его в текстовый символ */
  private fixDanglingDollar(s: string): string {
    // Нечетное кол-во $ -> заменим последний на обычный символ
    const dollars = (s.match(/\$/g) || []).length;
    if (dollars % 2 === 1) {
      const last = s.lastIndexOf('$');
      return s.slice(0, last) + '\\$' + s.slice(last + 1);
    }
    return s;
  }

  // Остальные утилиты — без изменений
  extractLatexFormulas(text: string): string[] {
    const formulas: string[] = [];
    const patterns = [/\$([^$]+?)\$/g, /\\\(([^)]+?)\\\)/g, /\\\[([^\]]+?)\\\]/g];
    for (const pattern of patterns) {
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(text)) !== null) {
        const formula = m[1].trim();
        if (this.isValidLatexFormula(formula)) formulas.push(formula);
      }
    }
    return formulas;
  }

  private isValidLatexFormula(formula: string): boolean {
    const mathPatterns = [
      /\\[a-zA-Z]+/,
      /[+\-*/=<>]/,
      /[0-9]/,
      /[a-zA-Z]/,
      /[(){}\[\]]/,
      /[^a-zA-Z0-9\s]/,
    ];
    return mathPatterns.some((p) => p.test(formula));
    }

  cleanup(filepath: string): void {
    try { if (fs.existsSync(filepath)) fs.unlinkSync(filepath); } catch {}
  }

  cleanupAll(): void {
    try {
      const files = fs.readdirSync(this.tempDir);
      for (const f of files) {
        const p = path.join(this.tempDir, f);
        if (fs.statSync(p).isFile()) fs.unlinkSync(p);
      }
    } catch {}
  }
}
