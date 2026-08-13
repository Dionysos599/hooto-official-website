# HOOTO 花头精 — Official Website

纯静态官网（HTML / CSS / JS），无第三方依赖。

## 本地预览

使用项目脚本预览，会自动刷新并持续监听线上画廊的图片目录：

```bash
bash tools/serve-static.sh 8080
```

然后访问 <http://localhost:8080>。

也可以直接用浏览器打开 `index.html`（部分相对路径在 `file://` 下一般也能用）。

## 质量检查

运行不依赖第三方 npm 软件包的静态质量门禁：

```bash
npm run qa
```

检查包含 JavaScript 语法、本地资源和锚点、重复 ID、图片 `alt`，以及画廊数据是否为最新版本。真实浏览器回归范围与发布验收清单见 [`docs/QA.md`](docs/QA.md)。

## 目录结构

```
index.html            # 首页
style.css             # 首页样式
script.js             # 首页交互

pages/                # 分页面
  art-education.html
  cultural-ip.html
  technology.html
  community-practice.html
  gallery.html
  styles/             # 分页面样式
  scripts/            # 分页面交互与画廊数据

shared/               # 全站共用字体、导航与滚动代码
assets/               # 所有静态资源
  images/brand/       # 品牌 Logo 与二维码
  images/project-covers/
  images/art-education/
  images/cultural-ip/
  images/technology/
  images/community-practice/
  fonts/
  vendor/

tools/                # 画廊清单生成与本地预览脚本
```

## 部署

推送到 `master` 后，GitHub Actions（`.github/workflows/deploy-gh-pages.yml`）会生成响应式 WebP 图片和画廊清单，验证所有衍生图片引用，再把独立的 `_site` 构建目录发布到 `gh-pages` 分支。

如需在本地复现发布构建，请先安装图片依赖并运行：

```bash
python3 tools/generate-image-derivatives.py
node tools/generate-gallery-data.mjs
npm run build:site
```

`_site` 和 `assets/generated` 都是可随时重建的临时目录，不应提交到仓库。
