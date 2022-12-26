/**
 * Proxy list, e.g. `my.domain`
 *
 * | Proxy | Hostname |
 * |:---------|:---------|
 * | hub.my.domain | github.com |
 * | raw.my.domain | raw.githubusercontent.com |
 * | assets.my.domain | github.githubassets.com |
 * | download.my.domain | codeload.github.com |
 * | object.my.domain | objects.githubusercontent.com |
 * | media.my.domain | media.githubusercontent.com |
 * | gist.my.domain | gist.github.com |
 */
declare const _default: {
    fetch(request: Request, env: ENV, _ctx: ExecutionContext): Promise<Response>;
};

export { _default as default };
