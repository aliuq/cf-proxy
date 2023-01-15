/**
 * Description: Short domain worker
 * Routes:
 *  - `/new?url=URL`: 创建新的短网址
 *  - `/all`: 获取所有短网址
 *  - `/{short}`: 重定向到原始域名
 */
declare const _default: {
    fetch(request: Request, env: ENV, _ctx: ExecutionContext): Promise<Response>;
};

export { _default as default };
