import { Plugin, Modal, MarkdownView } from 'obsidian';
import { createIcons, Menu, ArrowRight, Globe, Slash, Type, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Table, Minus, Link2, Link, Image, Hash, Code, SquareDashed, Italic, Bold, Highlighter, ListChecks } from 'lucide';

export default class SlashCommandsPlugin extends Plugin {
  async onload() {
    // 初始化 Lucide 圖標
    const icons = {
      Menu,
      ArrowRight,
      Globe,
      Slash,
      Type,
      Heading1,
      Heading2,
      Heading3,
      List,
      ListOrdered,
      Quote,
      Table,
      Minus,
      Link2,
      Link,
      Image,
      Hash,
      Code,
      SquareDashed,
      Italic,
      Bold,
      Highlighter,
      ListChecks
    };

    createIcons({
      icons,
      attrs: {
        width: '18',
        height: '18',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }
    });

    this.commandGroups = [
      {
        name: "基本區塊",
        commands: [
          { name: "斜線符號", description: "斜線符號 /", insert: "/", icon: "slash" },
          { name: "文字", description: "普通文字", insert: "", icon: "type" },
          { name: "標題1", description: "一級標題", insert: "# ", icon: "heading1" },
          { name: "標題2", description: "二級標題", insert: "## ", icon: "heading2" },
          { name: "標題3", description: "三級標題", insert: "### ", icon: "heading3" },
          { name: "項目符號列表", description: "無序列表", insert: "- ", icon: "list" },
          { name: "有序列表", description: "數字列表", insert: "1. ", icon: "list-ordered" },
          { name: "引言", description: "引言區塊", insert: "> ", icon: "quote" },
          { name: "表格", description: "表格", insert: "|表頭|表頭|\n|---|---|\n|內容|內容|\n|內容|內容|", icon: "table" },
          { name: "分隔線", description: "分隔線", insert: "---", icon: "minus" },
        ]
      },
      {
        name: "特殊區塊",
        commands: [
          { name: "雙向連結", description: "雙向連結", insert: "[[]]", icon: "link2" },
          { name: "連結", description: "連結", insert: "[連結名稱](連結網址)", icon: "link" },
          { name: "簡易超連結", description: "簡易超連結", insert: "<連結網址>", icon: "link" },
          { name: "圖片", description: "圖片", insert: "![圖片名稱](圖片連結)", icon: "image" },
          { name: "標註", description: "標註（只會在編輯模式顯示）", insert: "^", icon: "hash" },
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
      },
      {
        name: "字體效果",
        commands: [
          { name: "斜體字", description: "斜體字", insert: "**", icon: "italic" },
          { name: "粗體字", description: "粗體字", insert: "****", icon: "bold" },
          { name: "斜粗體", description: "斜粗體", insert: "******", icon: "bold" },
          { name: "刪除線", description: "刪除線", insert: "~~~~", icon: "minus" },
        ]
      },
      {
        name: "目前只適配在 Obsidian",
        commands: [
          { name: "待辦清單", description: "待辦事項", insert: "- [ ] ", icon: "List-checks" },
          { name: "螢光標記文字", description: "螢光標記文字", insert: "====", icon: "highlighter" },
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
      if (command.insert === '[[]]' || command.insert === '****' || command.insert === '~~~~' || command.insert === '++++' || command.insert === '====' || command.insert === '![圖片名稱](圖片連結)') {
        // 將游標放在 [[ 和 ]] 之間
        editor.setCursor({ line: cursor.line, ch: cursor.ch + 2 });
      }
      else if (command.insert === '******') {
        editor.setCursor({ line: cursor.line, ch: cursor.ch + 3 });
      }
      else if (command.insert === '**' || command.insert === '<連結網址>' || command.insert === '|表頭|表頭|\n|---|---|\n|內容|內容|\n|內容|內容|' || command.insert === '[連結名稱](連結網址)') {
        editor.setCursor({ line: cursor.line, ch: cursor.ch + 1 });
      }
      else if (command.insert.includes('\n')) {
        // 對於多行插入（如代碼塊），將游標放在中間
        const lines = command.insert.split('\n');
        editor.setCursor({ line: cursor.line + 1, ch: 0 });
      }
      else {
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
    this.shouldInsertSlash = true;
    this.selectedIndex = 0;
    this.allCommands = this.flattenCommands();
    this.keydownHandler = this.handleKeydown.bind(this);
    this.icons = {
      Menu,
      ArrowRight,
      Globe,
      Slash,
      Type,
      Heading1,
      Heading2,
      Heading3,
      List,
      ListOrdered,
      Quote,
      Table,
      Minus,
      Link2,
      Link,
      Image,
      Hash,
      Code,
      SquareDashed,
      Italic,
      Bold,
      Highlighter,
      ListChecks
    };
  }

  flattenCommands() {
    return this.commandGroups.flatMap(group => group.commands);
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('slash-command-modal');

    document.addEventListener('keydown', this.keydownHandler);

    this.commandGroups.forEach(group => {
      const groupDiv = contentEl.createDiv('slash-command-group');
      groupDiv.createEl('div', { text: group.name, cls: 'slash-command-group-name' });

      group.commands.forEach((command, index) => {
        const div = groupDiv.createDiv('slash-command-item');
        if (index === this.selectedIndex) {
          div.addClass('is-selected');
        }
        
        const nameDiv = div.createEl('div', { cls: 'slash-command-name-container' });
        const nameContainer = nameDiv.createEl('div', { cls: 'slash-command-name' });
        
        if (command.icon) {
          const iconDiv = nameContainer.createDiv('slash-command-icon');
          const iconElement = document.createElement('i');
          iconElement.setAttribute('data-lucide', command.icon);
          iconDiv.appendChild(iconElement);
        }
        
        nameContainer.createSpan({ text: command.name });
        
        const shortcut = this.getShortcut(command);
        if (shortcut) {
          nameDiv.createEl('div', { text: shortcut, cls: 'slash-command-shortcut' });
        }
        
        div.createEl('div', { text: command.description, cls: 'slash-command-description' });
        
        // 添加滑鼠懸停事件
        div.onmouseenter = () => {
          this.selectedIndex = index;
          this.updateSelection();
        };
        
        div.onclick = () => {
          this.onChooseSuggestion(command);
          this.close();
        };
      });
    });

    // 重新初始化圖標
    createIcons({
      icons: this.icons,
      attrs: {
        width: '18',
        height: '18',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }
    });
  }

  handleKeydown(evt) {
    switch (evt.key) {
      case 'ArrowUp':
        evt.preventDefault();
        this.moveSelection(-1);
        break;
      case 'ArrowDown':
        evt.preventDefault();
        this.moveSelection(1);
        break;
      case 'Enter':
        evt.preventDefault();
        this.selectCurrentCommand();
        break;
    }
  }

  moveSelection(direction) {
    const newIndex = this.selectedIndex + direction;
    if (newIndex >= 0 && newIndex < this.allCommands.length) {
      this.selectedIndex = newIndex;
      this.updateSelection(true);
    }
  }

  updateSelection(shouldScroll = false) {
    const items = this.contentEl.querySelectorAll('.slash-command-item');
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.addClass('is-selected');
        if (shouldScroll) {
          item.scrollIntoView({ block: 'nearest' });
        }
      } else {
        item.removeClass('is-selected');
      }
    });
  }

  selectCurrentCommand() {
    if (this.allCommands[this.selectedIndex]) {
      this.onChooseSuggestion(this.allCommands[this.selectedIndex]);
      this.close();
    }
  }

  onClose() {
    document.removeEventListener('keydown', this.keydownHandler);
    if (this.shouldInsertSlash && this.editor) {
      const cursor = this.editor.getCursor();
      this.editor.replaceRange("/", cursor);
      this.editor.setCursor({ line: cursor.line, ch: cursor.ch + 1 });
    }
    const { contentEl } = this;
    contentEl.empty();
  }

  getShortcut(command) {
    const shortcuts = {
      "斜線符號": "/",
      "標題1": "#",
      "標題2": "##",
      "標題3": "###",
      "項目符號列表": "-",
      "有序列表": "1.",
      "待辦清單": "- [ ]",
      "引言": ">",
      "雙向連結": "[[]]",
      "標註": "^",
      "程式碼": "```",
      "分隔線": "---",
      "斜體字": "**",
      "粗體字": "****",
      "刪除線": "~~~~",
      "斜粗體": "******",
      "螢光標記文字": "====",
      "連結": "[]()",
      "簡易超連結": "<>",
      "圖片": "![]()",
    };
    return shortcuts[command.name] || "";
  }
} 