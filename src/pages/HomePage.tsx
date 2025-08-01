import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, MapPin, ArrowRight, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="mb-6">
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 px-4 py-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 mr-2" />
              Connecting Communities Through Events
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
            Welcome to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Voxxy Presents
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            We simplify recurring club events with custom pages, automated waitlists, and seamless 
            messaging that keeps your community connected and your calendar full.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-6">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
              <Link to="/brooklynheartsclub">
                View Live Example
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to manage your community events
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From event creation to community management, we've got you covered
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Custom Event Pages</CardTitle>
                <CardDescription className="text-gray-600">
                  Beautiful, responsive pages for each of your events with all the details your community needs
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Automated Waitlists</CardTitle>
                <CardDescription className="text-gray-600">
                  Never worry about capacity again. Automated waitlist management keeps everything organized
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Community Messaging</CardTitle>
                <CardDescription className="text-gray-600">
                  Keep your community engaged with seamless messaging and updates about upcoming events
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Live Example Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              See it in action
            </h2>
            <p className="text-xl text-gray-600">
              Check out Brooklyn Hearts Club - a real community using Voxxy Presents
            </p>
          </div>
          
          <Card className="max-w-4xl mx-auto border-0 shadow-xl overflow-hidden">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <Badge className="bg-purple-100 text-purple-800 mb-4">Live Example</Badge>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Brooklyn Hearts Club</h3>
                  <p className="text-gray-600 mb-6">
                    An art club for adults that welcomes everyone. They use Voxxy Presents to manage 
                    their workshops, figure drawing sessions, and community events with ease.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                      <Link to="/brooklynheartsclub">
                        Visit Brooklyn Hearts Club
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg p-8 text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <p className="text-gray-700 font-medium">
                    "Voxxy Presents has made managing our recurring events so much easier. 
                    Our community loves the clean, organized event pages."
                  </p>
                  <p className="text-sm text-gray-500 mt-4">- Brooklyn Hearts Club</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to bring your community together?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join communities around the world who trust Voxxy Presents to manage their events
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
            Start Building Your Community
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold text-purple-400 mb-4">voxxypresents</h3>
              <p className="text-gray-300 mb-4 max-w-md">
                Simplifying recurring club events with custom pages, automated waitlists, and seamless 
                messaging that keeps your community connected.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Examples</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">&copy; 2024 Voxxy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}