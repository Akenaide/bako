// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let reloadAttack = document.getElementById('reloadAttack');
let redirectFarm = document.getElementById('redirectFarm');

chrome.storage.sync.get('reloadAttack', function(data) {
  if (data.reloadAttack) {
    reloadAttack.setAttribute('checked', true);
  }
});

chrome.storage.sync.get('redirectFarm', function(data) {
  if (data.redirectFarm) {
    redirectFarm.setAttribute('checked', true);
  }
});

reloadAttack.onchange = function(element) {
  let value = element.target.checked;
  chrome.storage.sync.set({"reloadAttack": value});
};

redirectFarm.onchange = function(element) {
  let value = element.target.checked;
  chrome.storage.sync.set({"redirectFarm": value});
};
