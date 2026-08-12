# 线上画廊路径重构提醒

当前自动画廊的数据源：

- `sub1/` → 线上画廊的“文创IP”分页
- `sub2/course/` → 线上画廊的“学生成果展”分页

如果以后调整图片文件夹层级或名称，请同步检查：

1. `scripts/generate-gallery-data.mjs` 中的 `gallerySources` 路径。
2. `.github/workflows/deploy-gh-pages.yml` 是否仍会运行该生成脚本。
3. `scripts/serve-static.sh` 是否仍会在本地预览期间持续生成 `gallery-data.js`。
4. `sub/gallery.html` 对 `gallery-data.js`、`gallery.js` 和 `gallery.css` 的相对路径。
5. `site-header.js` 中指向 `sub/gallery.html` 两个分页锚点的链接。

`gallery-data.js` 是自动生成文件，不要手动维护图片名单。调整路径后运行：

```bash
node scripts/generate-gallery-data.mjs
```
