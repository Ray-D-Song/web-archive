import { useParams } from '~/router'

function ErrorPage() {
  const { slug } = useParams('/error/:slug')

  return (
    <main>
      <h1>{slug}</h1>
    </main>
  )
}

export default ErrorPage
