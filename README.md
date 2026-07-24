# Dem

案例单测静态页（规则执行单测）。

## 在线访问

合并到 `main` 并启用 GitHub Pages（Settings → Pages → Source 选 **GitHub Actions**）后：

- 站点首页：https://pigdada.github.io/Dem/
- 同内容备用路径：https://pigdada.github.io/Dem/case_single_test.html

首次启用后，等待 Actions 中 **Deploy GitHub Pages** 工作流成功即可。

### 无需 Pages 时的即时预览（jsDelivr）

推送到本仓库任意分支后，可用（将 `BRANCH` 换成实际分支名）：

```text
https://cdn.jsdelivr.net/gh/Pigdada/Dem@BRANCH/index.html
```

当前功能分支示例：

```text
https://cdn.jsdelivr.net/gh/Pigdada/Dem@cursor/bc-2d51885b-9935-4d3e-a3f3-45a05674f67b-113f/index.html
```

## 本地打开

用浏览器直接打开 `index.html` 或 `case_single_test.html` 即可（二者内容相同）。

## 说明

页面会请求外部规则 API；若浏览器拦截跨域（CORS），属接口侧限制，与静态托管无关。
