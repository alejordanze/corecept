import { reactBasics } from './reactBasics'
import { reactRendering } from './reactRendering'
import { reactPatterns } from './reactPatterns'
import { reactAdvancedState } from './reactAdvancedState'
import { reactAdvancedArchitecture } from './reactAdvancedArchitecture'

// The progression and review prompts are adapted from the supplied React and
// JavaScript study guide. React 19 APIs are labeled as study material because
// this app currently uses React 18.
export const reactConcepts = [
  ...reactBasics,
  ...reactRendering,
  ...reactPatterns,
  ...reactAdvancedState,
  ...reactAdvancedArchitecture,
] as const
