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
