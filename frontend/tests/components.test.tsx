import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('Pagination', () => {
  it('renders nothing when totalPages <= 1', async () => {
    const { default: Pagination } = await import('../src/components/ui/Pagination')
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={() => {}} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders page buttons when totalPages > 1', async () => {
    const { default: Pagination } = await import('../src/components/ui/Pagination')
    render(<Pagination page={1} totalPages={3} onPageChange={() => {}} />)
    expect(screen.getByText('1')).toBeDefined()
    expect(screen.getByText('2')).toBeDefined()
    expect(screen.getByText('3')).toBeDefined()
  })
})
