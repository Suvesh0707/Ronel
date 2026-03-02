import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import axios from '../api/axios';

export default function Footer() {
  const [apiOk, setApiOk] = useState(null);

  useEffect(() => {
    axios.get('/health').then((r) => setApiOk(r.data?.ok === true)).catch(() => setApiOk(false));
  }, []);

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
              <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
   <img src="/footer.png" alt="Ronel Logo" className="h-20 w-auto" />
          </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Premium fragrances crafted for India. Curated scents delivered across the country.
            </p>
            <div className="flex items-center space-x-4">
              <a href="https://www.instagram.com/ronel.perfumes" className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold tracking-wider mb-6 text-white">QUICK LINKS</h3>
            <ul className="space-y-3">
              {[
                { to: '/shop', label: 'Shop All' },
                { to: '/cart', label: 'Cart' },
                { to: '/orders', label: 'My Orders' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="group text-gray-400 hover:text-white text-sm transition flex items-center gap-2">
                    <span className="w-0 group-hover:w-2 h-0.5 bg-white transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-bold tracking-wider mb-6 text-white">CUSTOMER SERVICE</h3>
            <ul className="space-y-3">
              {[
                { to: '/shipping', label: 'Shipping & Returns' },
                { to: '/returns', label: 'Returns & Refunds' },
                { to: '/privacy', label: 'Privacy Policy' },
                { to: '/terms', label: 'Terms & Conditions' },
                { to: '/faq', label: 'FAQ' }
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="group text-gray-400 hover:text-white text-sm transition-colors flex items-center space-x-2">
                    <span className="w-0 group-hover:w-2 h-0.5 bg-white transition-all duration-300" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold tracking-wider mb-6 text-white">GET IN TOUCH</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <a href="mailto:support@ronel.in" className="text-gray-400 hover:text-white text-sm transition-colors">
                  support@ronel.in
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <a href="tel:+919876543210" className="text-gray-400 hover:text-white text-sm transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  India
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <p className="text-gray-400 text-sm">
  © 2026 Ronel. All rights reserved. | Developed by 
  <a 
    href="https://github.com/suvesh0707" 
    target="_blank" 
    rel="noopener noreferrer"
    className="text-white font-semibold ml-1 hover:underline"
  >
    Suvesh Pagam
  </a>
</p>
              {apiOk === true && (
                <span className="flex items-center gap-1.5 text-xs text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  API connected
                </span>
              )}
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy</Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms</Link>
              <Link to="/faq" className="text-gray-400 hover:text-white text-sm transition-colors">FAQ</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
