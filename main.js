let res
function shorturl() {
  if (document.querySelector("#longURL").value == "") {
    alert("Url不能为空!")
    return
  }

  document.getElementById("addBtn").disabled = true;
  document.getElementById("addBtn").innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>生成中...';
  fetch(window.location.pathname, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd: "add", url: document.querySelector("#longURL").value, keyPhrase: document.querySelector("#keyPhrase").value, password: document.querySelector("#passwordText").value })
  }).then(function (response) {
    return response.json();
  })
    .then(function (myJson) {
      res = myJson;
      document.getElementById("addBtn").disabled = false;
      document.getElementById("addBtn").innerHTML = '确定';

      // 成功生成短链
      if (res.status == "200") {
        let keyPhrase = res.key;
        let valueLongURL = document.querySelector("#longURL").value;
        // save to localStorage
        localStorage.setItem(keyPhrase, valueLongURL);
        // add to urlList on the page
        addUrlToList(keyPhrase, valueLongURL)

        document.getElementById("result").innerHTML = window.location.protocol + "//" + window.location.host + "/" + res.key;
      } else {
        document.getElementById("result").innerHTML = res.error;
      }

      $('#resultModal').modal('show')

    }).catch(function (err) {
      alert("未知错误，请重试!");
      console.log(err);
      document.getElementById("addBtn").disabled = false;
      document.getElementById("addBtn").innerHTML = '确定';
    })
}
function copyurl(id, attr) {
  let target = null;

  if (attr) {
    target = document.createElement('div');
    target.id = 'tempTarget';
    target.style.opacity = '0';
    if (id) {
      let curNode = document.querySelector('#' + id);
      target.innerText = curNode[attr];
    } else {
      target.innerText = attr;
    }
    document.body.appendChild(target);
  } else {
    target = document.querySelector('#' + id);
  }

  try {
    let range = document.createRange();
    range.selectNode(target);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('复制');
    window.getSelection().removeAllRanges();
    console.log('复制成功')
  } catch (e) {
    console.log('复制错误')
  }

  if (attr) {
    // remove temp target
    target.parentElement.removeChild(target);
  }
}
function loadUrlList() {
  // 清空列表
  let urlList = document.querySelector("#urlList")
  while (urlList.firstChild) {
    urlList.removeChild(urlList.firstChild)
  }

  // 文本框中的长链接
  let longUrl = document.querySelector("#longURL").value
  console.log(longUrl)

  // 遍历localStorage
  let len = localStorage.length
  console.log(+len)
  for (; len > 0; len--) {
    let keyShortURL = localStorage.key(len - 1)
    let valueLongURL = localStorage.getItem(keyShortURL)

    // 如果长链接为空，加载所有的localStorage
    // 如果长链接不为空，加载匹配的localStorage
    if (longUrl == "" || (longUrl == valueLongURL)) {
      addUrlToList(keyShortURL, valueLongURL)
    }
  }
}

function addUrlToList(shortUrl, longUrl) {
  let urlList = document.querySelector("#urlList")

  let child = document.createElement('div')
  child.classList.add("list-group-item")

  let btn = document.createElement('button')
  btn.setAttribute('type', 'button')
  btn.classList.add("btn", "btn-danger")
  btn.setAttribute('onclick', 'deleteShortUrl(\"' + shortUrl + '\")')
  btn.setAttribute('id', 'delBtn-' + shortUrl)
  btn.innerText = "X"
  child.appendChild(btn)

  let text = document.createElement('span')
  text.innerText = window.location.protocol + "//" + window.location.host + "/" + shortUrl + " " + longUrl
  child.appendChild(text)

  urlList.append(child)
}

function clearLocalStorage() {
  localStorage.clear()
}

function deleteShortUrl(delKeyPhrase) {
  // 按钮
  document.getElementById("delBtn-" + delKeyPhrase).disabled = true;
  document.getElementById("delBtn-" + delKeyPhrase).innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';

  // 从KV中删除
  fetch(window.location.pathname, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd: "del", keyPhrase: delKeyPhrase, password: document.querySelector("#passwordText").value })
  }).then(function (response) {
    return response.json();
  })
    .then(function (myJson) {
      res = myJson;

      // 成功删除
      if (res.status == "200") {
        // 从localStorage中删除
        localStorage.removeItem(delKeyPhrase)

        // 加载localStorage
        loadUrlList()

        document.getElementById("result").innerHTML = "删除成功"
      } else {
        document.getElementById("result").innerHTML = res.error;
      }

      $('#resultModal').modal('show')

    }).catch(function (err) {
      alert("未知错误. 请重试!");
      console.log(err);
    })
}

$(function () {
  $('[data-toggle="popover"]').popover()
})

loadUrlList()
