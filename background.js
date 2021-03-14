// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

const skills = {
  "6199": "Conjunction",
  "8001": "Tag team"
}

var activate = true;

let allKeys = [
  "reloadSkill",
  "reloadAttack",
  "redirectFarm",
  "arcaMode",
]


chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (var key in changes) {
    var storageChange = changes[key];
    console.log('Storage key "%s" in namespace "%s" changed. ' +
                'Old value was "%s", new value is "%s".',
                key,
                namespace,
                storageChange.oldValue,
                storageChange.newValue);
  }
});


function toggleArcaMode() {
  console.log("toggle Arca")
  const params = ["reloadSkill", "redirectFarm", "arcaMode"]

  chrome.storage.sync.get(params, (result) => {
    for (const key of params) {
        const element = !result[key];
        result[key] = !result[key];
    }
        chrome.storage.sync.set(result, ()=> console.log("saved"))
  })

}

function deactivateAll() {
  console.log("Deactivate All")
  let allVal = {};
  for (const val of allKeys) {
    allVal[val] = false;
  }

  chrome.storage.sync.set(allVal)
}

let keyboardShortcut = {
  "toggle-aracarum-mode": toggleArcaMode,
  "deactivate-all": deactivateAll
}

chrome.commands.onCommand.addListener(function (command) {
  console.log('Command:', command);
  keyboardShortcut[command]()
});

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
        chrome.storage.sync.get('arcaMode', (data) => {
          let key = "farm";
          if (data.arcaMode) {
            key = "arca";
          }
          chrome.bookmarks.search({ "title": key }, function (result) {
            console.log("found", result[0].url)
            setTimeout(() => {
              chrome.tabs.update(details.tabId, { url: result[0].url });
            }, Math.floor(Math.random() * 1500) + 500);
          });
        })
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

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({ reloadAttack: false }, function () {
    console.log('Reload not activate');
  })
  chrome.storage.sync.set({ redirectFarm: false }, function () {
    console.log('Redirect not activate');
  })
  chrome.storage.sync.set({ 'arcaMode': false }, function () {
    console.log('ArcaMode not activate');
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
