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
        fileLock: '/api/v1/files/lock',
        fileUnlock: '/api/v1/files/unlock',
        fileLockVerify: '/api/v1/files/lock/verify',
        tags: '/api/v1/tags',
        tagCreate: '/api/v1/tags/create',
        tagRename: '/api/v1/tags/rename',
        tagDelete: '/api/v1/tags/delete',
        tagBind: '/api/v1/tags/bind',
        tagUnbind: '/api/v1/tags/unbind',
        tagLock: '/api/v1/tags/lock',
        tagUnlock: '/api/v1/tags/unlock',
        tagLockVerify: '/api/v1/tags/lock/verify',
        tagFiles: '/api/v1/tag-files',
        upload: '/api/v1/upload',
        del: '/api/v1/delete',
        restore: '/api/v1/restore',
        download: '/api/v1/download',
        imageSave: '/api/v1/image/save',
        localDiskList: '/api/v1/local-disk/list',
        localDiskDownload: '/api/v1/local-disk/download',
        localDiskDelete: '/api/v1/local-disk/delete',
        localDiskMkdir: '/api/v1/local-disk/mkdir',
        localDiskMove: '/api/v1/local-disk/move',
        localDiskOpenTrash: '/api/v1/local-disk/open-trash',
        localDiskOpenFile: '/api/v1/local-disk/open-file',
        localDiskImport: '/api/v1/local-disk/import',
        localDiskImportProgress: '/api/v1/local-disk/import/progress',
        reloadTpl: '/api/v1/admin/template/reload',
        adminStorage: '/api/v1/admin/storage',
        adminStorageMigrate: '/api/v1/admin/storage/migrate',
        adminStorageMigrateProgress: '/api/v1/admin/storage/migrate/progress',
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
      const adminStorageTab = document.getElementById('admin-storage-tab');
      const adminLanguageTab = document.getElementById('admin-language-tab');
      const adminStorageView = document.getElementById('admin-storage-view');
      const adminLanguageView = document.getElementById('admin-language-view');
      const adminLanguageSelect = document.getElementById('admin-language-select');
      const adminLanguageApplyBtn = document.getElementById('admin-language-apply-btn');
      const adminStoragePath = document.getElementById('admin-storage-path');
      const adminStorageBrowseBtn = document.getElementById('admin-storage-browse-btn');
      const adminStorageChooseBtn = document.getElementById('admin-storage-choose-btn');
      const adminStorageProgress = document.getElementById('admin-storage-progress');
      const adminStorageProgressFill = document.getElementById('admin-storage-progress-fill');
      const adminStorageProgressText = document.getElementById('admin-storage-progress-text');
      const adminStorageProgressMessage = document.getElementById('admin-storage-progress-message');
      const adminStoragePickerDialog = document.getElementById('admin-storage-picker-dialog');
      const adminStoragePickerTree = document.getElementById('admin-storage-picker-tree');
      const adminStoragePickerEmpty = document.getElementById('admin-storage-picker-empty');
      const adminStoragePickerPath = document.getElementById('admin-storage-picker-path');
      const adminStoragePickerCancelBtn = document.getElementById('admin-storage-picker-cancel');
      const adminStoragePickerConfirmBtn = document.getElementById('admin-storage-picker-confirm');
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
      const fileListTitle = document.getElementById('file-list-title');
      const tagViewModeBtns = document.getElementById('tag-view-mode-btns');
      const tagViewListBtn = document.getElementById('tag-view-list-btn');
      const tagViewPreviewBtn = document.getElementById('tag-view-preview-btn');
      const tagImagePreviewWrap = document.getElementById('tag-image-preview-wrap');
      const fileSelectAll = document.getElementById('file-select-all');
      const fileBulkTagAction = document.getElementById('file-bulk-tag-action');
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
      const localDiskBulkTagBtn = document.getElementById('local-disk-bulk-tag-btn');
      const localDiskBulkRemoveBtn = document.getElementById('local-disk-bulk-remove-btn');
      const localDiskTableBulkTagBtn = document.getElementById('local-disk-table-bulk-tag-btn');
      const localDiskEmpty = document.getElementById('local-disk-empty');
      const localSortButtons = Array.from(document.querySelectorAll('.local-sort-btn[data-local-sort-key]'));
      const explorerShell = document.querySelector('.explorer-shell');
      const folderBrowser = document.querySelector('.folder-browser');
      const folderTree = document.getElementById('folder-tree');
      const folderTreeEmpty = document.getElementById('folder-tree-empty');
      const folderCurrentPath = document.getElementById('folder-current-path');
      const folderCreateBtn = document.getElementById('folder-create-btn');
      const folderDeleteBtn = document.getElementById('folder-delete-btn');
      const folderRestoreBtn = document.getElementById('folder-restore-btn');
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
      const tagDialogLabel = document.getElementById('tag-dialog-label');
      const tagDialogInput = document.getElementById('tag-dialog-input');
      const tagDialogCancelBtn = document.getElementById('tag-dialog-cancel');
      const lockDialog = document.getElementById('lock-dialog');
      const lockDialogForm = document.getElementById('lock-dialog-form');
      const lockDialogTitle = document.getElementById('lock-dialog-title');
      const lockDialogDesc = document.getElementById('lock-dialog-desc');
      const lockDialogInput = document.getElementById('lock-dialog-input');
      const lockDialogError = document.getElementById('lock-dialog-error');
      const lockDialogCancelBtn = document.getElementById('lock-dialog-cancel');
      const lockDialogConfirmBtn = document.getElementById('lock-dialog-confirm');
      const confirmDialog = document.getElementById('confirm-dialog');
      const confirmDialogTitle = document.getElementById('confirm-dialog-title');
      const confirmDialogDesc = document.getElementById('confirm-dialog-desc');
      const confirmDialogCancelBtn = document.getElementById('confirm-dialog-cancel');
      const confirmDialogConfirmBtn = document.getElementById('confirm-dialog-confirm');
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
      const FOLDER_UNLOCK_SESSION_STORAGE_KEY = 'webcool:folder-unlocks:v1';
      const FILE_UNLOCK_SESSION_STORAGE_KEY = 'webcool:file-unlocks:v1';
      const LANGUAGE_STORAGE_KEY = 'webcool:language:v1';
      const UI_LANG = (document.documentElement.getAttribute('lang') || 'zh-CN').toLowerCase().indexOf('en') === 0
        ? 'en'
        : 'zh';
      const TAG_MAX_LEVEL = 3;
      const AUDIO_PLAY_MODE_LABELS = {
        random: 'Shuffle',
        sequential: 'Sequential',
        loop: 'Loop'
      };
      const AUDIO_PLAY_MODE_ICONS = {
        random: '⤮',
        sequential: '⇥',
        loop: '↻'
      };
      const RECYCLE_FOLDER_NAME = '\u56de\u6536\u7ad9';
      const DISPLAY_ROOT_FOLDER_NAME = 'Root';
      const DISPLAY_RECYCLE_FOLDER_NAME = 'Trash';
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
      let activeFileContextMenu = null;
      const unlockedFolderPasswords = new Map();
      const unlockedFilePasswords = new Map();
      const selectedFileNames = new Set();
      const selectedFolderPaths = new Set();
      let lastSelectedFolderPath = '';
      const expandedFolderPaths = new Set(['']);
      let tagTree = [];
      let activeFilterTagId = '';
      let tagFileViewMode = 'list';
      let currentAdminStoragePath = '';
      let adminStorageProgressTimer = null;
      let adminStoragePickerRootPath = '';
      let adminStoragePickerSelectedPath = '';
      const adminStoragePickerCache = new Map();
      const adminStoragePickerExpandedPaths = new Set();
      const expandedTagNodeIds = new Set();
      let activeTagMenuId = '';
      let activeDropTagNode = null;
      let activeTagRenameId = '';
      let tagRenameRequestId = '';
      let previewZ = 900;
      let activeTagPreviewImages = [];
      let activeDrag = null;
      let activeTagDialogResolver = null;
      let activeLockDialogState = null;
      let activeConfirmDialogResolver = null;
      let activeAudioTagContextMenu = null;
      let activeFileTagMenu = null;
      const openedPreviewWindows = new Map();
      const transcodeProgressTimers = new Map();
      const videoResumeSaveTimers = new Map();

      function saveUnlockedFolderPasswords() {
        try {
          const entries = Array.from(unlockedFolderPasswords.entries()).filter(function (entry) {
            return entry[0] && entry[1];
          });
          sessionStorage.setItem(FOLDER_UNLOCK_SESSION_STORAGE_KEY, JSON.stringify(entries));
        } catch (_) {}
      }

      function loadUnlockedFolderPasswords() {
        try {
          const raw = sessionStorage.getItem(FOLDER_UNLOCK_SESSION_STORAGE_KEY);
          const entries = raw ? JSON.parse(raw) : [];
          if (!Array.isArray(entries)) {
            return;
          }
          entries.forEach(function (entry) {
            if (Array.isArray(entry) && entry[0] && entry[1]) {
              unlockedFolderPasswords.set(String(entry[0]), String(entry[1]));
            }
          });
        } catch (_) {}
      }

      function setUnlockedFolderPassword(path, password) {
        const target = String(path || '');
        if (!target) {
          return;
        }
        unlockedFolderPasswords.set(target, String(password || ''));
        saveUnlockedFolderPasswords();
      }

      function deleteUnlockedFolderPassword(path) {
        const target = String(path || '');
        if (!target) {
          return;
        }
        unlockedFolderPasswords.delete(target);
        saveUnlockedFolderPasswords();
      }

      loadUnlockedFolderPasswords();

      function saveUnlockedFilePasswords() {
        try {
          const entries = Array.from(unlockedFilePasswords.entries()).filter(function (entry) {
            return entry[0] && entry[1];
          });
          sessionStorage.setItem(FILE_UNLOCK_SESSION_STORAGE_KEY, JSON.stringify(entries));
        } catch (_) {}
      }

      function loadUnlockedFilePasswords() {
        try {
          const raw = sessionStorage.getItem(FILE_UNLOCK_SESSION_STORAGE_KEY);
          const entries = raw ? JSON.parse(raw) : [];
          if (!Array.isArray(entries)) {
            return;
          }
          entries.forEach(function (entry) {
            if (Array.isArray(entry) && entry[0] && entry[1]) {
              unlockedFilePasswords.set(String(entry[0]), String(entry[1]));
            }
          });
        } catch (_) {}
      }

      function fileLockKey(path, local) {
        return (local ? 'local:' : 'remote:') + String(path || '');
      }

      function localDirLockKey(path) {
        return 'local-dir:' + String(path || '');
      }

      function tagLockKey(tagId) {
        return 'tag:' + String(tagId || '');
      }

      function getFilePassword(path, local) {
        return unlockedFilePasswords.get(fileLockKey(path, local)) || '';
      }

      function setUnlockedFilePassword(path, local, password) {
        unlockedFilePasswords.set(fileLockKey(path, local), String(password || ''));
        saveUnlockedFilePasswords();
      }

      function deleteUnlockedFilePassword(path, local) {
        unlockedFilePasswords.delete(fileLockKey(path, local));
        saveUnlockedFilePasswords();
      }

      function getLocalDirPassword(path) {
        return unlockedFilePasswords.get(localDirLockKey(path)) || '';
      }

      function getLocalDirPasswordForPath(path) {
        const text = String(path || '');
        if (!text) {
          return '';
        }
        const parts = text.split('/').filter(Boolean);
        for (let i = parts.length; i >= 0; i -= 1) {
          const candidate = i === 0 ? '/' : ('/' + parts.slice(0, i).join('/'));
          const password = getLocalDirPassword(candidate);
          if (password) {
            return password;
          }
        }
        return '';
      }

      function setUnlockedLocalDirPassword(path, password) {
        unlockedFilePasswords.set(localDirLockKey(path), String(password || ''));
        saveUnlockedFilePasswords();
      }

      function deleteUnlockedLocalDirPassword(path) {
        unlockedFilePasswords.delete(localDirLockKey(path));
        saveUnlockedFilePasswords();
      }

      function getTagPassword(tagId) {
        return unlockedFilePasswords.get(tagLockKey(tagId)) || '';
      }

      function setUnlockedTagPassword(tagId, password) {
        const id = String(tagId || '');
        if (!id) {
          return;
        }
        unlockedFilePasswords.set(tagLockKey(id), String(password || ''));
        saveUnlockedFilePasswords();
      }

      function deleteUnlockedTagPassword(tagId) {
        const id = String(tagId || '');
        if (!id) {
          return;
        }
        unlockedFilePasswords.delete(tagLockKey(id));
        saveUnlockedFilePasswords();
      }

      function appendFilePassword(url, path, local) {
        const password = getFilePassword(path, local);
        if (!password) {
          return url;
        }
        return url + '&file_password=' + encodeURIComponent(password);
      }

      function appendTagPassword(url, tagId) {
        const password = getTagPassword(tagId);
        if (!password) {
          return url;
        }
        return url + '&tag_password=' + encodeURIComponent(password);
      }

      function appendLocalDirPassword(url, path, paramName) {
        const password = getLocalDirPasswordForPath(path);
        if (!password) {
          return url;
        }
        return url + '&' + encodeURIComponent(paramName || 'local_dir_password') + '=' + encodeURIComponent(password);
      }

      loadUnlockedFilePasswords();
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
          display_path: path,
          directory: !!source.directory,
          locked: !!source.locked
        });
      }

      function getFilePath(file) {
        return String((file && file.path) || (file && file.name) || '');
      }

      function getFileLabel(file) {
        return String((file && file.display_path) || getFilePath(file) || '');
      }

      function getFolderLabel(path) {
        const text = String(path || '');
        if (!text) {
          return DISPLAY_ROOT_FOLDER_NAME;
        }
        return displayFolderPath(text);
      }

      function displayFolderName(name) {
        const text = String(name || '');
        return text === RECYCLE_FOLDER_NAME ? DISPLAY_RECYCLE_FOLDER_NAME : text;
      }

      function displayFolderPath(path) {
        const text = String(path || '');
        if (!text) {
          return DISPLAY_ROOT_FOLDER_NAME;
        }
        if (text === RECYCLE_FOLDER_NAME) {
          return DISPLAY_RECYCLE_FOLDER_NAME;
        }
        if (text.indexOf(RECYCLE_FOLDER_NAME + '/') === 0) {
          return DISPLAY_RECYCLE_FOLDER_NAME + text.slice(RECYCLE_FOLDER_NAME.length);
        }
        return text;
      }

      function displayTagName(name) {
        const text = String(name || '');
        if (text === '\u89c6\u9891') return 'Video';
        if (text === '\u97f3\u9891') return 'Audio';
        if (text === '\u56fe\u7247') return 'Images';
        return text;
      }

      function displayFileSize(size) {
        return formatNumber(Number(size || 0)) + ' bytes';
      }

      function isRecycleFolderPath(path) {
        const text = String(path || '');
        return text === RECYCLE_FOLDER_NAME || text.indexOf(RECYCLE_FOLDER_NAME + '/') === 0;
      }

      function isRecycleRootFolderPath(path) {
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

      function isFolderUnlockedInSession(path) {
        const lockedPath = getFolderLockAncestorPath(path);
        return !lockedPath || unlockedFolderPasswords.has(lockedPath);
      }

      function withFolderPassword(url, path, paramName) {
        const password = getFolderPasswordForPath(path);
        if (!password) {
          return url;
        }
        return url + '&' + encodeURIComponent(paramName || 'folder_password') + '=' + encodeURIComponent(password);
      }

      function folderListUrl() {
        const entries = Array.from(unlockedFolderPasswords.entries()).filter(function (entry) {
          return entry[0] && entry[1];
        });
        if (!entries.length) {
          return api.folders;
        }
        let url = api.folders + '?unlock_count=' + encodeURIComponent(String(entries.length));
        entries.forEach(function (entry, index) {
          url += '&unlock_path_' + index + '=' + encodeURIComponent(entry[0]);
          url += '&unlock_password_' + index + '=' + encodeURIComponent(entry[1]);
        });
        return url;
      }

      function downloadUrlForFile(filePath, preview) {
        const encoded = encodeURIComponent(filePath || '');
        let url = api.download + '?' + (preview ? 'preview=1&' : '') + 'file=' + encoded;
        url = withFolderPassword(url, parentFolderPathFromFilePath(filePath));
        return appendFilePassword(url, filePath, false);
      }

      function localDiskDownloadUrl(path) {
        const filePath = String(path || '/');
        return appendLocalDirPassword(
          appendFilePassword(api.localDiskDownload + '?path=' + encodeURIComponent(filePath), filePath, true),
          localDiskParentPath(filePath)
        );
      }

      async function ensureFolderUnlocked(path) {
        const lockedPath = getFolderLockAncestorPath(path);
        if (!lockedPath) {
          return true;
        }
        if (unlockedFolderPasswords.has(lockedPath)) {
          return true;
        }
        const password = await askLockPassword({
          title: 'UnlockFolder',
          description: 'Please enterFolder"' + lockedPath + '" lock password.',
          onSubmit: async function (passwordText) {
            await fetchJson(
              api.folderLockVerify + '?path=' + encodeURIComponent(path) + '&password=' + encodeURIComponent(passwordText),
              { method: 'POST' }
            );
          }
        });
        if (password === null) {
          return false;
        }
        setUnlockedFolderPassword(lockedPath, password);
        return true;
      }

      function folderLockIconHtml(node) {
        if (!node || !node.locked) {
          return '';
        }
        const path = String(node.path || '');
        if (unlockedFolderPasswords.has(path)) {
          return '<span class="folder-lock-icon unlocked" title="Click to lock again" aria-label="Click to lock again" data-folder-lock-toggle="' + escapeHtml(path) + '"><span class="folder-lock-shackle"></span><span class="folder-lock-body"></span></span>';
        }
        return '<span class="folder-lock-icon" title=" Lock" aria-label=" Lock"><span class="folder-lock-shackle"></span><span class="folder-lock-body"></span></span>';
      }

      function closeFolderContextMenu() {
        if (activeFolderContextMenu && activeFolderContextMenu.parentNode) {
          activeFolderContextMenu.parentNode.removeChild(activeFolderContextMenu);
        }
        activeFolderContextMenu = null;
      }

      function closeFileContextMenu() {
        if (activeFileContextMenu && activeFileContextMenu.parentNode) {
          activeFileContextMenu.parentNode.removeChild(activeFileContextMenu);
        }
        activeFileContextMenu = null;
      }

      function openFileContextMenu(path, local, locked, isVideo, clientX, clientY) {
        closeFileContextMenu();
        closeFolderContextMenu();
        const filePath = String(path || '');
        if (!filePath) {
          return;
        }
        const isUnlocked = !!getFilePassword(filePath, local);
        const menu = document.createElement('div');
        menu.className = 'folder-context-menu file-context-menu';
        menu.setAttribute('data-file-path', filePath);
        menu.setAttribute('data-file-local', local ? '1' : '0');
        let html = '';
        if (locked) {
          html += '<button type="button" class="folder-context-item" data-file-menu-action="' + (isUnlocked ? 'session-lock' : 'session-unlock') + '">' + (isUnlocked ? 'Lock' : 'Unlock') + '</button>';
          html += '<button type="button" class="folder-context-item" data-file-menu-action="remove-lock">Remove Lock</button>';
        } else {
          html += '<button type="button" class="folder-context-item" data-file-menu-action="lock">Lock</button>';
        }
        if (local && isVideo) {
          html += '<button type="button" class="folder-context-item" data-file-menu-action="open-local-player">Play with local player</button>';
          html += '<button type="button" class="folder-context-item" data-file-menu-action="choose-local-player">Choose local player</button>';
        }
        menu.innerHTML = html;
        document.body.appendChild(menu);
        menu.style.left = Math.round(clientX) + 'px';
        menu.style.top = Math.round(clientY) + 'px';
        clampFloatingMenuPosition(menu, clientX, clientY);
        activeFileContextMenu = menu;
      }

      function localDirLockIconHtml(path, locked) {
        const dirPath = String(path || '');
        if (!locked) {
          return '';
        }
        const unlocked = !!getLocalDirPassword(dirPath);
        return '<span class="folder-lock-icon file-lock-inline local-dir-lock-inline' + (unlocked ? ' unlocked' : '') + '" title="' + (unlocked ? 'Click to lock again' : 'Click to unlock') + '" aria-label="' + (unlocked ? 'Click to lock again' : 'Click to unlock') + '"><span class="folder-lock-shackle"></span><span class="folder-lock-body"></span></span>';
      }

      function openLocalDirContextMenu(path, locked, clientX, clientY) {
        closeFileContextMenu();
        closeFolderContextMenu();
        const dirPath = String(path || '');
        if (!dirPath || dirPath === '/') {
          return;
        }
        const unlocked = !!getLocalDirPassword(dirPath);
        const menu = document.createElement('div');
        menu.className = 'folder-context-menu file-context-menu';
        menu.setAttribute('data-local-dir-path', dirPath);
        let html = '';
        if (locked) {
          html += '<button type="button" class="folder-context-item" data-local-dir-menu-action="' + (unlocked ? 'session-lock' : 'session-unlock') + '">' + (unlocked ? 'Lock' : 'Unlock') + '</button>';
          html += '<button type="button" class="folder-context-item" data-local-dir-menu-action="remove-lock">Remove Lock</button>';
        } else {
          html += '<button type="button" class="folder-context-item" data-local-dir-menu-action="lock">Lock</button>';
        }
        menu.innerHTML = html;
        document.body.appendChild(menu);
        menu.style.left = Math.round(clientX) + 'px';
        menu.style.top = Math.round(clientY) + 'px';
        clampFloatingMenuPosition(menu, clientX, clientY);
        activeFileContextMenu = menu;
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
        const lockActionsHtml = node.locked
          ? '<button type="button" class="folder-context-item" data-folder-menu-action="' + (unlockedFolderPasswords.has(path) ? 'session-lock' : 'session-unlock') + '">' + (unlockedFolderPasswords.has(path) ? 'Lock' : 'Unlock') + '</button>' +
            '<button type="button" class="folder-context-item" data-folder-menu-action="remove-lock">Remove Lock</button>'
          : '<button type="button" class="folder-context-item" data-folder-menu-action="lock">Lock</button>';
        menu.innerHTML =
          '<button type="button" class="folder-context-item" data-folder-menu-action="create">Create Subfolder</button>' +
          '<button type="button" class="folder-context-item" data-folder-menu-action="delete">Delete</button>' +
          '<button type="button" class="folder-context-item" data-folder-menu-action="rename">Rename</button>' +
          lockActionsHtml;
        document.body.appendChild(menu);
        menu.style.left = Math.round(clientX) + 'px';
        menu.style.top = Math.round(clientY) + 'px';
        clampFloatingMenuPosition(menu, clientX, clientY);
        activeFolderContextMenu = menu;
      }

      async function relockFolderInSession(path) {
        const target = String(path || '');
        if (!target || !unlockedFolderPasswords.has(target)) {
          return;
        }
        deleteUnlockedFolderPassword(target);
        await loadFolderTreeState();
        if (isSameOrChildFolderPath(target, activeFolderPath)) {
          renderFiles([]);
        } else {
          renderFiles(activeSourceFiles);
        }
        showStatus('Folder locked again: ' + target, 'ok');
      }

      async function handleFolderContextAction(action, path) {
        if (!action || !path) {
          return;
        }
        if (action === 'lock') {
          if (!(await ensureFolderUnlocked(path))) {
            return;
          }
          const password = await askLockPassword({
            title: 'LockFolder',
            description: 'Set Folder"' + path + '"Setlock passwordLock A password is required to access it after locking',
            placeholder: 'Please enternew lock password',
            errorMessage: 'LockFailed，Please try againPassword',
            statusErrorMessage: 'LockFailed: wrong password or verification failed'
          });
          if (password === null) {
            return;
          }
          await fetchJson(withFolderPassword(api.folderLock + '?path=' + encodeURIComponent(path) + '&password=' + encodeURIComponent(password), path), { method: 'POST' });
          setFolderNodeLockedState(path, true);
          setUnlockedFolderPassword(path, password);
          await loadFiles();
          showStatus('Folder Lock: ' + path, 'ok');
          return;
        }
        if (action === 'session-unlock') {
          const password = await askLockPassword({
            title: 'UnlockFolder',
            description: 'Please enterFolder"' + path + '" lock password.',
            onSubmit: async function (passwordText) {
              return fetchJson(api.folderLockVerify + '?path=' + encodeURIComponent(path) + '&password=' + encodeURIComponent(passwordText), { method: 'POST' });
            }
          });
          if (password === null) {
            return;
          }
          setUnlockedFolderPassword(path, password);
          activeFolderPath = path;
          ensureFolderPathExpanded(activeFolderPath);
          await loadFiles();
          showStatus('Folder Unlock（current session）: ' + path, 'ok');
          return;
        }
        if (action === 'session-lock') {
          await relockFolderInSession(path);
          return;
        }
        if (action === 'remove-lock') {
          const password = await askLockPassword({
            title: 'Remove LockFolder',
            description: 'Please enterFolder"' + path + '" lock password.The folder lock will be permanently removed after verification succeeds',
            errorMessage: 'wrong password or remove-lock failed，Please try again',
            statusErrorMessage: 'Remove LockFailed: wrong password or verification failed',
            onSubmit: async function (passwordText) {
              await fetchJson(api.folderUnlock + '?path=' + encodeURIComponent(path) + '&password=' + encodeURIComponent(passwordText), { method: 'POST' });
            }
          });
          if (password === null) {
            return;
          }
          deleteUnlockedFolderPassword(path);
          await loadFiles();
          showStatus('Folder Remove Lock: ' + path, 'ok');
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

      async function handleFileContextAction(action, path, local) {
        if (!action || !path) {
          return;
        }
        const fileLabel = local ? path : path;
        if (action === 'lock') {
          const password = await askLockPassword({
            title: 'LockFile',
            description: 'Set File"' + fileLabel + '"Setlock password',
            placeholder: 'Please enternew lock password',
            errorMessage: 'LockFailed，Please try againPassword',
            statusErrorMessage: 'LockFailed: wrong password or verification failed'
          });
          if (password === null) {
            return;
          }
          const url = api.fileLock
            + (local
              ? ('?local=1&path=' + encodeURIComponent(path))
              : ('?file=' + encodeURIComponent(path)))
            + '&password=' + encodeURIComponent(password);
          await fetchJson(url, { method: 'POST' });
          deleteUnlockedFilePassword(path, local);
          setFileLockedState(path, local, true);
          if (activeFilterTagId) {
            renderFiles(activeSourceFiles);
          } else if (local) {
            renderLocalDiskItems(activeLocalDiskItems);
          } else {
            renderFiles(activeSourceFiles);
          }
          showStatus('File Lock: ' + fileLabel, 'ok');
          return;
        }
        if (action === 'session-unlock') {
          const password = await askLockPassword({
            title: 'UnlockFile',
            description: 'Please enterFile"' + fileLabel + '" lock password.',
            onSubmit: async function (passwordText) {
              const url = api.fileLockVerify
                + (local
                  ? ('?local=1&path=' + encodeURIComponent(path))
                  : ('?file=' + encodeURIComponent(path)))
                + '&password=' + encodeURIComponent(passwordText);
              await fetchJson(url, { method: 'POST' });
            }
          });
          if (password === null) {
            return;
          }
          setUnlockedFilePassword(path, local, password);
          if (activeFilterTagId) {
            renderFiles(activeSourceFiles);
          } else if (local) {
            renderLocalDiskItems(activeLocalDiskItems);
          } else {
            renderFiles(activeSourceFiles);
          }
          showStatus('File Unlock（current session）: ' + fileLabel, 'ok');
          return;
        }
        if (action === 'session-lock') {
          deleteUnlockedFilePassword(path, local);
          if (activeFilterTagId) {
            renderFiles(activeSourceFiles);
          } else if (local) {
            renderLocalDiskItems(activeLocalDiskItems);
          } else {
            renderFiles(activeSourceFiles);
          }
          showStatus('File locked again: ' + fileLabel, 'ok');
          return;
        }
        if (action === 'remove-lock') {
          const password = await askLockPassword({
            title: 'Remove LockFile',
            description: 'Please enterFile"' + fileLabel + '" lock password.SucceededFilelock',
            errorMessage: 'wrong password or remove-lock failed，Please try again',
            statusErrorMessage: 'Remove LockFailed: wrong password or verification failed',
            onSubmit: async function (passwordText) {
              const url = api.fileUnlock
                + (local
                  ? ('?local=1&path=' + encodeURIComponent(path))
                  : ('?file=' + encodeURIComponent(path)))
                + '&password=' + encodeURIComponent(passwordText);
              await fetchJson(url, { method: 'POST' });
            }
          });
          if (password === null) {
            return;
          }
          deleteUnlockedFilePassword(path, local);
          setFileLockedState(path, local, false);
          if (activeFilterTagId) {
            renderFiles(activeSourceFiles);
          } else if (local) {
            renderLocalDiskItems(activeLocalDiskItems);
          } else {
            renderFiles(activeSourceFiles);
          }
          showStatus('File Remove Lock: ' + fileLabel, 'ok');
          return;
        }
        if (action === 'open-local-player') {
          let url = api.localDiskOpenFile + '?path=' + encodeURIComponent(path);
          url = appendFilePassword(url, path, true);
          url = appendLocalDirPassword(url, localDiskParentPath(path));
          await fetchJson(url, { method: 'POST' });
          showStatus(' Opened local player: ' + fileLabel, 'ok');
          return;
        }
        if (action === 'choose-local-player') {
          let url = api.localDiskOpenFile + '?chooser=1&path=' + encodeURIComponent(path);
          url = appendFilePassword(url, path, true);
          url = appendLocalDirPassword(url, localDiskParentPath(path));
          await fetchJson(url, { method: 'POST' });
          showStatus(' Opened local player chooser: ' + fileLabel, 'ok');
        }
      }

      async function handleLocalDirContextAction(action, path) {
        const dirPath = String(path || '');
        if (!action || !dirPath) {
          return;
        }
        if (action === 'lock') {
          const password = await askLockPassword({
            title: 'LockLocalFolder',
            description: 'Set LocalFolder"' + dirPath + '"Setlock passwordLock A password is required to access it after locking',
            placeholder: 'Please enternew lock password',
            errorMessage: 'LockFailed，Please try againPassword',
            statusErrorMessage: 'LockFailed: wrong password or verification failed'
          });
          if (password === null) {
            return;
          }
          await fetchJson(api.fileLock + '?local=1&dir=1&path=' + encodeURIComponent(dirPath) + '&password=' + encodeURIComponent(password), { method: 'POST' });
          deleteUnlockedLocalDirPassword(dirPath);
          setLocalDiskDirLockedState(dirPath, true);
          invalidateLocalDiskDirLockCache(dirPath);
          const nextPath = localDiskPathContains(dirPath, activeLocalDiskPath)
            ? localDiskParentPath(dirPath)
            : (activeLocalDiskPath || '');
          await loadLocalDisk(nextPath, { resetTreeRoot: !localDiskPathContains(activeLocalDiskTreeRootPath, nextPath) });
          showStatus('LocalFolder Lock: ' + dirPath, 'ok');
          return;
        }
        if (action === 'session-unlock') {
          const password = await askLockPassword({
            title: 'UnlockLocalFolder',
            description: 'Please enterLocalFolder"' + dirPath + '" lock password.',
            onSubmit: async function (passwordText) {
              await fetchJson(api.fileLockVerify + '?local=1&dir=1&path=' + encodeURIComponent(dirPath) + '&password=' + encodeURIComponent(passwordText), { method: 'POST' });
            }
          });
          if (password === null) {
            return;
          }
          setUnlockedLocalDirPassword(dirPath, password);
          await loadLocalDisk(dirPath, { resetTreeRoot: !localDiskPathContains(activeLocalDiskTreeRootPath, dirPath) });
          showStatus('LocalFolder Unlock（current session）: ' + dirPath, 'ok');
          return;
        }
        if (action === 'session-lock') {
          deleteUnlockedLocalDirPassword(dirPath);
          if (localDiskPathContains(dirPath, activeLocalDiskPath)) {
            await loadLocalDisk(localDiskParentPath(dirPath), { resetTreeRoot: !localDiskPathContains(activeLocalDiskTreeRootPath, localDiskParentPath(dirPath)) });
          } else {
            renderLocalDiskItems(activeLocalDiskItems);
          }
          showStatus('LocalFolder locked again: ' + dirPath, 'ok');
          return;
        }
        if (action === 'remove-lock') {
          const password = await askLockPassword({
            title: 'Remove LockLocalFolder',
            description: 'Please enterLocalFolder"' + dirPath + '" lock password.The folder lock will be permanently removed after verification succeeds',
            errorMessage: 'wrong password or remove-lock failed，Please try again',
            statusErrorMessage: 'Remove LockFailed: wrong password or verification failed',
            onSubmit: async function (passwordText) {
              await fetchJson(api.fileUnlock + '?local=1&dir=1&path=' + encodeURIComponent(dirPath) + '&password=' + encodeURIComponent(passwordText), { method: 'POST' });
            }
          });
          if (password === null) {
            return;
          }
          deleteUnlockedLocalDirPassword(dirPath);
          setLocalDiskDirLockedState(dirPath, false);
          await loadLocalDisk(activeLocalDiskPath || '', { resetTreeRoot: false });
          showStatus('LocalFolder Remove Lock: ' + dirPath, 'ok');
        }
      }

      async function ensureLocalDirUnlocked(path) {
        const dirPath = String(path || '');
        if (!dirPath) {
          return true;
        }
        if (getLocalDirPassword(dirPath)) {
          return true;
        }
        const password = await askLockPassword({
          title: 'UnlockLocalFolder',
          description: 'Please enterLocalFolder"' + dirPath + '" lock password.',
          onSubmit: async function (passwordText) {
            await fetchJson(api.fileLockVerify + '?local=1&dir=1&path=' + encodeURIComponent(dirPath) + '&password=' + encodeURIComponent(passwordText), { method: 'POST' });
          }
        });
        if (password === null) {
          return false;
        }
        setUnlockedLocalDirPassword(dirPath, password);
        return true;
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

      function getVisibleFolderPathsInOrder() {
        const result = [''];
        function walk(nodes) {
          (Array.isArray(nodes) ? nodes : []).forEach(function (node) {
            const path = String((node && node.path) || '');
            if (!path) {
              return;
            }
            result.push(path);
            if (expandedFolderPaths.has(path)) {
              walk(node.children);
            }
          });
        }
        walk(getRootFolderTreeNodesForRender());
        return result;
      }

      function clearSelectedFolders() {
        selectedFolderPaths.clear();
        lastSelectedFolderPath = '';
      }

      function selectFolderPath(path, shiftKey) {
        const target = String(path || '');
        if (!target || isRecycleRootFolderPath(target)) {
          clearSelectedFolders();
          return;
        }
        const targetInRecycle = isRecycleFolderPath(target);
        if (shiftKey && lastSelectedFolderPath) {
          const visiblePaths = getVisibleFolderPathsInOrder().filter(function (item) {
            if (!item || isRecycleRootFolderPath(item)) {
              return false;
            }
            return targetInRecycle ? isRecycleFolderPath(item) : !isRecycleFolderPath(item);
          });
          const start = visiblePaths.indexOf(lastSelectedFolderPath);
          const end = visiblePaths.indexOf(target);
          selectedFolderPaths.clear();
          if (start >= 0 && end >= 0) {
            const min = Math.min(start, end);
            const max = Math.max(start, end);
            for (let i = min; i <= max; i += 1) {
              selectedFolderPaths.add(visiblePaths[i]);
            }
          } else {
            selectedFolderPaths.add(target);
          }
        } else {
          selectedFolderPaths.clear();
          selectedFolderPaths.add(target);
          lastSelectedFolderPath = target;
        }
      }

      function getFolderDragPaths(sourcePath) {
        const source = String(sourcePath || '');
        if (source && selectedFolderPaths.has(source)) {
          return Array.from(selectedFolderPaths);
        }
        return source ? [source] : [];
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

      async function moveFoldersToRecycle(folderPaths) {
        const selected = normalizeFolderMoveSources(folderPaths).filter(function (path) {
          return path && !isRecycleFolderPath(path);
        });
        if (!selected.length) {
          return { movedCount: 0, ignoredCount: Array.isArray(folderPaths) ? folderPaths.length : 0 };
        }

        const rawSelectedCount = Array.isArray(folderPaths) ? folderPaths.length : 0;
        const ignoredCount = rawSelectedCount > selected.length ? (rawSelectedCount - selected.length) : 0;
        const confirmed = await askConfirmDialog({
          title: 'Move to Trash',
          description: 'Move ' + selected.length + ' selected folders and all their contents to Trash?',
          confirmText: 'Move to Trash',
          danger: true
        });
        if (!confirmed) {
          return { movedCount: 0, ignoredCount: ignoredCount, cancelled: true };
        }

        let movedCount = 0;
        for (let i = 0; i < selected.length; i += 1) {
          const sourcePath = selected[i];
          await fetchJson(withFolderPassword(api.folderDelete + '?path=' + encodeURIComponent(sourcePath), sourcePath), { method: 'POST' });
          if (isSameOrChildFolderPath(sourcePath, activeFolderPath)) {
            activeFolderPath = RECYCLE_FOLDER_NAME;
          }
          movedCount += 1;
        }

        ensureFolderPathExpanded(RECYCLE_FOLDER_NAME);
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
        sidebarToggleBtn.setAttribute('aria-label', isCollapsed ? 'Expandsidebar' : 'Collapsesidebar');
        sidebarToggleBtn.setAttribute('title', isCollapsed ? 'Expandsidebar' : 'Collapsesidebar');
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
        } else if (panelId === 'panel-admin') {
          loadAdminStoragePath();
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
            cleanup(false, 'Metadata load timed out');
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
            cleanup(false, 'Browser does not support this video codec or container');
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
          let reason = probe.reason || 'Unable to parse video';

          if (audioProbe && audioProbe.ok && audioProbe.has_audio && audioProbe.browser_audio_supported === false) {
            needConvert = true;
            reason = 'Audio codec ' + (audioProbe.audio_codec || 'unknown') + ' Browser';
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

      function closeFileTagMenu() {
        if (activeFileTagMenu && activeFileTagMenu.parentNode) {
          activeFileTagMenu.parentNode.removeChild(activeFileTagMenu);
        }
        activeFileTagMenu = null;
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
        const data = await fetchJson(appendTagPassword(api.tagFiles + '?tag_id=' + encodeURIComponent(tagId), tagId));
        return (Array.isArray(data.files) ? data.files : []).filter(function (file) {
          return isAudioName(file && file.name);
        });
      }

      function openAudioTagContextMenu(tagId, tagName, clientX, clientY, lockInfo) {
        closeAudioTagContextMenu();

        const menu = document.createElement('div');
        menu.className = 'tag-context-menu file-context-menu';
        let html =
          '<button type="button" class="tag-context-item" data-audio-tag-action="random" data-tag-id="' + escapeHtml(tagId) + '">' + AUDIO_PLAY_MODE_LABELS.random + '</button>' +
          '<button type="button" class="tag-context-item" data-audio-tag-action="sequential" data-tag-id="' + escapeHtml(tagId) + '">' + AUDIO_PLAY_MODE_LABELS.sequential + '</button>' +
          '<button type="button" class="tag-context-item" data-audio-tag-action="loop" data-tag-id="' + escapeHtml(tagId) + '">' + AUDIO_PLAY_MODE_LABELS.loop + '</button>';
        if (lockInfo) {
          html += '<hr class="tag-context-sep">';
          if (lockInfo.locked) {
            const unlocked = !!getTagPassword(tagId);
            html += '<button type="button" class="folder-context-item" data-tag-lock-action="' + (unlocked ? 'session-lock' : 'session-unlock') + '">' + (unlocked ? 'Lock' : 'Unlock') + '</button>';
            html += '<button type="button" class="folder-context-item" data-tag-lock-action="remove-lock">Remove Lock</button>';
          } else {
            html += '<button type="button" class="folder-context-item" data-tag-lock-action="lock">Lock</button>';
          }
          menu.setAttribute('data-tag-lock-id', tagId);
          activeFileContextMenu = menu;
        }
        menu.innerHTML = html;
        menu.setAttribute('data-tag-id', tagId);
        menu.setAttribute('data-tag-name', tagName || '');
        menu.style.left = Math.round(clientX) + 'px';
        menu.style.top = Math.round(clientY) + 'px';
        document.body.appendChild(menu);
        clampFloatingMenuPosition(menu, clientX, clientY);
        activeAudioTagContextMenu = menu;
      }

      function openTagLockContextMenu(tagId, locked, clientX, clientY) {
        closeFileContextMenu();
        closeFolderContextMenu();
        closeAudioTagContextMenu();

        const id = String(tagId || '');
        if (!id) {
          return;
        }

        const menu = document.createElement('div');
        menu.className = 'folder-context-menu file-context-menu';
        menu.setAttribute('data-tag-lock-id', id);
        let html = '';
        if (locked) {
          const unlocked = !!getTagPassword(id);
          html += '<button type="button" class="folder-context-item" data-tag-lock-action="' + (unlocked ? 'session-lock' : 'session-unlock') + '">' + (unlocked ? 'Lock' : 'Unlock') + '</button>';
          html += '<button type="button" class="folder-context-item" data-tag-lock-action="remove-lock">Remove Lock</button>';
        } else {
          html += '<button type="button" class="folder-context-item" data-tag-lock-action="lock">Lock</button>';
        }
        menu.innerHTML = html;
        document.body.appendChild(menu);
        menu.style.left = Math.round(clientX) + 'px';
        menu.style.top = Math.round(clientY) + 'px';
        clampFloatingMenuPosition(menu, clientX, clientY);
        activeFileContextMenu = menu;
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
          const label = AUDIO_PLAY_MODE_LABELS[modeKey] || 'Playback Mode';
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
          throw new Error('No playable audio files under this tag');
        }

        const win = document.createElement('div');
        win.className = 'floating-preview audio-playlist-preview';
        previewZ += 1;
        win.style.zIndex = String(previewZ);

        win.innerHTML =
          '<div class="preview-head">' +
            '<div class="preview-title">' + escapeHtml((AUDIO_PLAY_MODE_LABELS[mode] || 'Audio Playback') + ': ' + (tagName || 'Audio Tag')) + '</div>' +
            '<div class="preview-head-actions">' +
              '<button class="preview-window-btn" type="button" data-window-action="minimize" title="Minimize" aria-label="Minimize">−</button>' +
              '<button class="preview-window-btn" type="button" data-window-action="maximize" title="Maximize" aria-label="Maximize">□</button>' +
              '<button class="preview-close" type="button" title="Close" aria-label="Close">×</button>' +
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
                '<div class="audio-playlist-summary">Total <span class="audio-playlist-count"></span> audio files</div>' +
                '<button type="button" class="audio-playlist-toggle-btn" title="CollapseRemote Disk" aria-label="CollapseRemote Disk">▾</button>' +
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
            maximizeBtn.title = restoreMode ? 'Restore Window' : 'Maximize';
            maximizeBtn.setAttribute('aria-label', restoreMode ? 'Restore Window' : 'Maximize');
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
            titleEl.textContent = (AUDIO_PLAY_MODE_LABELS[currentMode] || 'Audio Playback') + ': ' + (tagName || 'Audio Tag');
          }
        }

        function syncPlaylistPanelUI() {
          if (playlistPanelEl) {
            playlistPanelEl.classList.toggle('is-collapsed', isPlaylistCollapsed);
          }
          if (playlistToggleBtn) {
            playlistToggleBtn.textContent = isPlaylistCollapsed ? '▸' : '▾';
            playlistToggleBtn.title = isPlaylistCollapsed ? 'ExpandRemote Disk' : 'CollapseRemote Disk';
            playlistToggleBtn.setAttribute('aria-label', isPlaylistCollapsed ? 'ExpandRemote Disk' : 'CollapseRemote Disk');
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
          const isLocal = !!current.local;
          audioEl.src = (isLocal ? localDiskDownloadUrl(fileName) : downloadUrlForFile(fileName, true)) + '&v=' + Date.now();
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
          throw new Error('No audio files under this tag');
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
        tagDialogTitle.textContent = String(opts.title || 'CreateTag');
        tagDialogDesc.textContent = String(opts.description || 'Please enterTagName');
        if (tagDialogLabel) {
          tagDialogLabel.textContent = String(opts.label || 'TagName');
        }
        tagDialogInput.value = String(opts.initialValue || '');
        tagDialogInput.placeholder = String(opts.placeholder || 'Please enterTagName');
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

      function setLockDialogError(message) {
        if (!lockDialogError) {
          return;
        }
        const text = String(message || '');
        lockDialogError.textContent = text;
        lockDialogError.hidden = !text;
      }

      function closeLockDialog(value) {
        if (!lockDialog) {
          return;
        }
        lockDialog.hidden = true;
        document.body.style.overflow = '';
        setLockDialogError('');
        const state = activeLockDialogState;
        activeLockDialogState = null;
        if (state && state.resolve) {
          state.resolve(value);
        }
      }

      function askLockPassword(options) {
        if (!lockDialog || !lockDialogTitle || !lockDialogDesc || !lockDialogInput) {
          return Promise.resolve(null);
        }
        if (activeLockDialogState) {
          closeLockDialog(null);
        }

        const opts = options || {};
        lockDialogTitle.textContent = String(opts.title || 'UnlockFolder');
        lockDialogDesc.textContent = String(opts.description || 'Please enterFolderlock password');
        lockDialogInput.value = '';
        lockDialogInput.placeholder = String(opts.placeholder || 'Please enterlock password');
        setLockDialogError('');
        lockDialog.hidden = false;
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(function () {
          lockDialogInput.focus();
          lockDialogInput.select();
        });

        return new Promise(function (resolve) {
          activeLockDialogState = {
            resolve: resolve,
            onSubmit: typeof opts.onSubmit === 'function' ? opts.onSubmit : null,
            errorMessage: String(opts.errorMessage || 'wrong password or verification failed，Please try again'),
            statusErrorMessage: String(opts.statusErrorMessage || 'UnlockFailed: wrong password or verification failed')
          };
        });
      }

      function closeConfirmDialog(value) {
        if (!confirmDialog) {
          return;
        }
        confirmDialog.hidden = true;
        document.body.style.overflow = '';
        const resolver = activeConfirmDialogResolver;
        activeConfirmDialogResolver = null;
        if (resolver) {
          resolver(!!value);
        }
      }

      function askConfirmDialog(options) {
        if (!confirmDialog || !confirmDialogTitle || !confirmDialogDesc) {
          return Promise.resolve(false);
        }
        if (activeConfirmDialogResolver) {
          closeConfirmDialog(false);
        }
        const opts = options || {};
        confirmDialogTitle.textContent = String(opts.title || 'Confirm Action');
        confirmDialogDesc.textContent = String(opts.description || 'Please Confirmwhether to continue');
        if (confirmDialogCancelBtn) {
          confirmDialogCancelBtn.textContent = String(opts.cancelText || 'Cancel');
        }
        if (confirmDialogConfirmBtn) {
          confirmDialogConfirmBtn.textContent = String(opts.confirmText || 'Confirm');
          confirmDialogConfirmBtn.classList.toggle('danger', opts.danger !== false);
        }
        confirmDialog.hidden = false;
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(function () {
          if (confirmDialogConfirmBtn) {
            confirmDialogConfirmBtn.focus();
          }
        });
        return new Promise(function (resolve) {
          activeConfirmDialogResolver = resolve;
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
          locked: !!node.locked,
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
          ? '<span class="tag-limit-badge ' + restrictedRootType + '">' + (restrictedRootType === 'video' ? 'Video only' : (restrictedRootType === 'audio' ? 'Audio only' : 'Images only')) + '</span>'
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
        const canLockTag = canDeleteTag;
        const isRenaming = activeTagRenameId === node.id && canRenameTagNode(node, safeLevel);
        const tagNameHtml = isRenaming
          ? '<input class="tag-rename-input" data-tag-rename-input="' + escapeHtml(node.id) + '" value="' + escapeHtml(node.name) + '" maxlength="60">'
          : '<span class="tag-node-name" data-tag-id="' + node.id + '">' + escapeHtml(displayTagName(node.name)) + '</span>';
        const tagUnlocked = !!getTagPassword(node.id);
        const tagLockHtml = (canLockTag && node.locked)
          ? '<span class="folder-lock-icon file-lock-inline tag-lock-inline' + (tagUnlocked ? ' unlocked' : '') + '" data-tag-lock-toggle="' + escapeHtml(node.id) + '" title="' + (tagUnlocked ? 'Click to lock again' : 'Click to unlock') + '" aria-label="' + (tagUnlocked ? 'Click to lock again' : 'Click to unlock') + '"><span class="folder-lock-shackle"></span><span class="folder-lock-body"></span></span>'
          : '';
        const actionHtml =
          '<div class="tag-actions">' +
            (canExpand
              ? '<button type="button" class="tag-inline-btn" data-tag-create="' + node.id + '" data-tag-level="' + safeLevel + '" title="Add Subtag">+</button>'
              : '') +
            (canDeleteTag
              ? '<button type="button" class="tag-inline-btn danger" data-tag-delete="' + node.id + '" title="DeleteTag">-</button>'
              : '') +
          '</div>';

        return (
          '<div class="' + nodeClass + '" data-tag-id="' + node.id + '" data-tag-locked="' + (node.locked ? '1' : '0') + '" data-tag-lockable="' + (canLockTag ? '1' : '0') + '">' +
            '<div class="tag-line">' +
              '<div class="tag-line-main" style="padding-left:' + indent + 'px;">' +
                toggleBtn +
                '<span class="tag-node-name-wrap" style="' + nameInlineStyle + '">' +
                  tagNameHtml +
                  restrictedBadgeHtml +
                  tagLockHtml +
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
        filesTagToggleBtn.setAttribute('title', 'Add Top-Level Tag');
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

      function canBindFilesToTagOnClient(tagId, fileNames) {
        const names = Array.isArray(fileNames) ? fileNames : [];
        for (let i = 0; i < names.length; i += 1) {
          const check = canBindFileToTagOnClient(tagId, names[i]);
          if (!check.ok) {
            return check;
          }
        }
        return { ok: true, message: '' };
      }

      function buildQuickTagTreeHtml(nodes, fileNames, level) {
        const list = Array.isArray(nodes) ? nodes : [];
        const names = Array.isArray(fileNames) ? fileNames : [];
        const safeLevel = Math.max(1, Math.min(TAG_MAX_LEVEL, level || 1));
        return list.map(function (node) {
          const tagId = String((node && node.id) || '');
          const name = String((node && node.name) || '');
          const check = canBindFilesToTagOnClient(tagId, names);
          const children = Array.isArray(node && node.children) ? node.children : [];
          const childHtml = children.length
            ? '<div class="quick-tag-children">' + buildQuickTagTreeHtml(children, names, safeLevel + 1) + '</div>'
            : '';
          return (
            '<div class="quick-tag-node">' +
              '<button type="button" class="quick-tag-item' + (check.ok ? '' : ' disabled') + '" data-quick-tag-id="' + escapeHtml(tagId) + '"' + (check.ok ? '' : ' disabled title="' + escapeHtml(check.message) + '"') + ' style="padding-left:' + (8 + ((safeLevel - 1) * 14)) + 'px;">' +
                '<span class="quick-tag-mark">#</span>' +
                '<span class="quick-tag-name">' + escapeHtml(displayTagName(name)) + '</span>' +
              '</button>' +
              childHtml +
            '</div>'
          );
        }).join('');
      }

      async function openFileTagMenu(button, fileName) {
        return openFilesTagMenu(button, [fileName], {});
      }

      async function openFilesTagMenu(button, fileNames, options) {
        closeFileTagMenu();
        const opts = options || {};
        const targetFiles = (Array.isArray(fileNames) ? fileNames : [])
          .map(function (name) { return String(name || ''); })
          .filter(Boolean);
        if (!button || !targetFiles.length) {
          return;
        }
        if (!tagTree.length) {
          await loadTagTreeState();
        }
        const menu = document.createElement('div');
        menu.className = 'quick-tag-menu';
        menu.setAttribute('data-quick-tag-files', targetFiles.join('\n'));
        menu.setAttribute('data-quick-tag-local', opts.local ? '1' : '0');
        menu.innerHTML = tagTree.length
          ? '<div class="quick-tag-title">' + (targetFiles.length > 1 ? ('Add tags to ' + targetFiles.length + ' files') : 'Add Tag') + '</div>' + buildQuickTagTreeHtml(tagTree, targetFiles, 1)
          : '<div class="quick-tag-empty">No tags</div>';
        document.body.appendChild(menu);
        const rect = button.getBoundingClientRect();
        menu.style.left = Math.round(rect.left) + 'px';
        menu.style.top = Math.round(rect.bottom + 6) + 'px';
        clampFloatingMenuPosition(menu, rect.left, rect.bottom + 6);
        activeFileTagMenu = menu;
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
          showStatus('Tagname cannot be empty', 'err');
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
          showStatus('Tag Rename: ' + nextName, 'ok');
        } catch (err) {
          showStatus('Tagrename failed: ' + err.message, 'err');
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
        if (rootName === '\u89c6\u9891') {
          return 'video';
        }
        if (rootName === '\u97f3\u9891') {
          return 'audio';
        }
        if (rootName === '\u56fe\u7247') {
          return 'image';
        }
        return '';
      }

      function getTagRootName(tagId) {
        const rootMeta = getTagRootMeta(tagId);
        if (!rootMeta || !rootMeta.node) {
          return '';
        }
        return String(rootMeta.node.name || '').trim();
      }

      function getRestrictedRootTagType(node, level) {
        if ((level || 1) !== 1 || !node || !node.id) {
          return '';
        }
        return getTagFileTypeConstraint(node.id);
      }

      function isActiveTagImageType() {
        return !!(activeFilterTagId && getTagFileTypeConstraint(activeFilterTagId) === 'image');
      }

      function isTagPreviewEnabled(tagId) {
        const id = String(tagId || '');
        if (!id) {
          return false;
        }
        const meta = findTagMetaById(id);
        if (!meta || !meta.node) {
          return false;
        }
        const rootName = getTagRootName(id);
        // Image tags and subtags can preview; badge subtags can preview, excluding badge root.
        if (rootName === '\u56fe\u7247') {
          return true;
        }
        if (rootName === '\u6807\u724c' && Number(meta.level || 1) > 1) {
          return true;
        }
        return false;
      }

      function isActiveTagPreviewEnabled() {
        return isTagPreviewEnabled(activeFilterTagId);
      }

      function isProtectedRestrictedRootTag(node, level) {
        return !!getRestrictedRootTagType(node, level);
      }

      function canRenameTagNode(node, level) {
        return !!(node && node.id) && !isProtectedRestrictedRootTag(node, level);
      }

      function canLockTagNode(node, level) {
        return !!(node && node.id) && !isProtectedRestrictedRootTag(node, level);
      }

      async function ensureTagUnlocked(tagId) {
        const id = String(tagId || '');
        if (!id) {
          return false;
        }
        const meta = findTagMetaById(id);
        if (!meta || !meta.node) {
          showStatus('Tag does not exist or may have been deleted', 'err');
          return false;
        }
        if (!meta.node.locked || getTagPassword(id)) {
          return true;
        }
        return await handleTagLockAction('session-unlock', id, { silentSuccess: true });
      }

      async function handleTagLockAction(action, tagId, options) {
        const id = String(tagId || '');
        const opts = options || {};
        if (!action || !id) {
          return false;
        }

        const meta = findTagMetaById(id);
        if (!meta || !meta.node) {
          showStatus('Tag does not exist or may have been deleted', 'err');
          return false;
        }
        if (!canLockTagNode(meta.node, meta.level)) {
          showStatus('Reserved tags cannot be locked', 'err');
          return false;
        }

        const label = String(meta.node.name || id);
        if (action === 'lock') {
          const password = await askLockPassword({
            title: 'LockTag',
            description: 'Set Tag"' + label + '"Setlock passwordLock A password is required to view files under this tag after locking',
            placeholder: 'Please enternew lock password',
            errorMessage: 'LockFailed，Please try againPassword',
            statusErrorMessage: 'LockFailed: wrong password or verification failed'
          });
          if (password === null) {
            return false;
          }
          await fetchJson(api.tagLock + '?id=' + encodeURIComponent(id) + '&password=' + encodeURIComponent(password), { method: 'POST' });
          deleteUnlockedTagPassword(id);
          await loadTagTreeState();
          if (activeFilterTagId === id) {
            renderFiles([]);
          }
          renderTagTree();
          showStatus('Tag Lock: ' + label, 'ok');
          return true;
        }

        if (action === 'session-unlock') {
          const password = await askLockPassword({
            title: 'UnlockTag',
            description: 'Please enterTag"' + label + '" lock password.',
            onSubmit: async function (passwordText) {
              await fetchJson(api.tagLockVerify + '?id=' + encodeURIComponent(id) + '&password=' + encodeURIComponent(passwordText), { method: 'POST' });
            }
          });
          if (password === null) {
            return false;
          }
          setUnlockedTagPassword(id, password);
          await loadTagTreeState();
          renderTagTree();
          if (activeFilterTagId === id) {
            await showFilesForTag(id);
          }
          if (!opts.silentSuccess) {
            showStatus('Tag Unlock（current session）: ' + label, 'ok');
          }
          return true;
        }

        if (action === 'session-lock') {
          deleteUnlockedTagPassword(id);
          if (activeFilterTagId === id) {
            renderFiles([]);
          }
          renderTagTree();
          showStatus('Tag locked again: ' + label, 'ok');
          return true;
        }

        if (action === 'remove-lock') {
          const password = await askLockPassword({
            title: 'Remove LockTag',
            description: 'Please enterTag"' + label + '" lock password.The tag lock will be permanently removed after verification succeeds',
            errorMessage: 'wrong password or remove-lock failed，Please try again',
            statusErrorMessage: 'Remove LockFailed: wrong password or verification failed',
            onSubmit: async function (passwordText) {
              await fetchJson(api.tagUnlock + '?id=' + encodeURIComponent(id) + '&password=' + encodeURIComponent(passwordText), { method: 'POST' });
            }
          });
          if (password === null) {
            return false;
          }
          deleteUnlockedTagPassword(id);
          await loadTagTreeState();
          if (activeFilterTagId === id) {
            await showFilesForTag(id);
          } else {
            renderTagTree();
          }
          showStatus('Tag Remove Lock: ' + label, 'ok');
          return true;
        }

        return false;
      }

      function canBindFileToTagOnClient(tagId, fileName) {
        const constraint = getTagFileTypeConstraint(tagId);
        if (!constraint) {
          return { ok: true, message: '' };
        }
        if (constraint === 'video' && !isVideoName(fileName)) {
          return { ok: false, message: 'Video tags and subtags can only reference video files (mp4/avi/mkv/rmvb)' };
        }
        if (constraint === 'audio' && !isAudioName(fileName)) {
          return { ok: false, message: 'Audio tags and subtags can only reference audio files (mp3/m4a/aac/wav/ogg/flac)' };
        }
        if (constraint === 'image' && !isImageName(fileName)) {
          return { ok: false, message: 'Image tags and subtags can only reference image files (png/jpg/jpeg/gif)' };
        }
        return { ok: true, message: '' };
      }

      async function addTagNode(parentTagId, name) {
        const cleanName = String(name || '').trim();
        if (!cleanName) {
          return { ok: false, message: 'Tagname cannot be empty' };
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
          throw new Error(createResult.message || 'CreateTagFailed');
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

      async function bindFileToTag(tagId, fileName, options) {
        const cleanName = String(fileName || '');
        if (!cleanName) {
          return { ok: false, message: 'Please Choosefiles to reference' };
        }
        const opts = options || {};

        try {
          await fetchJson(
            api.tagBind + '?tag_id=' + encodeURIComponent(tagId) + '&file=' + encodeURIComponent(cleanName)
              + (opts.local ? '&local=1' : ''),
            { method: 'POST' }
          );
          return { ok: true };
        } catch (err) {
          return { ok: false, message: err.message };
        }
      }

      async function unbindFileFromTag(tagId, fileName, options) {
        const opts = options || {};
        try {
          await fetchJson(
            api.tagUnbind + '?tag_id=' + encodeURIComponent(tagId) + '&file=' + encodeURIComponent(fileName)
              + (opts.local ? '&local=1' : ''),
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
          '<div>The following videos are recommended for transcoding. They will start only after you confirm: </div>' +
          '<div class="transcode-list">' +
          list.map(function (item) {
            const name = String(item.name || '');
            const reason = String(item.reason || 'Insufficient browser compatibility');
            const encoded = encodeURIComponent(name);
            return (
              '<div class="transcode-item" data-transcode-item="' + encoded + '">' +
                '<div class="transcode-item-head">' +
                  '<div>' +
                    '<div class="transcode-item-name">' + escapeHtml(name) + '</div>' +
                    '<div class="transcode-item-reason">Reason: ' + escapeHtml(reason) + '</div>' +
                  '</div>' +
                  '<div class="transcode-actions">' +
                    '<button type="button" class="transcode-btn" data-transcode-file="' + encoded + '">Confirm Transcode</button>' +
                    '<button type="button" class="transcode-cancel-btn" data-cancel-file="' + encoded + '" disabled>Cancel Transcode</button>' +
                    '<button type="button" class="transcode-confirm-btn" data-confirm-transcode="' + encoded + '" hidden>Confirm</button>' +
                    '<div class="transcode-progress"><div class="transcode-progress-fill" data-progress-fill="' + encoded + '"></div></div>' +
                    '<span class="transcode-progress-text" data-progress-text="' + encoded + '">WaitingConfirm</span>' +
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
        const confirmBtn = statusBox.querySelector('[data-confirm-transcode="' + encodedName + '"]');
        if (startBtn && typeof opts.startDisabled === 'boolean') {
          startBtn.disabled = opts.startDisabled;
        }
        if (cancelBtn && typeof opts.cancelDisabled === 'boolean') {
          cancelBtn.disabled = opts.cancelDisabled;
        }
        if (confirmBtn && typeof opts.confirmVisible === 'boolean') {
          confirmBtn.hidden = !opts.confirmVisible;
        }
      }

      function dismissTranscodeItem(encodedName) {
        stopTranscodePolling(encodedName);
        const item = statusBox.querySelector('[data-transcode-item="' + encodedName + '"]');
        if (item && item.parentNode) {
          item.parentNode.removeChild(item);
        }
        if (!statusBox.querySelector('[data-transcode-item]')) {
          statusBox.className = 'status';
          statusBox.textContent = '';
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
            '<div>The following videos are recommended for transcoding. They will start only after you confirm: </div>' +
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
                '<button type="button" class="transcode-btn" data-transcode-file="' + encoded + '" disabled>Confirm Transcode</button>' +
                '<button type="button" class="transcode-cancel-btn" data-cancel-file="' + encoded + '">Cancel Transcode</button>' +
                '<button type="button" class="transcode-confirm-btn" data-confirm-transcode="' + encoded + '" hidden>Confirm</button>' +
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
          reason.textContent = 'Status: ' + String(item.message || 'BackendTranscoding');
        }

        setTranscodeTaskId(encoded, String(item.task_id || ''));
        setTranscodeButtons(encoded, { startDisabled: true, cancelDisabled: !!item.cancel_requested });
        setTranscodeVisualState(encoded, item.cancel_requested ? 'cancelled' : 'running');
        updateTranscodeProgress(encoded, Number(item.progress || 0), String(item.message || 'Transcoding'));
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
          updateTranscodeProgress(encodedName, progress, (data.message || 'Transcoding') + ' ' + Math.max(0, Math.min(100, Math.round(progress))) + '%');

          if (data.done) {
            stopTranscodePolling(encodedName);
            setTranscodeTaskId(encodedName, '');
            if (data.success) {
              setTranscodeVisualState(encodedName, 'done');
              updateTranscodeProgress(encodedName, 100, ' Done');
              setTranscodeReason(encodedName, 'Status:  Done，output file ' + String(data.name || decodeURIComponent(encodedName)));
              setTranscodeButtons(encodedName, { startDisabled: true, cancelDisabled: true, confirmVisible: true });
              await loadFiles();
            } else {
              const cancelled = data.cancel_requested || String(data.message || '').indexOf('Cancel') >= 0;
              setTranscodeVisualState(encodedName, cancelled ? 'cancelled' : 'failed');
              updateTranscodeProgress(encodedName, progress, cancelled ? ' Cancel' : 'Failed');
              setTranscodeReason(encodedName, cancelled
                ? 'Status:  Cancel'
                : 'Status: Failed，' + String(data.error || data.message || 'unknown error'));
              setTranscodeButtons(encodedName, { startDisabled: false, cancelDisabled: true });
            }
          }
        } catch (err) {
          stopTranscodePolling(encodedName);
          setTranscodeTaskId(encodedName, '');
          setTranscodeVisualState(encodedName, 'failed');
          updateTranscodeProgress(encodedName, 0, 'Failed to query progress');
          setTranscodeReason(encodedName, 'Status: Failed to query progress，' + err.message);
          setTranscodeButtons(encodedName, { startDisabled: false, cancelDisabled: true });
        }
      }

      async function cancelManualTranscode(encodedName) {
        const taskId = getTranscodeTaskId(encodedName);
        if (!taskId) {
          setTranscodeReason(encodedName, 'Status: Task id not found; cannot cancel');
          return;
        }

        try {
          setTranscodeButtons(encodedName, { cancelDisabled: true });
          await fetchJson(api.convertCancel + '?task_id=' + encodeURIComponent(taskId), {
            method: 'POST'
          });
          setTranscodeVisualState(encodedName, 'cancelled');
          updateTranscodeProgress(encodedName, 0, 'Cancelin progress');
          setTranscodeReason(encodedName, 'Status:  Cancellation request sent. Waiting for backend to stop');
        } catch (err) {
          setTranscodeVisualState(encodedName, 'failed');
          setTranscodeReason(encodedName, 'Status: CancelFailed，' + err.message);
          setTranscodeButtons(encodedName, { cancelDisabled: false });
        }
      }

      async function startManualTranscode(encodedName) {
        setTranscodeButtons(encodedName, { startDisabled: true, cancelDisabled: true });

        const fileName = decodeURIComponent(encodedName);
        try {
          setTranscodeVisualState(encodedName, 'running');
          updateTranscodeProgress(encodedName, 0, 'Creating task...');
          setTranscodeReason(encodedName, 'Status: Requesting backend to start transcoding');
          const data = await fetchJson(api.convertVideo + '?file=' + encodeURIComponent(fileName), {
            method: 'POST'
          });

          if (data.completed) {
            setTranscodeVisualState(encodedName, 'done');
            updateTranscodeProgress(encodedName, 100, 'No transcoding needed');
            setTranscodeReason(encodedName, 'Status: File can already be played directly');
            setTranscodeButtons(encodedName, { startDisabled: true, cancelDisabled: true, confirmVisible: true });
            return;
          }

          if (!data.task_id) {
            throw new Error('missing task id');
          }

          setTranscodeTaskId(encodedName, String(data.task_id));
          setTranscodeReason(encodedName, 'Status: Backend task started, task id ' + String(data.task_id));
          updateTranscodeProgress(encodedName, Number(data.progress || 0), 'Started');
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
          updateTranscodeProgress(encodedName, 0, 'Failed: ' + err.message);
          setTranscodeReason(encodedName, 'Status: Failed，' + err.message);
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
        uploadProgressText.textContent = text || ('Uploadin progress ' + p + '%');
      }

      function hideUploadProgress() {
        uploadProgress.style.display = 'none';
        uploadProgressFill.style.width = '0%';
        uploadProgressText.textContent = 'Ready to upload...';
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

      function setFolderNodeLockedState(path, locked) {
        const node = findFolderNodeByPath(path);
        if (node) {
          node.locked = !!locked;
        }
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
          folderDeleteBtn.disabled = !activeFolderPath || isRecycleRootFolderPath(activeFolderPath);
        }
        if (folderRestoreBtn) {
          folderRestoreBtn.disabled = !activeFolderPath || !isRecycleFolderPath(activeFolderPath) || isRecycleRootFolderPath(activeFolderPath);
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
          const isSelected = selectedFolderPaths.has(path);
          const isRenaming = activeFolderRenamePath === path && canRenameFolderPath(path);
          const padding = 10 + (Math.max(0, Number(level) || 0) * 18);
          const folderIconHtml = isRecycleRootFolderPath(path)
            ? '<span class="folder-tree-icon recycle" aria-hidden="true">🗑</span>'
            : '';
          const childHtml = hasChildren && expanded
            ? '<div class="folder-tree-children">' + buildFolderTreeHtml(node.children, (level || 0) + 1) + '</div>'
            : '';
          const displayName = displayFolderName(node.name || '');
          const nameHtml = isRenaming
            ? '<input class="folder-rename-input" data-folder-rename-input="' + escapeHtml(path) + '" value="' + escapeHtml(node.name || '') + '" maxlength="120">'
            : '<span class="folder-tree-name">' + folderIconHtml + escapeHtml(displayName) + '</span>';
          const lockHtml = folderLockIconHtml(node);
          return (
            '<div class="folder-tree-node' + (isActive ? ' active' : '') + (isSelected ? ' selected' : '') + (activeDropFolderPath === path ? ' drop-target' : '') + '" data-folder-path="' + escapeHtml(path) + '">' +
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
          folderTreeEmpty.textContent = 'No folders.';
          folderTreeEmpty.style.display = 'block';
          return;
        }
        folderTreeEmpty.style.display = 'none';
        folderTree.innerHTML =
          '<div class="folder-tree-node' + (activeFolderPath ? '' : ' active') + (activeDropFolderPath === '' ? ' drop-target' : '') + '" data-folder-path="">' +
            '<div class="folder-tree-line" style="padding-left:10px;">' +
              '<span class="folder-tree-toggle placeholder">•</span>' +
              '<div class="folder-tree-entry" data-folder-select="">' +
                '<span class="folder-tree-name"><span class="folder-tree-icon root" aria-hidden="true">⌂</span>' + DISPLAY_ROOT_FOLDER_NAME + '</span>' +
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
          showStatus('Foldername cannot be empty', 'err');
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
          showStatus('Folder Rename: ' + nextName, 'ok');
        } catch (err) {
          showStatus('Folderrename failed: ' + err.message, 'err');
          input.focus();
          input.select();
        } finally {
          folderRenameRequestPath = '';
        }
      }

      async function loadFolderTreeState() {
        const data = await fetchJson(folderListUrl());
        folderTreeData = Array.isArray(data.folders) ? data.folders.map(normalizeFolderNode) : [];
        ensureFolderPathExpanded(activeFolderPath);
        renderFolderTree();
      }

      async function createFolderAtCurrentPath() {
        if (!(await ensureFolderUnlocked(activeFolderPath))) {
          return;
        }
        const name = await askTagName({
          title: 'Create Subfolder',
          description: 'Please entercreate under"' + getFolderLabel(activeFolderPath) + '"subfolder name',
          label: 'FolderName',
          placeholder: 'Please enterFolderName'
        });
        if (name === null) {
          return;
        }
        const cleanName = String(name || '').trim();
        if (!cleanName) {
          showStatus('Foldername cannot be empty', 'err');
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
        showStatus(' CreateFolder: ' + cleanName, 'ok');
      }

      async function deleteCurrentFolder() {
        if (!activeFolderPath) {
          return;
        }
        if (isRecycleRootFolderPath(activeFolderPath)) {
          return;
        }
        if (isRecycleFolderPath(activeFolderPath)) {
          const confirmedPermanent = await askConfirmDialog({
            title: 'Permanently Delete Folder',
            description: 'Confirm permanent deletion of the Trash folder"' + activeFolderPath + '" and all its contents？This cannot be undone',
            confirmText: 'Permanently Delete',
            danger: true
          });
          if (!confirmedPermanent) {
            return;
          }
          await fetchJson(api.del + '?file=' + encodeURIComponent(activeFolderPath));
          activeFolderPath = RECYCLE_FOLDER_NAME;
          ensureFolderPathExpanded(activeFolderPath);
          await loadFiles();
          showStatus('Trash folder permanently deleted', 'warn');
          return;
        }
        if (!(await ensureFolderUnlocked(activeFolderPath))) {
          return;
        }
        const confirmed = await askConfirmDialog({
          title: 'DeleteFolder',
          description: 'ConfirmFolder"' + activeFolderPath + '" and all its contentsMove to Trash？',
          confirmText: 'Move to Trash',
          danger: true
        });
        if (!confirmed) {
          return;
        }
        await fetchJson(withFolderPassword(api.folderDelete + '?path=' + encodeURIComponent(activeFolderPath), activeFolderPath), { method: 'POST' });
        activeFolderPath = '';
        renderFolderTree();
        renderFiles(activeSourceFiles);
        showStatus('Folder Move to Trash', 'warn');
      }

      async function restoreCurrentRecycleFolder() {
        if (!activeFolderPath || !isRecycleFolderPath(activeFolderPath) || isRecycleRootFolderPath(activeFolderPath)) {
          return;
        }
        const selected = selectedFolderPaths.has(activeFolderPath)
          ? normalizeFolderMoveSources(Array.from(selectedFolderPaths)).filter(function (path) {
            return isRecycleFolderPath(path) && !isRecycleRootFolderPath(path);
          })
          : [activeFolderPath];
        if (!selected.length) {
          return;
        }
        const confirmed = await askConfirmDialog({
          title: selected.length > 1 ? 'Bulk Restore Folders' : 'Restore Folder',
          description: selected.length > 1
            ? ('Restore selected ' + selected.length + ' itemsFolder？Restore to original path; conflicts will be renamed automatically')
            : ('Restore folder"' + activeFolderPath + '"？Restore to original path; conflicts will be renamed automatically'),
          confirmText: 'Restore',
          danger: false
        });
        if (!confirmed) {
          return;
        }
        let restoredCount = 0;
        let lastTargetPath = '';
        for (let i = 0; i < selected.length; i += 1) {
          const result = await fetchJson(api.restore + '?file=' + encodeURIComponent(selected[i]));
          lastTargetPath = String((result && result.path) || '');
          restoredCount += 1;
        }
        clearSelectedFolders();
        activeFolderPath = RECYCLE_FOLDER_NAME;
        ensureFolderPathExpanded(activeFolderPath);
        await loadFiles();
        showStatus(restoredCount > 1
          ? (' Restore ' + restoredCount + ' itemsFolder')
          : (' Restore Folder' + (lastTargetPath ? (': ' + lastTargetPath) : '')),
          'ok');
      }

      async function moveFilesToFolder(filePaths, folderPath) {
        const list = Array.isArray(filePaths) ? filePaths.filter(Boolean) : [];
        if (!list.length) {
          return;
        }
        for (let i = 0; i < list.length; i += 1) {
          await fetchJson(
            withFolderPassword(
              appendFilePassword(withFolderPassword(api.fileMove + '?file=' + encodeURIComponent(list[i]) + '&folder=' + encodeURIComponent(folderPath || ''), parentFolderPathFromFilePath(list[i])), list[i], false),
              folderPath || '',
              'target_folder_password'
            ),
            { method: 'POST' }
          );
          selectedFileNames.delete(list[i]);
        }
        await loadFiles();
        showStatus(list.length > 1 ? ('Moved ' + list.length + ' files') : 'File moved', 'ok');
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
          const lockHtml = folderLockIconHtml(node);
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
                '<span class="folder-tree-name">Root</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          body;
        localImportEmpty.style.display = body ? 'none' : 'block';
      }

      async function openLocalImportDialog() {
        const paths = getSelectedLocalDiskImportPaths();
        if (!paths.length) {
          showStatus('Please choose local files or folders to upload first', 'err');
          return;
        }
        try {
          await loadFolderTreeState();
        } catch (err) {
          showStatus('FolderFailed: ' + err.message, 'err');
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
          localImportProgressText.textContent = text || ('Uploadin progress ' + Math.round(p) + '%');
        }
        if (localImportProgressClose) {
          localImportProgressClose.hidden = true;
        }
      }

      function localImportFileStateText(state) {
        if (state === 'done') { return 'Done'; }
        if (state === 'running') { return 'Uploadin progress'; }
        if (state === 'failed') { return 'Failed'; }
        return 'Waiting';
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
            '<div class="local-import-progress-file-meta">' + formatNumber(copied) + ' / ' + formatNumber(size) + ' bytes</div>' +
          '</div>';
        }).join('');
      }

      function finishLocalImportProgress(text) {
        setLocalImportProgress(100, text || 'UploadDone 100%');
        if (localImportProgressClose) {
          localImportProgressClose.hidden = false;
        }
      }

      function failLocalImportProgress(text) {
        setLocalImportProgress(0, text || 'UploadFailed');
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
          localImportProgressText.textContent = 'Ready to upload...';
        }
        if (localImportProgressFiles) {
          localImportProgressFiles.innerHTML = '';
        }
      }

      function pollLocalImportProgress(taskId) {
        return new Promise(function (resolve, reject) {
          if (!taskId) {
            reject(new Error('Missing upload task id'));
            return;
          }
          const timer = setInterval(function () {
            fetchJson(api.localDiskImportProgress + '?task_id=' + encodeURIComponent(taskId))
              .then(function (data) {
                const progress = Math.max(0, Math.min(100, Number(data.progress || 0)));
                const state = String(data.state || '');
                setLocalImportProgress(progress, (data.message || 'Uploadin progress') + ' ' + Math.round(progress) + '%');
                renderLocalImportProgressFiles(data.files);
                if (state === 'done') {
                  clearInterval(timer);
                  finishLocalImportProgress('UploadDone 100%');
                  resolve(data);
                } else if (state === 'failed') {
                  clearInterval(timer);
                  reject(new Error(data.error || 'UploadFailed'));
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
        const paths = getSelectedLocalDiskImportPaths();
        if (!paths.length) {
          closeLocalImportDialog();
          return;
        }
        if (!(await ensureFolderUnlocked(localImportTargetFolderPath))) {
          return;
        }
        const password = getFolderPasswordForPath(localImportTargetFolderPath);
        let url = api.localDiskImport
          + '?folder=' + encodeURIComponent(localImportTargetFolderPath || '')
          + '&paths=' + encodeURIComponent(paths.join('\n'));
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
          setLocalImportProgress(0, 'Ready to upload...');
          const data = await pollLocalImportProgress(String(started.task_id || ''));
          clearLocalDiskSelection();
          await loadFiles();
          showStatus(' Upload ' + Number(data.saved_count || 0) + ' itemsLocalFileRemote Disk', 'ok');
          const videoProbeFails = await verifyUploadedVideos(data.files);
          if (videoProbeFails.length) {
            showManualTranscodePrompt(videoProbeFails);
          }
        } catch (err) {
          failLocalImportProgress('UploadFailed: ' + err.message);
          showStatus('UploadLocalFileFailed: ' + err.message, 'err');
        } finally {
          if (localImportConfirmBtn) {
            localImportConfirmBtn.disabled = false;
          }
        }
      }

      async function showFilesForTag(tagId) {
        activeFilterTagId = tagId;
        tagFileViewMode = 'list';
        setActivePanel('panel-files');
        const data = await fetchJson(appendTagPassword(api.tagFiles + '?tag_id=' + encodeURIComponent(tagId), tagId));
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
            ? displayTagName(meta.node.name)
            : 'Current tag';
          fileViewContext.textContent = 'Current view: Tag: ' + tagName + ' / Scope: all tagged files';
        } else {
          fileViewContext.textContent = 'Current view: Folder: ' + getFolderLabel(activeFolderPath) + ' / Scope: all files';
        }
      }

      function updateExplorerLayout() {
        const isTagFilterMode = !!activeFilterTagId;
        const isPreviewEnabledTag = isTagFilterMode && isActiveTagPreviewEnabled();
        if (fileListTitle) {
          fileListTitle.textContent = isTagFilterMode ? 'Current Tag Files' : 'Current Folder Files';
        }
        if (tagViewModeBtns) {
          tagViewModeBtns.hidden = !isPreviewEnabledTag;
        }
        if (!isPreviewEnabledTag) {
          tagFileViewMode = 'list';
          if (tagViewListBtn) tagViewListBtn.classList.add('active');
          if (tagViewPreviewBtn) tagViewPreviewBtn.classList.remove('active');
          if (tagImagePreviewWrap) tagImagePreviewWrap.hidden = true;
        }
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

      function getFileRecordByPath(fileName) {
        const target = String(fileName || '');
        return (Array.isArray(currentFiles) ? currentFiles : []).find(function (file) {
          return getFilePath(file) === target;
        }) || null;
      }

      function summarizeSelectedFileTypes(fileNames) {
        const names = Array.isArray(fileNames) ? fileNames : [];
        let folderCount = 0;
        let fileCount = 0;
        names.forEach(function (name) {
          const item = getFileRecordByPath(name);
          if (item && item.directory) {
            folderCount += 1;
          } else {
            fileCount += 1;
          }
        });
        const label = folderCount > 0 && fileCount > 0
          ? 'files/folders'
          : (folderCount > 0 ? 'folders' : 'files');
        return {
          fileCount: fileCount,
          folderCount: folderCount,
          label: label
        };
      }

      function isCurrentFileLocal(fileName) {
        const target = String(fileName || '');
        const found = getFileRecordByPath(target);
        return !!(found && found.local);
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
        if (!fileBulkAction && !fileBulkDeleteAction && !fileBulkTagAction) {
          return;
        }

        const selectedCount = getSelectedVisibleFileNames().length;
        const isTagFilterMode = !!activeFilterTagId;
        const isRecycleMode = !isTagFilterMode && isRecycleFolderPath(activeFolderPath);
        if (fileBulkAction) {
          const label = isTagFilterMode ? 'Remove' : (isRecycleMode ? 'Restore' : 'Delete');
          const title = isTagFilterMode
            ? 'Remove selected files from the current tag'
            : (isRecycleMode ? 'Restore selected files to their original paths' : 'Delete selected files by moving them to Trash');
          fileBulkAction.textContent = label;
          fileBulkAction.title = title;
          fileBulkAction.setAttribute('aria-label', title);
          fileBulkAction.disabled = selectedCount === 0;
        }

        if (fileBulkDeleteAction) {
          const title = 'Permanently delete selected files/folders (Trash only)';
          fileBulkDeleteAction.textContent = 'Delete Permanently';
          fileBulkDeleteAction.title = title;
          fileBulkDeleteAction.setAttribute('aria-label', title);
          fileBulkDeleteAction.disabled = !isRecycleMode || selectedCount === 0;
        }

        if (fileBulkTagAction) {
          fileBulkTagAction.disabled = selectedCount === 0;
          fileBulkTagAction.title = selectedCount > 0 ? ('Add tags to ' + selectedCount + ' selected files') : 'Add tags to selected files';
          fileBulkTagAction.setAttribute('aria-label', fileBulkTagAction.title);
        }
      }

      async function bindFilesToTag(tagId, fileNames, options) {
        const names = Array.isArray(fileNames) ? fileNames : [];
        const opts = options || {};
        let boundCount = 0;
        for (let i = 0; i < names.length; i += 1) {
          const fileName = String(names[i] || '');
          if (!fileName) {
            continue;
          }
          const result = await bindFileToTag(tagId, fileName, opts);
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
        fileCounter.textContent = currentFiles.length + (currentFiles.length === 1 ? ' file' : ' files');

        if (!currentFiles.length) {
          fileList.innerHTML = '';
          fileTable.style.display = 'none';
          if (tagImagePreviewWrap) tagImagePreviewWrap.hidden = true;
          fileEmpty.textContent = activeFilterTagId ? 'No files under the current tag.' : 'No files in the current folder.';
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

        if (tagFileViewMode === 'preview' && isActiveTagPreviewEnabled()) {
          fileTable.style.display = 'none';
          renderTagImagePreview(sorted);
          updateFileSelectAllState();
          updateFileBulkActionButton();
          return;
        }

        if (tagImagePreviewWrap) tagImagePreviewWrap.hidden = true;
        fileTable.style.display = 'table';
        fileList.innerHTML = sorted.map(file => {
          const name = escapeHtml(file.name || '');
          const rawName = getFilePath(file);
          const encodedPath = encodeURIComponent(rawName);
          const isLocalTaggedFile = !!file.local;
          const isDir = !!file.directory;
          const fileLocked = !!file.locked;
          const lockIcon = fileLocked
            ? '<span class="folder-lock-icon file-lock-inline' + (getFilePassword(rawName, isLocalTaggedFile) ? ' unlocked' : '') + '" title="' + (getFilePassword(rawName, isLocalTaggedFile) ? 'Click to lock again' : 'Click to unlock') + '" aria-label="' + (getFilePassword(rawName, isLocalTaggedFile) ? 'Click to lock again' : 'Click to unlock') + '"><span class="folder-lock-shackle"></span><span class="folder-lock-body"></span></span>'
            : '';
          const pathMeta = file.folder_path
            ? '<div class="file-path-meta">' + escapeHtml(displayFolderPath(file.folder_path)) + '</div>'
            : '';
          const size = safeSize(file);
          const uploaded = escapeHtml(file.uploaded_time || '-');
          const checked = selectedFileNames.has(rawName) ? ' checked' : '';
          const previewBtn = !isDir && isImageName(file.name)
            ? (isLocalTaggedFile
              ? '<button class="local-preview-btn preview-btn" data-kind="image" data-local-file="' + encodedPath + '" data-local-name="' + escapeHtml(rawName) + '">Preview</button>'
              : '<button class="preview-btn" data-preview-file="' + encodedPath + '" data-preview-name="' + escapeHtml(rawName) + '">Preview</button>')
            : '';
          const videoBtn = !isDir && isVideoName(file.name)
            ? (isLocalTaggedFile
              ? '<button class="local-preview-btn video-btn" data-kind="video" data-local-file="' + encodedPath + '" data-local-name="' + escapeHtml(rawName) + '">Play</button>'
              : '<button class="video-btn" data-video-file="' + encodedPath + '" data-video-name="' + escapeHtml(rawName) + '">Play</button>')
            : '';
          const audioBtn = !isDir && isAudioName(file.name)
            ? (isLocalTaggedFile
              ? '<button class="local-preview-btn audio-btn" data-kind="audio" data-local-file="' + encodedPath + '" data-local-name="' + escapeHtml(rawName) + '">Listen</button>'
              : '<button class="audio-btn" data-audio-file="' + encodedPath + '" data-audio-name="' + escapeHtml(rawName) + '">Listen</button>')
            : '';
          const textBtn = !isDir && isTextName(file.name)
            ? (isLocalTaggedFile
              ? '<button class="local-preview-btn text-btn" data-kind="text" data-local-file="' + encodedPath + '" data-local-name="' + escapeHtml(rawName) + '">View</button>'
              : '<button class="text-btn" data-text-file="' + encodedPath + '" data-text-name="' + escapeHtml(rawName) + '">View</button>')
            : '';
          const primaryActionBtn = isTagFilterMode
            ? '<button class="delete-btn" data-file="' + encodedPath + '" data-name="' + escapeHtml(rawName) + '"' + (isLocalTaggedFile ? ' data-local-tag-file="1"' : '') + '>Remove</button>'
            : (isRecycleMode
              ? ('<button class="restore-btn" data-file="' + encodedPath + '" data-name="' + escapeHtml(rawName) + '">Restore</button>')
              : '<button class="delete-btn" data-file="' + encodedPath + '" data-name="' + escapeHtml(rawName) + '">Delete</button>');
          const permanentDeleteBtn = isRecycleMode
            ? '<button class="delete-btn" data-file="' + encodedPath + '" data-name="' + escapeHtml(rawName) + '">Delete Permanently</button>'
            : '';
          const nameContent = isDir
            ? '<span class="file-name local-folder-link"><span class="local-folder-icon">📁</span>' + name + '</span>'
            : '<a class="file-name" draggable="false" href="' + escapeHtml(isLocalTaggedFile ? localDiskDownloadUrl(rawName) : downloadUrlForFile(rawName, false)) + '">' + name + '</a>';
          const tagQuickBtn = isDir
            ? ''
            : '<button class="file-tag-quick-btn" type="button" data-tag-file="' + encodedPath + '" title="Add Tag" aria-label="Add Tag">🏷</button>';
          return (
            '<tr class="draggable-file-row" draggable="' + (isDir ? 'false' : 'true') + '" data-drag-file="' + encodedPath + '"' + (isDir ? '' : ' data-file-context="' + encodedPath + '"') + ' data-file-local="' + (isLocalTaggedFile ? '1' : '0') + '" data-file-locked="' + (fileLocked ? '1' : '0') + '" data-file-video="' + (!isDir && isVideoName(file.name) ? '1' : '0') + '">' +
              '<td class="file-select-cell"><div class="file-select-tools"><input class="file-select-input" type="checkbox" data-select-file="' + encodedPath + '" aria-label="Select ' + (isDir ? 'folder ' : 'file ') + escapeHtml(rawName) + '"' + checked + '>' + tagQuickBtn + '</div></td>' +
              '<td' + (isDir ? '' : ' data-file-context="' + encodedPath + '"') + ' data-file-local="' + (isLocalTaggedFile ? '1' : '0') + '" data-file-locked="' + (fileLocked ? '1' : '0') + '" data-file-video="' + (!isDir && isVideoName(file.name) ? '1' : '0') + '">' + nameContent + lockIcon + pathMeta + '</td>' +
              '<td>' + (isDir ? 'Folder' : displayFileSize(size)) + '</td>' +
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

      function renderTagImagePreview(files) {
        if (!tagImagePreviewWrap) {
          return;
        }
        const imageFiles = (Array.isArray(files) ? files : []).filter(function (f) {
          return !f.directory && isImageName(f.name);
        });
        activeTagPreviewImages = imageFiles.map(function (f) {
          const rawName = getFilePath(f);
          return {
            file: rawName,
            name: String(f.name || rawName || ''),
            local: !!f.local
          };
        });
        if (!imageFiles.length) {
          tagImagePreviewWrap.innerHTML = '<p class="tag-preview-empty">No images under the current tag.</p>';
          tagImagePreviewWrap.hidden = false;
          return;
        }
        const items = activeTagPreviewImages.map(function (item, index) {
          const rawName = item.file;
          const url = item.local ? localDiskDownloadUrl(rawName) : downloadUrlForFile(rawName, true);
          const encodedPath = encodeURIComponent(rawName);
          return '<div class="tag-img-thumb" data-thumb-file="' + encodedPath + '" data-thumb-index="' + index + '" data-thumb-name="' + escapeHtml(item.name) + '" role="button" tabindex="0" title="' + escapeHtml(item.name) + '">' +
            '<img src="' + escapeHtml(url) + '" alt="' + escapeHtml(item.name) + '" loading="lazy">' +
            '<div class="tag-img-thumb-name">' + escapeHtml(item.name) + '</div>' +
            '</div>';
        });
        tagImagePreviewWrap.innerHTML = '<div class="tag-img-thumb-grid">' + items.join('') + '</div>';
        tagImagePreviewWrap.hidden = false;
      }

      function imagePreviewUrlForItem(item) {
        if (!item || !item.file) {
          return '';
        }
        const url = item.local ? localDiskDownloadUrl(item.file) : downloadUrlForFile(item.file, true);
        return url + '&v=' + Date.now();
      }

      function updateImagePreviewWindow(win, gallery, index) {
        if (!win || !Array.isArray(gallery) || !gallery.length) {
          return;
        }
        const nextIndex = Math.max(0, Math.min(Number(index || 0), gallery.length - 1));
        const item = gallery[nextIndex];
        const titleEl = win.querySelector('.preview-title');
        const imageEl = win.querySelector('.preview-image');
        const prevBtn = win.querySelector('.preview-nav-btn[data-preview-nav="prev"]');
        const nextBtn = win.querySelector('.preview-nav-btn[data-preview-nav="next"]');
        win.__imageGallery = gallery;
        win.__imageIndex = nextIndex;
        if (titleEl) {
          titleEl.textContent = 'Image Preview: ' + String(item.name || item.file || '');
        }
        if (imageEl) {
          imageEl.onload = function () {
            if (!win.__imageBaseCanvas) {
              capturePreviewBaseCanvas(win);
            }
            updatePreviewImageSizeLabel(win);
          };
          imageEl.alt = String(item.name || 'Image Preview');
          imageEl.src = imagePreviewUrlForItem(item);
        }
        resetImageEditState(win);
        if (prevBtn) {
          prevBtn.disabled = nextIndex <= 0;
          prevBtn.hidden = gallery.length <= 1;
        }
        if (nextBtn) {
          nextBtn.disabled = nextIndex >= gallery.length - 1;
          nextBtn.hidden = gallery.length <= 1;
        }
      }

      function stepImagePreviewWindow(win, delta) {
        if (!win || !Array.isArray(win.__imageGallery) || !win.__imageGallery.length) {
          return;
        }
        const nextIndex = Number(win.__imageIndex || 0) + Number(delta || 0);
        if (nextIndex < 0 || nextIndex >= win.__imageGallery.length) {
          return;
        }
        updateImagePreviewWindow(win, win.__imageGallery, nextIndex);
      }

      function getTopImagePreviewWindow() {
        if (!previewLayer) {
          return null;
        }
        return Array.from(previewLayer.querySelectorAll('.floating-preview')).filter(function (win) {
          return win && win.isConnected && Array.isArray(win.__imageGallery) && win.__imageGallery.length > 1;
        }).sort(function (a, b) {
          return Number(b.style.zIndex || 0) - Number(a.style.zIndex || 0);
        })[0] || null;
      }

      function buildImageGalleryFromFiles(files) {
        return (Array.isArray(files) ? files : []).filter(function (file) {
          return file && !file.directory && isImageName(file.name || getFilePath(file));
        }).map(function (file) {
          const rawName = getFilePath(file);
          return {
            file: rawName,
            name: String(file.name || rawName || ''),
            local: !!file.local
          };
        }).filter(function (item) {
          return !!item.file;
        });
      }

      function imageGalleryIndexOf(gallery, filePath) {
        const target = String(filePath || '');
        const index = (Array.isArray(gallery) ? gallery : []).findIndex(function (item) {
          return String((item && item.file) || '') === target;
        });
        return index >= 0 ? index : 0;
      }

      function getSortedCurrentFiles() {
        const key = sortKey.value || 'name';
        const order = sortOrder.value || 'asc';
        return (Array.isArray(currentFiles) ? currentFiles : []).slice().sort(function (a, b) {
          return compareFiles(a, b, key, order);
        });
      }

      function currentImageGalleryPreviewKey() {
        if (activeFilterTagId) {
          return 'image-gallery:tag:' + String(activeFilterTagId || 'default');
        }
        return 'image-gallery:folder:' + String(activeFolderPath || 'root');
      }

      function openCurrentFileImagePreview(filePath, displayName) {
        const rawPath = String(filePath || '');
        if (!rawPath) {
          return;
        }
        const gallery = buildImageGalleryFromFiles(getSortedCurrentFiles());
        const index = imageGalleryIndexOf(gallery, rawPath);
        const current = gallery[index] || { file: rawPath, name: displayName || rawPath, local: false };
        const opts = {
          previewKey: currentImageGalleryPreviewKey(),
          gallery: gallery.length ? gallery : [current],
          galleryIndex: index,
          local: !!current.local
        };
        if (current.local) {
          opts.url = localDiskDownloadUrl(rawPath);
        }
        openPreview('image', encodeURIComponent(rawPath), displayName || current.name || rawPath, opts);
      }

      function buildLocalDiskImageGallery() {
        return (Array.isArray(activeLocalDiskItems) ? activeLocalDiskItems : []).slice()
          .sort(compareLocalDiskItems)
          .filter(function (item) {
            return item && !item.directory && isImageName(item.name || item.path);
          }).map(function (item) {
            const path = String(item.path || '');
            return {
              file: path,
              name: String(item.name || localDiskBaseName(path)),
              local: true
            };
          }).filter(function (item) {
            return !!item.file;
          });
      }

      function openLocalDiskImagePreview(path, displayName) {
        const rawPath = String(path || '');
        if (!rawPath) {
          return;
        }
        const gallery = buildLocalDiskImageGallery();
        const index = imageGalleryIndexOf(gallery, rawPath);
        const current = gallery[index] || { file: rawPath, name: displayName || rawPath, local: true };
        openPreview('image', encodeURIComponent(rawPath), displayName || current.name || rawPath, {
          local: true,
          url: localDiskDownloadUrl(rawPath),
          previewKey: 'local-image-gallery:' + String(activeLocalDiskPath || localDiskParentPath(rawPath) || 'root'),
          gallery: gallery.length ? gallery : [current],
          galleryIndex: index
        });
      }

      function imageEditMimeForFile(filePath) {
        const text = String(filePath || '').toLowerCase();
        if (/\.(jpg|jpeg)$/.test(text)) {
          return 'image/jpeg';
        }
        if (/\.png$/.test(text)) {
          return 'image/png';
        }
        return '';
      }

      function currentPreviewImageItem(win) {
        if (!win || !Array.isArray(win.__imageGallery) || !win.__imageGallery.length) {
          return null;
        }
        return win.__imageGallery[Math.max(0, Math.min(Number(win.__imageIndex || 0), win.__imageGallery.length - 1))] || null;
      }

      function setImageEditHint(win, text, error) {
        const hint = win ? win.querySelector('.preview-edit-hint') : null;
        if (!hint) {
          return;
        }
        hint.textContent = String(text || '');
        hint.classList.toggle('error', !!error);
      }

      function updatePreviewImageSizeLabel(win, width, height) {
        if (!win) {
          return;
        }
        const widthInput = win ? win.querySelector('.preview-size-input[data-image-size="width"]') : null;
        const heightInput = win ? win.querySelector('.preview-size-input[data-image-size="height"]') : null;
        const img = win.querySelector('.preview-image');
        const w = Math.max(0, Math.round(Number(width || (img && img.naturalWidth) || 0)));
        const h = Math.max(0, Math.round(Number(height || (img && img.naturalHeight) || 0)));
        if (widthInput) {
          widthInput.value = w ? String(w) : '';
        }
        if (heightInput) {
          heightInput.value = h ? String(h) : '';
        }
      }

      function resetImageEditState(win) {
        if (!win) {
          return;
        }
        win.__imageDirty = false;
        win.__imageCropMode = false;
        win.__imageCropRect = null;
        win.__imageBaseCanvas = null;
        win.__imageScale = 1;
        win.__imageCurrentWidth = 0;
        win.__imageCurrentHeight = 0;
        const shell = win.querySelector('.preview-image-shell');
        const cropRect = win.querySelector('.preview-crop-rect');
        if (shell) {
          shell.classList.remove('crop-mode');
        }
        if (cropRect) {
          cropRect.hidden = true;
          cropRect.removeAttribute('style');
        }
        setImageEditHint(win, '');
        updatePreviewImageSizeLabel(win);
      }

      function canvasToBlob(canvas, type, quality) {
        return new Promise(function (resolve, reject) {
          canvas.toBlob(function (blob) {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to generate image'));
            }
          }, type || 'image/png', quality || 0.92);
        });
      }

      function drawImageElementToCanvas(img) {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas;
      }

      function cloneCanvas(source) {
        const canvas = document.createElement('canvas');
        canvas.width = source.width;
        canvas.height = source.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(source, 0, 0);
        return canvas;
      }

      function capturePreviewBaseCanvas(win) {
        const img = win ? win.querySelector('.preview-image') : null;
        if (!win || !img || !img.complete || !img.naturalWidth || !img.naturalHeight) {
          return null;
        }
        win.__imageBaseCanvas = drawImageElementToCanvas(img);
        win.__imageScale = 1;
        win.__imageCurrentWidth = win.__imageBaseCanvas.width;
        win.__imageCurrentHeight = win.__imageBaseCanvas.height;
        updatePreviewImageSizeLabel(win);
        return win.__imageBaseCanvas;
      }

      function previewBaseCanvas(win) {
        return (win && win.__imageBaseCanvas) || capturePreviewBaseCanvas(win);
      }

      function replacePreviewImageWithCanvas(win, canvas, options) {
        const img = win ? win.querySelector('.preview-image') : null;
        const item = currentPreviewImageItem(win);
        const opts = options || {};
        const mime = imageEditMimeForFile(item && item.file);
        if (!img || !mime) {
          throw new Error('The current image format cannot be edited and saved yet');
        }
        if (opts.updateBase !== false) {
          win.__imageBaseCanvas = cloneCanvas(canvas);
          win.__imageScale = 1;
        }
        win.__imageCurrentWidth = canvas.width;
        win.__imageCurrentHeight = canvas.height;
        img.src = canvas.toDataURL(mime, 0.92);
        win.__imageDirty = true;
        win.__imageCropRect = null;
        const cropRect = win.querySelector('.preview-crop-rect');
        if (cropRect) {
          cropRect.hidden = true;
          cropRect.removeAttribute('style');
        }
        updatePreviewImageSizeLabel(win, canvas.width, canvas.height);
      }

      function rotatePreviewImage(win, direction) {
        const img = win ? win.querySelector('.preview-image') : null;
        if (!img || !img.complete || !img.naturalWidth || !img.naturalHeight) {
          setImageEditHint(win, 'The image has not loaded yet. Please try again later.', true);
          return;
        }
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalHeight;
          canvas.height = img.naturalWidth;
          const ctx = canvas.getContext('2d');
          if (direction === 'left') {
            ctx.translate(0, canvas.height);
            ctx.rotate(-Math.PI / 2);
          } else {
            ctx.translate(canvas.width, 0);
            ctx.rotate(Math.PI / 2);
          }
          ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
          replacePreviewImageWithCanvas(win, canvas);
          setImageEditHint(win, direction === 'left'
            ? ' Rotated 90 degrees left. Click Save to write the file.'
            : ' Rotated 90 degrees right. Click Save to write the file.');
        } catch (err) {
          setImageEditHint(win, 'RotateFailed: ' + err.message, true);
        }
      }

      function renderPreviewImageFromBase(win, width, height, message) {
        const img = win ? win.querySelector('.preview-image') : null;
        if (!img || !img.complete || !img.naturalWidth || !img.naturalHeight) {
          setImageEditHint(win, 'The image has not loaded yet. Please try again later.', true);
          return;
        }
        const base = previewBaseCanvas(win);
        if (!base) {
          setImageEditHint(win, 'The image has not loaded yet. Please try again later.', true);
          return;
        }
        const nextWidth = Math.max(1, Math.round(Number(width || 0)));
        const nextHeight = Math.max(1, Math.round(Number(height || 0)));
        if (nextWidth > 12000 || nextHeight > 12000) {
          setImageEditHint(win, 'The image is too large to resize.', true);
          return;
        }
        try {
          const canvas = document.createElement('canvas');
          canvas.width = nextWidth;
          canvas.height = nextHeight;
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(base, 0, 0, nextWidth, nextHeight);
          replacePreviewImageWithCanvas(win, canvas, { updateBase: false });
          setImageEditHint(win, message || (' resized to ' + nextWidth + ' x ' + nextHeight + ''));
        } catch (err) {
          setImageEditHint(win, 'Resize failed: ' + err.message, true);
        }
      }

      function scalePreviewImage(win, factor) {
        const base = previewBaseCanvas(win);
        if (!base) {
          setImageEditHint(win, 'The image has not loaded yet. Please try again later.', true);
          return;
        }
        const scale = Math.max(0.05, Math.min(20, Number(win.__imageScale || 1) * Number(factor || 1)));
        const nextWidth = Math.max(1, Math.round(base.width * scale));
        const nextHeight = Math.max(1, Math.round(base.height * scale));
        win.__imageScale = scale;
        renderPreviewImageFromBase(
          win,
          nextWidth,
          nextHeight,
          (Number(factor || 1) > 1 ? ' scaled up to ' : ' scaled down to ') + nextWidth + ' x ' + nextHeight + ''
        );
      }

      function applyPreviewImageManualSize(win) {
        const widthInput = win ? win.querySelector('.preview-size-input[data-image-size="width"]') : null;
        const heightInput = win ? win.querySelector('.preview-size-input[data-image-size="height"]') : null;
        const width = Math.round(Number(widthInput && widthInput.value));
        const height = Math.round(Number(heightInput && heightInput.value));
        if (!width || !height || width < 1 || height < 1) {
          setImageEditHint(win, 'Please enter a valid image width and height.', true);
          return;
        }
        const base = previewBaseCanvas(win);
        if (base) {
          win.__imageScale = width / base.width;
        }
        renderPreviewImageFromBase(win, width, height, ' enterresized to ' + width + ' x ' + height + '');
      }

      function setPreviewCropMode(win, enabled) {
        if (!win) {
          return;
        }
        win.__imageCropMode = !!enabled;
        const shell = win.querySelector('.preview-image-shell');
        const cropRect = win.querySelector('.preview-crop-rect');
        if (shell) {
          shell.classList.toggle('crop-mode', !!enabled);
        }
        if (cropRect && !enabled && !win.__imageCropRect) {
          cropRect.hidden = true;
          cropRect.removeAttribute('style');
        }
        setImageEditHint(win, enabled ? 'Drag on the image to choose a crop area, then click Apply Crop.' : '');
      }

      function applyPreviewImageCrop(win) {
        const img = win ? win.querySelector('.preview-image') : null;
        const rect = win && win.__imageCropRect;
        if (!img || !rect || rect.width < 2 || rect.height < 2) {
          setImageEditHint(win, 'Please drag to choose a crop area first.', true);
          return;
        }
        try {
          const source = drawImageElementToCanvas(img);
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(rect.width));
          canvas.height = Math.max(1, Math.round(rect.height));
          const ctx = canvas.getContext('2d');
          ctx.drawImage(
            source,
            Math.round(rect.x), Math.round(rect.y), canvas.width, canvas.height,
            0, 0, canvas.width, canvas.height
          );
          replacePreviewImageWithCanvas(win, canvas);
          setPreviewCropMode(win, false);
          setImageEditHint(win, ' Crop applied. Click Save to write the file.');
        } catch (err) {
          setImageEditHint(win, 'CropFailed: ' + err.message, true);
        }
      }

      function cancelPreviewImageCrop(win) {
        if (!win) {
          return;
        }
        win.__imageCropRect = null;
        const cropRect = win.querySelector('.preview-crop-rect');
        if (cropRect) {
          cropRect.hidden = true;
          cropRect.removeAttribute('style');
        }
        setPreviewCropMode(win, false);
      }

      async function savePreviewImageEdits(win) {
        const img = win ? win.querySelector('.preview-image') : null;
        const item = currentPreviewImageItem(win);
        if (!img || !item || !item.file) {
          return;
        }
        const mime = imageEditMimeForFile(item.file);
        if (!mime) {
          setImageEditHint(win, 'GIF animated GIFdoes not supportSave，Please  PNG/JPG', true);
          return;
        }
        if (!win.__imageDirty) {
          setImageEditHint(win, 'Image has not been edited; no save needed');
          return;
        }
        try {
          const canvas = drawImageElementToCanvas(img);
          const blob = await canvasToBlob(canvas, mime, 0.92);
          const form = new FormData();
          form.append('image', blob, localDiskBaseName(item.file));
          let url = api.imageSave + '?file=' + encodeURIComponent(item.file);
          if (item.local) {
            url += '&local=1';
            url = appendLocalDirPassword(appendFilePassword(url, item.file, true), localDiskParentPath(item.file));
          } else {
            url = appendFilePassword(withFolderPassword(url, parentFolderPathFromFilePath(item.file)), item.file, false);
          }
          setImageEditHint(win, 'Saving...');
          await fetchJson(url, { method: 'POST', body: form });
          win.__imageDirty = false;
          win.__imageBaseCanvas = null;
          win.__imageScale = 1;
          img.src = imagePreviewUrlForItem(item);
          showStatus('Image edit result saved: ' + item.file, 'ok');
          setImageEditHint(win, ' Save');
        } catch (err) {
          setImageEditHint(win, 'SaveFailed: ' + err.message, true);
          showStatus('Failed to save image: ' + err.message, 'err');
        }
      }

      async function downloadPreviewImageEdits(win) {
        const img = win ? win.querySelector('.preview-image') : null;
        const item = currentPreviewImageItem(win);
        if (!img || !item || !item.file) {
          return;
        }
        const mime = imageEditMimeForFile(item.file);
        if (!mime) {
          setImageEditHint(win, 'GIF animated GIFdoes not supportdownloading after editing，Please  PNG/JPG', true);
          return;
        }
        try {
          const canvas = drawImageElementToCanvas(img);
          const blob = await canvasToBlob(canvas, mime, 0.92);
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = localDiskBaseName(item.file) || 'image';
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(url);
          setImageEditHint(win, ' generated local download file');
        } catch (err) {
          setImageEditHint(win, 'DownloadFailed: ' + err.message, true);
        }
      }

      function initPreviewImageEditing(win) {
        const shell = win ? win.querySelector('.preview-image-shell') : null;
        const img = win ? win.querySelector('.preview-image') : null;
        const cropRect = win ? win.querySelector('.preview-crop-rect') : null;
        if (!win || !shell || !img || !cropRect) {
          return;
        }

        let drag = null;
        function clampPoint(e) {
          const rect = img.getBoundingClientRect();
          const x = Math.max(rect.left, Math.min(rect.right, e.clientX));
          const y = Math.max(rect.top, Math.min(rect.bottom, e.clientY));
          return { x: x, y: y, imageRect: rect };
        }
        function drawRect(a, b) {
          const shellRect = shell.getBoundingClientRect();
          const left = Math.min(a.x, b.x);
          const top = Math.min(a.y, b.y);
          const width = Math.abs(a.x - b.x);
          const height = Math.abs(a.y - b.y);
          cropRect.hidden = false;
          cropRect.style.left = (left - shellRect.left) + 'px';
          cropRect.style.top = (top - shellRect.top) + 'px';
          cropRect.style.width = width + 'px';
          cropRect.style.height = height + 'px';
          win.__imageCropRect = {
            x: ((left - b.imageRect.left) / b.imageRect.width) * img.naturalWidth,
            y: ((top - b.imageRect.top) / b.imageRect.height) * img.naturalHeight,
            width: (width / b.imageRect.width) * img.naturalWidth,
            height: (height / b.imageRect.height) * img.naturalHeight
          };
        }

        shell.addEventListener('mousedown', function (e) {
          if (!win.__imageCropMode || !img.complete || !img.naturalWidth) {
            return;
          }
          e.preventDefault();
          const start = clampPoint(e);
          drag = { start: start };
          drawRect(start, start);
        });
        window.addEventListener('mousemove', function (e) {
          if (!drag) {
            return;
          }
          e.preventDefault();
          drawRect(drag.start, clampPoint(e));
        });
        window.addEventListener('mouseup', function (e) {
          if (!drag) {
            return;
          }
          e.preventDefault();
          drawRect(drag.start, clampPoint(e));
          drag = null;
        });

        win.addEventListener('click', function (e) {
          const action = e.target.closest('[data-image-edit]');
          if (!action || !win.contains(action)) {
            return;
          }
          e.preventDefault();
          const type = action.getAttribute('data-image-edit') || '';
          if (type === 'rotate-left') {
            rotatePreviewImage(win, 'left');
          } else if (type === 'rotate-right') {
            rotatePreviewImage(win, 'right');
          } else if (type === 'zoom-in') {
            scalePreviewImage(win, 1.25);
          } else if (type === 'zoom-out') {
            scalePreviewImage(win, 0.8);
          } else if (type === 'crop') {
            setPreviewCropMode(win, true);
          } else if (type === 'apply-crop') {
            applyPreviewImageCrop(win);
          } else if (type === 'cancel-crop') {
            cancelPreviewImageCrop(win);
          } else if (type === 'download') {
            downloadPreviewImageEdits(win);
          } else if (type === 'save') {
            savePreviewImageEdits(win);
          }
        });

        win.addEventListener('keydown', function (e) {
          if (!e.target.closest('.preview-size-input[data-image-size]')) {
            return;
          }
          if (e.key === 'Enter') {
            e.preventDefault();
            applyPreviewImageManualSize(win);
          }
        });
      }

      function buildLocalDiskFileRowHtml(item) {
        const name = String((item && item.name) || '');
        const path = String((item && item.path) || '');
        const encodedPath = encodeURIComponent(path);
        const checked = selectedLocalDiskPaths.has(path) ? ' checked' : '';
        const fileLocked = !!(item && item.locked);
        const lockIcon = fileLocked
          ? '<span class="folder-lock-icon file-lock-inline' + (getFilePassword(path, true) ? ' unlocked' : '') + '" title="' + (getFilePassword(path, true) ? 'Click to lock again' : 'Click to unlock') + '" aria-label="' + (getFilePassword(path, true) ? 'Click to lock again' : 'Click to unlock') + '"><span class="folder-lock-shackle"></span><span class="folder-lock-body"></span></span>'
          : '';
        const selectBox = '<span class="file-select-tools"><input class="local-disk-select" type="checkbox" data-local-select="' + encodedPath + '" aria-label="Select ' + escapeHtml(name) + '"' + checked + '><button class="file-tag-quick-btn local-file-tag-btn" type="button" data-local-tag-file="' + encodedPath + '" title="Add Tag" aria-label="Add Tag">🏷</button></span>';
        const displayName = selectBox + '<a class="file-name local-disk-draggable-name" draggable="false" href="' + escapeHtml(localDiskDownloadUrl(path)) + '">' + escapeHtml(name) + '</a>' + lockIcon;
        const previewBtn = isImageName(name)
          ? '<button class="local-preview-btn preview-btn" data-kind="image" data-local-file="' + encodedPath + '" data-local-name="' + escapeHtml(path) + '">Preview</button>'
          : '';
        const videoBtn = isVideoName(name)
          ? '<button class="local-preview-btn video-btn" data-kind="video" data-local-file="' + encodedPath + '" data-local-name="' + escapeHtml(path) + '">Play</button>'
          : '';
        const audioBtn = isAudioName(name)
          ? '<button class="local-preview-btn audio-btn" data-kind="audio" data-local-file="' + encodedPath + '" data-local-name="' + escapeHtml(path) + '">Listen</button>'
          : '';
        const textBtn = isTextName(name)
          ? '<button class="local-preview-btn text-btn" data-kind="text" data-local-file="' + encodedPath + '" data-local-name="' + escapeHtml(path) + '">View</button>'
          : '';
        const deleteBtn = '<button class="local-delete-btn delete-btn" data-local-delete="' + encodedPath + '" data-local-name="' + escapeHtml(path) + '" title="Move to Trash" aria-label="Move to Trash">Remove</button>';
        return (
          '<tr class="local-disk-draggable" draggable="true" data-local-drag="' + encodedPath + '" data-local-file-context="' + encodedPath + '" data-file-locked="' + (fileLocked ? '1' : '0') + '" data-file-video="' + (isVideoName(name) ? '1' : '0') + '">' +
            '<td>' + displayName + '</td>' +
            '<td>' + displayFileSize(item.size) + '</td>' +
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

      function getSelectedLocalDiskImportPaths() {
        return getSelectedLocalDiskPaths();
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
        [localDiskBulkRemoveBtn, localDiskTableBulkRemoveBtn, localDiskBulkTagBtn, localDiskTableBulkTagBtn].forEach(function (btn) {
          if (btn) {
            btn.disabled = disabled;
          }
        });
        if (localDiskImportBtn) {
          localDiskImportBtn.disabled = getSelectedLocalDiskImportPaths().length === 0;
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
        if (!confirm('Move ' + paths.length + ' selected local files to Trash?')) {
          return;
        }
        [localDiskBulkRemoveBtn, localDiskTableBulkRemoveBtn].forEach(function (btn) {
          if (btn) {
            btn.disabled = true;
          }
        });
        Promise.all(paths.map(function (path) {
          return fetchJson(appendLocalDirPassword(appendFilePassword(api.localDiskDelete + '?path=' + encodeURIComponent(path), path, true), localDiskParentPath(path)), { method: 'POST' });
        })).then(function () {
          showStatus('Moved ' + paths.length + ' local files to Trash', 'warn');
          clearLocalDiskSelection();
          loadLocalDisk(activeLocalDiskPath || '');
        }).catch(function (err) {
          showStatus('Bulk remove failed: ' + err.message, 'err');
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

      function setLocalDiskDirLockedState(path, locked) {
        const target = String(path || '');
        if (!target) {
          return;
        }
        activeLocalDiskItems.forEach(function (item) {
          if (item && item.directory && String(item.path || '') === target) {
            item.locked = !!locked;
          }
        });
        localDiskTreeCache.forEach(function (dirs) {
          dirs.forEach(function (item) {
            if (item && String(item.path || '') === target) {
              item.locked = !!locked;
            }
          });
        });
      }

      function setFileLockedState(path, local, locked) {
        const target = String(path || '');
        const isLocal = !!local;
        if (!target) {
          return;
        }

        function updateList(list) {
          (Array.isArray(list) ? list : []).forEach(function (item) {
            if (!item) {
              return;
            }
            if (!!item.local === isLocal && getFilePath(item) === target) {
              item.locked = !!locked;
            }
          });
        }

        updateList(allFiles);
        updateList(activeSourceFiles);
        activeLocalDiskItems.forEach(function (item) {
          if (!item || item.directory) {
            return;
          }
          if (String(item.path || '') === target) {
            item.locked = !!locked;
          }
        });
      }

      function invalidateLocalDiskDirLockCache(path) {
        const target = String(path || '');
        if (!target) {
          return;
        }
        localDiskTreeCache.delete(target);
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
        const dirLocked = !!(itemMeta && itemMeta.locked);
        const dirLockIcon = localDirLockIconHtml(textPath, dirLocked);
        const createBtn = '<button type="button" class="local-mkdir-btn local-disk-dir-create-inline" data-local-mkdir="' + encodedPath + '" data-local-name="' + escapeHtml(textPath) + '" title="Create subfolder" aria-label="Create subfolder">+</button>';
        const deleteBtn = level > 0 && itemMeta && itemMeta.empty_directory
          ? '<button type="button" class="local-delete-btn local-disk-dir-delete-inline" data-local-delete="' + encodedPath + '" data-local-name="' + escapeHtml(textPath) + '" title="Delete empty folder" aria-label="Delete empty folder">-</button>'
          : '';
        const selectBox = canMove
          ? '<input class="local-disk-select" type="checkbox" data-local-select="' + encodedPath + '" aria-label="Select ' + escapeHtml(name) + '"' + checked + '>'
          : '<span class="local-disk-select-placeholder"></span>';
        let html = '<div class="local-disk-tree-row local-disk-dir-item' + (canMove ? ' local-disk-draggable' : '') + (isActive ? ' active' : '') + '" ' + (canMove ? 'draggable="true" data-local-drag="' + encodedPath + '" ' : '') + 'data-local-drop-target="' + encodedPath + '" data-local-dir-context="' + encodedPath + '" data-local-dir-locked="' + (dirLocked ? '1' : '0') + '" style="--tree-level:' + level + '">' +
          '<button type="button" class="local-disk-tree-caret" data-local-toggle="' + encodedPath + '" title="Expand or collapse folder" aria-label="Expand or collapse folder">' + (isExpanded && dirs.length ? '▾' : (hasCache && !dirs.length ? '' : '▸')) + '</button>' +
          selectBox +
          '<button type="button" class="local-disk-dir-link" data-local-folder="' + encodedPath + '">' +
            '<span class="local-folder-icon">📁</span>' +
            '<span class="local-disk-dir-item-name">' + escapeHtml(name) + '</span>' +
          '</button>' +
          dirLockIcon +
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
          localDiskContext.textContent = 'Current path: ' + activeLocalDiskPath;
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
          localDiskEmpty.textContent = 'No visible content in the current folder.';
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
          const dirLocked = isDir && !!(item && item.locked);
          const dirLockIcon = isDir ? localDirLockIconHtml(path, dirLocked) : '';
          const fileLocked = !isDir && !!(item && item.locked);
          const lockIcon = fileLocked
            ? '<span class="folder-lock-icon file-lock-inline' + (getFilePassword(path, true) ? ' unlocked' : '') + '" title="' + (getFilePassword(path, true) ? 'Click to lock again' : 'Click to unlock') + '" aria-label="' + (getFilePassword(path, true) ? 'Click to lock again' : 'Click to unlock') + '"><span class="folder-lock-shackle"></span><span class="folder-lock-body"></span></span>'
            : '';
          const checked = selectedLocalDiskPaths.has(path) ? ' checked' : '';
          const selectBox = isDir
            ? '<span class="file-select-tools"><input class="local-disk-select" type="checkbox" data-local-select="' + encodedPath + '" aria-label="Select ' + escapeHtml(name) + '"' + checked + '></span>'
            : '<span class="file-select-tools"><input class="local-disk-select" type="checkbox" data-local-select="' + encodedPath + '" aria-label="Select ' + escapeHtml(name) + '"' + checked + '><button class="file-tag-quick-btn local-file-tag-btn" type="button" data-local-tag-file="' + encodedPath + '" title="Add Tag" aria-label="Add Tag">🏷</button></span>';
          const nameHtml = isDir
            ? '<button type="button" class="local-folder-link" data-local-folder="' + encodedPath + '"><span class="local-folder-icon">📁</span><span>' + escapeHtml(name) + '</span></button>' + dirLockIcon
            : '<a class="file-name" href="' + escapeHtml(localDiskDownloadUrl(path)) + '">' + escapeHtml(name) + '</a>' + lockIcon;
          const displayName = '<span class="local-disk-table-name-cell">' + selectBox + nameHtml + '</span>';
          const previewBtn = !isDir && isImageName(name)
            ? '<button class="local-preview-btn preview-btn" data-kind="image" data-local-file="' + encodedPath + '" data-local-name="' + escapeHtml(path) + '">Preview</button>'
            : '';
          const videoBtn = !isDir && isVideoName(name)
            ? '<button class="local-preview-btn video-btn" data-kind="video" data-local-file="' + encodedPath + '" data-local-name="' + escapeHtml(path) + '">Play</button>'
            : '';
          const audioBtn = !isDir && isAudioName(name)
            ? '<button class="local-preview-btn audio-btn" data-kind="audio" data-local-file="' + encodedPath + '" data-local-name="' + escapeHtml(path) + '">Listen</button>'
            : '';
          const textBtn = !isDir && isTextName(name)
            ? '<button class="local-preview-btn text-btn" data-kind="text" data-local-file="' + encodedPath + '" data-local-name="' + escapeHtml(path) + '">View</button>'
            : '';
          const deleteBtn = isDir
            ? (item.empty_directory
              ? '<button class="local-delete-btn delete-btn" data-local-delete="' + encodedPath + '" data-local-name="' + escapeHtml(path) + '">Delete</button>'
              : '')
            : '<button class="local-delete-btn delete-btn" data-local-delete="' + encodedPath + '" data-local-name="' + escapeHtml(path) + '" title="Move to Trash" aria-label="Move to Trash">Remove</button>';
          return (
            '<tr' + (!isDir ? (' data-local-file-context="' + encodedPath + '" data-file-locked="' + (fileLocked ? '1' : '0') + '" data-file-video="' + (isVideoName(name) ? '1' : '0') + '"') : (' data-local-dir-context="' + encodedPath + '" data-local-dir-locked="' + (dirLocked ? '1' : '0') + '"')) + '>' +
              '<td>' + displayName + '</td>' +
              '<td>' + (isDir ? 'Folder' : 'File') + '</td>' +
              '<td>' + (isDir ? '-' : displayFileSize(item.size)) + '</td>' +
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
          let url = target
            ? (api.localDiskList + '?path=' + encodeURIComponent(target) + (showHidden ? '&show_hidden=1' : ''))
            : (api.localDiskList + (showHidden ? '?show_hidden=1' : ''));
          if (target) {
            url = appendLocalDirPassword(url, target);
          }
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
            localDiskEmpty.textContent = 'Failed to load local disk: ' + err.message;
            localDiskEmpty.style.display = 'block';
          }
          showStatus('Failed to load local disk: ' + err.message, 'err');
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
          const data = await fetchJson(appendLocalDirPassword(url, target));
          cacheLocalDiskTreeNode(String(data.path || target), Array.isArray(data.items) ? data.items : []);
          expandedLocalDiskTreePaths.add(String(data.path || target));
          renderLocalDiskItems(activeLocalDiskItems);
        } catch (err) {
          showStatus('ExpandFolderFailed: ' + err.message, 'err');
        }
      }

      function openPreview(kind, file, name, options) {
        const opts = options || {};
        const previewKey = (opts.previewKey || file);
        const existed = openedPreviewWindows.get(previewKey);
        if (existed && existed.isConnected) {
          bringToFront(existed);
          if (kind === 'image' && Array.isArray(opts.gallery) && opts.gallery.length) {
            updateImagePreviewWindow(existed, opts.gallery, Number(opts.galleryIndex || 0));
          }
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

        const titleText = kind === 'video' ? 'Video Playback: '
          : (kind === 'audio' ? 'Audio Playback: '
            : (kind === 'text' ? 'View: ' : 'Image Preview: '));
        const escapedTitle = escapeHtml(name || '');

        let mediaHtml = '';
        if (kind === 'video') {
          const rawName = decodeURIComponent(String(file || '')) || String(name || '');
          const subtitleName = toVttSidecarName(rawName);
          const subtitleUrl = (opts.local ? localDiskDownloadUrl(subtitleName) : downloadUrlForFile(subtitleName, true)) + '&v=' + Date.now();
          mediaHtml = '<video class="preview-video" controls preload="metadata">' +
            '<track kind="subtitles" srclang="zh-CN" label="in progress" default src="' + subtitleUrl + '">' +
            '</video>';
        } else if (kind === 'audio') {
          mediaHtml = '<audio class="preview-audio" controls preload="metadata" src="' + url + '"></audio>';
        } else if (kind === 'text') {
          mediaHtml = '<pre class="preview-text">in progress...</pre>';
        } else {
          const showNav = Array.isArray(opts.gallery) && opts.gallery.length > 1;
          mediaHtml = '<div class="preview-image-toolbar">' +
              '<button class="preview-edit-btn" type="button" data-image-edit="rotate-left" title="Rotate90" aria-label="Rotate90">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
                  '<rect x="8" y="9.5" width="9" height="9" rx="1.8"></rect><path d="M6 4.8v4.4h4.4"></path><path d="M6 9.2a6.5 6.5 0 0 1 10.5-3.8"></path>' +
                '</svg>' +
              '</button>' +
              '<button class="preview-edit-btn" type="button" data-image-edit="rotate-right" title="Rotate90" aria-label="Rotate90">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
                  '<rect x="7" y="9.5" width="9" height="9" rx="1.8"></rect><path d="M18 4.8v4.4h-4.4"></path><path d="M18 9.2A6.5 6.5 0 0 0 7.5 5.4"></path>' +
                '</svg>' +
              '</button>' +
              '<button class="preview-edit-btn" type="button" data-image-edit="crop" title="Crop" aria-label="Crop">✂</button>' +
              '<button class="preview-edit-btn" type="button" data-image-edit="apply-crop" title="Crop" aria-label="Crop">✓</button>' +
              '<button class="preview-edit-btn" type="button" data-image-edit="cancel-crop" title="CancelCrop" aria-label="CancelCrop">×</button>' +
              '<button class="preview-edit-btn" type="button" data-image-edit="zoom-in" title="Zoom in" aria-label="Zoom in">＋</button>' +
              '<button class="preview-edit-btn" type="button" data-image-edit="zoom-out" title="Zoom out" aria-label="Zoom out">－</button>' +
              '<span class="preview-image-size" title="Current">' +
                '<input class="preview-size-input" data-image-size="width" type="number" min="1" step="1" aria-label="Image Width">' +
                '<span>x</span>' +
                '<input class="preview-size-input" data-image-size="height" type="number" min="1" step="1" aria-label="Image Height">' +
              '</span>' +
              '<button class="preview-edit-btn" type="button" data-image-edit="download" title="DownloadLocal" aria-label="DownloadLocal">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">' +
                  '<path d="M12 3v12"></path><path d="M6.5 9.5 12 15l5.5-5.5"></path><path d="M5 17v2.2c0 .9.7 1.6 1.6 1.6h10.8c.9 0 1.6-.7 1.6-1.6V17"></path>' +
                '</svg>' +
              '</button>' +
              '<button class="preview-edit-btn primary" type="button" data-image-edit="save" title="SaveService" aria-label="SaveService">💾</button>' +
              '<div class="preview-edit-hint" aria-live="polite"></div>' +
            '</div>' +
            '<div class="preview-image-shell">'
            + '<button class="preview-nav-btn preview-nav-prev" type="button" data-preview-nav="prev" aria-label=""' + (showNav ? '' : ' hidden') + '>‹</button>'
            + '<img class="preview-image" alt="Image Preview" src="' + url + '">'
            + '<div class="preview-crop-rect" hidden></div>'
            + '<button class="preview-nav-btn preview-nav-next" type="button" data-preview-nav="next" aria-label=""' + (showNav ? '' : ' hidden') + '>›</button>'
            + '</div>';
        }

        win.innerHTML =
          '<div class="preview-head">' +
            '<div class="preview-title">' + titleText + escapedTitle + '</div>' +
            '<div class="preview-head-actions">' +
              '<button class="preview-window-btn" type="button" data-preview-window-action="maximize" title="Maximize" aria-label="Maximize">□</button>' +
              '<button class="preview-close" type="button" title="Close" aria-label="Close">×</button>' +
            '</div>' +
          '</div>' +
          '<div class="preview-body">' + mediaHtml + '</div>';

        previewLayer.appendChild(win);
        centerPreviewWindow(win);
        openedPreviewWindows.set(previewKey, win);

        const mediaVideo = win.querySelector('video');
        if (mediaVideo) {
          const rawVideoFile = decodeURIComponent(String(file || ''));
          bindVideoResume(mediaVideo, opts.local ? ('local:' + rawVideoFile) : rawVideoFile);
          mediaVideo.src = url;
          mediaVideo.play().catch(function () {});

          // Check if video has audio track
          if (!opts.local) {
          checkVideoAudio(rawVideoFile).then(function (probeResult) {
            if (probeResult && probeResult.ok && (!probeResult.has_audio || probeResult.browser_audio_supported === false)) {
              // No audio or unsupported browser audio codec
              var message = 'This video file has no audio track.';
              if (probeResult && probeResult.has_audio && probeResult.browser_audio_supported === false) {
                message = 'Video audio codec ' + (probeResult.audio_codec || 'unknown') + ' is usually not supported by the browser';
              }
              const warning = document.createElement('div');
              warning.style.cssText = 'margin-top: 8px; padding: 8px 10px; background: #fff7e8; border: 1px solid #e3c89d; border-radius: 6px; font-size: 12px; color: #8a5a00; display: flex; align-items: flex-start; gap: 8px;';
              warning.innerHTML = '<span style="flex-shrink: 0; font-weight: 700;">!</span><span>' + escapeHtml(message) + ' Please in progressConfirm</span>';
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
              mediaText.textContent = 'Failed: ' + err.message;
            });
        }

        const closeBtn = win.querySelector('.preview-close');
        const head = win.querySelector('.preview-head');
        const maximizeBtn = win.querySelector('[data-preview-window-action="maximize"]');

        closeBtn.addEventListener('click', function () {
          closePreviewWindow(win, previewKey);
        });

        if (maximizeBtn) {
          maximizeBtn.addEventListener('click', function () {
            togglePreviewWindowMaximize(win);
          });
        }

        const prevNavBtn = win.querySelector('.preview-nav-btn[data-preview-nav="prev"]');
        const nextNavBtn = win.querySelector('.preview-nav-btn[data-preview-nav="next"]');
        if (prevNavBtn) {
          prevNavBtn.addEventListener('click', function () {
            stepImagePreviewWindow(win, -1);
          });
        }
        if (nextNavBtn) {
          nextNavBtn.addEventListener('click', function () {
            stepImagePreviewWindow(win, 1);
          });
        }

        if (kind === 'image' && Array.isArray(opts.gallery) && opts.gallery.length) {
          updateImagePreviewWindow(win, opts.gallery, Number(opts.galleryIndex || 0));
        } else if (kind === 'image') {
          updateImagePreviewWindow(win, [{
            file: rawFileForUrl,
            name: String(name || rawFileForUrl || ''),
            local: !!opts.local
          }], 0);
        }
        if (kind === 'image') {
          initPreviewImageEditing(win);
        }

        win.addEventListener('mousedown', function () {
          bringToFront(win);
        });

        head.addEventListener('mousedown', function (e) {
          if (e.target.closest('.preview-close') || e.target.closest('.preview-window-btn') || win.classList.contains('is-maximized')) {
            return;
          }
          snapshotPreviewWindowRect(win);
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
          if (resumeFile && media.getAttribute('data-resume-media-ready') === '1') {
            clearScheduledVideoResumeSave(resumeFile);
            const ms = Math.max(0, Math.round((Number(media.currentTime) || 0) * 1000));
            saveVideoResumePosition(resumeFile, ms).catch(function () {});
          } else if (resumeFile) {
            clearScheduledVideoResumeSave(resumeFile);
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

      function snapshotPreviewWindowRect(win) {
        if (!win || win.classList.contains('is-maximized')) {
          return;
        }
        const rect = win.getBoundingClientRect();
        win.dataset.restoreLeft = Math.round(rect.left) + 'px';
        win.dataset.restoreTop = Math.round(rect.top) + 'px';
        win.dataset.restoreWidth = Math.round(rect.width) + 'px';
        win.dataset.restoreHeight = Math.round(rect.height) + 'px';
      }

      function syncPreviewWindowButtons(win) {
        if (!win) {
          return;
        }
        const maximizeBtn = win.querySelector('[data-preview-window-action="maximize"]');
        if (!maximizeBtn) {
          return;
        }
        const restoreMode = win.classList.contains('is-maximized');
        maximizeBtn.textContent = restoreMode ? '❐' : '□';
        maximizeBtn.title = restoreMode ? '' : 'Maximize';
        maximizeBtn.setAttribute('aria-label', restoreMode ? '' : 'Maximize');
      }

      function restorePreviewWindowGeometry(win) {
        if (!win) {
          return;
        }
        win.classList.remove('is-maximized');
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
        syncPreviewWindowButtons(win);
      }

      function togglePreviewWindowMaximize(win) {
        if (!win) {
          return;
        }
        if (win.classList.contains('is-maximized')) {
          restorePreviewWindowGeometry(win);
          return;
        }
        snapshotPreviewWindowRect(win);
        win.classList.add('is-maximized');
        win.style.transform = 'none';
        win.style.resize = 'none';
        win.style.left = '22px';
        win.style.top = '22px';
        win.style.width = 'calc(100vw - 44px)';
        win.style.height = 'calc(100vh - 44px)';
        win.style.maxHeight = 'calc(100vh - 44px)';
        syncPreviewWindowButtons(win);
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

      function activateAdminView(name) {
        const isLanguage = name === 'language';
        if (adminStorageTab) {
          adminStorageTab.classList.toggle('active', !isLanguage);
        }
        if (adminLanguageTab) {
          adminLanguageTab.classList.toggle('active', isLanguage);
        }
        if (adminStorageView) {
          adminStorageView.hidden = isLanguage;
        }
        if (adminLanguageView) {
          adminLanguageView.hidden = !isLanguage;
        }
        if (!isLanguage) {
          loadAdminStoragePath();
        }
      }

      function localizedPageUrl(lang) {
        return '/webcool/html/' + (lang === 'en' ? 'en' : 'zh') + '/main.html';
      }

      function applyLanguageSetting() {
        if (!adminLanguageSelect) {
          return;
        }
        const nextLang = adminLanguageSelect.value === 'en' ? 'en' : 'zh';
        try {
          localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLang);
        } catch (_) {}
        if (nextLang === UI_LANG) {
          showStatus('Language setting saved', 'ok');
          return;
        }
        window.location.href = localizedPageUrl(nextLang);
      }

      function redirectToSavedLanguageIfNeeded() {
        let savedLang = '';
        try {
          savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) || '';
        } catch (_) {}
        if (savedLang !== 'en' && savedLang !== 'zh') {
          return;
        }
        const path = window.location.pathname || '';
        const isLocalizedEntry = /\/webcool\/html\/(zh|en)\/main\.html$/.test(path)
          || /\/html\/(zh|en)\/main\.html$/.test(path)
          || /\/(zh|en)\/main\.html$/.test(path);
        if (!isLocalizedEntry && savedLang !== UI_LANG) {
          window.location.replace(localizedPageUrl(savedLang));
        }
      }

      redirectToSavedLanguageIfNeeded();

      function setAdminStorageProgress(visible, percent, message) {
        if (!adminStorageProgress) {
          return;
        }
        adminStorageProgress.hidden = !visible;
        const safePercent = Math.max(0, Math.min(100, Number(percent || 0)));
        if (adminStorageProgressFill) {
          adminStorageProgressFill.style.width = safePercent.toFixed(1) + '%';
        }
        if (adminStorageProgressText) {
          adminStorageProgressText.textContent = safePercent.toFixed(1).replace(/\.0$/, '') + '%';
        }
        if (adminStorageProgressMessage) {
          adminStorageProgressMessage.textContent = String(message || '');
        }
      }

      async function loadAdminStoragePath() {
        if (!adminStoragePath) {
          return;
        }
        try {
          const data = await fetchJson(api.adminStorage);
          currentAdminStoragePath = String(data.path || '');
          adminStoragePath.value = currentAdminStoragePath;
        } catch (err) {
          showStatus('PathFailed: ' + err.message, 'err');
        }
      }

      function stopAdminStorageProgressPolling() {
        if (adminStorageProgressTimer) {
          clearInterval(adminStorageProgressTimer);
          adminStorageProgressTimer = null;
        }
      }

      function pollAdminStorageMigration(taskId) {
        stopAdminStorageProgressPolling();
        return new Promise(function (resolve, reject) {
          async function tick() {
            try {
              const data = await fetchJson(
                api.adminStorageMigrateProgress + '?task_id=' + encodeURIComponent(taskId || '')
              );
              const state = String(data.state || '');
              const message = String(data.message || '');
              const movedFiles = Number(data.moved_files || 0);
              const totalFiles = Number(data.total_files || 0);
              const detail = message + (totalFiles > 0 ? ('（' + movedFiles + '/' + totalFiles + '）') : '');
              setAdminStorageProgress(true, Number(data.progress || 0), detail);
              if (state === 'done') {
                stopAdminStorageProgressPolling();
                setAdminStorageProgress(true, 100, 'MoveDone');
                resolve(data);
              } else if (state === 'failed') {
                stopAdminStorageProgressPolling();
                reject(new Error(data.error || 'PathFailed'));
              }
            } catch (err) {
              stopAdminStorageProgressPolling();
              reject(err);
            }
          }
          adminStorageProgressTimer = setInterval(tick, 800);
          tick();
        });
      }

      async function applyAdminStoragePathChange() {
        if (!adminStoragePath || !adminStorageChooseBtn) {
          return;
        }
        const nextPath = String(adminStoragePath.value || '').trim();
        if (!nextPath) {
          showStatus('Pathcannot cannot be empty', 'err');
          adminStoragePath.value = currentAdminStoragePath;
          return;
        }
        if (nextPath === currentAdminStoragePath) {
          showStatus('Path', 'warn');
          return;
        }
        const confirmed = await askConfirmDialog({
          title: 'ConfirmPath',
          description: 'CurrentPathFileMoveFolder？Choose“”MoveFile，Path',
          confirmText: '，Move',
          cancelText: '',
          danger: false
        });
        if (!confirmed) {
          adminStoragePath.value = currentAdminStoragePath;
          setAdminStorageProgress(false, 0, '');
          showStatus(' Cancel，Path', 'warn');
          return;
        }
        adminStorageChooseBtn.disabled = true;
        adminStoragePath.disabled = true;
        setAdminStorageProgress(true, 0, 'Move...');
        try {
          const startData = await fetchJson(
            api.adminStorageMigrate + '?path=' + encodeURIComponent(nextPath),
            { method: 'POST' }
          );
          await pollAdminStorageMigration(String(startData.task_id || ''));
          await loadAdminStoragePath();
          loadFiles();
          showStatus('Path : ' + currentAdminStoragePath, 'ok');
        } catch (err) {
          adminStoragePath.value = currentAdminStoragePath;
          setAdminStorageProgress(true, 0, 'MoveFailed: ' + err.message);
          showStatus('PathFailed: ' + err.message, 'err');
        } finally {
          adminStorageChooseBtn.disabled = false;
          adminStoragePath.disabled = false;
        }
      }

      function adminStoragePickerUrl(path) {
        const target = String(path || '');
        return target
          ? (api.localDiskList + '?path=' + encodeURIComponent(target))
          : api.localDiskList;
      }

      async function loadAdminStoragePickerPath(path) {
        const data = await fetchJson(adminStoragePickerUrl(path));
        const nodePath = String(data.path || path || '/');
        const dirs = (Array.isArray(data.items) ? data.items : []).filter(function (item) {
          return item && item.directory;
        }).sort(function (a, b) {
          return String((a && a.name) || '').localeCompare(String((b && b.name) || ''), 'zh-CN');
        });
        adminStoragePickerCache.set(nodePath, dirs);
        if (!adminStoragePickerRootPath) {
          adminStoragePickerRootPath = nodePath;
        }
        return nodePath;
      }

      function renderAdminStoragePickerNode(path, level, itemMeta) {
        const textPath = String(path || '/');
        const encodedPath = encodeURIComponent(textPath);
        const dirs = adminStoragePickerCache.get(textPath) || [];
        const isExpanded = adminStoragePickerExpandedPaths.has(textPath);
        const hasCache = adminStoragePickerCache.has(textPath);
        const isActive = adminStoragePickerSelectedPath === textPath;
        const name = itemMeta && itemMeta.name ? String(itemMeta.name) : localDiskBaseName(textPath);
        let html = '<div class="admin-storage-picker-node" data-admin-storage-picker-node="' + escapeHtml(textPath) + '">' +
          '<div class="admin-storage-picker-line' + (isActive ? ' active' : '') + '" style="padding-left:' + (8 + level * 18) + 'px;">' +
            '<button type="button" class="admin-storage-picker-toggle' + (hasCache && !dirs.length ? ' placeholder' : '') + '" data-admin-storage-picker-toggle="' + encodedPath + '" title="ExpandCollapseFolder" aria-label="ExpandCollapseFolder">' +
              (isExpanded && dirs.length ? '▾' : (hasCache && !dirs.length ? '•' : '▸')) +
            '</button>' +
            '<button type="button" class="admin-storage-picker-entry" data-admin-storage-picker-select="' + encodedPath + '" title="' + escapeHtml(textPath) + '">' +
              '<span class="local-folder-icon">📁</span>' +
              '<span class="admin-storage-picker-name">' + escapeHtml(name) + '</span>' +
            '</button>' +
          '</div>';
        if (isExpanded && dirs.length) {
          html += '<div class="admin-storage-picker-children">';
          html += dirs.map(function (item) {
            return renderAdminStoragePickerNode(String(item.path || ''), level + 1, item);
          }).join('');
          html += '</div>';
        }
        html += '</div>';
        return html;
      }

      function renderAdminStoragePicker() {
        if (!adminStoragePickerTree || !adminStoragePickerEmpty) {
          return;
        }
        if (!adminStoragePickerRootPath) {
          adminStoragePickerTree.innerHTML = '';
          adminStoragePickerEmpty.style.display = 'block';
          return;
        }
        adminStoragePickerTree.innerHTML = renderAdminStoragePickerNode(adminStoragePickerRootPath, 0, null);
        adminStoragePickerEmpty.style.display = 'none';
        if (adminStoragePickerPath) {
          adminStoragePickerPath.innerHTML = 'CurrentChoose: <span class="admin-storage-picker-current">'
            + escapeHtml(adminStoragePickerSelectedPath || adminStoragePickerRootPath)
            + '</span>';
        }
      }

      async function openAdminStoragePickerDialog() {
        if (!adminStoragePickerDialog) {
          return;
        }
        try {
          adminStoragePickerRootPath = '';
          adminStoragePickerSelectedPath = '';
          adminStoragePickerCache.clear();
          adminStoragePickerExpandedPaths.clear();
          const rootPath = await loadAdminStoragePickerPath('');
          adminStoragePickerRootPath = rootPath;
          adminStoragePickerSelectedPath = rootPath;
          adminStoragePickerExpandedPaths.add(rootPath);
          renderAdminStoragePicker();
          adminStoragePickerDialog.hidden = false;
          document.body.style.overflow = 'hidden';
        } catch (err) {
          showStatus('LocalFolderFailed: ' + err.message, 'err');
        }
      }

      function closeAdminStoragePickerDialog() {
        if (adminStoragePickerDialog) {
          adminStoragePickerDialog.hidden = true;
          document.body.style.overflow = '';
        }
      }

      async function toggleAdminStoragePickerPath(path) {
        const target = String(path || '');
        if (!target) {
          return;
        }
        if (adminStoragePickerExpandedPaths.has(target) && adminStoragePickerCache.has(target)) {
          adminStoragePickerExpandedPaths.delete(target);
          renderAdminStoragePicker();
          return;
        }
        try {
          await loadAdminStoragePickerPath(target);
          adminStoragePickerExpandedPaths.add(target);
          renderAdminStoragePicker();
        } catch (err) {
          showStatus('ExpandLocalFolderFailed: ' + err.message, 'err');
        }
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
          video.setAttribute('data-resume-media-ready', '1');
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
          if (video.getAttribute('data-resume-closing') === '1'
            || video.getAttribute('data-resume-media-ready') !== '1') {
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
          if (video.getAttribute('data-resume-closing') === '1'
            || video.getAttribute('data-resume-media-ready') !== '1') {
            return;
          }
          const sec = Math.floor(Number(video.currentTime) || 0);
          scheduleSaveVideoResumePosition(key, Math.max(0, sec * 1000));
        });

        video.addEventListener('ended', function () {
          if (video.getAttribute('data-resume-closing') === '1'
            || video.getAttribute('data-resume-media-ready') !== '1') {
            return;
          }
          scheduleSaveVideoResumePosition(key, 0);
        });
      }

      async function loadFiles() {
        try {
          let filesUrl = api.files;
          let activePassword = getFolderPasswordForPath(activeFolderPath);
          if (activeFolderPath && getFolderLockAncestorPath(activeFolderPath) && !activePassword) {
            activeFolderPath = '';
            activePassword = '';
          }
          if (activeFolderPath) {
            filesUrl += '?folder=' + encodeURIComponent(activeFolderPath);
            if (activePassword) {
              filesUrl += '&folder_password=' + encodeURIComponent(activePassword);
            }
          }
          const results = await Promise.all([
            fetchJson(filesUrl),
            fetchJson(folderListUrl())
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
          fileEmpty.textContent = 'Remote DiskFailed: ' + err.message;
          fileEmpty.style.display = 'block';
          renderFolderTree();
          renderTagTree();
          showStatus('Failed: ' + err.message, 'err');
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
              setUploadProgress(percent, 'Uploadin progress ' + percent + '%');
            } else {
              setUploadProgress(0, 'Uploadin progress...');
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
        setUploadProgress(0, 'Upload...');

        const formData = new FormData(uploadForm);
        const uploadPassword = getFolderPasswordForPath(activeFolderPath);
        if (uploadPassword) {
          formData.set('folder_password', uploadPassword);
        }
        try {
          const data = await uploadWithProgress(formData);
          setUploadProgress(100, 'UploadDone 100%');
          showStatus('Upload complete: saved ' + (data.count || 0) + ' files', 'ok');
          uploadForm.reset();
          await loadFiles();

          const videoProbeFails = await verifyUploadedVideos(data.files);
          if (videoProbeFails.length) {
            showManualTranscodePrompt(videoProbeFails);
          }

          setTimeout(hideUploadProgress, 700);
        } catch (err) {
          setUploadProgress(0, 'UploadFailed');
          showStatus('UploadFailed: ' + err.message, 'err');
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
              showStatus('System Trash opened', 'ok');
            })
            .catch(function (err) {
              showStatus('Failed to open system Trash: ' + err.message, 'err');
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

      function openSelectedLocalDiskTagMenu(anchor) {
        const paths = getSelectedLocalDiskFilePaths();
        if (!paths.length) {
          showStatus('Please ChooseTagLocalFile', 'err');
          return;
        }
        openFilesTagMenu(anchor, paths, { local: true }).catch(function (err) {
          showStatus('TagChooseFailed: ' + err.message, 'err');
        });
      }

      if (localDiskBulkTagBtn) {
        localDiskBulkTagBtn.addEventListener('click', function () {
          openSelectedLocalDiskTagMenu(localDiskBulkTagBtn);
        });
      }

      if (localDiskTableBulkTagBtn) {
        localDiskTableBulkTagBtn.addEventListener('click', function () {
          openSelectedLocalDiskTagMenu(localDiskTableBulkTagBtn);
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
        localDiskList.addEventListener('contextmenu', function (e) {
          const fileRow = e.target.closest('[data-local-file-context]');
          if (fileRow && localDiskList.contains(fileRow)) {
            e.preventDefault();
            openFileContextMenu(
              decodeURIComponent(fileRow.getAttribute('data-local-file-context') || ''),
              true,
              fileRow.getAttribute('data-file-locked') === '1',
              fileRow.getAttribute('data-file-video') === '1',
              e.clientX,
              e.clientY
            );
            return;
          }
          const dirRow = e.target.closest('[data-local-dir-context]');
          if (dirRow && localDiskList.contains(dirRow)) {
            e.preventDefault();
            openLocalDirContextMenu(
              decodeURIComponent(dirRow.getAttribute('data-local-dir-context') || ''),
              dirRow.getAttribute('data-local-dir-locked') === '1',
              e.clientX,
              e.clientY
            );
          }
        });
      }

      function handleLocalDiskClickEvent(e) {
        const localDirLockIcon = e.target.closest('.local-dir-lock-inline');
        if (localDirLockIcon) {
          const row = localDirLockIcon.closest('[data-local-dir-context]');
          if (!row) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          const path = decodeURIComponent(row.getAttribute('data-local-dir-context') || '');
          const action = getLocalDirPassword(path) ? 'session-lock' : 'session-unlock';
          handleLocalDirContextAction(action, path).catch(function (err) {
            showStatus('LocalFolderlockFailed: ' + err.message, 'err');
          });
          return;
        }
        const localLockIcon = e.target.closest('.file-lock-inline');
        if (localLockIcon) {
          const row = localLockIcon.closest('[data-local-file-context]');
          if (!row) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          const path = decodeURIComponent(row.getAttribute('data-local-file-context') || '');
          const action = getFilePassword(path, true) ? 'session-lock' : 'session-unlock';
          handleFileContextAction(action, path, true).catch(function (err) {
            showStatus('FilelockFailed: ' + err.message, 'err');
          });
          return;
        }
        const toggleBtn = e.target.closest('.local-disk-tree-caret[data-local-toggle]');
        if (toggleBtn) {
          e.stopPropagation();
          const path = decodeURIComponent(toggleBtn.getAttribute('data-local-toggle') || '');
          const row = toggleBtn.closest('[data-local-dir-context]');
          if (row && row.getAttribute('data-local-dir-locked') === '1' && !getLocalDirPassword(path)) {
            ensureLocalDirUnlocked(path).then(function (ok) {
              if (ok) {
                toggleLocalDiskTreePath(path);
              }
            }).catch(function (err) {
              showStatus('UnlockLocalFolderFailed: ' + err.message, 'err');
            });
            return;
          }
          toggleLocalDiskTreePath(path);
          return;
        }
        const selectInput = e.target.closest('.local-disk-select[data-local-select]');
        if (selectInput) {
          const path = decodeURIComponent(selectInput.getAttribute('data-local-select') || '');
          updateLocalDiskSelection(path, selectInput.checked);
          return;
        }
        const localTagBtn = e.target.closest('.local-file-tag-btn[data-local-tag-file]');
        if (localTagBtn) {
          e.preventDefault();
          e.stopPropagation();
          const path = decodeURIComponent(localTagBtn.getAttribute('data-local-tag-file') || '');
          if (!path) {
            return;
          }
          openFilesTagMenu(localTagBtn, [path], { local: true }).catch(function (err) {
            showStatus('TagChooseFailed: ' + err.message, 'err');
          });
          return;
        }
        const folderBtn = e.target.closest('[data-local-folder]');
        if (folderBtn && !e.target.closest('.local-delete-btn') && !e.target.closest('.local-disk-select') && !e.target.closest('.local-file-tag-btn')) {
          const path = decodeURIComponent(folderBtn.getAttribute('data-local-folder') || '/');
          const row = folderBtn.closest('[data-local-dir-context], tr[data-local-dir-context]');
          if (row && row.getAttribute('data-local-dir-locked') === '1' && !getLocalDirPassword(path)) {
            ensureLocalDirUnlocked(path).then(function (ok) {
              if (ok) {
                loadLocalDisk(path, { resetTreeRoot: !localDiskPathContains(activeLocalDiskTreeRootPath, path) });
              }
            }).catch(function (err) {
              showStatus('UnlockLocalFolderFailed: ' + err.message, 'err');
            });
            return;
          }
          loadLocalDisk(path, { resetTreeRoot: !localDiskPathContains(activeLocalDiskTreeRootPath, path) });
          return;
        }
        const mkdirBtn = e.target.closest('.local-mkdir-btn[data-local-mkdir]');
        if (mkdirBtn) {
          e.stopPropagation();
          const path = decodeURIComponent(mkdirBtn.getAttribute('data-local-mkdir') || '');
          if (!path) { return; }
          const name = window.prompt('Please enterCreate SubfolderName');
          if (name === null) { return; }
          const cleanName = String(name || '').trim();
          if (!cleanName) {
            showStatus('Foldername cannot be empty', 'err');
            return;
          }
          fetchJson(appendLocalDirPassword(api.localDiskMkdir + '?path=' + encodeURIComponent(path) + '&name=' + encodeURIComponent(cleanName), path), { method: 'POST' })
            .then(function () {
              showStatus('Folder Create: ' + cleanName, 'ok');
              loadLocalDisk(path, { resetTreeRoot: !localDiskPathContains(activeLocalDiskTreeRootPath, path) });
            })
            .catch(function (err) {
              showStatus('Create SubfolderFailed: ' + err.message, 'err');
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
            ? (parentRow.querySelector('td:nth-child(2)') && parentRow.querySelector('td:nth-child(2)').textContent === 'Folder')
            : deleteBtn.closest('.local-disk-dir-item') !== null;
          const confirmMsg = isDir
            ? 'ConfirmDeleteLocalFolder: ' + path + ' ？DeleteFolder'
            : 'ConfirmDeleteLocalFile: ' + path + ' ？';
          if (!confirm(confirmMsg)) { return; }
          const deleteLockPath = isDir && getLocalDirPassword(path) ? path : localDiskParentPath(path);
          fetchJson(appendLocalDirPassword(appendFilePassword(api.localDiskDelete + '?path=' + encodeURIComponent(path), path, true), deleteLockPath), { method: 'POST' })
            .then(function () {
              showStatus((isDir ? 'LocalFolder Delete: ' : 'LocalFile Delete: ') + path, 'warn');
              const nextPath = isDir ? localDiskParentPath(path) : (activeLocalDiskPath || '');
              if (isDir) {
                localDiskTreeCache.delete(path);
                expandedLocalDiskTreePaths.delete(path);
              }
              loadLocalDisk(nextPath, { resetTreeRoot: !localDiskPathContains(activeLocalDiskTreeRootPath, nextPath) });
            })
            .catch(function (err) {
              showStatus('DeleteFailed: ' + err.message, 'err');
            });
          return;
        }
        const previewBtn = e.target.closest('.local-preview-btn[data-local-file][data-kind]');
        if (!previewBtn) { return; }
        const path = decodeURIComponent(previewBtn.getAttribute('data-local-file') || '');
        const kind = previewBtn.getAttribute('data-kind') || 'image';
        if (!path) { return; }
        if (kind === 'image') {
          openLocalDiskImagePreview(path, previewBtn.getAttribute('data-local-name') || path);
          return;
        }
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
        if (e.target.closest('.local-disk-select, .local-mkdir-btn, .local-delete-btn, .local-preview-btn, .local-file-tag-btn')) {
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
            const sourceLockPath = getLocalDirPassword(path) ? path : localDiskParentPath(path);
            return fetchJson(
              appendLocalDirPassword(
                appendLocalDirPassword(appendFilePassword(api.localDiskMove
                  + '?path=' + encodeURIComponent(path)
                  + '&target=' + encodeURIComponent(target.path), path, true), sourceLockPath),
                target.path,
                'target_local_dir_password'
              ),
              { method: 'POST' }
            );
          }));
          showStatus(' Move ' + movePaths.length + ' items: ' + target.path, 'ok');
          clearLocalDiskSelection();
          removeLocalDiskTreePaths(movePaths);
          localDiskTreeCache.delete(target.path);
          loadLocalDisk(target.path, { resetTreeRoot: !localDiskPathContains(activeLocalDiskTreeRootPath, target.path) });
        } catch (err) {
          showStatus('MoveFailed: ' + err.message, 'err');
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
        localDiskExplorer.addEventListener('contextmenu', function (e) {
          const fileRow = e.target.closest('[data-local-file-context]');
          if (fileRow && localDiskExplorer.contains(fileRow)) {
            e.preventDefault();
            openFileContextMenu(
              decodeURIComponent(fileRow.getAttribute('data-local-file-context') || ''),
              true,
              fileRow.getAttribute('data-file-locked') === '1',
              fileRow.getAttribute('data-file-video') === '1',
              e.clientX,
              e.clientY
            );
            return;
          }
          const dirRow = e.target.closest('[data-local-dir-context]');
          if (dirRow && localDiskExplorer.contains(dirRow)) {
            e.preventDefault();
            openLocalDirContextMenu(
              decodeURIComponent(dirRow.getAttribute('data-local-dir-context') || ''),
              dirRow.getAttribute('data-local-dir-locked') === '1',
              e.clientX,
              e.clientY
            );
          }
        });
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

      if (tagViewListBtn) {
        tagViewListBtn.addEventListener('click', function () {
          if (!isActiveTagPreviewEnabled()) return;
          if (tagFileViewMode === 'list') return;
          tagFileViewMode = 'list';
          tagViewListBtn.classList.add('active');
          if (tagViewPreviewBtn) tagViewPreviewBtn.classList.remove('active');
          renderFiles(activeSourceFiles);
        });
      }

      if (tagViewPreviewBtn) {
        tagViewPreviewBtn.addEventListener('click', function () {
          if (!isActiveTagPreviewEnabled()) return;
          if (tagFileViewMode === 'preview') return;
          tagFileViewMode = 'preview';
          tagViewPreviewBtn.classList.add('active');
          if (tagViewListBtn) tagViewListBtn.classList.remove('active');
          renderFiles(activeSourceFiles);
        });
      }

      if (tagImagePreviewWrap) {
        tagImagePreviewWrap.addEventListener('click', function (e) {
          const thumb = e.target.closest('.tag-img-thumb[data-thumb-file]');
          if (thumb) {
            const pfile = thumb.getAttribute('data-thumb-file');
            const pname = thumb.getAttribute('data-thumb-name') || '';
            const pindex = Number(thumb.getAttribute('data-thumb-index') || 0);
            if (pfile) {
              openPreview('image', pfile, pname, {
                previewKey: 'tag-gallery:' + String(activeFilterTagId || 'default'),
                gallery: activeTagPreviewImages.slice(),
                galleryIndex: pindex
              });
            }
          }
        });
        tagImagePreviewWrap.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            const thumb = e.target.closest('.tag-img-thumb[data-thumb-file]');
            if (thumb) {
              e.preventDefault();
              const pfile = thumb.getAttribute('data-thumb-file');
              const pname = thumb.getAttribute('data-thumb-name') || '';
              const pindex = Number(thumb.getAttribute('data-thumb-index') || 0);
              if (pfile) {
                openPreview('image', pfile, pname, {
                  previewKey: 'tag-gallery:' + String(activeFilterTagId || 'default'),
                  gallery: activeTagPreviewImages.slice(),
                  galleryIndex: pindex
                });
              }
            }
          }
        });
      }

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

      if (adminStorageTab) {
        adminStorageTab.addEventListener('click', function () {
          activateAdminView('storage');
        });
      }

      if (adminLanguageTab) {
        adminLanguageTab.addEventListener('click', function () {
          activateAdminView('language');
        });
      }

      if (adminLanguageSelect) {
        adminLanguageSelect.value = UI_LANG;
      }

      if (adminLanguageApplyBtn) {
        adminLanguageApplyBtn.addEventListener('click', applyLanguageSetting);
      }

      if (adminStorageBrowseBtn) {
        adminStorageBrowseBtn.addEventListener('click', function () {
          openAdminStoragePickerDialog();
        });
      }

      if (adminStorageChooseBtn) {
        adminStorageChooseBtn.addEventListener('click', function () {
          applyAdminStoragePathChange();
        });
      }

      if (adminStoragePath) {
        adminStoragePath.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            applyAdminStoragePathChange();
          }
        });
      }

      if (adminStoragePickerCancelBtn) {
        adminStoragePickerCancelBtn.addEventListener('click', closeAdminStoragePickerDialog);
      }

      if (adminStoragePickerConfirmBtn) {
        adminStoragePickerConfirmBtn.addEventListener('click', function () {
          if (adminStoragePath && adminStoragePickerSelectedPath) {
            adminStoragePath.value = adminStoragePickerSelectedPath;
          }
          closeAdminStoragePickerDialog();
        });
      }

      if (adminStoragePickerDialog) {
        adminStoragePickerDialog.addEventListener('click', function (e) {
          if (e.target.closest('[data-admin-storage-picker-close]')) {
            closeAdminStoragePickerDialog();
          }
        });
      }

      if (adminStoragePickerTree) {
        adminStoragePickerTree.addEventListener('click', function (e) {
          const toggle = e.target.closest('[data-admin-storage-picker-toggle]');
          if (toggle) {
            const path = decodeURIComponent(toggle.getAttribute('data-admin-storage-picker-toggle') || '');
            toggleAdminStoragePickerPath(path);
            return;
          }
          const entry = e.target.closest('[data-admin-storage-picker-select]');
          if (!entry) {
            return;
          }
          adminStoragePickerSelectedPath = decodeURIComponent(entry.getAttribute('data-admin-storage-picker-select') || '');
          renderAdminStoragePicker();
        });
      }

      if (reloadBtn) {
        reloadBtn.addEventListener('click', async function () {
          resetStatus();
          try {
            await fetchJson(api.reloadTpl);
            showStatus(' Refresh', 'warn');
          } catch (err) {
            showStatus('RefreshFailed: ' + err.message, 'err');
          }
        });
      }

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
          return;
        }

        const confirmBtn = e.target.closest('.transcode-confirm-btn[data-confirm-transcode]');
        if (confirmBtn && !confirmBtn.hidden) {
          const encoded = confirmBtn.getAttribute('data-confirm-transcode');
          if (encoded) {
            dismissTranscodeItem(encoded);
          }
        }
      });

      fileList.addEventListener('click', async function (e) {
        if (e.target.closest('.file-select-input')) {
          return;
        }

        const fileLockIcon = e.target.closest('.file-lock-inline');
        if (fileLockIcon) {
          const node = fileLockIcon.closest('[data-file-context]');
          if (!node) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          const path = decodeURIComponent(node.getAttribute('data-file-context') || '');
          const local = node.getAttribute('data-file-local') === '1';
          const action = getFilePassword(path, local) ? 'session-lock' : 'session-unlock';
          try {
            await handleFileContextAction(action, path, local);
          } catch (err) {
            showStatus('FilelockFailed: ' + err.message, 'err');
          }
          return;
        }

        const quickTagBtn = e.target.closest('.file-tag-quick-btn[data-tag-file]');
        if (quickTagBtn) {
          e.preventDefault();
          e.stopPropagation();
          const fileName = decodeURIComponent(quickTagBtn.getAttribute('data-tag-file') || '');
          try {
            await openFileTagMenu(quickTagBtn, fileName);
          } catch (err) {
            showStatus('TagChooseFailed: ' + err.message, 'err');
          }
          return;
        }

        const localPreview = e.target.closest('.local-preview-btn[data-local-file][data-kind]');
        if (localPreview) {
          const path = decodeURIComponent(localPreview.getAttribute('data-local-file') || '');
          const kind = localPreview.getAttribute('data-kind') || 'image';
          const name = localPreview.getAttribute('data-local-name') || path;
          if (kind === 'image') {
            openCurrentFileImagePreview(path, name);
            return;
          }
          openPreview(kind, encodeURIComponent(path), name, {
            local: true,
            url: localDiskDownloadUrl(path),
            previewKey: 'local:' + path
          });
          return;
        }

        const preview = e.target.closest('.preview-btn');
        if (preview) {
          const pfile = preview.getAttribute('data-preview-file');
          const pname = preview.getAttribute('data-preview-name') || '';
          if (pfile) {
            openCurrentFileImagePreview(decodeURIComponent(pfile), pname);
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
      if (!confirm('ConfirmRestoreFile: ' + restoreName + ' ？Restore to original path; conflicts will be renamed automatically')) {
      return;
      }
      resetStatus();
      try {
      const result = await fetchJson(withFolderPassword(api.restore + '?file=' + restoreFile, activeFolderPath), { method: 'POST' });
      const targetPath = String((result && result.path) || '');
      showStatus(' Restore: ' + restoreName + (targetPath ? (' -> ' + targetPath) : ''), 'ok');
      await loadFiles();
      } catch (err) {
      showStatus('RestoreFailed: ' + err.message, 'err');
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
          if (!confirm('ConfirmFile' + name + 'CurrentTagin progress？Tagreference，DeleteFile')) {
            return;
          }

          resetStatus();
          try {
            const ok = await unbindFileFromTag(activeTagId, name, { local: btn.getAttribute('data-local-tag-file') === '1' });
            if (!ok) {
              showStatus('referenceFailed: ', 'err');
              return;
            }
            await showFilesForTag(activeTagId);
            showStatus(' Tagreference: ' + name, 'warn');
          } catch (err) {
            showStatus('referenceFailed: ' + err.message, 'err');
          }
          return;
        }

        const isRecycleMode = isRecycleFolderPath(activeFolderPath);
        const itemRecord = getFileRecordByPath(name);
        const itemLabel = itemRecord && itemRecord.directory ? 'Folder' : 'File';
        const confirmText = isRecycleMode
          ? ('ConfirmPermanently Delete' + itemLabel + ': ' + name + ' ？This cannot be undone')
          : ('ConfirmDeleteFile: ' + name + ' ？Move to Trash');
        if (!confirm(confirmText)) {
          return;
        }

        resetStatus();
        try {
          await fetchJson(appendFilePassword(withFolderPassword(api.del + '?file=' + file, parentFolderPathFromFilePath(name)), name, false));
          showStatus(isRecycleMode ? (' Permanently Delete' + itemLabel + ': ' + name) : (' Move to Trash: ' + name), 'warn');
          await loadFiles();
        } catch (err) {
          showStatus('DeleteFailed: ' + err.message, 'err');
        }
      });

      fileList.addEventListener('contextmenu', function (e) {
        const cell = e.target.closest('[data-file-context]');
        if (!cell || !fileList.contains(cell)) {
          return;
        }
        e.preventDefault();
        openFileContextMenu(
          decodeURIComponent(cell.getAttribute('data-file-context') || ''),
          cell.getAttribute('data-file-local') === '1',
          cell.getAttribute('data-file-locked') === '1',
          cell.getAttribute('data-file-video') === '1',
          e.clientX,
          e.clientY
        );
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
          const actionLabel = activeTagId ? 'remove' : (isRecycleMode ? 'restore' : 'delete');
          const confirmText = activeTagId
            ? ('Remove ' + fileNames.length + ' selected files from the current tag? This only removes tag references and will not delete files.')
            : (isRecycleMode
              ? ('Restore ' + fileNames.length + ' selected files to their original paths? Conflicts will be renamed automatically.')
              : ('Delete ' + fileNames.length + ' selected files by moving them to Trash?'));
          if (!confirm(confirmText)) {
            return;
          }

          resetStatus();
          let completedCount = 0;
          try {
            if (activeTagId) {
              for (let i = 0; i < fileNames.length; i += 1) {
                const ok = await unbindFileFromTag(activeTagId, fileNames[i], { local: isCurrentFileLocal(fileNames[i]) });
                if (!ok) {
                  throw new Error('');
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
                await fetchJson(appendFilePassword(withFolderPassword(api.del + '?file=' + encodeURIComponent(fileNames[i]), parentFolderPathFromFilePath(fileNames[i])), fileNames[i], false));
                completedCount += 1;
              }
              fileNames.forEach(function (name) {
                selectedFileNames.delete(name);
              });
              await loadFiles();
            }

            showStatus('Bulk ' + actionLabel + ' completed for ' + completedCount + ' files', activeTagId ? 'warn' : 'warn');
          } catch (err) {
            if (completedCount > 0) {
              if (activeTagId) {
                await showFilesForTag(activeTagId);
              } else {
                await loadFiles();
              }
              showStatus('Bulk ' + actionLabel + ' failed after processing ' + completedCount + ' files: ' + err.message, 'err');
              return;
            }
            showStatus('Bulk ' + actionLabel + ' failed: ' + err.message, 'err');
          }
        });
      }

      if (fileBulkTagAction) {
        fileBulkTagAction.addEventListener('click', async function () {
          const fileNames = getSelectedVisibleFileNames();
          if (!fileNames.length) {
            showStatus('Please ChooseTagFile', 'err');
            return;
          }
          try {
            await openFilesTagMenu(fileBulkTagAction, fileNames);
          } catch (err) {
            showStatus('TagChooseFailed: ' + err.message, 'err');
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

          const selectedTypes = summarizeSelectedFileTypes(fileNames);
          const confirmText = selectedTypes.folderCount > 0
            ? ('Permanently delete ' + fileNames.length + ' selected ' + selectedTypes.label + '? Folders and all their contents will be deleted. This cannot be undone.')
            : ('Permanently delete ' + fileNames.length + ' selected files? This cannot be undone.');
          if (!confirm(confirmText)) {
            return;
          }

          resetStatus();
          let completedCount = 0;
          try {
            for (let i = 0; i < fileNames.length; i += 1) {
              await fetchJson(appendFilePassword(withFolderPassword(api.del + '?file=' + encodeURIComponent(fileNames[i]), parentFolderPathFromFilePath(fileNames[i])), fileNames[i], false));
              completedCount += 1;
            }
            fileNames.forEach(function (name) {
              selectedFileNames.delete(name);
            });
            await loadFiles();
            showStatus('Permanently deleted ' + completedCount + ' ' + selectedTypes.label, 'warn');
          } catch (err) {
            if (completedCount > 0) {
              await loadFiles();
              showStatus('Permanent delete failed after processing ' + completedCount + ' files: ' + err.message, 'err');
              return;
            }
            showStatus('Permanent delete failed: ' + err.message, 'err');
          }
        });
      }

      if (folderCreateBtn) {
        folderCreateBtn.addEventListener('click', async function () {
          try {
            await createFolderAtCurrentPath();
            await loadFiles();
          } catch (err) {
            showStatus('CreateFolderFailed: ' + err.message, 'err');
          }
        });
      }

      if (folderDeleteBtn) {
        folderDeleteBtn.addEventListener('click', async function () {
          try {
            await deleteCurrentFolder();
            await loadFiles();
          } catch (err) {
            showStatus('DeleteFolderFailed: ' + err.message, 'err');
          }
        });
      }

      if (folderRestoreBtn) {
        folderRestoreBtn.addEventListener('click', async function () {
          try {
            await restoreCurrentRecycleFolder();
          } catch (err) {
            showStatus('Restore FolderFailed: ' + err.message, 'err');
          }
        });
      }

      if (folderTree) {
        folderTree.addEventListener('click', async function (e) {
          if (e.target.closest('.folder-rename-input')) {
            return;
          }
          const lockToggle = e.target.closest('.folder-lock-icon.unlocked[data-folder-lock-toggle]');
          if (lockToggle) {
            e.preventDefault();
            e.stopPropagation();
            try {
              await relockFolderInSession(lockToggle.getAttribute('data-folder-lock-toggle') || '');
            } catch (err) {
              showStatus('locked againFailed: ' + err.message, 'err');
            }
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
            const wasUnlocked = isFolderUnlockedInSession(path);
            if (!(await ensureFolderUnlocked(path))) {
              return;
            }
            activeFolderPath = path;
            ensureFolderPathExpanded(activeFolderPath);
            if (!wasUnlocked && getFolderPasswordForPath(path)) {
              await loadFiles();
            }
            startFolderRename(path);
            renderFiles(activeSourceFiles);
            return;
          }
          if (!(await ensureFolderUnlocked(path))) {
            return;
          }
          activeFolderPath = path;
          selectFolderPath(path, e.shiftKey);
          ensureFolderPathExpanded(activeFolderPath);
          await loadFiles();
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
          if (!folderPath || isRecycleFolderPath(folderPath)) {
            e.preventDefault();
            return;
          }
          const dragPaths = getFolderDragPaths(folderPath);
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', folderPath);
          e.dataTransfer.setData('application/webcool-folder-list', JSON.stringify(dragPaths));
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
              const summary = isRecycleRootFolderPath(targetFolder)
                ? await moveFoldersToRecycle(folderPaths)
                : await moveFoldersToFolder(folderPaths, targetFolder);
              if (summary.cancelled) {
                return;
              }
              let message = isRecycleRootFolderPath(targetFolder)
                ? (summary.movedCount > 1 ? ('Moved ' + summary.movedCount + ' folders to Trash') : 'Folder moved to Trash')
                : (summary.movedCount > 1 ? ('Moved ' + summary.movedCount + ' folders') : 'Folder moved');
              if (summary.ignoredCount > 0) {
                message += '，  ' + summary.ignoredCount + ' itemsFolder';
              }
              showStatus(message, isRecycleRootFolderPath(targetFolder) ? 'warn' : 'ok');
            } catch (err) {
              showStatus((isRecycleRootFolderPath(targetFolder) ? 'Move to TrashFailed: ' : 'MoveFolderFailed: ') + err.message, 'err');
            }
            return;
          }
          if (!fileNames.length) {
            return;
          }
          try {
            await moveFilesToFolder(fileNames, targetFolder);
          } catch (err) {
            showStatus('MoveFileFailed: ' + err.message, 'err');
          }
        });
      }

      if (filesTagToggleBtn) {
        filesTagToggleBtn.addEventListener('click', async function () {
          const rootName = await askTagName({
            title: 'CreateTag',
            description: 'Tag',
            placeholder: 'Please enterTagName'
          });
          if (rootName === null) {
            return;
          }
          const result = await addTagNode('', rootName);
          if (!result.ok) {
            showStatus('CreateTagFailed: ' + result.message, 'err');
            return;
          }
          await loadTagTreeState();
          renderTagTree();
          showStatus('Tag Create', 'ok');
        });
      }

      if (tagManager) {
        tagManager.addEventListener('click', async function (e) {
          if (e.target.closest('.tag-rename-input')) {
            return;
          }
          const tagLockIcon = e.target.closest('.tag-lock-inline[data-tag-lock-toggle]');
          if (tagLockIcon) {
            e.preventDefault();
            e.stopPropagation();
            const tagId = tagLockIcon.getAttribute('data-tag-lock-toggle') || '';
            const action = getTagPassword(tagId) ? 'session-lock' : 'session-unlock';
            try {
              await handleTagLockAction(action, tagId);
            } catch (err) {
              showStatus('TaglockFailed: ' + err.message, 'err');
            }
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
                if (!(await ensureTagUnlocked(tagId))) {
                  return;
                }
                await showFilesForTag(tagId);
              }
            } catch (err) {
              showStatus('TagFileFailed: ' + err.message, 'err');
            }
            return;
          }

          const deleteBtn = e.target.closest('.tag-inline-btn[data-tag-delete]');
          if (deleteBtn) {
            e.stopPropagation();
            const tagId = deleteBtn.getAttribute('data-tag-delete') || '';
            const meta = findTagMetaById(tagId);
            if (meta && isProtectedRestrictedRootTag(meta.node, meta.level)) {
              showStatus('TagcannotDelete', 'err');
              renderTagTree();
              return;
            }
            if (!confirm('ConfirmDeleteTagNodeNode？DeleteTagreference，DeleteFile')) {
              return;
            }
            const removedNode = await removeTagNode(tagId);
            if (!removedNode || removedNode.ok === false) {
              showStatus('DeleteTagFailed: ' + ((removedNode && removedNode.error) ? removedNode.error : 'Node'), 'err');
              return;
            }
            expandedTagNodeIds.delete(tagId);
            if (activeFilterTagId === tagId) {
              clearTagFileFilter();
            }
            await loadTagTreeState();
            renderTagTree();
            showStatus('TagNode Delete（DeleteFile）', 'warn');
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
              title: 'CreateTag',
              description: 'CurrentNodeTag',
              placeholder: 'Please enterTagName'
            });
            if (childName === null) {
              return;
            }
            const addResult = await addTagNode(tagId, childName);
            if (!addResult.ok) {
              showStatus('CreateTagFailed: ' + addResult.message, 'err');
              return;
            }
            expandedTagNodeIds.add(tagId);
            await loadTagTreeState();
            renderTagTree();
            showStatus('Tag Create', 'ok');
            return;
          }

          const nodeToggleBtn = e.target.closest('.tag-node-toggle[data-tag-id]');
          if (nodeToggleBtn) {
            const tagId = nodeToggleBtn.getAttribute('data-tag-id') || '';

            const meta = findTagMetaById(tagId);
            if (!meta || !meta.node) {
              showStatus('Node does not exist or may have been deleted', 'err');
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
              showStatus('referenceFailed: ', 'err');
              return;
            }
            await loadTagTreeState();
            renderTagTree();
            if (activeFilterTagId === tagId) {
              await showFilesForTag(tagId);
            }
            showStatus('File reference', 'warn');
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
          const tagNodeEl = e.target.closest('.tag-node[data-tag-id]');
          const tagNameEl = e.target.closest('.tag-node-name[data-tag-id], .tag-lock-inline[data-tag-lock-toggle]');
          if (!tagNameEl) {
            closeFileContextMenu();
            closeAudioTagContextMenu();
            return;
          }
          const tagId = tagNameEl.getAttribute('data-tag-id') || tagNameEl.getAttribute('data-tag-lock-toggle') || '';
          const meta = findTagMetaById(tagId);
          const isAudioConstraint = !!(tagId && getTagFileTypeConstraint(tagId) === 'audio');
          const isLockIconClick = !!e.target.closest('.tag-lock-inline[data-tag-lock-toggle]');
          if (isLockIconClick) {
            if (meta && canLockTagNode(meta.node, meta.level)) {
              e.preventDefault();
              e.stopPropagation();
              openTagLockContextMenu(tagId, !!meta.node.locked, e.clientX, e.clientY);
            }
            return;
          }
          if (!tagId || !isAudioConstraint || !tagNodeEl) {
            if (meta && canLockTagNode(meta.node, meta.level)) {
              e.preventDefault();
              e.stopPropagation();
              openTagLockContextMenu(tagId, !!meta.node.locked, e.clientX, e.clientY);
              return;
            }
            closeFileContextMenu();
            closeAudioTagContextMenu();
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          const lockInfo = (meta && canLockTagNode(meta.node, meta.level))
            ? { locked: !!meta.node.locked }
            : null;
          openAudioTagContextMenu(tagId, String(tagNameEl.textContent || '').trim(), e.clientX, e.clientY, lockInfo);
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
            showStatus('referenceFailed: ' + canBindFileToTagOnClient(tagId, invalidFile).message, 'err');
            return;
          }
          const result = await bindFilesToTag(tagId, fileNames);
          if (!result.ok) {
            showStatus('referenceFailed: ' + result.message, 'err');
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
            ? ('Added ' + fileNames.length + ' files to the tag by dragging')
            : 'Added file to the tag by dragging', 'ok');
        });
      }

      document.addEventListener('click', function (e) {
        const quickTagItem = e.target.closest('.quick-tag-item[data-quick-tag-id]');
        if (quickTagItem && activeFileTagMenu && activeFileTagMenu.contains(quickTagItem)) {
          const tagId = quickTagItem.getAttribute('data-quick-tag-id') || '';
          const isLocalTagFiles = activeFileTagMenu.getAttribute('data-quick-tag-local') === '1';
          const fileNames = String(activeFileTagMenu.getAttribute('data-quick-tag-files') || '')
            .split('\n')
            .map(function (name) { return String(name || ''); })
            .filter(Boolean);
          closeFileTagMenu();
          const check = canBindFilesToTagOnClient(tagId, fileNames);
          if (!check.ok) {
            showStatus('Failed to add tag: ' + check.message, 'err');
            return;
          }
          bindFilesToTag(tagId, fileNames, { local: isLocalTagFiles }).then(async function (result) {
            if (!result.ok) {
              showStatus('Failed to add tag: ' + result.message, 'err');
              return;
            }
            await loadTagTreeState();
            if (activeFilterTagId === tagId) {
              await showFilesForTag(tagId);
            } else {
              renderTagTree();
            }
            showStatus(fileNames.length > 1 ? ('Added ' + fileNames.length + ' files to the tag') : 'File added to the tag', 'ok');
          }).catch(function (err) {
            showStatus('Failed to add tag: ' + err.message, 'err');
          });
          return;
        }

        const folderMenuItem = e.target.closest('.folder-context-item[data-folder-menu-action]');
        if (folderMenuItem && activeFolderContextMenu && activeFolderContextMenu.contains(folderMenuItem)) {
          const menu = activeFolderContextMenu;
          const action = folderMenuItem.getAttribute('data-folder-menu-action') || '';
          const path = menu.getAttribute('data-folder-path') || '';
          closeFolderContextMenu();
          handleFolderContextAction(action, path).catch(function (err) {
            showStatus('FolderFailed: ' + err.message, 'err');
          });
          return;
        }
        const fileMenuItem = e.target.closest('.folder-context-item[data-file-menu-action]');
        if (fileMenuItem && activeFileContextMenu && activeFileContextMenu.contains(fileMenuItem)) {
          const menu = activeFileContextMenu;
          const action = fileMenuItem.getAttribute('data-file-menu-action') || '';
          const path = menu.getAttribute('data-file-path') || '';
          const local = menu.getAttribute('data-file-local') === '1';
          closeFileContextMenu();
          handleFileContextAction(action, path, local).catch(function (err) {
            showStatus('FilelockFailed: ' + err.message, 'err');
          });
          return;
        }
        const localDirMenuItem = e.target.closest('.folder-context-item[data-local-dir-menu-action]');
        if (localDirMenuItem && activeFileContextMenu && activeFileContextMenu.contains(localDirMenuItem)) {
          const menu = activeFileContextMenu;
          const action = localDirMenuItem.getAttribute('data-local-dir-menu-action') || '';
          const path = menu.getAttribute('data-local-dir-path') || '';
          closeFileContextMenu();
          handleLocalDirContextAction(action, path).catch(function (err) {
            showStatus('LocalFolderlockFailed: ' + err.message, 'err');
          });
          return;
        }
        const tagLockMenuItem = e.target.closest('.folder-context-item[data-tag-lock-action]');
        if (tagLockMenuItem && activeFileContextMenu && activeFileContextMenu.contains(tagLockMenuItem)) {
          const menu = activeFileContextMenu;
          const action = tagLockMenuItem.getAttribute('data-tag-lock-action') || '';
          const tagId = menu.getAttribute('data-tag-lock-id') || '';
          closeFileContextMenu();
          closeAudioTagContextMenu();
          handleTagLockAction(action, tagId).catch(function (err) {
            showStatus('TaglockFailed: ' + err.message, 'err');
          });
          return;
        }
        if (activeFolderContextMenu && !e.target.closest('.folder-context-menu')) {
          closeFolderContextMenu();
        }
        if (activeFileContextMenu && !e.target.closest('.file-context-menu')) {
          closeFileContextMenu();
        }

        if (activeAudioTagContextMenu && !e.target.closest('.tag-context-menu')) {
          closeAudioTagContextMenu();
        }

        if (activeFileTagMenu && !e.target.closest('.quick-tag-menu') && !e.target.closest('.file-tag-quick-btn')) {
          closeFileTagMenu();
        }

        if (tagDialog && !tagDialog.hidden) {
          const closeTarget = e.target.closest('[data-tag-dialog-close="1"]');
          if (closeTarget) {
            closeTagDialog(null);
            return;
          }
        }

        if (lockDialog && !lockDialog.hidden) {
          const closeTarget = e.target.closest('[data-lock-dialog-close="1"]');
          if (closeTarget) {
            closeLockDialog(null);
            return;
          }
        }

        if (confirmDialog && !confirmDialog.hidden) {
          const closeTarget = e.target.closest('[data-confirm-dialog-close="1"]');
          if (closeTarget) {
            closeConfirmDialog(false);
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

      if (lockDialogForm) {
        lockDialogForm.addEventListener('submit', async function (e) {
          e.preventDefault();
          if (!activeLockDialogState) {
            return;
          }
          const password = lockDialogInput ? lockDialogInput.value : '';
          if (!password) {
            setLockDialogError('Please enterlock password');
            if (lockDialogInput) {
              lockDialogInput.focus();
            }
            return;
          }
          setLockDialogError('');
          if (lockDialogConfirmBtn) {
            lockDialogConfirmBtn.disabled = true;
            lockDialogConfirmBtn.textContent = 'in progress...';
          }
          try {
            if (activeLockDialogState.onSubmit) {
              await activeLockDialogState.onSubmit(password);
            }
            closeLockDialog(password);
          } catch (err) {
            showStatus(activeLockDialogState.statusErrorMessage || 'UnlockFailed: wrong password or verification failed', 'err');
            setLockDialogError(activeLockDialogState.errorMessage || 'wrong password or verification failed，Please try again');
            if (lockDialogInput) {
              lockDialogInput.focus();
              lockDialogInput.select();
            }
          } finally {
            if (lockDialogConfirmBtn) {
              lockDialogConfirmBtn.disabled = false;
              lockDialogConfirmBtn.textContent = 'Confirm';
            }
          }
        });
      }

      if (lockDialogCancelBtn) {
        lockDialogCancelBtn.addEventListener('click', function () {
          closeLockDialog(null);
        });
      }

      if (confirmDialogCancelBtn) {
        confirmDialogCancelBtn.addEventListener('click', function () {
          closeConfirmDialog(false);
        });
      }

      if (confirmDialogConfirmBtn) {
        confirmDialogConfirmBtn.addEventListener('click', function () {
          closeConfirmDialog(true);
        });
      }

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && confirmDialog && !confirmDialog.hidden) {
          e.preventDefault();
          closeConfirmDialog(false);
          return;
        }
        if (e.key === 'Escape' && adminStoragePickerDialog && !adminStoragePickerDialog.hidden) {
          e.preventDefault();
          closeAdminStoragePickerDialog();
          return;
        }
        if (e.key === 'Escape' && lockDialog && !lockDialog.hidden) {
          e.preventDefault();
          closeLockDialog(null);
          return;
        }
        if (e.key === 'Escape' && activeAudioTagContextMenu) {
          e.preventDefault();
          closeAudioTagContextMenu();
          return;
        }
        if (e.key === 'Escape' && tagDialog && !tagDialog.hidden) {
          e.preventDefault();
          closeTagDialog(null);
          return;
        }
        if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !e.target.closest('input, textarea, select')) {
          const imageWin = getTopImagePreviewWindow();
          if (imageWin) {
            e.preventDefault();
            stepImagePreviewWindow(imageWin, e.key === 'ArrowLeft' ? -1 : 1);
          }
        }
      });

      document.addEventListener('scroll', function (e) {
        closeAudioTagContextMenu();
        if (activeFileTagMenu && activeFileTagMenu.contains(e.target)) {
          return;
        }
        closeFileTagMenu();
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
          showStatus('Audio PlaybackFailed: ' + err.message, 'err');
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
