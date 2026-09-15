# 网站质量检查

## 自动检查

本项目的质量检查不依赖第三方 npm 软件包。在仓库根目录运行：

```bash
npm run qa
```

该命令依次检查：

- 项目 JavaScript 与 Node.js 脚本的语法（不重复检查已固定版本的第三方资源）；
- 六个公开页面引用的本地 `href`、`src` 与 `srcset` 文件；
- 页面内及公开页面之间的锚点、重复 `id`，以及图片是否提供 `alt` 属性；
- 重新生成画廊清单后，提交版本是否仍为最新版本。

也可以使用 `npm run check:js`、`npm run check:site` 或 `npm run check:generated` 单独执行检查。`check:generated` 会重新写入画廊数据；如该检查失败，请检查生成结果并提交应该保留的变更。

GitHub Actions 会在 Pull Request、推送到 `master` 以及手动触发时运行相同检查。正式部署任务必须等待 QA 任务成功。

## 真实页面回归清单

发布前使用 `bash tools/serve-static.sh 8080` 启动本地网站，并至少检查以下项目：

1. 在 360px、600px、900px 和 1440px 视口检查首页及五个子页面，无水平溢出或文字遮挡。
2. 仅使用键盘验证导航、项目链接、画廊标签页、轮播、二维码及商店弹窗；焦点始终可见，`Escape` 可关闭弹窗且焦点返回触发按钮。
3. 验证首页项目滚动切换、画廊左右方向键、浏览器前进/后退和所有站内链接。
4. 开启 `prefers-reduced-motion: reduce`，确认不再出现不必要的平滑滚动或自动动画。
5. 对六个公开页面分别运行 Lighthouse 移动端与桌面端测试，记录 Performance、Accessibility、Best Practices、SEO、LCP、CLS 和 TBT。
6. Accessibility、Best Practices 与 SEO 的目标分数均不低于 90；不得存在严重无障碍错误、本地断链或核心交互失败。

Lighthouse 分数会受运行设备和浏览器环境影响，因此 CI 目前只执行可稳定复现的静态门禁；真实浏览器结果应在发布前保留为人工验收记录。
