// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

var activate = true;
// http://game.granbluefantasy.jp/rest/multiraid/normal_attack_result.json?_=1591798695315&t=1591798695318&uid=26271737
chrome.webRequest.onCompleted.addListener(
  function(details) {
    if (activate) {
      chrome.tabs.reload(details.tabId);
    }
  },
  {urls: [
    "http://game.granbluefantasy.jp/rest/multiraid/normal_attack_result.json*", 
    "http://game.granbluefantasy.jp/rest/raid/normal_attack_result.json*"]
  },
  );

  // NM
chrome.webRequest.onCompleted.addListener(
  function(details) {
    if (activate) {
      console.log(details);
      // chrome.tabs.reload();
    }
  },
  {urls: ["http://game.granbluefantasy.jp/resultmulti/data/*"]},
  );
// chrome.runtime.onInstalled.addListener(function() {
//   chrome.storage.sync.set({color: '#3aa757'}, function() {
//     console.log('The color is green.');
//   });
//   chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
//     chrome.declarativeContent.onPageChanged.addRules([{
//       conditions: [new chrome.declarativeContent.PageStateMatcher({
//         pageUrl: {hostEquals: 'developer.chrome.com'},
//       })],
//       actions: [new chrome.declarativeContent.ShowPageAction()]
//     }]);
//   });
// });
