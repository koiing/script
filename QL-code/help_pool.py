import os
from itertools import zip_longest


path = os.environ.get("help_log")
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

size: int = 6
codes = list(zip_longest(*pools.values(), ""))
while codes:
  batches = list(zip(*codes[:size]))
  codes = codes[size:]
  print("车队")
  for i in range(4):
    print(commands[i] + "&".join([str(j) for j in batches[i]]))
