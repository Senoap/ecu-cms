// lib/i18n.ts

export type Locale = 'id' | 'en'

export const translations = {
  id: {
    nav: {
      home: 'BERANDA',
      about: 'TENTANG KAMI',
      services: 'LAYANAN',
      portfolio: 'PORTOFOLIO',
      career: 'KARIR',
      gallery: 'GALERI',
      contactUs: 'HUBUNGI KAMI',
      loadingContent: 'MEMUAT KONTEN...',
      backToHome: 'Kembali ke Beranda',
    },
    hero: {
      badge: 'PT. EMPAT SINERGI UTAMA',
      titleLine1: 'KAMI ADALAH',
      titleHighlight: 'SOLUSI ANDA',
      description: 'Penyedia Solusi Terintegrasi Kebutuhan Operasional Bisnis, Manajemen Fasilitas Gedung, dan Pemenuhan Ketenagakerjaan Ahli.',
      exploreServices: 'JELAJAHI LAYANAN KAMI',
      whoWeAre: 'TENTANG KAMI',
    },
    about: {
      subtitle: 'TENTANG KAMI',
      title: 'Mitra Strategis Ketenagakerjaan Anda',
      leadershipBadge: 'Keunggulan Kepemimpinan',
      leadershipTitle: 'Rekam Jejak Teruji',
      leadershipDesc: 'Dengan pengalaman pimpinan selama lebih dari 15 tahun di industri Penyedia Jasa Tenaga Kerja dan Manajemen Fasilitas.',
      quote: 'Integritas, Profesionalisme, Kualitas',
      corporateBadge: 'Profesional & Akuntabel',
      established: 'Est. Korporat',
    },
    services: {
      tag: 'KEMAMPUAN KAMI',
      heading: 'LAYANAN ALIH DAYA KAMI',
      note: '*Seluruh penempatan dikontrol sah melalui Perjanjian Kerja Waktu Tertentu (PKWT).',
      clickForDetail: 'Klik Detail & Galeri',
      viewFullPage: 'Buka Halaman Detail Lengkap',
      corporateDetail: 'Detail Layanan Korporat',
      scopeAndContent: 'Ruang Lingkup & Konten Layanan',
      requestQuote: 'AJUKAN PENAWARAN LAYANAN',
      projectDocs: 'Dokumentasi Proyek',
      noImages: 'Belum ada dokumentasi foto yang diunggah untuk layanan ini',
      interestedTitle: 'Tertarik Menggunakan Layanan Ini?',
      interestedDesc: 'Diskusikan kebutuhan operasional dan penempatan tenaga kerja profesional bersama tim ahli kami.',
      contactNow: 'HUBUNGI KAMI SEKARANG',
      backToServices: 'Kembali ke Beranda & Layanan',
    },
    portfolio: {
      tag: 'REKAM JEJAK TERBUKTI',
      heading: 'PORTOFOLIO PROYEK',
      note: 'Serta dipercaya mendukung pengerjaan proyek harian entitas swasta nasional.',
      viewDetail: 'Lihat Detail Proyek',
      projectOverview: 'Gambaran & Lingkup Proyek',
      results: 'Hasil & Komitmen Layanan',
      backToPortfolio: 'Kembali ke Beranda & Portofolio',
      discussProject: 'KONSULTASIKAN PROYEK ANDA',
      similarProjectDesc: 'Ingin mengimplementasikan standar operasional serupa pada fasilitas gedung atau instansi Anda?',
    },
    career: {
      tag: 'BERGABUNG BERSAMA KAMI',
      heading: 'PELUANG KARIR',
      note: 'Mari berkembang dan raih karir terbaik bersama korporat profesional kami.',
      noJobs: 'Belum ada lowongan pekerjaan aktif saat ini.',
      mainRequirements: 'Persyaratan Utama:',
      applyNow: 'Lamar Sekarang',
      viewDetail: 'Detail Posisi Lengkap',
      jobOverview: 'Deskripsi Posisi & Tanggung Jawab',
      requirementsDoc: 'Kualifikasi & Persyaratan Dokumen',
      benefits: 'Benefit & Fasilitas Kerja',
      applyViaWA: 'Lamar Sekarang via WhatsApp',
      sendEmail: 'Kirim Berkas via Email',
      backToCareer: 'Kembali ke Beranda & Lowongan',
      activeStatus: 'Sedang Dibuka',
      locationLabel: 'Lokasi Penempatan',
      jobTypeLabel: 'Tipe Kontrak',
    },
    gallery: {
      tag: 'MOMEN KAMI',
      heading: 'GALERI DOKUMENTASI',
      photoCount: 'Foto',
      of: 'dari',
      photo: 'Foto',
      viewDetail: 'Lihat Detail',
      viewStory: 'Lihat Cerita Dokumentasi',
      close: 'Tutup',
      documentationStory: 'Cerita Dokumentasi Kegiatan',
      relatedPhotos: 'Foto Terkait Kategori',
      backToGallery: 'Kembali ke Beranda & Galeri',
    },
    footer: {
      contactInfo: 'Informasi Kontak',
      call: 'Panggil',
      whatsapp: 'WhatsApp',
      rightsReserved: 'All Rights Reserved.',
      privacyPolicy: 'Kebijakan Privasi',
      termsOfService: 'Syarat & Ketentuan',
      addressTitle: 'Buka alamat di Google Maps',
      phoneClickTitle: 'Klik untuk opsi Telepon atau WhatsApp',
    },
    common: {
      loading: 'Memuat...',
      back: 'Kembali',
      backToHome: 'Kembali ke Beranda',
      contactUs: 'Hubungi Kami',
      share: 'Bagikan',
      language: 'Bahasa',
      toggleTheme: 'Ubah Tema',
    }
  },
  en: {
    nav: {
      home: 'HOME',
      about: 'WHO WE ARE',
      services: 'SERVICES',
      portfolio: 'PORTFOLIO',
      career: 'CAREER',
      gallery: 'GALLERY',
      contactUs: 'CONTACT US',
      loadingContent: 'LOADING CONTENT...',
      backToHome: 'Back to Home',
    },
    hero: {
      badge: 'PT. EMPAT SINERGI UTAMA',
      titleLine1: 'WE ARE YOUR',
      titleHighlight: 'SOLUTION',
      description: 'Integrated Solution Provider for Business Operational Needs, Building Facility Management, and Expert Manpower Fulfillment.',
      exploreServices: 'EXPLORE OUR SERVICES',
      whoWeAre: 'WHO WE ARE',
    },
    about: {
      subtitle: 'ABOUT US',
      title: 'Your Strategic Workforce Partner',
      leadershipBadge: 'Leadership Excellence',
      leadershipTitle: 'Proven Track Record',
      leadershipDesc: 'With executive leadership experience exceeding 15 years in the Manpower Services and Facility Management Industry.',
      quote: 'Integrity, Professionalism, Quality',
      corporateBadge: 'Professional & Accountable',
      established: 'Est. Corporate',
    },
    services: {
      tag: 'OUR CAPABILITIES',
      heading: 'OUR OUTSOURCING SERVICES',
      note: '*All workforce placements are legally compliant under Fixed-Term Employment Agreements (PKWT).',
      clickForDetail: 'View Details & Gallery',
      viewFullPage: 'View Full Detail Page',
      corporateDetail: 'Corporate Service Details',
      scopeAndContent: 'Scope of Work & Details',
      requestQuote: 'REQUEST A SERVICE QUOTE',
      projectDocs: 'Project Documentation',
      noImages: 'No project photos uploaded yet for this service',
      interestedTitle: 'Interested in This Service?',
      interestedDesc: 'Discuss your operational requirements and professional workforce placement with our expert team.',
      contactNow: 'CONTACT US NOW',
      backToServices: 'Back to Home & Services',
    },
    portfolio: {
      tag: 'PROVEN TRACK RECORD',
      heading: 'PROJECT PORTFOLIO',
      note: 'Trusted to support day-to-day operations of national corporations and institutions.',
      viewDetail: 'View Project Details',
      projectOverview: 'Project Overview & Scope',
      results: 'Results & SLA Commitment',
      backToPortfolio: 'Back to Home & Portfolio',
      discussProject: 'DISCUSS YOUR PROJECT',
      similarProjectDesc: 'Looking to implement similar operational excellence in your facilities or organization?',
    },
    career: {
      tag: 'JOIN OUR TEAM',
      heading: 'CAREER OPPORTUNITIES',
      note: 'Grow and develop your professional journey with our corporate enterprise.',
      noJobs: 'No active job openings available at the moment.',
      mainRequirements: 'Key Requirements:',
      applyNow: 'Apply Now',
      viewDetail: 'View Full Position Details',
      jobOverview: 'Position Overview & Responsibilities',
      requirementsDoc: 'Qualifications & Required Documents',
      benefits: 'Benefits & Facilities',
      applyViaWA: 'Apply Now via WhatsApp',
      sendEmail: 'Send Application via Email',
      backToCareer: 'Back to Home & Careers',
      activeStatus: 'Actively Hiring',
      locationLabel: 'Work Location',
      jobTypeLabel: 'Employment Type',
    },
    gallery: {
      tag: 'OUR MOMENTS',
      heading: 'DOCUMENTATION GALLERY',
      photoCount: 'Photo',
      of: 'of',
      photo: 'Photo',
      viewDetail: 'View Detail',
      viewStory: 'View Documentation Story',
      close: 'Close',
      documentationStory: 'Activity Documentation Story',
      relatedPhotos: 'Related Photos in Category',
      backToGallery: 'Back to Home & Gallery',
    },
    footer: {
      contactInfo: 'Contact Information',
      call: 'Call',
      whatsapp: 'WhatsApp',
      rightsReserved: 'All Rights Reserved.',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      addressTitle: 'Open address on Google Maps',
      phoneClickTitle: 'Click for Phone or WhatsApp options',
    },
    common: {
      loading: 'Loading...',
      back: 'Back',
      backToHome: 'Back to Home',
      contactUs: 'Contact Us',
      share: 'Share',
      language: 'Language',
      toggleTheme: 'Toggle Theme',
    }
  }
}

// Fallback content translations for default items when user selects English
export const enContentFallback: Record<string, any> = {
  services: {
    '1': {
      title: 'SECURITY SERVICES',
      desc: 'Trusted physical and corporate asset protection by certified personnel.',
      content: 'Comprehensive security guarding services featuring certified security officers (Satpam KTA), electronic perimeter surveillance, emergency response coordination, and rigorous access control tailored for corporate high-rises and government facilities.'
    },
    '2': {
      title: 'CLEANING SERVICES',
      desc: 'Optimal building and facility cleanliness with modern standard sanitation.',
      content: 'Professional commercial cleaning services equipped with eco-grade chemicals, high-standard hygiene protocols, daily floor and glass care, waste management, and periodic deep disinfection.'
    },
    '3': {
      title: 'SUPPORT PERSONNEL',
      desc: 'Reliable operational human resources for business and office administration.',
      content: 'Specialized support personnel including receptionists, administrative assistants, messengers, drivers, and technical ground staff trained to boost client business productivity.'
    },
    '4': {
      title: 'GARDENING & LANDSCAPING',
      desc: 'Professional landscape maintenance and corporate green area development.',
      content: 'End-to-end landscape care services covering routine plant pruning, lawn mowing, organic soil fertilization, pest control, and architectural outdoor green space maintenance.'
    }
  },
  portfolios: {
    '1': {
      name: 'MINISTRY OF YOUTH & SPORTS RI',
      desc: 'Provision of integrated security personnel and facility operational support for ministry headquarters.'
    },
    '2': {
      name: 'SOUTH TANGERANG CITY GOVERNMENT',
      desc: 'Public service facility operational support, building maintenance, and municipal area care.'
    }
  },
  career: {
    '1': {
      title: 'Security Officer (Satpam)',
      location: 'South Jakarta',
      desc: 'Responsible for maintaining physical security, access control, and emergency vigilance across corporate office buildings.',
      requirements: 'Valid Indonesian Security Registration Card (KTA), active certification, min. 1 year proven experience, professional conduct.'
    }
  },
  galleries: {
    '1': {
      title: 'Corporate Building Security Guarding',
      desc: 'Standard operating procedures for building physical protection delivered by certified personnel.',
      category: 'Security'
    },
    '2': {
      title: 'Building Facility Sanitation & Cleanliness',
      desc: 'Daily commercial hygiene maintenance for executive lobbies and public areas.',
      category: 'Cleaning'
    }
  }
}
