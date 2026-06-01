import { render, screen } from '@testing-library/react'
import App from './App'

jest.mock('axios', () => ({
  defaults: {},
  get: jest.fn(() => Promise.reject(new Error('mocked request'))),
  post: jest.fn(() => Promise.resolve({ data: {} })),
}))

jest.mock('@react-pdf/renderer', () => ({
  PDFViewer: ({ children }) => <div>{children}</div>,
  pdf: jest.fn(() => ({
    toBlob: jest.fn(() => Promise.resolve(new Blob())),
  })),
  Document: ({ children }) => <div>{children}</div>,
  Page: ({ children }) => <div>{children}</div>,
  Text: ({ children }) => <span>{children}</span>,
  View: ({ children }) => <div>{children}</div>,
  StyleSheet: { create: styles => styles },
  Font: { register: jest.fn() },
  Image: () => null,
}))

test('renders the public landing page', () => {
  render(<App />)
  expect(screen.getAllByText(/Electrosafe/i).length).toBeGreaterThan(0)
})
