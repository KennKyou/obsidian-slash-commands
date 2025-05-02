import { Plugin, Modal, MarkdownView, Setting, PluginSettingTab } from 'obsidian';
import { createIcons, Menu, ArrowRight, Globe, Slash, Type, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Table, Minus, Link2, Link, Image, Hash, Code, SquareDashed, Italic, Bold, Highlighter, ListChecks } from 'lucide';
import { locales } from './locales';

export default class SlashFlowPlugin extends Plugin {
  settings = {};

  async onload() {
    await this.loadSettings();

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

    this.updateCommandGroups();

    // 添加命令
    this.addCommand({
      id: 'show-slash-flow',
      name: 'Show Slash Flow',
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

    // 添加設定選項
    this.addSettingTab(new SlashFlowSettingTab(this.app, this));
  }

  updateCommandGroups() {
    this.commandGroups = [
      {
        name: this.t('basic-blocks'),
        commands: [
          { name: this.t('slash-symbol'), description: this.t('slash-symbol-desc'), insert: "/", icon: "slash" },
          { name: this.t('text'), description: this.t('text-desc'), insert: "", icon: "type" },
          { name: this.t('heading1'), description: this.t('heading1-desc'), insert: "# ", icon: "heading1" },
          { name: this.t('heading2'), description: this.t('heading2-desc'), insert: "## ", icon: "heading2" },
          { name: this.t('heading3'), description: this.t('heading3-desc'), insert: "### ", icon: "heading3" },
          { name: this.t('bullet-list'), description: this.t('bullet-list-desc'), insert: "- ", icon: "list" },
          { name: this.t('ordered-list'), description: this.t('ordered-list-desc'), insert: "1. ", icon: "list-ordered" },
          { name: this.t('quote'), description: this.t('quote-desc'), insert: "> ", icon: "quote" },
          { name: this.t('table'), description: this.t('table-desc'), insert: `|${this.t('table-header')}|${this.t('table-header')}|\n|---|---|\n|${this.t('table-content')}|${this.t('table-content')}|\n|${this.t('table-content')}|${this.t('table-content')}|`, icon: "table" },
          { name: this.t('divider'), description: this.t('divider-desc'), insert: "---", icon: "minus" },
        ]
      },
      {
        name: this.t('special-blocks'),
        commands: [
          { name: this.t('backlink'), description: this.t('backlink-desc'), insert: "[[]]", icon: "link2" },
          { name: this.t('link'), description: this.t('link-desc'), insert: `[${this.t('link-name')}](${this.t('link-url')})`, icon: "link" },
          { name: this.t('simple-link'), description: this.t('simple-link-desc'), insert: `<${this.t('link-url')}>`, icon: "link" },
          { name: this.t('image'), description: this.t('image-desc'), insert: `![${this.t('image-name')}](${this.t('image-url')})`, icon: "image" },
          { name: this.t('footnote'), description: this.t('footnote-desc'), insert: "^", icon: "hash" },
          { name: this.t('code'), description: this.t('code-desc'), insert: "``` js\n\n```", icon: "code" },
        ]
      },
      {
        name: this.t('custom-containers'),
        commands: [
          { name: this.t('info'), description: this.t('info-desc'), insert: `::: info ${this.t('custom-title')}\n\n:::`, icon: "square-dashed" },
          { name: this.t('tip'), description: this.t('tip-desc'), insert: `::: tip ${this.t('custom-title')}\n\n:::`, icon: "square-dashed" },
          { name: this.t('warning'), description: this.t('warning-desc'), insert: `::: warning ${this.t('custom-title')}\n\n:::`, icon: "square-dashed" },
          { name: this.t('danger'), description: this.t('danger-desc'), insert: `::: danger ${this.t('custom-title')}\n\n:::`, icon: "square-dashed" },
          { name: this.t('details'), description: this.t('details-desc'), insert: `::: details ${this.t('custom-title')}\n\n:::`, icon: "square-dashed" },
        ]
      },
      {
        name: this.t('font-effects'),
        commands: [
          { name: this.t('italic'), description: this.t('italic-desc'), insert: "**", icon: "italic" },
          { name: this.t('bold'), description: this.t('bold-desc'), insert: "****", icon: "bold" },
          { name: this.t('bold-italic'), description: this.t('bold-italic-desc'), insert: "******", icon: "bold" },
          { name: this.t('strikethrough'), description: this.t('strikethrough-desc'), insert: "~~~~", icon: "minus" },
        ]
      },
      {
        name: this.t('obsidian-only'),
        commands: [
          { name: this.t('todo'), description: this.t('todo-desc'), insert: "- [ ] ", icon: "List-checks" },
          { name: this.t('highlight'), description: this.t('highlight-desc'), insert: "====", icon: "highlighter" },
        ]
      }
    ];
  }

  t(key) {
    return locales[this.settings.language][key] || key;
  }

  async loadSettings() {
    this.settings = Object.assign({}, { language: 'en' }, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  showCommandPalette(editor) {
    const modal = new SlashFlowModal(this.app, this.commandGroups, editor);
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

class SlashFlowSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Slash Flow Settings' });

    new Setting(containerEl)
      .setName('Language')
      .setDesc('Select the display language')
      .addDropdown(dropdown => dropdown
        .addOption('en', 'English')
        .addOption('zh-TW', '繁體中文')
        .addOption('zh-CN', '简体中文')
        .addOption('ja', '日本語')
        .addOption('ko', '한국어')
        .setValue(this.plugin.settings.language)
        .onChange(async (value) => {
          this.plugin.settings.language = value;
          await this.plugin.saveSettings();
          this.plugin.updateCommandGroups(); // 更新命令群組
        }));
  }
}

class SlashFlowModal extends Modal {
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

  t(key) {
    return locales[this.app.plugins.getPlugin('slash-flow').settings.language][key] || key;
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
      [this.t('slash-symbol')]: "/",
      [this.t('heading1')]: "#",
      [this.t('heading2')]: "##",
      [this.t('heading3')]: "###",
      [this.t('bullet-list')]: "-",
      [this.t('ordered-list')]: "1.",
      [this.t('todo')]: "- [ ]",
      [this.t('quote')]: ">",
      [this.t('backlink')]: "[[]]",
      [this.t('footnote')]: "^",
      [this.t('code')]: "```",
      [this.t('divider')]: "---",
      [this.t('italic')]: "**",
      [this.t('bold')]: "****",
      [this.t('strikethrough')]: "~~~~",
      [this.t('bold-italic')]: "******",
      [this.t('highlight')]: "====",
      [this.t('link')]: "[]()",
      [this.t('simple-link')]: "<>",
      [this.t('image')]: "![]()",
    };
    return shortcuts[command.name] || "";
  }
} 