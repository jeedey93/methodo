import type { AIProvider } from './provider'

let _provider: AIProvider | null = null

export function getAIProvider(): AIProvider {
  if (_provider) return _provider

  if (process.env.MOCK_AI === 'true') {
    const { mockAI } = require('./mock')
    _provider = mockAI
  } else {
    const { getAIProvider: getAnthropic } = require('./anthropic')
    _provider = getAnthropic()
  }

  return _provider!
}

export type { AIProvider } from './provider'
