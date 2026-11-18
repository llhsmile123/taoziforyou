# 🍑 给桃子

一个纯前端的互动表白页。零依赖、零构建，打开就能跑。

## 📁 文件说明

```
.
├── index.html      页面结构与样式
├── app.js          全部交互逻辑
├── bgm.mp3         背景音乐（你的心河 River Flows In You，4:15）
└── README.md
```

## 🚀 部署到 GitHub Pages

### 方式一：网页操作（最简单）

1. 在 GitHub 新建仓库，比如 `for-taozi`，选 **Public**
2. 点 `Add file` → `Upload files`，把本文件夹里**全部文件**拖进去
3. 点 `Commit changes`
4. 进仓库 → `Settings` → 左侧 `Pages`
5. `Source` 选 **Deploy from a branch**
6. Branch 选 `main`，目录选 `/ (root)`，点 `Save`
7. 等 1~2 分钟，访问：

```
https://你的用户名.github.io/for-taozi/
```

### 方式二：命令行

```bash
git init
git add .
git commit -m "给桃子"
git branch -M main
git remote add origin https://github.com/你的用户名/for-taozi.git
git push -u origin main
```

然后在 `Settings → Pages` 里开启即可。

## ⚠️ 三个要注意的点

**1. 文件名必须是 `index.html`**
GitHub Pages 会自动识别根目录下的 `index.html` 作为首页。

**2. 音频文件较大，首次加载会等一下**
`bgm.mp3` 是 4MB，网速慢的话页面能先打开、音乐稍后响起（代码里已经做了异步加载和渐入）。

**3. 必须用 HTTPS 访问**
GitHub Pages 默认就是 HTTPS，没问题。但没有音频自动播放权限时，需要用户点一下（点桃子那一下就是触发点）。

## 🎨 想改点什么

| 想改 | 位置 |
|---|---|
| 文案内容 | `index.html` 里搜 `class="reveal"` 的 `<p>` |
| 主色调 | `index.html` 顶部 `:root` 里的 `--peach` / `--peach-deep` |
| 换首歌 | 直接替换 `bgm.mp3` 文件 |
| 名字「桃子」 | `index.html` 搜 `桃子` |

## 📱 手机效果

已在移动端适配，支持：
- 左右滑动翻页
- 点击粒子爆炸
- 音乐渐入渐出

---

Made with 🍑 for 桃子
