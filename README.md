# 人生小票机

一个把今天的小事打印成趣味小票的静态网页应用。用户输入当天发生的事，网站会生成一张带有便利店小票风格的“人生结账单”，适合轻量娱乐、分享和快速演示。

## 功能

- 输入今日事件并生成小票
- 支持“有点累 / 小确幸 / 倒霉但好笑”等灵感示例
- 支持重新打印、切换风格、复制文字、保存图片
- 输入框包含文字翻转动效
- 静态毛玻璃背景，适合直接部署到 GitHub Pages

## 本地预览

```powershell
python -m http.server 4173
```

然后打开：

```text
http://localhost:4173/
```

## 测试

```powershell
node --test tests/*.test.js
```

## 项目结构

```text
index.html
src/
tests/
assets/
```

## 技术栈

- HTML
- CSS
- JavaScript ES Modules
- Node.js test runner
