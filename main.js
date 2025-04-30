import { Plugin, Modal, MarkdownView } from 'obsidian';
import * as LucideIcons from 'lucide';

export default class SlashCommandsPlugin extends Plugin {
  async onload() {
    this.commandGroups = [
      {
        name: "基本區塊",
        commands: [
          { name: "斜線符號", description: "插入斜線符號 /", insert: "/", icon: "forward-slash" },
          { name: "文字", description: "普通文字", insert: "", icon: "text" },
          { name: "標題1", description: "一級標題", insert: "# ", icon: "heading-1" },
          { name: "標題2", description: "二級標題", insert: "## ", icon: "heading-2" },
          { name: "標題3", description: "三級標題", insert: "### ", icon: "heading-3" },
          { name: "項目符號列表", description: "無序列表", insert: "- ", icon: "list" },
          { name: "有序列表", description: "數字列表", insert: "1. ", icon: "list-ordered" },
          { name: "待辦清單", description: "待辦事項", insert: "- [ ] ", icon: "checkbox" },
          { name: "引言", description: "引言區塊", insert: "> ", icon: "quote" },
          { name: "表格", description: "表格", insert: "|表頭|表頭|\n|---|---|\n|內容|內容|\n|內容|內容|", icon: "table" },
        ]
      },
      {
        name: "特殊區塊",
        commands: [
          { name: "雙向連結", description: "雙向連結", insert: "[[]]", icon: "link" },
          { name: "標註", description: "標註", insert: "^", icon: "hash" },
          { name: "程式碼", description: "程式碼區塊", insert: "``` js\n\n```", icon: "code" },
        ]
      },
      {
        name: "自定義容器（VitePress）",
        commands: [
          { name: "INFO", description: "INFO 區塊", insert: "::: info 自訂標題（可留空）\n\n:::", icon: "square-dashed" },
          { name: "TIP", description: "TIP 區塊", insert: "::: tip 自訂標題（可留空）\n\n:::", icon: "square-dashed" },
          { name: "WARNING", description: "WARNING 區塊", insert: "::: warning 自訂標題（可留空）\n\n:::", icon: "square-dashed" },
          { name: "DANGER", description: "DANGER 區塊", insert: "::: danger 自訂標題（可留空）\n\n:::", icon: "square-dashed" },
          { name: "DETAILS", description: "DETAILS 區塊", insert: "::: details 自訂標題（可留空）\n\n:::", icon: "square-dashed" },
        ]
      }
    ];

    // 添加命令
    this.addCommand({
      id: 'show-slash-commands',
      name: 'Show Slash Commands',
      editorCallback: (editor) => {
        this.showCommandPalette(editor);
      }
    });

    // 監聽鍵盤事件
    this.registerDomEvent(document, 'keydown', (evt) => {
      if (evt.key === '/') {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView) {
          const editor = activeView.editor;
          const cursor = editor.getCursor();
          const lineContent = editor.getLine(cursor.line);
          
          // 檢查是否在行首輸入斜線，或者這是一個新行
          if (cursor.ch === 0 || lineContent.trim() === '') {
            evt.preventDefault(); // 防止斜線被輸入
            this.showCommandPalette(editor);
          }
        }
      }
    });
  }

  showCommandPalette(editor) {
    const modal = new SlashCommandModal(this.app, this.commandGroups, editor);
    modal.onChooseSuggestion = (command) => {
      const cursor = editor.getCursor();
      editor.replaceRange(command.insert, cursor);
      
      // 特殊處理某些命令
      if (command.insert === '[[]]') {
        // 將游標放在 [[ 和 ]] 之間
        editor.setCursor({ line: cursor.line, ch: cursor.ch + 2 });
      } else if (command.insert === '|表頭|表頭|\n|---|---|\n|內容|內容|\n|內容|內容|') {
        editor.setCursor({ line: cursor.line, ch: cursor.ch + 3});
      } else if (command.insert.includes('\n')) {
        // 對於多行插入（如代碼塊），將游標放在中間
        const lines = command.insert.split('\n');
        editor.setCursor({ line: cursor.line + 1, ch: 0 });
      } else {
        // 一般情況，將游標放在插入內容之後
        editor.setCursor({ line: cursor.line, ch: cursor.ch + command.insert.length });
      }
      modal.shouldInsertSlash = false; // 標記不需要插入斜線
    };
    modal.open();
  }
}

class SlashCommandModal extends Modal {
  constructor(app, commandGroups, editor) {
    super(app);
    this.commandGroups = commandGroups;
    this.editor = editor;
    this.shouldInsertSlash = true; // 預設需要插入斜線
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('slash-command-modal');

    this.commandGroups.forEach(group => {
      // 創建分組標題
      const groupDiv = contentEl.createDiv('slash-command-group');
      groupDiv.createEl('div', { text: group.name, cls: 'slash-command-group-name' });

      // 創建分組內的命令
      group.commands.forEach(command => {
        const div = groupDiv.createDiv('slash-command-item');
        const nameDiv = div.createEl('div', { cls: 'slash-command-name-container' });
        const nameContainer = nameDiv.createEl('div', { cls: 'slash-command-name' });
        
        // 添加圖標
        if (command.icon) {
          const iconDiv = nameContainer.createDiv('slash-command-icon');
          const iconSvg = this.getIconSvg(command.icon);
          if (iconSvg) {
            iconDiv.innerHTML = iconSvg;
          }
        }
        
        nameContainer.createSpan({ text: command.name });
        
        // 添加快捷鍵提示（如果有的話）
        const shortcut = this.getShortcut(command);
        if (shortcut) {
          nameDiv.createEl('div', { text: shortcut, cls: 'slash-command-shortcut' });
        }
        
        div.createEl('div', { text: command.description, cls: 'slash-command-description' });
        div.onclick = () => {
          this.onChooseSuggestion(command);
          this.close();
        };
      });
    });
  }

  getIconSvg(iconName) {
    const icons = {
      'forward-slash': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-slash-icon lucide-slash"><path d="M22 2 2 22"/></svg>',
      'text': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type-icon lucide-type"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>',
      'heading-1': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heading1-icon lucide-heading-1"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="m17 12 3-2v8"/></svg>',
      'heading-2': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heading2-icon lucide-heading-2"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/></svg>',
      'heading-3': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heading3-icon lucide-heading-3"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2"/><path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2"/></svg>',
      'list': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-icon lucide-list"><path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/></svg>',
      'list-ordered': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-ordered-icon lucide-list-ordered"><path d="M10 12h11"/><path d="M10 18h11"/><path d="M10 6h11"/><path d="M4 10h2"/><path d="M4 6h1v4"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>',
      'checkbox': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-ordered-icon lucide-list-ordered"><path d="M10 12h11"/><path d="M10 18h11"/><path d="M10 6h11"/><path d="M4 10h2"/><path d="M4 6h1v4"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>',
      'quote': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-quote-icon lucide-quote"><path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/></svg>',
      'table': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-grid2x2-icon lucide-grid-2x2"><path d="M12 3v18"/><path d="M3 12h18"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>',
      'link': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link2-icon lucide-link-2"><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/></svg>',
      'hash': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash-icon lucide-hash"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>',
      'code': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code-xml-icon lucide-code-xml"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>',
      'square-dashed': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-dashed-icon lucide-square-dashed"><path d="M5 3a2 2 0 0 0-2 2"/><path d="M19 3a2 2 0 0 1 2 2"/><path d="M21 19a2 2 0 0 1-2 2"/><path d="M5 21a2 2 0 0 1-2-2"/><path d="M9 3h1"/><path d="M9 21h1"/><path d="M14 3h1"/><path d="M14 21h1"/><path d="M3 9v1"/><path d="M21 9v1"/><path d="M3 14v1"/><path d="M21 14v1"/></svg>'
    };
    return icons[iconName];
  }

  getShortcut(command) {
    const shortcuts = {
      "斜線符號": "/",
      "標題1": "#",
      "標題2": "##",
      "標題3": "###",
      "項目符號列表": "-",
      "有序列表": "1.",
      "待辦清單": "[]",
      "引言": ">",
      "雙向連結": "[[]]",
      "標註": "^",
      "程式碼": "```",
    };
    return shortcuts[command.name] || "";
  }

  onClose() {
    if (this.shouldInsertSlash && this.editor) {
      const cursor = this.editor.getCursor();
      this.editor.replaceRange("/", cursor);
      // 將游標移動到斜線後面
      this.editor.setCursor({ line: cursor.line, ch: cursor.ch + 1 });
    }
    const { contentEl } = this;
    contentEl.empty();
  }
} 