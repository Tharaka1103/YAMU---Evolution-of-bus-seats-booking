'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Bus,
  Clock,
  MapPin,
  Wifi,
  Wind,
  Tv,
  Coffee,
  Plug,
  Check,
  X,
  User,
  Mail,
  Phone,
  CreditCard,
  Smartphone,
  Building2,
  QrCode,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
  Leaf,
  Calendar,
  Users,
  Star,
  Shield,
  Ticket,
  Armchair,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Copy,
  Printer
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamic import of Leaflet map to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/RouteMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-80 bg-muted rounded-xl flex items-center justify-center">Loading map...</div>
});

// Types
interface Seat {
  id: string;
  number: number;
  status: 'available' | 'booked' | 'selected';
  type: 'window' | 'aisle' | 'middle';
  price: number;
  row: number;
  col: number;
}

interface BusData {
  id: number;
  operator: string;
  type: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  rating: number;
  reviews: number;
  amenities: string[];
  busNumber: string;
  image?: string;
}

interface PassengerInfo {
  name: string;
  email: string;
  phone: string;
  gender: string;
  seatNumber: number;
}

// Mock Data
const mockBuses: BusData[] = [
  {
    id: 1,
    operator: 'Lanka Ashok Leyland',
    type: 'Luxury AC',
    departureTime: '06:00 AM',
    arrivalTime: '10:30 AM',
    duration: '4h 30m',
    price: 1500,
    availableSeats: 24,
    totalSeats: 40,
    rating: 4.8,
    reviews: 342,
    amenities: ['ac', 'wifi', 'charging', 'tv'],
    busNumber: 'NB-1234'
  },
  {
    id: 2,
    operator: 'SLTB Super Luxury',
    type: 'Semi Luxury AC',
    departureTime: '07:30 AM',
    arrivalTime: '12:00 PM',
    duration: '4h 30m',
    price: 1200,
    availableSeats: 18,
    totalSeats: 48,
    rating: 4.5,
    reviews: 567,
    amenities: ['ac', 'charging'],
    busNumber: 'NC-5678'
  },
  {
    id: 3,
    operator: 'Rajarata Travels',
    type: 'Luxury AC Sleeper',
    departureTime: '08:00 AM',
    arrivalTime: '12:15 PM',
    duration: '4h 15m',
    price: 1800,
    availableSeats: 12,
    totalSeats: 32,
    rating: 4.9,
    reviews: 189,
    amenities: ['ac', 'wifi', 'charging', 'tv', 'coffee'],
    busNumber: 'WP-9012'
  },
  {
    id: 4,
    operator: 'Express Runners',
    type: 'AC Deluxe',
    departureTime: '09:00 AM',
    arrivalTime: '01:45 PM',
    duration: '4h 45m',
    price: 1350,
    availableSeats: 30,
    totalSeats: 44,
    rating: 4.6,
    reviews: 423,
    amenities: ['ac', 'wifi', 'charging'],
    busNumber: 'SP-3456'
  },
  {
    id: 5,
    operator: 'Royal Coaches',
    type: 'Premium Luxury',
    departureTime: '10:30 AM',
    arrivalTime: '02:45 PM',
    duration: '4h 15m',
    price: 2200,
    availableSeats: 8,
    totalSeats: 24,
    rating: 4.95,
    reviews: 98,
    amenities: ['ac', 'wifi', 'charging', 'tv', 'coffee'],
    busNumber: 'WP-7890'
  }
];

// Generate seat layout for a bus
const generateSeatLayout = (busId: number): Seat[] => {
  const seats: Seat[] = [];
  const rows = 10;
  let seatNumber = 1;
  
  // Seed random based on busId for consistency
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  for (let row = 0; row < rows; row++) {
    // Left side - 2 seats
    for (let col = 0; col < 2; col++) {
      const randomVal = seededRandom(busId * 100 + row * 10 + col);
      seats.push({
        id: `${row}-${col}`,
        number: seatNumber++,
        status: randomVal > 0.65 ? 'booked' : 'available',
        type: col === 0 ? 'window' : 'aisle',
        price: col === 0 ? 100 : 0, // Window seat premium
        row,
        col
      });
    }
    // Right side - 2 seats
    for (let col = 3; col < 5; col++) {
      const randomVal = seededRandom(busId * 100 + row * 10 + col);
      seats.push({
        id: `${row}-${col}`,
        number: seatNumber++,
        status: randomVal > 0.65 ? 'booked' : 'available',
        type: col === 4 ? 'window' : 'aisle',
        price: col === 4 ? 100 : 0,
        row,
        col
      });
    }
  }
  return seats;
};

// Amenity icons mapping
const amenityIcons: Record<string, { icon: React.ElementType; label: string }> = {
  ac: { icon: Wind, label: 'Air Conditioning' },
  wifi: { icon: Wifi, label: 'Free WiFi' },
  charging: { icon: Plug, label: 'Charging Ports' },
  tv: { icon: Tv, label: 'Entertainment' },
  coffee: { icon: Coffee, label: 'Refreshments' }
};

export default function BookingPage() {
  // Core States
  const [step, setStep] = useState<number>(1);
  const [selectedBus, setSelectedBus] = useState<BusData | null>(null);
  const [seatLayout, setSeatLayout] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [passengers, setPassengers] = useState<PassengerInfo[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [bookingId, setBookingId] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('departure');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedBus, setExpandedBus] = useState<number | null>(null);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  // Route info (simulated from URL params or previous page)
  const [routeInfo] = useState({
    from: 'Colombo',
    to: 'Kandy',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    formattedDate: new Date(Date.now() + 86400000).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    // Route coordinates (Colombo to Kandy)
    fromCoords: { lat: 6.9271, lng: 80.7789 },
    toCoords: { lat: 7.2906, lng: 80.6337 },
    // Approximate route waypoints
    routeWaypoints: [
      { lat: 6.9271, lng: 80.7789 },
      { lat: 6.95, lng: 80.75 },
      { lat: 7.05, lng: 80.72 },
      { lat: 7.15, lng: 80.69 },
      { lat: 7.2906, lng: 80.6337 }
    ]
  });

  // Generate seat layout when bus is selected
  useEffect(() => {
    if (selectedBus) {
      const layout = generateSeatLayout(selectedBus.id);
      setSeatLayout(layout);
      setSelectedSeats([]);
    }
  }, [selectedBus]);

  // Initialize passenger forms when seats are selected
  useEffect(() => {
    const newPassengers = selectedSeats.map((seat, index) => ({
      name: passengers[index]?.name || '',
      email: passengers[index]?.email || '',
      phone: passengers[index]?.phone || '',
      gender: passengers[index]?.gender || '',
      seatNumber: seat.number
    }));
    setPassengers(newPassengers);
  }, [selectedSeats.length]);

  // Filtered and sorted buses
  const filteredBuses = useMemo(() => {
    let buses = [...mockBuses];
    
    if (filterType !== 'all') {
      buses = buses.filter(bus => 
        bus.type.toLowerCase().includes(filterType.toLowerCase())
      );
    }

    switch (sortBy) {
      case 'price':
        buses.sort((a, b) => a.price - b.price);
        break;
      case 'rating':
        buses.sort((a, b) => b.rating - a.rating);
        break;
      case 'departure':
      default:
        // Already sorted by departure time
        break;
    }

    return buses;
  }, [sortBy, filterType]);

  // Calculate total price
  const calculateTotal = () => {
    if (!selectedBus) return 0;
    const basePrice = selectedBus.price * selectedSeats.length;
    const seatPremium = selectedSeats.reduce((acc, seat) => acc + seat.price, 0);
    return basePrice + seatPremium;
  };

  // Handle seat selection
  const handleSeatSelect = (seat: Seat) => {
    if (seat.status === 'booked') return;

    const isSelected = selectedSeats.find(s => s.id === seat.id);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= 6) {
        alert('Maximum 6 seats can be booked at once');
        return;
      }
      setSelectedSeats([...selectedSeats, { ...seat, status: 'selected' }]);
    }
  };

  // Validate passenger details
  const validatePassengers = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    passengers.forEach((passenger, index) => {
      if (!passenger.name.trim()) {
        newErrors[`name-${index}`] = 'Name is required';
      }
      if (!passenger.phone.trim()) {
        newErrors[`phone-${index}`] = 'Phone is required';
      } else if (!/^[0-9]{10}$/.test(passenger.phone.replace(/\D/g, ''))) {
        newErrors[`phone-${index}`] = 'Invalid phone number';
      }
      if (!passenger.gender) {
        newErrors[`gender-${index}`] = 'Gender is required';
      }
      if (index === 0 && !passenger.email.trim()) {
        newErrors[`email-${index}`] = 'Email is required for primary passenger';
      } else if (passenger.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passenger.email)) {
        newErrors[`email-${index}`] = 'Invalid email format';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate payment details
  const validatePayment = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (paymentMethod === 'card') {
      if (!cardDetails.number.trim() || cardDetails.number.replace(/\s/g, '').length !== 16) {
        newErrors.cardNumber = 'Valid card number is required';
      }
      if (!cardDetails.name.trim()) {
        newErrors.cardName = 'Cardholder name is required';
      }
      if (!cardDetails.expiry.trim() || !/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
        newErrors.cardExpiry = 'Valid expiry date is required (MM/YY)';
      }
      if (!cardDetails.cvv.trim() || !/^\d{3,4}$/.test(cardDetails.cvv)) {
        newErrors.cardCvv = 'Valid CVV is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    if (!validatePayment()) return;

    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const newBookingId = `YAMU-${Date.now().toString(36).toUpperCase()}`;
    setBookingId(newBookingId);
    setIsProcessing(false);
    setStep(5);
  };

  // Copy booking ID
  const copyBookingId = () => {
    navigator.clipboard.writeText(bookingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Step navigation
  const nextStep = () => {
    if (step === 1 && !selectedBus) {
      alert('Please select a bus');
      return;
    }
    if (step === 2 && selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }
    if (step === 3 && !validatePassengers()) {
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  // Step titles
  const stepTitles = [
    'Select Bus',
    'Choose Seats',
    'Passenger Details',
    'Payment',
    'Confirmation'
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-lg z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Back */}
            <div className="flex items-center gap-4">
              <Link href="/">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Y<span className="text-chart-2">AM</span>U</h1>
                <p className="text-xs text-muted-foreground">by TRIMIDS</p>
              </div>
            </div>

            {/* Route Summary - Desktop */}
            <div className="hidden md:flex items-center gap-6 bg-muted/50 px-6 py-3 rounded-full">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-chart-2" />
                <span className="font-medium">{routeInfo.from}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{routeInfo.to}</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{routeInfo.formattedDate}</span>
              </div>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <motion.div
                  key={s}
                  initial={false}
                  animate={{
                    width: s === step ? 24 : 8,
                    backgroundColor: s === step ? 'hsl(var(--primary))' : s < step ? 'hsl(var(--chart-2))' : 'hsl(var(--muted))'
                  }}
                  className="h-2 rounded-full"
                />
              ))}
            </div>
          </div>

          {/* Route Summary - Mobile */}
          <div className="md:hidden mt-4 flex items-center justify-center gap-3 text-sm">
            <MapPin className="w-4 h-4 text-chart-2" />
            <span>{routeInfo.from}</span>
            <ArrowRight className="w-3 h-3" />
            <span>{routeInfo.to}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{routeInfo.date}</span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-muted/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center justify-between">
            {stepTitles.map((title, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center gap-2 ${index + 1 <= step ? 'text-foreground' : 'text-muted-foreground'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index + 1 < step ? 'bg-chart-2 text-white' :
                    index + 1 === step ? 'bg-primary text-primary-foreground' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1 < step ? <Check className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className="hidden md:inline text-sm font-medium">{title}</span>
                </div>
                {index < stepTitles.length - 1 && (
                  <div className={`w-8 md:w-16 lg:w-24 h-0.5 mx-2 ${
                    index + 1 < step ? 'bg-chart-2' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Select Bus */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Bus List */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold">Available Buses</h2>
                      <p className="text-muted-foreground mt-1">{filteredBuses.length} buses found</p>
                    </div>
                    
                    {/* Filters */}
                    <div className="flex items-center gap-3">
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="all">All Types</option>
                        <option value="luxury">Luxury</option>
                        <option value="semi">Semi Luxury</option>
                        <option value="ac">AC</option>
                      </select>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="departure">Departure Time</option>
                        <option value="price">Price: Low to High</option>
                        <option value="rating">Rating</option>
                      </select>
                    </div>
                  </div>

                  {/* Bus Cards */}
                  <div className="space-y-4">
                    {filteredBuses.map((bus) => (
                      <motion.div
                        key={bus.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.01 }}
                        className={`bg-card border rounded-xl overflow-hidden transition-all cursor-pointer ${
                          selectedBus?.id === bus.id ? 'border-chart-2 ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedBus(bus)}
                      >
                        <div className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Bus Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                  <Bus className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-lg">{bus.operator}</h3>
                                  <p className="text-sm text-muted-foreground">{bus.type} • {bus.busNumber}</p>
                                </div>
                              </div>
                              
                              {/* Time & Duration */}
                              <div className="flex items-center gap-4 mt-4">
                                <div className="text-center">
                                  <p className="text-2xl font-bold">{bus.departureTime}</p>
                                  <p className="text-xs text-muted-foreground">{routeInfo.from}</p>
                                </div>
                                <div className="flex-1 flex flex-col items-center">
                                  <p className="text-xs text-muted-foreground mb-1">{bus.duration}</p>
                                  <div className="w-full h-0.5 bg-border relative">
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-chart-2" />
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                                  </div>
                                </div>
                                <div className="text-center">
                                  <p className="text-2xl font-bold">{bus.arrivalTime}</p>
                                  <p className="text-xs text-muted-foreground">{routeInfo.to}</p>
                                </div>
                              </div>
                            </div>

                            {/* Price & Seats */}
                            <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2">
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Starting from</p>
                                <p className="text-3xl font-bold text-primary">Rs. {bus.price.toLocaleString()}</p>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-1 text-sm">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  <span className="font-medium">{bus.rating}</span>
                                  <span className="text-muted-foreground">({bus.reviews})</span>
                                </div>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                bus.availableSeats > 20 ? 'bg-chart-2/10 text-chart-2' :
                                bus.availableSeats > 10 ? 'bg-yellow-500/10 text-yellow-600' :
                                'bg-destructive/10 text-destructive'
                              }`}>
                                {bus.availableSeats} seats left
                              </div>
                            </div>
                          </div>

                          {/* Amenities */}
                          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                            <div className="flex items-center gap-2">
                              {bus.amenities.map((amenity) => {
                                const AmenityIcon = amenityIcons[amenity]?.icon;
                                return AmenityIcon ? (
                                  <div
                                    key={amenity}
                                    className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center"
                                    title={amenityIcons[amenity]?.label}
                                  >
                                    <AmenityIcon className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                ) : null;
                              })}
                            </div>
                            <div className="flex-1" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedBus(expandedBus === bus.id ? null : bus.id);
                              }}
                              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {expandedBus === bus.id ? 'Less info' : 'More info'}
                              {expandedBus === bus.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>

                          {/* Expanded Info */}
                          <AnimatePresence>
                            {expandedBus === bus.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="pt-4 mt-4 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Bus Type</p>
                                    <p className="font-medium">{bus.type}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Total Seats</p>
                                    <p className="font-medium">{bus.totalSeats}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Window Seat Premium</p>
                                    <p className="font-medium">+Rs. 100</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Cancellation</p>
                                    <p className="font-medium text-chart-2">Free up to 24h</p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Selection Indicator */}
                        {selectedBus?.id === bus.id && (
                          <div className="bg-primary/10 px-6 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-primary">
                              <CheckCircle2 className="w-5 h-5" />
                              <span className="font-medium">Selected</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                nextStep();
                              }}
                              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
                            >
                              Continue
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Sidebar - Eco Info */}
                <div className="lg:w-80">
                  <div className="sticky top-32">
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                      <MapComponent 
                        fromCoords={routeInfo.fromCoords}
                        toCoords={routeInfo.toCoords}
                        waypoints={routeInfo.routeWaypoints}
                        from={routeInfo.from}
                        to={routeInfo.to}
                      />
                    </div>
                    <div className="bg-chart-2/5 border border-chart-2/20 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-chart-2/10 rounded-full flex items-center justify-center">
                          <Leaf className="w-5 h-5 text-chart-2" />
                        </div>
                        <div>
                          <h3 className="font-bold">Eco-Friendly Travel</h3>
                          <p className="text-xs text-muted-foreground">Carbon neutral journey</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Your booking plants 1 tree 🌱 and offsets ~2.5kg of CO₂ emissions.
                      </p>
                      <div className="flex items-center gap-4 text-center">
                        <div className="flex-1 bg-background rounded-lg p-3">
                          <p className="text-lg font-bold text-chart-2">2.5kg</p>
                          <p className="text-xs text-muted-foreground">CO₂ Offset</p>
                        </div>
                        <div className="flex-1 bg-background rounded-lg p-3">
                          <p className="text-lg font-bold text-chart-2">1</p>
                          <p className="text-xs text-muted-foreground">Tree Planted</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 bg-muted/50 border border-border rounded-xl p-6">
                      <h3 className="font-bold mb-3">Travel Tips</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-chart-2 mt-0.5" />
                          <span>Arrive 15 mins before departure</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-chart-2 mt-0.5" />
                          <span>Carry a valid ID for verification</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-chart-2 mt-0.5" />
                          <span>Window seats have best views!</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Seat Selection */}
          {step === 2 && selectedBus && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Seat Map */}
                <div className="flex-1">
                  <div className="mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold">Select Your Seats</h2>
                    <p className="text-muted-foreground mt-1">{selectedBus.operator} • {selectedBus.type}</p>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap items-center gap-6 mb-8">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-muted border border-border rounded-lg" />
                      <span className="text-sm">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary border border-primary rounded-lg" />
                      <span className="text-sm">Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-muted-foreground/20 border border-border rounded-lg flex items-center justify-center">
                        <X className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm">Booked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-chart-2/20 border border-chart-2/50 rounded-lg" />
                      <span className="text-sm">Window (+Rs.100)</span>
                    </div>
                  </div>

                  {/* Bus Layout */}
                  <div className="bg-card border border-border rounded-xl p-6 md:p-8">
                    {/* Driver Section */}
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-dashed border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <User className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <span className="text-sm text-muted-foreground">Driver</span>
                      </div>
                      <div className="text-sm text-muted-foreground">Front</div>
                    </div>

                    {/* Seat Grid */}
                    <div className="flex flex-col items-center gap-2">
                      {Array.from({ length: 10 }, (_, row) => {
                        const rowSeats = seatLayout.filter(seat => seat.row === row);
                        const leftSeats = rowSeats.filter(s => s.col < 2);
                        const rightSeats = rowSeats.filter(s => s.col >= 3);

                        return (
                          <div key={row} className="flex items-center gap-4 md:gap-8">
                            {/* Left Seats */}
                            <div className="flex gap-2">
                              {leftSeats.map((seat) => {
                                const isSelected = selectedSeats.find(s => s.id === seat.id);
                                return (
                                  <motion.button
                                    key={seat.id}
                                    whileHover={{ scale: seat.status !== 'booked' ? 1.1 : 1 }}
                                    whileTap={{ scale: seat.status !== 'booked' ? 0.95 : 1 }}
                                    onClick={() => handleSeatSelect(seat)}
                                    disabled={seat.status === 'booked'}
                                    className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                                      seat.status === 'booked'
                                        ? 'bg-muted-foreground/20 text-muted-foreground cursor-not-allowed'
                                        : isSelected
                                        ? 'bg-primary text-primary-foreground border-2 border-primary'
                                        : seat.type === 'window'
                                        ? 'bg-chart-2/10 border border-chart-2/30 hover:border-chart-2 text-foreground'
                                        : 'bg-muted border border-border hover:border-primary text-foreground'
                                    }`}
                                  >
                                    {seat.status === 'booked' ? (
                                      <X className="w-4 h-4" />
                                    ) : isSelected ? (
                                      <Check className="w-4 h-4" />
                                    ) : (
                                      seat.number
                                    )}
                                  </motion.button>
                                );
                              })}
                            </div>

                            {/* Aisle */}
                            <div className="w-8 md:w-12 flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">|</span>
                            </div>

                            {/* Right Seats */}
                            <div className="flex gap-2">
                              {rightSeats.map((seat) => {
                                const isSelected = selectedSeats.find(s => s.id === seat.id);
                                return (
                                  <motion.button
                                    key={seat.id}
                                    whileHover={{ scale: seat.status !== 'booked' ? 1.1 : 1 }}
                                    whileTap={{ scale: seat.status !== 'booked' ? 0.95 : 1 }}
                                    onClick={() => handleSeatSelect(seat)}
                                    disabled={seat.status === 'booked'}
                                    className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                                      seat.status === 'booked'
                                        ? 'bg-muted-foreground/20 text-muted-foreground cursor-not-allowed'
                                        : isSelected
                                        ? 'bg-primary text-primary-foreground border-2 border-primary'
                                        : seat.type === 'window'
                                        ? 'bg-chart-2/10 border border-chart-2/30 hover:border-chart-2 text-foreground'
                                        : 'bg-muted border border-border hover:border-primary text-foreground'
                                    }`}
                                  >
                                    {seat.status === 'booked' ? (
                                      <X className="w-4 h-4" />
                                    ) : isSelected ? (
                                      <Check className="w-4 h-4" />
                                    ) : (
                                      seat.number
                                    )}
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Back Label */}
                    <div className="mt-8 pt-4 border-t border-dashed border-border text-center">
                      <span className="text-sm text-muted-foreground">Rear</span>
                    </div>
                  </div>
                </div>

                {/* Right Sidebar */}
                <div className="lg:w-80">
                  <div className="sticky top-32 space-y-6">
                    {/* Route Map */}
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                      <MapComponent 
                        fromCoords={routeInfo.fromCoords}
                        toCoords={routeInfo.toCoords}
                        waypoints={routeInfo.routeWaypoints}
                        from={routeInfo.from}
                        to={routeInfo.to}
                      />
                    </div>

                    {/* Booking Summary Sidebar */}
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                      <div className="p-6 border-b border-border">
                        <h3 className="font-bold text-lg mb-4">
                          {selectedBus ? 'Selected Bus' : 'Bus Selection'}
                        </h3>
                        
                        {selectedBus && (
                          <div className="mb-4 pb-4 border-b border-border">
                            <p className="text-sm text-muted-foreground mb-1">Operator</p>
                            <p className="font-semibold text-foreground">{selectedBus.operator}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                {selectedBus.type}
                              </span>
                              <span className="text-xs bg-chart-2/10 text-chart-2 px-2 py-1 rounded flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {selectedBus.rating} ({selectedBus.reviews})
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {selectedBus && (
                          <>
                            {/* Route */}
                            <div className="flex items-center gap-3 mb-4">
                              <div className="flex flex-col items-center">
                                <div className="w-3 h-3 rounded-full bg-chart-2" />
                                <div className="w-0.5 h-8 bg-border" />
                                <div className="w-3 h-3 rounded-full bg-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="mb-2">
                                  <p className="font-medium">{routeInfo.from}</p>
                                  <p className="text-xs text-muted-foreground">{selectedBus.departureTime}</p>
                                </div>
                                <div>
                                  <p className="font-medium">{routeInfo.to}</p>
                                  <p className="text-xs text-muted-foreground">{selectedBus.arrivalTime}</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>{routeInfo.formattedDate}</span>
                              <span>{selectedBus.duration}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {selectedBus && (
                        <>
                          {/* Selected Seats */}
                          <div className="p-6 border-b border-border">
                            <p className="text-sm text-muted-foreground mb-3">Selected Seats</p>
                            {selectedSeats.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {selectedSeats.map((seat) => (
                                  <div
                                    key={seat.id}
                                    className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium flex items-center gap-1"
                                  >
                                    <Armchair className="w-3 h-3" />
                                    {seat.number}
                                    {seat.type === 'window' && <span className="text-xs">(W)</span>}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">No seats selected</p>
                            )}
                          </div>

                          {/* Price Breakdown */}
                          <div className="p-6">
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Base Fare × {selectedSeats.length}</span>
                            <span>Rs. {(selectedBus.price * selectedSeats.length).toLocaleString()}</span>
                          </div>
                          {selectedSeats.filter(s => s.type === 'window').length > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Window Seat Premium</span>
                              <span>Rs. {(selectedSeats.filter(s => s.type === 'window').length * 100).toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm text-chart-2">
                            <span>Eco Contribution</span>
                            <span>Included ✓</span>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-border">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-bold text-2xl text-primary">
                              Rs. {calculateTotal().toLocaleString()}
                            </span>
                          </div>
                        </div>
                          </div>
                        </>
                      )}
                    </div>

                      {/* Navigation Buttons */}
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={prevStep}
                          className="flex-1 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
                        >
                          Back
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={nextStep}
                          disabled={selectedSeats.length === 0}
                          className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Continue
                          <ArrowRight className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
            </motion.div>
          )}

          {/* Step 3: Passenger Details */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Passenger Forms */}
                <div className="flex-1">
                  <div className="mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold">Passenger Details</h2>
                    <p className="text-muted-foreground mt-1">Enter details for {selectedSeats.length} passenger(s)</p>
                  </div>

                  <div className="space-y-6">
                    {passengers.map((passenger, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-card border border-border rounded-xl p-6"
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="font-bold text-primary">{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="font-bold">Passenger {index + 1}</h3>
                            <p className="text-sm text-muted-foreground">
                              Seat {passenger.seatNumber}
                              {index === 0 && ' (Primary)'}
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Name */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Full Name *</label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                              <input
                                type="text"
                                value={passenger.name}
                                onChange={(e) => {
                                  const updated = [...passengers];
                                  updated[index].name = e.target.value;
                                  setPassengers(updated);
                                }}
                                placeholder="Enter full name"
                                className={`w-full pl-10 pr-4 py-3 bg-muted/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                                  errors[`name-${index}`] ? 'border-destructive' : 'border-transparent'
                                }`}
                              />
                            </div>
                            {errors[`name-${index}`] && (
                              <p className="text-xs text-destructive mt-1">{errors[`name-${index}`]}</p>
                            )}
                          </div>

                          {/* Phone */}
                          <div>
                            <label className="block text-sm font-medium mb-2">Phone Number *</label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                              <input
                                type="tel"
                                value={passenger.phone}
                                onChange={(e) => {
                                  const updated = [...passengers];
                                  updated[index].phone = e.target.value;
                                  setPassengers(updated);
                                }}
                                placeholder="0XX XXX XXXX"
                                className={`w-full pl-10 pr-4 py-3 bg-muted/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                                  errors[`phone-${index}`] ? 'border-destructive' : 'border-transparent'
                                }`}
                              />
                            </div>
                            {errors[`phone-${index}`] && (
                              <p className="text-xs text-destructive mt-1">{errors[`phone-${index}`]}</p>
                            )}
                          </div>

                          {/* Email (only for primary) */}
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Email {index === 0 ? '*' : '(Optional)'}
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                              <input
                                type="email"
                                value={passenger.email}
                                onChange={(e) => {
                                  const updated = [...passengers];
                                  updated[index].email = e.target.value;
                                  setPassengers(updated);
                                }}
                                placeholder="email@example.com"
                                className={`w-full pl-10 pr-4 py-3 bg-muted/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                                  errors[`email-${index}`] ? 'border-destructive' : 'border-transparent'
                                }`}
                              />
                            </div>
                            {errors[`email-${index}`] && (
                              <p className="text-xs text-destructive mt-1">{errors[`email-${index}`]}</p>
                            )}
                          </div>

                          {/* Gender */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Gender *</label>
                            <div className="flex gap-4">
                              {['Male', 'Female', 'Other'].map((gender) => (
                                <button
                                  key={gender}
                                  onClick={() => {
                                    const updated = [...passengers];
                                    updated[index].gender = gender.toLowerCase();
                                    setPassengers(updated);
                                  }}
                                  className={`flex-1 py-3 rounded-lg border font-medium transition-all ${
                                    passenger.gender === gender.toLowerCase()
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'bg-muted/50 border-border hover:border-primary'
                                  }`}
                                >
                                  {gender}
                                </button>
                              ))}
                            </div>
                            {errors[`gender-${index}`] && (
                              <p className="text-xs text-destructive mt-1">{errors[`gender-${index}`]}</p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Summary Sidebar */}
                <div className="lg:w-80">
                  <div className="sticky top-32">
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                      <div className="p-6 border-b border-border">
                        <h3 className="font-bold text-lg mb-4">Trip Summary</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Bus className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{selectedBus?.operator}</p>
                              <p className="text-xs text-muted-foreground">{selectedBus?.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-muted-foreground" />
                            <p className="text-sm">{routeInfo.formattedDate}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-muted-foreground" />
                            <p className="text-sm">{selectedBus?.departureTime} - {selectedBus?.arrivalTime}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Armchair className="w-5 h-5 text-muted-foreground" />
                            <p className="text-sm">
                              Seats: {selectedSeats.map(s => s.number).join(', ')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-lg">Total</span>
                          <span className="font-bold text-2xl text-primary">
                            Rs. {calculateTotal().toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={prevStep}
                        className="flex-1 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
                      >
                        Back
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={nextStep}
                        className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-2"
                      >
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Payment */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Payment Form */}
                <div className="flex-1">
                  <div className="mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold">Payment</h2>
                    <p className="text-muted-foreground mt-1">Complete your booking securely</p>
                  </div>

                  {/* Payment Methods */}
                  <div className="bg-card border border-border rounded-xl p-6 mb-6">
                    <h3 className="font-bold mb-4">Select Payment Method</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { id: 'card', icon: CreditCard, label: 'Card' },
                        { id: 'mobile', icon: Smartphone, label: 'Mobile' },
                        { id: 'bank', icon: Building2, label: 'Bank' }
                      ].map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                            paymentMethod === method.id
                              ? 'bg-primary/10 border-primary'
                              : 'bg-muted/50 border-border hover:border-primary/50'
                          }`}
                        >
                          <method.icon className={`w-6 h-6 ${
                            paymentMethod === method.id ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                          <span className={`text-sm font-medium ${
                            paymentMethod === method.id ? 'text-primary' : ''
                          }`}>
                            {method.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card Details */}
                  {paymentMethod === 'card' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card border border-border rounded-xl p-6"
                    >
                      <h3 className="font-bold mb-4">Card Details</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Card Number</label>
                          <input
                            type="text"
                            value={cardDetails.number}
                            onChange={(e) => setCardDetails({
                              ...cardDetails,
                              number: formatCardNumber(e.target.value)
                            })}
                            maxLength={19}
                            placeholder="1234 5678 9012 3456"
                            className={`w-full px-4 py-3 bg-muted/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                              errors.cardNumber ? 'border-destructive' : 'border-transparent'
                            }`}
                          />
                          {errors.cardNumber && (
                            <p className="text-xs text-destructive mt-1">{errors.cardNumber}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                          <input
                            type="text"
                            value={cardDetails.name}
                            onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                            placeholder="John Doe"
                            className={`w-full px-4 py-3 bg-muted/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                              errors.cardName ? 'border-destructive' : 'border-transparent'
                            }`}
                          />
                          {errors.cardName && (
                            <p className="text-xs text-destructive mt-1">{errors.cardName}</p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Expiry Date</label>
                            <input
                              type="text"
                              value={cardDetails.expiry}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, '');
                                if (value.length >= 2) {
                                  value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                }
                                setCardDetails({ ...cardDetails, expiry: value });
                              }}
                              maxLength={5}
                              placeholder="MM/YY"
                              className={`w-full px-4 py-3 bg-muted/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                                errors.cardExpiry ? 'border-destructive' : 'border-transparent'
                              }`}
                            />
                            {errors.cardExpiry && (
                              <p className="text-xs text-destructive mt-1">{errors.cardExpiry}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">CVV</label>
                            <input
                              type="password"
                              value={cardDetails.cvv}
                              onChange={(e) => setCardDetails({
                                ...cardDetails,
                                cvv: e.target.value.replace(/\D/g, '').slice(0, 4)
                              })}
                              maxLength={4}
                              placeholder="•••"
                              className={`w-full px-4 py-3 bg-muted/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                                errors.cardCvv ? 'border-destructive' : 'border-transparent'
                              }`}
                            />
                            {errors.cardCvv && (
                              <p className="text-xs text-destructive mt-1">{errors.cardCvv}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Mobile Payment */}
                  {paymentMethod === 'mobile' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card border border-border rounded-xl p-6"
                    >
                      <h3 className="font-bold mb-4">Mobile Payment</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {['Dialog Pay', 'Mobitel Pay', 'Hutch Pay', 'Frimi'].map((provider) => (
                          <button
                            key={provider}
                            className="p-4 bg-muted/50 border border-border rounded-xl text-center hover:border-primary transition-colors"
                          >
                            <span className="font-medium">{provider}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Bank Transfer */}
                  {paymentMethod === 'bank' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card border border-border rounded-xl p-6"
                    >
                      <h3 className="font-bold mb-4">Internet Banking</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {['BOC', 'Commercial Bank', 'Sampath Bank', 'HNB'].map((bank) => (
                          <button
                            key={bank}
                            className="p-4 bg-muted/50 border border-border rounded-xl text-center hover:border-primary transition-colors"
                          >
                            <span className="font-medium">{bank}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Security Note */}
                  <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
                    <Shield className="w-5 h-5 text-chart-2" />
                    <span>Your payment is secured with 256-bit SSL encryption</span>
                  </div>
                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:w-80">
                  <div className="sticky top-32">
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                      <div className="p-6 border-b border-border">
                        <h3 className="font-bold text-lg mb-4">Order Summary</h3>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{selectedBus?.operator}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{routeInfo.from} → {routeInfo.to}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{routeInfo.formattedDate}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {selectedSeats.length} seat(s): {selectedSeats.map(s => s.number).join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 border-b border-border">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>Rs. {(selectedBus!.price * selectedSeats.length).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Seat Premium</span>
                            <span>Rs. {selectedSeats.filter(s => s.type === 'window').length * 100}</span>
                          </div>
                          <div className="flex justify-between text-sm text-chart-2">
                            <span>Eco Contribution</span>
                            <span>Free</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                          <span className="font-bold text-lg">Total</span>
                          <span className="font-bold text-2xl text-primary">
                            Rs. {calculateTotal().toLocaleString()}
                          </span>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleConfirmBooking}
                          disabled={isProcessing}
                          className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Shield className="w-5 h-5" />
                              Pay Rs. {calculateTotal().toLocaleString()}
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>

                    <button
                      onClick={prevStep}
                      className="w-full mt-4 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
                    >
                      Back
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 5: Confirmation */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              {/* Success Animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-24 h-24 mx-auto mb-8 bg-chart-2/10 rounded-full flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <CheckCircle2 className="w-12 h-12 text-chart-2" />
                </motion.div>
              </motion.div>

              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Booking Confirmed!</h2>
                <p className="text-muted-foreground">Your journey has been booked successfully</p>
              </div>

              {/* Ticket Card */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Header */}
                <div className="bg-primary/10 p-6 text-center border-b border-dashed border-border">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Ticket className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Booking ID</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-mono font-bold">{bookingId}</span>
                    <button
                      onClick={copyBookingId}
                      className="p-1 hover:bg-primary/10 rounded transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-chart-2" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Route Details */}
                <div className="p-6 border-b border-border">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 text-center">
                      <p className="text-3xl font-bold">{selectedBus?.departureTime}</p>
                      <p className="text-lg font-medium">{routeInfo.from}</p>
                      <p className="text-xs text-muted-foreground">{routeInfo.formattedDate}</p>
                    </div>
                    <div className="flex flex-col items-center px-4">
                      <div className="text-xs text-muted-foreground mb-1">{selectedBus?.duration}</div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-chart-2" />
                        <div className="w-16 h-0.5 bg-border" />
                        <Bus className="w-5 h-5 text-primary" />
                        <div className="w-16 h-0.5 bg-border" />
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-3xl font-bold">{selectedBus?.arrivalTime}</p>
                      <p className="text-lg font-medium">{routeInfo.to}</p>
                      <p className="text-xs text-muted-foreground">{routeInfo.formattedDate}</p>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="p-6 border-b border-border">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Operator</p>
                      <p className="font-medium">{selectedBus?.operator}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Bus Type</p>
                      <p className="font-medium">{selectedBus?.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Bus Number</p>
                      <p className="font-medium">{selectedBus?.busNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Seat(s)</p>
                      <p className="font-medium">{selectedSeats.map(s => s.number).join(', ')}</p>
                    </div>
                  </div>
                </div>

                {/* Passengers */}
                <div className="p-6 border-b border-border">
                  <p className="text-xs text-muted-foreground mb-3">Passengers</p>
                  <div className="space-y-2">
                    {passengers.map((p, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{p.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Seat {p.seatNumber}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* QR Code */}
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-center">
                    <div className="bg-white p-4 rounded-xl">
                      <div className="w-32 h-32 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iODAiIHk9IjE2IiB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9ImJsYWNrIi8+CjxyZWN0IHg9IjE2IiB5PSI4MCIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSJibGFjayIvPgo8cmVjdCB4PSI1NiIgeT0iMTYiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+CjxyZWN0IHg9IjU2IiB5PSIzMiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iNTYiIHk9IjQ4IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJibGFjayIvPgo8cmVjdCB4PSI0MCIgeT0iNTYiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+CjxyZWN0IHg9IjU2IiB5PSI1NiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iNzIiIHk9IjU2IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJibGFjayIvPgo8cmVjdCB4PSI1NiIgeT0iNzIiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+CjxyZWN0IHg9IjU2IiB5PSI4OCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iNTYiIHk9IjEwNCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iODAiIHk9IjU2IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJibGFjayIvPgo8cmVjdCB4PSI5NiIgeT0iNTYiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+CjxyZWN0IHg9IjgwIiB5PSI3MiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iODAiIHk9Ijg4IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJibGFjayIvPgo8cmVjdCB4PSI5NiIgeT0iODAiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+CjxyZWN0IHg9IjEwNCIgeT0iOTYiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+CjxyZWN0IHg9IjI0IiB5PSIyNCIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSI4OCIgeT0iMjQiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0id2hpdGUiLz4KPHJlY3QgeD0iMjQiIHk9Ijg4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9IndoaXRlIi8+CjxyZWN0IHg9IjI4IiB5PSIyOCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iOTIiIHk9IjI4IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJibGFjayIvPgo8cmVjdCB4PSIyOCIgeT0iOTIiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo=')] bg-contain" />
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Show this QR code when boarding
                  </p>
                </div>

                {/* Amount Paid */}
                <div className="p-6 bg-chart-2/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-chart-2" />
                      <span className="font-medium">Amount Paid</span>
                    </div>
                    <span className="text-2xl font-bold text-chart-2">
                      Rs. {calculateTotal().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-4 bg-primary text-primary-foreground rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Ticket
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-4 border border-border rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-muted transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </motion.button>
              </div>

              {/* Eco Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 bg-chart-2/10 border border-chart-2/20 rounded-xl p-6 text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Leaf className="w-5 h-5 text-chart-2" />
                  <span className="font-bold text-chart-2">Eco Contribution</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  1 tree will be planted and 2.5kg CO₂ will be offset thanks to your booking! 🌱
                </p>
              </motion.div>

              {/* Back to Home */}
              <div className="mt-8 text-center">
                <Link href="/">
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    ← Back to Home
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}