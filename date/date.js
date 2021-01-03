/***********************************
约会记录脚本

【QX 使用说明】
BoxJs: https://raw.githubusercontent.com/oOopc/script/main/oOopc.boxjs.json

[task_local]
20 * * * * https://raw.githubusercontent.com/oOopc/script/main/date/date.js, tag=约会啦, enabled=true

***********************************/

const $ = API("date");

const now = new Date();
const dates = JSON.parse($.read("dates"));
const mediaImg = $.read("mediaImg");
let status = "";

(async () => {
  for (const [i, date] of dates.entries()) {
    const [start, end, location] = await parseDate(date);
    status += (await dateStatus(start, end, location, i)) + "\n";
  }
  if (!$.env.isNode) console.log(`${status}`);
  $.notify("异地恋的约会记录", "😂", status, {
    "media-url": mediaImg,
  });
})()
  .catch((e) => {
    console.log(e);
    $.notify("异地恋的约会记录", "❎原因：", e.message || e);
  })
  .finally(() => $.done());

async function parseDate(date) {
  let start = date[0].split("-");
  let end = date[1].split("-");
  let location = date[2];

  start = {
    year: parseInt(start[0]),
    month: parseInt(start[1]) - 1,
    day: parseInt(start[2]),
    hour: parseInt(start[3]),
    minute: parseInt(start[4]),
  };
  end = {
    year: parseInt(end[0]),
    month: parseInt(end[1]) - 1,
    day: parseInt(end[2]),
    hour: parseInt(end[3]),
    minute: parseInt(end[4]),
  };

  start = new Date(...Object.values(start));
  end = new Date(...Object.values(end));
  return [start, end, location];
}

async function dateStatus(start, end, location, i) {
  if (now.getTime() < start.getTime()) {
    const gap = await timeGap(now, start);
    return `距第${i + 1}次 在${location}的约会😆\n  还剩 ${gap}`;
  } else if (now.getTime() > end.getTime()) {
    const gap = await timeGap(end, now);
    return `距第${i + 1}次 在${location}的约会😢\n  已过 ${gap}`;
  } else {
    const gap1 = await timeGap(start, now);
    const gap2 = await timeGap(now, end);
    return `正在${location}约会🥰\n  已过 ${gap1}\n  还剩 ${gap2}`;
  }
}

async function timeGap(former, later) {
  const zip = (a, b) =>
    a.map((e, i) => (e ? e + b[i] : "")).reduce((acc, cur) => acc + cur);
  const gap = later.getTime() - former.getTime();

  var days = Math.floor(gap / (24 * 3600 * 1000));
  var leave1 = gap % (24 * 3600 * 1000);
  var hours = Math.floor(leave1 / (3600 * 1000));
  var leave2 = leave1 % (3600 * 1000);
  var minutes = Math.floor(leave2 / (60 * 1000));
  var leave3 = leave2 % (60 * 1000);
  var seconds = Math.round(leave3 / 1000);

  return zip(
    [days, hours, minutes, seconds],
    [" 天 ", " 小时 ", " 分钟 ", " 秒"]
  );
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
