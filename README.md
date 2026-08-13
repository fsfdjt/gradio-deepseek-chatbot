# 人生小票机

人生小票机是一个轻量、有趣的生活娱乐生成器。用户输入“今天发生了什么”，网站会把这段日常经历生成一张便利店小票风格的人生结账单，适合自娱自乐、发朋友圈、做轻量内容分享。

在线访问：[https://fsfdjt.github.io/gradio-deepseek-chatbot/](https://fsfdjt.github.io/gradio-deepseek-chatbot/)

## 功能亮点

- 输入当天经历，一键生成“人生小票”
- 支持“有点累 / 小确幸 / 倒霉但好笑”等灵感示例，点击后可直接填入输入框
- 自动生成小票标题、明细、折扣、今日总计和收尾文案
- 支持重新打印、切换风格、复制文字、保存图片
- 输入框带文字翻转动效，让打字过程更有趣
- 静态毛玻璃背景，无视频依赖，适合部署到 GitHub Pages
- 已提供原生微信小程序版本基础代码

## 项目结构

```text
.
├─ index.html                 # 网页入口
├─ src/                       # 网页源码
│  ├─ app.js                  # 页面交互入口
│  ├─ receipt-generator.js    # 小票生成逻辑
│  ├─ receipt-templates.js    # 小票文案模板
│  ├─ export-image.js         # 保存图片逻辑
│  ├─ input-text-effect.js    # 输入文字动效
│  ├─ placeholder-cycle.js    # 输入提示轮播
│  └─ styles.css              # 页面样式
├─ docs/                      # GitHub Pages 发布目录
├─ miniprogram/               # 微信小程序版本
├─ tests/                     # 自动化测试
├─ PRD.md                     # 产品需求文档
└─ DEVELOPMENT_PLAN.md        # 开发计划
```

## 本地预览

进入项目目录后启动静态服务器：

```powershell
python -m http.server 4173
```

然后打开：

```text
http://localhost:4173/
```

也可以使用任意静态服务器预览本项目。

## 测试

运行全部测试：

```powershell
npm test
```

当前测试覆盖网页核心生成逻辑、输入动效、背景、部署目录和微信小程序基础结构。

## 代码审查

```powershell
npm run review
```

## 微信小程序

小程序代码位于：

```text
miniprogram/
```

使用微信开发者工具导入时，项目目录选择 `miniprogram`。正式发布前需要在微信公众平台注册小程序，并把 `miniprogram/project.config.json` 中的 `appid` 替换为真实的 `wx...` AppID。

小程序版本目前支持：

- 输入今日事件
- 灵感示例快速填入
- 自动生成小票
- 换风格、重新打印
- 复制文字
- Canvas 生成图片并保存到相册

## 部署到 GitHub Pages

本项目已准备好 `docs/` 静态发布目录。GitHub Pages 推荐设置：

```text
Settings -> Pages
Branch: gh-pages 或 life-receipt-machine
Folder: /docs
```

保存后，公开网址为：

```text
https://fsfdjt.github.io/gradio-deepseek-chatbot/
```

如果手机访问出现 404，通常是 GitHub Pages 设置还没有保存成功，或部署还在生效中。

## 技术栈

- HTML
- CSS
- JavaScript ES Modules
- Node.js test runner
- 微信小程序原生框架
- Critiq code review

## 仓库

[https://github.com/fsfdjt/gradio-deepseek-chatbot](https://github.com/fsfdjt/gradio-deepseek-chatbot)
