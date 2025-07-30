import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Plane, MapPin, Star, Users, Globe, ArrowRight } from 'lucide-react';
import heroImage from '@/assets/hero-travel.jpg';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Plane className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">TravelAI</h1>
            </div>
            <Button 
              variant="hero" 
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <img 
          src={heroImage} 
          alt="Beautiful travel destination" 
          className="w-full h-screen object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-90"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Discover Your Perfect Journey
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Let AI create personalized travel itineraries based on your interests, budget, and preferences
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="hero" 
                size="hero" 
                onClick={() => navigate('/auth')}
                className="flex items-center gap-2"
              >
                Start Planning
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="hero"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                onClick={() => navigate('/auth')}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose TravelAI?
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of travel planning with our AI-powered platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-card shadow-card hover:shadow-travel transition-shadow duration-300">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-3">Personalized Itineraries</h4>
              <p className="text-muted-foreground">
                AI-generated travel plans tailored to your interests, budget, and travel style
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-card shadow-card hover:shadow-travel transition-shadow duration-300">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-3">Global Destinations</h4>
              <p className="text-muted-foreground">
                Explore any destination worldwide with detailed local insights and recommendations
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-card shadow-card hover:shadow-travel transition-shadow duration-300">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-3">Group Planning</h4>
              <p className="text-muted-foreground">
                Perfect for solo travelers, couples, families, or large groups with customized suggestions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-ocean">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Adventure?
          </h3>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who trust TravelAI to plan their perfect trips
          </p>
          <Button 
            variant="travel" 
            size="hero" 
            onClick={() => navigate('/auth')}
            className="flex items-center gap-2 mx-auto"
          >
            Create Your First Itinerary
            <MapPin className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Plane className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">TravelAI</span>
          </div>
          <p className="text-muted-foreground">
            Your AI-powered travel companion for unforgettable journeys
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
