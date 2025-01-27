import Cookies from "js-cookie"

export interface CustomAudience {
  id: string
  name: string
  description: string
  age: string
  location: string
  work: string
  expertise: string
  likes: string
  dislikes: string
  passion: string
  hobbies: string
  additionalInfo: string
}

const COOKIE_KEY = "custom_audiences"

export const getCustomAudiences = (): CustomAudience[] => {
  const storedAudiences = Cookies.get(COOKIE_KEY)
  return storedAudiences ? JSON.parse(storedAudiences) : []
}

export const saveCustomAudience = (audience: CustomAudience) => {
  const audiences = getCustomAudiences()
  audiences.push(audience)
  Cookies.set(COOKIE_KEY, JSON.stringify(audiences), { expires: 365 })
}

export const deleteCustomAudience = (id: string) => {
  const audiences = getCustomAudiences()
  const updatedAudiences = audiences.filter((audience) => audience.id !== id)
  Cookies.set(COOKIE_KEY, JSON.stringify(updatedAudiences), { expires: 365 })
}

