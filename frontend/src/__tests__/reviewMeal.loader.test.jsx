import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('expo-router', () => {
    const push = vi.fn()
    return {
        useLocalSearchParams: () => ({ imageUri: 'file://local-image.jpg' }),
        router: { push },
        __pushMock: push,
    }
})

import ReviewMealLoader from '../app/reviewMeal'

describe('ReviewMealLoader (JS)', () => {
    beforeEach(async () => {
        vi.restoreAllMocks()
        const mod = await import('expo-router')
        mod.__pushMock.mockClear()

        global.fetch = vi.fn(async (url) => {
            // When the component tries to fetch the local file URI (web path), return a blob
            if (typeof url === 'string' && url.startsWith('file://')) {
                return {
                    ok: true,
                    blob: async () => new Blob(['fake-image'], { type: 'image/jpeg' }),
                }
            }

            if (url.includes('/process-meal-image')) {
                return {
                    ok: true,
                    json: async () => ({
                        image_url: 'meal.jpg',
                        ingredients: {
                            Apple: { calorie: 52, weight: 100, protein: 0.3, fat: 0.2, carb: 14 },
                        },
                    }),
                }
            }
            return { ok: true, json: async () => ({}) }
        })
    })

    afterEach(() => {
        global.fetch = undefined
    })

    it('uploads image and navigates', async () => {
        render(React.createElement(ReviewMealLoader))

        await waitFor(async () => {
            const mod = await import('expo-router')
            expect(mod.__pushMock).toHaveBeenCalled()
        }, { timeout: 2000 })

        const mod = await import('expo-router')
        const callArg = mod.__pushMock.mock.calls[0][0]
        expect(callArg.pathname).toBe('/reviewconfirmmeal')
        expect(callArg.params).toBeDefined()
        const parsed = JSON.parse(callArg.params.ingredients)
        expect(Array.isArray(parsed)).toBe(true)
        expect(parsed[0].name).toBe('Apple')
    })
})
