import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TableSortHeader, createSortHandler } from './TableSortHeader'

describe('TableSortHeader', () => {
  it('renders a clickable button with a visible idle affordance by default', () => {
    render(
      <TableSortHeader label="Email" field="email" currentSort={null} onSort={vi.fn()} />,
    )
    const button = screen.getByRole('button', { name: /sort by email/i })
    expect(button).toBeInTheDocument()
    // idle affordance is an svg icon rendered alongside the label
    expect(button.querySelector('svg')).toBeInTheDocument()
  })

  it('can hide the idle affordance when showIdleIcon is false', () => {
    render(
      <TableSortHeader
        label="Email"
        field="email"
        currentSort={null}
        onSort={vi.fn()}
        showIdleIcon={false}
      />,
    )
    const button = screen.getByRole('button', { name: /sort by email/i })
    expect(button.querySelector('svg')).not.toBeInTheDocument()
  })

  it('calls onSort with the field when clicked', () => {
    const onSort = vi.fn()
    render(
      <TableSortHeader label="Name" field="name" currentSort={null} onSort={onSort} />,
    )
    fireEvent.click(screen.getByRole('button', { name: /sort by name/i }))
    expect(onSort).toHaveBeenCalledWith('name')
  })

  it('shows an active icon when it is the current sort column', () => {
    const { rerender } = render(
      <TableSortHeader
        label="Name"
        field="name"
        currentSort="name"
        currentOrder="asc"
        onSort={vi.fn()}
      />,
    )
    // active column gets emphasized text color
    expect(screen.getByRole('button', { name: /sort by name/i })).toHaveClass('text-foreground')

    rerender(
      <TableSortHeader
        label="Name"
        field="name"
        currentSort="name"
        currentOrder="desc"
        onSort={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /sort by name/i })).toBeInTheDocument()
  })

  it('renders a static, non-interactive header when onSort is omitted', () => {
    render(<TableSortHeader label="Actions" field="actions" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })
})

describe('createSortHandler', () => {
  it('sets a new field to ascending order', () => {
    const setField = vi.fn()
    const setOrder = vi.fn()
    const handler = createSortHandler(setField, setOrder)

    handler('email')

    // setField is called with an updater that returns the new field
    const fieldUpdater = setField.mock.calls[0][0]
    expect(fieldUpdater('name')).toBe('email')
    expect(setOrder).toHaveBeenCalledWith('asc')
  })

  it('flips direction when the same field is clicked again', () => {
    const setField = vi.fn()
    const setOrder = vi.fn()
    const handler = createSortHandler(setField, setOrder)

    handler('email')
    const fieldUpdater = setField.mock.calls[0][0]
    // same field → updater returns it unchanged and toggles order
    expect(fieldUpdater('email')).toBe('email')
    const orderUpdater = setOrder.mock.calls.at(-1)?.[0]
    expect(orderUpdater('asc')).toBe('desc')
    expect(orderUpdater('desc')).toBe('asc')
  })
})
