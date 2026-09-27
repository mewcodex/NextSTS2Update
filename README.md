# Next STS2 Patch? / 下一次塔2更新？

虚构的 v0.112.0 更新公告生成器。纯静态 HTML、CSS、JavaScript；每次点击都在浏览器本地按规则生成，无需 API、LLM 或构建步骤。

## 本地预览

在本目录运行 `python -m http.server 8765`，打开 `http://localhost:8765/`。由于卡牌目录通过 `fetch` 加载，直接双击 `index.html` 可能受浏览器的本地文件限制。

## GitHub Pages

此仓库已经把 `index.html`、`style.css`、`app.js`、`cards.json` 放在根目录，并包含 `.nojekyll`。在 GitHub 仓库的 **Settings → Pages** 中选择 **Deploy from a branch**、**main**、**/(root)**，保存后即可发布。无需 GitHub Actions。资源均为相对路径，支持项目子路径 `https://mewcodex.github.io/NextSTS2Update/`。

## 数据和生成规则

- `cards.json` 从同一工作区的 `chaos/ChaosCardGenerator/Data/native_reference_cards.json` 提取，只保留角色和无色卡池中在图鉴显示的卡牌，共 463 张。`build_cards.py` 可在源目录更新后重新提取。
- 普通调整以原始和升级数值为基础；三位重复数字按 111 递增或递减，整百数字按百位调整。
- 重做、新卡名称和效果、开场语、设计说明、界面项、虚构修复项和模组项都由独立的双语词库组合。
- 公告层级与语气参考了 [Steam 上 v0.100.0 至 v0.111.0 的 Beta 更新日志](https://store.steampowered.com/news/app/2868840)。这不是官方公告。

所有页面内容仅供娱乐。Steam 和 Slay the Spire 2 名称属于各自权利人。
页面使用 `ST3AM` 戏仿标识；横幅与游戏封面由官方图片 CDN 加载，断网时仍可使用公告生成器。
