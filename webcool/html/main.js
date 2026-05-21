(function () {
  const modules = [
    '/webcool/html/js/00-core-state.js',
    '/webcool/html/js/01-locks-context.js',
    '/webcool/html/js/02-tags-audio-dialogs.js',
    '/webcool/html/js/03-transcode-upload.js',
    '/webcool/html/js/04-remote-folders-import.js',
    '/webcool/html/js/05-remote-files.js',
    '/webcool/html/js/06-preview-local-disk.js',
    '/webcool/html/js/07-admin-storage.js',
    '/webcool/html/js/08-events-bootstrap.js'
  ];

  function showLoadError(err) {
    console.error('Failed to load WebCool modules:', err);
    const status = document.getElementById('status');
    if (status) {
      status.className = 'status show err';
      status.textContent = '前端模块加载失败：' + (err && err.message ? err.message : err);
    }
  }

  async function loadModuleText(url) {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(url + ' http ' + response.status);
    }
    return response.text();
  }

  Promise.all(modules.map(loadModuleText))
    .then(function (parts) {
      const code = parts.join('\n');
      (0, eval)(code + '\n//# sourceURL=webcool-main-modules.js');
    })
    .catch(showLoadError);
})();
