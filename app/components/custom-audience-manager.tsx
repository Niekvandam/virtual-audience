"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type CustomAudience,
  saveCustomAudience,
  getCustomAudiences,
  deleteCustomAudience,
} from "@/utils/cookieStorage"

export default function CustomAudienceManager({ onAudienceChange }: { onAudienceChange: () => void }) {
  const [audiences, setAudiences] = useState<CustomAudience[]>([])
  const [newAudience, setNewAudience] = useState<CustomAudience>({
    id: "",
    name: "",
    description: "",
    age: "",
    location: "",
    work: "",
    expertise: "",
    likes: "",
    dislikes: "",
    passion: "",
    hobbies: "",
    additionalInfo: "",
  })

  useEffect(() => {
    setAudiences(getCustomAudiences())
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewAudience((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const audienceWithId = { ...newAudience, id: uuidv4() }
    saveCustomAudience(audienceWithId)
    setAudiences((prev) => [...prev, audienceWithId])
    setNewAudience({
      id: "",
      name: "",
      description: "",
      age: "",
      location: "",
      work: "",
      expertise: "",
      likes: "",
      dislikes: "",
      passion: "",
      hobbies: "",
      additionalInfo: "",
    })
    onAudienceChange()
  }

  const handleDelete = (id: string) => {
    deleteCustomAudience(id)
    setAudiences((prev) => prev.filter((audience) => audience.id !== id))
    onAudienceChange()
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Custom Audience</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={newAudience.name}
                  onChange={handleInputChange}
                  placeholder="Eva"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={newAudience.description}
                  onChange={handleInputChange}
                  placeholder="Eva the 50-year-old Venture Capitalist"
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  value={newAudience.age}
                  onChange={handleInputChange}
                  placeholder="50"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={newAudience.location}
                  onChange={handleInputChange}
                  placeholder="Utrecht, Utrecht"
                />
              </div>
              <div>
                <Label htmlFor="work">Work</Label>
                <Input
                  id="work"
                  name="work"
                  value={newAudience.work}
                  onChange={handleInputChange}
                  placeholder="Senior partner at a VC firm"
                />
              </div>
              <div>
                <Label htmlFor="expertise">Expertise</Label>
                <Input
                  id="expertise"
                  name="expertise"
                  value={newAudience.expertise}
                  onChange={handleInputChange}
                  placeholder="Portfolio management, strategic acquisitions"
                />
              </div>
              <div>
                <Label htmlFor="likes">Likes</Label>
                <Input
                  id="likes"
                  name="likes"
                  value={newAudience.likes}
                  onChange={handleInputChange}
                  placeholder="Efficient board meetings, cross-border deals"
                />
              </div>
              <div>
                <Label htmlFor="dislikes">Dislikes</Label>
                <Input
                  id="dislikes"
                  name="dislikes"
                  value={newAudience.dislikes}
                  onChange={handleInputChange}
                  placeholder="Unprepared founders, slow growth"
                />
              </div>
              <div>
                <Label htmlFor="passion">Passion</Label>
                <Input
                  id="passion"
                  name="passion"
                  value={newAudience.passion}
                  onChange={handleInputChange}
                  placeholder="Empowering diverse and female-led startups"
                />
              </div>
              <div>
                <Label htmlFor="hobbies">Hobbies</Label>
                <Input
                  id="hobbies"
                  name="hobbies"
                  value={newAudience.hobbies}
                  onChange={handleInputChange}
                  placeholder="Volunteering as a mentor, traveling to tech conferences"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                name="additionalInfo"
                value={newAudience.additionalInfo}
                onChange={handleInputChange}
                placeholder="Manages a €200M fund focusing on green tech and healthcare"
              />
            </div>
            <Button type="submit">Create Audience</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Custom Audiences</CardTitle>
        </CardHeader>
        <CardContent>
          {audiences.length === 0 ? (
            <p>No custom audiences created yet.</p>
          ) : (
            <ul className="space-y-4">
              {audiences.map((audience) => (
                <li key={audience.id} className="flex justify-between items-center">
                  <span>{audience.name}</span>
                  <Button variant="destructive" onClick={() => handleDelete(audience.id)}>
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
