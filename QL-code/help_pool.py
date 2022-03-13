import os
from itertools import zip_longest


path = "/ql/log/okyyds_yyds_master_jd_get_share_code"
commands = ["/farm ", "/pet ", "/bean ", "/sgmh "]
pools = {
    "京东农场": [],
    "京东萌宠": [],
    "种豆得豆": [],
    "闪购盲盒": []
}


def get_latest_log(path):
  files = os.listdir(path)
  paths = [os.path.join(path, basename) for basename in files]
  return max(paths, key=os.path.getctime)
  # return "./help_codes.log"


with open(get_latest_log(path), "r", encoding="utf-8") as f:
  while line := f.readline():
    idx1 = line.find("）") + 1
    idx2 = line.find("】")
    if idx1 > 0 and idx2 > 0 and line[idx1:idx2] in pools.keys():
      pools[line[idx1:idx2]].append(line[idx2 + 1:-1])

i = 0
codes = list(zip_longest(*pools.values(), ""))
while codes:
  batches = list(zip(*codes[:5]))
  codes = codes[5:]
  i += 1
  print(f"车队{i}")
  for j in range(4):
    print(commands[j] + "&".join(batches[j]))
