(function () {
  var textMap = {
    // Keep explicit entries for shared UI control labels so zh/en stay aligned.
    '最大化': '最大化',
    '最小化': '最小化',
    '复原': '复原'
  };

  window.WebCoolI18n = {
    lang: 'zh',
    dictionary: textMap,
    t: function (text) {
      var key = String(text == null ? '' : text);
      return Object.prototype.hasOwnProperty.call(textMap, key) ? textMap[key] : key;
    },
    apply: function () {}
  };
})();
