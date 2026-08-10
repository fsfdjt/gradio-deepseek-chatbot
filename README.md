# 人生小票机

人生小票机是一个轻量、有趣的静态网页应用。用户输入今天发生的一件小事，网站会把它生成成一张便利店小票风格的“人生结账单”，适合娱乐、分享和快速演示。

## 功能

- 输入今日事件，一键生成人生小票
- 支持“有点累 / 小确幸 / 倒霉但好笑”等灵感示例
- 支持重新打印、切换风格、复制文字、保存图片
- 输入框带文字翻转动画
- 静态毛玻璃背景，无视频依赖，适合直接部署到 GitHub Pages

## 本地预览

```powershell
python -m http.server 4173
```

打开：

```text
http://localhost:4173/
```

## 测试

```powershell
node --test tests/*.test.js
```

## 代码审查

```powershell
npm run review
```

## 项目结构

```text
index.html
src/
  app.js
  receipt-generator.js
  receipt-templates.js
  export-image.js
  input-text-effect.js
  placeholder-cycle.js
  styles.css
tests/
assets/
```

## 技术栈

- HTML
- CSS
- JavaScript ES Modules
- Node.js test runner
- Critiq code review

## 部署建议

这是一个纯静态项目，可以直接部署到 GitHub Pages、Vercel、Netlify 或任意静态文件服务器。
