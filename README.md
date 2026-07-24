# Dem

案例单测静态页（规则执行单测）+ **同源 API 代理**（解决浏览器 CORS）。

## 推荐启动方式（可正常调接口）

纯静态打开（GitHub Pages / htmlpreview / 直接打开文件）时，浏览器会因 **跨域（CORS）** 拦截对上游规则 API 的请求。

请在仓库根目录运行代理服务：

```bash
python3 server.py --port 8080
```

然后访问：

- http://127.0.0.1:8080/
- 或 http://127.0.0.1:8080/index.html

页面默认勾选「使用同源代理」：请求发到同域 `/api/rule/execute`，由 `server.py` 转发到可配置的上游 URL（请求头 `X-Upstream-Url`，默认与页面上的上游 API 一致）。

可选参数：

```bash
python3 server.py --port 8080 --upstream 'http://HOST:PORT/irule/openapi/rule/execute/system'
```

## 页面配置

- **上游 API URL**：真实规则引擎地址（可改）
- **使用同源代理**：建议保持开启；关闭则浏览器直连上游（易遇 CORS）

## 静态预览（仅看 UI，接口通常会失败）

https://htmlpreview.github.io/?https://github.com/Pigdada/Dem/blob/cursor/bc-2d51885b-9935-4d3e-a3f3-45a05674f67b-113f/index.html

## GitHub Pages

合并到 `main` 并在 Settings → Pages → Source 选择 **GitHub Actions** 后：

- https://pigdada.github.io/Dem/

说明：Pages 只能托管静态文件，**不能**提供 `server.py` 代理；线上若要调通接口，需自行部署本仓库的 `server.py`（或等价反向代理）。

## 文件

| 文件 | 说明 |
|------|------|
| `index.html` / `case_single_test.html` | 单测页面（内容同步） |
| `server.py` | 静态资源 + `/api/rule/execute` 代理 |
| `.github/workflows/deploy-pages.yml` | Pages 部署工作流 |
