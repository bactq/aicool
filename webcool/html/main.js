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
  const moduleIds = modules.map(function (url) {
    return url.slice(url.lastIndexOf('/') + 1);
  });

  function showLoadError(err) {
    console.error('Failed to load WebCool modules:', err);
    const status = document.getElementById('status');
    if (status) {
      status.className = 'status show err';
      status.textContent = '前端模块加载失败：' + (err && err.message ? err.message : err);
    }
  }

  function loadModuleScript(url) {
    return new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      script.src = url;
      script.async = false;
      script.onload = resolve;
      script.onerror = function () {
        reject(new Error(url + ' load failed'));
      };
      document.head.appendChild(script);
    });
  }

  modules.reduce(function (chain, url) {
    return chain.then(function () {
      return loadModuleScript(url);
    });
  }, Promise.resolve())
    .then(function () {
      const registry = window.WebCoolModuleRegistry;
      if (!registry || !registry.modules) {
        throw new Error('module registry is empty');
      }
      const parts = moduleIds.map(function (id) {
        if (!Object.prototype.hasOwnProperty.call(registry.modules, id)) {
          throw new Error(id + ' not registered');
        }
        return registry.modules[id];
      });
      const code = '(function () {\n' + parts.join('\n') + '\n})();';
      (0, eval)(code + '\n//# sourceURL=webcool-main-runtime.js');
    })
    .catch(showLoadError);
})();
