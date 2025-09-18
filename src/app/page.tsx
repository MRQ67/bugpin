import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Pin, Code, Users, Zap, ArrowRight, Github, Search, Heart, Terminal, Bug, TrendingUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Video Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Error Images Background */}
        <div className="absolute inset-0">
          {/* Dark gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black"></div>
          
          {/* Error Images positioned in corners, closer to center */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Error Image 1 - Top Left */}
            <div className="absolute top-20 left-20 rotate-12 opacity-80">
              <Image 
                src="/errors/download (7).png" 
                alt="Code Error" 
                width={400} 
                height={260} 
                className="rounded-2xl shadow-xl"
              />
            </div>
            
            {/* Error Image 2 - Top Right */}
            <div className="absolute top-24 right-20 -rotate-6 opacity-75">
              <Image 
                src="/errors/download (8).png" 
                alt="Code Error" 
                width={400} 
                height={260} 
                className="rounded-2xl shadow-xl"
              />
            </div>
            
            {/* Error Image 3 - Bottom Left */}
            <div className="absolute bottom-20 left-24 -rotate-8 opacity-85">
              <Image 
                src="/errors/download (9).png" 
                alt="Code Error" 
                width={400} 
                height={260} 
                className="rounded-2xl shadow-xl"
              />
            </div>
            
            {/* Error Image 4 - Bottom Right */}
            <div className="absolute bottom-24 right-24 rotate-8 opacity-78">
              <Image 
                src="/errors/download (10).png" 
                alt="Code Error" 
                width={400} 
                height={260} 
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
          
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/70 to-background/80"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Badge */}
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium mx-auto bg-background/80 backdrop-blur-sm">
              🚀 Now in Beta
            </Badge>
            
            {/* Main Title with Bug Logo */}
            <h1 className="text-7xl md:text-9xl lg:text-[10rem] font-black leading-tight tracking-tighter text-foreground font-dm-sans">
              Pin Your <span className="relative inline-flex items-center justify-center mx-2">
                <Image 
                  src="/bug_logo.png" 
                  alt="BugPin Logo" 
                  width={50} 
                  height={50} 
                  className="md:w-12 md:h-12 lg:w-14 lg:h-14 w-10 h-10"
                />
              </span> Bugs
              <br />
              <span className="block mt-2">Share Solutions</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A social platform where developers share coding errors, discover solutions, and turn debugging 
              frustrations into collaborative learning experiences for the entire developer community.
            </p>
            
            {/* CTA Button */}
            <div className="pt-4">
              <Link href="/sign-in">
                <Button size="lg" className="px-8 py-4 text-lg font-semibold group bg-primary text-primary-foreground hover:bg-primary/90">
                  Start Pinning 
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

      </section>

      {/* About Us Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {/* Stats Row */}
          <div className="flex justify-center items-center gap-8 md:gap-16 mb-16 text-center">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Errors shared<br />and solved</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-primary">5K+</div>
              <div className="text-sm text-muted-foreground">Active developers<br />helping each other</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Programming languages<br />and frameworks</div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Image 
                  src="/bug_logo.png" 
                  alt="BugPin Logo" 
                  width={32} 
                  height={32}
                />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                By combining collaborative debugging with social features our platform makes it easy to share coding errors, <em className="text-primary">find</em> solutions in real-time, and <em className="text-primary">learn</em> from the developer community.
              </h2>
            </div>

            {/* Right Content */}
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Developer Community</h3>
                    <p className="text-sm text-muted-foreground">Error Resolution</p>
                  </div>
                </div>
                <div className="w-full h-24 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-lg"></div>
              </div>
            </div>
          </div>
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

      {/* Footer */}
      <footer className="relative">
        {/* Background Image - Top white, bottom black */}
        <div className="relative h-96 bg-[url('/footer.jpg')] bg-cover bg-center bg-no-repeat rounded-t-3xl overflow-hidden">
          {/* Overlay to create white top, black bottom effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-black/80"></div>
        </div>
        
        {/* Black content section */}
        <div className="bg-black text-white">
          <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-4 gap-8">
              {/* Brand Section */}
              <div className="md:col-span-1">
                <div className="flex items-center gap-3 mb-4">
                  <Image 
                    src="/bug_logo.png" 
                    alt="BugPin Logo" 
                    width={40} 
                    height={40}
                    className="w-10 h-10"
                  />
                  <span className="text-2xl font-bold font-dm-sans">BugPin</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  A social platform where developers share coding errors, discover solutions, and turn debugging frustrations into collaborative learning experiences.
                </p>
              </div>

              {/* Product Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4 font-dm-sans">Product</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="/home" className="text-gray-300 hover:text-white transition-colors">Home</a></li>
                  <li><a href="/upload" className="text-gray-300 hover:text-white transition-colors">Share Error</a></li>
                  <li><a href="/search" className="text-gray-300 hover:text-white transition-colors">Search Bugs</a></li>
                  <li><a href="/content-policy" className="text-gray-300 hover:text-white transition-colors">Content Policy</a></li>
                </ul>
              </div>

              {/* Community Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4 font-dm-sans">Community</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="/sign-in" className="text-gray-300 hover:text-white transition-colors">Sign In</a></li>
                  <li><a href="/sign-in" className="text-gray-300 hover:text-white transition-colors">Create Account</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Community Guidelines</a></li>
                </ul>
              </div>

              {/* Company Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4 font-dm-sans">Company</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Separator line and bottom section */}
          <div className="border-t border-gray-700">
            <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-400">
                  © 2024 BugPin. All rights reserved.
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">Discord</a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}