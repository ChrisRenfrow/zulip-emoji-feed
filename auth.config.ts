import { defineConfig } from 'auth-astro'

export default defineConfig({
  providers: [
    {
      id: 'recurse-center',
      name: 'Recurse Center',
      type: 'oauth',
      authorization: {
        url: 'https://www.recurse.com/oauth/authorize',
        params: { scope: '' },
      },
      token: 'https://www.recurse.com/oauth/token',
      userinfo: 'https://www.recurse.com/api/v1/profiles/me',
      async profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.image_path,
        }
      },
      clientId: import.meta.env.RC_CLIENT_ID,
      clientSecret: import.meta.env.RC_CLIENT_SECRET,
    },
  ],
})
