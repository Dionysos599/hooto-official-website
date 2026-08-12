# HOOTO 花头精 — Official Website

纯静态官网（HTML / CSS / JS），无第三方依赖。

## 本地预览

使用项目脚本预览，会自动刷新并持续监听线上画廊的图片目录：

```bash
bash tools/serve-static.sh 8080
```

然后访问 <http://localhost:8080>。

也可以直接用浏览器打开 `index.html`（部分相对路径在 `file://` 下一般也能用）。

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

推送到 `master` 后，GitHub Actions（`.github/workflows/deploy-gh-pages.yml`）会自动发布到 `gh-pages` 分支。
