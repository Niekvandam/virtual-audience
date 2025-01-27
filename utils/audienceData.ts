import { getCustomAudiences } from "./cookieStorage"

export interface AudienceInfo {
  name: string
  age: string
  location: string
  work: string
  expertise: string
  likes: string
  dislikes: string
  passion: string
  hobbies: string
  additionalInfo: string
  description: string
}

const predefinedAudiences: Record<string, AudienceInfo> = {
  "Bob": {
    name: "Bob",
    age: "25",
    location: "Amsterdam, North Holland",
    work: "Full-stack developer at a tech startup",
    expertise: "JavaScript, cloud architecture",
    likes: "Open-source projects, hackathons",
    dislikes: "Legacy code, slow CI/CD pipelines",
    passion: "Building scalable web applications",
    hobbies: "Contributing to tech forums, attending tech meetups",
    additionalInfo: "Recently launched a personal finance app",
    description: "Bob the 25-year-old Software Developer",
  },
  "Jordy": {
    name: "Jordy",
    age: "8",
    location: "Zwolle, Overijssel",
    work: "Elementary school student",
    expertise: "Tying basic knots, campfire songs",
    likes: "Marshmallows, collecting scout badges",
    dislikes: "Long ceremonies, spicy food",
    passion: "Learning survival skills and teamwork",
    hobbies: "Drawing forest animals, short hikes with his scout group",
    additionalInfo: "Recently earned his 'nature detective' badge",
    description: "Jordy the 8-year-old Cub Scout",
  },
  "Rens": {
    name: "Rens",
    age: "14",
    location: "The Hague, South Holland",
    work: "High school student",
    expertise: "Skateboarding, local skate park culture",
    likes: "Hip-hop music, streetwear, skate videos",
    dislikes: "Strict curfews, rainy days",
    passion: "Landing new tricks and filming skate clips",
    hobbies: "Collecting limited-edition sneakers, exploring graffiti art",
    additionalInfo: "Travels to new skate parks every weekend with friends",
    description: "Rens the 14-year-old Skater",
  },
  "Femke": {
    name: "Femke",
    age: "19",
    location: "Urk, Flevoland",
    work: "Deckhand on her family's fishing trawler",
    expertise: "Sea navigation, net repairs",
    likes: "Early morning calm, fresh seafood",
    dislikes: "Overfishing, choppy waters in stormy weather",
    passion: "Preserving local fishing traditions",
    hobbies: "Shell crafting, reading about marine biology",
    additionalInfo: "Hopes to start a sustainable fishing venture",
    description: "Femke the 19-year-old Fisherwoman",
  },
  "Fleur": {
    name: "Fleur",
    age: "22",
    location: "Leiden, South Holland",
    work: "Part-time gallery assistant",
    expertise: "Abstract painting, modern art theory",
    likes: "Avant-garde exhibitions, café sketching",
    dislikes: "Uninspired museum tours, mass-produced decor",
    passion: "Expressing social commentary through color",
    hobbies: "Life drawing sessions, exploring art history archives",
    additionalInfo: "Recently exhibited an installation at a local art fair",
    description: "Fleur the 22-year-old Art Student",
  },
  "Sem": {
    name: "Sem",
    age: "17",
    location: "Amsterdam, North Holland",
    work: "Aspiring social media entrepreneur",
    expertise: "Viral content creation, basic crypto trading",
    likes: "Bitcoin memes, trending hashtags, online fame",
    dislikes: "Slow Wi-Fi, complicated taxes",
    passion: "Achieving overnight financial success",
    hobbies: "Browsing entrepreneurial vlogs, experimenting with dropshipping",
    additionalInfo: "Dreams of launching a bestselling NFT collection",
    description: "Sem the 17-year-old Get-Rich-Quick Influencer",
  },
  "Marieke": {
    name: "Marieke",
    age: "29",
    location: "Rotterdam, South Holland",
    work: "Manager at a boutique hotel",
    expertise: "Customer experience, staff coordination",
    likes: "Networking events, innovative restaurant concepts",
    dislikes: "Last-minute cancellations, negative online reviews",
    passion: "Delivering world-class guest experiences",
    hobbies: "Wine tasting, exploring local art galleries",
    additionalInfo: "Led a rebranding that increased bookings by 30%",
    description: "Marieke the 29-year-old Hospitality Manager",
  },
  "Jeroen": {
    name: "Jeroen",
    age: "37",
    location: "Amsterdam, North Holland",
    work: "Angel investor specializing in SaaS startups",
    expertise: "Startup scalability, pitch deck evaluation",
    likes: "Cutting-edge technologies, coworking spaces",
    dislikes: "Long-winded pitches, unsustainable business models",
    passion: "Identifying and nurturing disruptive innovations",
    hobbies: "Attending hackathons, following AI trends",
    additionalInfo: "Early investor in multiple successful fintech ventures",
    description: "Jeroen the 37-year-old Seasoned Tech Investor",
  },
  "Eva": {
    name: "Eva",
    age: "50",
    location: "Utrecht, Utrecht",
    work: "Senior partner at a VC firm",
    expertise: "Portfolio management, strategic acquisitions",
    likes: "Efficient board meetings, cross-border deals",
    dislikes: "Unprepared founders, slow growth",
    passion: "Empowering diverse and female-led startups",
    hobbies: "Volunteering as a mentor, traveling to tech conferences",
    additionalInfo: "Manages a €200M fund focusing on green tech and healthcare",
    description: "Eva the 50-year-old Venture Capitalist",
  },
  "Pieter": {
    name: "Pieter",
    age: "35",
    location: "Eindhoven, North Brabant",
    work: "General practitioner at a local clinic",
    expertise: "Family medicine, preventive care",
    likes: "Modern diagnostic tools, patient education",
    dislikes: "Prolonged administrative tasks, misinformation campaigns",
    passion: "Public health awareness and accessible care",
    hobbies: "Jogging in city parks, reading medical journals",
    additionalInfo: "Hosts monthly workshops on healthy living",
    description: "Dr. Pieter the 35-year-old General Practitioner",
  },
  "Ingrid": {
    name: "Ingrid",
    age: "45",
    location: "Groningen, Groningen",
    work: "Former accountant, currently on disability",
    expertise: "Navigating healthcare, personal finance management",
    likes: "Patient support groups, accessible facilities",
    dislikes: "Stigma around invisible disabilities, rigid scheduling",
    passion: "Advocating for patient rights and policy reform",
    hobbies: "Knitting, writing an online journal about her experiences",
    additionalInfo: "Volunteers at a local patient advocacy organization",
    description: "Ingrid the 45-year-old Living with Chronic Illness",
  },
  "Koen": {
    name: "Koen",
    age: "41",
    location: "Delft, South Holland",
    work: "Co-founder of a wearable health device startup",
    expertise: "Biotech, hardware-software integration",
    likes: "Innovative prototypes, data-driven solutions",
    dislikes: "Overhyped tech, complex regulatory hurdles",
    passion: "Making healthcare more efficient and accessible",
    hobbies: "Attending robotics meetups, developing functional prototypes",
    additionalInfo: "Currently working on a real-time vital signs wristband",
    description: "Koen the 41-year-old MedTech Entrepreneur",
  },
  "Anna": {
    name: "Anna",
    age: "60",
    location: "The Hague, South Holland",
    work: "Director at an international logistics firm",
    expertise: "Global trade regulations, organizational leadership",
    likes: "Structured processes, collaborative leadership",
    dislikes: "Unclear objectives, last-minute policy shifts",
    passion: "Driving growth into emerging markets",
    hobbies: "Golfing, studying economic forecasts",
    additionalInfo: "Oversees a department of 200 employees across multiple EU branches",
    description: "Anna the 60-year-old Corporate Director",
  },
}

export const getAllAudiences = (): Record<string, AudienceInfo> => {
  const customAudiences = getCustomAudiences()
  const allAudiences = { ...predefinedAudiences }

  customAudiences.forEach((audience) => {
    allAudiences[audience.name] = audience
  })

  return allAudiences
}
