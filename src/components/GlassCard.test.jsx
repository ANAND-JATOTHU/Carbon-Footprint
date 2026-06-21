/**
 * GlassCard.test.jsx — Component tests for the GlassCard component.
 *
 * Tests rendering, accessibility, and interaction behavior.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import GlassCard from './GlassCard'

describe('GlassCard', () => {
  it('renders children content', () => {
    render(<GlassCard>Card Content</GlassCard>)
    expect(screen.getByText('Card Content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<GlassCard className="p-6">Test</GlassCard>)
    expect(screen.getByText('Test').closest('div')).toHaveClass('p-6')
  })

  it('applies glass-card base class', () => {
    render(<GlassCard>Test</GlassCard>)
    expect(screen.getByText('Test').closest('div')).toHaveClass('glass-card')
  })

  it('supports custom id', () => {
    render(<GlassCard id="my-card">Test</GlassCard>)
    expect(document.getElementById('my-card')).toBeInTheDocument()
  })

  it('handles onClick', () => {
    const handleClick = vi.fn()
    render(<GlassCard onClick={handleClick}>Clickable</GlassCard>)
    fireEvent.click(screen.getByText('Clickable'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders nested elements', () => {
    render(
      <GlassCard>
        <h2>Title</h2>
        <p>Description</p>
      </GlassCard>
    )
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
  })
})
