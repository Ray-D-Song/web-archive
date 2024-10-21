import type { FormEvent } from 'react'
import { useState } from 'react'
import { Button } from '@web-archive/shared/components/button'
import { Input } from '@web-archive/shared/components/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@web-archive/shared/components/card'
import toast, { Toaster } from 'react-hot-toast'
import router from '~/utils/router'

export default function LoginPage() {
  const [key, setKey] = useState('')
  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (key.length === 0) {
      toast.error('Key is required')
      return
    }
    fetch('api/auth', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
      },
    })
      .then((res) => {
        if (res.ok) {
          localStorage.setItem('token', key)
          router.navigate('/')
        }
        else {
          toast.error('Invalid key')
        }
      })
      .catch(() => {
        toast.error('Invalid key')
      })
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Toaster
        position="top-center"
        reverseOrder={false}
      />
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>Web Archive</CardTitle>
          <CardDescription>Please enter your key to login</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Enter your key"
                value={key}
                onChange={e => setKey(e.target.value)}
              />
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
