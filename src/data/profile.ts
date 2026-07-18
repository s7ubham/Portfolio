export const profile = {
  leetcode: {
    url: 'https://leetcode.com/u/s7ubham/',
    username: 's7ubham',
    solved: 350,
    easy: 120,
    medium: 180,
    hard: 50,
  },
  github: {
    url: 'https://github.com/s7ubham',
    username: 's7ubham',
    name: 'Subhamsekhar Panda',
    bio: 'Software developer building interactive web experiences',
    repos: 31,
    stars: 0,
    highlights: ['Portfolio', 'ChessBotV2', 'LINKEDIN-GAMEASSIST', 'Patient-Integration-Project'],
  },
  linkedin: {
    url: 'https://www.linkedin.com/in/s7ubham/',
    headline: 'Software Engineer',
    company: 'Building interactive web experiences',
    location: 'India',
  },
} as const

export type ProfileData = typeof profile
