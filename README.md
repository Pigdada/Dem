# Dem

案例单测静态页（规则执行单测）。

## 现在就能打开（推荐）

仓库尚未在 GitHub Settings 中开启 Pages 时，`https://pigdada.github.io/Dem/` 会一直是 **404**。可用下面方式立刻在浏览器里打开页面：

**HTML Preview（渲染 GitHub 上的 HTML）：**

https://htmlpreview.github.io/?https://github.com/Pigdada/Dem/blob/cursor/bc-2d51885b-9935-4d3e-a3f3-45a05674f67b-113f/index.html

（分支合并后，把 URL 里的分支名改成 `main` 即可。）

## GitHub Pages 正式地址

合并到 `main`，并在仓库 **Settings → Pages → Source** 选择 **GitHub Actions** 后，访问：

- https://pigdada.github.io/Dem/
- https://pigdada.github.io/Dem/case_single_test.html

启用后等待 Actions 里 **Deploy GitHub Pages** 成功。本仓库已包含部署工作流：`.github/workflows/deploy-pages.yml`。

## 本地打开

用浏览器直接打开 `index.html` 或 `case_single_test.html`（二者内容相同）。

## 说明

页面会请求外部规则 API；若浏览器拦截跨域（CORS），属接口侧限制，与静态托管无关。
