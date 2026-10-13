// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let reloadAttack = document.getElementById('reloadAttack');
let reloadSummon = document.getElementById('reloadSummon');
let reloadSkill = document.getElementById('reloadSkill');
let reloadEntry = document.getElementById('reloadEntry');
let reloadMode = document.getElementById('reloadMode');
let redirectFarm = document.getElementById('redirectFarm');
let redirectTimeout = document.getElementById('redirectTimeout');
let timeoutValue = document.getElementById('timeoutValue');
let farmMap = document.getElementById('farmMap');

chrome.storage.sync.get('reloadAttack', function(data) {
  if (data.reloadAttack) {
    reloadAttack.setAttribute('checked', true);
  }
});

chrome.storage.sync.get('reloadSummon', function(data) {
  if (data.reloadSummon) {
    reloadSummon.setAttribute('checked', true);
  }
});

chrome.storage.sync.get('reloadSkill', function(data) {
  if (data.reloadSkill) {
    reloadSkill.setAttribute('checked', true);
  }
});

chrome.storage.sync.get('reloadEntry', function(data) {
  if (data.reloadEntry) {
    reloadEntry.setAttribute('checked', true);
  }
});

chrome.storage.sync.get('reloadMode', function(data) {
  reloadMode.value = data.reloadMode || 'backforward';
});

chrome.storage.sync.get('redirectFarm', function(data) {
  if (data.redirectFarm) {
    redirectFarm.setAttribute('checked', true);
  }
});

chrome.storage.sync.get('redirectTimeout', function(data) {
  if (data.redirectTimeout) {
    redirectTimeout.value = data.redirectTimeout;
    timeoutValue.value = data.redirectTimeout;
  }
});

chrome.storage.sync.get('farmMap', function(data) {
  if (data.farmMap) {
    farmMap.value = data.farmMap;
  }
});

// watchers

reloadSkill.onchange = function(element) {
  let value = element.target.checked;
  chrome.storage.sync.set({"reloadSkill": value});
};

reloadAttack.onchange = function(element) {
  let value = element.target.checked;
  chrome.storage.sync.set({"reloadAttack": value});
};

reloadSummon.onchange = function(element) {
  let value = element.target.checked;
  chrome.storage.sync.set({"reloadSummon": value});
};

reloadEntry.onchange = function(element) {
  let value = element.target.checked;
  chrome.storage.sync.set({"reloadEntry": value});
};

reloadMode.onchange = function(element) {
  let value = element.target.value;
  chrome.storage.sync.set({"reloadMode": value});
};

redirectFarm.onchange = function(element) {
  let value = element.target.checked;
  chrome.storage.sync.set({"redirectFarm": value});
};

redirectTimeout.onchange = function(element) {
  let value = element.target.value;
  chrome.storage.sync.set({"redirectTimeout": value});
  timeoutValue.value = value;
};

farmMap.onchange = function(element) {
  let value = element.target.value;
  chrome.storage.sync.set({"farmMap": value});
  farmMap.value = value;
};

// Point the farm bookmark at the active tab: reuse the one the redirect would pick, else create it.
document.getElementById('setFarm').onclick = function() {
  let status = document.getElementById('setFarmStatus');
  let title = farmMap.value;
  if (!title) {
    status.textContent = 'Set a farm name first';
    return;
  }
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    let url = tabs[0].url;
    chrome.bookmarks.search({title: title}, function(result) {
      let done = function() { status.textContent = 'Saved "' + title + '"'; };
      if (result.length && result[0].url) {
        chrome.bookmarks.update(result[0].id, {url: url}, done);
      } else {
        chrome.bookmarks.create({title: title, url: url}, done);
      }
    });
  });
};
