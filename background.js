// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

var activate = true;
// http://game.granbluefantasy.jp/rest/multiraid/normal_attack_result.json?_=1591798695315&t=1591798695318&uid=26271737
chrome.webRequest.onCompleted.addListener(
  function (details) {
    chrome.storage.sync.get('reloadAttack', function (data) {
      if (data.reloadAttack) {
        chrome.tabs.reload(details.tabId);
      }
    });
  },
  {
    urls: [
      "http://game.granbluefantasy.jp/rest/multiraid/normal_attack_result.json*",
      "http://game.granbluefantasy.jp/rest/raid/normal_attack_result.json*"]
  },
);

// NM
chrome.webRequest.onCompleted.addListener(
  function (details) {
    if (activate) {
      console.log(details);
      // chrome.tabs.reload();
    }
  },
  { urls: ["http://game.granbluefantasy.jp/resultmulti/data/*"] },
);


// chrome.storage.onChanged.addListener(function (changes, namespace) {
//   for (var key in changes) {
//     var storageChange = changes[key];
//     console.log('Storage key "%s" in namespace "%s" changed. ' +
//       'Old value was "%s", new value is "%s".',
//       key,
//       namespace,
//       storageChange.oldValue,
//       storageChange.newValue);
//   }
// });

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({ reloadAttack: false }, function () {
    console.log('Reload not activate');
  })
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'game.granbluefantasy.jp'},
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});
