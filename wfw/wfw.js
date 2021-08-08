/***********************************
微服务健康打卡脚本

【QX 使用说明】
BoxJs: https://raw.githubusercontent.com/oOopc/script/main/oOopc.boxjs.json

[task_local]
# 微服务健康打卡
1 10 * * * https://raw.githubusercontent.com/oOopc/script/main/wfw/wfw.js, tag=微服务打卡, enabled=true
[rewrite_local]
https:\/\/wfw\.scu\.edu\.cn\/ncov\/wap\/default\/save url script-request-body https://raw.githubusercontent.com/oOopc/script/main/wfw/wfw.js
[mitm]
hostname = wfw.scu.edu.cn
***********************************/

const $ = API("wfw");

let msgs = "";
let uids = $.read("uids") ? $.read("uids") : [];
let cookies = $.read("cookies") ? JSON.parse($.read("cookies")) : {};
let bodies = $.read("bodies") ? JSON.parse($.read("bodies")) : {};

try {
  const notify = require("./sendNotify");
} catch (error) {
  $.notify(error);
}

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
  (async () => {
    if (!uids[0]) {
      $.notify("SCU 微服务打卡", "🔔 请先获取 Cookie!");
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
    if ($.env.isNode) {
      await notify.sendNotify(`SCU 微服务打卡`, `\n${msgs}`);
    }
    $.notify("微服务打卡", "", msgs);
  })()
    .catch((e) => {
      console.log(e);
      $.notify("微服务打卡", "", "❎原因：" + e.message || e);
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
      $.write(cookies, "cookies");
      $.write(bodies, "bodies");
      $.notify("微服务打卡", `🎊 用户${uid}写入成功`);
    } else {
      $.write(cookies, "cookies");
      $.write(bodies, "bodies");
      $.notify("微服务打卡", `🎊 用户${uid}更新成功`);
    }
  }
}

async function checkIn() {
  const url = `https://wfw.scu.edu.cn/ncov/wap/default/save`;
  headers["Cookie"] = cookie;
  body = body.replace(/date=\d+(?=&)/, today);
  body = body.replace(/created=\d+(?=&)/, now);
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

// prettier-ignore
function ENV(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!t,n="function"==typeof require&&"undefined"!=typeof $jsbox,i="function"==typeof require&&!n,o="undefined"!=typeof $request,r="undefined"!=typeof importModule;return{isQX:e,isLoon:t,isSurge:s,isNode:i,isJSBox:n,isRequest:o,isScriptable:r}}
// prettier-ignore
function HTTP(e={baseURL:""}){function t(t,u){u="string"==typeof u?{url:u}:u;const c=e.baseURL;c&&!a.test(u.url||"")&&(u.url=c?c+u.url:u.url),u.body&&u.headers&&!u.headers["Content-Type"]&&(u.headers["Content-Type"]="application/x-www-form-urlencoded"),u={...e,...u};const h=u.timeout,l={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...u.events};let f,d;if(l.onRequest(t,u),s)f=$task.fetch({method:t,...u});else if(n||i||r)f=new Promise((e,s)=>{const n=r?require("request"):$httpClient;n[t.toLowerCase()](u,(t,n,i)=>{t?s(t):e({statusCode:n.status||n.statusCode,headers:n.headers,body:i})})});else if(o){const e=new Request(u.url);e.method=t,e.headers=u.headers,e.body=u.body,f=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}const p=h?new Promise((e,s)=>{d=setTimeout(()=>(l.onTimeout(),s(`${t} URL: ${u.url} exceeds the timeout ${h} ms`)),h)}):null;return(p?Promise.race([p,f]).then(e=>(clearTimeout(d),e)):f).then(e=>l.onResponse(e))}const{isQX:s,isLoon:n,isSurge:i,isScriptable:o,isNode:r}=ENV(),u=["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"],a=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,c={};return u.forEach(e=>c[e.toLowerCase()]=(s=>t(e,s))),c}
// prettier-ignore
function API(e="untitled",t=!1){const{isQX:s,isLoon:n,isSurge:i,isNode:o,isJSBox:r,isScriptable:u}=ENV();return new class{constructor(e,t){this.name=e,this.debug=t,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(o){const e=require("fs");return{fs:e}}return null})(),this.initCache();const s=(e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)});Promise.prototype.delay=function(e){return this.then(function(t){return s(e,t)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(n||i)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),o){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.root={},e=`${this.name}.json`,this.node.fs.existsSync(e)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.cache={})}}persistCache(){const e=JSON.stringify(this.cache,null,2);s&&$prefs.setValueForKey(e,this.name),(n||i)&&$persistentStore.write(e,this.name),o&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},e=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root,null,2),{flag:"w"},e=>console.log(e)))}write(e,t){if(this.log(`SET ${t}`),-1!==t.indexOf("#")){if(t=t.substr(1),i||n)return $persistentStore.write(e,t);if(s)return $prefs.setValueForKey(e,t);o&&(this.root[t]=e)}else this.cache[t]=e;this.persistCache()}read(e){return this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:(e=e.substr(1),i||n?$persistentStore.read(e):s?$prefs.valueForKey(e):o?this.root[e]:void 0)}delete(e){if(this.log(`DELETE ${e}`),-1!==e.indexOf("#")){if(e=e.substr(1),i||n)return $persistentStore.write(null,e);if(s)return $prefs.removeValueForKey(e);o&&delete this.root[e]}else delete this.cache[e];this.persistCache()}notify(e,t="",a="",c={}){const h=c["open-url"],l=c["media-url"];if(s&&$notify(e,t,a,c),i&&$notification.post(e,t,a+`${l?"\n多媒体:"+l:""}`,{url:h}),n){let s={};h&&(s.openUrl=h),l&&(s.mediaUrl=l),"{}"===JSON.stringify(s)?$notification.post(e,t,a):$notification.post(e,t,a,s)}if(o||u){const s=a+(h?`\n点击跳转: ${h}`:"")+(l?`\n多媒体: ${l}`:"");if(r){const n=require("push");n.schedule({title:e,body:(t?t+"\n":"")+s})}else console.log(`${e}\n${t}\n${s}\n\n`)}}log(e){this.debug&&console.log(`[${this.name}] LOG: ${this.stringify(e)}`)}info(e){console.log(`[${this.name}] INFO: ${this.stringify(e)}`)}error(e){console.log(`[${this.name}] ERROR: ${this.stringify(e)}`)}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){s||n||i?$done(e):o&&!r&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}stringify(e){if("string"==typeof e||e instanceof String)return e;try{return JSON.stringify(e,null,2)}catch(e){return"[object Object]"}}}(e,t)}
