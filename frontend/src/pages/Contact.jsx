import { useState, useEffect, useContext } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '../utils/ToastProvider';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axios';

export default function Contact() {
  const { showToast } = useToast();
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, name: user.name || '', email: user.email || '' }));
    }
  }, [user]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [heroSettings, setHeroSettings] = useState({
    image: null,
    heading: 'Get in Touch',
    subtitle: "We'd love to hear from you. Let's create something beautiful together.",
    textColor: '#ffffff',
  });
  const [mapSettings, setMapSettings] = useState({
    image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1600",
    heading: "Visit Us",
    subtitle: "India",
    textColor: "#000000",
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const [heroRes, mapRes] = await Promise.all([
          axios.get('/settings/hero?section=contact&subSection=hero'),
          axios.get('/settings/hero?section=contact&subSection=map')
        ]);

        if (heroRes.data?.settings) {
          setHeroSettings(heroRes.data.settings);
        }
        if (mapRes.data?.settings) {
          setMapSettings(mapRes.data.settings);
        }
      } catch (error) {
        console.error('Failed to load contact settings:', error);
      }
    }

    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      showToast('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await axios.post('/users/contact', formData);
      showToast(data.message || 'Message sent successfully!');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Error submitting form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-white pt-24">
      {/* Hero */}
      <section className="relative h-[500px] bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${heroSettings.image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600'}')` }}
          />
        </div>
        
        {/* Animated elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        
        <div className="relative z-10 text-center text-white px-4">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-white/20 animate-fadeInUp">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-medium tracking-wider">LET'S TALK</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif mb-6 animate-fadeInUp opacity-0" style={{ animationDelay: '0.2s', color: heroSettings.textColor }}>
            {heroSettings.heading}
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto animate-fadeInUp opacity-0" style={{ animationDelay: '0.4s', color: heroSettings.textColor }}>
            {heroSettings.subtitle}
          </p>
        </div>
      </section>
      
      {/* Contact Content */}
      <section className="py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Contact Info */}
            <div>
              <h2 className="text-4xl md:text-5xl font-serif text-black mb-6">
                Contact Information
              </h2>
              <p className="text-lg text-gray-600 mb-12 leading-relaxed">
                Have questions about our fragrances? Need personalized recommendations? 
                Our team is here to help you discover your perfect scent.
              </p>
              
              <div className="space-y-8 mb-12">
                {[
                  {
                    icon: Mail,
                    title: 'Email',
                    value: 'support@ronel.in',
                    link: 'mailto:support@ronel.in',
                    gradient: 'from-blue-500 to-cyan-500'
                  },
                  {
                    icon: Phone,
                    title: 'Phone',
                    value: '+91 98765 43210',
                    link: 'tel:+919876543210',
                    gradient: 'from-green-500 to-emerald-500'
                  },
                  {
                    icon: MapPin,
                    title: 'Address',
                    value: 'India',
                    gradient: 'from-purple-500 to-pink-500'
                  }
                ].map((contact, index) => (
                  <div key={index} className="flex items-start space-x-6 group">
                    <div className={`w-16 h-16 bg-gradient-to-br ${contact.gradient} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transform transition-all duration-300`}>
                      <contact.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-black mb-2">{contact.title}</h3>
                      {contact.link ? (
                        <a href={contact.link} className="text-gray-600 hover:text-black transition-colors text-lg">
                          {contact.value}
                        </a>
                      ) : (
                        <p className="text-gray-600 text-lg">{contact.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-8 bg-gradient-to-br from-black to-gray-900 rounded-3xl text-white shadow-2xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-xl">Business Hours</h3>
                </div>
                <div className="space-y-3 text-gray-300">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span>Monday - Friday</span>
                    <span className="font-medium text-white">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span>Saturday</span>
                    <span className="font-medium text-white">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span>Sunday</span>
                    <span className="font-medium text-white">Closed</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-10">
              <h2 className="text-4xl font-serif text-black mb-6">
                Send us a Message
              </h2>
              
              {submitted && (
                <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl animate-fadeIn">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <p className="text-green-800 font-medium">Thank you! We'll get back to you soon.</p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-3 tracking-wide">
                    YOUR NAME *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none transition-all duration-300 text-lg"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-3 tracking-wide">
                    EMAIL ADDRESS *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none transition-all duration-300 text-lg"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-bold text-gray-700 mb-3 tracking-wide">
                    SUBJECT *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none transition-all duration-300 text-lg"
                    placeholder="How can we help?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-3 tracking-wide">
                    YOUR MESSAGE *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none transition-all duration-300 resize-none text-lg"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center space-x-3 px-8 py-5 bg-black text-white font-bold tracking-wider transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 btn-premium ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-gray-900'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                      <span>SENDING...</span>
                    </>
                  ) : (
                    <>
                      <span>SEND MESSAGE</span>
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="h-96 bg-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-transparent z-10" />
        <img 
          src={mapSettings.image || "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1600"}
          alt="Location map"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl text-center max-w-md">
            <MapPin className="w-12 h-12 text-black mx-auto mb-4" />
            <h3 className="text-2xl font-serif font-bold text-black mb-2" style={{ color: mapSettings.textColor }}>{mapSettings.heading}</h3>
            <p className="text-gray-600 mb-4" style={{ color: mapSettings.textColor }}>{mapSettings.subtitle}</p>
            <a 
              href="https://maps.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-black text-white font-medium tracking-wide hover:bg-gray-900 transition-colors rounded-lg"
            >
              Get Directions
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
