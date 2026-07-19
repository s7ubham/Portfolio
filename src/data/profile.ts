export const profile = {
  leetcode: {
    url: 'https://leetcode.com/u/s7ubham/',
    username: 's7ubham',
    ranking: 'Top 15%',
    solved: 350,
    easy: 120,
    medium: 180,
    hard: 50,
    acceptance: '62.4%',
    streak: 14,
  },
  github: {
    url: 'https://github.com/s7ubham',
    username: 's7ubham',
    name: 'Subhamsekhar Panda',
    bio: 'Software developer building interactive web experiences',
    repos: 31,
    stars: 0,
    followers: 12,
    highlights: [
      { name: 'Portfolio', desc: 'Interactive Pokémon-style portfolio battle', lang: 'TypeScript' },
      { name: 'ChessBotV2', desc: 'Chess engine / bot experiments', lang: 'Python' },
      { name: 'LINKEDIN-GAMEASSIST', desc: 'LinkedIn game assist tooling', lang: 'JavaScript' },
      { name: 'Patient-Integration-Project', desc: 'Patient data integration project', lang: 'Java' },
    ],
  },
  linkedin: {
    url: 'https://www.linkedin.com/in/s7ubham/',
    name: 'Subhamsekhar Panda',
    headline: 'Software Engineer',
    company: 'Building interactive web experiences',
    location: 'India',
    about:
      'Engineer focused on full-stack product work, DSA, and playful interactive experiences.',
    experience: [
      { role: 'Software Engineer', company: 'Open to opportunities', period: 'Present' },
      { role: 'Builder', company: 'Personal projects & open source', period: 'Ongoing' },
    ],
  },
} as const

export type ProfileData = typeof profile
