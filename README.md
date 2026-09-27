# Next STS2 Patch? / 下一次塔2更新？

虚构的 v0.112.0 更新公告生成器。纯静态 HTML、CSS、JavaScript；每次点击都在浏览器本地按规则生成，无需 API、LLM 或构建步骤。

## 本地预览

在本目录运行 `python -m http.server 8765`，打开 `http://localhost:8765/`。卡牌和世界资料通过 `fetch` 加载，直接双击 `index.html` 可能受浏览器的本地文件限制。

## GitHub Pages

此仓库已经把 `index.html`、`style.css`、生成器脚本、`cards.json`、`world.json` 和截图组件放在根目录，并包含 `.nojekyll`。在 GitHub 仓库的 **Settings → Pages** 中选择 **Deploy from a branch**、**main**、**/(root)**，保存后即可发布。无需 GitHub Actions。资源均为相对路径，支持项目子路径 `https://mewcodex.github.io/NextSTS2Update/`。

## 数据和生成规则

- `cards.json` 从同一工作区的 `chaos/ChaosCardGenerator/Data/native_reference_cards.json` 提取，完整收录该 v111 原生参考资料中的 567 张牌，包括角色、无色、诅咒、状态、事件、任务、衍生和废弃类别；其中 482 张为角色及无色常规卡牌（含基础牌）。资料明确不含仅限多人游戏使用的卡牌和测试牌。`build_cards.py` 可在源目录更新后重新提取。
- `world.json` 收录参考资料中的全部 111 名敌人、289 件遗物和 8 名先古之民及其选项池，使用游戏本地化文件核对中文名称。普通、精英、首领敌人及全部常规遗物稀有度均参与随机抽取；先古遗物留在先古之民栏。`build_world.py` 可以重建此目录，并已纳入 v0.110.0、v0.111.0 公告中的已知数值变动。
- `card-generator.js` 采用卡牌框架、核心效果和附加效果的精简模块组合方式，生成攻击、技能和能力牌的一部分合理效果。组件按角色与牌型约束，并确保升级数值更强。
- 普通调整以原始和升级数值为基础；三位重复数字按 111 递增或递减，整百数字按百位调整。
- 升级／未升级版本、消耗关键词、费用、稀有度、敌人进阶数值及意图、整体规则、遗物、事件、文本与本地化、重做、新卡名称和效果、开场语、设计说明、界面项、虚构修复项和模组项都由独立的双语词库组合。升级后加入消耗仅用于原本通过升级移除消耗、且升级仍有其他收益的卡牌。新增卡牌约每六次公告出现一次。
- “下载截图”导出活动导航、标题、公告正文和底部互动区，排除右栏并采用适合阅读的窄边距。截图在浏览器本地生成，不上传。
- 公告层级与语气参考了 [Steam 上 v0.100.0 至 v0.111.0 的 Beta 更新日志](https://store.steampowered.com/news/app/2868840)。这不是官方公告。

所有页面内容仅供娱乐。Steam 和 Slay the Spire 2 名称属于各自权利人。
页面使用 `STSAM` 戏仿标识；横幅与游戏封面由官方图片 CDN 加载，断网时仍可使用公告生成器。
截图功能使用本地附带的 [html2canvas](https://html2canvas.hertzen.com/)（MIT 许可，见 `html2canvas-LICENSE.txt`）。
