import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import NeonButton from './NeonButton'

describe('NeonButton', () => {
  it('renders correctly with children', () => {
    render(<NeonButton>Click Me</NeonButton>)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })

  it('applies the correct variant class', () => {
    render(<NeonButton variant="toxic">Toxic Button</NeonButton>)
    const button = screen.getByText('Toxic Button')
    expect(button).toHaveClass('text-[#39FF14]')
  })
})
