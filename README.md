# HOOTO 花头精 — Official Website

纯静态官网（HTML / CSS / JS），无构建、无依赖。

## 本地预览

用任意静态服务器打开根目录即可，例如：

```bash
python3 -m http.server 8080
```

然后访问 <http://localhost:8080>。

也可以直接用浏览器打开 `index.html`（部分相对路径在 `file://` 下一般也能用）。

## 目录结构

```
index.html          # 首页
styles.css          # 首页样式
script.js           # 首页交互（项目滚动叙事等）

sub/                # 案例子页
  ip.html             # IP 与文创
  summer.html         # 暑期课程
  technology.html     # 科技探索
  collaboration.html  # 合作与作品
subpage.css         # 子页共用样式
subpage.js          # 子页共用脚本

image/              # 首页图片（Logo 等）
sub1/               # IP / 文创素材
sub2/               # 暑期课程素材
sub3/               # 合作作品素材
```

## 部署

推送到 `master` 后，GitHub Actions（`.github/workflows/deploy-gh-pages.yml`）会自动发布到 `gh-pages` 分支。
