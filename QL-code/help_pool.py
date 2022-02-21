import os

path = "/ql/log/okyyds_yyds_master_jd_get_share_code"
pools = {
    "京东农场": "/farm ",
    "京东萌宠": "/pet ",
    "种豆得豆": "/bean ",
    "闪购盲盒": "/sgmh "
}


def get_latest_log(path):
  files = os.listdir(path)
  paths = [os.path.join(path, basename) for basename in files]
  return max(paths, key=os.path.getctime)


with open(get_latest_log(path), "r", encoding="utf-8") as f:
  while line := f.readline():
    idx1 = line.find("）") + 1
    idx2 = line.find("】")
    if idx1 > 0 and idx2 > 0 and line[idx1:idx2] in pools.keys():
      pools[line[idx1:idx2]] += line[idx2 + 1:-1] + "&"

for k, v in pools.items():
  print(f"{k}：{v[:-1]}")
