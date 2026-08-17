import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmationModal } from './confirmation-modal'

describe('ConfirmationModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Retry Failed Email',
    description: 'This will attempt to resend the email to all eligible recipients.',
    confirmText: 'Retry',
    cancelText: 'Cancel',
  }

  it('renders title and description when open', () => {
    render(<ConfirmationModal {...defaultProps} />)

    expect(screen.getByText('Retry Failed Email')).toBeInTheDocument()
    expect(
      screen.getByText('This will attempt to resend the email to all eligible recipients.'),
    ).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn()
    render(<ConfirmationModal {...defaultProps} onConfirm={onConfirm} />)

    fireEvent.click(screen.getByRole('button', { name: /retry/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn()
    render(<ConfirmationModal {...defaultProps} onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('disables both buttons when isLoading is true', () => {
    render(<ConfirmationModal {...defaultProps} isLoading={true} />)

    expect(screen.getByRole('button', { name: /retry/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
  })

  it('does not fire onConfirm when clicked during loading', () => {
    const onConfirm = vi.fn()
    render(<ConfirmationModal {...defaultProps} onConfirm={onConfirm} isLoading={true} />)

    fireEvent.click(screen.getByRole('button', { name: /retry/i }))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('enables buttons when isLoading is false', () => {
    render(<ConfirmationModal {...defaultProps} isLoading={false} />)

    expect(screen.getByRole('button', { name: /retry/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeEnabled()
  })
})
