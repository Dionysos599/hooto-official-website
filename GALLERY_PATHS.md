# 线上画廊路径重构提醒

当前自动画廊的数据源：

- `assets/images/cultural-ip/gallery/` → 线上画廊的“文创IP”分页
- `assets/images/art-education/course/` → 线上画廊的“学生成果展”分页

如果以后调整图片文件夹层级或名称，请同步检查：

1. `tools/generate-gallery-data.mjs` 中的 `gallerySources` 路径。
2. `.github/workflows/deploy-gh-pages.yml` 是否仍会运行该生成脚本。
3. `tools/serve-static.sh` 是否仍会在本地预览期间持续生成 `pages/scripts/gallery-data.js`。
4. `pages/gallery.html` 对 `pages/scripts/gallery-data.js`、`pages/scripts/gallery.js` 和 `pages/styles/gallery.css` 的相对路径。
5. `shared/header.js` 中指向 `pages/gallery.html` 两个分页锚点的链接。

`pages/scripts/gallery-data.js` 是自动生成文件，不要手动维护图片名单。调整路径后运行：

```bash
node tools/generate-gallery-data.mjs
```

文创 IP 画廊使用文件名前的两位数字控制四列画面中的行顺序：索引 01–04 是第一行，05–08 是第二行，以此类推。数字前缀只是排版提示，不会改变图片内容；新增图片可以继续使用无前缀文件名，会在带前缀的图片之后按自然顺序排列。
