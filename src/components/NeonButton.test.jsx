/**
 * NeonButton.test.jsx — Component tests for the NeonButton component.
 *
 * Tests rendering, variants, disabled state, and accessibility attributes.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import NeonButton from './NeonButton'

describe('NeonButton', () => {
  it('renders with children text', () => {
    render(<NeonButton>Click Me</NeonButton>)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })

  it('renders as a button element', () => {
    render(<NeonButton>Test</NeonButton>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('applies cyan variant styles by default', () => {
    render(<NeonButton>Cyan</NeonButton>)
    const button = screen.getByText('Cyan')
    expect(button).toHaveClass('text-[#00F0FF]')
    expect(button).toHaveClass('border-[#00F0FF]')
  })

  it('applies toxic variant styles', () => {
    render(<NeonButton variant="toxic">Toxic</NeonButton>)
    const button = screen.getByText('Toxic')
    expect(button).toHaveClass('text-[#39FF14]')
    expect(button).toHaveClass('border-[#39FF14]')
  })

  it('applies hacker variant styles', () => {
    render(<NeonButton variant="hacker">Hack</NeonButton>)
    const button = screen.getByText('Hack')
    expect(button).toHaveClass('text-[#FF0055]')
  })

  it('applies ghost variant styles', () => {
    render(<NeonButton variant="ghost">Ghost</NeonButton>)
    const button = screen.getByText('Ghost')
    expect(button).toHaveClass('text-white/60')
  })

  it('handles disabled state', () => {
    render(<NeonButton disabled>Disabled</NeonButton>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-40')
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn()
    render(<NeonButton onClick={handleClick}>Click</NeonButton>)
    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn()
    render(<NeonButton onClick={handleClick} disabled>Click</NeonButton>)
    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('passes custom className', () => {
    render(<NeonButton className="custom-class">Styled</NeonButton>)
    expect(screen.getByText('Styled')).toHaveClass('custom-class')
  })

  it('supports custom id', () => {
    render(<NeonButton id="btn-submit">Submit</NeonButton>)
    expect(document.getElementById('btn-submit')).toBeInTheDocument()
  })

  it('defaults to type="button"', () => {
    render(<NeonButton>Default</NeonButton>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('supports type="submit"', () => {
    render(<NeonButton type="submit">Go</NeonButton>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })
})
