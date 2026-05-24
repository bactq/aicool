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
        return path ? path : t('根目录');
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
        const params = [];
        if (remoteDiskShowHidden && remoteDiskShowHidden.checked) {
          params.push('show_hidden=1');
        }
        if (entries.length) {
          params.push('unlock_count=' + encodeURIComponent(String(entries.length)));
        }
        let url = api.folders + (params.length ? ('?' + params.join('&')) : '');
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
          title: t('解锁目录'),
          description: t('请输入目录「') + lockedPath + t('」的锁密码。'),
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
          return '<span class="folder-lock-icon unlocked" title="' + escapeHtml(t('点击重新加锁')) + '" aria-label="' + escapeHtml(t('点击重新加锁')) + '" data-folder-lock-toggle="' + escapeHtml(path) + '"><span class="folder-lock-shackle"></span><span class="folder-lock-body"></span></span>';
        }
        return '<span class="folder-lock-icon" title="' + escapeHtml(t('已加锁')) + '" aria-label="' + escapeHtml(t('已加锁')) + '"><span class="folder-lock-shackle"></span><span class="folder-lock-body"></span></span>';
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

      function openFileContextMenu(path, local, locked, isVideo, clientX, clientY, options) {
        closeFileContextMenu();
        closeFolderContextMenu();
        const filePath = String(path || '');
        if (!filePath) {
          return;
        }
        const opts = options || {};
        const isUnlocked = !!getFilePassword(filePath, local);
        const menu = document.createElement('div');
        menu.className = 'folder-context-menu file-context-menu';
        menu.setAttribute('data-file-path', filePath);
        menu.setAttribute('data-file-local', local ? '1' : '0');
        menu.setAttribute('data-local-disk-list', opts.localDiskList ? '1' : '0');
        const selectedPaths = Array.isArray(opts.selectedPaths) ? opts.selectedPaths.map(function (item) { return String(item || ''); }).filter(Boolean) : [filePath];
        const isMultiLocal = !!(local && opts.localDiskList && selectedPaths.length > 1);
        const isMultiRemote = !!(!local && opts.remoteList && selectedPaths.length > 1);
        const isMultiList = isMultiLocal || isMultiRemote;
        menu.setAttribute('data-file-paths', selectedPaths.join('\n'));
        let html = '';
        if (opts.remoteList || opts.localDiskList) {
          if (!isMultiList) {
            html += '<button type="button" class="folder-context-item" data-file-menu-action="summary">' + t('摘要') + '</button>';
            html += '<button type="button" class="folder-context-item" data-file-menu-action="download">' + t('下载') + '</button>';
          }
          if (local && opts.localDiskList) {
            html += '<button type="button" class="folder-context-item" data-file-menu-action="copy-local">' + t('拷贝') + '</button>';
            html += '<button type="button" class="folder-context-item" data-file-menu-action="upload-local">' + t('上传') + '</button>';
          }
          if (!local && opts.remoteList) {
            html += '<button type="button" class="folder-context-item" data-file-menu-action="copy-remote">' + t('拷贝') + '</button>';
          }
          if (!isMultiList && !opts.recycleMode && (!local || opts.localRename)) {
            html += '<button type="button" class="folder-context-item" data-file-menu-action="rename">' + t('改名') + '</button>';
          }
          html += '<button type="button" class="folder-context-item" data-file-menu-action="delete">' + t(opts.deleteLabel || (opts.tagMode ? '移除' : '删除')) + '</button>';
        }
        if (!isMultiList && locked) {
          html += '<button type="button" class="folder-context-item" data-file-menu-action="' + (isUnlocked ? 'session-lock' : 'session-unlock') + '">' + t(isUnlocked ? '加锁' : '解锁') + '</button>';
          html += '<button type="button" class="folder-context-item" data-file-menu-action="remove-lock">' + t('去锁') + '</button>';
        } else if (!isMultiList) {
          html += '<button type="button" class="folder-context-item" data-file-menu-action="lock">' + t('加锁') + '</button>';
        }
        if (!isMultiList && local && isVideo) {
          html += '<button type="button" class="folder-context-item" data-file-menu-action="open-local-player">' + t('使用本地播放器播放') + '</button>';
          html += '<button type="button" class="folder-context-item" data-file-menu-action="choose-local-player">' + t('选择本地播放器') + '</button>';
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
        return '<span class="folder-lock-icon file-lock-inline local-dir-lock-inline' + (unlocked ? ' unlocked' : '') + '" title="' + escapeHtml(t(unlocked ? '点击重新加锁' : '点击解锁')) + '" aria-label="' + escapeHtml(t(unlocked ? '点击重新加锁' : '点击解锁')) + '"><span class="folder-lock-shackle"></span><span class="folder-lock-body"></span></span>';
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
        menu.setAttribute('data-local-dir-locked', locked ? '1' : '0');
        const selectedDirs = getSelectedLocalDiskDirPaths();
        const actionDirs = selectedDirs.indexOf(dirPath) >= 0 ? selectedDirs : [dirPath];
        const isMultiDir = actionDirs.length > 1;
        menu.setAttribute('data-local-dir-paths', actionDirs.join('\n'));
        let html = '';
        if (!isMultiDir && localDiskClipboardPaths.length) {
          html += '<button type="button" class="folder-context-item" data-local-dir-menu-action="paste">' + t('粘贴') + '</button>';
        }
        html += '<button type="button" class="folder-context-item" data-local-dir-menu-action="copy">' + t('拷贝') + '</button>';
        if (!isMultiDir) {
          html += '<button type="button" class="folder-context-item" data-local-dir-menu-action="create">' + t('新建子目录') + '</button>';
        }
        html += '<button type="button" class="folder-context-item" data-local-dir-menu-action="upload">' + t('上传') + '</button>';
        if (!isMultiDir) {
          html += '<button type="button" class="folder-context-item" data-local-dir-menu-action="rename">' + t('改名') + '</button>';
        }
        html += '<button type="button" class="folder-context-item" data-local-dir-menu-action="delete">' + t('删除') + '</button>';
        if (!isMultiDir && locked) {
          html += '<button type="button" class="folder-context-item" data-local-dir-menu-action="' + (unlocked ? 'session-lock' : 'session-unlock') + '">' + t(unlocked ? '加锁' : '解锁') + '</button>';
          html += '<button type="button" class="folder-context-item" data-local-dir-menu-action="remove-lock">' + t('去锁') + '</button>';
        } else if (!isMultiDir) {
          html += '<button type="button" class="folder-context-item" data-local-dir-menu-action="lock">' + t('加锁') + '</button>';
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
          ? '<button type="button" class="folder-context-item" data-folder-menu-action="' + (unlockedFolderPasswords.has(path) ? 'session-lock' : 'session-unlock') + '">' + t(unlockedFolderPasswords.has(path) ? '加锁' : '解锁') + '</button>' +
            '<button type="button" class="folder-context-item" data-folder-menu-action="remove-lock">' + t('去锁') + '</button>'
          : '<button type="button" class="folder-context-item" data-folder-menu-action="lock">' + t('加锁') + '</button>';
        menu.innerHTML =
          (remoteDiskClipboardPath ? '<button type="button" class="folder-context-item" data-folder-menu-action="paste">' + t('粘贴') + '</button>' : '') +
          '<button type="button" class="folder-context-item" data-folder-menu-action="copy">' + t('拷贝') + '</button>' +
          '<button type="button" class="folder-context-item" data-folder-menu-action="create">' + t('新建子目录') + '</button>' +
          '<button type="button" class="folder-context-item" data-folder-menu-action="delete">' + t('删除') + '</button>' +
          '<button type="button" class="folder-context-item" data-folder-menu-action="rename">' + t('改名') + '</button>' +
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
        showStatus(t('目录已重新加锁：') + target, 'ok');
      }

      async function handleFolderContextAction(action, path) {
        if (!action || !path) {
          return;
        }
        if (action === 'copy') {
          remoteDiskClipboardPath = path;
          remoteDiskClipboardDirectory = true;
          remoteDiskClipboardPaths = [path];
          remoteDiskClipboardDirectoryFlags = [true];
          showStatus(t('已拷贝远程目录路径：') + path, 'ok');
          return;
        }
        if (action === 'paste') {
          const clipboardPaths = remoteDiskClipboardPaths.length ? remoteDiskClipboardPaths.slice() : (remoteDiskClipboardPath ? [remoteDiskClipboardPath] : []);
          const clipboardDirFlags = remoteDiskClipboardDirectoryFlags.length ? remoteDiskClipboardDirectoryFlags.slice() : clipboardPaths.map(function () { return !!remoteDiskClipboardDirectory; });
          if (!clipboardPaths.length) {
            showStatus(t('没有可粘贴的远程文件或目录'), 'err');
            return;
          }
          if (clipboardPaths.some(function (source, index) { return !!clipboardDirFlags[index] && isSameOrChildFolderPath(source, path); })) {
            showStatus(t('不能将目录粘贴到自身或其子目录中'), 'err');
            return;
          }
          if (!(await ensureFolderUnlocked(path))) {
            return;
          }
          const buildCopyUrl = function (sourcePath, sourceDirectory, overwrite) {
            let url = sourceDirectory
              ? (api.folderCopy + '?async=1&path=' + encodeURIComponent(sourcePath) + '&folder=' + encodeURIComponent(path))
              : (api.fileCopy + '?async=1&file=' + encodeURIComponent(sourcePath) + '&folder=' + encodeURIComponent(path));
            if (overwrite) {
              url += '&overwrite=1';
            }
            if (sourceDirectory) {
              url = withFolderPassword(url, sourcePath);
            } else {
              url = withFolderPassword(url, parentFolderPathFromFilePath(sourcePath));
              url = appendFilePassword(url, sourcePath, false);
            }
            return withFolderPassword(url, path, 'target_folder_password');
          };
          for (let i = 0; i < clipboardPaths.length; i += 1) {
            const sourcePath = clipboardPaths[i];
            const sourceDirectory = !!clipboardDirFlags[i];
            let result = null;
            try {
              result = await fetchJson(buildCopyUrl(sourcePath, sourceDirectory, false), { method: 'POST' });
            } catch (err) {
              if (err && err.status === 409 && /same name|already contains|already exists/i.test(String(err.message || ''))) {
                const confirmed = confirm(t('目标目录下已存在同名文件或目录，是否覆盖？'));
                if (!confirmed) {
                  showStatus(t('已取消粘贴'), 'warn');
                  return;
                }
                result = await fetchJson(buildCopyUrl(sourcePath, sourceDirectory, true), { method: 'POST' });
              } else {
                throw err;
              }
            }
            const copiedPath = String((result && result.path) || '');
            closeFolderContextMenu();
            closeFileContextMenu();
            setRemoteCopyProgress(0, t('准备粘贴...'), { name: copiedPath || sourcePath, state: 'running', progress: 0, size: 0, copied: 0 });
            const copyResult = await pollRemoteCopyTask(String((result && result.task_id) || ''), path, copiedPath, sourceDirectory);
            if (String((copyResult && copyResult.state) || '') !== 'done') {
              return;
            }
          }
          remoteDiskClipboardPaths = [];
          remoteDiskClipboardDirectoryFlags = [];
          remoteDiskClipboardPath = '';
          remoteDiskClipboardDirectory = false;
          showStatus(clipboardPaths.length > 1 ? (t('已粘贴 ') + clipboardPaths.length + t(' 个项目到：') + path) : (t('已粘贴到：') + path), 'ok');
          return;
        }
        if (action === 'lock') {
          if (!(await ensureFolderUnlocked(path))) {
            return;
          }
          const password = await askLockPassword({
            title: t('加锁目录'),
            description: t('请为目录「') + path + t('」设置锁密码。加锁后需要输入密码才能访问。'),
            placeholder: t('请输入新锁密码'),
            errorMessage: t('加锁失败，请重新输入密码。'),
            statusErrorMessage: t('加锁失败：密码错误或验证失败')
          });
          if (password === null) {
            return;
          }
          await fetchJson(withFolderPassword(api.folderLock + '?path=' + encodeURIComponent(path) + '&password=' + encodeURIComponent(password), path), { method: 'POST' });
          setFolderNodeLockedState(path, true);
          setUnlockedFolderPassword(path, password);
          await loadFiles();
          showStatus(t('目录已加锁：') + path, 'ok');
          return;
        }
        if (action === 'session-unlock') {
          const password = await askLockPassword({
            title: t('解锁目录'),
            description: t('请输入目录「') + path + t('」的锁密码。'),
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
          showStatus(t('目录已解锁（当前会话）：') + path, 'ok');
          return;
        }
        if (action === 'session-lock') {
          await relockFolderInSession(path);
          return;
        }
        if (action === 'remove-lock') {
          const password = await askLockPassword({
            title: t('去锁目录'),
            description: t('请输入目录「') + path + t('」的锁密码。验证成功后会永久移除该目录锁。'),
            errorMessage: t('密码错误或去锁失败，请重新输入。'),
            statusErrorMessage: t('去锁失败：密码错误或验证失败'),
            onSubmit: async function (passwordText) {
              await fetchJson(api.folderUnlock + '?path=' + encodeURIComponent(path) + '&password=' + encodeURIComponent(passwordText), { method: 'POST' });
            }
          });
          if (password === null) {
            return;
          }
          deleteUnlockedFolderPassword(path);
          await loadFiles();
          showStatus(t('目录已去锁：') + path, 'ok');
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
            title: t('加锁文件'),
            description: t('请为文件「') + fileLabel + t('」设置锁密码。'),
            placeholder: t('请输入新锁密码'),
            errorMessage: t('加锁失败，请重新输入密码。'),
            statusErrorMessage: t('加锁失败：密码错误或验证失败')
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
          showStatus(t('文件已加锁：') + fileLabel, 'ok');
          return;
        }
        if (action === 'session-unlock') {
          const password = await askLockPassword({
            title: t('解锁文件'),
            description: t('请输入文件「') + fileLabel + t('」的锁密码。'),
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
          showStatus(t('文件已解锁（当前会话）：') + fileLabel, 'ok');
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
          showStatus(t('文件已重新加锁：') + fileLabel, 'ok');
          return;
        }
        if (action === 'remove-lock') {
          const password = await askLockPassword({
            title: t('去锁文件'),
            description: t('请输入文件「') + fileLabel + t('」的锁密码。验证成功后会永久移除该文件锁。'),
            errorMessage: t('密码错误或去锁失败，请重新输入。'),
            statusErrorMessage: t('去锁失败：密码错误或验证失败'),
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
          showStatus(t('文件已去锁：') + fileLabel, 'ok');
          return;
        }
        if (action === 'open-local-player') {
          let url = api.localDiskOpenFile + '?path=' + encodeURIComponent(path);
          url = appendFilePassword(url, path, true);
          url = appendLocalDirPassword(url, localDiskParentPath(path));
          await fetchJson(url, { method: 'POST' });
          showStatus(t('已调用本地播放器：') + fileLabel, 'ok');
          return;
        }
        if (action === 'choose-local-player') {
          let url = api.localDiskOpenFile + '?chooser=1&path=' + encodeURIComponent(path);
          url = appendFilePassword(url, path, true);
          url = appendLocalDirPassword(url, localDiskParentPath(path));
          await fetchJson(url, { method: 'POST' });
          showStatus(t('已打开本地播放器选择窗口：') + fileLabel, 'ok');
        }
      }

      async function handleLocalDirContextAction(action, path, locked, paths) {
        const dirPath = String(path || '');
        if (!action || !dirPath) {
          return;
        }
        const actionPaths = Array.isArray(paths) && paths.length
          ? paths.map(function (item) { return String(item || ''); }).filter(Boolean)
          : [dirPath];
        if (action === 'copy') {
          localDiskClipboardPaths = actionPaths.slice();
          localDiskClipboardDirectoryFlags = actionPaths.map(function () { return true; });
          localDiskClipboardPath = localDiskClipboardPaths[0] || '';
          localDiskClipboardDirectory = true;
          showStatus(actionPaths.length > 1 ? (t('已拷贝 ') + actionPaths.length + t(' 个本地目录')) : (t('已拷贝本地目录路径：') + dirPath), 'ok');
          return;
        }
        if (action === 'upload') {
          if (actionPaths.length > 1) {
            await openLocalImportDialog(actionPaths);
            return;
          }
          if (locked && !getLocalDirPassword(dirPath) && !(await ensureLocalDirUnlocked(dirPath))) {
            return;
          }
          await openLocalImportDialog([dirPath]);
          return;
        }
        if (action === 'create') {
          if (locked && !getLocalDirPassword(dirPath) && !(await ensureLocalDirUnlocked(dirPath))) {
            return;
          }
          const name = window.prompt(t('请输入新建子目录名称'));
          if (name === null) {
            return;
          }
          const cleanName = String(name || '').trim();
          if (!cleanName) {
            showStatus(t('子目录名称不能为空'), 'err');
            return;
          }
          await fetchJson(appendLocalDirPassword(api.localDiskMkdir + '?path=' + encodeURIComponent(dirPath) + '&name=' + encodeURIComponent(cleanName), dirPath), { method: 'POST' });
          closeFileContextMenu();
          localDiskTreeCache.delete(dirPath);
          await loadLocalDisk(dirPath, { resetTreeRoot: !localDiskPathContains(activeLocalDiskTreeRootPath, dirPath) });
          showStatus(t('子目录已创建：') + cleanName, 'ok');
          return;
        }
        if (action === 'paste') {
          const clipboardPaths = localDiskClipboardPaths.length ? localDiskClipboardPaths.slice() : (localDiskClipboardPath ? [localDiskClipboardPath] : []);
          const clipboardDirFlags = localDiskClipboardDirectoryFlags.length ? localDiskClipboardDirectoryFlags.slice() : clipboardPaths.map(function () { return !!localDiskClipboardDirectory; });
          if (!clipboardPaths.length) {
            showStatus(t('没有可粘贴的本地文件或目录'), 'err');
            return;
          }
          if (clipboardPaths.some(function (source, index) { return !!clipboardDirFlags[index] && localDiskPathContains(source, dirPath); })) {
            showStatus(t('不能将目录粘贴到自身或其子目录中'), 'err');
            return;
          }
          if (locked && !getLocalDirPassword(dirPath) && !(await ensureLocalDirUnlocked(dirPath))) {
            return;
          }
          const buildCopyUrl = function (sourcePath, sourceDirectory, overwrite) {
            const sourceLockPath = sourceDirectory && getLocalDirPassword(sourcePath)
              ? sourcePath
              : localDiskParentPath(sourcePath);
            let url = api.localDiskCopy
              + '?path=' + encodeURIComponent(sourcePath)
              + '&target=' + encodeURIComponent(dirPath);
            url += '&async=1';
            if (overwrite) {
              url += '&overwrite=1';
            }
            return appendLocalDirPassword(
              appendLocalDirPassword(
                appendFilePassword(url, sourcePath, true),
                sourceLockPath
              ),
              dirPath,
              'target_local_dir_password'
            );
          };
          for (let i = 0; i < clipboardPaths.length; i += 1) {
            const sourcePath = clipboardPaths[i];
            const sourceDirectory = !!clipboardDirFlags[i];
            let result = null;
            try {
              result = await fetchJson(buildCopyUrl(sourcePath, sourceDirectory, false), { method: 'POST' });
            } catch (err) {
              if (err && err.status === 409 && /same name|already contains|already exists/i.test(String(err.message || ''))) {
                const confirmed = confirm(t('目标目录下已存在同名文件或目录，是否覆盖？'));
                if (!confirmed) {
                  showStatus(t('已取消粘贴'), 'warn');
                  return;
                }
                result = await fetchJson(buildCopyUrl(sourcePath, sourceDirectory, true), { method: 'POST' });
              } else {
                throw err;
              }
            }
            const copiedPath = String((result && result.path) || '');
            const copiedItemName = copiedPath || sourcePath;
            if (String((result && result.task_id) || '')) {
              closeFolderContextMenu();
              closeFileContextMenu();
              setCopyTaskProgress('local-copy', 0, t('准备粘贴...'), { name: copiedItemName, state: 'running', progress: 0, size: 0, copied: 0 });
              const copyResult = await pollLocalDiskCopyTask(String((result && result.task_id) || ''), dirPath, copiedItemName);
              if (String((copyResult && copyResult.state) || '') !== 'done') {
                return;
              }
            }
          }
          localDiskClipboardPaths = [];
          localDiskClipboardDirectoryFlags = [];
          localDiskClipboardPath = '';
          localDiskClipboardDirectory = false;
          localDiskTreeCache.delete(dirPath);
          await loadLocalDisk(dirPath, { resetTreeRoot: !localDiskPathContains(activeLocalDiskTreeRootPath, dirPath) });
          showStatus(clipboardPaths.length > 1 ? (t('已粘贴 ') + clipboardPaths.length + t(' 个项目到：') + dirPath) : (t('已粘贴到：') + dirPath), 'ok');
          return;
        }
        if (action === 'lock') {
          const password = await askLockPassword({
            title: t('加锁本地目录'),
            description: t('请为本地目录「') + dirPath + t('」设置锁密码。加锁后需要输入密码才能访问。'),
            placeholder: t('请输入新锁密码'),
            errorMessage: t('加锁失败，请重新输入密码。'),
            statusErrorMessage: t('加锁失败：密码错误或验证失败')
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
          showStatus(t('本地目录已加锁：') + dirPath, 'ok');
          return;
        }
        if (action === 'session-unlock') {
          const password = await askLockPassword({
            title: t('解锁本地目录'),
            description: t('请输入本地目录「') + dirPath + t('」的锁密码。'),
            onSubmit: async function (passwordText) {
              await fetchJson(api.fileLockVerify + '?local=1&dir=1&path=' + encodeURIComponent(dirPath) + '&password=' + encodeURIComponent(passwordText), { method: 'POST' });
            }
          });
          if (password === null) {
            return;
          }
          setUnlockedLocalDirPassword(dirPath, password);
          await loadLocalDisk(dirPath, { resetTreeRoot: !localDiskPathContains(activeLocalDiskTreeRootPath, dirPath) });
          showStatus(t('本地目录已解锁（当前会话）：') + dirPath, 'ok');
          return;
        }
        if (action === 'session-lock') {
          deleteUnlockedLocalDirPassword(dirPath);
          if (localDiskPathContains(dirPath, activeLocalDiskPath)) {
            await loadLocalDisk(localDiskParentPath(dirPath), { resetTreeRoot: !localDiskPathContains(activeLocalDiskTreeRootPath, localDiskParentPath(dirPath)) });
          } else {
            renderLocalDiskItems(activeLocalDiskItems);
          }
          showStatus(t('本地目录已重新加锁：') + dirPath, 'ok');
          return;
        }
        if (action === 'remove-lock') {
          const password = await askLockPassword({
            title: t('去锁本地目录'),
            description: t('请输入本地目录「') + dirPath + t('」的锁密码。验证成功后会永久移除该目录锁。'),
            errorMessage: t('密码错误或去锁失败，请重新输入。'),
            statusErrorMessage: t('去锁失败：密码错误或验证失败'),
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
          showStatus(t('本地目录已去锁：') + dirPath, 'ok');
          return;
        }
        if (action === 'rename') {
          if (locked && !getLocalDirPassword(dirPath) && !(await ensureLocalDirUnlocked(dirPath))) {
            return;
          }
          const currentName = localBaseName(dirPath);
          const nextName = window.prompt(t('请输入新的目录名称'), currentName);
          if (nextName === null) {
            return;
          }
          const cleanName = String(nextName || '').trim();
          if (!cleanName || cleanName === currentName) {
            return;
          }
          const url = appendLocalDirPassword(api.localDiskRename
            + '?path=' + encodeURIComponent(dirPath)
            + '&name=' + encodeURIComponent(cleanName), dirPath);
          const result = await fetchJson(url, { method: 'POST' });
          const nextPath = String((result && result.path) || localDiskParentPath(dirPath));
          localDiskTreeCache.delete(dirPath);
          expandedLocalDiskTreePaths.delete(dirPath);
          await loadLocalDisk(nextPath, { resetTreeRoot: !localDiskPathContains(activeLocalDiskTreeRootPath, nextPath) });
          showStatus(t('本地目录已改名：') + dirPath + ' -> ' + nextPath, 'ok');
          return;
        }
        if (action === 'delete') {
          if (actionPaths.length > 1) {
            if (!confirm(t('确认将选中的 ') + actionPaths.length + t(' 个本地目录移至回收站？'))) {
              return;
            }
            for (let i = 0; i < actionPaths.length; i += 1) {
              const targetPath = actionPaths[i];
              await fetchJson(appendLocalDirPassword(api.localDiskDelete + '?path=' + encodeURIComponent(targetPath), targetPath), { method: 'POST' });
              localDiskTreeCache.delete(targetPath);
              expandedLocalDiskTreePaths.delete(targetPath);
              selectedLocalDiskPaths.delete(targetPath);
            }
            await loadLocalDisk(activeLocalDiskPath || localDiskParentPath(dirPath), { resetTreeRoot: false });
            showStatus(t('已移除 ') + actionPaths.length + t(' 个本地目录到回收站'), 'warn');
            return;
          }
          if (locked && !getLocalDirPassword(dirPath) && !(await ensureLocalDirUnlocked(dirPath))) {
            return;
          }
          if (!confirm(t('确认将本地目录移至回收站：') + dirPath + t(' ？'))) {
            return;
          }
          const url = appendLocalDirPassword(api.localDiskDelete + '?path=' + encodeURIComponent(dirPath), dirPath);
          await fetchJson(url, { method: 'POST' });
          localDiskTreeCache.delete(dirPath);
          expandedLocalDiskTreePaths.delete(dirPath);
          const nextPath = localDiskParentPath(dirPath);
          await loadLocalDisk(nextPath, { resetTreeRoot: !localDiskPathContains(activeLocalDiskTreeRootPath, nextPath) });
          showStatus(t('本地目录已移至回收站：') + dirPath, 'warn');
          return;
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
          title: t('解锁本地目录'),
          description: t('请输入本地目录「') + dirPath + t('」的锁密码。'),
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
          title: t('移入回收站'),
          description: t('确认将选中的 ') + selected.length + t(' 个文件夹及其全部内容移入回收站？'),
          confirmText: t('移入回收站'),
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
        sidebarToggleBtn.setAttribute('aria-label', isCollapsed ? t('展开左侧栏') : t('收起左侧栏'));
        sidebarToggleBtn.setAttribute('title', isCollapsed ? t('展开左侧栏') : t('收起左侧栏'));
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
        return /\.(mp4|avi|mkv|rm|rmvb)$/i.test(String(name || ''));
      }

      function isRealMediaVideoName(name) {
        return /\.(rm|rmvb)$/i.test(String(name || ''));
      }

      function isLocalDiskConvertibleVideoName(name) {
        return /\.(rm|rmvb|avi)$/i.test(String(name || ''));
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
            cleanup(false, t('加载元数据超时'));
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
            cleanup(false, t('浏览器不支持该视频编码或容器'));
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
          if (isRealMediaVideoName(name)) {
            failed.push({ name: name, reason: t('RM/RMVB视频为旧格式，为了兼容浏览器播放，建议转换为MP4') });
            continue;
          }

          const probe = await isVideoPlayable(name, 8000);
          const audioProbe = await checkVideoAudio(name);

          let needConvert = !probe.ok;
          let reason = probe.reason || t('无法解析视频');

          const allowAudioSplitChoice = !!(audioProbe && audioProbe.ok && audioProbe.has_audio && audioProbe.browser_audio_supported === false);

          if (allowAudioSplitChoice) {
            needConvert = true;
            reason = t('音频编码 ') + (audioProbe.audio_codec || 'unknown') + t(' 浏览器不支持');
          }

          if (needConvert) {
            failed.push({ name: name, reason: reason, allowAudioSplitChoice: allowAudioSplitChoice });
          }
        }

        return failed;
      }

      function isTextName(name) {
        return /\.(txt|md|log|csv|json|xml|yaml|yml|ini|conf|c|h|cpp|hpp|cc|java|py|js|ts|sh|go|sql|proto)$/i.test(String(name || ''));
      }

      function isPdfName(name) {
        return /\.pdf$/i.test(String(name || ''));
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
