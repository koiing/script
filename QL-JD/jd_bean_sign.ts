import axios from "axios";
import { readFileSync, writeFileSync, unlinkSync } from "fs";
import { execSync } from "child_process";
import { requireConfig } from "./TS_USER_AGENTS";

const notify = require("./sendNotify");

async function main() {
  let cookiesArr: string[] = await requireConfig();
  cookiesArr = cookiesArr.map((val) => {
    return `{"cookie": "${val}"}`;
  });
  let OtherKey: string = `[${cookiesArr.join(",")}]`;

  let nobydaScript: any;
  try {
    nobydaScript = await axios.get(
      "https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js",
      { timeout: 5000 }
    );
    nobydaScript = nobydaScript.data;
  } catch (e) {
    try {
      nobydaScript = await axios.get(
        "https://ghproxy.com/https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js",
        { timeout: 10000 }
      );
      nobydaScript = nobydaScript.data;
    } catch (e) {
      nobydaScript = "非脚本问题！网络错误，访问github失败";
    }
  }

  if (nobydaScript.indexOf("京东多合一签到脚本") > -1) {
    nobydaScript = nobydaScript
      .replace("var OtherKey = ``", `var OtherKey = '${OtherKey}'`)
      .replace(/qRKHmL4sna8ZOP9F/g, "ztmFUCxcPMNyUq0P");
    writeFileSync("./sign.js", nobydaScript, "utf-8");
    execSync("node ./sign.js>>./sign.log");
    let message = readFileSync("./sign.log", "utf-8") + "\r\n";
    const regexp = /【签到号[\s\S]*?\r?\n\r?\n[\s\S]*?\r?\n\r?\n/g;
    message = [...message.matchAll(regexp)].join("");
    console.log(message);
    await notify.sendNotify(
      "JD签到All in One",
      message,
      "",
      "\n\n你好，世界！"
    );
    unlinkSync("./sign.js");
    unlinkSync("./sign.log");
    unlinkSync("./CookieSet.json");
  } else {
    await notify.sendNotify(`多合一签到`, nobydaScript, "", "\n\n你好，世界！");
  }
}

main().then();
