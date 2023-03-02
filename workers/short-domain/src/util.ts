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

/** 渲染模板
 *
 * @param template 模板字符串
 * @param data 渲染数据
 */
export function renderTemplate(template: string, data: Record<string, any>): string {
  const pattern = /{{\s*(\w+)\s*}}/g

  return template.replace(pattern, (_, key) => {
    return data[key] !== undefined ? String(data[key]) : ''
  })
}

// Alphabet for `uid` generator
const ALPHANUM = /* #__PURE__ */ 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'

export function randomString(len?: number): string {
  let str = ''
  let num = len || 6
  const arr = crypto.getRandomValues(new Uint8Array(num))
  while (num--) str += ALPHANUM[arr[num] & 61]
  return str
}
