/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	DOMAIN: string;
}

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
let domainMaps: Record<string, string> = {}
let reverseDomainMaps: Record<string, string> = {}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (!env.DOMAIN) {
			return new Response(
				'DOMAIN is not defined, Please sepecify DOMAIN in your worker config',
				{ status: 500 }
			)
		}

		domainMaps = {
			[`hub.${env.DOMAIN}`]: 'github.com',
			[`assets.${env.DOMAIN}`]: 'github.githubassets.com',
			[`raw.${env.DOMAIN}`]: 'raw.githubusercontent.com',
			[`download.${env.DOMAIN}`]: 'codeload.github.com',
			[`object.${env.DOMAIN}`]: 'objects.githubusercontent.com',
			[`media.${env.DOMAIN}`]: 'media.githubusercontent.com',
			[`gist.${env.DOMAIN}`]: 'gist.github.com',
		}
		reverseDomainMaps = Object.fromEntries(Object.entries(domainMaps).map(arr => arr.reverse()))
		
		const url = new URL(request.url)
		if (url.host in domainMaps) {
			url.host = domainMaps[url.host]
			if (url.port !== '80' && url.port !== '443') {
				url.port = url.protocol === 'https:' ? '443' : '80'
			}
			const headers = new Headers(request.headers)
			headers.set('reason', 'mirror of China')
			const newRequestInit = {
				redirect: 'manual',
				headers,
			}
			const newRequest = new Request(url.toString(), new Request(request, newRequestInit));
			return proxy(url, newRequest)
		}
		return new Response(`Unsupported host ${url.host}`, { status: 200 })
	}
};

async function proxy(url: URL, request: Request) {
	try {
		const res = await fetch(url.toString(), request)
		const headers = res.headers
		const newHeaders = new Headers(headers)
		const status = res.status
	
		if (newHeaders.has('location')) {
			let loc = newHeaders.get('location')
			if (loc) {
				try {
					const locUrl = new URL(loc)
					if (locUrl.host in reverseDomainMaps) {
						locUrl.host = reverseDomainMaps[locUrl.host]
						newHeaders.set('location', locUrl.toString())
					}
				} catch (e) {
					console.error(e)
				}
			}
		}
	
		newHeaders.set('access-control-expose-headers', '*')
		newHeaders.set('access-control-allow-origin', '*')
	
		newHeaders.delete('content-security-policy')
		newHeaders.delete('content-security-policy-report-only')
		newHeaders.delete('clear-site-data')
	
		if (res.headers.get('content-type')?.indexOf('text/html') !== -1) {
			const body = await res.text()
			const regAll = new RegExp(Object.keys(reverseDomainMaps).map((r: string) => `(https?://${r})`).join('|'), 'g')
			const newBody = body
				// Replace all hostname to proxy domain
				.replace(regAll, (match) => {
					return match.replace(/^(https?:\/\/)(.*?)$/g, (m, p1, p2) => {
						return reverseDomainMaps[p2] ? `${p1}${reverseDomainMaps[p2]}` : m
					})
				})
				// Avoid integrity error
				.replace(/integrity=\".*?\"/g, '')

			return new Response(newBody, {
				status,
				headers: newHeaders,
			})
		}
	
		return new Response(res.body, {
			status,
			headers: newHeaders
		})
	} catch (e: any) {
		console.error(e)
		return new Response(e.message, { status: 500 })
	}
}
