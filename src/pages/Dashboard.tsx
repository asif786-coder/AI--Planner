import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Plane, MapPin, Calendar, Users, LogOut, Plus, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import heroImage from '@/assets/hero-travel.jpg';
import ItineraryForm from '@/components/ItineraryForm';
import ItineraryView from '@/components/ItineraryView';

interface Itinerary {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  num_travelers: number;
  budget: string;
  interests: string[];
  content: any;
  created_at: string;
}

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loadingItineraries, setLoadingItineraries] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      fetchItineraries();
    }
  }, [user, loading, navigate]);

  const fetchItineraries = async () => {
    try {
      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItineraries(data || []);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      toast({
        title: "Error",
        description: "Failed to load your itineraries",
        variant: "destructive",
      });
    } finally {
      setLoadingItineraries(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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

  if (selectedItinerary) {
    return (
      <ItineraryView 
        itinerary={selectedItinerary}
        onBack={() => setSelectedItinerary(null)}
      />
    );
  }

  if (showForm) {
    return (
      <ItineraryForm 
        onBack={() => setShowForm(false)}
        onSuccess={() => {
          setShowForm(false);
          fetchItineraries();
        }}
      />
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
              <div>
                <h1 className="text-2xl font-bold text-foreground">TravelAI</h1>
                <p className="text-sm text-muted-foreground">Your AI Travel Companion</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">Welcome back!</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl mb-8 shadow-card">
          <img 
            src={heroImage} 
            alt="Travel destination" 
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-hero opacity-80"></div>
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Ready for Your Next Adventure?</h2>
              <p className="text-lg mb-6 opacity-90">Let AI create the perfect itinerary for your dream trip</p>
              <Button 
                variant="hero" 
                size="hero" 
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Plan New Trip
              </Button>
            </div>
          </div>
        </div>

        {/* My Itineraries Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-foreground">My Travel Plans</h3>
            <Button 
              variant="travel" 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Itinerary
            </Button>
          </div>

          {loadingItineraries ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : itineraries.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-foreground mb-2">No itineraries yet</h4>
                <p className="text-muted-foreground mb-6">Start planning your first trip with AI assistance</p>
                <Button 
                  variant="travel" 
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Itinerary
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {itineraries.map((itinerary) => (
                <Card key={itinerary.id} className="hover:shadow-travel transition-shadow duration-300 group">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <MapPin className="h-5 w-5 text-primary" />
                      {itinerary.destination}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDate(itinerary.start_date)} - {formatDate(itinerary.end_date)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {itinerary.num_travelers} traveler{itinerary.num_travelers > 1 ? 's' : ''}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {itinerary.interests.slice(0, 3).map((interest, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                          >
                            {interest}
                          </span>
                        ))}
                        {itinerary.interests.length > 3 && (
                          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                            +{itinerary.interests.length - 3} more
                          </span>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300"
                        onClick={() => setSelectedItinerary(itinerary)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Itinerary
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;