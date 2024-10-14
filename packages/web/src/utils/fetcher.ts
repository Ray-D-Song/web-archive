import toast from 'react-hot-toast'
import { logOut } from './router'

interface Options {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: Record<string, unknown> | string
  query?: Record<string, string>
}

function fetcher<T>(url: string, {
  method = 'GET',
  body,
  query,
}: Options) {
  url = `/api${url}`
  return async () => {
    if (body && (method !== 'POST' && method !== 'PUT')) {
      toast.error('Body is only allowed for POST or PUT method')
      return
    }
    let queryString = ''
    if (query) {
      queryString = new URLSearchParams(query).toString()
      url += `?${queryString}`
    }
    if (method === 'GET') {
      return fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }).then(res => processResponse<T>(res))
    }
    return fetch(url, {
      method,
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    }).then(res => processResponse<T>(res))
  }
}

async function processResponse<T>(res: Response) {
  if (res.status === 401) {
    logOut()
    return
  }
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
        break
      default:
        break
    }
  }

  return content.data
}

export default fetcher
