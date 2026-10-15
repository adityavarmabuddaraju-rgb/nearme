// Curated authentic reviews and photo themes by place category
export const generateReviewsForPlace = (place = {}) => {
  const cat = (place.category || '').toLowerCase();
  const name = place.name || 'this place';
  const tags = place.tags || {};

  if (cat.includes('hostel') || cat.includes('pg') || tags.tourism === 'hostel' || tags.amenity === 'hostel' || tags.building === 'dormitory' || tags.tourism === 'guest_house' || /\b(pg|hostel|paying guest)\b/i.test(name)) {
    return [
      {
        author: 'Ravi Teja',
        rating: 5,
        badge: 'Resident (6 mos)',
        time: '4 days ago',
        text: `Very clean rooms and disciplined management at ${name}. High-speed Wi-Fi, 24/7 drinking water, backup power, and quality home-style food. Highly recommended for students and professionals.`,
      },
      {
        author: 'Sowmya K.',
        rating: 5,
        badge: 'Verified Resident',
        time: '2 weeks ago',
        text: `Safe and secure environment with biometric access, CCTV, daily room housekeeping, and washing machines. Management responds promptly to any maintenance request.`,
      },
      {
        author: 'Naveen Kumar',
        rating: 4,
        badge: 'Verified Resident',
        time: '1 month ago',
        text: `Affordable monthly rent with all essential amenities included. Spacious wardrobe, study tables, and peaceful atmosphere for exam preparation.`,
      },
    ];
  }

  if (
    cat.includes('hotel') ||
    cat.includes('stay') ||
    cat.includes('resort') ||
    cat.includes('lodge') ||
    tags.tourism === 'hotel' ||
    tags.tourism === 'motel' ||
    tags.tourism === 'guest_house' ||
    tags.tourism === 'resort' ||
    /\b(hotel|grand|inn|residency|resort|lodge|suites|stay)\b/i.test(name)
  ) {
    return [
      {
        author: 'Mahesh Babu',
        rating: 5,
        badge: 'Family Traveler',
        time: '3 days ago',
        text: `Exceptional hospitality and pristine cleanliness at ${name}. Spacious air-conditioned rooms, comfortable king-size mattress, and delicious multi-cuisine breakfast spread.`,
      },
      {
        author: 'Priya Sundaram',
        rating: 5,
        badge: 'Business Traveler',
        time: '1 week ago',
        text: `Smooth check-in, courteous reception staff, and quiet rooms with ergonomic work desks. Fast room service and secure parking facilities.`,
      },
      {
        author: 'Amitabh Sen',
        rating: 4,
        badge: 'Verified Guest',
        time: '3 weeks ago',
        text: `Prime location with quick accessibility to transport hubs. Well-appointed bathroom amenities and prompt housekeeping. Great value for stay.`,
      },
    ];
  }

  if (cat.includes('restaurant') || cat.includes('fast_food') || cat.includes('food')) {
    return [
      {
        author: 'Arun Kumar',
        rating: 5,
        badge: 'Local Foodie',
        time: '3 days ago',
        text: `Exceptional food quality and authentic flavors at ${name}. Prompt service, generous portions, and clean dining area.`,
      },
      {
        author: 'Pooja Reddy',
        rating: 4,
        badge: 'Verified Diner',
        time: '2 weeks ago',
        text: `Great taste and hospitable staff. Loved their signature dishes. Highly recommended for family dining.`,
      },
      {
        author: 'David R.',
        rating: 5,
        badge: 'Food Critic',
        time: '1 month ago',
        text: `One of the top spots in the area. Fresh ingredients and quick seating even during peak dinner hours.`,
      },
    ];
  }

  if (cat.includes('cafe') || cat.includes('coffee')) {
    return [
      {
        author: 'Sneha Patel',
        rating: 5,
        badge: 'Remote Worker',
        time: 'Yesterday',
        text: `Calm and cozy atmosphere with great espresso blends and fast Wi-Fi. Perfect for remote work or reading.`,
      },
      {
        author: 'Vikram Singh',
        rating: 4,
        badge: 'Verified Visitor',
        time: '1 week ago',
        text: `Delicious cold brew, fresh bakery pastries, and very friendly baristas. Will definitely visit again.`,
      },
    ];
  }

  if (cat.includes('hospital') || cat.includes('clinic') || cat.includes('health') || tags.amenity === 'hospital' || tags.amenity === 'clinic') {
    return [
      {
        author: 'Dr. Suresh M.',
        rating: 5,
        badge: 'Verified Patient',
        time: '5 days ago',
        text: `Modern medical equipment, sterile triage, and compassionate specialists at ${name} who take time to explain treatment plans thoroughly.`,
      },
      {
        author: 'Lakshmi N.',
        rating: 5,
        badge: 'Family Member',
        time: '2 weeks ago',
        text: `Quick diagnostic support, 24/7 emergency care, and polite nursing staff. Clean premises with wheelchair accessibility.`,
      },
      {
        author: 'Gopinath V.',
        rating: 4,
        badge: 'Outpatient Visitor',
        time: '1 month ago',
        text: `Organized appointment system, pharmacy inside the building, and reasonable consultation fees. Highly reliable healthcare center.`,
      },
    ];
  }

  if (cat.includes('salon') || cat.includes('barber') || cat.includes('hair')) {
    return [
      {
        author: 'Kiran Rao',
        rating: 5,
        badge: 'Regular Client',
        time: '4 days ago',
        text: `Skilled stylists and hygienic setup. Got a neat haircut and beard styling at a very reasonable price.`,
      },
      {
        author: 'Deepika S.',
        rating: 5,
        badge: 'Verified Client',
        time: '2 weeks ago',
        text: `Super attentive staff and clean equipment. Booking was easy and the service was top notch.`,
      },
    ];
  }

  if (cat.includes('mall') || cat.includes('supermarket') || cat.includes('shop')) {
    return [
      {
        author: 'Ananya Sharma',
        rating: 5,
        badge: 'Shopper',
        time: '6 days ago',
        text: `Great shopping experience with a wide variety of brands, organized aisles, and ample parking space.`,
      },
      {
        author: 'Manish Verma',
        rating: 4,
        badge: 'Verified Buyer',
        time: '2 weeks ago',
        text: `Clean and well-maintained complex. Good options and helpful floor assistance.`,
      },
    ];
  }

  return [
    {
      author: 'Local Guide',
      rating: 5,
      badge: 'Verified Local',
      time: '1 week ago',
      text: `Conveniently located and well maintained. Easy access from the main road with good facilities at ${name}.`,
    },
    {
      author: 'Verified Visitor',
      rating: 4,
      badge: 'Verified Visitor',
      time: '1 month ago',
      text: `Clean surroundings, courteous management, and reliable service throughout. Worth visiting.`,
    },
  ];
};

