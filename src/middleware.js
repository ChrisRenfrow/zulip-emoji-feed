import { defineMiddleware } from 'astro:middleware'
import { getSession } from 'auth-astro/server'

export const onRequest = defineMiddleware(async (context, next) => {
  const session = await getSession(context.request)
  const url = new URL(context.request.url)

  if (url.pathname.startsWith('/page')) {
    if (!session) {
      return context.redirect('/')
    }
  }

  return next()
})
