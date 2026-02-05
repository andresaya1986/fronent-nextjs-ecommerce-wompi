import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import productsReducer from './slices/productsSlice'
import transactionsReducer from './slices/transactionsSlice'
import storage from 'redux-persist/lib/storage'
import { persistStore, persistReducer } from 'redux-persist'

const rootReducer = combineReducers({
  products: productsReducer,
  transactions: transactionsReducer,
})

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['transactions'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch

// hooks file-like exports
export * from './hooks'
