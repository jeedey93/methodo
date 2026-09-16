interface Poll {
  id: string
  question: string
  options: string[]
  votes: number[]
  createdAt: number
}

export const polls = new Map<string, Poll>()

export function createPoll(question: string, options: string[]): Poll {
  const id = crypto.randomUUID().slice(0, 8)
  const poll: Poll = { id, question, options, votes: options.map(() => 0), createdAt: Date.now() }
  polls.set(id, poll)
  return poll
}

export function getPoll(id: string): Poll | undefined {
  return polls.get(id)
}

export function vote(id: string, optionIndex: number): Poll | null {
  const poll = polls.get(id)
  if (!poll || optionIndex < 0 || optionIndex >= poll.options.length) return null
  poll.votes[optionIndex]++
  return poll
}
