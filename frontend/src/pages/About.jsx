import { useEffect, useState } from 'react';
import { Award, Heart, Sparkles, Users, Globe, Leaf } from 'lucide-react';
import axios from '../api/axios';

const values = [
  {
    icon: Sparkles,
    title: 'Excellence',
    description: 'We pursue perfection in every aspect of our craft, from ingredient selection to the final product. Our commitment to quality is unwavering.',
    gradient: 'from-amber-500 to-orange-500'
  },
  {
    icon: Heart,
    title: 'Passion',
    description: 'Our love for perfumery drives us to create fragrances that evoke emotion and inspire confidence. Each scent is crafted with care and dedication.',
    gradient: 'from-rose-500 to-pink-500'
  },
  {
    icon: Award,
    title: 'Authenticity',
    description: 'We believe in creating genuine, authentic fragrances that stand the test of time. No shortcuts, no compromises—only the real thing.',
    gradient: 'from-blue-500 to-cyan-500'
  }
];

const timeline = [
  { year: '2024', title: 'Foundation', description: 'Ronel launched with a focus on premium fragrances for India' },
  { year: '2024', title: 'Pan-India Delivery', description: 'All-India shipping with India Post and partner couriers' },
  { year: '2024', title: 'Curated Collection', description: 'Scents inspired by Indian spices, florals, and traditions' },
  { year: '2024', title: 'Customer First', description: 'Easy returns, secure payments via UPI & cards' }
];

const team = [
  {
    name: 'Rhea Kapoor',
    role: 'Head of Fragrance',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
    bio: 'Curating scents for the Indian palette'
  },
  {
    name: 'Arjun Mehta',
    role: 'Operations',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    bio: 'Ensuring timely delivery across India'
  },
  {
    name: 'Priya Sharma',
    role: 'Quality & Customer Care',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
    bio: 'Your satisfaction is our priority'
  }
];

const DEFAULT_ABOUT_HERO = {
  image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=1600',
  heading: 'Crafting Timeless Elegance',
  subtitle: 'Every bottle tells a story of sophistication, passion, and the art of perfumery.',
  textColor: '#ffffff',
};

export default function About() {
  const [heroSettings, setHeroSettings] = useState(DEFAULT_ABOUT_HERO);

  useEffect(() => {
    async function fetchHeroSettings() {
      try {
        const { data } = await axios.get('/settings/hero?section=about');
        if (data?.settings) {
          setHeroSettings({
            image: data.settings.image || DEFAULT_ABOUT_HERO.image,
            heading: data.settings.heading || DEFAULT_ABOUT_HERO.heading,
            subtitle: data.settings.subtitle || DEFAULT_ABOUT_HERO.subtitle,
            textColor: data.settings.textColor || DEFAULT_ABOUT_HERO.textColor,
          });
        }
      } catch (error) {
        console.error('Failed to load about hero settings:', error);
      }
    }

    fetchHeroSettings();
  }, []);

  return (
    <div className="min-h-screen bg-white pt-24">
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${heroSettings.image}')` }} />
        </div>

        {/* Animated elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-white/20 animate-fadeInUp">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium tracking-wider">EST. 2024</span>
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif mb-8 leading-tight animate-fadeInUp" style={{ color: heroSettings.textColor }}>
            {heroSettings.heading.split("\n").map((line, index) => (
              <span key={index} className="block mb-2">{line}</span>
            ))}
          </h1>

          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-light animate-fadeInUp" style={{ color: heroSettings.textColor }}>
            {heroSettings.subtitle}
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <div className="inline-flex items-center space-x-2 bg-black/5 px-4 py-2 rounded-full mb-6">
                <Globe className="w-4 h-4 text-black" />
                <span className="text-sm font-medium tracking-wider text-black">OUR STORY</span>
              </div>

              <h2 className="text-5xl md:text-6xl font-serif text-black mb-8 leading-tight">
                A Journey of
                <br />
                <span className="gradient-text">Passion</span>
              </h2>

              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  Ronel was founded in India with a simple vision: to bring premium fragrances to every corner of the country. 
                  We combine traditional perfumery with modern preferences—florals, spices, and woody notes that resonate with Indian tastes.
                </p>
                <p>
                  From jasmine and sandalwood to oud and saffron, our scents draw from rich Indian and global traditions. 
                  Each fragrance is crafted for longevity and character, whether for daily wear or special occasions.
                </p>
                <p>
                  We deliver across India with reliable shipping. Pay with UPI, cards, or net banking. 
                  Your satisfaction matters—reach out anytime with questions or feedback.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <img 
                    src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600"
                    alt="Perfume craftsmanship"
                    className="w-full h-80 object-cover rounded-3xl shadow-2xl hover-lift"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1585120040315-caa9cdbb918e?w=600"
                    alt="Perfume bottles"
                    className="w-full h-64 object-cover rounded-3xl shadow-2xl hover-lift"
                  />
                </div>
                <div className="space-y-6 mt-12">
                  <img 
                    src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600"
                    alt="Perfume ingredients"
                    className="w-full h-64 object-cover rounded-3xl shadow-2xl hover-lift"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=600"
                    alt="Luxury perfume"
                    className="w-full h-80 object-cover rounded-3xl shadow-2xl hover-lift"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541643600914-78b084683601?w=1600')] bg-cover bg-center" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { value: '50K+', label: 'Happy Customers', icon: Users },
              { value: '100+', label: 'Unique Fragrances', icon: Sparkles },
              { value: '25+', label: 'Countries', icon: Globe },
              { value: '100%', label: 'Natural Ingredients', icon: Leaf }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6 group-hover:bg-white/20 transition-all duration-300 transform group-hover:scale-110">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-gray-400 text-sm tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-black/5 px-4 py-2 rounded-full mb-6">
              <Award className="w-4 h-4 text-black" />
              <span className="text-sm font-medium tracking-wider text-black">OUR VALUES</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-serif text-black mb-6">
              What Drives Us
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we create
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {values.map((value, index) => (
              <div 
                key={index} 
                className="group relative p-10 bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-200 hover:border-gray-300 transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-2"
              >
                <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${value.gradient} rounded-2xl mb-8 shadow-lg group-hover:scale-110 transform transition-all duration-500`}>
                  <value.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-serif font-semibold mb-6 text-black">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {value.description}
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-serif text-black mb-6">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Milestones that shaped our story
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-black via-gray-400 to-black transform md:-translate-x-1/2" />

            <div className="space-y-16">
              {timeline.map((item, index) => (
                <div 
                  key={index}
                  className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col`}>
                  <div className="absolute left-0 md:left-1/2 w-6 h-6 bg-black rounded-full border-4 border-white shadow-lg transform md:-translate-x-1/2 z-10" />
                  
                  <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:pr-16' : 'md:pl-16'} pl-12 md:pl-0`}>
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="text-4xl font-bold text-black mb-3">{item.year}</div>
                      <h3 className="text-2xl font-serif font-semibold text-black mb-3">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-serif text-black mb-6">
              Meet Our Experts
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The talented individuals behind every fragrance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {team.map((member, index) => (
              <div key={index} className="group text-center">
                <div className="relative mb-8 overflow-hidden rounded-3xl">
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="w-full aspect-square object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <h3 className="text-2xl font-serif font-semibold text-black mb-2">{member.name}</h3>
                <div className="text-gray-500 font-medium mb-3">{member.role}</div>
                <p className="text-gray-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541643600914-78b084683601?w=1600')] bg-cover bg-center" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-5xl md:text-6xl font-serif mb-8 leading-tight">
            Experience the Art
            <br />
            of Perfumery
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
            Discover our collection and find your signature scent
          </p>
          <a 
            href="/shop"
            className="inline-flex items-center px-10 py-5 bg-white text-black font-bold tracking-wider hover:bg-gray-100 transition-all duration-300 shadow-2xl transform hover:-translate-y-1 btn-premium"
          >
            EXPLORE COLLECTION
          </a>
        </div>
      </section>
    </div>
  );
}
