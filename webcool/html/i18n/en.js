(function () {
  var textMap = {
    '文件管理控制台': 'File Management Console',
    '文件控制台': 'File Console',
    '左帧用于功能切换，右帧展示对应内容与操作结果。': 'Use the left pane to switch features; the right pane shows content and actions.',
    '功能菜单': 'Main menu',
    '上传文件': 'Upload Files',
    '远程磁盘': 'Remote Disk',
    '本地磁盘': 'Local Disk',
    '系统管理': 'System Management',
    '文件标签树': 'File tag tree',
    '标签树': 'Tag Tree',
    '支持最多三个文件同时上传，并展示实时上传进度。': 'Upload up to three files at once and show live progress.',
    '文件一': 'File 1',
    '文件二': 'File 2',
    '文件三': 'File 3',
    '准备上传...': 'Ready to upload...',
    '像资源管理器一样浏览多级文件夹，支持建删目录、预览、下载、删除和拖拽移动文件。': 'Browse folders like a file manager, with folder management, preview, download, delete, and drag-to-move.',
    '当前视图：全部文件': 'Current view: All files',
    '文件夹': 'Folders',
    '新建': 'Create',
    '删除': 'Delete',
    '恢复': 'Restore',
    '加载中...': 'Loading...',
    '当前目录文件': 'Current Folder Files',
    '当前标签文件': 'Current Tag Files',
    '列表': 'List',
    '预览': 'Preview',
    '排序': 'Sort',
    '按名称': 'By name',
    '按大小': 'By size',
    '按上传时间': 'By upload time',
    '升序': 'Ascending',
    '降序': 'Descending',
    '文件名': 'File Name',
    '文件大小': 'File Size',
    '上传时间': 'Upload Time',
    '操作': 'Actions',
    '动作': 'Action',
    '彻底删除': 'Delete Permanently',
    '浏览服务器本机磁盘目录，支持图片预览、视频观影、音频听音和文本查看。': 'Browse server local folders with image preview, video playback, audio playback, and text viewing.',
    '当前路径：/': 'Current path: /',
    '根目录': 'Root',
    '回收站': 'Trash',
    '上一级': 'Up',
    '⊟ 分栏': '⊟ Split',
    '☰ 列表': '☰ List',
    '上传': 'Upload',
    '显示隐藏项': 'Show hidden items',
    '名称': 'Name',
    '类型': 'Type',
    '大小': 'Size',
    '修改时间': 'Modified',
    '移除': 'Remove',
    '目录树': 'Folder Tree',
    '无子目录': 'No subfolders',
    '当前目录没有文件。': 'No files in the current folder.',
    '管理服务运行参数与维护操作。': 'Manage service settings and maintenance actions.',
    '存储路径': 'Storage Path',
    '语言设置': 'Language',
    '刷新模板缓存': 'Refresh Template Cache',
    '当前远程磁盘文件保存的位置。': 'The current location where remote disk files are stored.',
    '设置': 'Set',
    '正在移动存储文件': 'Moving stored files',
    '等待开始...': 'Waiting to start...',
    '设置界面显示语言，保存后会切换到对应语言版本。': 'Set the interface language. After applying, the matching language version will open.',
    '简体中文': 'Simplified Chinese',
    '应用': 'Apply',
    '新建标签': 'Create Tag',
    '请输入标签名称。': 'Enter a tag name.',
    '标签名称': 'Tag Name',
    '取消': 'Cancel',
    '确认': 'Confirm',
    '解锁目录': 'Unlock Folder',
    '请输入目录锁密码。': 'Enter the folder lock password.',
    '锁密码': 'Lock Password',
    '确认操作': 'Confirm Action',
    '请确认是否继续。': 'Please confirm whether to continue.',
    '选择存储路径': 'Choose Storage Path',
    '请选择一个本地目录作为新的存储路径。': 'Choose a local folder as the new storage path.',
    '当前没有可选择的目录。': 'No folders available.',
    '确定': 'OK',
    '上传到远程磁盘': 'Upload to Remote Disk',
    '选择远程目标目录。': 'Choose the remote target folder.',
    '当前没有文件夹。': 'No folders available.',
    '上传中': 'Uploading',
    '正在上传本地文件到远程磁盘。': 'Uploading local files to the remote disk.',
    '关闭': 'Close',
    '视频': 'Video',
    '音频': 'Audio',
    '图片': 'Images',
    '仅视频': 'Video only',
    '仅音频': 'Audio only',
    '仅图片': 'Images only',
    '观影': 'Play',
    '听音': 'Listen',
    '查看': 'View',
    '文件': 'File',
    '随机播放': 'Shuffle',
    '顺序播放': 'Sequential',
    '循环播放': 'Loop',
    '最大化': 'Maximize',
    '复原': 'Restore',
    '最小化': 'Minimize',
    '上一张': 'Previous image',
    '下一张': 'Next image',
    '剪切': 'Crop',
    '应用剪切': 'Apply Crop',
    '取消剪切': 'Cancel Crop',
    '等比例放大': 'Zoom in',
    '等比例缩小': 'Zoom out',
    '当前图像尺寸': 'Current image size',
    '图片宽度': 'Image width',
    '图片高度': 'Image height',
    '下载到本地': 'Download',
    '保存到服务': 'Save to service',
    '收起左侧栏': 'Collapse sidebar',
    '展开左侧栏': 'Expand sidebar',
    '浏览本地目录': 'Browse local folders',
    '当前用户目录': 'Current user folder',
    '分栏视图': 'Split view',
    '列表视图': 'List view',
    '全选当前列表文件': 'Select all files in the current list',
    '全选当前目录文件': 'Select all files in the current folder',
    '给选中文件加标签': 'Add tags to selected files',
    '移至回收站': 'Move to Trash',
    '展开或创建文件标签树': 'Expand or create file tag tree',
    '展开或收起目录': 'Expand or collapse folder'
  };

  function translateText(text) {
    var raw = String(text == null ? '' : text);
    var trimmed = raw.trim();
    if (!trimmed) return raw;
    var translated = textMap[trimmed];
    if (!translated) {
      translated = trimmed
        .replace(/^(\d+) 个文件$/, function (_, n) { return n + (n === '1' ? ' file' : ' files'); })
        .replace(/^([\d,]+) 字节$/, '$1 bytes')
        .replace(/^当前视图：目录：(.+) \/ 范围：全部文件$/, 'Current view: Folder: $1 / Scope: all files')
        .replace(/^当前视图：标签：(.+) \/ 范围：标签内全部文件$/, 'Current view: Tag: $1 / Scope: all tagged files')
        .replace(/^当前路径：(.+)$/, 'Current path: $1')
        .replace(/^图片预览：(.+)$/, 'Image Preview: $1')
        .replace(/^视频播放：(.+)$/, 'Video Playback: $1')
        .replace(/^音频播放：(.+)$/, 'Audio Playback: $1')
        .replace(/^文本查看：(.+)$/, 'Text View: $1')
        .replace(/^状态：(.+)$/, 'Status: $1')
        .replace(/^原因：(.+)$/, 'Reason: $1')
        .replace(/^加载(.+)失败：(.+)$/, 'Failed to load $1: $2')
        .replace(/^(.+)失败：(.+)$/, '$1 failed: $2');
    }
    if (translated === trimmed) return raw;
    return raw.replace(trimmed, translated);
  }

  function translateAttributes(el) {
    if (!el || !el.getAttribute) return;
    ['title', 'aria-label', 'alt', 'placeholder', 'value'].forEach(function (name) {
      if (!el.hasAttribute(name)) return;
      var value = el.getAttribute(name);
      var next = translateText(value);
      if (next !== value) el.setAttribute(name, next);
    });
  }

  function translateNode(node) {
    if (!node) return;
    if (node.nodeType === 3) {
      var next = translateText(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
      return;
    }
    if (node.nodeType !== 1) return;
    if (/^(SCRIPT|STYLE|TEXTAREA)$/i.test(node.tagName)) return;
    translateAttributes(node);
    var walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
      acceptNode: function (textNode) {
        var parent = textNode.parentElement;
        if (!parent || /^(SCRIPT|STYLE|TEXTAREA)$/i.test(parent.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(translateNode);
    Array.prototype.forEach.call(node.querySelectorAll('*'), translateAttributes);
  }

  function apply(root) {
    translateNode(root || document.body || document.documentElement);
  }

  function start() {
    document.documentElement.lang = 'en';
    document.title = translateText(document.title);
    apply(document.body || document.documentElement);
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'characterData') {
          translateNode(mutation.target);
        } else if (mutation.type === 'attributes') {
          translateAttributes(mutation.target);
        } else {
          Array.prototype.forEach.call(mutation.addedNodes || [], translateNode);
        }
      });
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['title', 'aria-label', 'alt', 'placeholder', 'value']
    });
  }

  window.WebCoolI18n = {
    lang: 'en',
    t: translateText,
    apply: apply
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
