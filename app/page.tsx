"use client"

import { useState, useEffect } from "react"
import OpenAI from "openai"
import { zodResponseFormat } from "openai/helpers/zod";
import FileInput from "./components/file-input"
import AnalysisChart from "./components/radar-chart"
import FeedbackDisplay from "./components/feedback-display"
import Spinner from "./components/spinner"
import TargetAudienceSelector from "./components/target-audience-selector"
import CustomAudienceManager from "./components/custom-audience-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { AudienceInfo } from "@/utils/audienceData"
import { getCustomAudiences } from "@/utils/cookieStorage"
import { AnalysisResponseSchema } from "./utils/analysisSchema"
import { createAnalysisPrompt } from "./utils/promptHelpers"
import UrlInput from "./components/url-input";

type AnalysisResult = {
  audience: AudienceInfo
  chartData: { attribute: string; value: number }[]
  feedback: string[]
  overallScore: number
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

export default function Home() {
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAudiences, setSelectedAudiences] = useState<AudienceInfo[]>([])
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [customAudiences, setCustomAudiences] = useState<string[]>([])
  const [scrapedImages, setScrapedImages] = useState<string[]>([]);
  const [screenshotProgress, setScreenshotProgress] = useState(0);

  useEffect(() => {
    const loadedAudiences = getCustomAudiences().map((audience) => audience.description)
    setCustomAudiences(loadedAudiences)
  }, [])

  const refreshCustomAudiences = () => {
    const loadedAudiences = getCustomAudiences().map((audience) => audience.description)
    setCustomAudiences(loadedAudiences)
  }

  // Update analyzeUrl function
  const analyzeUrl = async (urls: string[]) => {
    const targetUrl = encodeURIComponent(urls[0]);
    
    return new Promise<File[]>((resolve, reject) => {
      const eventSource = new EventSource(`/api/screenshot?url=${targetUrl}`);
      console.log("we got here")
      eventSource.addEventListener('progress', (event) => {
        console.log("Progress event:", event.data);
        const data = JSON.parse(event.data);
        setScreenshotProgress(data.count);
      });
      eventSource.addEventListener('complete', (event) => {
      const data = JSON.parse(event.data);
      const screenshots = data.screenshots;

      const files = screenshots.map((screenshot: string, index: number) => {
        const base64 = screenshot.split(',')[1] || screenshot;
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new File([byteArray], `screenshot-${index}.png`, { type: 'image/png' });
      });

      const previewUrls = files.map(file => URL.createObjectURL(file));
      setScrapedImages(previewUrls);
      eventSource.close();
      resolve(files);
      });

      eventSource.addEventListener('error', (event) => {
      const data = JSON.parse(event.data);
      eventSource.close();
      reject(new Error(data.error));
      });

      eventSource.onerror = (error) => {
      eventSource.close();
      reject(error);
      };
    });
  }


  const analyzeScreenshot = async (audience: AudienceInfo, files: File[]) => {
    const imagePrompts = await Promise.all(
      files.map(async (file) => {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
        return {
          type: "image_url" as const,
          image_url: { url: base64 }
        }
      })
    )
    const prompt = createAnalysisPrompt(audience)
    console.log(`Audience: ${audience}`)
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `${prompt.system}`
        },
        {
          role: "user",
          content: [
            { type: "text", text: `${prompt.user}` },
            ...imagePrompts
          ]
        }
      ],
      response_format: zodResponseFormat(AnalysisResponseSchema, "analysis")
    })

    return AnalysisResponseSchema.parse(
      JSON.parse(completion.choices[0].message.content || "{}")
    )
  }

  // Update handleUrlSubmit to reset progress
  const handleUrlSubmit = async (urls: string[]) => {
    if (selectedAudiences.length === 0) return;
    setIsLoading(true);
    setScreenshotProgress(0);

    try {
      const files = await analyzeUrl(urls);
      if (!files?.length) {
        console.error('No screenshots retrieved');
        return;
      }
  
      const results = await Promise.all(
        selectedAudiences.map(async (audience) => {
          const analysis = await analyzeScreenshot(audience, files)
          return {
            audience,
            chartData: analysis.chartData,
            feedback: analysis.feedback,
            overallScore: analysis.overallScore
          }
        })
      )
  
      setResults(results)
      setAnalysisComplete(true)
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (files: FileList) => {
    if (selectedAudiences.length === 0) return
    setIsLoading(true)

    try {
      const fileArray = Array.from(files)
      const results = await Promise.all(
        selectedAudiences.map(async (audience) => {
          const analysis = await analyzeScreenshot(audience, fileArray)
          return {
            audience,
            chartData: analysis.chartData,
            feedback: analysis.feedback,
            overallScore: analysis.overallScore
          }
        })
      )

      setResults(results)
      setAnalysisComplete(true)
    } catch (error) {
      console.error("Analysis failed:", error)
      // Add error handling UI here
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <main className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Screenshot Analysis Tool</h1>
      <Tabs defaultValue="analyze">
        <TabsList>
          <TabsTrigger value="analyze">Analyze</TabsTrigger>
          <TabsTrigger value="manage-audiences">Manage Audiences</TabsTrigger>
          <TabsTrigger value="scrape url">Scrape URLs</TabsTrigger>
        </TabsList>
        <TabsContent value="analyze">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">1. Select Target Audiences</h2>
                <TargetAudienceSelector 
                  selectedAudiences={selectedAudiences}
                  onSelect={setSelectedAudiences} 
                />
                {selectedAudiences.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Please select at least one target audience before analyzing.
                  </p>
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">2. Upload Screenshots</h2>
                <FileInput onSubmit={handleSubmit} isLoading={isLoading} disabled={selectedAudiences.length === 0} />
              </div>
            </CardContent>
          </Card>
          {isLoading && (
            <Card className="mt-8">
              <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
                <Spinner />
                {screenshotProgress > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Made {screenshotProgress} screenshots...
                  </p>
                )}
              </CardContent>
            </Card>
          )}
          {analysisComplete && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={results[0].audience.name}>
                  <TabsList className="flex flex-wrap mb-4">
                    {results.map((result) => (
                      <TabsTrigger key={result.audience.name} value={result.audience.name}>
                        {result.audience.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {results.map((result) => (
                    <TabsContent key={result.audience.name} value={result.audience.name} className="space-y-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="w-full">
                          <AnalysisChart data={result.chartData} />
                        </div>
                        <div className="w-full">
                          <FeedbackDisplay feedback={result.feedback} />
                        </div>
                      </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <Card>
                          <CardHeader>
                            <CardTitle>Overall Score for {result.audience.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-4xl font-bold text-center">{result.overallScore} / 10</p>
                          </CardContent>
                          </Card>
                          <Card>
                          <CardHeader>
                            <CardTitle>Average Score of All Results</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-4xl font-bold text-center">
                            {(
                              results.reduce((sum, r) => sum + r.overallScore, 0) / results.length
                            ).toFixed(2)} / 10
                            </p>
                          </CardContent>
                          </Card>
                        </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>View Detailed Analysis</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Detailed Analysis for {result.audience.name}</DialogTitle>
                            <DialogDescription>Comprehensive breakdown of the analysis results</DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="w-full">
                              <AnalysisChart data={result.chartData} />
                            </div>
                            <div className="w-full">
                              <FeedbackDisplay feedback={result.feedback} />
                            </div>
                          </div>
                          <Card>
                            <CardHeader>
                              <CardTitle>Overall Score</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-4xl font-bold text-center">{result.overallScore} / 10</p>
                            </CardContent>
                          </Card>
                        </DialogContent>
                      </Dialog>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="manage-audiences">
          <CustomAudienceManager onAudienceChange={refreshCustomAudiences} />
        </TabsContent>
        <TabsContent value="scrape url">
          <Card>
            <CardHeader>
              <CardTitle>URL Analysis Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">1. Select Target Audiences</h2>
                <TargetAudienceSelector 
                  selectedAudiences={selectedAudiences}
                  onSelect={setSelectedAudiences} 
                />
                {selectedAudiences.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Please select at least one target audience before analyzing.
                  </p>
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">2. Enter Website URL</h2>
                <UrlInput 
                  onSubmit={handleUrlSubmit} 
                  isLoading={isLoading} 
                  disabled={selectedAudiences.length === 0} 
                />
              </div>
            </CardContent>
          </Card>
          {isLoading && (
            <Card className="mt-8">
              <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
                <Spinner />
                {screenshotProgress > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Made {screenshotProgress} screenshots...
                  </p>
                )}
              </CardContent>
            </Card>
          )}
          {scrapedImages.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Scraped Screenshots Preview</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scrapedImages.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Scraped preview ${index}`}
                    className="rounded-lg border shadow-sm"
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {analysisComplete && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Duplicate the results display from analyze tab */}
                <Tabs defaultValue={results[0].audience.name}>
                  <TabsList className="flex flex-wrap mb-4">
                    {results.map((result) => (
                      <TabsTrigger key={result.audience.name} value={result.audience.name}>
                        {result.audience.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {results.map((result) => (
                    <TabsContent key={result.audience.name} value={result.audience.name} className="space-y-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="w-full">
                          <AnalysisChart data={result.chartData} />
                        </div>
                        <div className="w-full">
                          <FeedbackDisplay feedback={result.feedback} />
                        </div>
                      </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <Card>
                          <CardHeader>
                            <CardTitle>Overall Score for {result.audience.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-4xl font-bold text-center">{result.overallScore} / 10</p>
                          </CardContent>
                          </Card>
                          <Card>
                          <CardHeader>
                            <CardTitle>Average Score of All Results</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-4xl font-bold text-center">
                            {(
                              results.reduce((sum, r) => sum + r.overallScore, 0) / results.length
                            ).toFixed(2)} / 10
                            </p>
                          </CardContent>
                          </Card>
                        </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>View Detailed Analysis</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Detailed Analysis for {result.audience.name}</DialogTitle>
                            <DialogDescription>Comprehensive breakdown of the analysis results</DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="w-full">
                              <AnalysisChart data={result.chartData} />
                            </div>
                            <div className="w-full">
                              <FeedbackDisplay feedback={result.feedback} />
                            </div>
                          </div>
                          <Card>
                            <CardHeader>
                              <CardTitle>Overall Score</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-4xl font-bold text-center">{result.overallScore} / 10</p>
                            </CardContent>
                          </Card>
                        </DialogContent>
                      </Dialog>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}

