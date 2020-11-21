/***********************************
微服务健康打卡脚本

【QX 使用说明】
[task_local]
1 10 * * * https://raw.githubusercontent.com/oOopc/script/main/wfw.js, tag=微服务打卡, enabled=true
[rewrite_local]
https:\/\/wfw\.scu\.edu\.cn\/ncov\/wap\/default\/save url script-request-body https://raw.githubusercontent.com/oOopc/script/main/wfw.js
[mitm]
hostname = wfw.scu.edu.cn

***********************************/

const $ = API("微服务打卡");

let msgs = "";
let uids = $.read("uids") ? $.read("uids") : [];
let cookies = $.read("wfwCookies") ? JSON.parse($.read("wfwCookies")) : {};
let bodies = $.read("wfwBodies") ? JSON.parse($.read("wfwBodies")) : {};

const date = new Date();
const today =
  "date=" + date.getFullYear() + (date.getMonth() + 1) + date.getDate();
const now = "created=" + Math.round(date.getTime() / 1000);
let headers = {
  "X-Requested-With": `XMLHttpRequest`,
  Connection: `keep-alive`,
  "Accept-Encoding": `identity`,
  "Content-Type": `application/x-www-form-urlencoded; charset=UTF-8`,
  Origin: `https://wfw.scu.edu.cn`,
  "User-Agent": `Mozilla/5.0 (iPad; CPU OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.18(0x17001226) NetType/WIFI Language/zh_CN`,
  Host: `wfw.scu.edu.cn`,
  Referer: `https://wfw.scu.edu.cn/ncov/wap/default/index`,
  "Accept-Language": `en-us`,
  Accept: `application/json, text/javascript, */*; q=0.01`,
};

if ((isGetCookie = typeof $request != `undefined`)) {
  getCookieBody();
  $.done({});
} else {
  !(async () => {
    if (!uids[0]) {
      $.notify($.name, "🔔 请先获取 Cookie!");
      return;
    }
    msgs += `共 ${uids.length} 个账号\n`;
    for (uid of uids) {
      if (uid) {
        cookie = cookies[uid];
        body = bodies[uid];
        const msg = await checkIn();
        msgs +=
          (msg == "操作成功"
            ? "🥳 "
            : msg == "今天已经填报了"
            ? "🧐 "
            : "😩 ") +
          msg +
          "\n";
      }
    }
    if (!$.env.isNode) console.log(msgs);
    $.notify($.name, "", msgs);
    $.done();
  })()
    .catch((e) => {
      console.log(e);
      $.notify($.name, "", "❎原因：" + e.message || e);
    })
    .finally(() => $.done());
}

function getCookieBody() {
  if (
    $request &&
    // $request.method != "OPTIONS" &&
    $request.url.match(/\/ncov\/wap\/default\/save/)
  ) {
    const cookie = $request.headers["Cookie"];
    const body = $request.body;
    const uid = /uid=\d+(?=&)/.exec(body)[0];

    cookies[uid] = cookie;
    bodies[uid] = body;
    cookies = JSON.stringify(cookies);
    bodies = JSON.stringify(bodies);

    if (!uids.includes(uid)) {
      uids.push(uid);
      $.write(uids, "uids");
      $.write(cookies, "wfwCookies");
      $.write(bodies, "wfwBodies");
      $.notify($.name, `🎊 用户${uid}写入成功`);
    } else {
      $.write(cookies, "wfwCookies");
      $.write(bodies, "wfwBodies");
      $.notify($.name, `🎊 用户${uid}更新成功`);
    }
  }
}

function checkIn() {
  const url = `https://wfw.scu.edu.cn/ncov/wap/default/save`;
  headers["Cookie"] = cookie;
  body.replace(/date=\d+(?=&)/, today);
  body.replace(/created=\d+(?=&)/, now);
  let myRequest = {
    url: url,
    headers: headers,
    body: body,
  };
  return $.http.post(myRequest).then((response) => {
    const body = JSON.parse(response.body);
    return body.m;
  });
}

function ENV() {
  const e = "undefined" != typeof $task,
    t = "undefined" != typeof $loon,
    s = "undefined" != typeof $httpClient && !t,
    o = "function" == typeof require && "undefined" != typeof $jsbox;
  return {
    isQX: e,
    isLoon: t,
    isSurge: s,
    isNode: "function" == typeof require && !o,
    isJSBox: o,
    isRequest: "undefined" != typeof $request,
    isScriptable: "undefined" != typeof importModule,
  };
}

function HTTP(e, t = {}) {
  const { isQX: s, isLoon: o, isSurge: i, isScriptable: n, isNode: r } = ENV();
  const u = {};
  return (
    ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"].forEach(
      (l) =>
        (u[l.toLowerCase()] = (u) =>
          (function (u, l) {
            (l =
              "string" == typeof l
                ? {
                    url: l,
                  }
                : l).url = e ? e + l.url : l.url;
            const c = (l = {
                ...t,
                ...l,
              }).timeout,
              h = {
                onRequest: () => {},
                onResponse: (e) => e,
                onTimeout: () => {},
                ...l.events,
              };
            let f, a;
            if ((h.onRequest(u, l), s))
              f = $task.fetch({
                method: u,
                ...l,
              });
            else if (o || i || r)
              f = new Promise((e, t) => {
                (r ? require("request") : $httpClient)[u.toLowerCase()](
                  l,
                  (s, o, i) => {
                    s
                      ? t(s)
                      : e({
                          statusCode: o.status || o.statusCode,
                          headers: o.headers,
                          body: i,
                        });
                  }
                );
              });
            else if (n) {
              const e = new Request(l.url);
              (e.method = u),
                (e.headers = l.headers),
                (e.body = l.body),
                (f = new Promise((t, s) => {
                  e.loadString()
                    .then((s) => {
                      t({
                        statusCode: e.response.statusCode,
                        headers: e.response.headers,
                        body: s,
                      });
                    })
                    .catch((e) => s(e));
                }));
            }
            const d = c
              ? new Promise((e, t) => {
                  a = setTimeout(
                    () => (
                      h.onTimeout(),
                      t(`${u} URL: ${l.url} exceeds the timeout ${c} ms`)
                    ),
                    c
                  );
                })
              : null;
            return (d
              ? Promise.race([d, f]).then((e) => (clearTimeout(a), e))
              : f
            ).then((e) => h.onResponse(e));
          })(l, u))
    ),
    u
  );
}

function API(e = "untitled", t = !1) {
  const {
    isQX: s,
    isLoon: o,
    isSurge: i,
    isNode: n,
    isJSBox: r,
    isScriptable: u,
  } = ENV();
  return new (class {
    constructor(e, t) {
      (this.name = e),
        (this.debug = t),
        (this.http = HTTP()),
        (this.env = ENV()),
        (this.node = (() => {
          if (n) {
            return {
              fs: require("fs"),
            };
          }
          return null;
        })()),
        this.initCache();
      Promise.prototype.delay = function (e) {
        return this.then(function (t) {
          return ((e, t) =>
            new Promise(function (s) {
              setTimeout(s.bind(null, t), e);
            }))(e, t);
        });
      };
    }
    initCache() {
      if (
        (s && (this.cache = JSON.parse($prefs.valueForKey(this.name) || "{}")),
        (o || i) &&
          (this.cache = JSON.parse($persistentStore.read(this.name) || "{}")),
        n)
      ) {
        let e = "root.json";
        this.node.fs.existsSync(e) ||
          this.node.fs.writeFileSync(
            e,
            JSON.stringify({}),
            {
              flag: "wx",
            },
            (e) => console.log(e)
          ),
          (this.root = {}),
          (e = `${this.name}.json`),
          this.node.fs.existsSync(e)
            ? (this.cache = JSON.parse(
                this.node.fs.readFileSync(`${this.name}.json`)
              ))
            : (this.node.fs.writeFileSync(
                e,
                JSON.stringify({}),
                {
                  flag: "wx",
                },
                (e) => console.log(e)
              ),
              (this.cache = {}));
      }
    }
    persistCache() {
      const e = JSON.stringify(this.cache);
      s && $prefs.setValueForKey(e, this.name),
        (o || i) && $persistentStore.write(e, this.name),
        n &&
          (this.node.fs.writeFileSync(
            `${this.name}.json`,
            e,
            {
              flag: "w",
            },
            (e) => console.log(e)
          ),
          this.node.fs.writeFileSync(
            "root.json",
            JSON.stringify(this.root),
            {
              flag: "w",
            },
            (e) => console.log(e)
          ));
    }
    write(e, t) {
      if ((this.log(`SET ${t}`), -1 !== t.indexOf("#"))) {
        if (((t = t.substr(1)), i || o)) return $persistentStore.write(e, t);
        if (s) return $prefs.setValueForKey(e, t);
        n && (this.root[t] = e);
      } else this.cache[t] = e;
      this.persistCache();
    }
    read(e) {
      return (
        this.log(`READ ${e}`),
        -1 === e.indexOf("#")
          ? this.cache[e]
          : ((e = e.substr(1)),
            i || o
              ? $persistentStore.read(e)
              : s
              ? $prefs.valueForKey(e)
              : n
              ? this.root[e]
              : void 0)
      );
    }
    delete(e) {
      if ((this.log(`DELETE ${e}`), -1 !== e.indexOf("#"))) {
        if (((e = e.substr(1)), i || o)) return $persistentStore.write(null, e);
        if (s) return $prefs.removeValueForKey(e);
        n && delete this.root[e];
      } else delete this.cache[e];
      this.persistCache();
    }
    notify(e, t = "", l = "", c = {}) {
      const h = c["open-url"],
        f = c["media-url"];
      if (
        (s && $notify(e, t, l, c),
        i &&
          $notification.post(e, t, l + `${f ? "\n多媒体:" + f : ""}`, {
            url: h,
          }),
        o)
      ) {
        let s = {};
        h && (s.openUrl = h),
          f && (s.mediaUrl = f),
          "{}" == JSON.stringify(s)
            ? $notification.post(e, t, l)
            : $notification.post(e, t, l, s);
      }
      if (n || u) {
        const s =
          l + (h ? `\n点击跳转: ${h}` : "") + (f ? `\n多媒体: ${f}` : "");
        if (r) {
          require("push").schedule({
            title: e,
            body: (t ? t + "\n" : "") + s,
          });
        } else console.log(`${e}\n${t}\n${s}\n\n`);
      }
    }
    log(e) {
      this.debug && console.log(e);
    }
    info(e) {
      console.log(e);
    }
    error(e) {
      console.log("ERROR: " + e);
    }
    wait(e) {
      return new Promise((t) => setTimeout(t, e));
    }
    done(e = {}) {
      s || o || i
        ? $done(e)
        : n &&
          !r &&
          "undefined" != typeof $context &&
          (($context.headers = e.headers),
          ($context.statusCode = e.statusCode),
          ($context.body = e.body));
    }
  })(e, t);
}
