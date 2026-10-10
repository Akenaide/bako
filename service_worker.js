// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

const skills = {
  "6199": "Conjunction",
  "8001": "Tag team"
}

var activate = true;

var ongoingRedirect = false;

// ponytail: in-memory map (tabId -> raidId), not persisted like the alarm
// payloads; a service worker restart mid-raid just costs one extra reload.
var enteredRaid = {};

// Alarm payloads are persisted to storage.local (keyed by alarm name) instead
// of a plain object, so a scheduled action still has its data if the service
// worker gets killed and restarted before the alarm fires.
function setPendingAlarm(name, data) {
  chrome.storage.local.set({ [name]: data });
}

function consumePendingAlarm(name, callback) {
  chrome.storage.local.get(name, (result) => {
    chrome.storage.local.remove(name);
    callback(result[name]);
  });
}
let allKeys = [
  "reloadSkill",
  "reloadAttack",
  "reloadSummon",
  "reloadEntry",
  "redirectFarm",
  "arcaMode",
  "farmMap",
]


chrome.storage.onChanged.addListener(function (changes, namespace) {
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
      result[key] = !result[key];
    }
    chrome.storage.sync.set(result, () => console.log("saved"))
  })

}

function deactivateAll() {
  console.log("Deactivate All")
  let allVal = {};
  for (const val of allKeys) {
    allVal[val] = false;
  }

  allVal['farmMap'] = "farm"
  ongoingRedirect = false;
  chrome.storage.sync.set(allVal)
}

let keyboardShortcut = {
  "toggle-aracarum-mode": toggleArcaMode,
  "deactivate-all": deactivateAll
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith('reload_')) {
    consumePendingAlarm(alarm.name, (tabId) => {
      if (!tabId) {
        return;
      }
      chrome.storage.sync.get('reloadMode', ({ reloadMode }) => {
        if (reloadMode === 'reload') {
          chrome.tabs.reload(tabId);
        } else if (reloadMode === 'back') {
          chrome.tabs.goBack(tabId);
        } else {
          chrome.tabs.goBack(tabId);
          chrome.tabs.goForward(tabId);
        }
      });
    });
  } else if (alarm.name.startsWith('redirectWait_')) {
    consumePendingAlarm(alarm.name, (pending) => {
      if (pending) {
        findAndGoToBookmark(pending);
      }
    });
  } else if (alarm.name.startsWith('redirectGo_')) {
    consumePendingAlarm(alarm.name, (pending) => {
      if (pending) {
        chrome.tabs.update(pending.tabId, { url: pending.url });
        ongoingRedirect = false;
      }
    });
  }
})

function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function delayAction(name, tabId) {
  const alarmName = `${name}_${tabId}`;
  const offset = randomInRange(800, 2500); // human-like reaction time before reloading
  console.log(`offset for action: ${alarmName} is ${offset}`);
  setPendingAlarm(alarmName, tabId);
  chrome.alarms.create(alarmName, { when: Date.now() + offset })
}

chrome.commands.onCommand.addListener(function (command) {
  console.log('Command:', command);
  keyboardShortcut[command]()
});

// https://game.granbluefantasy.jp/rest/multiraid/normal_attack_result.json?_=1591798695315&t=1591798695318&uid=26271737
function reloadOnCompleted(settingKey, url) {
  chrome.webRequest.onCompleted.addListener(
    function (details) {
      chrome.storage.sync.get(settingKey, function (data) {
        if (data[settingKey]) {
          delayAction("reload", details.tabId);
        }
      });
    },
    { urls: [url] },
  );
}

reloadOnCompleted('reloadAttack', "https://game.granbluefantasy.jp/rest/*/normal_attack_result.json*");
reloadOnCompleted('reloadSummon', "https://game.granbluefantasy.jp/rest/*/summon_result.json*");

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    const bytes = details.requestBody && details.requestBody.raw && details.requestBody.raw[0] && details.requestBody.raw[0].bytes;
    if (!bytes) {
      return;
    }
    var postedString = JSON.parse(decodeURIComponent(String.fromCharCode.apply(null,
      new Uint8Array(bytes))));

    chrome.storage.sync.get('reloadSkill', function (data) {
      if (data.reloadSkill && Object.keys(skills).includes(postedString["ability_id"])) {
        chrome.tabs.reload(details.tabId); // TODO: use delayAction
      }
    });
  },
  {
    urls: [
      "https://game.granbluefantasy.jp/rest/*/ability_result.json*"]
  },
  ["requestBody"]
);


chrome.webRequest.onCompleted.addListener(
  function () {
    ongoingRedirect = false;
  },
  {
    urls: [
      "https://game.granbluefantasy.jp/*/supporter/*"
    ]
  },
);

// Fires exactly when you actually join the raid (as opposed to picking a
// support summon beforehand); the tab's URL hash carries the raid id by then.
chrome.webRequest.onCompleted.addListener(
  function (details) {
    chrome.storage.sync.get('reloadEntry', function (data) {
      if (!data.reloadEntry) {
        return;
      }
      chrome.tabs.get(details.tabId, function (tab) {
        const raidId = tab.url && tab.url.match(/raid_multi\/(\d+)/)?.[1];
        if (!raidId || enteredRaid[details.tabId] === raidId) {
          return;
        }
        enteredRaid[details.tabId] = raidId;
        chrome.tabs.reload(details.tabId);
      });
    });
  },
  {
    urls: [
      "https://game.granbluefantasy.jp/rest/multiraid/start.json*"
    ]
  },
);



function findAndGoToBookmark(pending) {
  console.log("activate")
  let key = pending.farmMap;
  if (pending.arcaMode) {
    key = "arca";
  }
  console.log(key);
  chrome.bookmarks.search({ "title": key }, function (result) {
    if (!result.length) {
      console.log("no bookmark found for", key);
      ongoingRedirect = false;
      return;
    }
    console.log("found", result[0].url)
    const alarmName = `redirectGo_${pending.tabId}`;
    setPendingAlarm(alarmName, { tabId: pending.tabId, url: result[0].url });
    chrome.alarms.create(alarmName, { when: Date.now() + randomInRange(100, 300) })
  });
}

function redirectMap(details) {
  if (ongoingRedirect) {
    return
  }
  ongoingRedirect = true;
  chrome.storage.sync.get(['redirectFarm', 'arcaMode', 'redirectTimeout', 'farmMap'], function (data) {
    if (!data.redirectFarm) {
      ongoingRedirect = false;
      return;
    }
    const alarmName = `redirectWait_${details.tabId}`;
    setPendingAlarm(alarmName, { tabId: details.tabId, arcaMode: data.arcaMode, farmMap: data.farmMap });
    chrome.alarms.create(alarmName, { when: Date.now() + data.redirectTimeout })
  })

}

// NM
chrome.webRequest.onCompleted.addListener(
  function (details) {
    redirectMap(details);
  },
  {
    urls: [
      "https://game.granbluefantasy.jp/resultmulti/*",
      "https://game.granbluefantasy.jp/*result/*"
    ]
  },
);

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({ reloadAttack: false }, function () {
    console.log('Reload not activate');
  })
  chrome.storage.sync.set({ reloadSummon: false }, function () {
    console.log('Reload summon not activate');
  })
  chrome.storage.sync.set({ redirectFarm: false }, function () {
    console.log('Redirect not activate');
  })
  chrome.storage.sync.set({ reloadEntry: false }, function () {
    console.log('Reload entry not activate');
  })
  chrome.storage.sync.set({ reloadMode: "backforward" }, function () {
    console.log('Reload mode set to: backforward');
  })
  chrome.storage.sync.set({ 'arcaMode': false }, function () {
    console.log('ArcaMode not activate');
  })
  chrome.storage.sync.set({ 'redirectTimeout': 200 }, function () {
    console.log('timeout is set to: 200');
  })
  chrome.storage.sync.set({ 'farmMap': "farm" }, function () {
    console.log('Look for "farm" name');
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
