// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

const skills = {
  "6199": "Conjunction",
  "8001": "Tag team"
}

var activate = true;
// http://game.granbluefantasy.jp/rest/multiraid/normal_attack_result.json?_=1591798695315&t=1591798695318&uid=26271737
chrome.webRequest.onCompleted.addListener(
  function (details) {
    chrome.storage.sync.get('reloadAttack', function (data) {
      if (data.reloadAttack) {
        setTimeout(() => {
          chrome.tabs.goBack(details.tabId);
        }, Math.floor(Math.random() * 500) + 500);
      }
    });
  },
  {
    urls: [
      "http://game.granbluefantasy.jp/rest/*/summon_result.json*",
      "http://game.granbluefantasy.jp/rest/*/normal_attack_result.json*",
    ]
  },
);

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    var postedString = JSON.parse(decodeURIComponent(String.fromCharCode.apply(null,
      new Uint8Array(details.requestBody.raw[0].bytes))));

    chrome.storage.sync.get('reloadSkill', function (data) {
      if (data.reloadSkill && Object.keys(skills).includes(postedString["ability_id"])) {
        chrome.tabs.reload(details.tabId);
      }
    });
  },
  {
    urls: [
      "http://game.granbluefantasy.jp/rest/*/ability_result.json*"]
  },
  ["requestBody"]
);

// NM
chrome.webRequest.onCompleted.addListener(
  function (details) {
    chrome.storage.sync.get('redirectFarm', function (data) {
      if (data.redirectFarm) {
        console.log("activate")
        chrome.bookmarks.search({ "title": "farm" }, function (result) {
          console.log("found", result[0].url)
          setTimeout(() => {
            chrome.tabs.update(details.tabId, { url: result[0].url });
          }, Math.floor(Math.random() * 1500) + 500);
        });
      }
    })
  },
  {
    urls: [
      "http://game.granbluefantasy.jp/resultmulti/data/*",
      "http://game.granbluefantasy.jp/*result/*"
    ]
  },
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

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({ reloadAttack: false }, function () {
    console.log('Reload not activate');
  })
  chrome.storage.sync.set({ redirectFarm: false }, function () {
    console.log('Redirect not activate');
  })
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { hostEquals: 'game.granbluefantasy.jp' },
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});
