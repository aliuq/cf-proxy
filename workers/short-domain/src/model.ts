import { Entity } from 'worktop/cfw.kv'
import type { ShortUrl } from './types'

export class Ids extends Entity<ShortUrl> {
  prefix = 'id'

  async onwrite(key: string, value: ShortUrl | null) {
    if (!value)
      return
    const md5Key = `md5~${value.md5}`
    await this.ns.put(md5Key, JSON.stringify(value))
  }

  async ondelete(key: string, value: ShortUrl | null) {
    if (!value)
      return
    const md5Key = `md5~${value.md5}`
    await this.ns.delete(md5Key)
  }
}

export class Md5s extends Entity<ShortUrl> {
  prefix = 'md5'
}
