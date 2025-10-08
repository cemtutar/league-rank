export const championStats = [
  {
    id: 266,
    name: "Aatrox",
    role: "Top",
    tier: "A",
    winRate: 51.2,
    pickRate: 5.4,
    banRate: 7.1,
    matchesAnalyzed: 28421,
    bestBuild: ["Goredrinker", "Black Cleaver", "Death's Dance"],
    skillPriority: ["Q", "E", "W"],
    counters: [
      { name: "Fiora", threat: 4 },
      { name: "Jax", threat: 3 },
      { name: "Renekton", threat: 3 }
    ]
  },
  {
    id: 103,
    name: "Ahri",
    role: "Mid",
    tier: "S",
    winRate: 53.8,
    pickRate: 9.1,
    banRate: 12.5,
    matchesAnalyzed: 40105,
    bestBuild: ["Luden's Tempest", "Shadowflame", "Rabadon's Deathcap"],
    skillPriority: ["Q", "W", "E"],
    counters: [
      { name: "Kassadin", threat: 2 },
      { name: "Fizz", threat: 3 },
      { name: "Galio", threat: 3 }
    ]
  },
  {
    id: 145,
    name: "Kai'Sa",
    role: "ADC",
    tier: "A",
    winRate: 52.1,
    pickRate: 15.6,
    banRate: 29.3,
    matchesAnalyzed: 50214,
    bestBuild: ["Kraken Slayer", "Nashor's Tooth", "Rabadon's Deathcap"],
    skillPriority: ["Q", "E", "W"],
    counters: [
      { name: "Draven", threat: 4 },
      { name: "Samira", threat: 3 },
      { name: "Caitlyn", threat: 3 }
    ]
  },
  {
    id: 203,
    name: "Kindred",
    role: "Jungle",
    tier: "B",
    winRate: 50.4,
    pickRate: 4.2,
    banRate: 6.7,
    matchesAnalyzed: 18214,
    bestBuild: ["Kraken Slayer", "Trinity Force", "Infinity Edge"],
    skillPriority: ["Q", "W", "E"],
    counters: [
      { name: "Rammus", threat: 4 },
      { name: "Nunu", threat: 3 },
      { name: "Jarvan IV", threat: 3 }
    ]
  },
  {
    id: 147,
    name: "Seraphine",
    role: "Support",
    tier: "S",
    winRate: 54.9,
    pickRate: 8.4,
    banRate: 10.6,
    matchesAnalyzed: 31205,
    bestBuild: ["Moonstone Renewer", "Ardent Censer", "Staff of Flowing Water"],
    skillPriority: ["Q", "E", "W"],
    counters: [
      { name: "Blitzcrank", threat: 3 },
      { name: "Pyke", threat: 3 },
      { name: "Nautilus", threat: 4 }
    ]
  }
];

export const metaTrends = [
  {
    patch: "14.9",
    highlights: [
      "Mage mid laners are trending upwards thanks to item rebalances.",
      "Bot lane enchanters remain strong despite nerfs to shielding.",
      "Objective control compositions see increased success in coordinated play."
    ],
    roles: {
      Top: { mostContested: "Aatrox", emerging: "K'Sante" },
      Jungle: { mostContested: "Kindred", emerging: "Briar" },
      Mid: { mostContested: "Ahri", emerging: "Neeko" },
      ADC: { mostContested: "Kai'Sa", emerging: "Zeri" },
      Support: { mostContested: "Seraphine", emerging: "Renata Glasc" }
    }
  }
];
