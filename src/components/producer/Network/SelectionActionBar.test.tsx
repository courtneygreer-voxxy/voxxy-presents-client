import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SelectionActionBar from './SelectionActionBar'

describe('SelectionActionBar', () => {
  const noop = () => {}

  it('renders nothing when no rows are selected', () => {
    const { container } = render(
      <SelectionActionBar count={0} onEdit={noop} onDelete={noop} onClear={noop} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the selected count and the bulk actions when rows are selected', () => {
    render(<SelectionActionBar count={3} onEdit={noop} onDelete={noop} onClear={noop} />)
    expect(screen.getByText('3 selected')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /clear selection/i })).toBeInTheDocument()
  })

  it('wires up edit, delete, and clear callbacks', () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const onClear = vi.fn()
    render(<SelectionActionBar count={2} onEdit={onEdit} onDelete={onDelete} onClear={onClear} />)

    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }))
    fireEvent.click(screen.getByRole('button', { name: /clear selection/i }))

    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('disables actions and shows deleting state while loading', () => {
    render(
      <SelectionActionBar count={2} onEdit={noop} onDelete={noop} onClear={noop} loading />,
    )
    expect(screen.getByRole('button', { name: /edit/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled()
  })
})
