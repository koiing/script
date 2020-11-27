# 微服务健康打卡

微服务健康每日报自动打卡脚本, 支持多账号.

## QX 使用说明

添加如下配置:

```text
[task_local]
1 10 * * * https://raw.githubusercontent.com/oOopc/script/main/wfw.js, tag=微服务打卡, enabled=true
[rewrite_local]
https:\/\/wfw\.scu\.edu\.cn\/ncov\/wap\/default\/save url script-request-body https://raw.githubusercontent.com/oOopc/script/main/wfw.js
[mitm]
hostname = wfw.scu.edu.cn
```

手动签到一次获取cookie后禁用重写即可.

## Node.js 使用说明

登录[微服务健康每日报](https://wfw.scu.edu.cn/ncov/wap/default/index)签到并抓包, 没抓过, 自己~抓吧~.

在[这里](http://sc.ftqq.com/3.version)获取ServerChan的sckey, 并绑定微信, 用于将打卡结果推送到微信, 无此需求者留空即可.

`npm install` 安装依赖, 初次运行 `node wfw.js` 生成 `微服务打卡.json`, 将sckey和抓包所得的 `cookie`、`body` 及其中的 `uid` 按下列格式填入, 配合cron或Task Scheduler自动打卡.

```json
{
  "uids": ["uid=123456", "uid=654321"],
  "sckey": "",
  "wfwCookies": "{\"uid=123456\": \"UUkey=...; eai-sess=...\",\"uid=654321\": \"UUkey=...; eai-sess=...\"}",
  "wfwBodies": "{\"uid=123456\": \"sfjxhsjc=1&...&uid=123456bd&...\",\"uid=654321\": \"sfjxhsjc=1&...&uid=654321bd&...\"}"
}
```

### Github Actions

`Fork`此项目, 在 `Settings` > `Secrets` > `New repository secret` 新建 secret, Name 为 `Authorization`, Value 为 `微服务打卡.json` 中内容. 创建完成后在 `Actions` 下手动运行一次检验是否成功.

## :man_technologist:TODO

- [x] 适配 Node.js, ~~适配 Loon~~
- [x] 配置使用 Github Actions 打卡
- [ ] 适配 BoxJs
- [ ] 蹲一个 108×108 [icon](https://imgwfw.scu.edu.cn/image/9/45f3a5e666c9a86a403f7be373ad66cf.png)

## :speak_no_evil:致谢

[@Peng-YM](https://github.com/Peng-YM)
[@NobyDa](https://github.com/NobyDa)
[@zZPiglet](https://github.com/zZPiglet)
[@2YA](https://github.com/dompling)
[@Sunert](https://github.com/Sunert)
[@chavyleung](https://github.com/chavyleung)

& 配合我抓包测试多账号的室友们.

&
