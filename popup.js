// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let reloadAttack = document.getElementById('reloadAttack');
let reloadSkill = document.getElementById('reloadSkill');
let redirectFarm = document.getElementById('redirectFarm');
let redirectTimeout = document.getElementById('redirectTimeout');
let timeoutValue = document.getElementById('timeoutValue');
let farmMap = document.getElementById('farmMap');

chrome.storage.sync.get('reloadAttack', function(data) {
  if (data.reloadAttack) {
    reloadAttack.setAttribute('checked', true);
  }
});

chrome.storage.sync.get('reloadSkill', function(data) {
  if (data.reloadSkill) {
    reloadSkill.setAttribute('checked', true);
  }
});

chrome.storage.sync.get('redirectFarm', function(data) {
  if (data.redirectFarm) {
    redirectFarm.setAttribute('checked', true);
  }
});

chrome.storage.sync.get('redirectTimeout', function(data) {
  if (data.redirectTimeout) {
    redirectTimeout.nodeValue = data.redirectTimeout;
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
