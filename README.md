# 微服务健康打卡

微服务健康每日报自动打卡脚本

## QX 使用说明

```
[task_local]
1 10 * * * wfw.js, tag=微服务打卡, enabled=true
[rewrite_local]
https:\/\/wfw\.scu\.edu\.cn\/ncov\/wap\/default\/save url script-request-body wfw.js
[mitm]
hostname = wfw.scu.edu.cn
```

## :man_technologist:TODO

- [ ] 适配 Loon
- [ ] 适配 Node.js，结合抓包使用 Github Action 打卡
- [ ] 适配 BoxJS
- [ ] 蹲一个 108×108 [icon](https://imgwfw.scu.edu.cn/image/9/45f3a5e666c9a86a403f7be373ad66cf.png)

## :speak_no_evil:致谢

[@Peng-YM](https://github.com/Peng-YM)
[@NobyDa](https://github.com/NobyDa)
[@zZPiglet](https://github.com/zZPiglet)
[@2YA](https://github.com/dompling)
[@Sunert](https://github.com/Sunert)
[@chavyleung](https://github.com/chavyleung)
