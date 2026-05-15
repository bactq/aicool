    (function () {
      const api = {
        files: '/api/v1/files',
        upload: '/api/v1/upload',
        del: '/api/v1/delete',
        download: '/api/v1/download',
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
      const fileList = document.getElementById('file-list');
      const fileTable = document.getElementById('file-table');
      const fileEmpty = document.getElementById('file-empty');
      const fileCounter = document.getElementById('file-counter');
      const sortKey = document.getElementById('sort-key');
      const sortOrder = document.getElementById('sort-order');
      const sortButtons = Array.from(document.querySelectorAll('.sort-btn[data-sort-key]'));
      const previewLayer = document.getElementById('preview-layer');
      const menuButtons = Array.from(document.querySelectorAll('.menu-btn[data-panel]'));
      const panels = Array.from(document.querySelectorAll('.panel'));
      let allFiles = [];
      let previewZ = 900;
      let activeDrag = null;
      const openedPreviewWindows = new Map();
      const transcodeProgressTimers = new Map();
      const videoResumeSaveTimers = new Map();

      function activatePanel(panelId) {
        panels.forEach(function (panel) {
          panel.classList.toggle('active', panel.id === panelId);
        });
        menuButtons.forEach(function (btn) {
          btn.classList.toggle('active', btn.getAttribute('data-panel') === panelId);
        });

        if (panelId === 'panel-files') {
          loadFiles();
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
          const src = api.download + '?preview=1&file=' + encoded;
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
            return String(it.name || '');
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

      function showStatus(msg, type) {
        statusBox.className = 'status show ' + (type || 'ok');
        statusBox.textContent = msg;
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

      function renderFiles(files) {
        fileCounter.textContent = files.length + ' 个文件';

        if (!files.length) {
          fileList.innerHTML = '';
          fileTable.style.display = 'none';
          fileEmpty.textContent = '当前没有可下载文件。';
          fileEmpty.style.display = 'block';
          return;
        }

        const key = sortKey.value || 'name';
        const order = sortOrder.value || 'asc';
        const sorted = files.slice().sort((a, b) => compareFiles(a, b, key, order));
        updateSortIndicator();

        fileEmpty.style.display = 'none';
        fileTable.style.display = '';
        fileList.innerHTML = sorted.map(file => {
          const name = escapeHtml(file.name || '');
          const size = safeSize(file);
          const uploaded = escapeHtml(file.uploaded_time || '-');
          const encoded = encodeURIComponent(file.name || '');
          const previewBtn = isImageName(file.name)
            ? '<button class="preview-btn" data-preview-file="' + encoded + '" data-preview-name="' + name + '">预览</button>'
            : '';
          const videoBtn = isVideoName(file.name)
            ? '<button class="video-btn" data-video-file="' + encoded + '" data-video-name="' + name + '">观影</button>'
            : '';
          const audioBtn = isAudioName(file.name)
            ? '<button class="audio-btn" data-audio-file="' + encoded + '" data-audio-name="' + name + '">听音</button>'
            : '';
          const textBtn = isTextName(file.name)
            ? '<button class="text-btn" data-text-file="' + encoded + '" data-text-name="' + name + '">查看</button>'
            : '';
          return (
            '<tr>' +
              '<td><a class="file-name" href="' + api.download + '?file=' + encoded + '">' + name + '</a></td>' +
              '<td><span class="size">' + formatNumber(size) + ' 字节</span></td>' +
              '<td><span class="time">' + uploaded + '</span></td>' +
              '<td class="actions">' + previewBtn + videoBtn + audioBtn + textBtn + '<button class="delete-btn" data-file="' + encoded + '" data-name="' + name + '">删除</button></td>' +
            '</tr>'
          );
        }).join('');
      }

      function openPreview(kind, file, name) {
        const existed = openedPreviewWindows.get(file);
        if (existed && existed.isConnected) {
          bringToFront(existed);
          const video = existed.querySelector('video');
          if (video) {
            video.play().catch(function () {});
          }
          return;
        }

        const url = api.download + '?preview=1&file=' + file + '&v=' + Date.now();
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
          const subtitleUrl = api.download + '?preview=1&file=' + encodeURIComponent(subtitleName) + '&v=' + Date.now();
          mediaHtml = '<video class="preview-video" controls preload="metadata" src="' + url + '">' +
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
        openedPreviewWindows.set(file, win);

        const mediaVideo = win.querySelector('video');
        if (mediaVideo) {
          const rawVideoFile = decodeURIComponent(String(file || ''));
          bindVideoResume(mediaVideo, rawVideoFile);
          mediaVideo.play().catch(function () {});

          // Check if video has audio track
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

        const mediaAudio = win.querySelector('audio');
        if (mediaAudio) {
          const rawAudioFile = decodeURIComponent(String(file || ''));
          bindVideoResume(mediaAudio, rawAudioFile);
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
          closePreviewWindow(win, file);
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
          const data = await fetchJson(api.files);
          allFiles = Array.isArray(data.files) ? data.files : [];
          renderFiles(allFiles);
          await recoverRunningTranscodeTasks();
        } catch (err) {
          fileList.innerHTML = '';
          fileTable.style.display = 'none';
          fileEmpty.textContent = '加载文件列表失败：' + err.message;
          fileEmpty.style.display = 'block';
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

      sortKey.addEventListener('change', function () {
        renderFiles(allFiles);
      });

      sortOrder.addEventListener('change', function () {
        renderFiles(allFiles);
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

          renderFiles(allFiles);
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
        if (!btn) {
          return;
        }

        const file = btn.getAttribute('data-file');
        const name = btn.getAttribute('data-name') || '';
        if (!file) {
          return;
        }

        if (!confirm('确认删除文件：' + name + ' ？')) {
          return;
        }

        resetStatus();
        try {
          await fetchJson(api.del + '?file=' + file);
          showStatus('已删除：' + name, 'warn');
          await loadFiles();
        } catch (err) {
          showStatus('删除失败：' + err.message, 'err');
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

      menuButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          const panelId = btn.getAttribute('data-panel');
          if (panelId) {
            activatePanel(panelId);
          }
        });
      });

      activatePanel('panel-files');
    })();
