import '../styles/globals.css'
import Head from 'next/head'
import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import { store, persistor } from '../store'
import { PersistGate } from 'redux-persist/integration/react'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Head>
          {/* Viewport for mobile-first responsive layout */}
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {/* Use Tailwind Play CDN for utility classes without installing the npm package */}
          <script src="https://cdn.tailwindcss.com"></script>
        </Head>
        <Component {...pageProps} />
      </PersistGate>
    </Provider>
  )
}
