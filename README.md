# 微服务健康打卡

微服务健康每日报自动打卡脚本, 支持多账号.

## QX 使用说明

适用于 QX 用户, 添加如下配置:

```text
[task_local]
1 10 * * * https://raw.githubusercontent.com/oOopc/script/main/wfw/wfw.js, tag=微服务打卡, enabled=true
[rewrite_local]
https:\/\/wfw\.scu\.edu\.cn\/ncov\/wap\/default\/save url script-request-body https://raw.githubusercontent.com/oOopc/script/main/wfw/wfw.js
[mitm]
hostname = wfw.scu.edu.cn
```

在BoxJs添加订阅: https://raw.githubusercontent.com/oOopc/script/main/oOopc.boxjs.json , 填写sckey(选填), 手动签到一次获取cookie后禁用重写即可.

## Node.js 使用说明

登录[微服务健康每日报](https://wfw.scu.edu.cn/ncov/wap/default/index)签到并抓取 `https://wfw.scu.edu.cn/ncov/wap/default/save` 的请求头中 `cookie` 和 请求体 `body`. 没抓过, 自己抓吧, 应该在`DevTools` > `Network`? (欢迎抓到的同学pr或issue :hugs:)

在[这里](http://sc.ftqq.com/3.version)获取ServerChan的sckey, 并绑定微信, 用于将打卡结果推送到微信, 无此需求者留空即可.

`npm install` 安装依赖, 初次运行 `node ./wfw/wfw.js` 生成 `wfw.json`, 将sckey和抓包所得的 `cookie`、`body` 及其中的 `uid` 按下列格式填入 `wfw.json`, 配合Github Actions或其它自动化工具自动打卡.

```json
{
  "uids": ["uid=123456", "uid=654321"],
  "sckey": "",
  "cookies": "{\"uid=123456\": \"UUkey=...; eai-sess=...\",\"uid=654321\": \"UUkey=...; eai-sess=...\"}",
  "bodies": "{\"uid=123456\": \"sfjxhsjc=1&...&uid=123456bd&...\",\"uid=654321\": \"sfjxhsjc=1&...&uid=654321bd&...\"}"
}
```

### Github Actions

`Fork`此项目, 在 `Settings` > `Secrets` > `New repository secret` 新建 secret, Name 为 `Authorization`, Value 为前述 `wfw.json` 中内容. 创建完成后在 `Actions` 下手动运行一次检验是否成功.

## :man_technologist:TODO

- [x] 适配 Node.js
- [x] 配置使用 Github Actions 打卡
- [x] 适配 BoxJs
- [ ] 蹲一个 108×108 [icon](https://imgwfw.scu.edu.cn/image/9/45f3a5e666c9a86a403f7be373ad66cf.png)

## :warning: 声明

当您使用此脚本时, 默认您同意如下声明:

此脚本只用于学习和测试用途, 使用者应于下载后24小时内删除. 由于使用此脚本导致的不良后果, 包括但不限于个人隐私泄露、打卡延误、打卡信息误报和打卡信息瞒报以及未按规定隔离造成的疫情事故等, 由使用者自行承担.

谢谢合作 :handshake:.

## :speak_no_evil:致谢

[@Peng-YM](https://github.com/Peng-YM)
[@zZPiglet](https://github.com/zZPiglet)
[@2YA](https://github.com/dompling)
[@NobyDa](https://github.com/NobyDa)
[@chavyleung](https://github.com/chavyleung)
[@Sunert](https://github.com/Sunert)

& @Sansshen 对声明的修改.

& 配合我抓包测试多账号的室友们.
