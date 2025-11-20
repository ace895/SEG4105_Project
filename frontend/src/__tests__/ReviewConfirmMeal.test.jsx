import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('expo-router', () => {
    const push = vi.fn()
    return {
        useLocalSearchParams: () => ({
            imageUri: 'http://example.com/get-meal-image/meal.jpg',
            ingredients: JSON.stringify([
                { name: 'Banana', calories: 89, weight: 118, proteins: 1.1, fats: 0.3, carbs: 23 },
            ]),
        }),
        router: { push },
        __pushMock: push,
    }
})

vi.mock('../context/UserContext', () => ({
    useUser: () => ({ email: 'tester@example.com' }),
}))

import ReviewConfirmMeal from '../app/ReviewConfirmMeal'

describe('ReviewConfirmMeal (JS)', () => {
    beforeEach(async () => {
        vi.restoreAllMocks()
        const mod = await import('expo-router')
        mod.__pushMock.mockClear()

        global.fetch = vi.fn(async (url) => {
            if (url.endsWith('/add-meal')) {
                return { ok: true, json: async () => ({ success: true }) }
            }
            return { ok: true, json: async () => ({}) }
        })
        global.alert = vi.fn()
    })

    afterEach(() => {
        global.fetch = undefined
        global.alert = undefined
    })

    it('sends meal and navigates to dashboard', async () => {
        const { getByText } = render(React.createElement(ReviewConfirmMeal))

        const doneBtn = getByText('Done')
        fireEvent.click(doneBtn)

        await waitFor(() => expect(global.fetch).toHaveBeenCalled())

        // Verify navigation after successful save
        await waitFor(async () => {
            const mod = await import('expo-router')
            expect(mod.__pushMock).toHaveBeenCalledWith('/dashboard')
        })

        expect(global.alert).toHaveBeenCalled()
    })
})
