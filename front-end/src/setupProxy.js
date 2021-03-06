const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  if (process.env.REACT_APP_NODE_ENV === "development") {
    app.use(
      "/api",
      createProxyMiddleware({
        target: "http://localhost:4000",
        changeOrigin: true,
        pathRewrite: { [`^/api/`]: "/" },
      })
    );
  }
};
