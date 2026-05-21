        }
        try {
          resetStatus();
          const started = await fetchJson(url, { method: 'POST' });
          closeLocalImportDialog();
          setLocalImportProgress(0, t('准备上传...'));
          const data = await pollLocalImportProgress(String(started.task_id || ''));
          clearLocalDiskSelection();
          await loadFiles();
          showStatus(t('已上传 ') + Number(data.saved_count || 0) + t(' 个本地文件到远程磁盘'), 'ok');
          const videoProbeFails = await verifyUploadedVideos(data.files);
          if (videoProbeFails.length) {
            showManualTranscodePrompt(videoProbeFails);
          }
        } catch (err) {
          failLocalImportProgress(t('上传失败：') + err.message);
          showStatus(t('上传本地文件失败：') + err.message, 'err');
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
            ? String(meta.node.name)
            : t('当前标签');
          fileViewContext.textContent = t('当前视图：标签：') + tagName + t(' / 范围：标签内全部文件');
        } else {
          fileViewContext.textContent = t('当前视图：目录：') + getFolderLabel(activeFolderPath) + t(' / 范围：全部文件');
        }
      }

      function updateExplorerLayout() {
        const isTagFilterMode = !!activeFilterTagId;
        const isPreviewEnabledTag = isTagFilterMode && isActiveTagPreviewEnabled();
        if (fileListTitle) {
          fileListTitle.textContent = isTagFilterMode ? t('当前标签文件') : t('当前目录文件');
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
          ? t('文件/文件夹')
          : (folderCount > 0 ? t('文件夹') : t('文件'));
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
          const label = isTagFilterMode ? t('移除') : (isRecycleMode ? t('恢复') : t('删除'));
          const title = isTagFilterMode
            ? t('批量从当前标签移除')
            : (isRecycleMode ? t('批量恢复文件到原路径') : t('批量删除文件（移入回收站）'));
          fileBulkAction.textContent = label;
          fileBulkAction.title = title;
          fileBulkAction.setAttribute('aria-label', title);
          fileBulkAction.disabled = selectedCount === 0;
        }

        if (fileBulkDeleteAction) {
          const title = t('批量彻底删除文件/文件夹（仅回收站）');
          fileBulkDeleteAction.textContent = t('彻底删除');
          fileBulkDeleteAction.title = title;
          fileBulkDeleteAction.setAttribute('aria-label', title);
          fileBulkDeleteAction.disabled = !isRecycleMode || selectedCount === 0;
        }

        if (fileBulkTagAction) {
          fileBulkTagAction.disabled = selectedCount === 0;
          fileBulkTagAction.title = selectedCount > 0 ? (t('给选中的 ') + selectedCount + t(' 个文件加标签')) : t('给选中文件加标签');
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
        fileCounter.textContent = currentFiles.length + t(' 个文件');

        if (!currentFiles.length) {
          fileList.innerHTML = '';
          fileTable.style.display = 'none';
          if (tagImagePreviewWrap) tagImagePreviewWrap.hidden = true;
          fileEmpty.textContent = activeFilterTagId ? t('当前标签下没有文件。') : t('当前目录没有文件。');
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
            ? '<span class="folder-lock-icon file-lock-inline' + (getFilePassword(rawName, isLocalTaggedFile) ? ' unlocked' : '') + '" title="' + escapeHtml(t(getFilePassword(rawName, isLocalTaggedFile) ? '点击重新加锁' : '点击解锁')) + '" aria-label="' + escapeHtml(t(getFilePassword(rawName, isLocalTaggedFile) ? '点击重新加锁' : '点击解锁')) + '"><span class="folder-lock-shackle"></span><span class="folder-lock-body"></span></span>'
            : '';
          const pathMeta = file.folder_path
            ? '<div class="file-path-meta">' + escapeHtml(file.folder_path) + '</div>'
            : '';
          const size = safeSize(file);
          const uploaded = escapeHtml(file.uploaded_time || '-');
          const checked = selectedFileNames.has(rawName) ? ' checked' : '';
          const previewBtn = !isDir && isImageName(file.name)
            ? (isLocalTaggedFile
              ? '<button class="local-preview-btn preview-btn" data-kind="image" data-local-file="' + encodedPath + '" data-local-name="' + escapeHtml(rawName) + '">' + t('预览') + '</button>'
              : '<button class="preview-btn" data-preview-file="' + encodedPath + '" data-preview-name="' + escapeHtml(rawName) + '">' + t('预览') + '</button>')
            : '';
          const videoBtn = !isDir && isVideoName(file.name)
            ? (isLocalTaggedFile
              ? '<button class="local-preview-btn video-btn" data-kind="video" data-local-file="' + encodedPath + '" data-local-name="' + escapeHtml(rawName) + '">' + t('观影') + '</button>'
              : '<button class="video-btn" data-video-file="' + encodedPath + '" data-video-name="' + escapeHtml(rawName) + '">' + t('观影') + '</button>')
            : '';
          const audioBtn = !isDir && isAudioName(file.name)
            ? (isLocalTaggedFile
              ? '<button class="local-preview-btn audio-btn" data-kind="audio" data-local-file="' + encodedPath + '" data-local-name="' + escapeHtml(rawName) + '">' + t('听音') + '</button>'
              : '<button class="audio-btn" data-audio-file="' + encodedPath + '" data-audio-name="' + escapeHtml(rawName) + '">' + t('听音') + '</button>')
            : '';
          const textBtn = !isDir && isTextName(file.name)
            ? (isLocalTaggedFile
              ? '<button class="local-preview-btn text-btn" data-kind="text" data-local-file="' + encodedPath + '" data-local-name="' + escapeHtml(rawName) + '">' + t('查看') + '</button>'
              : '<button class="text-btn" data-text-file="' + encodedPath + '" data-text-name="' + escapeHtml(rawName) + '">' + t('查看') + '</button>')
            : '';
          const primaryActionBtn = isTagFilterMode
            ? '<button class="delete-btn" data-file="' + encodedPath + '" data-name="' + escapeHtml(rawName) + '"' + (isLocalTaggedFile ? ' data-local-tag-file="1"' : '') + '>' + t('移除') + '</button>'
            : (isRecycleMode
              ? ('<button class="restore-btn" data-file="' + encodedPath + '" data-name="' + escapeHtml(rawName) + '">' + t('恢复') + '</button>')
              : '<button class="delete-btn" data-file="' + encodedPath + '" data-name="' + escapeHtml(rawName) + '">' + t('删除') + '</button>');
          const permanentDeleteBtn = isRecycleMode
            ? '<button class="delete-btn" data-file="' + encodedPath + '" data-name="' + escapeHtml(rawName) + '">' + t('彻底删除') + '</button>'
            : '';
          const nameContent = isDir
            ? '<span class="file-name local-folder-link"><span class="local-folder-icon">📁</span>' + name + '</span>'
            : '<a class="file-name" draggable="false" href="' + escapeHtml(isLocalTaggedFile ? localDiskDownloadUrl(rawName) : downloadUrlForFile(rawName, false)) + '">' + name + '</a>';
          const tagQuickBtn = isDir
            ? ''
            : '<button class="file-tag-quick-btn" type="button" data-tag-file="' + encodedPath + '" title="' + escapeHtml(t('加入标签')) + '" aria-label="' + escapeHtml(t('加入标签')) + '">🏷</button>';
          return (
            '<tr class="draggable-file-row" draggable="' + (isDir ? 'false' : 'true') + '" data-drag-file="' + encodedPath + '"' + (isDir ? '' : ' data-file-context="' + encodedPath + '"') + ' data-file-local="' + (isLocalTaggedFile ? '1' : '0') + '" data-file-locked="' + (fileLocked ? '1' : '0') + '" data-file-video="' + (!isDir && isVideoName(file.name) ? '1' : '0') + '">' +
              '<td class="file-select-cell"><div class="file-select-tools"><input class="file-select-input" type="checkbox" data-select-file="' + encodedPath + '" aria-label="' + escapeHtml(t('选择') + (isDir ? t('目录 ') : t('文件 ')) + rawName) + '"' + checked + '>' + tagQuickBtn + '</div></td>' +
              '<td' + (isDir ? '' : ' data-file-context="' + encodedPath + '"') + ' data-file-local="' + (isLocalTaggedFile ? '1' : '0') + '" data-file-locked="' + (fileLocked ? '1' : '0') + '" data-file-video="' + (!isDir && isVideoName(file.name) ? '1' : '0') + '">' + nameContent + lockIcon + pathMeta + '</td>' +
              '<td>' + (isDir ? t('文件夹') : (formatNumber(size) + t(' 字节'))) + '</td>' +
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
          tagImagePreviewWrap.innerHTML = '<p class="tag-preview-empty">\u5f53\u524d\u6807\u7b7e\u4e0b\u6ca1\u6709\u56fe\u7247\u3002</p>';
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
          titleEl.textContent = '图片预览：' + String(item.name || item.file || '');
        }
        if (imageEl) {
