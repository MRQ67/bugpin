import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Pin, Code, Users, Zap, ArrowRight, Github, Search, Heart } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium mx-auto">
              🚀 Now in Beta
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tighter">
              Pin Your <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Pain</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-center">
              A social platform for developers to share, discover, and solve coding errors together. Turn your bugs into learning opportunities.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/sign-in">
              <Button size="lg" className="px-8 py-3 text-lg font-semibold group">
                Start Pinning
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg font-semibold">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Growing Community</span>
            </div>
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span>All Languages</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>Instant Help</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">Why Choose BugPin?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-center">
            Transform your coding struggles into collaborative learning experiences
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-primary/50 transition-colors group">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Pin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Pin Your Errors</h3>
              <p className="text-muted-foreground text-center">
                Share your coding errors with syntax highlighting, stack traces, and detailed context. Make your bugs discoverable and searchable.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors group">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Discover Solutions</h3>
              <p className="text-muted-foreground text-center">
                Find similar errors and solutions from the community. Search by language, framework, or error type to get instant help.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors group">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Build Community</h3>
              <p className="text-muted-foreground text-center">
                Like, comment, and collaborate on error posts. Build your reputation by helping others solve their coding challenges.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/20 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-center">
              Three simple steps to turn your coding errors into learning opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold">Share Your Error</h3>
              <p className="text-muted-foreground text-center">
                Upload your error with code snippets, stack traces, and context. Our platform automatically detects the language and error type.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold">Get Community Help</h3>
              <p className="text-muted-foreground text-center">
                Receive comments, suggestions, and solutions from experienced developers in the community who've faced similar issues.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold">Learn & Grow</h3>
              <p className="text-muted-foreground text-center">
                Mark solutions, build your knowledge base, and help others with similar problems. Turn bugs into learning experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-12 md:p-16">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Ready to Pin Your Pain?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-center">
              Join thousands of developers who are turning their coding errors into collaborative learning experiences.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/sign-in">
              <Button size="lg" className="px-8 py-3 text-lg font-semibold group">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="ghost" size="lg" className="px-8 py-3 text-lg font-semibold">
                Already have an account? Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}