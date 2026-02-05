import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock the redux hook used by the component so tests don't require store setup
jest.mock('../store/hooks', () => ({
  useAppDispatch: () => () => {},
}))

import PaymentModal from '../components/PaymentModal'

const product = { id: 1, name: 'Test Product', price: 10, available: true }

test('renders payment fields and formats card number in groups of 4', () => {
  render(<PaymentModal product={product} onClose={() => {}} />)

  // inputs: the modal uses plain labels (without htmlFor), so select textboxes by role
  const textboxes = screen.getAllByRole('textbox')
  expect(textboxes.length).toBeGreaterThanOrEqual(4)

  const name = textboxes[0]
  const email = textboxes[1]
  const phone = screen.getByPlaceholderText(/\+57 300 000 0000|Teléfono/i)
  const card = screen.getByPlaceholderText(/4111 1111 1111 1111/i)

  expect(name).toBeInTheDocument()
  expect(email).toBeInTheDocument()
  expect(phone).toBeInTheDocument()
  expect(card).toBeInTheDocument()

  // type digits and expect them grouped (component formats the value)
  fireEvent.change(card, { target: { value: '4111111111111111' } })
  expect((card as HTMLInputElement).value).toBe('4111 1111 1111 1111')
})
