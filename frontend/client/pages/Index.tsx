import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";
import {
  AlertCircle,
  Play,
  Clock,
  User,
  Sparkles,
  FileText,
  Youtube,
  Loader2,
  Moon,
  Sun,
  Zap,
  TrendingUp,
  Star,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VideoData {
  title: string;
  thumbnail: string;
  duration: string;
  channel: string;
  views: string;
}

interface SummaryData {
  summary: string;
  keyPoints: string[];
  timestamp: string;
}

const extractVideoId = (url: string) => {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export default function Index() {
  const { theme, setTheme } = useTheme();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError("");
    setVideoData(null);
    setSummaryData(null);

    try {
      // Call your Express backend API
      const response = await fetch("http://localhost:5000/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Extract video ID for thumbnail
      const videoId = extractVideoId(url);

      // Set basic video data from URL
      // setVideoData({
      //   title: "YouTube Video",
      //   thumbnail: videoId
      //     ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      //     : "",
      //   duration: "Loading...",
      //   channel: "Loading...",
      //   views: "Loading...",
      // });

      // Set summary data from API response (backend only returns summary)
      setSummaryData({
        summary: data.summary || data || "Summary not available",
        keyPoints: [], // No key points from backend
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error processing video:", err);
      setError(
        "Failed to process the video. Please make sure that the URL is valid.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isValidYouTubeUrl = (url: string) => {
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/;
    return youtubeRegex.test(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-cyan-500 rounded-xl blur opacity-70 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-cyan-500 group-hover:scale-110 transition-transform">
                  <Youtube className="w-7 h-7 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
                  VideoSummarizer
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  AI-powered YouTube summaries
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* <Badge
                variant="secondary"
                className="hidden sm:inline-flex animate-pulse"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Powered by AI
              </Badge> */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full hover:bg-primary/10 transition-colors"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="text-left flex-1">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-cyan-500 to-blue-500 bg-clip-text text-transparent leading-tight">
                Transform YouTube Videos
                <br />
                <span className="text-3xl md:text-4xl">
                  into Smart Summaries
                </span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-4 leading-relaxed">
                Save time and get the key insights from any YouTube video with
                our
                <span className="text-primary font-semibold"> AI-powered </span>
                summarization tool.
              </p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>10x Faster Learning</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>AI-Powered</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span>Instant Results</span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center ml-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-cyan-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-primary/10 to-cyan-500/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-10 h-10 text-primary" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-primary to-cyan-500 flex items-center justify-center animate-bounce">
                    <Sparkles className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* URL Input Form */}
        <Card className="mb-8 shadow-2xl border-0 bg-card/50 backdrop-blur-md relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-cyan-500/5" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Youtube className="w-6 h-6 text-primary" />
              Enter YouTube URL
            </CardTitle>
            <CardDescription className="text-lg">
              Paste any YouTube video URL to get an instant AI-generated summary
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="h-14 text-base border-2 border-primary/20 focus:border-primary/50 bg-background/50 backdrop-blur-sm transition-all duration-300"
                  disabled={isLoading}
                />
                {url && !isValidYouTubeUrl(url) && (
                  <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Please enter a valid YouTube URL
                  </p>
                )}
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={!url || !isValidYouTubeUrl(url) || isLoading}
                className="h-14 px-8 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Summarize
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Alert className="mb-8 border-destructive/20 bg-destructive/5 backdrop-blur-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <Card className="shadow-xl bg-card/50 backdrop-blur-md">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Skeleton className="w-32 h-20 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-xl bg-card/50 backdrop-blur-md">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Video Information */}
        {videoData && !isLoading && (
          <Card className="mb-6 shadow-2xl border-0 bg-card/50 backdrop-blur-md relative overflow-hidden group hover:shadow-3xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="p-8 relative">
              <div className="flex gap-6">
                <div className="relative group/video">
                  <img
                    src={videoData.thumbnail}
                    alt={videoData.title}
                    className="w-56 h-36 object-cover rounded-xl shadow-lg group-hover/video:shadow-2xl transition-all duration-300"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl group-hover/video:bg-black/30 transition-colors duration-300">
                    <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center group-hover/video:scale-110 transition-transform duration-300">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                  <Badge className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm">
                    <Clock className="w-3 h-3 mr-1" />
                    {videoData.duration}
                  </Badge>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-4 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                    {videoData.title}
                  </h3>
                  <div className="flex items-center gap-6 text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      <span className="text-lg">{videoData.channel}</span>
                    </div>
                    <div className="text-lg">{videoData.views}</div>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-600/30 bg-green-600/10"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Ready for summary
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Results */}
        {summaryData && !isLoading && (
          <Card className="shadow-2xl border-0 bg-card/50 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                AI Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {summaryData.summary}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        {!videoData && !isLoading && (
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            {[
              {
                icon: Sparkles,
                title: "AI-Powered",
                description:
                  "Advanced AI technology extracts key insights and main points",
                color: "text-cyan-500",
                bgColor: "bg-cyan-500/10",
              },
              {
                icon: Clock,
                title: "Save Time",
                description:
                  "Get comprehensive summaries in seconds instead of watching hours",
                color: "text-blue-500",
                bgColor: "bg-blue-500/10",
              },
              {
                icon: FileText,
                title: "Clear Insights",
                description:
                  "Organized summaries with key points and actionable insights",
                color: "text-green-500",
                bgColor: "bg-green-500/10",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="text-center border-0 bg-card/30 backdrop-blur-md group hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 rounded-2xl ${feature.bgColor} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <h3 className="font-bold text-xl mb-3 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur-md mt-20 relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p className="text-lg">
              © 2025 VideoSummarizer. Powered by AI to make learning more
              efficient.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
