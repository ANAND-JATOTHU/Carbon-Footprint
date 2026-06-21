/**
 * App.test.jsx — Integration tests for the App root component.
 *
 * Tests that the application renders correctly with routing and navigation.
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from './App'

describe('App Component', () => {
  it('renders the application without crashing', () => {
    render(<App />)
    // Navigation should always be present
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders the navigation bar', () => {
    render(<App />)
    expect(screen.getByText('Leaderboard')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })

  it('renders the sign-in link when not authenticated', () => {
    render(<App />)
    const signInElements = screen.getAllByText('Sign In')
    expect(signInElements.length).toBeGreaterThan(0)
  })

  it('renders the eco-actions nav link', () => {
    render(<App />)
    expect(screen.getByText('Eco-Actions')).toBeInTheDocument()
  })
})
