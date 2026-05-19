(function () {
      const api = {
        files: '/api/v1/files',
        folders: '/api/v1/folders',
        folderCreate: '/api/v1/folders/create',
        folderRename: '/api/v1/folders/rename',
        folderMove: '/api/v1/folders/move',
        folderDelete: '/api/v1/folders/delete',
        folderLock: '/api/v1/folders/lock',
        folderUnlock: '/api/v1/folders/unlock',
        folderLockVerify: '/api/v1/folders/lock/verify',
        fileMove: '/api/v1/files/move',
        tags: '/api/v1/tags',
        tagCreate: '/api/v1/tags/create',
        tagRename: '/api/v1/tags/rename',
        tagDelete: '/api/v1/tags/delete',
        tagBind: '/api/v1/tags/bind',
        tagUnbind: '/api/v1/tags/unbind',
        tagFiles: '/api/v1/tag-files',
        upload: '/api/v1/upload',
        del: '/api/v1/delete',
        restore: '/api/v1/restore',
        download: '/api/v1/download',
        localDiskList: '/api/v1/local-disk/list',
        localDiskDownload: '/api/v1/local-disk/download',
        localDiskDelete: '/api/v1/local-disk/delete',
        localDiskMkdir: '/api/v1/local-disk/mkdir',
        localDiskMove: '/api/v1/local-disk/move',
        localDiskOpenTrash: '/api/v1/local-disk/open-trash',
        localDiskImport: '/api/v1/local-disk/import',
        localDiskImportProgress: '/api/v1/local-disk/import/progress',
        reloadTpl: '/api/v1/admin/template/reload',
        convertVideo: '/api/v1/video/convert',
        convertCancel: '/api/v1/video/convert/cancel',
        convertProgress: '/api/v1/video/convert/progress',
        convertTasks: '/api/v1/video/convert/tasks',
        probeVideo: '/api/v1/video/probe',
        videoResume: '/api/v1/video/resume',
        videoResumeSave: '/api/v1/video/resume/save'
      };

      const uploadForm = document.getElementById('upload-form');
      const reloadBtn = document.getElementById('reload-template-btn');
      const statusBox = document.getElementById('status');
      const uploadProgress = document.getElementById('upload-progress');
      const uploadProgressFill = document.getElementById('upload-progress-fill');
      const uploadProgressText = document.getElementById('upload-progress-text');
      const uploadFolderPathInput = document.getElementById('upload-folder-path');
      const shell = document.querySelector('.shell');
      const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
      const fileList = document.getElementById('file-list');
      const fileTable = document.getElementById('file-table');
      const fileEmpty = document.getElementById('file-empty');
      const fileCounter = document.getElementById('file-counter');
      const fileSelectAll = document.getElementById('file-select-all');
      const fileBulkAction = document.getElementById('file-bulk-action');
      const fileBulkDeleteAction = document.getElementById('file-bulk-delete-action');
      const fileViewContext = document.getElementById('file-view-context');
      const localDiskContext = document.getElementById('local-disk-context');
      const localDiskHomeBtn = document.getElementById('local-disk-home-btn');
      const localDiskRootBtn = document.getElementById('local-disk-root-btn');
      const localDiskTrashBtn = document.getElementById('local-disk-trash-btn');
      const localDiskUpBtn = document.getElementById('local-disk-up-btn');
      const localDiskViewTableBtn = document.getElementById('local-disk-view-table-btn');
      const localDiskViewSplitBtn = document.getElementById('local-disk-view-split-btn');
      const localDiskImportBtn = document.getElementById('local-disk-import-btn');
      const localDiskShowHidden = document.getElementById('local-disk-show-hidden');
      const localDiskTableWrap = document.getElementById('local-disk-table-wrap');
      const localDiskTable = document.getElementById('local-disk-table');
      const localDiskList = document.getElementById('local-disk-list');
      const localDiskTableSelectAll = document.getElementById('local-disk-table-select-all');
      const localDiskTableBulkRemoveBtn = document.getElementById('local-disk-table-bulk-remove-btn');
      const localDiskExplorer = document.getElementById('local-disk-explorer');
      const localDiskDirList = document.getElementById('local-disk-dir-list');
      const localDiskDirEmpty = document.getElementById('local-disk-dir-empty');
      const localDiskSplitTable = document.getElementById('local-disk-split-table');
      const localDiskSplitList = document.getElementById('local-disk-split-list');
      const localDiskSplitEmpty = document.getElementById('local-disk-split-empty');
      const localDiskSelectAll = document.getElementById('local-disk-select-all');
      const localDiskBulkRemoveBtn = document.getElementById('local-disk-bulk-remove-btn');
      const localDiskEmpty = document.getElementById('local-disk-empty');
      const localSortButtons = Array.from(document.querySelectorAll('.local-sort-btn[data-local-sort-key]'));
      const explorerShell = document.querySelector('.explorer-shell');
      const folderBrowser = document.querySelector('.folder-browser');
      const folderTree = document.getElementById('folder-tree');
      const folderTreeEmpty = document.getElementById('folder-tree-empty');
      const folderCurrentPath = document.getElementById('folder-current-path');
      const folderCreateBtn = document.getElementById('folder-create-btn');
      const folderDeleteBtn = document.getElementById('folder-delete-btn');
      const folderRootBtn = document.getElementById('folder-root-btn');
      const sortKey = document.getElementById('sort-key');
      const sortOrder = document.getElementById('sort-order');
      const sortButtons = Array.from(document.querySelectorAll('.sort-btn[data-sort-key]'));
      const leftTagTreeSection = document.querySelector('.left-tag-tree-section');
      const filesTagToggleBtn = document.getElementById('files-tag-toggle');
      const tagManager = document.getElementById('tag-manager');
      const tagDialog = document.getElementById('tag-dialog');
      const tagDialogForm = document.getElementById('tag-dialog-form');
      const tagDialogTitle = document.getElementById('tag-dialog-title');
      const tagDialogDesc = document.getElementById('tag-dialog-desc');
      const tagDialogInput = document.getElementById('tag-dialog-input');
      const tagDialogCancelBtn = document.getElementById('tag-dialog-cancel');
      const localImportDialog = document.getElementById('local-import-dialog');
      const localImportTree = document.getElementById('local-import-tree');
      const localImportEmpty = document.getElementById('local-import-empty');
      const localImportCancelBtn = document.getElementById('local-import-cancel');
      const localImportConfirmBtn = document.getElementById('local-import-confirm');
      const localImportProgressDialog = document.getElementById('local-import-progress-dialog');
      const localImportProgressFill = document.getElementById('local-import-progress-fill');
      const localImportProgressText = document.getElementById('local-import-progress-text');
      const localImportProgressFiles = document.getElementById('local-import-progress-files');
      const localImportProgressClose = document.getElementById('local-import-progress-close');
      const previewLayer = document.getElementById('preview-layer');
      const menuButtons = Array.from(document.querySelectorAll('.menu-btn[data-panel]'));
      const panels = Array.from(document.querySelectorAll('.panel'));
      const SIDEBAR_COLLAPSED_STORAGE_KEY = 'webcool:sidebar-collapsed:v1';
      const TAG_TREE_STORAGE_KEY = 'webcool:file-tags:v1';
      const TAG_MAX_LEVEL = 3;
      const AUDIO_PLAY_MODE_LABELS = {
        random: '随机播放',
        sequential: '顺序播放',
        loop: '循环播放'
      };
      const AUDIO_PLAY_MODE_ICONS = {
        random: '⤮',
        sequential: '⇥',
        loop: '↻'
      };
      const RECYCLE_FOLDER_NAME = '回收站';
      let allFiles = [];
      let activeSourceFiles = [];
      let currentFiles = [];
      let folderTreeData = [];
      let activeFolderPath = '';
      let activeLocalDiskPath = '';
      let activeLocalDiskParentPath = '/';
      let activeLocalDiskHomePath = '';
      let activeLocalDiskTrashPath = '';
      let activeLocalDiskItems = [];
      let localDiskSortKey = 'name';
      let localDiskSortOrder = 'asc';
      let localDiskViewMode = 'split';
      const selectedLocalDiskPaths = new Set();
      let activeLocalDiskDragPaths = [];
      let activeLocalDiskTreeRootPath = '';
      let localImportTargetFolderPath = '';
      const localImportExpandedFolderPaths = new Set(['']);
      const localDiskTreeCache = new Map();
      const expandedLocalDiskTreePaths = new Set();
      let activeDropFolderPath = null;
      let activeFolderAutoExpandPath = '';
      let folderAutoExpandTimer = null;
      let activeFolderRenamePath = '';
      let folderRenameRequestPath = '';
      let activeFolderContextMenu = null;
      const unlockedFolderPasswords = new Map();
      const selectedFileNames = new Set();
      const expandedFolderPaths = new Set(['']);
      let tagTree = [];
      let activeFilterTagId = '';
      const expandedTagNodeIds = new Set();
      let activeTagMenuId = '';
      let activeDropTagNode = null;
      let activeTagRenameId = '';
      let tagRenameRequestId = '';
      let previewZ = 900;
      let activeDrag = null;
      let activeTagDialogResolver = null;
      let activeAudioTagContextMenu = null;
      const openedPreviewWindows = new Map();
      const transcodeProgressTimers = new Map();
      const videoResumeSaveTimers = new Map();
      function normalizeFileRecord(file) {
        const source = file && typeof file === 'object' ? file : {};
        const path = String(source.path || source.name || '');
        const slash = path.lastIndexOf('/');
        const derivedFolder = slash >= 0 ? path.slice(0, slash) : '';
        const derivedName = slash >= 0 ? path.slice(slash + 1) : path;
        return Object.assign({}, source, {
          path: path,
          folder_path: String(source.folder_path || derivedFolder || ''),
          name: String(source.name || derivedName || ''),
          display_path: path
        });
      }

      function getFilePath(file) {
        return String((file && file.path) || (file && file.name) || '');
      }

      function getFileLabel(file) {
        return String((file && file.display_path) || getFilePath(file) || '');
      }

      function getFolderLabel(path) {
        return path ? path : '根目录';
      }

      function isRecycleFolderPath(path) {
        return String(path || '') === RECYCLE_FOLDER_NAME;
      }

      function collectFolderPaths(nodes, out) {
        const list = Array.isArray(nodes) ? nodes : [];
        const result = Array.isArray(out) ? out : [];
        list.forEach(function (node) {
          const path = String((node && node.path) || '');
          if (path) {
            result.push(path);
          }
          if (node && Array.isArray(node.children) && node.children.length) {
            collectFolderPaths(node.children, result);
          }
        });
        return result;
      }

      function folderPathExists(path) {
        const text = String(path || '');
        if (!text) {
          return true;
        }
        return collectFolderPaths(folderTreeData, []).includes(text);
      }
      function isSameOrChildFolderPath(basePath, testPath) {
        const base = String(basePath || '');
        const test = String(testPath || '');
        if (!base) {
          return true;
        }
        return test === base || test.indexOf(base + '/') === 0;
      }

      function relocatePathAfterFolderMove(path, sourcePath, targetPath) {
        const current = String(path || '');
        const source = String(sourcePath || '');
        const target = String(targetPath || '');
        if (!current || !source || !target) {
          return current;
        }
        if (current === source) {
          return target;
        }
        if (current.indexOf(source + '/') === 0) {
          return target + current.slice(source.length);
        }
        return current;
      }

      function canRenameFolderPath(path) {
        const text = String(path || '');
        return !!text && !isRecycleFolderPath(text);
      }

      function folderNameFromPath(path) {
        const text = String(path || '');
        const index = text.lastIndexOf('/');
        return index >= 0 ? text.slice(index + 1) : text;
      }

      function parentFolderPathFromFilePath(path) {
        const text = String(path || '');
        const index = text.lastIndexOf('/');
        return index >= 0 ? text.slice(0, index) : '';
      }

      function getFolderLockAncestorPath(path) {
        const text = String(path || '');
        if (!text) {
          return '';
        }
        const parts = text.split('/');
        for (let i = parts.length; i > 0; i -= 1) {
          const candidate = parts.slice(0, i).join('/');
          const node = findFolderNodeByPath(candidate);
          if (node && node.locked) {
            return candidate;
          }
        }
        return '';
      }

      function getFolderPasswordForPath(path) {
        const lockedPath = getFolderLockAncestorPath(path);
        if (!lockedPath) {
          return '';
        }
        return unlockedFolderPasswords.get(lockedPath) || '';
      }

      function withFolderPassword(url, path, paramName) {
        const password = getFolderPasswordForPath(path);
        if (!password) {
          return url;
        }
        return url + '&' + encodeURIComponent(paramName || 'folder_password') + '=' + encodeURIComponent(password);
      }

      function downloadUrlForFile(filePath, preview) {
        const encoded = encodeURIComponent(filePath || '');
        let url = api.download + '?' + (preview ? 'preview=1&' : '') + 'file=' + encoded;
        url = withFolderPassword(url, parentFolderPathFromFilePath(filePath));
        return url;
      }

      function localDiskDownloadUrl(path) {
        return api.localDiskDownload + '?path=' + encodeURIComponent(path || '/');
      }

      async function ensureFolderUnlocked(path) {
        const lockedPath = getFolderLockAncestorPath(path);
        if (!lockedPath) {
          return true;
        }
        if (unlockedFolderPasswords.has(lockedPath)) {
          return true;
        }
        const password = window.prompt('请输入目录「' + lockedPath + '」的解锁密码');
        if (password === null) {
          return false;
        }
        await fetchJson(
          api.folderLockVerify + '?path=' + encodeURIComponent(path) + '&password=' + encodeURIComponent(password),
          { method: 'POST' }
        );
        unlockedFolderPasswords.set(lockedPath, password);
        return true;
      }

      function closeFolderContextMenu() {
        if (activeFolderContextMenu && activeFolderContextMenu.parentNode) {
          activeFolderContextMenu.parentNode.removeChild(activeFolderContextMenu);
        }
        activeFolderContextMenu = null;
      }

      function openFolderContextMenu(path, clientX, clientY) {
        closeFolderContextMenu();
        const node = findFolderNodeByPath(path);
        if (!node || !canRenameFolderPath(path)) {
          return;
        }
        const menu = document.createElement('div');
        menu.className = 'folder-context-menu';
        menu.setAttribute('data-folder-path', path);
        menu.innerHTML =
          '<button type="button" class="folder-context-item" data-folder-menu-action="create">新建子目录</button>' +
          '<button type="button" class="folder-context-item" data-folder-menu-action="delete">删除</button>' +
          '<button type="button" class="folder-context-item" data-folder-menu-action="rename">改名</button>' +
          '<button type="button" class="folder-context-item" data-folder-menu-action="' + (node.locked ? 'unlock' : 'lock') + '">' + (node.locked ? '解锁' : '加锁') + '</button>';
        document.body.appendChild(menu);
        menu.style.left = Math.round(clientX) + 'px';
        menu.style.top = Math.round(clientY) + 'px';
        clampFloatingMenuPosition(menu, clientX, clientY);
        activeFolderContextMenu = menu;
      }

      async function handleFolderContextAction(action, path) {
        if (!action || !path) {
          return;
        }
        if (action === 'lock') {
          if (!(await ensureFolderUnlocked(path))) {
            return;
          }
          const password = window.prompt('请输入目录「' + path + '」的加锁密码');
          if (password === null) {
            return;
          }
          await fetchJson(api.folderLock + '?path=' + encodeURIComponent(path) + '&password=' + encodeURIComponent(password), { method: 'POST' });
          unlockedFolderPasswords.set(path, password);
          await loadFiles();
          showStatus('目录已加锁：' + path, 'ok');
          return;
        }
        if (action === 'unlock') {
          const password = window.prompt('请输入目录「' + path + '」的解锁密码');
          if (password === null) {
            return;
          }
          await fetchJson(api.folderUnlock + '?path=' + encodeURIComponent(path) + '&password=' + encodeURIComponent(password), { method: 'POST' });
          unlockedFolderPasswords.delete(path);
          await loadFiles();
          showStatus('目录已解锁：' + path, 'ok');
          return;
        }
        if (!(await ensureFolderUnlocked(path))) {
          return;
        }
        activeFolderPath = path;
        if (action === 'create') {
          await createFolderAtCurrentPath();
          await loadFiles();
        } else if (action === 'delete') {
          await deleteCurrentFolder();
          await loadFiles();
        } else if (action === 'rename') {
          startFolderRename(path);
        }
      }

      function normalizeFolderMoveSources(paths) {
        const sorted = (Array.isArray(paths) ? paths : [])
          .map(function (path) { return String(path || ''); })
          .filter(Boolean)
          .sort(function (a, b) {
            if (a.length !== b.length) {
              return a.length - b.length;
            }
            return a.localeCompare(b, 'zh-CN');
          });

        const result = [];
        sorted.forEach(function (path) {
          const covered = result.some(function (picked) {
            return isSameOrChildFolderPath(picked, path);
          });
          if (!covered) {
            result.push(path);
          }
        });
        return result;
      }

      async function moveFoldersToFolder(folderPaths, targetFolder) {
        const selected = normalizeFolderMoveSources(folderPaths);
        if (!selected.length) {
          return { movedCount: 0, ignoredCount: 0 };
        }

        const target = String(targetFolder || '');
        const rawSelectedCount = Array.isArray(folderPaths) ? folderPaths.length : 0;
        const ignoredCount = rawSelectedCount > selected.length ? (rawSelectedCount - selected.length) : 0;

        let movedCount = 0;
        for (let i = 0; i < selected.length; i += 1) {
          const sourcePath = selected[i];
          const result = await fetchJson(
            withFolderPassword(
              withFolderPassword(api.folderMove + '?path=' + encodeURIComponent(sourcePath) + '&folder=' + encodeURIComponent(target), sourcePath),
              target,
              'target_folder_password'
            ),
            { method: 'POST' }
          );
          const nextPath = String((result && result.path) || '');
          activeFolderPath = relocatePathAfterFolderMove(activeFolderPath, sourcePath, nextPath);
          movedCount += 1;
        }

        ensureFolderPathExpanded(activeFolderPath);
        ensureFolderPathExpanded(target);
        await loadFiles();
        return { movedCount: movedCount, ignoredCount: ignoredCount };
      }

      function setUploadTargetFolder(path) {
        if (uploadFolderPathInput) {
          uploadFolderPathInput.value = String(path || '');
        }
      }

      function setSidebarCollapsed(collapsed) {
        if (!shell || !sidebarToggleBtn) {
          return;
        }
        const isCollapsed = !!collapsed;
        shell.classList.toggle('sidebar-collapsed', isCollapsed);
        sidebarToggleBtn.textContent = isCollapsed ? '▶' : '◀';
        sidebarToggleBtn.setAttribute('aria-label', isCollapsed ? '展开左侧栏' : '收起左侧栏');
        sidebarToggleBtn.setAttribute('title', isCollapsed ? '展开左侧栏' : '收起左侧栏');
      }

      function setActivePanel(panelId) {
        panels.forEach(function (panel) {
          panel.classList.toggle('active', panel.id === panelId);
        });
        menuButtons.forEach(function (btn) {
          btn.classList.toggle('active', btn.getAttribute('data-panel') === panelId);
        });
        if (leftTagTreeSection) {
          leftTagTreeSection.hidden = false;
        }
      }

      function activatePanel(panelId, options) {
        setActivePanel(panelId);

        if (panelId === 'panel-files' && !(options && options.skipLoadFiles)) {
          loadFiles();
        } else if (panelId === 'panel-local-disk') {
          loadLocalDisk(activeLocalDiskPath || '');
        }
      }

      function isImageName(name) {
    	      return /\.(png|jpg|jpeg|gif)$/i.test(String(name || ''));
      }

      function isVideoName(name) {
        return /\.(mp4|avi|mkv|rmvb)$/i.test(String(name || ''));
      }

      function isAudioName(name) {
        return /\.(mp3|m4a|aac|wav|ogg|flac)$/i.test(String(name || ''));
      }

      function toVttSidecarName(name) {
        const text = String(name || '');
        const slash = Math.max(text.lastIndexOf('/'), text.lastIndexOf('\\\\'));
        const dot = text.lastIndexOf('.');
        if (dot <= slash) {
          return text + '.vtt';
        }
        return text.slice(0, dot) + '.vtt';
      }

      function isVideoPlayable(fileName, timeoutMs) {
        return new Promise(function (resolve) {
          const encoded = encodeURIComponent(fileName || '');
          const src = downloadUrlForFile(fileName || '', true);
          const video = document.createElement('video');
          let done = false;

          function cleanup(ok, reason) {
            if (done) {
              return;
            }
            done = true;
            video.pause();
            video.removeAttribute('src');
            video.load();
            resolve({ ok: ok, reason: reason || '' });
          }

          const timer = setTimeout(function () {
            cleanup(false, '加载元数据超时');
          }, timeoutMs || 8000);

          video.preload = 'metadata';
          video.muted = true;
          video.playsInline = true;

          video.onloadedmetadata = function () {
            clearTimeout(timer);
            cleanup(true);
          };

          video.onerror = function () {
            clearTimeout(timer);
            cleanup(false, '浏览器不支持该视频编码或容器');
          };

          video.src = src;
        });
      }

      async function verifyUploadedVideos(uploadResult) {
        const items = Array.isArray(uploadResult) ? uploadResult : [];
        const videoNames = items
          .filter(function (it) {
            return it && it.saved === true && isVideoName(it.name || '');
          })
          .map(function (it) {
            return String(it.path || it.name || '');
          });

        if (!videoNames.length) {
          return [];
        }

        const failed = [];
        for (const name of videoNames) {
          const probe = await isVideoPlayable(name, 8000);
          const audioProbe = await checkVideoAudio(name);

          let needConvert = !probe.ok;
          let reason = probe.reason || '无法解析视频';

          if (audioProbe && audioProbe.ok && audioProbe.has_audio && audioProbe.browser_audio_supported === false) {
            needConvert = true;
            reason = '音频编码 ' + (audioProbe.audio_codec || 'unknown') + ' 浏览器不支持';
          }

          if (needConvert) {
            failed.push({ name: name, reason: reason });
          }
        }

        return failed;
      }

      function isTextName(name) {
        return /\.(txt|md|log|csv|json|xml|yaml|yml|ini|conf|c|h|cpp|hpp|cc|java|py|js|ts|sh|go|sql|proto)$/i.test(String(name || ''));
      }

      async function checkVideoAudio(videoFileName) {
        try {
          const response = await fetch(api.probeVideo + '?file=' + encodeURIComponent(videoFileName || ''));
          if (!response.ok) {
            return { ok: false };
          }
          const data = await response.json();
          return data;
        } catch (err) {
          return { ok: false, error: err.message };
        }
      }

      function detectCodeLang(name) {
        const n = String(name || '').toLowerCase();
        if (/\.(c|h)$/i.test(n)) return 'c';
        if (/\.(cpp|hpp|cc)$/i.test(n)) return 'cpp';
        if (/\.java$/i.test(n)) return 'java';
        if (/\.(js|jsx)$/i.test(n)) return 'javascript';
        if (/\.(ts|tsx)$/i.test(n)) return 'typescript';
        if (/\.py$/i.test(n)) return 'python';
        if (/\.go$/i.test(n)) return 'go';
        if (/\.sql$/i.test(n)) return 'sql';
        if (/\.(sh|bash)$/i.test(n)) return 'shell';
        if (/\.proto$/i.test(n)) return 'proto';
        return '';
      }

      function escapeRegExp(text) {
        return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }

      function highlightCodeText(text, lang) {
        const escaped = escapeHtml(text || '');
        const langKeywords = {
          c: ['if', 'else', 'switch', 'case', 'default', 'break', 'continue', 'return', 'for', 'while', 'do', 'typedef', 'struct', 'enum', 'union', 'const', 'static', 'extern', 'volatile', 'unsigned', 'signed', 'sizeof', 'void', 'char', 'short', 'int', 'long', 'float', 'double'],
          cpp: ['if', 'else', 'switch', 'case', 'default', 'break', 'continue', 'return', 'for', 'while', 'do', 'class', 'struct', 'enum', 'namespace', 'template', 'typename', 'using', 'public', 'private', 'protected', 'virtual', 'override', 'const', 'static', 'inline', 'new', 'delete', 'try', 'catch', 'throw', 'auto', 'nullptr', 'this', 'true', 'false', 'void', 'char', 'short', 'int', 'long', 'float', 'double', 'bool'],
          java: ['if', 'else', 'switch', 'case', 'default', 'break', 'continue', 'return', 'for', 'while', 'do', 'class', 'interface', 'enum', 'package', 'import', 'public', 'private', 'protected', 'static', 'final', 'abstract', 'extends', 'implements', 'new', 'this', 'super', 'try', 'catch', 'finally', 'throw', 'throws', 'void', 'boolean', 'byte', 'short', 'int', 'long', 'float', 'double', 'char', 'null', 'true', 'false'],
          javascript: ['if', 'else', 'switch', 'case', 'default', 'break', 'continue', 'return', 'for', 'while', 'do', 'function', 'class', 'extends', 'const', 'let', 'var', 'new', 'this', 'try', 'catch', 'finally', 'throw', 'import', 'export', 'from', 'async', 'await', 'true', 'false', 'null', 'undefined'],
          typescript: ['if', 'else', 'switch', 'case', 'default', 'break', 'continue', 'return', 'for', 'while', 'do', 'function', 'class', 'extends', 'implements', 'interface', 'type', 'enum', 'namespace', 'const', 'let', 'var', 'new', 'this', 'public', 'private', 'protected', 'readonly', 'import', 'export', 'from', 'async', 'await', 'true', 'false', 'null', 'undefined'],
          python: ['if', 'elif', 'else', 'for', 'while', 'break', 'continue', 'return', 'def', 'class', 'import', 'from', 'as', 'try', 'except', 'finally', 'raise', 'with', 'lambda', 'pass', 'yield', 'global', 'nonlocal', 'True', 'False', 'None'],
          go: ['if', 'else', 'switch', 'case', 'default', 'fallthrough', 'for', 'range', 'break', 'continue', 'return', 'func', 'type', 'struct', 'interface', 'map', 'chan', 'select', 'go', 'defer', 'package', 'import', 'const', 'var', 'nil', 'true', 'false'],
          sql: ['select', 'from', 'where', 'insert', 'into', 'values', 'update', 'set', 'delete', 'create', 'table', 'alter', 'drop', 'join', 'left', 'right', 'inner', 'outer', 'on', 'and', 'or', 'not', 'null', 'as', 'group', 'by', 'order', 'limit', 'having', 'distinct', 'union'],
          shell: ['if', 'then', 'else', 'fi', 'for', 'in', 'do', 'done', 'while', 'case', 'esac', 'function', 'return', 'break', 'continue', 'export', 'local'],
          proto: ['syntax', 'package', 'import', 'option', 'message', 'enum', 'service', 'rpc', 'returns', 'repeated', 'optional', 'required', 'oneof', 'map', 'reserved']
        };

        const list = langKeywords[lang];
        if (!list || !list.length) {
          return escaped;
        }

        const pattern = new RegExp('\\b(' + list.map(escapeRegExp).join('|') + ')\\b', 'g');
        return escaped.replace(pattern, '<span class="kw">$1</span>');
      }

      function escapeHtml(str) {
        return String(str)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function closeAudioTagContextMenu() {
        if (!activeAudioTagContextMenu) {
          return;
        }
        if (activeAudioTagContextMenu.parentNode) {
          activeAudioTagContextMenu.parentNode.removeChild(activeAudioTagContextMenu);
        }
        activeAudioTagContextMenu = null;
      }

      function clampFloatingMenuPosition(menuEl, clientX, clientY) {
        if (!menuEl) {
          return;
        }
        const rect = menuEl.getBoundingClientRect();
        const left = Math.max(8, Math.min(clientX, window.innerWidth - rect.width - 8));
        const top = Math.max(8, Math.min(clientY, window.innerHeight - rect.height - 8));
        menuEl.style.left = Math.round(left) + 'px';
        menuEl.style.top = Math.round(top) + 'px';
      }

      function shuffleList(items) {
        const list = Array.isArray(items) ? items.slice() : [];
        for (let i = list.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1));
          const temp = list[i];
          list[i] = list[j];
          list[j] = temp;
        }
        return list;
      }

      function sortAudioFilesForPlaylist(files) {
        return (Array.isArray(files) ? files : []).slice().sort(function (a, b) {
          return getFilePath(a).localeCompare(getFilePath(b), 'zh-CN');
        });
      }

      function getAudioPlaylistFilesByMode(files, mode) {
        const sorted = sortAudioFilesForPlaylist(files);
        if (mode === 'random') {
          return shuffleList(sorted);
        }
        return sorted;
      }

      async function loadAudioFilesForTag(tagId) {
        const data = await fetchJson(api.tagFiles + '?tag_id=' + encodeURIComponent(tagId));
        return (Array.isArray(data.files) ? data.files : []).filter(function (file) {
          return isAudioName(file && file.name);
        });
      }

      function openAudioTagContextMenu(tagId, tagName, clientX, clientY) {
        closeAudioTagContextMenu();

        const menu = document.createElement('div');
        menu.className = 'tag-context-menu';
        menu.innerHTML =
          '<button type="button" class="tag-context-item" data-audio-tag-action="random" data-tag-id="' + escapeHtml(tagId) + '">' + AUDIO_PLAY_MODE_LABELS.random + '</button>' +
          '<button type="button" class="tag-context-item" data-audio-tag-action="sequential" data-tag-id="' + escapeHtml(tagId) + '">' + AUDIO_PLAY_MODE_LABELS.sequential + '</button>' +
          '<button type="button" class="tag-context-item" data-audio-tag-action="loop" data-tag-id="' + escapeHtml(tagId) + '">' + AUDIO_PLAY_MODE_LABELS.loop + '</button>';
        menu.setAttribute('data-tag-id', tagId);
        menu.setAttribute('data-tag-name', tagName || '');
        menu.style.left = Math.round(clientX) + 'px';
        menu.style.top = Math.round(clientY) + 'px';
        document.body.appendChild(menu);
        clampFloatingMenuPosition(menu, clientX, clientY);
        activeAudioTagContextMenu = menu;
      }

      function renderAudioPlaylistItems(container, files, activeFileName) {
        if (!container) {
          return;
        }
        container.innerHTML = files.map(function (file, index) {
          const name = String((file && file.name) || getFilePath(file) || '');
          const itemClass = getFilePath(file) === activeFileName ? 'audio-playlist-item active' : 'audio-playlist-item';
          return '<button type="button" class="' + itemClass + '" data-playlist-index="' + index + '">' +
            '<span class="audio-playlist-item-index">' + String(index + 1) + '</span>' +
            '<span class="audio-playlist-item-name">' + escapeHtml(name) + '</span>' +
          '</button>';
        }).join('');
      }

      function renderAudioPlayModeButtons(activeMode) {
        return ['random', 'sequential', 'loop'].map(function (modeKey) {
          const activeClass = modeKey === activeMode ? 'audio-mode-btn active' : 'audio-mode-btn';
          const label = AUDIO_PLAY_MODE_LABELS[modeKey] || '播放方式';
          const icon = AUDIO_PLAY_MODE_ICONS[modeKey] || '?';
          return '<button type="button" class="' + activeClass + '" data-audio-mode="' + modeKey + '" title="' + escapeHtml(label) + '" aria-label="' + escapeHtml(label) + '">' +
            '<span class="audio-mode-btn-icon">' + icon + '</span>' +
          '</button>';
        }).join('');
      }

      function openAudioPlaylistWindow(tagId, tagName, mode, files) {
        const playlistKey = 'audio-playlist:' + String(tagId || '');
        const existed = openedPreviewWindows.get(playlistKey);
        if (existed && existed.isConnected) {
          closePreviewWindow(existed, playlistKey);
        }

        const displayFiles = sortAudioFilesForPlaylist(files);
        if (!displayFiles.length) {
          throw new Error('该标签下没有可播放的音频文件');
        }

        const win = document.createElement('div');
        win.className = 'floating-preview audio-playlist-preview';
        previewZ += 1;
        win.style.zIndex = String(previewZ);

        win.innerHTML =
          '<div class="preview-head">' +
            '<div class="preview-title">' + escapeHtml((AUDIO_PLAY_MODE_LABELS[mode] || '音频播放') + '：' + (tagName || '音频标签')) + '</div>' +
            '<div class="preview-head-actions">' +
              '<button class="preview-window-btn" type="button" data-window-action="minimize" title="最小化" aria-label="最小化">−</button>' +
              '<button class="preview-window-btn" type="button" data-window-action="maximize" title="最大化" aria-label="最大化">□</button>' +
              '<button class="preview-close" type="button" title="关闭" aria-label="关闭">×</button>' +
            '</div>' +
          '</div>' +
          '<div class="preview-body audio-playlist-body">' +
            '<div class="audio-playlist-meta">' +
              '<div class="audio-playlist-mode-group">' + renderAudioPlayModeButtons(mode) + '</div>' +
              '<div class="audio-playlist-current-name"></div>' +
            '</div>' +
            '<audio class="preview-audio audio-playlist-player" controls preload="metadata"></audio>' +
            '<div class="audio-playlist-panel">' +
              '<div class="audio-playlist-panel-head">' +
                '<div class="audio-playlist-summary">共 <span class="audio-playlist-count"></span> 个音频文件</div>' +
                '<button type="button" class="audio-playlist-toggle-btn" title="收起远程磁盘" aria-label="收起远程磁盘">▾</button>' +
              '</div>' +
              '<div class="audio-playlist-items"></div>' +
            '</div>' +
          '</div>';

        previewLayer.appendChild(win);
        centerPreviewWindow(win);
        openedPreviewWindows.set(playlistKey, win);

        const audioEl = win.querySelector('.audio-playlist-player');
        const currentNameEl = win.querySelector('.audio-playlist-current-name');
        const countEl = win.querySelector('.audio-playlist-count');
        const itemsEl = win.querySelector('.audio-playlist-items');
        const closeBtn = win.querySelector('.preview-close');
        const head = win.querySelector('.preview-head');
        const minimizeBtn = win.querySelector('[data-window-action="minimize"]');
        const maximizeBtn = win.querySelector('[data-window-action="maximize"]');
        const modeGroupEl = win.querySelector('.audio-playlist-mode-group');
        const playlistPanelEl = win.querySelector('.audio-playlist-panel');
        const playlistToggleBtn = win.querySelector('.audio-playlist-toggle-btn');
        let currentIndex = -1;
        let currentFileName = '';
        let currentMode = mode;
        let randomQueue = [];
        let isPlaylistCollapsed = false;

        if (countEl) {
          countEl.textContent = String(displayFiles.length);
        }

        function refillRandomQueue(excludeName) {
          const excluded = String(excludeName || '');
          randomQueue = shuffleList(displayFiles.filter(function (file) {
            return getFilePath(file) !== excluded;
          }));
          if (!randomQueue.length && displayFiles.length === 1) {
            randomQueue = displayFiles.slice();
          }
        }

        function snapshotWindowRect() {
          if (win.classList.contains('is-maximized')) {
            return;
          }
          const rect = win.getBoundingClientRect();
          win.dataset.restoreLeft = Math.round(rect.left) + 'px';
          win.dataset.restoreTop = Math.round(rect.top) + 'px';
          win.dataset.restoreWidth = Math.round(rect.width) + 'px';
          win.dataset.restoreHeight = Math.round(rect.height) + 'px';
        }

        function restoreAudioWindowGeometry() {
          win.classList.remove('is-minimized', 'is-maximized');
          win.style.transform = 'none';
          win.style.resize = 'both';
          win.style.maxHeight = '90vh';
          win.style.width = win.dataset.restoreWidth || '';
          win.style.height = win.dataset.restoreHeight || '';
          win.style.left = win.dataset.restoreLeft || '';
          win.style.top = win.dataset.restoreTop || '';
          if (!win.dataset.restoreLeft || !win.dataset.restoreTop) {
            centerPreviewWindow(win);
          } else {
            clampWindowPosition(win);
          }
        }

        function syncAudioWindowButtons() {
          if (maximizeBtn) {
            const restoreMode = win.classList.contains('is-minimized') || win.classList.contains('is-maximized');
            maximizeBtn.textContent = restoreMode ? '❐' : '□';
            maximizeBtn.title = restoreMode ? '恢复窗口' : '最大化';
            maximizeBtn.setAttribute('aria-label', restoreMode ? '恢复窗口' : '最大化');
          }
        }

        function syncAudioModeUI() {
          if (modeGroupEl) {
            modeGroupEl.innerHTML = renderAudioPlayModeButtons(currentMode);
          }
        }

        function syncAudioWindowTitle() {
          const titleEl = win.querySelector('.preview-title');
          if (titleEl) {
            titleEl.textContent = (AUDIO_PLAY_MODE_LABELS[currentMode] || '音频播放') + '：' + (tagName || '音频标签');
          }
        }

        function syncPlaylistPanelUI() {
          if (playlistPanelEl) {
            playlistPanelEl.classList.toggle('is-collapsed', isPlaylistCollapsed);
          }
          if (playlistToggleBtn) {
            playlistToggleBtn.textContent = isPlaylistCollapsed ? '▸' : '▾';
            playlistToggleBtn.title = isPlaylistCollapsed ? '展开远程磁盘' : '收起远程磁盘';
            playlistToggleBtn.setAttribute('aria-label', isPlaylistCollapsed ? '展开远程磁盘' : '收起远程磁盘');
          }
        }

        function togglePlaylistPanel() {
          isPlaylistCollapsed = !isPlaylistCollapsed;
          syncPlaylistPanelUI();
        }

        function setAudioPlayMode(nextMode) {
          if (!AUDIO_PLAY_MODE_LABELS[nextMode] || currentMode === nextMode) {
            return;
          }
          currentMode = nextMode;
          if (currentMode === 'random') {
            refillRandomQueue(currentFileName);
          }
          syncAudioModeUI();
          syncAudioWindowTitle();
        }

        function minimizeAudioWindow() {
          if (win.classList.contains('is-minimized')) {
            return;
          }
          snapshotWindowRect();
          win.classList.remove('is-maximized');
          win.classList.add('is-minimized');
          win.style.transform = 'none';
          win.style.resize = 'none';
          win.style.height = '';
          win.style.maxHeight = '';
          clampWindowPosition(win);
          syncAudioWindowButtons();
        }

        function maximizeAudioWindow() {
          if (win.classList.contains('is-minimized') || win.classList.contains('is-maximized')) {
            restoreAudioWindowGeometry();
            syncAudioWindowButtons();
            return;
          }
          snapshotWindowRect();
          win.classList.add('is-maximized');
          win.classList.remove('is-minimized');
          win.style.transform = 'none';
          win.style.resize = 'none';
          win.style.left = '22px';
          win.style.top = '22px';
          win.style.width = 'calc(100vw - 44px)';
          win.style.height = 'calc(100vh - 44px)';
          win.style.maxHeight = 'calc(100vh - 44px)';
          syncAudioWindowButtons();
        }

        function updateCurrentTrack(index, fileName) {
          currentIndex = index;
          currentFileName = String(fileName || '');
          if (currentNameEl) {
            currentNameEl.textContent = currentFileName;
          }
          renderAudioPlaylistItems(itemsEl, displayFiles, currentFileName);
          const activeBtn = itemsEl ? itemsEl.querySelector('.audio-playlist-item.active') : null;
          if (activeBtn) {
            activeBtn.scrollIntoView({ block: 'nearest' });
          }
        }

        function playIndex(index, autoplay) {
          const current = displayFiles[index];
          if (!current || !audioEl) {
            return;
          }
          const fileName = getFilePath(current);
          updateCurrentTrack(index, fileName);
          audioEl.src = downloadUrlForFile(fileName, true) + '&v=' + Date.now();
          audioEl.load();
          if (autoplay !== false) {
            audioEl.play().catch(function () {});
          }
        }

        function playFileByName(fileName, autoplay) {
          const targetName = String(fileName || '');
          const nextIndex = displayFiles.findIndex(function (file) {
            return getFilePath(file) === targetName;
          });
          if (nextIndex >= 0) {
            playIndex(nextIndex, autoplay);
          }
        }

        function playNextRandomTrack() {
          if (!displayFiles.length) {
            return;
          }
          if (!randomQueue.length) {
            refillRandomQueue(currentFileName);
          }
          const nextFile = randomQueue.shift();
          if (!nextFile) {
            return;
          }
          playFileByName(getFilePath(nextFile), true);
        }

        function moveNextTrack() {
          if (!displayFiles.length) {
            return;
          }
          if (currentMode === 'loop') {
            playIndex((currentIndex + 1) % displayFiles.length, true);
            return;
          }
          if (currentMode === 'random') {
            if (displayFiles.length === 1) {
              playIndex(0, true);
              return;
            }
            playNextRandomTrack();
            return;
          }
          if (currentIndex + 1 < displayFiles.length) {
            playIndex(currentIndex + 1, true);
          }
        }

        if (itemsEl) {
          itemsEl.addEventListener('click', function (e) {
            const itemBtn = e.target.closest('.audio-playlist-item[data-playlist-index]');
            if (!itemBtn) {
              return;
            }
            const nextIndex = Number(itemBtn.getAttribute('data-playlist-index') || '-1');
            if (nextIndex >= 0) {
              playIndex(nextIndex, true);
              if (currentMode === 'random') {
                refillRandomQueue(getFilePath(displayFiles[nextIndex] || {}));
              }
            }
          });
        }

        if (modeGroupEl) {
          modeGroupEl.addEventListener('click', function (e) {
            const modeBtn = e.target.closest('.audio-mode-btn[data-audio-mode]');
            if (!modeBtn) {
              return;
            }
            const nextMode = modeBtn.getAttribute('data-audio-mode') || '';
            setAudioPlayMode(nextMode);
          });
        }

        if (playlistToggleBtn) {
          playlistToggleBtn.addEventListener('click', function () {
            togglePlaylistPanel();
          });
        }

        if (audioEl) {
          audioEl.addEventListener('ended', function () {
            moveNextTrack();
          });
        }

        if (minimizeBtn) {
          minimizeBtn.addEventListener('click', function () {
            minimizeAudioWindow();
          });
        }

        if (maximizeBtn) {
          maximizeBtn.addEventListener('click', function () {
            maximizeAudioWindow();
          });
        }

        closeBtn.addEventListener('click', function () {
          closePreviewWindow(win, playlistKey);
        });

        win.addEventListener('mousedown', function () {
          bringToFront(win);
        });

        head.addEventListener('mousedown', function (e) {
          if (e.target.closest('.preview-close') || e.target.closest('.preview-window-btn') || win.classList.contains('is-maximized')) {
            return;
          }
          snapshotWindowRect();
          const rect = win.getBoundingClientRect();
          bringToFront(win);
          activeDrag = {
            win: win,
            startX: e.clientX,
            startY: e.clientY,
            left: rect.left,
            top: rect.top
          };
          win.style.transform = 'none';
          e.preventDefault();
        });

        syncAudioWindowButtons();

        syncAudioModeUI();
        syncAudioWindowTitle();
        syncPlaylistPanelUI();

        if (currentMode === 'random') {
          refillRandomQueue('');
          playNextRandomTrack();
        } else {
          playIndex(0, true);
        }
      }

      async function startAudioPlaylistFromTag(tagId, tagName, mode) {
        const files = await loadAudioFilesForTag(tagId);
        if (!files.length) {
          throw new Error('该标签下没有音频文件');
        }
        openAudioPlaylistWindow(tagId, tagName, mode, files);
      }

      function showStatus(msg, type) {
        statusBox.className = 'status show ' + (type || 'ok');
        statusBox.textContent = msg;
      }

      function closeTagDialog(value) {
        if (!tagDialog) {
          return;
        }
        tagDialog.hidden = true;
        document.body.style.overflow = '';
        const resolver = activeTagDialogResolver;
        activeTagDialogResolver = null;
        if (resolver) {
          resolver(value);
        }
      }

      function askTagName(options) {
        if (!tagDialog || !tagDialogTitle || !tagDialogDesc || !tagDialogInput) {
          return Promise.resolve(null);
        }

        if (activeTagDialogResolver) {
          closeTagDialog(null);
        }

        const opts = options || {};
        tagDialogTitle.textContent = String(opts.title || '新建标签');
        tagDialogDesc.textContent = String(opts.description || '请输入标签名称。');
        tagDialogInput.value = String(opts.initialValue || '');
        tagDialogInput.placeholder = String(opts.placeholder || '请输入标签名称');
        tagDialog.hidden = false;
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(function () {
          tagDialogInput.focus();
          tagDialogInput.select();
        });

        return new Promise(function (resolve) {
          activeTagDialogResolver = resolve;
        });
      }

      function makeTagId() {
        return 'tag_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
      }

      function loadLegacyTagTreeState() {
        try {
          const raw = localStorage.getItem(TAG_TREE_STORAGE_KEY);
          if (!raw) {
            return [];
          }

          const parsed = JSON.parse(raw);
          if (!Array.isArray(parsed)) {
            return [];
          }

          const normalized = [];
          for (let i = 0; i < parsed.length; i += 1) {
            const node = normalizeTagNode(parsed[i], 1);
            if (node) {
              normalized.push(node);
            }
          }
          return normalized;
        } catch (_) {
          return [];
        }
      }

      function normalizeTagNode(node, level) {
        if (!node || level > TAG_MAX_LEVEL) {
          return null;
        }

        const name = String(node.name || '').trim();
        if (!name) {
          return null;
        }

        const files = Array.isArray(node.files)
          ? node.files.map(function (it) { return String(it || ''); }).filter(Boolean)
          : [];

        const childrenInput = Array.isArray(node.children) ? node.children : [];
        const children = [];
        for (let i = 0; i < childrenInput.length; i += 1) {
          const normalized = normalizeTagNode(childrenInput[i], level + 1);
          if (normalized) {
            children.push(normalized);
          }
        }

        return {
          id: String(node.id || makeTagId()),
          name: name.slice(0, 60),
          files: Array.from(new Set(files)),
          children: children
        };
      }

      async function loadTagTreeState() {
        try {
          const data = await fetchJson(api.tags);
          const parsed = Array.isArray(data.tags) ? data.tags : [];
          let source = parsed;

          if (!source.length) {
            const legacyNodes = loadLegacyTagTreeState();
            if (legacyNodes.length) {
              await migrateLegacyTagTree(legacyNodes);
              const refreshed = await fetchJson(api.tags);
              source = Array.isArray(refreshed.tags) ? refreshed.tags : [];
            }
          }

          const normalized = [];
          for (let i = 0; i < source.length; i += 1) {
            const node = normalizeTagNode(source[i], 1);
            if (node) {
              normalized.push(node);
            }
          }
          tagTree = normalized;
        } catch (_) {
          tagTree = [];
        }
      }

      function saveTagTreeState() {
      }

      function hasTagChildren(node) {
        return !!(node && Array.isArray(node.children) && node.children.length > 0);
      }

      function getTagNodeToggleSymbol(node, level) {
        if (level >= TAG_MAX_LEVEL) {
          return '';
        }
        if (!hasTagChildren(node)) {
          return '+';
        }
        return expandedTagNodeIds.has(node.id) ? 'v' : '>';
      }

      function buildTagNodeHtml(node, level) {
        const safeLevel = Math.max(1, Math.min(TAG_MAX_LEVEL, level || 1));
        const indent = (safeLevel - 1) * 5;
        const canExpand = safeLevel < TAG_MAX_LEVEL;
        const hasChildren = hasTagChildren(node);
        const expanded = expandedTagNodeIds.has(node.id);
        const toggleSymbol = getTagNodeToggleSymbol(node, safeLevel);
        const restrictedRootType = getRestrictedRootTagType(node, safeLevel);
        const restrictedBadgeHtml = restrictedRootType
          ? '<span class="tag-limit-badge ' + restrictedRootType + '">' + (restrictedRootType === 'video' ? '仅视频' : (restrictedRootType === 'audio' ? '仅音频' : '仅图片')) + '</span>'
          : '';

        let childHtml = '';
        if (canExpand && hasChildren && expanded) {
          childHtml = (Array.isArray(node.children) ? node.children : []).map(function (child) {
            return buildTagNodeHtml(child, safeLevel + 1);
          }).join('');
        }

        const nameInlineStyle = 'cursor:pointer;';
        const toggleBtn = hasChildren
          ? '<button type="button" class="tag-node-toggle" data-tag-id="' + node.id + '">' + toggleSymbol + '</button>'
          : '<span class="tag-node-toggle placeholder"></span>';

        const nodeClass = activeFilterTagId === node.id ? 'tag-node active' : 'tag-node';
        const canDeleteTag = !isProtectedRestrictedRootTag(node, safeLevel);
        const isRenaming = activeTagRenameId === node.id && canRenameTagNode(node, safeLevel);
        const tagNameHtml = isRenaming
          ? '<input class="tag-rename-input" data-tag-rename-input="' + escapeHtml(node.id) + '" value="' + escapeHtml(node.name) + '" maxlength="60">'
          : '<span class="tag-node-name" data-tag-id="' + node.id + '">' + escapeHtml(node.name) + '</span>';
        const actionHtml =
          '<div class="tag-actions">' +
            (canExpand
              ? '<button type="button" class="tag-inline-btn" data-tag-create="' + node.id + '" data-tag-level="' + safeLevel + '" title="新增子标签">+</button>'
              : '') +
            (canDeleteTag
              ? '<button type="button" class="tag-inline-btn danger" data-tag-delete="' + node.id + '" title="删除标签">-</button>'
              : '') +
          '</div>';

        return (
          '<div class="' + nodeClass + '" data-tag-id="' + node.id + '">' +
            '<div class="tag-line">' +
              '<div class="tag-line-main" style="padding-left:' + indent + 'px;">' +
                toggleBtn +
                '<span class="tag-node-name-wrap" style="' + nameInlineStyle + '">' +
                  tagNameHtml +
                  restrictedBadgeHtml +
                '</span>' +
              '</div>' +
              actionHtml +
            '</div>' +
            childHtml +
          '</div>'
        );
      }

      function updateFilesTagToggleButton() {
        if (!filesTagToggleBtn) {
          return;
        }
        filesTagToggleBtn.textContent = '+';
        filesTagToggleBtn.setAttribute('title', '新增一级标签');
      }

      function renderTagTree() {
        if (!tagManager) {
          return;
        }

        updateFilesTagToggleButton();
        if (!tagTree.length) {
          tagManager.classList.remove('open');
          tagManager.innerHTML = '';
          return;
        }

        const treeHtml = '<div class="tag-tree">' + tagTree.map(function (node) {
          return buildTagNodeHtml(node, 1);
        }).join('') + '</div>';

        tagManager.classList.add('open');
        tagManager.innerHTML = treeHtml;
        focusActiveTagRenameInput();
      }

      function focusActiveTagRenameInput() {
        if (!tagManager || !activeTagRenameId) {
          return;
        }
        setTimeout(function () {
          if (!tagManager || !activeTagRenameId) {
            return;
          }
          const input = tagManager.querySelector('.tag-rename-input[data-tag-rename-input]');
          if (!input) {
            return;
          }
          input.focus();
          input.select();
        }, 0);
      }

      function startTagRename(tagId) {
        const id = String(tagId || '');
        const meta = findTagMetaById(id);
        if (!meta || !canRenameTagNode(meta.node, meta.level)) {
          return;
        }
        activeTagRenameId = id;
        renderTagTree();
      }

      function cancelTagRename() {
        if (!activeTagRenameId) {
          return;
        }
        activeTagRenameId = '';
        renderTagTree();
      }

      async function submitTagRename(input) {
        if (!input) {
          return;
        }
        const tagId = String(input.getAttribute('data-tag-rename-input') || '');
        if (!tagId || activeTagRenameId !== tagId) {
          return;
        }
        if (tagRenameRequestId === tagId) {
          return;
        }

        const meta = findTagMetaById(tagId);
        if (!meta || !canRenameTagNode(meta.node, meta.level)) {
          activeTagRenameId = '';
          renderTagTree();
          return;
        }

        const nextName = String(input.value || '').trim();
        if (!nextName) {
          showStatus('标签名称不能为空', 'err');
          input.focus();
          return;
        }
        if (nextName === String(meta.node.name || '')) {
          activeTagRenameId = '';
          renderTagTree();
          return;
        }

        try {
          tagRenameRequestId = tagId;
          await fetchJson(
            api.tagRename + '?id=' + encodeURIComponent(tagId) + '&name=' + encodeURIComponent(nextName),
            { method: 'POST' }
          );
          activeTagRenameId = '';
          await loadTagTreeState();
          renderTagTree();
          if (activeFilterTagId === tagId) {
            await showFilesForTag(tagId);
          } else {
            updateFileViewContext();
          }
          showStatus('标签已改名：' + nextName, 'ok');
        } catch (err) {
          showStatus('标签改名失败：' + err.message, 'err');
          input.focus();
          input.select();
        } finally {
          tagRenameRequestId = '';
        }
      }

      function setDropHighlight(nodeEl) {
        if (activeDropTagNode && activeDropTagNode !== nodeEl) {
          activeDropTagNode.classList.remove('drop-target');
        }
        activeDropTagNode = nodeEl || null;
        if (activeDropTagNode) {
          activeDropTagNode.classList.add('drop-target');
        }
      }

      function clearDropHighlight() {
        if (!activeDropTagNode) {
          return;
        }
        activeDropTagNode.classList.remove('drop-target');
        activeDropTagNode = null;
      }

      function walkTagNodes(list, visitor, level, parent, parentList) {
        const nodes = Array.isArray(list) ? list : [];
        for (let i = 0; i < nodes.length; i += 1) {
          const node = nodes[i];
          const stop = visitor(node, level, parent, parentList, i);
          if (stop) {
            return true;
          }
          if (walkTagNodes(node.children, visitor, level + 1, node, node.children)) {
            return true;
          }
        }
        return false;
      }

      function findTagMetaById(tagId) {
        let found = null;
        walkTagNodes(tagTree, function (node, level, parent, parentList, index) {
          if (node.id === tagId) {
            found = {
              node: node,
              level: level,
              parent: parent,
              parentList: parentList,
              index: index
            };
            return true;
          }
          return false;
        }, 1, null, tagTree);
        return found;
      }

      function getTagRootMeta(tagId) {
        let meta = findTagMetaById(tagId);
        if (!meta) {
          return null;
        }
        while (meta.parent) {
          meta = findTagMetaById(meta.parent.id);
          if (!meta) {
            return null;
          }
        }
        return meta;
      }

      function getTagFileTypeConstraint(tagId) {
        const rootMeta = getTagRootMeta(tagId);
        if (!rootMeta || !rootMeta.node) {
          return '';
        }
        const rootName = String(rootMeta.node.name || '').trim();
        if (rootName === '视频') {
          return 'video';
        }
        if (rootName === '音频') {
          return 'audio';
        }
        if (rootName === '图片') {
          return 'image';
        }
        return '';
      }

      function getRestrictedRootTagType(node, level) {
        if ((level || 1) !== 1 || !node || !node.id) {
          return '';
        }
        return getTagFileTypeConstraint(node.id);
      }

      function isProtectedRestrictedRootTag(node, level) {
        return !!getRestrictedRootTagType(node, level);
      }

      function canRenameTagNode(node, level) {
        return !!(node && node.id) && !isProtectedRestrictedRootTag(node, level);
      }

      function canBindFileToTagOnClient(tagId, fileName) {
        const constraint = getTagFileTypeConstraint(tagId);
        if (!constraint) {
          return { ok: true, message: '' };
        }
        if (constraint === 'video' && !isVideoName(fileName)) {
          return { ok: false, message: '视频标签及其子标签只能引用视频文件（mp4/avi/mkv/rmvb）' };
        }
        if (constraint === 'audio' && !isAudioName(fileName)) {
          return { ok: false, message: '音频标签及其子标签只能引用音频文件（mp3/m4a/aac/wav/ogg/flac）' };
        }
        if (constraint === 'image' && !isImageName(fileName)) {
          return { ok: false, message: '图片标签及其子标签只能引用图片文件（png/jpg/jpeg/gif）' };
        }
        return { ok: true, message: '' };
      }

      async function addTagNode(parentTagId, name) {
        const cleanName = String(name || '').trim();
        if (!cleanName) {
          return { ok: false, message: '标签名称不能为空' };
        }

        try {
          const created = await fetchJson(
            api.tagCreate + '?name=' + encodeURIComponent(cleanName)
              + (parentTagId ? '&parent_id=' + encodeURIComponent(parentTagId) : ''),
            { method: 'POST' }
          );
          return { ok: true, id: created.id || '' };
        } catch (err) {
          return { ok: false, message: err.message };
        }
      }

      async function migrateLegacyTagNode(node, parentTagId) {
        const createResult = await addTagNode(parentTagId, node.name || '');
        if (!createResult.ok || !createResult.id) {
          throw new Error(createResult.message || '创建标签失败');
        }

        const serverTagId = createResult.id;
        const files = Array.isArray(node.files) ? node.files : [];
        for (let i = 0; i < files.length; i += 1) {
          const fileName = String(files[i] || '');
          if (!fileName) {
            continue;
          }
          await bindFileToTag(serverTagId, fileName);
        }

        const children = Array.isArray(node.children) ? node.children : [];
        for (let i = 0; i < children.length; i += 1) {
          await migrateLegacyTagNode(children[i], serverTagId);
        }
      }

      async function migrateLegacyTagTree(legacyNodes) {
        for (let i = 0; i < legacyNodes.length; i += 1) {
          await migrateLegacyTagNode(legacyNodes[i], '');
        }
        try {
          localStorage.removeItem(TAG_TREE_STORAGE_KEY);
        } catch (_) {
        }
      }

      async function removeTagNode(tagId) {
        try {
          return await fetchJson(api.tagDelete + '?id=' + encodeURIComponent(tagId), {
            method: 'POST'
          });
        } catch (_) {
          return null;
        }
      }

      function clearExpandedNodeState(node) {
        if (!node) {
          return;
        }
        expandedTagNodeIds.delete(node.id);
        const children = Array.isArray(node.children) ? node.children : [];
        for (let i = 0; i < children.length; i += 1) {
          clearExpandedNodeState(children[i]);
        }
      }

      function getFileNameSet() {
        const set = new Set();
        allFiles.forEach(function (it) {
          const name = String((it && it.name) || '');
          if (name) {
            set.add(name);
          }
        });
        return set;
      }

      async function bindFileToTag(tagId, fileName) {
        const cleanName = String(fileName || '');
        if (!cleanName) {
          return { ok: false, message: '请选择要引用的文件' };
        }

        try {
          await fetchJson(
            api.tagBind + '?tag_id=' + encodeURIComponent(tagId) + '&file=' + encodeURIComponent(cleanName),
            { method: 'POST' }
          );
          return { ok: true };
        } catch (err) {
          return { ok: false, message: err.message };
        }
      }

      async function unbindFileFromTag(tagId, fileName) {
        try {
          await fetchJson(
            api.tagUnbind + '?tag_id=' + encodeURIComponent(tagId) + '&file=' + encodeURIComponent(fileName),
            { method: 'POST' }
          );
          return true;
        } catch (_) {
          return false;
        }
      }

      function removeFileRefsFromAllTags(fileName) {
        return 0;
      }

      function pruneTagRefsByCurrentFiles() {
        const available = getFileNameSet();
        let changed = false;
        walkTagNodes(tagTree, function (node) {
          const before = node.files.length;
          node.files = node.files.filter(function (it) {
            return available.has(it);
          });
          if (before !== node.files.length) {
            changed = true;
          }
          return false;
        }, 1, null, tagTree);
        return changed;
      }

      function showManualTranscodePrompt(candidates) {
        const list = Array.isArray(candidates) ? candidates : [];
        if (!list.length) {
          return;
        }

        statusBox.className = 'status show warn';
        statusBox.innerHTML =
          '<div>检测到以下视频建议转码（需你确认后才会开始）：</div>' +
          '<div class="transcode-list">' +
          list.map(function (item) {
            const name = String(item.name || '');
            const reason = String(item.reason || '浏览器兼容性不足');
            const encoded = encodeURIComponent(name);
            return (
              '<div class="transcode-item" data-transcode-item="' + encoded + '">' +
                '<div class="transcode-item-head">' +
                  '<div>' +
                    '<div class="transcode-item-name">' + escapeHtml(name) + '</div>' +
                    '<div class="transcode-item-reason">原因：' + escapeHtml(reason) + '</div>' +
                  '</div>' +
                  '<div class="transcode-actions">' +
                    '<button type="button" class="transcode-btn" data-transcode-file="' + encoded + '">确认转码</button>' +
                    '<button type="button" class="transcode-cancel-btn" data-cancel-file="' + encoded + '" disabled>取消转码</button>' +
                    '<div class="transcode-progress"><div class="transcode-progress-fill" data-progress-fill="' + encoded + '"></div></div>' +
                    '<span class="transcode-progress-text" data-progress-text="' + encoded + '">等待确认</span>' +
                  '</div>' +
                '</div>' +
              '</div>'
            );
          }).join('') +
          '</div>';
      }

      function updateTranscodeProgress(encodedName, percent, text) {
        const fill = statusBox.querySelector('[data-progress-fill="' + encodedName + '"]');
        const label = statusBox.querySelector('[data-progress-text="' + encodedName + '"]');
        if (fill) {
          fill.style.width = Math.max(0, Math.min(100, percent || 0)) + '%';
        }
        if (label) {
          label.textContent = text || '';
        }
      }

      function setTranscodeVisualState(encodedName, state) {
        const item = statusBox.querySelector('[data-transcode-item="' + encodedName + '"]');
        const fill = statusBox.querySelector('[data-progress-fill="' + encodedName + '"]');
        if (item) {
          item.classList.remove('state-running', 'state-done', 'state-failed', 'state-cancelled');
          if (state) {
            item.classList.add('state-' + state);
          }
        }
        if (fill) {
          fill.classList.remove('state-done', 'state-failed', 'state-cancelled');
          if (state === 'done' || state === 'failed' || state === 'cancelled') {
            fill.classList.add('state-' + state);
          }
        }
      }

      function setTranscodeTaskId(encodedName, taskId) {
        const item = statusBox.querySelector('[data-transcode-item="' + encodedName + '"]');
        if (!item) {
          return;
        }
        if (taskId) {
          item.setAttribute('data-task-id', taskId);
        } else {
          item.removeAttribute('data-task-id');
        }
      }

      function getTranscodeTaskId(encodedName) {
        const item = statusBox.querySelector('[data-transcode-item="' + encodedName + '"]');
        return item ? (item.getAttribute('data-task-id') || '') : '';
      }

      function setTranscodeButtons(encodedName, options) {
        const opts = options || {};
        const startBtn = statusBox.querySelector('[data-transcode-file="' + encodedName + '"]');
        const cancelBtn = statusBox.querySelector('[data-cancel-file="' + encodedName + '"]');
        if (startBtn && typeof opts.startDisabled === 'boolean') {
          startBtn.disabled = opts.startDisabled;
        }
        if (cancelBtn && typeof opts.cancelDisabled === 'boolean') {
          cancelBtn.disabled = opts.cancelDisabled;
        }
      }

      function upsertTranscodeTaskItem(item) {
        if (!item || !item.name) {
          return;
        }

        const encoded = encodeURIComponent(String(item.name));
        if (!statusBox.querySelector('.transcode-list')) {
          statusBox.className = 'status show warn';
          statusBox.innerHTML =
            '<div>检测到以下视频建议转码（需你确认后才会开始）：</div>' +
            '<div class="transcode-list"></div>';
        }

        const listEl = statusBox.querySelector('.transcode-list');
        if (!listEl) {
          return;
        }

        let row = statusBox.querySelector('[data-transcode-item="' + encoded + '"]');
        if (!row) {
          row = document.createElement('div');
          row.className = 'transcode-item state-running';
          row.setAttribute('data-transcode-item', encoded);
          row.innerHTML =
            '<div class="transcode-item-head">' +
              '<div>' +
                '<div class="transcode-item-name"></div>' +
                '<div class="transcode-item-reason"></div>' +
              '</div>' +
              '<div class="transcode-actions">' +
                '<button type="button" class="transcode-btn" data-transcode-file="' + encoded + '" disabled>确认转码</button>' +
                '<button type="button" class="transcode-cancel-btn" data-cancel-file="' + encoded + '">取消转码</button>' +
                '<div class="transcode-progress"><div class="transcode-progress-fill" data-progress-fill="' + encoded + '"></div></div>' +
                '<span class="transcode-progress-text" data-progress-text="' + encoded + '"></span>' +
              '</div>' +
            '</div>';
          listEl.appendChild(row);
        }

        const title = row.querySelector('.transcode-item-name');
        if (title) {
          title.textContent = String(item.name);
        }

        const reason = row.querySelector('.transcode-item-reason');
        if (reason) {
          reason.textContent = '状态：' + String(item.message || '后台转码中');
        }

        setTranscodeTaskId(encoded, String(item.task_id || ''));
        setTranscodeButtons(encoded, { startDisabled: true, cancelDisabled: !!item.cancel_requested });
        setTranscodeVisualState(encoded, item.cancel_requested ? 'cancelled' : 'running');
        updateTranscodeProgress(encoded, Number(item.progress || 0), String(item.message || '转码中'));
      }

      async function recoverRunningTranscodeTasks() {
        try {
          const data = await fetchJson(api.convertTasks);
          const tasks = Array.isArray(data.tasks) ? data.tasks : [];
          for (let i = 0; i < tasks.length; i += 1) {
            const task = tasks[i];
            if (!task || !task.task_id || !task.name) {
              continue;
            }
            upsertTranscodeTaskItem(task);
            const encoded = encodeURIComponent(String(task.name));
            stopTranscodePolling(encoded);
            const timer = setInterval(function () {
              pollTranscodeProgress(encoded, String(task.task_id));
            }, 1000);
            transcodeProgressTimers.set(encoded, timer);
            await pollTranscodeProgress(encoded, String(task.task_id));
          }
        } catch (_) {
        }
      }

      function setTranscodeReason(encodedName, text) {
        const item = statusBox.querySelector('[data-transcode-item="' + encodedName + '"]');
        if (!item) {
          return;
        }
        const reason = item.querySelector('.transcode-item-reason');
        if (reason) {
          reason.textContent = text || '';
        }
      }

      function stopTranscodePolling(encodedName) {
        const timer = transcodeProgressTimers.get(encodedName);
        if (timer) {
          clearInterval(timer);
          transcodeProgressTimers.delete(encodedName);
        }
      }

      async function pollTranscodeProgress(encodedName, taskId) {
        try {
          const data = await fetchJson(api.convertProgress + '?task_id=' + encodeURIComponent(taskId));
          const progress = Number(data.progress || 0);
          updateTranscodeProgress(encodedName, progress, (data.message || '转码中') + ' ' + Math.max(0, Math.min(100, Math.round(progress))) + '%');

          if (data.done) {
            stopTranscodePolling(encodedName);
            setTranscodeTaskId(encodedName, '');
            if (data.success) {
              setTranscodeVisualState(encodedName, 'done');
              updateTranscodeProgress(encodedName, 100, '已完成');
              setTranscodeReason(encodedName, '状态：已完成，输出文件 ' + String(data.name || decodeURIComponent(encodedName)));
              setTranscodeButtons(encodedName, { startDisabled: true, cancelDisabled: true });
              await loadFiles();
            } else {
              const cancelled = data.cancel_requested || String(data.message || '').indexOf('取消') >= 0;
              setTranscodeVisualState(encodedName, cancelled ? 'cancelled' : 'failed');
              updateTranscodeProgress(encodedName, progress, cancelled ? '已取消' : '失败');
              setTranscodeReason(encodedName, cancelled
                ? '状态：已取消'
                : '状态：失败，' + String(data.error || data.message || '未知错误'));
              setTranscodeButtons(encodedName, { startDisabled: false, cancelDisabled: true });
            }
          }
        } catch (err) {
          stopTranscodePolling(encodedName);
          setTranscodeTaskId(encodedName, '');
          setTranscodeVisualState(encodedName, 'failed');
          updateTranscodeProgress(encodedName, 0, '进度查询失败');
          setTranscodeReason(encodedName, '状态：进度查询失败，' + err.message);
          setTranscodeButtons(encodedName, { startDisabled: false, cancelDisabled: true });
        }
      }

      async function cancelManualTranscode(encodedName) {
        const taskId = getTranscodeTaskId(encodedName);
        if (!taskId) {
          setTranscodeReason(encodedName, '状态：找不到任务号，无法取消');
          return;
        }

        try {
          setTranscodeButtons(encodedName, { cancelDisabled: true });
          await fetchJson(api.convertCancel + '?task_id=' + encodeURIComponent(taskId), {
            method: 'POST'
          });
          setTranscodeVisualState(encodedName, 'cancelled');
          updateTranscodeProgress(encodedName, 0, '取消中');
          setTranscodeReason(encodedName, '状态：已发送取消请求，等待后台停止');
        } catch (err) {
          setTranscodeVisualState(encodedName, 'failed');
          setTranscodeReason(encodedName, '状态：取消失败，' + err.message);
          setTranscodeButtons(encodedName, { cancelDisabled: false });
        }
      }

      async function startManualTranscode(encodedName) {
        setTranscodeButtons(encodedName, { startDisabled: true, cancelDisabled: true });

        const fileName = decodeURIComponent(encodedName);
        try {
          setTranscodeVisualState(encodedName, 'running');
          updateTranscodeProgress(encodedName, 0, '任务创建中...');
          setTranscodeReason(encodedName, '状态：正在请求后台启动转码任务');
          const data = await fetchJson(api.convertVideo + '?file=' + encodeURIComponent(fileName), {
            method: 'POST'
          });

          if (data.completed) {
            setTranscodeVisualState(encodedName, 'done');
            updateTranscodeProgress(encodedName, 100, '无需转码');
            setTranscodeReason(encodedName, '状态：文件已经可直接播放');
            setTranscodeButtons(encodedName, { startDisabled: true, cancelDisabled: true });
            return;
          }

          if (!data.task_id) {
            throw new Error('missing task id');
          }

          setTranscodeTaskId(encodedName, String(data.task_id));
          setTranscodeReason(encodedName, '状态：后台任务已启动，任务号 ' + String(data.task_id));
          updateTranscodeProgress(encodedName, Number(data.progress || 0), '已启动');
          setTranscodeButtons(encodedName, { startDisabled: true, cancelDisabled: false });
          stopTranscodePolling(encodedName);
          const timer = setInterval(function () {
            pollTranscodeProgress(encodedName, data.task_id);
          }, 1000);
          transcodeProgressTimers.set(encodedName, timer);
          await pollTranscodeProgress(encodedName, data.task_id);
        } catch (err) {
          stopTranscodePolling(encodedName);
          setTranscodeTaskId(encodedName, '');
          setTranscodeVisualState(encodedName, 'failed');
          updateTranscodeProgress(encodedName, 0, '失败：' + err.message);
          setTranscodeReason(encodedName, '状态：失败，' + err.message);
          setTranscodeButtons(encodedName, { startDisabled: false, cancelDisabled: true });
        }
      }

      function resetStatus() {
        transcodeProgressTimers.forEach(function (timer) {
          clearInterval(timer);
        });
        transcodeProgressTimers.clear();
        statusBox.className = 'status';
        statusBox.textContent = '';
      }

      function setUploadProgress(percent, text) {
        const p = Math.max(0, Math.min(100, Number(percent) || 0));
        uploadProgress.style.display = 'block';
        uploadProgressFill.style.width = p + '%';
        uploadProgressText.textContent = text || ('上传中 ' + p + '%');
      }

      function hideUploadProgress() {
        uploadProgress.style.display = 'none';
        uploadProgressFill.style.width = '0%';
        uploadProgressText.textContent = '准备上传...';
      }

      function safeTime(file) {
        const n = Number(file.uploaded_at || 0);
        return Number.isFinite(n) ? n : 0;
      }

      function safeSize(file) {
        const n = Number(file.size || 0);
        return Number.isFinite(n) ? n : 0;
      }

      function formatNumber(num) {
        return String(Number(num) || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }

      function normalizeFolderNode(node) {
        const item = node && typeof node === 'object' ? node : {};
        const children = Array.isArray(item.children) ? item.children.map(normalizeFolderNode) : [];
        return {
          name: String(item.name || ''),
          path: String(item.path || ''),
          parent_path: String(item.parent_path || ''),
          file_count: Number(item.file_count || 0),
          locked: !!item.locked,
          children: children
        };
      }

      function ensureFolderPathExpanded(path) {
        const text = String(path || '');
        expandedFolderPaths.add('');
        if (!text) {
          return;
        }
        const parts = text.split('/');
        let current = '';
        parts.forEach(function (part) {
          current = current ? (current + '/' + part) : part;
          expandedFolderPaths.add(current);
        });
      }

      function findFolderNodeByPath(path, nodes) {
        const target = String(path || '');
        const list = Array.isArray(nodes) ? nodes : folderTreeData;
        for (let i = 0; i < list.length; i += 1) {
          const node = list[i];
          if (String((node && node.path) || '') === target) {
            return node;
          }
          const found = findFolderNodeByPath(target, node && node.children);
          if (found) {
            return found;
          }
        }
        return null;
      }

      function findFolderTreeNodeElement(path) {
        if (!folderTree) {
          return null;
        }
        const target = String(path || '');
        const nodes = folderTree.querySelectorAll('.folder-tree-node[data-folder-path]');
        for (let i = 0; i < nodes.length; i += 1) {
          const node = nodes[i];
          if (String(node.getAttribute('data-folder-path') || '') === target) {
            return node;
          }
        }
        return null;
      }

      function scrollFolderPathIntoView(path) {
        const node = findFolderTreeNodeElement(path);
        if (!node || typeof node.scrollIntoView !== 'function') {
          return;
        }
        node.scrollIntoView({ block: 'nearest' });
      }

      function clearFolderAutoExpandTimer() {
        if (folderAutoExpandTimer) {
          clearTimeout(folderAutoExpandTimer);
          folderAutoExpandTimer = null;
        }
        activeFolderAutoExpandPath = '';
      }

      function scheduleFolderAutoExpand(path) {
        const targetPath = String(path || '');
        if (!targetPath || expandedFolderPaths.has(targetPath)) {
          clearFolderAutoExpandTimer();
          return;
        }
        const node = findFolderNodeByPath(targetPath);
        const hasChildren = !!(node && Array.isArray(node.children) && node.children.length);
        if (!hasChildren) {
          clearFolderAutoExpandTimer();
          return;
        }
        if (activeFolderAutoExpandPath === targetPath && folderAutoExpandTimer) {
          return;
        }
        clearFolderAutoExpandTimer();
        activeFolderAutoExpandPath = targetPath;
        folderAutoExpandTimer = setTimeout(function () {
          folderAutoExpandTimer = null;
          if (!activeFolderAutoExpandPath) {
            return;
          }
          expandedFolderPaths.add(activeFolderAutoExpandPath);
          renderFolderTree();
          scrollFolderPathIntoView(activeFolderAutoExpandPath);
          activeFolderAutoExpandPath = '';
        }, 600);
      }

      function syncFolderActionButtons() {
        if (folderDeleteBtn) {
          folderDeleteBtn.disabled = !activeFolderPath || isRecycleFolderPath(activeFolderPath);
        }
        if (folderCurrentPath) {
          folderCurrentPath.textContent = getFolderLabel(activeFolderPath);
        }
        setUploadTargetFolder(activeFolderPath);
      }

      function syncFolderDropHighlight() {
        if (!folderTree) {
          return;
        }
        const nodes = folderTree.querySelectorAll('.folder-tree-node[data-folder-path]');
        nodes.forEach(function (node) {
          const path = node.getAttribute('data-folder-path');
          node.classList.toggle('drop-target', path === activeDropFolderPath);
        });
      }

      function buildFolderTreeHtml(nodes, level) {
        const list = Array.isArray(nodes) ? nodes : [];
        return list.map(function (node) {
          const path = String(node.path || '');
          const expanded = expandedFolderPaths.has(path);
          const hasChildren = Array.isArray(node.children) && node.children.length > 0;
          const isActive = activeFolderPath === path;
          const isRenaming = activeFolderRenamePath === path && canRenameFolderPath(path);
          const padding = 10 + (Math.max(0, Number(level) || 0) * 18);
          const childHtml = hasChildren && expanded
            ? '<div class="folder-tree-children">' + buildFolderTreeHtml(node.children, (level || 0) + 1) + '</div>'
            : '';
          const nameHtml = isRenaming
            ? '<input class="folder-rename-input" data-folder-rename-input="' + escapeHtml(path) + '" value="' + escapeHtml(node.name || '') + '" maxlength="120">'
            : '<span class="folder-tree-name">' + escapeHtml(node.name || '') + '</span>';
          const lockHtml = node.locked ? '<span class="folder-lock-icon" title="已加锁" aria-label="已加锁">🔒</span>' : '';
          return (
            '<div class="folder-tree-node' + (isActive ? ' active' : '') + (activeDropFolderPath === path ? ' drop-target' : '') + '" data-folder-path="' + escapeHtml(path) + '">' +
              '<div class="folder-tree-line" style="padding-left:' + padding + 'px;">' +
                (hasChildren
                  ? '<button type="button" class="folder-tree-toggle" data-folder-toggle="' + escapeHtml(path) + '">' + (expanded ? '▾' : '▸') + '</button>'
                  : '<span class="folder-tree-toggle placeholder">•</span>') +
                '<div class="folder-tree-entry" data-folder-select="' + escapeHtml(path) + '" data-drag-folder="' + escapeHtml(path) + '" draggable="true">' +
                  nameHtml +
                  lockHtml +
                  '<span class="folder-tree-count">' + String(Number(node.file_count || 0)) + '</span>' +
                '</div>' +
              '</div>' +
              childHtml +
            '</div>'
          );
        }).join('');
      }

      function getRootFolderTreeNodesForRender() {
        const list = Array.isArray(folderTreeData) ? folderTreeData : [];
        const recycleNodes = [];
        const otherNodes = [];
        list.forEach(function (node) {
          if (node && isRecycleFolderPath(node.path)) {
            recycleNodes.push(node);
          } else {
            otherNodes.push(node);
          }
        });
        return recycleNodes.concat(otherNodes);
      }

      function renderFolderTree() {
        if (!folderTree || !folderTreeEmpty) {
          return;
        }
        syncFolderActionButtons();
        if (!folderTreeData.length) {
          folderTree.innerHTML = '';
          folderTreeEmpty.textContent = '当前没有文件夹。';
          folderTreeEmpty.style.display = 'block';
          return;
        }
        folderTreeEmpty.style.display = 'none';
        folderTree.innerHTML =
          '<div class="folder-tree-node' + (activeFolderPath ? '' : ' active') + (activeDropFolderPath === '' ? ' drop-target' : '') + '" data-folder-path="">' +
            '<div class="folder-tree-line" style="padding-left:10px;">' +
              '<span class="folder-tree-toggle placeholder">•</span>' +
              '<div class="folder-tree-entry" data-folder-select="">' +
                '<span class="folder-tree-name">根目录</span>' +
                '<span class="folder-tree-count"></span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          buildFolderTreeHtml(getRootFolderTreeNodesForRender(), 0);
        syncFolderDropHighlight();
        focusActiveFolderRenameInput();
      }

      function focusActiveFolderRenameInput() {
        if (!folderTree || !activeFolderRenamePath) {
          return;
        }
        setTimeout(function () {
          if (!folderTree || !activeFolderRenamePath) {
            return;
          }
          const input = folderTree.querySelector('.folder-rename-input[data-folder-rename-input]');
          if (!input) {
            return;
          }
          input.focus();
          input.select();
        }, 0);
      }

      function startFolderRename(path) {
        const target = String(path || '');
        if (!canRenameFolderPath(target)) {
          return;
        }
        activeFolderRenamePath = target;
        ensureFolderPathExpanded(target);
        renderFolderTree();
      }

      function cancelFolderRename() {
        if (!activeFolderRenamePath) {
          return;
        }
        activeFolderRenamePath = '';
        renderFolderTree();
      }

      async function submitFolderRename(input) {
        if (!input) {
          return;
        }
        const oldPath = String(input.getAttribute('data-folder-rename-input') || '');
        if (!canRenameFolderPath(oldPath) || activeFolderRenamePath !== oldPath) {
          return;
        }
        if (folderRenameRequestPath === oldPath) {
          return;
        }
        const nextName = String(input.value || '').trim();
        const oldName = folderNameFromPath(oldPath);
        if (!nextName) {
          showStatus('文件夹名称不能为空', 'err');
          input.focus();
          return;
        }
        if (nextName === oldName) {
          activeFolderRenamePath = '';
          renderFolderTree();
          return;
        }

        try {
          folderRenameRequestPath = oldPath;
          const result = await fetchJson(
            withFolderPassword(api.folderRename + '?path=' + encodeURIComponent(oldPath) + '&name=' + encodeURIComponent(nextName), oldPath),
            { method: 'POST' }
          );
          const newPath = String((result && result.path) || '');
          activeFolderRenamePath = '';
          activeFolderPath = relocatePathAfterFolderMove(activeFolderPath, oldPath, newPath);
          ensureFolderPathExpanded(activeFolderPath);
          await loadFiles();
          showStatus('文件夹已改名：' + nextName, 'ok');
        } catch (err) {
          showStatus('文件夹改名失败：' + err.message, 'err');
          input.focus();
          input.select();
        } finally {
          folderRenameRequestPath = '';
        }
      }

      async function loadFolderTreeState() {
        const data = await fetchJson(api.folders);
        folderTreeData = Array.isArray(data.folders) ? data.folders.map(normalizeFolderNode) : [];
        ensureFolderPathExpanded(activeFolderPath);
        renderFolderTree();
      }

      async function createFolderAtCurrentPath() {
        if (!(await ensureFolderUnlocked(activeFolderPath))) {
          return;
        }
        const name = window.prompt('请输入新建文件夹名称');
        if (name === null) {
          return;
        }
        const cleanName = String(name || '').trim();
        if (!cleanName) {
          showStatus('文件夹名称不能为空', 'err');
          return;
        }
        await fetchJson(
          withFolderPassword(
            api.folderCreate + '?parent=' + encodeURIComponent(activeFolderPath || '') + '&name=' + encodeURIComponent(cleanName),
            activeFolderPath
          ),
          { method: 'POST' }
        );
        ensureFolderPathExpanded(activeFolderPath);
        await loadFolderTreeState();
        showStatus('已创建文件夹：' + cleanName, 'ok');
      }

      async function deleteCurrentFolder() {
        if (!activeFolderPath) {
          return;
        }
        if (!(await ensureFolderUnlocked(activeFolderPath))) {
          return;
        }
        if (!confirm('确认删除文件夹『' + activeFolderPath + '』？仅允许删除空文件夹。')) {
          return;
        }
        await fetchJson(withFolderPassword(api.folderDelete + '?path=' + encodeURIComponent(activeFolderPath), activeFolderPath), { method: 'POST' });
        activeFolderPath = '';
        renderFolderTree();
        renderFiles(activeSourceFiles);
        showStatus('文件夹已删除', 'warn');
      }

      async function moveFilesToFolder(filePaths, folderPath) {
        const list = Array.isArray(filePaths) ? filePaths.filter(Boolean) : [];
        if (!list.length) {
          return;
        }
        for (let i = 0; i < list.length; i += 1) {
          await fetchJson(
            withFolderPassword(
              withFolderPassword(api.fileMove + '?file=' + encodeURIComponent(list[i]) + '&folder=' + encodeURIComponent(folderPath || ''), parentFolderPathFromFilePath(list[i])),
              folderPath || '',
              'target_folder_password'
            ),
            { method: 'POST' }
          );
          selectedFileNames.delete(list[i]);
        }
        await loadFiles();
        showStatus(list.length > 1 ? ('已移动 ' + list.length + ' 个文件') : '文件已移动', 'ok');
      }

      function ensureLocalImportFolderPathExpanded(path) {
        const text = String(path || '');
        localImportExpandedFolderPaths.add('');
        if (!text) {
          return;
        }
        const parts = text.split('/');
        let current = '';
        for (let i = 0; i < parts.length; i += 1) {
          current = current ? (current + '/' + parts[i]) : parts[i];
          localImportExpandedFolderPaths.add(current);
        }
      }

      function buildLocalImportFolderTreeHtml(nodes, level) {
        const list = Array.isArray(nodes) ? nodes : [];
        return list.filter(function (node) {
          return node && !isRecycleFolderPath(node.path);
        }).map(function (node) {
          const path = String(node.path || '');
          const expanded = localImportExpandedFolderPaths.has(path);
          const hasChildren = Array.isArray(node.children) && node.children.length > 0;
          const isActive = localImportTargetFolderPath === path;
          const padding = 10 + (Math.max(0, Number(level) || 0) * 18);
          const childHtml = hasChildren && expanded
            ? '<div class="folder-tree-children">' + buildLocalImportFolderTreeHtml(node.children, (level || 0) + 1) + '</div>'
            : '';
          const lockHtml = node.locked ? '<span class="folder-lock-icon" title="已加锁" aria-label="已加锁">🔒</span>' : '';
          return (
            '<div class="folder-tree-node' + (isActive ? ' active' : '') + '" data-local-import-folder="' + escapeHtml(path) + '">' +
              '<div class="folder-tree-line" style="padding-left:' + padding + 'px;">' +
                (hasChildren
                  ? '<button type="button" class="folder-tree-toggle" data-local-import-toggle="' + escapeHtml(path) + '">' + (expanded ? '▾' : '▸') + '</button>'
                  : '<span class="folder-tree-toggle placeholder">•</span>') +
                '<div class="folder-tree-entry" data-local-import-select="' + escapeHtml(path) + '">' +
                  '<span class="folder-tree-name">' + escapeHtml(node.name || '') + '</span>' +
                  lockHtml +
                '</div>' +
              '</div>' +
              childHtml +
            '</div>'
          );
        }).join('');
      }

      function renderLocalImportTree() {
        if (!localImportTree || !localImportEmpty) {
          return;
        }
        const rootActive = localImportTargetFolderPath === '';
        const body = buildLocalImportFolderTreeHtml(getRootFolderTreeNodesForRender(), 0);
        localImportTree.innerHTML =
          '<div class="folder-tree-node' + (rootActive ? ' active' : '') + '" data-local-import-folder="">' +
            '<div class="folder-tree-line" style="padding-left:10px;">' +
              '<span class="folder-tree-toggle placeholder">•</span>' +
              '<div class="folder-tree-entry" data-local-import-select="">' +
                '<span class="folder-tree-name">根目录</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          body;
        localImportEmpty.style.display = body ? 'none' : 'block';
      }

      async function openLocalImportDialog() {
        const files = getSelectedLocalDiskFilePaths();
        if (!files.length) {
          showStatus('请先选择要上传的本地文件', 'err');
          return;
        }
        try {
          await loadFolderTreeState();
        } catch (err) {
          showStatus('加载远程目录失败：' + err.message, 'err');
          return;
        }
        localImportTargetFolderPath = activeFolderPath || '';
        ensureLocalImportFolderPathExpanded(localImportTargetFolderPath);
        renderLocalImportTree();
        if (localImportDialog) {
          localImportDialog.hidden = false;
        }
      }

      function closeLocalImportDialog() {
        if (localImportDialog) {
          localImportDialog.hidden = true;
        }
      }

      function setLocalImportProgress(percent, text) {
        const p = Math.max(0, Math.min(100, Number(percent) || 0));
        if (localImportProgressDialog) {
          localImportProgressDialog.hidden = false;
        }
        if (localImportProgressFill) {
          localImportProgressFill.style.width = p + '%';
        }
        if (localImportProgressText) {
          localImportProgressText.textContent = text || ('上传中 ' + Math.round(p) + '%');
        }
        if (localImportProgressClose) {
          localImportProgressClose.hidden = true;
        }
      }

      function localImportFileStateText(state) {
        if (state === 'done') { return '完成'; }
        if (state === 'running') { return '上传中'; }
        if (state === 'failed') { return '失败'; }
        return '等待';
      }

      function renderLocalImportProgressFiles(files) {
        if (!localImportProgressFiles) {
          return;
        }
        const list = Array.isArray(files) ? files : [];
        if (!list.length) {
          localImportProgressFiles.innerHTML = '';
          return;
        }
        localImportProgressFiles.innerHTML = list.map(function (file) {
          const name = String((file && file.name) || '');
          const state = String((file && file.state) || 'pending');
          const progress = Math.max(0, Math.min(100, Number((file && file.progress) || 0)));
          const size = Number((file && file.size) || 0);
          const copied = Number((file && file.copied) || 0);
          return '<div class="local-import-progress-file state-' + escapeHtml(state) + '">' +
            '<div class="local-import-progress-file-main">' +
              '<span class="local-import-progress-file-name">' + escapeHtml(name) + '</span>' +
              '<span class="local-import-progress-file-state">' + localImportFileStateText(state) + '</span>' +
            '</div>' +
            '<div class="local-import-progress-file-track"><div class="local-import-progress-file-fill" style="width:' + progress + '%"></div></div>' +
            '<div class="local-import-progress-file-meta">' + formatNumber(copied) + ' / ' + formatNumber(size) + ' 字节</div>' +
          '</div>';
        }).join('');
      }

      function finishLocalImportProgress(text) {
        setLocalImportProgress(100, text || '上传完成 100%');
        if (localImportProgressClose) {
          localImportProgressClose.hidden = false;
        }
      }

      function failLocalImportProgress(text) {
        setLocalImportProgress(0, text || '上传失败');
        if (localImportProgressClose) {
          localImportProgressClose.hidden = false;
        }
      }

      function closeLocalImportProgressDialog() {
        if (localImportProgressDialog) {
          localImportProgressDialog.hidden = true;
        }
        if (localImportProgressFill) {
          localImportProgressFill.style.width = '0%';
        }
        if (localImportProgressText) {
          localImportProgressText.textContent = '准备上传...';
        }
        if (localImportProgressFiles) {
          localImportProgressFiles.innerHTML = '';
        }
      }

      function pollLocalImportProgress(taskId) {
        return new Promise(function (resolve, reject) {
          if (!taskId) {
            reject(new Error('缺少上传任务编号'));
            return;
          }
          const timer = setInterval(function () {
            fetchJson(api.localDiskImportProgress + '?task_id=' + encodeURIComponent(taskId))
              .then(function (data) {
                const progress = Math.max(0, Math.min(100, Number(data.progress || 0)));
                const state = String(data.state || '');
                setLocalImportProgress(progress, (data.message || '上传中') + ' ' + Math.round(progress) + '%');
                renderLocalImportProgressFiles(data.files);
                if (state === 'done') {
                  clearInterval(timer);
                  finishLocalImportProgress('上传完成 100%');
                  resolve(data);
                } else if (state === 'failed') {
                  clearInterval(timer);
                  reject(new Error(data.error || '上传失败'));
                }
              })
              .catch(function (err) {
                clearInterval(timer);
                reject(err);
              });
          }, 400);
        });
      }

      async function confirmLocalImport() {
        const files = getSelectedLocalDiskFilePaths();
        if (!files.length) {
          closeLocalImportDialog();
          return;
        }
        if (!(await ensureFolderUnlocked(localImportTargetFolderPath))) {
          return;
        }
        const password = getFolderPasswordForPath(localImportTargetFolderPath);
        let url = api.localDiskImport
          + '?folder=' + encodeURIComponent(localImportTargetFolderPath || '')
          + '&paths=' + encodeURIComponent(files.join('\n'));
        if (password) {
          url += '&folder_password=' + encodeURIComponent(password);
        }
        if (localImportConfirmBtn) {
          localImportConfirmBtn.disabled = true;
        }
        try {
          resetStatus();
          const started = await fetchJson(url, { method: 'POST' });
          closeLocalImportDialog();
          setLocalImportProgress(0, '准备上传...');
          const data = await pollLocalImportProgress(String(started.task_id || ''));
          clearLocalDiskSelection();
          await loadFiles();
          showStatus('已上传 ' + Number(data.saved_count || 0) + ' 个本地文件到远程磁盘', 'ok');
          const videoProbeFails = await verifyUploadedVideos(data.files);
          if (videoProbeFails.length) {
            showManualTranscodePrompt(videoProbeFails);
          }
        } catch (err) {
          failLocalImportProgress('上传失败：' + err.message);
          showStatus('上传本地文件失败：' + err.message, 'err');
        } finally {
          if (localImportConfirmBtn) {
            localImportConfirmBtn.disabled = false;
          }
        }
      }

      async function showFilesForTag(tagId) {
        activeFilterTagId = tagId;
        setActivePanel('panel-files');
        const data = await fetchJson(api.tagFiles + '?tag_id=' + encodeURIComponent(tagId));
        renderFiles(Array.isArray(data.files) ? data.files.map(normalizeFileRecord) : []);
        renderTagTree();
      }

      function clearTagFileFilter() {
        activeFilterTagId = '';
        renderFiles(allFiles);
        renderTagTree();
      }

      function updateFileViewContext() {
        if (!fileViewContext) {
          return;
        }

        if (activeFilterTagId) {
          const meta = findTagMetaById(activeFilterTagId);
          const tagName = meta && meta.node && meta.node.name
            ? String(meta.node.name)
            : '当前标签';
          fileViewContext.textContent = '当前视图：标签：' + tagName + ' / 范围：标签内全部文件';
        } else {
          fileViewContext.textContent = '当前视图：目录：' + getFolderLabel(activeFolderPath) + ' / 范围：全部文件';
        }
      }

      function updateExplorerLayout() {
        const isTagFilterMode = !!activeFilterTagId;
        if (explorerShell) {
          explorerShell.classList.toggle('tag-filter-mode', isTagFilterMode);
        }
        if (folderBrowser) {
          folderBrowser.hidden = isTagFilterMode;
        }
      }

      function compareFiles(a, b, key, order) {
        let res = 0;
        if (key === 'size') {
          res = safeSize(a) - safeSize(b);
        } else if (key === 'uploaded_at') {
          res = safeTime(a) - safeTime(b);
        } else {
          const an = String(a.name || '');
          const bn = String(b.name || '');
          res = an.localeCompare(bn, 'zh-CN');
        }
        return order === 'desc' ? -res : res;
      }

      function syncSelectedFilesByCurrentView() {
        const visibleNames = new Set((Array.isArray(currentFiles) ? currentFiles : []).map(function (file) {
          return getFilePath(file);
        }).filter(Boolean));

        Array.from(selectedFileNames).forEach(function (name) {
          if (!visibleNames.has(name)) {
            selectedFileNames.delete(name);
          }
        });
      }

      function getSelectedVisibleFileNames() {
        const names = [];
        (Array.isArray(currentFiles) ? currentFiles : []).forEach(function (file) {
          const name = getFilePath(file);
          if (name && selectedFileNames.has(name)) {
            names.push(name);
          }
        });
        return names;
      }

      function updateFileSelectAllState() {
        if (!fileSelectAll) {
          return;
        }

        const visibleCount = (Array.isArray(currentFiles) ? currentFiles : []).length;
        const selectedCount = getSelectedVisibleFileNames().length;
        fileSelectAll.checked = visibleCount > 0 && selectedCount === visibleCount;
        fileSelectAll.indeterminate = selectedCount > 0 && selectedCount < visibleCount;
      }

      function updateFileBulkActionButton() {
        if (!fileBulkAction && !fileBulkDeleteAction) {
          return;
        }

        const selectedCount = getSelectedVisibleFileNames().length;
        const isTagFilterMode = !!activeFilterTagId;
        const isRecycleMode = !isTagFilterMode && isRecycleFolderPath(activeFolderPath);
        if (fileBulkAction) {
          const label = isTagFilterMode ? '移除' : (isRecycleMode ? '恢复' : '删除');
          const title = isTagFilterMode
            ? '批量从当前标签移除'
            : (isRecycleMode ? '批量恢复文件到原路径' : '批量删除文件（移入回收站）');
          fileBulkAction.textContent = label;
          fileBulkAction.title = title;
          fileBulkAction.setAttribute('aria-label', title);
          fileBulkAction.disabled = selectedCount === 0;
        }

        if (fileBulkDeleteAction) {
          const title = '批量彻底删除文件（仅回收站）';
          fileBulkDeleteAction.textContent = '彻底删除';
          fileBulkDeleteAction.title = title;
          fileBulkDeleteAction.setAttribute('aria-label', title);
          fileBulkDeleteAction.disabled = !isRecycleMode || selectedCount === 0;
        }
      }

      async function bindFilesToTag(tagId, fileNames) {
        const names = Array.isArray(fileNames) ? fileNames : [];
        let boundCount = 0;
        for (let i = 0; i < names.length; i += 1) {
          const fileName = String(names[i] || '');
          if (!fileName) {
            continue;
          }
          const result = await bindFileToTag(tagId, fileName);
          if (!result.ok) {
            return {
              ok: false,
              message: result.message,
              boundCount: boundCount
            };
          }
          boundCount += 1;
        }
        return { ok: true, boundCount: boundCount };
      }

      function renderFiles(files) {
        activeSourceFiles = (Array.isArray(files) ? files : []).map(normalizeFileRecord);
        if (activeFilterTagId) {
          currentFiles = activeSourceFiles.slice();
        } else {
          currentFiles = activeSourceFiles.filter(function (file) {
            return String(file.folder_path || '') === String(activeFolderPath || '');
          });
        }
        syncSelectedFilesByCurrentView();
        updateExplorerLayout();
        updateFileViewContext();
        updateFileSelectAllState();
        updateFileBulkActionButton();
        fileCounter.textContent = currentFiles.length + ' 个文件';

        if (!currentFiles.length) {
          fileList.innerHTML = '';
          fileTable.style.display = 'none';
          fileEmpty.textContent = activeFilterTagId ? '当前标签下没有文件。' : '当前目录没有文件。';
          fileEmpty.style.display = 'block';
          return;
        }

        const key = sortKey.value || 'name';
        const order = sortOrder.value || 'asc';
        const isTagFilterMode = !!activeFilterTagId;
        const sorted = currentFiles.slice().sort((a, b) => compareFiles(a, b, key, order));
        updateSortIndicator();
        const isRecycleMode = !isTagFilterMode && isRecycleFolderPath(activeFolderPath);
        if (fileTable && fileTable.classList) {
          fileTable.classList.toggle('recycle-mode', isRecycleMode);
        }

        fileEmpty.style.display = 'none';
        fileTable.style.display = 'table';
        fileList.innerHTML = sorted.map(file => {
          const name = escapeHtml(file.name || '');
          const rawName = getFilePath(file);
          const encodedPath = encodeURIComponent(rawName);
          const pathMeta = file.folder_path
            ? '<div class="file-path-meta">' + escapeHtml(file.folder_path) + '</div>'
            : '';
          const size = safeSize(file);
          const uploaded = escapeHtml(file.uploaded_time || '-');
          const checked = selectedFileNames.has(rawName) ? ' checked' : '';
          const previewBtn = isImageName(file.name)
            ? '<button class="preview-btn" data-preview-file="' + encodedPath + '" data-preview-name="' + escapeHtml(rawName) + '">预览</button>'
            : '';
          const videoBtn = isVideoName(file.name)
            ? '<button class="video-btn" data-video-file="' + encodedPath + '" data-video-name="' + escapeHtml(rawName) + '">观影</button>'
            : '';
          const audioBtn = isAudioName(file.name)
            ? '<button class="audio-btn" data-audio-file="' + encodedPath + '" data-audio-name="' + escapeHtml(rawName) + '">听音</button>'
            : '';
          const textBtn = isTextName(file.name)
            ? '<button class="text-btn" data-text-file="' + encodedPath + '" data-text-name="' + escapeHtml(rawName) + '">查看</button>'
            : '';
          const primaryActionBtn = isTagFilterMode
            ? '<button class="delete-btn" data-file="' + encodedPath + '" data-name="' + escapeHtml(rawName) + '">移除</button>'
            : (isRecycleMode
              ? ('<button class="restore-btn" data-file="' + encodedPath + '" data-name="' + escapeHtml(rawName) + '">恢复</button>')
              : '<button class="delete-btn" data-file="' + encodedPath + '" data-name="' + escapeHtml(rawName) + '">删除</button>');
          const permanentDeleteBtn = isRecycleMode
            ? '<button class="delete-btn" data-file="' + encodedPath + '" data-name="' + escapeHtml(rawName) + '">彻底删除</button>'
            : '';
          return (
            '<tr class="draggable-file-row" draggable="true" data-drag-file="' + encodedPath + '">' +
              '<td class="file-select-cell"><input class="file-select-input" type="checkbox" data-select-file="' + encodedPath + '" aria-label="选择文件 ' + escapeHtml(rawName) + '"' + checked + '></td>' +
              '<td><a class="file-name" draggable="false" href="' + escapeHtml(downloadUrlForFile(rawName, false)) + '">' + name + '</a>' + pathMeta + '</td>' +
              '<td>' + formatNumber(size) + ' 字节</td>' +
              '<td>' + uploaded + '</td>' +
              '<td class="actions-cell"><div class="actions">' + previewBtn + videoBtn + audioBtn + textBtn + '</div></td>' +
              '<td class="row-danger-action"><div class="danger-actions">' + primaryActionBtn + '</div></td>' +
              '<td class="row-permanent-action"><div class="permanent-actions">' + permanentDeleteBtn + '</div></td>' +
            '</tr>'
          );
        }).join('');
        updateFileSelectAllState();
        updateFileBulkActionButton();
      }

      function buildLocalDiskFileRowHtml(item) {
        const name = String((item && item.name) || '');
        const path = String((item && item.path) || '');
        const encodedPath = encodeURIComponent(path);
        const checked = selectedLocalDiskPaths.has(path) ? ' checked' : '';
        const selectBox = '<input class="local-disk-select" type="checkbox" data-local-select="' + encodedPath + '" aria-label="选择 ' + escapeHtml(name) + '"' + checked + '>';
        const displayName = selectBox + '<a class="file-name local-disk-draggable-name" draggable="false" href="' + escapeHtml(localDiskDownloadUrl(path)) + '">' + escapeHtml(name) + '</a>';
        const previewBtn = isImageName(name)
          ? '<button class="local-preview-btn preview-btn" data-kind="image" data-local-file="' + encodedPath + '" data-local-name="' + escapeHtml(path) + '">预览</button>'
          : '';
        const videoBtn = isVideoName(name)
          ? '<button class="local-preview-btn video-btn" data-kind="video" data-local-file="' + encodedPath + '" data-local-name="' + escapeHtml(path) + '">观影</button>'
          : '';
        const audioBtn = isAudioName(name)
          ? '<button class="local-preview-btn audio-btn" data-kind="audio" data-local-file="' + encodedPath + '" data-local-name="' + escapeHtml(path) + '">听音</button>'
          : '';
        const textBtn = isTextName(name)
          ? '<button class="local-preview-btn text-btn" data-kind="text" data-local-file="' + encodedPath + '" data-local-name="' + escapeHtml(path) + '">查看</button>'
          : '';
        const deleteBtn = '<button class="local-delete-btn delete-btn" data-local-delete="' + encodedPath + '" data-local-name="' + escapeHtml(path) + '" title="移至回收站" aria-label="移至回收站">移除</button>';
        return (
          '<tr class="local-disk-draggable" draggable="true" data-local-drag="' + encodedPath + '">' +
            '<td>' + displayName + '</td>' +
            '<td>' + (formatNumber(Number(item.size || 0)) + ' 字节') + '</td>' +
            '<td>' + escapeHtml((item && item.modified_time) || '-') + '</td>' +
            '<td class="actions-cell"><div class="actions">' + previewBtn + videoBtn + audioBtn + textBtn + '</div></td>' +
            '<td class="row-danger-action"><div class="danger-actions">' + deleteBtn + '</div></td>' +
          '</tr>'
        );
      }

      function getVisibleLocalDiskPathSet() {
        const visible = new Set();
        activeLocalDiskItems.forEach(function (item) {
          if (item && item.path) {
            visible.add(String(item.path));
          }
        });
        if (activeLocalDiskTreeRootPath) {
          visible.add(activeLocalDiskTreeRootPath);
        }
        localDiskTreeCache.forEach(function (dirs) {
          dirs.forEach(function (item) {
            if (item && item.path) {
              visible.add(String(item.path));
            }
          });
        });
        return visible;
      }

      function getSelectedLocalDiskPaths() {
        const visible = getVisibleLocalDiskPathSet();
        return Array.from(selectedLocalDiskPaths).filter(function (path) {
          return visible.has(path);
        });
      }

      function getSelectedLocalDiskFilePaths() {
        return activeLocalDiskItems.filter(function (item) {
          return item && !item.directory && selectedLocalDiskPaths.has(String(item.path || ''));
        }).map(function (item) {
          return String(item.path || '');
        }).filter(Boolean);
      }

      function getVisibleLocalDiskFilePaths() {
        return activeLocalDiskItems.filter(function (item) {
          return item && !item.directory;
        }).map(function (item) {
          return String(item.path || '');
        }).filter(Boolean);
      }

      function updateLocalDiskSelectAllState() {
        const filePaths = getVisibleLocalDiskFilePaths();
        const selectedCount = filePaths.filter(function (path) {
          return selectedLocalDiskPaths.has(path);
        }).length;
        [localDiskSelectAll, localDiskTableSelectAll].forEach(function (selectAll) {
          if (!selectAll) {
            return;
          }
          selectAll.checked = filePaths.length > 0 && selectedCount === filePaths.length;
          selectAll.indeterminate = selectedCount > 0 && selectedCount < filePaths.length;
          selectAll.disabled = filePaths.length === 0;
        });
      }

      function updateLocalDiskBulkRemoveButton() {
        const disabled = getSelectedLocalDiskFilePaths().length === 0;
        [localDiskBulkRemoveBtn, localDiskTableBulkRemoveBtn].forEach(function (btn) {
          if (btn) {
            btn.disabled = disabled;
          }
        });
        if (localDiskImportBtn) {
          localDiskImportBtn.disabled = disabled;
        }
        updateLocalDiskSelectAllState();
      }

      function setVisibleLocalDiskFilesSelected(checked) {
        getVisibleLocalDiskFilePaths().forEach(function (path) {
          if (checked) {
            selectedLocalDiskPaths.add(path);
          } else {
            selectedLocalDiskPaths.delete(path);
          }
        });
        renderLocalDiskItems(activeLocalDiskItems);
      }

      function removeSelectedLocalDiskFiles() {
        const paths = getSelectedLocalDiskFilePaths();
        if (!paths.length) {
          return;
        }
        if (!confirm('确认将选中的 ' + paths.length + ' 个本地文件移至回收站？')) {
          return;
        }
        [localDiskBulkRemoveBtn, localDiskTableBulkRemoveBtn].forEach(function (btn) {
          if (btn) {
            btn.disabled = true;
          }
        });
        Promise.all(paths.map(function (path) {
          return fetchJson(api.localDiskDelete + '?path=' + encodeURIComponent(path), { method: 'POST' });
        })).then(function () {
          showStatus('已移除 ' + paths.length + ' 个本地文件到回收站', 'warn');
          clearLocalDiskSelection();
          loadLocalDisk(activeLocalDiskPath || '');
        }).catch(function (err) {
          showStatus('批量移除失败：' + err.message, 'err');
          loadLocalDisk(activeLocalDiskPath || '');
        });
      }

      function updateLocalDiskSelection(path, checked) {
        if (!path) {
          return;
        }
        if (checked) {
          selectedLocalDiskPaths.add(path);
        } else {
          selectedLocalDiskPaths.delete(path);
        }
        updateLocalDiskBulkRemoveButton();
      }

      function clearLocalDiskSelection() {
        selectedLocalDiskPaths.clear();
        updateLocalDiskBulkRemoveButton();
      }

      function removeLocalDiskTreePaths(paths) {
        const moved = new Set((Array.isArray(paths) ? paths : []).map(function (path) {
          return String(path || '');
        }).filter(Boolean));
        if (!moved.size) {
          return;
        }
        localDiskTreeCache.forEach(function (dirs, key) {
          localDiskTreeCache.set(key, dirs.filter(function (item) {
            return !moved.has(String((item && item.path) || ''));
          }));
        });
        moved.forEach(function (path) {
          localDiskTreeCache.delete(path);
          expandedLocalDiskTreePaths.delete(path);
        });
      }

      function localDiskBaseName(path) {
        const text = String(path || '/').replace(/\/+$/, '') || '/';
        if (text === '/') {
          return '/';
        }
        const pos = text.lastIndexOf('/');
        return pos >= 0 ? text.slice(pos + 1) : text;
      }

      function localDiskPathContains(base, path) {
        const left = String(base || '/');
        const right = String(path || '/');
        return left === '/'
          ? right.charAt(0) === '/'
          : (right === left || right.indexOf(left + '/') === 0);
      }

      function localDiskParentPath(path) {
        const text = String(path || '/').replace(/\/+$/, '') || '/';
        if (text === '/') {
          return '/';
        }
        const pos = text.lastIndexOf('/');
        return pos <= 0 ? '/' : text.slice(0, pos);
      }

      function cacheLocalDiskTreeNode(path, items) {
        const dirs = (Array.isArray(items) ? items : []).filter(function (item) {
          return !!(item && item.directory);
        }).sort(function (a, b) {
          return String((a && a.name) || '').localeCompare(String((b && b.name) || ''), 'zh-CN');
        });
        localDiskTreeCache.set(String(path || '/'), dirs);
      }

      function resetLocalDiskTreeRoot(path) {
        activeLocalDiskTreeRootPath = String(path || '/');
        localDiskTreeCache.clear();
        expandedLocalDiskTreePaths.clear();
        expandedLocalDiskTreePaths.add(activeLocalDiskTreeRootPath);
      }

      function ensureLocalDiskTreeRoot(path) {
        if (!activeLocalDiskTreeRootPath) {
          activeLocalDiskTreeRootPath = String(path || '/');
          expandedLocalDiskTreePaths.add(activeLocalDiskTreeRootPath);
        }
      }

      function renderLocalDiskTreeNode(path, level, itemMeta) {
        const textPath = String(path || '/');
        const encodedPath = encodeURIComponent(textPath);
        const name = localDiskBaseName(textPath);
        const checked = selectedLocalDiskPaths.has(textPath) ? ' checked' : '';
        const isActive = textPath === activeLocalDiskPath;
        const isExpanded = expandedLocalDiskTreePaths.has(textPath);
        const hasCache = localDiskTreeCache.has(textPath);
        const dirs = localDiskTreeCache.get(textPath) || [];
        const canMove = level > 0;
        const createBtn = '<button type="button" class="local-mkdir-btn local-disk-dir-create-inline" data-local-mkdir="' + encodedPath + '" data-local-name="' + escapeHtml(textPath) + '" title="新建子目录" aria-label="新建子目录">+</button>';
        const deleteBtn = level > 0 && itemMeta && itemMeta.empty_directory
          ? '<button type="button" class="local-delete-btn local-disk-dir-delete-inline" data-local-delete="' + encodedPath + '" data-local-name="' + escapeHtml(textPath) + '" title="删除空目录" aria-label="删除空目录">-</button>'
          : '';
        const selectBox = canMove
          ? '<input class="local-disk-select" type="checkbox" data-local-select="' + encodedPath + '" aria-label="选择 ' + escapeHtml(name) + '"' + checked + '>'
          : '<span class="local-disk-select-placeholder"></span>';
        let html = '<div class="local-disk-tree-row local-disk-dir-item' + (canMove ? ' local-disk-draggable' : '') + (isActive ? ' active' : '') + '" ' + (canMove ? 'draggable="true" data-local-drag="' + encodedPath + '" ' : '') + 'data-local-drop-target="' + encodedPath + '" style="--tree-level:' + level + '">' +
          '<button type="button" class="local-disk-tree-caret" data-local-toggle="' + encodedPath + '" title="展开或收起目录" aria-label="展开或收起目录">' + (isExpanded && dirs.length ? '▾' : (hasCache && !dirs.length ? '' : '▸')) + '</button>' +
          selectBox +
          '<button type="button" class="local-disk-dir-link" data-local-folder="' + encodedPath + '">' +
            '<span class="local-folder-icon">📁</span>' +
            '<span class="local-disk-dir-item-name">' + escapeHtml(name) + '</span>' +
          '</button>' +
          createBtn +
          deleteBtn +
          '</div>';
        if (isExpanded && dirs.length) {
          html += '<div class="local-disk-tree-children">';
          html += dirs.map(function (item) {
            return renderLocalDiskTreeNode(String(item.path || ''), level + 1, item);
          }).join('');
          html += '</div>';
        }
        return html;
      }

      function renderLocalDiskItems(items) {
        activeLocalDiskItems = Array.isArray(items) ? items.slice() : [];
        const list = activeLocalDiskItems.slice().sort(compareLocalDiskItems);
        updateLocalDiskSortIndicator();
        if (localDiskContext) {
          localDiskContext.textContent = '当前路径：' + activeLocalDiskPath;
        }

        if (localDiskViewMode === 'split') {
          renderLocalDiskSplitView(list);
        } else {
          renderLocalDiskTableView(list);
        }
      }

      function renderLocalDiskTableView(list) {
        if (!localDiskList || !localDiskTable || !localDiskEmpty) {
          return;
        }
        if (localDiskTableWrap) {
          localDiskTableWrap.hidden = false;
        }
        if (localDiskExplorer) {
          localDiskExplorer.hidden = true;
        }
        if (!list.length) {
          localDiskList.innerHTML = '';
          localDiskTable.style.display = 'none';
          localDiskEmpty.textContent = '当前目录没有可显示的内容。';
          localDiskEmpty.style.display = 'block';
          return;
        }

        localDiskEmpty.style.display = 'none';
        localDiskTable.style.display = 'table';
        localDiskList.innerHTML = list.map(function (item) {
          const name = String((item && item.name) || '');
          const path = String((item && item.path) || '');
          const encodedPath = encodeURIComponent(path);
          const isDir = !!(item && item.directory);
          const checked = !isDir && selectedLocalDiskPaths.has(path) ? ' checked' : '';
          const selectBox = isDir
            ? '<span class="local-disk-select-placeholder"></span>'
            : '<input class="local-disk-select" type="checkbox" data-local-select="' + encodedPath + '" aria-label="选择 ' + escapeHtml(name) + '"' + checked + '>';
          const nameHtml = isDir
            ? '<button type="button" class="local-folder-link" data-local-folder="' + encodedPath + '"><span class="local-folder-icon">📁</span><span>' + escapeHtml(name) + '</span></button>'
            : '<a class="file-name" href="' + escapeHtml(localDiskDownloadUrl(path)) + '">' + escapeHtml(name) + '</a>';
          const displayName = '<span class="local-disk-table-name-cell">' + selectBox + nameHtml + '</span>';
          const previewBtn = !isDir && isImageName(name)
            ? '<button class="local-preview-btn preview-btn" data-kind="image" data-local-file="' + encodedPath + '" data-local-name="' + escapeHtml(path) + '">预览</button>'
            : '';
          const videoBtn = !isDir && isVideoName(name)
            ? '<button class="local-preview-btn video-btn" data-kind="video" data-local-file="' + encodedPath + '" data-local-name="' + escapeHtml(path) + '">观影</button>'
            : '';
          const audioBtn = !isDir && isAudioName(name)
            ? '<button class="local-preview-btn audio-btn" data-kind="audio" data-local-file="' + encodedPath + '" data-local-name="' + escapeHtml(path) + '">听音</button>'
            : '';
          const textBtn = !isDir && isTextName(name)
            ? '<button class="local-preview-btn text-btn" data-kind="text" data-local-file="' + encodedPath + '" data-local-name="' + escapeHtml(path) + '">查看</button>'
            : '';
          const deleteBtn = isDir
            ? (item.empty_directory
              ? '<button class="local-delete-btn delete-btn" data-local-delete="' + encodedPath + '" data-local-name="' + escapeHtml(path) + '">删除</button>'
              : '')
            : '<button class="local-delete-btn delete-btn" data-local-delete="' + encodedPath + '" data-local-name="' + escapeHtml(path) + '" title="移至回收站" aria-label="移至回收站">移除</button>';
          return (
            '<tr>' +
              '<td>' + displayName + '</td>' +
              '<td>' + (isDir ? '文件夹' : '文件') + '</td>' +
              '<td>' + (isDir ? '-' : (formatNumber(Number(item.size || 0)) + ' 字节')) + '</td>' +
              '<td>' + escapeHtml((item && item.modified_time) || '-') + '</td>' +
              '<td class="actions-cell"><div class="actions">' + previewBtn + videoBtn + audioBtn + textBtn + '</div></td>' +
              '<td class="row-danger-action"><div class="danger-actions">' + deleteBtn + '</div></td>' +
            '</tr>'
          );
        }).join('');
        updateLocalDiskBulkRemoveButton();
      }

      function renderLocalDiskSplitView(list) {
        if (!localDiskDirList || !localDiskDirEmpty || !localDiskSplitList || !localDiskSplitTable || !localDiskSplitEmpty) {
          return;
        }
        if (localDiskTableWrap) {
          localDiskTableWrap.hidden = true;
        }
        if (localDiskExplorer) {
          localDiskExplorer.hidden = false;
        }
        const files = list.filter(function (item) { return !(item && item.directory); });

        // Render directories
        if (activeLocalDiskTreeRootPath) {
          localDiskDirEmpty.style.display = 'none';
          localDiskDirList.innerHTML = renderLocalDiskTreeNode(activeLocalDiskTreeRootPath, 0, null);
        } else {
          localDiskDirList.innerHTML = '';
          localDiskDirEmpty.style.display = 'block';
        }

        // Render files
        if (files.length) {
          localDiskSplitEmpty.style.display = 'none';
          localDiskSplitTable.style.display = 'table';
          localDiskSplitList.innerHTML = files.map(buildLocalDiskFileRowHtml).join('');
        } else {
          localDiskSplitList.innerHTML = '';
          localDiskSplitTable.style.display = 'none';
          localDiskSplitEmpty.style.display = 'block';
        }

        updateLocalDiskBulkRemoveButton();
        localDiskEmpty.style.display = 'none';
      }

      function compareLocalDiskItems(a, b) {
        const left = a || {};
        const right = b || {};
        const nameRes = String(left.name || '').localeCompare(String(right.name || ''), 'zh-CN');
        let res = 0;
        if (localDiskSortKey === 'type') {
          const typeRes = (left.directory === right.directory) ? 0 : (left.directory ? -1 : 1);
          if (typeRes === 0) {
            return nameRes;
          }
          res = typeRes;
        } else if (localDiskSortKey === 'size') {
          res = Number(left.size || 0) - Number(right.size || 0);
        } else if (localDiskSortKey === 'modified_at') {
          res = Number(left.modified_at || 0) - Number(right.modified_at || 0);
        } else {
          res = nameRes;
        }
        return localDiskSortOrder === 'desc' ? -res : res;
      }

      function updateLocalDiskSortIndicator() {
        localSortButtons.forEach(function (btn) {
          const key = btn.getAttribute('data-local-sort-key') || '';
          const arrow = btn.querySelector('.arrow');
          btn.classList.toggle('active', key === localDiskSortKey);
          if (arrow) {
            arrow.textContent = key === localDiskSortKey ? (localDiskSortOrder === 'desc' ? '↓' : '↑') : '-';
          }
        });
      }

      async function loadLocalDisk(path, options) {
        const opts = options || {};
        const target = typeof path === 'string' ? path : (activeLocalDiskPath || '');
        try {
          const showHidden = localDiskShowHidden && localDiskShowHidden.checked;
          const url = target
            ? (api.localDiskList + '?path=' + encodeURIComponent(target) + (showHidden ? '&show_hidden=1' : ''))
            : (api.localDiskList + (showHidden ? '?show_hidden=1' : ''));
          const data = await fetchJson(url);
          activeLocalDiskPath = String(data.path || '/');
          activeLocalDiskParentPath = String(data.parent_path || '/');
          activeLocalDiskHomePath = String(data.home_path || activeLocalDiskHomePath || '');
          activeLocalDiskTrashPath = String(data.trash_path || activeLocalDiskTrashPath || '');
          if (opts.resetTreeRoot) {
            resetLocalDiskTreeRoot(activeLocalDiskPath);
          } else {
            ensureLocalDiskTreeRoot(activeLocalDiskPath);
          }
          cacheLocalDiskTreeNode(activeLocalDiskPath, Array.isArray(data.items) ? data.items : []);
          expandedLocalDiskTreePaths.add(activeLocalDiskPath);
          clearLocalDiskSelection();
          renderLocalDiskItems(Array.isArray(data.items) ? data.items : []);
        } catch (err) {
          if (localDiskList) {
            localDiskList.innerHTML = '';
          }
          if (localDiskTable) {
            localDiskTable.style.display = 'none';
          }
          if (localDiskEmpty) {
            localDiskEmpty.textContent = '加载本地磁盘失败：' + err.message;
            localDiskEmpty.style.display = 'block';
          }
          showStatus('加载本地磁盘失败：' + err.message, 'err');
        }
      }

      async function toggleLocalDiskTreePath(path) {
        const target = String(path || '');
        if (!target) {
          return;
        }
        if (expandedLocalDiskTreePaths.has(target) && localDiskTreeCache.has(target)) {
          expandedLocalDiskTreePaths.delete(target);
          renderLocalDiskItems(activeLocalDiskItems);
          return;
        }

        try {
          const showHidden = localDiskShowHidden && localDiskShowHidden.checked;
          const url = api.localDiskList
            + '?path=' + encodeURIComponent(target)
            + (showHidden ? '&show_hidden=1' : '');
          const data = await fetchJson(url);
          cacheLocalDiskTreeNode(String(data.path || target), Array.isArray(data.items) ? data.items : []);
          expandedLocalDiskTreePaths.add(String(data.path || target));
          renderLocalDiskItems(activeLocalDiskItems);
        } catch (err) {
          showStatus('展开目录失败：' + err.message, 'err');
        }
      }

      function openPreview(kind, file, name, options) {
        const opts = options || {};
        const previewKey = (opts.previewKey || file);
        const existed = openedPreviewWindows.get(previewKey);
        if (existed && existed.isConnected) {
          bringToFront(existed);
          const video = existed.querySelector('video');
          if (video) {
            video.play().catch(function () {});
          }
          return;
        }

        const rawFileForUrl = decodeURIComponent(String(file || ''));
        const url = (opts.url || downloadUrlForFile(rawFileForUrl, true)) + '&v=' + Date.now();
        const win = document.createElement('div');
        win.className = 'floating-preview';
        previewZ += 1;
        win.style.zIndex = String(previewZ);

        const titleText = kind === 'video' ? '视频播放：'
          : (kind === 'audio' ? '音频播放：'
            : (kind === 'text' ? '文本查看：' : '图片预览：'));
        const escapedTitle = escapeHtml(name || '');

        let mediaHtml = '';
        if (kind === 'video') {
          const rawName = decodeURIComponent(String(file || '')) || String(name || '');
          const subtitleName = toVttSidecarName(rawName);
          const subtitleUrl = (opts.local ? localDiskDownloadUrl(subtitleName) : downloadUrlForFile(subtitleName, true)) + '&v=' + Date.now();
          mediaHtml = '<video class="preview-video" controls preload="metadata">' +
            '<track kind="subtitles" srclang="zh-CN" label="中文字幕" default src="' + subtitleUrl + '">' +
            '</video>';
        } else if (kind === 'audio') {
          mediaHtml = '<audio class="preview-audio" controls preload="metadata" src="' + url + '"></audio>';
        } else if (kind === 'text') {
          mediaHtml = '<pre class="preview-text">加载中...</pre>';
        } else {
          mediaHtml = '<img class="preview-image" alt="图片预览" src="' + url + '">';
        }

        win.innerHTML =
          '<div class="preview-head">' +
            '<div class="preview-title">' + titleText + escapedTitle + '</div>' +
            '<button class="preview-close" type="button">关闭</button>' +
          '</div>' +
          '<div class="preview-body">' + mediaHtml + '</div>';

        previewLayer.appendChild(win);
        centerPreviewWindow(win);
        openedPreviewWindows.set(previewKey, win);

        const mediaVideo = win.querySelector('video');
        if (mediaVideo) {
          const rawVideoFile = decodeURIComponent(String(file || ''));
          if (!opts.local) {
            bindVideoResume(mediaVideo, rawVideoFile);
          }
          mediaVideo.src = url;
          mediaVideo.play().catch(function () {});

          // Check if video has audio track
          if (!opts.local) {
          checkVideoAudio(rawVideoFile).then(function (probeResult) {
            if (probeResult && probeResult.ok && (!probeResult.has_audio || probeResult.browser_audio_supported === false)) {
              // No audio or unsupported browser audio codec
              var message = '此视频文件不含音频轨道，音量按钮将不可用。';
              if (probeResult && probeResult.has_audio && probeResult.browser_audio_supported === false) {
                message = '此视频音频编码为 ' + (probeResult.audio_codec || 'unknown') + '，浏览器通常不支持播放声音。';
              }
              const warning = document.createElement('div');
              warning.style.cssText = 'margin-top: 8px; padding: 8px 10px; background: #fff7e8; border: 1px solid #e3c89d; border-radius: 6px; font-size: 12px; color: #8a5a00; display: flex; align-items: flex-start; gap: 8px;';
              warning.innerHTML = '<span style="flex-shrink: 0; font-weight: 700;">!</span><span>' + escapeHtml(message) + ' 请在页面提示中手动确认是否转码。</span>';
              const body = win.querySelector('.preview-body');
              if (body && body.querySelector('video')) {
                body.insertBefore(warning, body.querySelector('video').nextSibling);
              }
            }
          });
          }
        }

        const mediaAudio = win.querySelector('audio');
        if (mediaAudio) {
          const rawAudioFile = decodeURIComponent(String(file || ''));
          if (!opts.local) {
            bindVideoResume(mediaAudio, rawAudioFile);
          }
          mediaAudio.play().catch(function () {});
        }

        const mediaText = win.querySelector('.preview-text');
        if (mediaText) {
          const lang = detectCodeLang(name);
          if (lang) {
            mediaText.classList.add('code');
          }
          fetch(url)
            .then(function (res) {
              if (!res.ok) {
                throw new Error('http ' + res.status);
              }
              return res.text();
            })
            .then(function (text) {
              if (lang) {
                mediaText.innerHTML = highlightCodeText(text, lang);
              } else {
                mediaText.textContent = text;
              }
            })
            .catch(function (err) {
              mediaText.textContent = '文本加载失败: ' + err.message;
            });
        }

        const closeBtn = win.querySelector('.preview-close');
        const head = win.querySelector('.preview-head');

        closeBtn.addEventListener('click', function () {
          closePreviewWindow(win, previewKey);
        });

        win.addEventListener('mousedown', function () {
          bringToFront(win);
        });

        head.addEventListener('mousedown', function (e) {
          if (e.target.closest('.preview-close')) {
            return;
          }
          const rect = win.getBoundingClientRect();
          bringToFront(win);
          activeDrag = {
            win: win,
            startX: e.clientX,
            startY: e.clientY,
            left: rect.left,
            top: rect.top
          };
          win.style.transform = 'none';
          e.preventDefault();
        });
      }

      function closePreviewWindow(win, key) {
        if (!win) {
          return;
        }
        const media = win.querySelector('video, audio');
        if (media) {
          const resumeFile = media.getAttribute('data-resume-file') || '';
          if (resumeFile) {
            clearScheduledVideoResumeSave(resumeFile);
            const ms = Math.max(0, Math.round((Number(media.currentTime) || 0) * 1000));
            saveVideoResumePosition(resumeFile, ms).catch(function () {});
          }
          media.setAttribute('data-resume-closing', '1');
          media.pause();
          media.src = '';
        }
        if (key) {
          openedPreviewWindows.delete(key);
        } else {
          openedPreviewWindows.forEach(function (value, k) {
            if (value === win) {
              openedPreviewWindows.delete(k);
            }
          });
        }
        if (win.parentNode) {
          win.parentNode.removeChild(win);
        }
      }

      function bringToFront(win) {
        if (!win) {
          return;
        }
        previewZ += 1;
        win.style.zIndex = String(previewZ);
      }

      function centerPreviewWindow(win) {
        if (!win) {
          return;
        }

        win.style.transform = 'none';
        const count = previewLayer.querySelectorAll('.floating-preview').length;
        const w = win.offsetWidth || 760;
        const h = win.offsetHeight || 520;
        const offset = (count - 1) * 24;
        const left = Math.max(8, Math.round((window.innerWidth - w) / 2));
        const top = Math.max(8, Math.round((window.innerHeight - h) / 2));
        win.style.left = (left + offset) + 'px';
        win.style.top = (top + offset) + 'px';
        clampWindowPosition(win);
      }

      function clampWindowPosition(win) {
        if (!win) {
          return;
        }

        const rect = win.getBoundingClientRect();
        const maxLeft = Math.max(8, window.innerWidth - rect.width - 8);
        const maxTop = Math.max(8, window.innerHeight - 42);
        let left = rect.left;
        let top = rect.top;

        if (left < 8) left = 8;
        if (left > maxLeft) left = maxLeft;
        if (top < 8) top = 8;
        if (top > maxTop) top = maxTop;

        win.style.left = Math.round(left) + 'px';
        win.style.top = Math.round(top) + 'px';
      }

      function updateSortIndicator() {
        const key = sortKey.value || 'name';
        const order = sortOrder.value || 'asc';
        sortButtons.forEach(btn => {
          const btnKey = btn.getAttribute('data-sort-key');
          const arrow = btn.querySelector('.arrow');
          if (btnKey === key) {
            btn.classList.add('active');
            if (arrow) {
              arrow.textContent = order === 'desc' ? '↓' : '↑';
            }
          } else {
            btn.classList.remove('active');
            if (arrow) {
              arrow.textContent = '-';
            }
          }
        });
      }

      async function fetchJson(url, options) {
        const res = await fetch(url, options || {});
        let data = null;
        try {
          data = await res.json();
        } catch (_) {
          data = { ok: false, error: 'invalid json response' };
        }
        if (!res.ok || !data.ok) {
          throw new Error(data.error || ('http ' + res.status));
        }
        return data;
      }

      async function loadVideoResumePosition(fileName) {
        const data = await fetchJson(api.videoResume + '?file=' + encodeURIComponent(fileName || ''));
        return {
          found: !!data.found,
          positionMs: Math.max(0, Number(data.position_ms || 0))
        };
      }

      async function saveVideoResumePosition(fileName, positionMs) {
        const safeMs = Math.max(0, Math.round(Number(positionMs) || 0));
        await fetchJson(
          api.videoResumeSave
            + '?file=' + encodeURIComponent(fileName || '')
            + '&position_ms=' + encodeURIComponent(String(safeMs)),
          { method: 'POST' }
        );
      }

      function scheduleSaveVideoResumePosition(fileName, positionMs) {
        const key = String(fileName || '');
        if (!key) {
          return;
        }

        const existed = videoResumeSaveTimers.get(key);
        if (existed) {
          existed.positionMs = positionMs;
          return;
        }

        const state = {
          positionMs: positionMs,
          timer: setTimeout(function () {
            const latest = videoResumeSaveTimers.get(key);
            if (!latest) {
              return;
            }
            clearTimeout(latest.timer);
            videoResumeSaveTimers.delete(key);
            saveVideoResumePosition(key, latest.positionMs).catch(function () {});
          }, 800)
        };
        videoResumeSaveTimers.set(key, state);
      }

      function clearScheduledVideoResumeSave(fileName) {
        const key = String(fileName || '');
        if (!key) {
          return;
        }

        const existed = videoResumeSaveTimers.get(key);
        if (!existed) {
          return;
        }

        clearTimeout(existed.timer);
        videoResumeSaveTimers.delete(key);
      }

      function bindVideoResume(video, fileName) {
        const key = String(fileName || '');
        if (!video || !key) {
          return;
        }

        video.setAttribute('data-resume-file', key);
        let restored = false;
        let lastSavedSec = -1;

        video.addEventListener('loadedmetadata', function () {
          if (restored) {
            return;
          }
          restored = true;

          loadVideoResumePosition(key).then(function (resume) {
            if (!resume.found || resume.positionMs <= 0) {
              return;
            }

            const seekSec = resume.positionMs / 1000.0;
            const duration = Number(video.duration);
            if (!Number.isFinite(duration) || duration <= 1) {
              video.currentTime = seekSec;
              return;
            }

            if (seekSec >= duration - 0.6) {
              return;
            }

            video.currentTime = Math.max(0, Math.min(seekSec, duration - 0.5));
          }).catch(function () {});
        });

        video.addEventListener('timeupdate', function () {
          if (video.getAttribute('data-resume-closing') === '1') {
            return;
          }

          const sec = Math.floor(Number(video.currentTime) || 0);
          if (sec < 0) {
            return;
          }

          if (lastSavedSec >= 0 && Math.abs(sec - lastSavedSec) < 3) {
            return;
          }

          lastSavedSec = sec;
          scheduleSaveVideoResumePosition(key, sec * 1000);
        });

        video.addEventListener('pause', function () {
          if (video.getAttribute('data-resume-closing') === '1') {
            return;
          }
          const sec = Math.floor(Number(video.currentTime) || 0);
          scheduleSaveVideoResumePosition(key, Math.max(0, sec * 1000));
        });

        video.addEventListener('ended', function () {
          if (video.getAttribute('data-resume-closing') === '1') {
            return;
          }
          scheduleSaveVideoResumePosition(key, 0);
        });
      }

      async function loadFiles() {
        try {
          let filesUrl = api.files;
          const activePassword = getFolderPasswordForPath(activeFolderPath);
          if (activeFolderPath && activePassword) {
            filesUrl += '?folder=' + encodeURIComponent(activeFolderPath)
              + '&folder_password=' + encodeURIComponent(activePassword);
          }
          const results = await Promise.all([
            fetchJson(filesUrl),
            fetchJson(api.folders)
          ]);
          allFiles = Array.isArray(results[0].files) ? results[0].files.map(normalizeFileRecord) : [];
          folderTreeData = Array.isArray(results[1].folders) ? results[1].folders.map(normalizeFolderNode) : [];
          ensureFolderPathExpanded(activeFolderPath);
          await loadTagTreeState();
          renderFolderTree();
          renderTagTree();
          if (activeFilterTagId) {
            try {
              await showFilesForTag(activeFilterTagId);
            } catch (_) {
              clearTagFileFilter();
            }
          } else {
            renderFiles(allFiles);
          }
          await recoverRunningTranscodeTasks();
        } catch (err) {
          allFiles = [];
          folderTreeData = [];
          fileList.innerHTML = '';
          fileTable.style.display = 'none';
          fileEmpty.textContent = '加载远程磁盘失败：' + err.message;
          fileEmpty.style.display = 'block';
          renderFolderTree();
          renderTagTree();
          showStatus('加载列表失败：' + err.message, 'err');
        }
      }

      function uploadWithProgress(formData) {
        return new Promise(function (resolve, reject) {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', api.upload, true);
          xhr.responseType = 'json';

          xhr.upload.onprogress = function (e) {
            if (e.lengthComputable && e.total > 0) {
              const percent = Math.round((e.loaded * 100) / e.total);
              setUploadProgress(percent, '上传中 ' + percent + '%');
            } else {
              setUploadProgress(0, '上传中...');
            }
          };

          xhr.onerror = function () {
            reject(new Error('network error'));
          };

          xhr.onabort = function () {
            reject(new Error('upload aborted'));
          };

          xhr.onload = function () {
            let data = xhr.response;
            if (!data || typeof data !== 'object') {
              try {
                data = JSON.parse(xhr.responseText || '{}');
              } catch (_) {
                data = { ok: false, error: 'invalid json response' };
              }
            }

            if (xhr.status < 200 || xhr.status >= 300 || !data.ok) {
              reject(new Error(data.error || ('http ' + xhr.status)));
              return;
            }

            resolve(data);
          };

          xhr.send(formData);
        });
      }

      uploadForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        resetStatus();
        setUploadProgress(0, '开始上传...');

        const formData = new FormData(uploadForm);
        const uploadPassword = getFolderPasswordForPath(activeFolderPath);
        if (uploadPassword) {
          formData.set('folder_password', uploadPassword);
        }
        try {
          const data = await uploadWithProgress(formData);
          setUploadProgress(100, '上传完成 100%');
          showStatus('上传完成：成功保存 ' + (data.count || 0) + ' 个文件', 'ok');
          uploadForm.reset();
          await loadFiles();

          const videoProbeFails = await verifyUploadedVideos(data.files);
          if (videoProbeFails.length) {
            showManualTranscodePrompt(videoProbeFails);
          }

          setTimeout(hideUploadProgress, 700);
        } catch (err) {
          setUploadProgress(0, '上传失败');
          showStatus('上传失败：' + err.message, 'err');
          setTimeout(hideUploadProgress, 900);
        }
      });

      if (localDiskHomeBtn) {
        localDiskHomeBtn.addEventListener('click', function () {
          loadLocalDisk(activeLocalDiskHomePath || '', { resetTreeRoot: true });
        });
      }

      if (localDiskRootBtn) {
        localDiskRootBtn.addEventListener('click', function () {
          loadLocalDisk('/', { resetTreeRoot: true });
        });
      }

      if (localDiskTrashBtn) {
        localDiskTrashBtn.addEventListener('click', function () {
          fetchJson(api.localDiskOpenTrash, { method: 'POST' })
            .then(function () {
              showStatus('已打开系统回收站', 'ok');
            })
            .catch(function (err) {
              showStatus('打开系统回收站失败：' + err.message, 'err');
            });
        });
      }

      if (localDiskUpBtn) {
        localDiskUpBtn.addEventListener('click', function () {
          const parent = activeLocalDiskParentPath || '/';
          loadLocalDisk(parent, { resetTreeRoot: !localDiskPathContains(activeLocalDiskTreeRootPath, parent) });
        });
      }

      function setLocalDiskViewMode(mode) {
        localDiskViewMode = mode === 'split' ? 'split' : 'table';
        const isTable = localDiskViewMode === 'table';
        if (localDiskViewTableBtn) {
          localDiskViewTableBtn.classList.toggle('active', isTable);
        }
        if (localDiskViewSplitBtn) {
          localDiskViewSplitBtn.classList.toggle('active', !isTable);
        }
        if (localDiskTableWrap) {
          localDiskTableWrap.hidden = !isTable;
        }
        if (localDiskExplorer) {
          localDiskExplorer.hidden = isTable;
        }
        renderLocalDiskItems(activeLocalDiskItems);
      }

      if (localDiskViewTableBtn) {
        localDiskViewTableBtn.addEventListener('click', function () {
          setLocalDiskViewMode('table');
        });
      }

      if (localDiskViewSplitBtn) {
        localDiskViewSplitBtn.addEventListener('click', function () {
          setLocalDiskViewMode('split');
        });
      }

      if (localDiskShowHidden) {
        localDiskShowHidden.addEventListener('change', function () {
          loadLocalDisk(activeLocalDiskPath || '', { resetTreeRoot: true });
        });
      }

      if (localDiskImportBtn) {
        localDiskImportBtn.addEventListener('click', function () {
          openLocalImportDialog();
        });
      }

      if (localImportCancelBtn) {
        localImportCancelBtn.addEventListener('click', closeLocalImportDialog);
      }

      if (localImportConfirmBtn) {
        localImportConfirmBtn.addEventListener('click', function () {
          confirmLocalImport();
        });
      }

      if (localImportProgressClose) {
        localImportProgressClose.addEventListener('click', closeLocalImportProgressDialog);
      }

      if (localImportDialog) {
        localImportDialog.addEventListener('click', function (e) {
          if (e.target.closest('[data-local-import-close]')) {
            closeLocalImportDialog();
          }
        });
      }

      if (localImportTree) {
        localImportTree.addEventListener('click', function (e) {
          const toggle = e.target.closest('[data-local-import-toggle]');
          if (toggle) {
            const path = toggle.getAttribute('data-local-import-toggle') || '';
            if (localImportExpandedFolderPaths.has(path)) {
              localImportExpandedFolderPaths.delete(path);
            } else {
              localImportExpandedFolderPaths.add(path);
            }
            renderLocalImportTree();
            return;
          }
          const entry = e.target.closest('[data-local-import-select]');
          if (!entry) {
            return;
          }
          localImportTargetFolderPath = entry.getAttribute('data-local-import-select') || '';
          ensureLocalImportFolderPathExpanded(localImportTargetFolderPath);
          renderLocalImportTree();
        });
      }

      if (localDiskBulkRemoveBtn) {
        localDiskBulkRemoveBtn.addEventListener('click', function () {
          removeSelectedLocalDiskFiles();
        });
      }

      if (localDiskTableBulkRemoveBtn) {
        localDiskTableBulkRemoveBtn.addEventListener('click', function () {
          removeSelectedLocalDiskFiles();
        });
      }

      if (localDiskSelectAll) {
        localDiskSelectAll.addEventListener('change', function () {
          setVisibleLocalDiskFilesSelected(localDiskSelectAll.checked);
        });
      }

      if (localDiskTableSelectAll) {
        localDiskTableSelectAll.addEventListener('change', function () {
          setVisibleLocalDiskFilesSelected(localDiskTableSelectAll.checked);
        });
      }

      localSortButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          const nextKey = btn.getAttribute('data-local-sort-key') || 'name';
          if (localDiskSortKey === nextKey) {
            localDiskSortOrder = localDiskSortOrder === 'asc' ? 'desc' : 'asc';
          } else {
            localDiskSortKey = nextKey;
            localDiskSortOrder = 'asc';
          }
          renderLocalDiskItems(activeLocalDiskItems);
        });
      });

      if (localDiskList) {
        localDiskList.addEventListener('click', handleLocalDiskClickEvent);
      }

      function handleLocalDiskClickEvent(e) {
        const toggleBtn = e.target.closest('.local-disk-tree-caret[data-local-toggle]');
        if (toggleBtn) {
          e.stopPropagation();
          const path = decodeURIComponent(toggleBtn.getAttribute('data-local-toggle') || '');
          toggleLocalDiskTreePath(path);
          return;
        }
        const selectInput = e.target.closest('.local-disk-select[data-local-select]');
        if (selectInput) {
          const path = decodeURIComponent(selectInput.getAttribute('data-local-select') || '');
          updateLocalDiskSelection(path, selectInput.checked);
          return;
        }
        const folderBtn = e.target.closest('[data-local-folder]');
        if (folderBtn && !e.target.closest('.local-delete-btn') && !e.target.closest('.local-disk-select')) {
          const path = decodeURIComponent(folderBtn.getAttribute('data-local-folder') || '/');
          loadLocalDisk(path, { resetTreeRoot: !localDiskPathContains(activeLocalDiskTreeRootPath, path) });
          return;
        }
        const mkdirBtn = e.target.closest('.local-mkdir-btn[data-local-mkdir]');
        if (mkdirBtn) {
          e.stopPropagation();
          const path = decodeURIComponent(mkdirBtn.getAttribute('data-local-mkdir') || '');
          if (!path) { return; }
          const name = window.prompt('请输入新建子目录名称');
          if (name === null) { return; }
          const cleanName = String(name || '').trim();
          if (!cleanName) {
            showStatus('子目录名称不能为空', 'err');
            return;
          }
          fetchJson(api.localDiskMkdir + '?path=' + encodeURIComponent(path) + '&name=' + encodeURIComponent(cleanName), { method: 'POST' })
            .then(function () {
              showStatus('子目录已创建：' + cleanName, 'ok');
              loadLocalDisk(path, { resetTreeRoot: !localDiskPathContains(activeLocalDiskTreeRootPath, path) });
            })
            .catch(function (err) {
              showStatus('创建子目录失败：' + err.message, 'err');
            });
          return;
        }
        const deleteBtn = e.target.closest('.local-delete-btn[data-local-delete]');
        if (deleteBtn) {
          e.stopPropagation();
          const path = decodeURIComponent(deleteBtn.getAttribute('data-local-delete') || '');
          if (!path) { return; }
          const parentRow = deleteBtn.closest('tr');
          const isDir = parentRow
            ? (parentRow.querySelector('td:nth-child(2)') && parentRow.querySelector('td:nth-child(2)').textContent === '文件夹')
            : deleteBtn.closest('.local-disk-dir-item') !== null;
          const confirmMsg = isDir
            ? '确认删除本地目录：' + path + ' ？仅允许删除空目录。'
            : '确认删除本地文件：' + path + ' ？';
          if (!confirm(confirmMsg)) { return; }
          fetchJson(api.localDiskDelete + '?path=' + encodeURIComponent(path), { method: 'POST' })
            .then(function () {
              showStatus((isDir ? '本地目录已删除：' : '本地文件已删除：') + path, 'warn');
              const nextPath = isDir ? localDiskParentPath(path) : (activeLocalDiskPath || '');
              if (isDir) {
                localDiskTreeCache.delete(path);
                expandedLocalDiskTreePaths.delete(path);
              }
              loadLocalDisk(nextPath, { resetTreeRoot: !localDiskPathContains(activeLocalDiskTreeRootPath, nextPath) });
            })
            .catch(function (err) {
              showStatus('删除失败：' + err.message, 'err');
            });
          return;
        }
        const previewBtn = e.target.closest('.local-preview-btn[data-local-file][data-kind]');
        if (!previewBtn) { return; }
        const path = decodeURIComponent(previewBtn.getAttribute('data-local-file') || '');
        const kind = previewBtn.getAttribute('data-kind') || 'image';
        if (!path) { return; }
        openPreview(kind, encodeURIComponent(path), path, {
          local: true,
          url: localDiskDownloadUrl(path),
          previewKey: 'local:' + path
        });
      }

      function clearLocalDiskDropTarget() {
        if (!localDiskExplorer) {
          return;
        }
        localDiskExplorer.querySelectorAll('.local-disk-drop-target').forEach(function (node) {
          node.classList.remove('local-disk-drop-target');
        });
      }

      function getLocalDiskDropTarget(e) {
        const item = e.target.closest('[data-local-drop-target]');
        if (!item || !localDiskExplorer || !localDiskExplorer.contains(item)) {
          return null;
        }
        const path = decodeURIComponent(item.getAttribute('data-local-drop-target') || '');
        return path ? { element: item, path: path } : null;
      }

      function localDiskDragPathsFor(sourcePath) {
        const selected = getSelectedLocalDiskPaths();
        if (selected.indexOf(sourcePath) >= 0) {
          return selected;
        }
        return sourcePath ? [sourcePath] : [];
      }

      function handleLocalDiskDragStart(e) {
        const dragItem = e.target.closest('[data-local-drag]');
        if (!dragItem || !localDiskExplorer || !localDiskExplorer.contains(dragItem)) {
          return;
        }
        if (e.target.closest('.local-disk-select, .local-mkdir-btn, .local-delete-btn, .local-preview-btn')) {
          e.preventDefault();
          return;
        }
        const sourcePath = decodeURIComponent(dragItem.getAttribute('data-local-drag') || '');
        const paths = localDiskDragPathsFor(sourcePath);
        if (!paths.length) {
          e.preventDefault();
          return;
        }
        activeLocalDiskDragPaths = paths;
        dragItem.classList.add('local-disk-dragging');
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('application/webcool-local-disk-paths', JSON.stringify(paths));
          e.dataTransfer.setData('text/plain', paths.join('\n'));
        }
      }

      function handleLocalDiskDragOver(e) {
        const target = getLocalDiskDropTarget(e);
        if (!target || !activeLocalDiskDragPaths.length || activeLocalDiskDragPaths.indexOf(target.path) >= 0) {
          return;
        }
        e.preventDefault();
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = 'move';
        }
        clearLocalDiskDropTarget();
        target.element.classList.add('local-disk-drop-target');
      }

      function handleLocalDiskDragLeave(e) {
        if (!localDiskExplorer || localDiskExplorer.contains(e.relatedTarget)) {
          return;
        }
        clearLocalDiskDropTarget();
      }

      async function handleLocalDiskDrop(e) {
        const target = getLocalDiskDropTarget(e);
        if (!target || !activeLocalDiskDragPaths.length || activeLocalDiskDragPaths.indexOf(target.path) >= 0) {
          return;
        }
        e.preventDefault();
        clearLocalDiskDropTarget();
        const movePaths = activeLocalDiskDragPaths.slice();
        activeLocalDiskDragPaths = [];
        try {
          await Promise.all(movePaths.map(function (path) {
            return fetchJson(
              api.localDiskMove
                + '?path=' + encodeURIComponent(path)
                + '&target=' + encodeURIComponent(target.path),
              { method: 'POST' }
            );
          }));
          showStatus('已移动 ' + movePaths.length + ' 个项目到：' + target.path, 'ok');
          clearLocalDiskSelection();
          removeLocalDiskTreePaths(movePaths);
          localDiskTreeCache.delete(target.path);
          loadLocalDisk(target.path, { resetTreeRoot: !localDiskPathContains(activeLocalDiskTreeRootPath, target.path) });
        } catch (err) {
          showStatus('移动失败：' + err.message, 'err');
          loadLocalDisk(activeLocalDiskPath || '', { resetTreeRoot: !localDiskPathContains(activeLocalDiskTreeRootPath, activeLocalDiskPath || '') });
        }
      }

      function handleLocalDiskDragEnd() {
        activeLocalDiskDragPaths = [];
        clearLocalDiskDropTarget();
        if (!localDiskExplorer) {
          return;
        }
        localDiskExplorer.querySelectorAll('.local-disk-dragging').forEach(function (node) {
          node.classList.remove('local-disk-dragging');
        });
      }

      if (localDiskExplorer) {
        localDiskExplorer.addEventListener('click', handleLocalDiskClickEvent);
        localDiskExplorer.addEventListener('dragstart', handleLocalDiskDragStart);
        localDiskExplorer.addEventListener('dragover', handleLocalDiskDragOver);
        localDiskExplorer.addEventListener('dragleave', handleLocalDiskDragLeave);
        localDiskExplorer.addEventListener('drop', handleLocalDiskDrop);
        localDiskExplorer.addEventListener('dragend', handleLocalDiskDragEnd);
      }

      sortKey.addEventListener('change', function () {
        renderFiles(activeSourceFiles);
      });

      sortOrder.addEventListener('change', function () {
        renderFiles(activeSourceFiles);
      });

      sortButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          const key = btn.getAttribute('data-sort-key');
          if (!key) {
            return;
          }

          if (sortKey.value === key) {
            sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
          } else {
            sortKey.value = key;
            sortOrder.value = 'asc';
          }

          renderFiles(activeSourceFiles);
        });
      });

      reloadBtn.addEventListener('click', async function () {
        resetStatus();
        try {
          await fetchJson(api.reloadTpl);
          showStatus('模板缓存已刷新', 'warn');
        } catch (err) {
          showStatus('刷新模板缓存失败：' + err.message, 'err');
        }
      });

      statusBox.addEventListener('click', function (e) {
        const btn = e.target.closest('.transcode-btn[data-transcode-file]');
        if (btn && !btn.disabled) {
          const encoded = btn.getAttribute('data-transcode-file');
          if (encoded) {
            startManualTranscode(encoded);
          }
          return;
        }

        const cancelBtn = e.target.closest('.transcode-cancel-btn[data-cancel-file]');
        if (cancelBtn && !cancelBtn.disabled) {
          const encoded = cancelBtn.getAttribute('data-cancel-file');
          if (encoded) {
            cancelManualTranscode(encoded);
          }
        }
      });

      fileList.addEventListener('click', async function (e) {
        if (e.target.closest('.file-select-input')) {
          return;
        }

        const preview = e.target.closest('.preview-btn');
        if (preview) {
          const pfile = preview.getAttribute('data-preview-file');
          const pname = preview.getAttribute('data-preview-name') || '';
          if (pfile) {
            openPreview('image', pfile, pname);
          }
          return;
        }

        const video = e.target.closest('.video-btn');
        if (video) {
          const vfile = video.getAttribute('data-video-file');
          const vname = video.getAttribute('data-video-name') || '';
          if (vfile) {
            openPreview('video', vfile, vname);
          }
          return;
        }

        const audio = e.target.closest('.audio-btn');
        if (audio) {
          const afile = audio.getAttribute('data-audio-file');
          const aname = audio.getAttribute('data-audio-name') || '';
          if (afile) {
            openPreview('audio', afile, aname);
          }
          return;
        }

        const text = e.target.closest('.text-btn');
        if (text) {
          const tfile = text.getAttribute('data-text-file');
          const tname = text.getAttribute('data-text-name') || '';
          if (tfile) {
            openPreview('text', tfile, tname);
          }
          return;
        }

        const btn = e.target.closest('.delete-btn');
    const restoreBtn = e.target.closest('.restore-btn');
    if (restoreBtn) {
      const restoreFile = restoreBtn.getAttribute('data-file');
      const restoreName = decodeURIComponent(restoreFile || '') || (restoreBtn.getAttribute('data-name') || '');
      if (!restoreFile) {
      return;
      }
      if (!confirm('确认恢复文件：' + restoreName + ' ？将恢复到原路径（如冲突会自动改名）。')) {
      return;
      }
      resetStatus();
      try {
      const result = await fetchJson(withFolderPassword(api.restore + '?file=' + restoreFile, activeFolderPath), { method: 'POST' });
      const targetPath = String((result && result.path) || '');
      showStatus('已恢复：' + restoreName + (targetPath ? (' -> ' + targetPath) : ''), 'ok');
      await loadFiles();
      } catch (err) {
      showStatus('恢复失败：' + err.message, 'err');
      }
      return;
    }
        if (!btn) {
          return;
        }

        const file = btn.getAttribute('data-file');
        const name = decodeURIComponent(file || '') || (btn.getAttribute('data-name') || '');
        if (!file) {
          return;
        }

        const activeTagId = activeFilterTagId;

        if (activeTagId) {
          if (!confirm('确认将文件『' + name + '』从当前标签中移除？此操作只解除标签引用，不会删除文件。')) {
            return;
          }

          resetStatus();
          try {
            const ok = await unbindFileFromTag(activeTagId, name);
            if (!ok) {
              showStatus('移除引用失败：关联不存在', 'err');
              return;
            }
            await showFilesForTag(activeTagId);
            showStatus('已移除标签引用：' + name, 'warn');
          } catch (err) {
            showStatus('移除引用失败：' + err.message, 'err');
          }
          return;
        }

        const isRecycleMode = isRecycleFolderPath(activeFolderPath);
        const confirmText = isRecycleMode
          ? ('确认彻底删除文件：' + name + ' ？此操作不可恢复。')
          : ('确认删除文件：' + name + ' ？将先移入回收站。');
        if (!confirm(confirmText)) {
          return;
        }

        resetStatus();
        try {
          await fetchJson(withFolderPassword(api.del + '?file=' + file, parentFolderPathFromFilePath(name)));
          showStatus(isRecycleMode ? ('已彻底删除：' + name) : ('已移入回收站：' + name), 'warn');
          await loadFiles();
        } catch (err) {
          showStatus('删除失败：' + err.message, 'err');
        }
      });

      fileList.addEventListener('change', function (e) {
        const checkbox = e.target.closest('.file-select-input[data-select-file]');
        if (!checkbox) {
          return;
        }
        const fileName = decodeURIComponent(checkbox.getAttribute('data-select-file') || '');
        if (!fileName) {
          return;
        }
        if (checkbox.checked) {
          selectedFileNames.add(fileName);
        } else {
          selectedFileNames.delete(fileName);
        }
        updateFileSelectAllState();
        updateFileBulkActionButton();
      });

      fileList.addEventListener('dragstart', function (e) {
        const row = e.target.closest('tr[data-drag-file]');
        if (!row || !e.dataTransfer) {
          return;
        }
        const encoded = row.getAttribute('data-drag-file') || '';
        const fileName = decodeURIComponent(encoded);
        if (!fileName) {
          return;
        }
        const selectedNames = selectedFileNames.has(fileName)
          ? getSelectedVisibleFileNames()
          : [fileName];
        e.dataTransfer.effectAllowed = 'copyMove';
        e.dataTransfer.setData('text/plain', fileName);
        e.dataTransfer.setData('application/webcool-file-list', JSON.stringify(selectedNames));
      });

      fileList.addEventListener('dragend', function () {
        clearDropHighlight();
      });

      if (fileSelectAll) {
        fileSelectAll.addEventListener('change', function () {
          (Array.isArray(currentFiles) ? currentFiles : []).forEach(function (file) {
            const fileName = getFilePath(file);
            if (!fileName) {
              return;
            }
            if (fileSelectAll.checked) {
              selectedFileNames.add(fileName);
            } else {
              selectedFileNames.delete(fileName);
            }
          });
          renderFiles(activeSourceFiles);
        });
      }

      if (fileBulkAction) {
        fileBulkAction.addEventListener('click', async function () {
          const fileNames = getSelectedVisibleFileNames();
          if (!fileNames.length) {
            updateFileBulkActionButton();
            return;
          }

          const activeTagId = activeFilterTagId;
          const isRecycleMode = !activeTagId && isRecycleFolderPath(activeFolderPath);
          const actionLabel = activeTagId ? '移除' : (isRecycleMode ? '恢复' : '删除');
          const confirmText = activeTagId
            ? ('确认将选中的 ' + fileNames.length + ' 个文件从当前标签中移除？此操作只解除标签引用，不会删除文件。')
            : (isRecycleMode
              ? ('确认恢复选中的 ' + fileNames.length + ' 个文件？将恢复到原路径（如冲突会自动改名）。')
              : ('确认删除选中的 ' + fileNames.length + ' 个文件？将先移入回收站。'));
          if (!confirm(confirmText)) {
            return;
          }

          resetStatus();
          let completedCount = 0;
          try {
            if (activeTagId) {
              for (let i = 0; i < fileNames.length; i += 1) {
                const ok = await unbindFileFromTag(activeTagId, fileNames[i]);
                if (!ok) {
                  throw new Error('关联不存在');
                }
                completedCount += 1;
              }
              fileNames.forEach(function (name) {
                selectedFileNames.delete(name);
              });
              await showFilesForTag(activeTagId);
            } else if (isRecycleMode) {
              for (let i = 0; i < fileNames.length; i += 1) {
                await fetchJson(withFolderPassword(api.restore + '?file=' + encodeURIComponent(fileNames[i]), activeFolderPath), { method: 'POST' });
                completedCount += 1;
              }
              fileNames.forEach(function (name) {
                selectedFileNames.delete(name);
              });
              await loadFiles();
            } else {
              for (let i = 0; i < fileNames.length; i += 1) {
                await fetchJson(withFolderPassword(api.del + '?file=' + encodeURIComponent(fileNames[i]), parentFolderPathFromFilePath(fileNames[i])));
                completedCount += 1;
              }
              fileNames.forEach(function (name) {
                selectedFileNames.delete(name);
              });
              await loadFiles();
            }

            showStatus('已批量' + actionLabel + ' ' + completedCount + ' 个文件', activeTagId ? 'warn' : 'warn');
          } catch (err) {
            if (completedCount > 0) {
              if (activeTagId) {
                await showFilesForTag(activeTagId);
              } else {
                await loadFiles();
              }
              showStatus('批量' + actionLabel + '在处理 ' + completedCount + ' 个文件后失败：' + err.message, 'err');
              return;
            }
            showStatus('批量' + actionLabel + '失败：' + err.message, 'err');
          }
        });
      }

      if (fileBulkDeleteAction) {
        fileBulkDeleteAction.addEventListener('click', async function () {
          const fileNames = getSelectedVisibleFileNames();
          if (!fileNames.length) {
            updateFileBulkActionButton();
            return;
          }

          const isRecycleMode = !activeFilterTagId && isRecycleFolderPath(activeFolderPath);
          if (!isRecycleMode) {
            return;
          }

          const confirmText = '确认彻底删除选中的 ' + fileNames.length + ' 个文件？此操作不可恢复。';
          if (!confirm(confirmText)) {
            return;
          }

          resetStatus();
          let completedCount = 0;
          try {
            for (let i = 0; i < fileNames.length; i += 1) {
              await fetchJson(withFolderPassword(api.del + '?file=' + encodeURIComponent(fileNames[i]), parentFolderPathFromFilePath(fileNames[i])));
              completedCount += 1;
            }
            fileNames.forEach(function (name) {
              selectedFileNames.delete(name);
            });
            await loadFiles();
            showStatus('已批量彻底删除 ' + completedCount + ' 个文件', 'warn');
          } catch (err) {
            if (completedCount > 0) {
              await loadFiles();
              showStatus('批量彻底删除在处理 ' + completedCount + ' 个文件后失败：' + err.message, 'err');
              return;
            }
            showStatus('批量彻底删除失败：' + err.message, 'err');
          }
        });
      }

      if (folderRootBtn) {
        folderRootBtn.addEventListener('click', function () {
          activeFolderPath = '';
          renderFolderTree();
          renderFiles(activeSourceFiles);
        });
      }

      if (folderCreateBtn) {
        folderCreateBtn.addEventListener('click', async function () {
          try {
            await createFolderAtCurrentPath();
            await loadFiles();
          } catch (err) {
            showStatus('创建文件夹失败：' + err.message, 'err');
          }
        });
      }

      if (folderDeleteBtn) {
        folderDeleteBtn.addEventListener('click', async function () {
          try {
            await deleteCurrentFolder();
            await loadFiles();
          } catch (err) {
            showStatus('删除文件夹失败：' + err.message, 'err');
          }
        });
      }

      if (folderTree) {
        folderTree.addEventListener('click', async function (e) {
          if (e.target.closest('.folder-rename-input')) {
            return;
          }
          const toggle = e.target.closest('.folder-tree-toggle[data-folder-toggle]');
          if (toggle) {
            const path = toggle.getAttribute('data-folder-toggle') || '';
            if (expandedFolderPaths.has(path)) {
              expandedFolderPaths.delete(path);
            } else {
              expandedFolderPaths.add(path);
            }
            renderFolderTree();
            return;
          }

          const entry = e.target.closest('.folder-tree-entry[data-folder-select]');
          if (!entry) {
            return;
          }
          const path = entry.getAttribute('data-folder-select') || '';
          if (e.detail >= 2 && canRenameFolderPath(path)) {
            e.preventDefault();
            if (!(await ensureFolderUnlocked(path))) {
              return;
            }
            activeFolderPath = path;
            startFolderRename(path);
            renderFiles(activeSourceFiles);
            return;
          }
          if (!(await ensureFolderUnlocked(path))) {
            return;
          }
          activeFolderPath = path;
          ensureFolderPathExpanded(activeFolderPath);
          renderFolderTree();
          renderFiles(activeSourceFiles);
        });

        folderTree.addEventListener('contextmenu', function (e) {
          if (e.target.closest('.folder-rename-input')) {
            return;
          }
          const entry = e.target.closest('.folder-tree-entry[data-folder-select]');
          if (!entry) {
            return;
          }
          const path = entry.getAttribute('data-folder-select') || '';
          if (!canRenameFolderPath(path)) {
            return;
          }
          e.preventDefault();
          openFolderContextMenu(path, e.clientX, e.clientY);
        });

        folderTree.addEventListener('dblclick', function (e) {
          if (e.target.closest('.folder-rename-input')) {
            return;
          }
          const entry = e.target.closest('.folder-tree-entry[data-folder-select]');
          if (!entry) {
            return;
          }
          const path = entry.getAttribute('data-folder-select') || '';
          if (!canRenameFolderPath(path)) {
            return;
          }
          e.preventDefault();
          startFolderRename(path);
        });

        folderTree.addEventListener('keydown', function (e) {
          const input = e.target.closest('.folder-rename-input[data-folder-rename-input]');
          if (!input) {
            return;
          }
          if (e.key === 'Escape') {
            e.preventDefault();
            cancelFolderRename();
            return;
          }
          if (e.key === 'Enter') {
            e.preventDefault();
            submitFolderRename(input);
          }
        });

        folderTree.addEventListener('focusout', function (e) {
          const input = e.target.closest('.folder-rename-input[data-folder-rename-input]');
          if (!input) {
            return;
          }
          submitFolderRename(input);
        });

        folderTree.addEventListener('dragstart', function (e) {
          if (e.target.closest('.folder-rename-input')) {
            e.preventDefault();
            return;
          }
          const entry = e.target.closest('.folder-tree-entry[data-drag-folder]');
          if (!entry || !e.dataTransfer) {
            return;
          }
          const folderPath = entry.getAttribute('data-drag-folder') || '';
          if (!folderPath) {
            return;
          }
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', folderPath);
          e.dataTransfer.setData('application/webcool-folder-list', JSON.stringify([folderPath]));
        });

        folderTree.addEventListener('dragend', function () {
          clearFolderAutoExpandTimer();
          activeDropFolderPath = null;
          syncFolderDropHighlight();
        });

        folderTree.addEventListener('dragover', function (e) {
          const node = e.target.closest('.folder-tree-node[data-folder-path]');
          if (!node || !e.dataTransfer) {
            return;
          }
          e.preventDefault();
          const nextDropPath = node.getAttribute('data-folder-path') || '';
          if (activeDropFolderPath !== nextDropPath) {
            activeDropFolderPath = nextDropPath;
            syncFolderDropHighlight();
            scrollFolderPathIntoView(nextDropPath);
          }
          scheduleFolderAutoExpand(nextDropPath);
          e.dataTransfer.dropEffect = 'move';
        });

        folderTree.addEventListener('dragleave', function (e) {
          if (!folderTree.contains(e.relatedTarget)) {
            clearFolderAutoExpandTimer();
            activeDropFolderPath = null;
            syncFolderDropHighlight();
          }
        });

        folderTree.addEventListener('drop', async function (e) {
          const node = e.target.closest('.folder-tree-node[data-folder-path]');
          let folderPaths = [];
          let fileNames = [];
          if (e.dataTransfer) {
            try {
              folderPaths = JSON.parse(e.dataTransfer.getData('application/webcool-folder-list') || '[]');
            } catch (_) {
              folderPaths = [];
            }
            try {
              fileNames = JSON.parse(e.dataTransfer.getData('application/webcool-file-list') || '[]');
            } catch (_) {
              fileNames = [];
            }
            if (!folderPaths.length && !fileNames.length) {
              const fallbackName = String(e.dataTransfer.getData('text/plain') || '');
              if (fallbackName) {
                fileNames = [fallbackName];
              }
            }
          }
          clearFolderAutoExpandTimer();
          activeDropFolderPath = null;
          syncFolderDropHighlight();
          if (!node) {
            return;
          }
          e.preventDefault();
          const targetFolder = node.getAttribute('data-folder-path') || '';
          if (folderPaths.length) {
            try {
              const summary = await moveFoldersToFolder(folderPaths, targetFolder);
              let message = summary.movedCount > 1 ? ('已移动 ' + summary.movedCount + ' 个文件夹') : '文件夹已移动';
              if (summary.ignoredCount > 0) {
                message += '，已忽略 ' + summary.ignoredCount + ' 个重复子文件夹';
              }
              showStatus(message, 'ok');
            } catch (err) {
              showStatus('移动文件夹失败：' + err.message, 'err');
            }
            return;
          }
          if (!fileNames.length) {
            return;
          }
          try {
            await moveFilesToFolder(fileNames, targetFolder);
          } catch (err) {
            showStatus('移动文件失败：' + err.message, 'err');
          }
        });
      }

      if (filesTagToggleBtn) {
        filesTagToggleBtn.addEventListener('click', async function () {
          const rootName = await askTagName({
            title: '新建一级标签',
            description: '标签会显示在左侧树的第一层。',
            placeholder: '请输入一级标签名称'
          });
          if (rootName === null) {
            return;
          }
          const result = await addTagNode('', rootName);
          if (!result.ok) {
            showStatus('创建标签失败：' + result.message, 'err');
            return;
          }
          await loadTagTreeState();
          renderTagTree();
          showStatus('一级标签已创建', 'ok');
        });
      }

      if (tagManager) {
        tagManager.addEventListener('click', async function (e) {
          if (e.target.closest('.tag-rename-input')) {
            return;
          }
          const tagNameEl = e.target.closest('.tag-node-name[data-tag-id]');
          if (tagNameEl) {
            e.stopPropagation();
            const tagId = tagNameEl.getAttribute('data-tag-id') || '';
            if (!tagId) {
              return;
            }
            if (e.detail >= 2) {
              const meta = findTagMetaById(tagId);
              if (meta && canRenameTagNode(meta.node, meta.level)) {
                e.preventDefault();
                startTagRename(tagId);
              }
              return;
            }
            try {
              if (activeFilterTagId === tagId) {
                clearTagFileFilter();
              } else {
                await showFilesForTag(tagId);
              }
            } catch (err) {
              showStatus('加载标签文件失败：' + err.message, 'err');
            }
            return;
          }

          const deleteBtn = e.target.closest('.tag-inline-btn[data-tag-delete]');
          if (deleteBtn) {
            e.stopPropagation();
            const tagId = deleteBtn.getAttribute('data-tag-delete') || '';
            const meta = findTagMetaById(tagId);
            if (meta && isProtectedRestrictedRootTag(meta.node, meta.level)) {
              showStatus('受限一级标签不能删除', 'err');
              renderTagTree();
              return;
            }
            if (!confirm('确认删除该标签节点及其子节点？仅会删除标签引用关系，不会删除文件。')) {
              return;
            }
            const removedNode = await removeTagNode(tagId);
            if (!removedNode || removedNode.ok === false) {
              showStatus('删除标签失败：' + ((removedNode && removedNode.error) ? removedNode.error : '节点不存在'), 'err');
              return;
            }
            expandedTagNodeIds.delete(tagId);
            if (activeFilterTagId === tagId) {
              clearTagFileFilter();
            }
            await loadTagTreeState();
            renderTagTree();
            showStatus('标签节点已删除（未删除任何文件）', 'warn');
            return;
          }

          const createBtn = e.target.closest('.tag-inline-btn[data-tag-create][data-tag-level]');
          if (createBtn) {
            e.stopPropagation();
            const tagId = createBtn.getAttribute('data-tag-create') || '';
            const level = Number(createBtn.getAttribute('data-tag-level') || '0');
            if (level <= 0 || level >= TAG_MAX_LEVEL) {
              return;
            }

            const childName = await askTagName({
              title: '新建子标签',
              description: '当前节点下最多支持三级标签。',
              placeholder: '请输入子标签名称'
            });
            if (childName === null) {
              return;
            }
            const addResult = await addTagNode(tagId, childName);
            if (!addResult.ok) {
              showStatus('创建子标签失败：' + addResult.message, 'err');
              return;
            }
            expandedTagNodeIds.add(tagId);
            await loadTagTreeState();
            renderTagTree();
            showStatus('子标签已创建', 'ok');
            return;
          }

          const nodeToggleBtn = e.target.closest('.tag-node-toggle[data-tag-id]');
          if (nodeToggleBtn) {
            const tagId = nodeToggleBtn.getAttribute('data-tag-id') || '';

            const meta = findTagMetaById(tagId);
            if (!meta || !meta.node) {
              showStatus('节点不存在，可能已被删除', 'err');
              return;
            }

            if (hasTagChildren(meta.node)) {
              if (expandedTagNodeIds.has(tagId)) {
                expandedTagNodeIds.delete(tagId);
              } else {
                expandedTagNodeIds.add(tagId);
              }
              renderTagTree();
              return;
            }
          }

          const unbindBtn = e.target.closest('.tag-unbind-btn[data-tag-id][data-file]');
          if (unbindBtn) {
            const tagId = unbindBtn.getAttribute('data-tag-id') || '';
            const fileName = decodeURIComponent(unbindBtn.getAttribute('data-file') || '');
            if (!(await unbindFileFromTag(tagId, fileName))) {
              showStatus('解引用失败：关联不存在', 'err');
              return;
            }
            await loadTagTreeState();
            renderTagTree();
            if (activeFilterTagId === tagId) {
              await showFilesForTag(tagId);
            }
            showStatus('文件已解引用', 'warn');
          }
        });

        tagManager.addEventListener('keydown', function (e) {
          const input = e.target.closest('.tag-rename-input[data-tag-rename-input]');
          if (!input) {
            return;
          }
          if (e.key === 'Escape') {
            e.preventDefault();
            cancelTagRename();
            return;
          }
          if (e.key === 'Enter') {
            e.preventDefault();
            submitTagRename(input);
          }
        });

        tagManager.addEventListener('focusout', function (e) {
          const input = e.target.closest('.tag-rename-input[data-tag-rename-input]');
          if (!input) {
            return;
          }
          submitTagRename(input);
        });

        tagManager.addEventListener('contextmenu', function (e) {
          if (e.target.closest('.tag-rename-input')) {
            return;
          }
          const tagNameEl = e.target.closest('.tag-node-name[data-tag-id]');
          if (!tagNameEl) {
            closeAudioTagContextMenu();
            return;
          }
          const tagId = tagNameEl.getAttribute('data-tag-id') || '';
          if (!tagId || getTagFileTypeConstraint(tagId) !== 'audio') {
            closeAudioTagContextMenu();
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          openAudioTagContextMenu(tagId, String(tagNameEl.textContent || '').trim(), e.clientX, e.clientY);
        });

        tagManager.addEventListener('dragover', function (e) {
          const nodeEl = e.target.closest('.tag-node[data-tag-id]');
          if (!nodeEl) {
            clearDropHighlight();
            return;
          }
          const tagId = nodeEl.getAttribute('data-tag-id') || '';
          let fileNames = [];
          if (e.dataTransfer) {
            try {
              fileNames = JSON.parse(e.dataTransfer.getData('application/webcool-file-list') || '[]');
            } catch (_) {
              fileNames = [];
            }
            if (!fileNames.length) {
              const fallbackName = String(e.dataTransfer.getData('text/plain') || '');
              if (fallbackName) {
                fileNames = [fallbackName];
              }
            }
          }
          const invalidFile = fileNames.find(function (fileName) {
            return !canBindFileToTagOnClient(tagId, fileName).ok;
          }) || '';
          if (invalidFile) {
            clearDropHighlight();
            if (e.dataTransfer) {
              e.dataTransfer.dropEffect = 'none';
            }
            return;
          }
          e.preventDefault();
          if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'copy';
          }
          setDropHighlight(nodeEl);
        });

        tagManager.addEventListener('dragleave', function (e) {
          if (!tagManager.contains(e.relatedTarget)) {
            clearDropHighlight();
          }
        });

        tagManager.addEventListener('drop', async function (e) {
          const nodeEl = e.target.closest('.tag-node[data-tag-id]');
          let fileNames = [];
          if (e.dataTransfer) {
            try {
              fileNames = JSON.parse(e.dataTransfer.getData('application/webcool-file-list') || '[]');
            } catch (_) {
              fileNames = [];
            }
            if (!fileNames.length) {
              const fallbackName = String(e.dataTransfer.getData('text/plain') || '');
              if (fallbackName) {
                fileNames = [fallbackName];
              }
            }
          }
          clearDropHighlight();
          if (!nodeEl || !fileNames.length) {
            return;
          }
          e.preventDefault();

          const tagId = nodeEl.getAttribute('data-tag-id') || '';
          const invalidFile = fileNames.find(function (fileName) {
            return !canBindFileToTagOnClient(tagId, fileName).ok;
          }) || '';
          if (invalidFile) {
            showStatus('拖拽引用失败：' + canBindFileToTagOnClient(tagId, invalidFile).message, 'err');
            return;
          }
          const result = await bindFilesToTag(tagId, fileNames);
          if (!result.ok) {
            showStatus('拖拽引用失败：' + result.message, 'err');
            return;
          }

          fileNames.forEach(function (name) {
            selectedFileNames.delete(name);
          });
          await loadTagTreeState();
          renderTagTree();
          if (activeFilterTagId === tagId) {
            await showFilesForTag(tagId);
          } else {
            renderFiles(activeSourceFiles);
          }
          showStatus(fileNames.length > 1
            ? ('已批量移动 ' + fileNames.length + ' 个文件到标签')
            : '已通过拖拽移动文件到标签', 'ok');
        });
      }

      document.addEventListener('click', function (e) {
        const folderMenuItem = e.target.closest('.folder-context-item[data-folder-menu-action]');
        if (folderMenuItem && activeFolderContextMenu && activeFolderContextMenu.contains(folderMenuItem)) {
          const menu = activeFolderContextMenu;
          const action = folderMenuItem.getAttribute('data-folder-menu-action') || '';
          const path = menu.getAttribute('data-folder-path') || '';
          closeFolderContextMenu();
          handleFolderContextAction(action, path).catch(function (err) {
            showStatus('目录操作失败：' + err.message, 'err');
          });
          return;
        }
        if (activeFolderContextMenu && !e.target.closest('.folder-context-menu')) {
          closeFolderContextMenu();
        }

        if (activeAudioTagContextMenu && !e.target.closest('.tag-context-menu')) {
          closeAudioTagContextMenu();
        }

        if (tagDialog && !tagDialog.hidden) {
          const closeTarget = e.target.closest('[data-tag-dialog-close="1"]');
          if (closeTarget) {
            closeTagDialog(null);
            return;
          }
        }
      });

      if (tagDialogForm) {
        tagDialogForm.addEventListener('submit', function (e) {
          e.preventDefault();
          closeTagDialog(tagDialogInput ? tagDialogInput.value : '');
        });
      }

      if (tagDialogCancelBtn) {
        tagDialogCancelBtn.addEventListener('click', function () {
          closeTagDialog(null);
        });
      }

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && activeAudioTagContextMenu) {
          e.preventDefault();
          closeAudioTagContextMenu();
          return;
        }
        if (e.key === 'Escape' && tagDialog && !tagDialog.hidden) {
          e.preventDefault();
          closeTagDialog(null);
        }
      });

      document.addEventListener('scroll', function () {
        closeAudioTagContextMenu();
      }, true);

      document.body.addEventListener('click', async function (e) {
        const actionBtn = e.target.closest('.tag-context-item[data-audio-tag-action][data-tag-id]');
        if (!actionBtn) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        const tagId = actionBtn.getAttribute('data-tag-id') || '';
        const mode = actionBtn.getAttribute('data-audio-tag-action') || '';
        const menuEl = actionBtn.closest('.tag-context-menu');
        const tagName = menuEl ? (menuEl.getAttribute('data-tag-name') || '') : '';
        closeAudioTagContextMenu();
        if (!tagId || !AUDIO_PLAY_MODE_LABELS[mode]) {
          return;
        }
        try {
          await startAudioPlaylistFromTag(tagId, tagName, mode);
        } catch (err) {
          showStatus('打开音频播放列表失败：' + err.message, 'err');
        }
      });

      document.addEventListener('mousemove', function (e) {
        if (!activeDrag || !activeDrag.win) {
          return;
        }

        const dx = e.clientX - activeDrag.startX;
        const dy = e.clientY - activeDrag.startY;
        activeDrag.win.style.left = Math.round(activeDrag.left + dx) + 'px';
        activeDrag.win.style.top = Math.round(activeDrag.top + dy) + 'px';
      });

      document.addEventListener('mouseup', function () {
        if (!activeDrag || !activeDrag.win) {
          return;
        }
        clampWindowPosition(activeDrag.win);
        activeDrag = null;
      });

      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') {
          return;
        }

        const wins = Array.from(previewLayer.querySelectorAll('.floating-preview'));
        if (!wins.length) {
          return;
        }

        wins.sort(function (a, b) {
          return (parseInt(a.style.zIndex || '0', 10) || 0)
            - (parseInt(b.style.zIndex || '0', 10) || 0);
        });

        closePreviewWindow(wins[wins.length - 1]);
      });

      window.addEventListener('resize', function () {
        const wins = previewLayer.querySelectorAll('.floating-preview');
        Array.prototype.forEach.call(wins, clampWindowPosition);
      });

      if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', function () {
          const nextCollapsed = !(shell && shell.classList.contains('sidebar-collapsed'));
          setSidebarCollapsed(nextCollapsed);
          try {
            localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, nextCollapsed ? '1' : '0');
          } catch (err) {}
        });
      }

      try {
        setSidebarCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === '1');
      } catch (err) {
        setSidebarCollapsed(false);
      }

      menuButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          const panelId = btn.getAttribute('data-panel');
          if (panelId === 'panel-files') {
            activeFilterTagId = '';
          } else if (panelId === 'panel-local-disk') {
            activeFilterTagId = '';
          }
          if (panelId) {
            activatePanel(panelId);
          }
        });
      });

      activatePanel('panel-files');
    })();
