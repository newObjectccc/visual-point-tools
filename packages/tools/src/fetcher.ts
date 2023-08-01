// 默认的 log 上传的请求方法
export async function uploadByFetch<T>(this: Object & {url: string}, data: T, options?: Object): Promise<boolean> {
  if (!this.url) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`uploadByFetch: get upload url from this, get by 'this.url'`)
    }
  }
  let isSuccess = false
  let defaultOptions = {}
  let res = null
  const headers = new Headers({'Content-Type': 'application/json'})
  try {
    defaultOptions = {
      method: 'POST',
      headers,
      mode: 'cors',
      ...(options ?? {}),
      body: JSON.stringify(data),
    }
    res = await fetch(this.url, defaultOptions)
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      throw error
    }
  }
  if (res?.ok) {
    isSuccess = true
  }
  return isSuccess
}

export const fetcherFactory = (options: RequestInit) => {
  // @ts-ignore
  return <T>(data: T) => uploadByFetch(data, options)
}
