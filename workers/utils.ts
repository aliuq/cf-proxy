export async function replyText(text: string, env: ENV, init: ResponseInit = {}): Promise<Response> {
  return new Response(text, deepMerge({
    status: 200,
    headers: { 'content-type': 'text/plain;charset=UTF-8', 'version': env.VERSION },
  }, init))
}

export async function replyHtml(html: string, env: ENV, init: ResponseInit = {}): Promise<Response> {
  return new Response(html, deepMerge({
    status: 200,
    headers: { 'content-type': 'text/html;charset=UTF-8', 'version': env.VERSION },
  }, init))
}

export async function replyUnsupport(options: {}, env: ENV, init: ResponseInit = {}): Promise<Response> {
  return new Response(renderTemplate('Unsupported url {{ url }}', options), deepMerge({
    status: 200,
    headers: { 'content-type': 'text/plain;charset=UTF-8', 'version': env.VERSION },
  }, init))
}

export async function replyJson(json: any, env: ENV, init: ResponseInit = {}): Promise<Response> {
  return new Response(JSON.stringify(json), deepMerge({
    status: 200,
    headers: { 'content-type': 'application/json;charset=UTF-8', 'version': env.VERSION },
  }, init))
}

/** Get domain and subdomain from request url, for more custom domain mode,
 * if set only one domain, such as `foo.example.com`, you can ingore this function
 *
 * @example foo.example.com => { domain: 'example.com', subdomain: 'foo' }
 * @example example.com => { domain: 'example.com', subdomain: '' }
 * @example foo.localhost => { domain: 'localhost', subdomain: 'foo' }
 * @example localhost => { domain: 'localhost', subdomain: '' }
 * @example localhost:8787 => { domain: 'localhost:8787', subdomain: '' }
 */
export function getDomainAndSubdomain(request: Request): { domain: string; subdomain: string } {
  const url = new URL(request.url)
  const hostArr = url.host.split('.')
  let subdomain = ''
  let domain = ''
  if (url.hostname.endsWith('localhost')) {
    subdomain = hostArr.length === 1 ? '' : hostArr[0]
    domain = hostArr.length === 1 ? hostArr[0] : hostArr.slice(1).join('.')
  }
  else {
    subdomain = hostArr.length > 2 ? hostArr[0] : ''
    domain = hostArr.length > 2 ? hostArr.slice(1).join('.') : hostArr.join('.')
  }
  return { domain, subdomain }
}

/** Need cancel a request when request url contains some string, such as `favicon.ico`, `sw.js`
 * + `true` means need cancel request
 *
 * @param request
 * @param matches
 * @returns
 */
export async function needCancelRequest(request: Request, matches: string[] = []): Promise<Response | undefined> {
  const url = new URL(request.url)
  matches = matches.length
    ? matches
    : [
      '/favicon.',
      '/sw.js',
    ]
  const isCancel = matches.some(match => url.pathname.includes(match))
  if (isCancel)
    return replyText('', {} as any, { status: 204 })
}

/** Render template, Replace `{{ key }}` with `data[key]`
 *
 * @example renderTemplate('Hello {{ name }}', { name: 'world' }) => 'Hello world'
 */
export function renderTemplate(content: string, data: Record<string, any>) {
  return content.replace(/\{{\s*([a-zA-Z0-9_]+)\s*}}/g, (match, key) => {
    return data[key] || ''
  })
}

/** Deep merge object
 *
 * This function takes in a target object and an array of source objects,
 * and deeply merges the properties of the source objects into the target object.
 * If both the target and a source object have a property with the same key,
 * the value from the source object will overwrite the value in the target.
 * If the value at the key in the source object is an object,
 * the function will recursively call itself to merge the values of those objects as well.
 *
 * @example
 *  ```ts
 *  const target = { a: 1, b: 2, c: { d: 3 } };
 *  const source1 = { b: 3, c: { e: 4 } };
 *  const source2 = { c: { f: 5 } };
 *
 *  deepMerge(target, source1, source2);
 *
 *  console.log(target); // { a: 1, b: 3, c: { d: 3, e: 4, f: 5 } }
 *  ```
*/
function deepMerge(target: any, ...sources: any[]): any {
  // Iterate through each source object
  for (const source of sources) {
    // If the target and source are both objects, we'll merge them recursively
    if (isObject(target) && isObject(source)) {
      for (const key in source) {
        if (isObject(source[key])) {
          // If the value at the current key is an object, we'll merge it recursively
          if (!target[key]) {
            // If the target doesn't have a value at the current key, we'll create an empty object to merge into
            target[key] = {}
          }
          deepMerge(target[key], source[key])
        }
        else {
          // If the value at the current key is not an object, we'll just overwrite the value in the target with the value in the source
          target[key] = source[key]
        }
      }
    }
  }

  return target
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item)
}
