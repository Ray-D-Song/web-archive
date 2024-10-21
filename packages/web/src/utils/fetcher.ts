import toast from 'react-hot-toast'
import { logOut } from './router'

type Options = {
  method: 'POST' | 'PUT'
  body?: Record<string, unknown> | string
  query?: Record<string, string>
} | {
  method: 'GET' | 'DELETE'
  query?: Record<string, string>
}

async function fetcher<T>(url: string, options: Options): Promise<T> {
  const { method, query } = options
  url = processQueryString(url, query)

  const res = await fetch(url, {
    ...(method === 'POST' || method === 'PUT' ? { body: typeof options.body === 'string' ? options.body : JSON.stringify(options.body) } : {}),
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  })

  if (res.status === 401) {
    logOut()
    return Promise.reject(new Error('Unauthorized'))
  }

  return processResponse<T>(res)
}

function processQueryString(url: string, query?: Record<string, string>) {
  if (!query)
    return `/api${url}`

  const queryString = new URLSearchParams(query).toString()
  return `/api${url}?${queryString}`
}

async function processResponse<T>(res: Response) {
  if (!res.ok) {
    toast.error('Network error')
  }
  const content = <{
    code: number
    message: string
    data: T
  }> await res.json()
  if (content.code !== 200) {
    toast.error(content.message)
    switch (content.code) {
      case 401:
        logOut()
        break
      default:
        break
    }
  }

  return content.data
}

export default fetcher
