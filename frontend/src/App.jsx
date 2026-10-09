
import { useEffect, useRef, useState } from 'react';
import sriLankaMap from './assets/sri-lanka-districts.svg?raw';
import fuelStations from './data/fuelStations.json';
import lubricantProducts from './data/lubricants.json';
import { useLanguage } from './i18n/LanguageContext.jsx';
import GoogleTranslate from './components/GoogleTranslate.jsx';
import PopupNotice from './components/PopupNotice.jsx';
import api from './api';
import aboutHeroImage from './images/about.png';
import managementHeroImage from './images/management.png';
import subsidiariesHeroImage from './images/subsidiaries.JPG';
import ministryHeroImage from './images/ministry.jpeg';
import allServicesHeroImage from './images/allservices.JPG';
import displayImageUrl from './utils/displayImageUrl.js';
import applyCmsOverrides, { scheduleCmsOverrides } from './utils/applyCmsOverrides.js';
import MarineBunkeringPage from './components/marine-bunkering/MarineBunkeringPage.jsx';
import ElectricMobilityContent from './components/electric-mobility/ElectricMobilityContent.jsx';
import HistoricalPricesPage from './components/HistoricalPricesPage.jsx';
import ManagedPage, { ManagedSections } from './components/ManagedPage.jsx';
import GalleryPage from './components/GalleryPage.jsx';

const paymentBanks = [
  { name: 'Bank of Ceylon', branch: 'City Office', logo: 'boc.svg' },
  { name: 'Commercial Bank PLC', branch: 'Foreign', logo: 'commercial.svg' },
  { name: 'DFCC Vardhana Bank Ltd', branch: 'City Office', logo: 'dfcc.png' },
  { name: 'Hatton National Bank PLC', branch: 'City Office', logo: 'hnb.png' },
  { name: 'National Development Bank PLC', branch: 'Head Office', logo: 'ndb.svg' },
  { name: 'Nations Trust Bank PLC', branch: 'Cinnamon Gardens', logo: 'nations-trust.svg' },
  { name: 'Peoples Bank', branch: 'Union Place', logo: 'peoples.png' },
  { name: 'Sampath Bank PLC', branch: 'City Office', logo: 'sampath.jpg' },
  { name: 'Seylan Bank PLC', branch: 'Millennium', logo: 'seylan.png' },
];

const aviationCardNetworks = [
  { name: 'Visa', logo: 'visa.svg' },
  { name: 'UnionPay', logo: 'unionpay.svg' },
  { name: 'JCB', logo: 'jcb.svg' },
  { name: 'Mastercard', logo: 'mastercard.svg' },
];

const Icon = ({ name, size = 24 }) => {
  const paths = {
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    phone: (
      <path d="M7 3H4.5A1.5 1.5 0 0 0 3 4.5C3 13.6 10.4 21 19.5 21a1.5 1.5 0 0 0 1.5-1.5V17l-4-1-1.2 3c-4.7-1.2-8.4-4.9-9.6-9.6l3-1.2L7 3Z" />
    ),
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    station: (
      <>
        <path d="M5 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16M3 21h15M8 7h5v4H8z" />
        <path d="M16 8h2l2 2v7a1.5 1.5 0 0 1-3 0v-3" />
      </>
    ),
    building: (
      <>
        <path d="M4 21V7l8-4 8 4v14M8 10h2m4 0h2m-8 4h2m4 0h2M9 21v-3h6v3" />
      </>
    ),
    app: (
      <>
        <rect x="6" y="2" width="12" height="20" rx="2" />
        <path d="M10 6h4m-3 12h2" />
      </>
    ),
    droplet: <path d="M12 2s7 8 7 13a7 7 0 0 1-14 0c0-5 7-13 7-13Z" />,
    shield: (
      <>
        <path d="M12 3 5 6v5c0 5 3 8.5 7 10 4-1.5 7-5 7-10V6l-7-3Z" />
        <path d="m9 12 2 2 4-5" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5" />
        <path d="M5 20h14" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21a7 7 0 0 1 14 0" />
      </>
    ),
    "bar-chart": (
      <>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
};

const mergeDivision = (base, remote) => {
  const next = { ...base };
  Object.entries(remote || {}).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (Array.isArray(value) && value.length === 0) return;
    if (typeof value === 'string' && value.trim() === '') return;
    next[key] = value;
  });
  return next;
};

const useDivision = (slug, defaults) => {
  const defaultsRef = useRef(defaults);
  const [div, setDiv] = useState(() => defaultsRef.current);

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/admin/divisions/slug/${slug}`)
      .then((res) => {
        if (!cancelled) {
          const remote = res.data && res.data.data ? res.data.data : {};
          setDiv(mergeDivision(defaultsRef.current, remote));
        }
      })
      .catch(() => {
        if (!cancelled) setDiv(defaultsRef.current);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return div;
};

const fallbackServices = [
  {
    icon: 'globe',
    title: 'Regional Offices',
    description: 'Find regional contacts and support',
    link: '/regional-offices',
  },
  {
    icon: 'building',
    title: 'Market & Sales',
    description: 'Explore fuel products, pricing and the dealer network',
    link: '/marketing-sales',
  },
  {
    icon: 'app',
    title: 'Mobile App',
    description: 'Access Ceypetco services on mobile',
    link: '/mobile-app',
  },
  {
    icon: 'droplet',
    title: 'Product Specifications',
    description: 'Review petroleum product standards',
    link: 'https://ceypetco.gov.lk/wp-content/uploads/2026/04/Marketing-Sepecifictions.pdf',
  },
  {
    icon: 'shield',
    title: 'Registration of Suppliers',
    description: 'Supplier registration and procurement',
    link: '/tenders#supplier-registration',
  },
  {
    icon: 'app',
    title: 'Consumer Registration',
    description: 'Register for applicable consumer services',
    link: '/consumer-registration',
  },
  {
    icon: 'clock',
    title: 'Notices',
    description: 'Read current public and operational notices',
    link: '/notices',
  },
  {
    icon: 'building',
    title: 'Projects',
    description: 'Explore current development initiatives',
    link: '/projects',
  },
  {
    icon: 'download',
    title: 'Annual Reports',
    description: 'Access corporate performance publications',
    link: '/annual-reports',
  },
  {
    icon: 'globe',
    title: 'Right to Information',
    description: 'Public information and RTI guidance',
    link: '/right-to-information',
  },
];
const divisions = [
  [
    'Refinery',
    'At the heart of CPC operations, strengthening the nation’s petroleum supply',
    '/images/refinery.png',
    '/refinery',
  ],
  [
    'Aviation',
    'Specialised aviation fuel handling supporting Sri Lanka’s air transport sector',
    '/images/aviation-mattala-refuelling.png',
    '/aviation',
  ],
  [
    'Lubricants',
    'High-performance automotive and industrial oils engineered for lasting protection',
    '/images/lubricants-hero.jpg',
    '/lubricants',
  ],
  [
    'Agro Chemicals',
    'Quality crop-protection solutions supporting stronger and more sustainable harvests',
    '/images/agro-products.jpg',
    '/agro-chemicals',
  ],
  ['Bunkering', 'Marine fuel supply supporting vessels and port operations', '/images/operations/bunkering.jpg', '/bunkering'],
  ['EV Charging', 'Explore electric mobility and charging information', '/images/operations/ev-charging.jpg', '/ev-charging'],
  ['Special Chemicals', 'Specialist petroleum products for industrial applications', '/images/operations/special-chemicals.jpg', '/special-chemicals'],
  ['Bitumen', 'Petroleum bitumen for road and industrial applications', '/images/operations/bitumen.jpg', '/bitumen'],
];
const brandLogos = [
  { name: 'Ceypetco Lanka Bunkering', image: '/images/brand-logos/bunkering.webp', href: '/bunkering' },
  { name: 'Ceypetco Lanka Agro Solutions', image: '/images/brand-logos/agro-solutions.webp', href: '/agro-chemicals' },
  { name: 'Ceypetco Lanka Lubricants', image: '/images/brand-logos/lubricants.webp', href: '/lubricants' },
  { name: 'Sustainable Fuel', image: '/images/brand-logos/sustainable-fuel.webp', href: '/services' },
  { name: 'Ceypetco Lanka Bitumen', image: '/images/brand-logos/bitumen.webp', href: '/bitumen' },
  { name: 'Ceypetco Lanka Aviation', image: '/images/brand-logos/aviation.webp', href: '/aviation' },
  { name: 'Refining', image: '/images/brand-logos/refining.webp', href: '/refinery' },
  { name: 'Ceypetco Lanka EV Solutions', image: '/images/brand-logos/ev-solutions.webp', href: '/ev-charging' },
];
const pageBrandLogos = {
  '/bunkering': '/images/brand-logos/bunkering.webp',
  '/agro-chemicals': '/images/brand-logos/agro-solutions.webp',
  '/lubricants': '/images/brand-logos/lubricants.webp',
  '/bitumen': '/images/brand-logos/bitumen.webp',
  '/aviation': '/images/brand-logos/aviation.webp',
  '/refinery': '/images/brand-logos/refining.webp',
  '/ev-charging': '/images/brand-logos/ev-solutions.webp',
};
const heroSlides = [
  {
    image: 'https://images.squarespace-cdn.com/content/v1/693bf5941493ec4ce40a537d/f2785c86-6ee9-429c-a714-cd0e945aea44/Billboard+Image.jpg',
    alt: 'Offshore oil rig and support vessels at sunset',
    eyebrow: 'ISLANDWIDE DISTRIBUTION.',
    title: (
      <>
        <span style={{ whiteSpace: 'nowrap' }}>Unlocking Sri Lanka’s</span>
        <br />
        <span style={{ whiteSpace: 'nowrap' }}>Offshore Oil &amp; Natural Gas</span>
        <br />
        Potential
      </>
    ),
    copy: 'The Petroleum Development Authority of Sri Lanka (PDASL) invites qualified energy companies to participate in the Sri Lanka Licensing Round 2026 – offering access to one of South Asia’s most prospective basins.',
    cta: 'Learn more about PDASL',
    href: 'https://www.srilankalicensinground.com/',
  },
  {
    image: '/images/distribution.jpg',
    alt: 'Ceypetco fuel distribution truck travelling through Sri Lanka',
    eyebrow: 'ISLANDWIDE DISTRIBUTION',
    title: (
      <>
        Fuel where the
        <br />
        nation needs it
      </>
    ),
    copy: 'An extensive distribution network delivering essential petroleum products safely and reliably across every district',
    cta: 'Explore our network',
    href: '#fuel-network',
  },
  {
    image: '/images/refinery.png',
    alt: 'Ceypetco refinery under a clear blue sky',
    eyebrow: 'REFINING WITH PURPOSE',
    title: (
      <>
        Strengthening national
        <br />
        energy security
      </>
    ),
    copy: 'Experienced people, proven infrastructure and disciplined operations supporting a resilient energy future for Sri Lanka',
    cta: 'Explore the refinery',
    href: '/refinery',
  },
  {
    image: '/images/agro-products.jpg',
    alt: 'Ceypetco agrochemical products supporting Sri Lankan agriculture',
    eyebrow: 'SUPPORTING SRI LANKAN AGRICULTURE',
    title: (
      <>
        Stronger crops
        <br />
        Confident farmers
      </>
    ),
    copy: 'Quality crop-protection solutions, responsible production and islandwide support helping farming communities prosper',
    cta: 'Explore Agro Chemicals',
    href: '/agro-chemicals',
  },
  {
    image: '/images/fuel-train.jpg',
    alt: 'Fuel transport train travelling through Sri Lanka',
    eyebrow: 'ENERGY IN MOTION',
    title: (
      <>
        Moving energy
        <br />
        Connecting the nation
      </>
    ),
    copy: 'Dependable transport and distribution infrastructure helps essential petroleum products reach communities and industries across Sri Lanka',
    cta: 'Explore Marketing & Sales',
    href: '/marketing-sales',
  },
];
const fuelDistricts = [
  ['Colombo', 119, 'Western'],
  ['Gampaha', 140, 'Western'],
  ['Kalutara', 52, 'Western'],
  ['Kandy', 58, 'Central'],
  ['Matale', 18, 'Central'],
  ['Nuwara Eliya', 16, 'Central'],
  ['Galle', 61, 'Southern'],
  ['Matara', 41, 'Southern'],
  ['Hambantota', 37, 'Southern'],
  ['Jaffna', 60, 'Northern'],
  ['Mannar', 13, 'Northern'],
  ['Mullaitivu', 10, 'Northern'],
  ['Vavuniya', 14, 'Northern'],
  ['Batticaloa', 40, 'Eastern'],
  ['Ampara', 51, 'Eastern'],
  ['Trincomalee', 23, 'Eastern'],
  ['Kurunegala', 106, 'North Western'],
  ['Puttalam', 70, 'North Western'],
  ['Anuradhapura', 48, 'North Central'],
  ['Polonnaruwa', 17, 'North Central'],
  ['Badulla', 33, 'Uva'],
  ['Monaragala', 23, 'Uva'],
  ['Ratnapura', 42, 'Sabaragamuwa'],
  ['Kegalle', 33, 'Sabaragamuwa'],
  ['Kilinochchi', 9, 'Northern'],
];
const districtSlug = (name) => name.toLowerCase().replaceAll(' ', '-');
const districtFromPath = (path) => {
  const slug = path.match(/^\/fuel-stations\/([^/]+)$/)?.[1];
  return (
    fuelDistricts.find(([name]) => districtSlug(name) === slug)?.[0] || null
  );
};
const jumpToPageTop = () => {
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.scrollTo(0, 0);
  root.style.scrollBehavior = previousBehavior;
};

function FuelDistributionMap() {
  const [selected, setSelected] = useState(null);
  const current = fuelDistricts.find(([name]) => name === selected) || null;
  const totalStations = fuelDistricts.reduce((sum, item) => sum + item[1], 0);

  const selectFromMap = (event) => {
    const path = event.target.closest('path[title]');
    if (!path) return;
    const name = path.getAttribute('title');
    if (fuelDistricts.some(([district]) => district === name)) {
      jumpToPageTop();
      setSelected(name);
      window.history.pushState({}, '', `/fuel-stations/${districtSlug(name)}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  useEffect(() => {
    const paths = document.querySelectorAll('.fuel-map-svg path[title]');
    paths.forEach((path) =>
      path.classList.toggle(
        'selected',
        path.getAttribute('title') === selected,
      ),
    );
  }, [selected]);

  return (
    <section className="fuel-map-section section notranslate" translate="no">
      <div className="container">
        <div className="fuel-map-heading">
          <div>
            <p className="eyebrow">ISLANDWIDE NETWORK</p>
            <h2>
              Auto fuel distribution
              <br />
              across Sri Lanka
            </h2>
          </div>
          <div className="network-total">
            <b>{totalStations.toLocaleString()}</b>
            <span>
              fuel stations across
              <br />
              25 districts
            </span>
          </div>
        </div>
        <div className="fuel-map-panel">
          <div className="map-column">
            <div
              className="fuel-map-svg"
              onClick={selectFromMap}
              dangerouslySetInnerHTML={{ __html: sriLankaMap }}
            />
            <div className="map-hint">
              <span></span> Select a district on the map
            </div>
          </div>
          <div className="district-column">
            <div className="selected-district">
              {current ? (
                <>
                  <div>
                    <small>SELECTED DISTRICT</small>
                    <h3>{current[0]}</h3>
                    <p>{current[2]} Province</p>
                  </div>
                  <div>
                    <b>{current[1]}</b>
                    <span>Fuel stations</span>
                  </div>
                </>
              ) : (
                <div className="district-empty-state">
                  <small>DISTRICT NETWORK</small>
                  <h3>Select a district</h3>
                  <p>Use the map or district directory below</p>
                </div>
              )}
            </div>
            <div className="district-list">
              {fuelDistricts.map(([name, total], index) => (
                <a
                  className={selected === name ? 'active' : ''}
                  onMouseEnter={() => setSelected(name)}
                  href={`/fuel-stations/${districtSlug(name)}`}
                  key={name}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <b>{name}</b>
                  <small>{total}</small>
                </a>
              ))}
            </div>
            {current ? (
              <a
                className="district-contact"
                href={`/fuel-stations/${districtSlug(current[0])}`}
              >
                View {current[0]} fuel stations <Icon name="arrow" size={17} />
              </a>
            ) : (
              <div className="district-contact district-contact-empty">
                Choose a district to view its fuel stations
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FuelStationPage({ district }) {
  const [query, setQuery] = useState('');
  const meta = fuelDistricts.find(([name]) => name === district);
  const stations = fuelStations[district] || [];
  const filtered = stations.filter(({ dealerNo, address, dealerName }) =>
    `${dealerNo} ${address} ${dealerName}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <main className="inner-page fuel-directory-page">
      <section className="fuel-directory-hero">
        <div className="container">
          <div>
            <a className="back-to-map" href="/#fuel-network">
              <Icon name="arrow" size={16} /> Back to district map
            </a>
            <p className="eyebrow light">
              FUEL STATION NETWORK · {meta[2].toUpperCase()} PROVINCE
            </p>
            <h1>{district}</h1>
            <p>
              Explore Ceypetco dealers and filling stations operating across the{' '}
              {district} District
            </p>
            <div className="breadcrumbs">
              <a href="/">Home</a>
              <span>/</span>
              <a href="/#fuel-network">Fuel station network</a>
              <span>/</span>
              <b>{district}</b>
            </div>
          </div>
          <div className="district-count">
            <b>{stations.length}</b>
            <span>
              listed
              <br />
              stations
            </span>
          </div>
        </div>
      </section>
      <section className="fuel-directory-content content-section">
        <div className="container">
          <div className="directory-toolbar">
            <div>
              <p className="eyebrow">AUTHORIZED DEALER DIRECTORY</p>
              <h2>Find a station in {district}</h2>
            </div>
            <label>
              <span>Search dealer, town or number</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${district} stations...`}
              />
            </label>
          </div>
          <div className="station-results">
            <div className="station-table-head">
              <span>Dealer no</span>
              <span>Address</span>
              <span>Dealer name</span>
            </div>
            {filtered.map((station) => (
              <article key={`${station.dealerNo}-${station.address}`}>
                <span className="dealer-number">{station.dealerNo}</span>
                <strong>{station.address}</strong>
                <p>{station.dealerName}</p>
              </article>
            ))}
            {filtered.length === 0 && (
              <div className="no-stations">
                <h3>No matching stations</h3>
                <p>Try another dealer number, town or dealer name</p>
              </div>
            )}
          </div>
          <div className="directory-footer">
            <span>
              Showing {filtered.length} of {stations.length} stations
            </span>
            <a href="/#fuel-network">
              Explore another district <Icon name="arrow" size={16} />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

const pageData = {
  '/about': {
    label: 'ABOUT CEYPETCO',
    title: 'Built to power national progress',
    intro:
      'For more than six decades, Ceylon Petroleum Corporation has served at the centre of Sri Lanka’s energy landscape',
    image: aboutHeroImage,
  },
  '/management': {
    label: 'OUR LEADERSHIP',
    title: 'Leadership with purpose',
    intro:
      'Meet the leadership team guiding Ceylon Petroleum Corporation and find key management contacts across the organisation',
    image: managementHeroImage,
  },
  '/services': {
    label: 'PUBLIC SERVICES',
    title: 'Energy services made accessible',
    intro:
      'Find official registrations, applications, specifications and information from one clear destination',
    image: allServicesHeroImage,
  },
  '/bunkering': {
    label: 'OUR OPERATIONS · MARINE FUELS',
    title: 'Bunkering',
    intro: 'Marine fuel information for vessel operators and partners',
    image: '/images/operations/bunkering.jpg',
  },
  '/ev-charging': {
    label: 'OUR OPERATIONS · ELECTRIC MOBILITY',
    title: 'CEYPETCO EV Charging',
    intro:
      "Powering Sri Lanka's Transition to Electric Mobility. Explore reported charging locations and learn how EV charging works.",
    breadcrumb: 'EV Charging',
    image: '/images/electric-mobility/ev-charging-hero-1600.webp',
  },
  '/special-chemicals': {
    label: 'OUR OPERATIONS · INDUSTRIAL PRODUCTS',
    title: 'Special Chemicals',
    intro: 'Specialist petroleum products for industrial applications',
    image: '/images/operations/special-chemicals.jpg',
  },
  '/bitumen': {
    label: 'OUR OPERATIONS · BITUMEN',
    title: 'Bitumen',
    intro: 'Petroleum bitumen for roads and industrial requirements',
    image: '/images/operations/bitumen.jpg',
  },
  '/online-banking': {
    label: 'PUBLIC SERVICES · BANKING INFORMATION',
    title: 'Online banking information',
    intro: 'Find the banks and branches listed for CEYPETCO transactions. This website does not process payments.',
    image: '/images/head-office.webp',
  },
  '/regional-offices': {
    label: 'PUBLIC SERVICES · REGIONAL OFFICES',
    title: 'Support across every region',
    intro:
      'Connect directly with Ceypetco regional management teams serving customers, dealers and communities across Sri Lanka',
    image: '/images/head-office.webp',
  },
  '/consumer-registration': {
    label: 'PUBLIC SERVICES · BULK CONSUMERS',
    title: 'Register your consumer point',
    intro:
      'A clear registration pathway for industrial customers requiring more than 3,300 litres of fuel per month',
    image: '/images/distribution.jpg',
  },
  '/notices': {
    label: 'MEDIA CENTRE · NOTICES',
    title: 'Official notices and circulars',
    intro:
      'Read current notices and official documents published by Ceypetco',
    image: '/images/notices-hero-v2.webp',
  },
  '/projects': {
    label: 'STRATEGIC PROJECTS · SOREM',
    title: 'Modernising Sri Lanka’s refining future',
    intro:
      'The Sapugaskanda Oil Refinery Expansion and Modernization Project is designed to strengthen capacity, product quality and national energy resilience',
    image: '/images/refinery.png',
  },
  '/annual-reports': {
    label: 'CORPORATE PUBLICATIONS · ANNUAL REPORTS',
    title: 'Performance documented with clarity',
    intro:
      'Access Ceylon Petroleum Corporation annual reports and review our operational and financial record across the years',
    image: '/images/about-banner.webp',
  },
  '/publications': {
    label: 'CORPORATE PUBLICATIONS · ANNUAL REPORTS',
    title: 'Performance documented with clarity',
    intro:
      'Access Ceylon Petroleum Corporation annual reports and review our operational and financial record across the years',
    image: '/images/publications-hero-v2.webp',
  },
  '/right-to-information': {
    label: 'PUBLIC INFORMATION · RTI',
    title: 'Information access made clear',
    intro:
      'Contact the officers nominated by Ceylon Petroleum Corporation to support Right to Information enquiries and official information requests',
    image: '/images/head-office.webp',
  },
  '/media': {
    label: 'MEDIA CENTRE',
    title: 'Information from Ceypetco',
    intro:
      'Explore our latest news, official notices and corporate publications',
    image: '/images/media-1.jpg',
  },
  '/news': {
    label: 'MEDIA CENTRE · NEWS',
    title: 'Latest news and stories',
    intro: 'Follow Ceypetco announcements, activities and stories from across the corporation',
    image: '/images/news-hero-v2.webp',
  },
  '/tenders': {
    label: 'PROCUREMENT',
    title: 'Open and transparent opportunities',
    intro:
      'Explore current tenders, supplier registrations and procurement documents',
    image: '/images/tenders-hero.webp',
  },
  '/careers': {
    label: 'CAREERS',
    title: 'Power your career',
    intro:
      'Join Sri Lanka’s energy journey and help build the systems that keep a nation moving',
    image: '/images/career-team.jpg',
  },
  '/corporate-life': {
    label: 'CAREERS · CORPORATE LIFE',
    title: 'A career with purpose',
    intro: 'Discover the people, disciplines and shared responsibilities behind Sri Lanka’s energy supply',
    image: '/images/head-office.webp',
  },
  '/current-opportunities': {
    label: 'CAREERS · CURRENT OPPORTUNITIES',
    title: 'Find your next opportunity',
    intro: 'Explore open roles across Ceylon Petroleum Corporation and review each vacancy before applying',
    image: '/images/career-team.jpg',
  },
  '/contact': {
    label: 'CONTACT US',
    title: 'We’re here to help',
    intro:
      'Connect with our head office, customer care and specialist operating divisions',
    image: '/images/head-office.webp',
  },
  '/refinery': {
    label: 'OUR SERVICES · REFINERY',
    title: 'Precision refining for national growth',
    intro:
      'Transforming crude oil into quality fuels through experienced people, proven processes and rigorous standards',
    image: 'https://ceypetco.gov.lk/wp-content/uploads/2025/03/ref9.jpg',
  },
  '/marketing-sales': {
    label: 'OUR SERVICES · MARKETING',
    title: 'Fueling every part of Sri Lanka',
    intro:
      'An islandwide dealer and distribution network serving transport, industry and communities',
    image: '/images/distribution.jpg',
  },
  '/marketing-sales/historical-prices': {
    label: 'MARKETING & SALES · PRICE HISTORY',
    title: 'Historical fuel prices',
    intro: 'Explore Ceypetco fuel and bitumen price records across decades',
    image: '/images/distribution.jpg',
  },
  '/aviation': {
    label: 'OUR SERVICES · AVIATION',
    title: 'Reliable energy for every takeoff',
    intro:
      'Round-the-clock aviation fueling built around quality, safety and on-time service',
    image: '/images/aviation-mattala-refuelling.png',
  },
  '/agro-chemicals': {
    label: 'OUR SERVICES · AGRO',
    title: 'Supporting stronger harvests',
    intro:
      'Quality crop-protection solutions and expert support for Sri Lanka’s farming communities',
    image: '/images/agro-products.jpg',
  },
  '/lubricants': {
    label: 'OUR SERVICES · LUBRICANTS',
    title: 'Performance engineered to last',
    intro:
      'Certified automotive and industrial lubricants meeting recognised international specifications',
    image: '/images/lubricants-hero.jpg',
  },
  '/history': {
    label: 'OUR HISTORY',
    title: 'Milestones that shaped our journey',
    intro:
      'Explore the defining moments behind more than six decades of service to Sri Lanka',
    image: '/images/history-1.jpg',
  },
  '/subsidiaries': {
    label: 'DISCOVER CEYPETCO · SUBSIDIARIES',
    title: 'Our subsidiaries',
    intro: 'The companies supporting petroleum storage, distribution and terminal development in Sri Lanka',
    image: subsidiariesHeroImage,
  },
  '/energy-ministries': {
    label: 'DISCOVER CEYPETCO · PUBLIC INSTITUTIONS',
    title: 'Related ministries & agencies',
    intro: 'Explore the public institutions connected to Sri Lanka’s energy, transport and infrastructure sectors',
    image: ministryHeroImage,
  },
  '/mobile-app': {
    label: 'PUBLIC SERVICES · MOBILE APPS',
    title: 'Official mobile apps',
    intro:
      'Download the official Ceypetco application and access public services, fuel-station information and product updates from your mobile device',
    image: '/images/distribution.jpg',
  },
};

const historyMilestones = [
  [
    '1962',
    'The Corporation commenced business in competition with the other oil companies operating in Sri Lanka at the time',
  ],
  [
    '1964',
    'CPC took over the import, sale and distribution of petroleum products nationally. Kolonnawa, regional bulk depots and retail outlets were integrated and improved as one network, with added storage, fire-safety systems, internal roads and modernised gantry filling',
  ],
  [
    '1968',
    'The Corporation continued expanding its national operating footprint and petroleum-services capabilities',
  ],
  [
    '1969',
    'The refinery commenced production. Refining capacity was later increased to 50,000 BPD. A lubricating-oil blending plant was installed at Kolonnawa and CPC entered the agrochemical market',
  ],
  [
    '1971',
    'Bunkering operations at Sri Lankan ports and aviation refuelling activities were integrated into the Corporation',
  ],
  [
    '1978',
    'CPC built a Nylon 6 yarn factory for the textile, tyre and finishing industries at a cost of Rs. 603 million',
  ],
  [
    '1987',
    'A Single Point Buoy Mooring facility was commissioned 9.2 kilometres offshore from Colombo Port, together with an intermediate crude-oil tank farm at Orugodawatte',
  ],
  [
    '1992',
    'The refinery crude-distiller unit was revamped to modernise operations and improve efficiency at a cost of Rs. 250 million',
  ],
];

const defaultHistoryPage = {
  heroLabel: pageData['/history'].label,
  heroTitle: pageData['/history'].title,
  heroIntro: pageData['/history'].intro,
  heroImage: pageData['/history'].image,
  journeyLabel: 'OUR JOURNEY',
  journeyTitle: 'Six decades of national service',
  journeyIntro: 'From market entry and national distribution to refinery modernisation, each milestone strengthened Sri Lanka’s energy infrastructure',
  galleryLabel: 'HISTORICAL MOMENTS',
  galleryTitle: 'A visual journey through our legacy',
  milestones: historyMilestones.map(([year, text]) => ({ year, text })),
  gallery: [1, 2, 3, 4, 6, 7, 8, 9].map((number, index) => ({
    image: `/images/history-${number}.jpg`,
    alt: `Ceypetco historical archive ${index + 1}`,
    caption: `Archive ${String(index + 1).padStart(2, '0')}`,
    wide: index === 0 || index === 5,
  })),
};

const managementGroups = [
  {
    title: 'Corporate Management',
    people: [
      [
        'K G H Kodagoda',
        'Refinery Manager',
        '+94 11 2400666 / +94 11 5668490',
        'refinery.manager@ceypetco.gov.lk',
      ],
      [
        'K W Samantha Pushpalal',
        'Deputy General Manager · HR & Admin',
        '+94 11 2106758',
        'dgm.hr@ceypetco.gov.lk',
      ],
      [
        'W K S Gunawardhana',
        'Acting Deputy General Manager · Marketing',
        '+94 11 2106753',
        'dgm.mkt@ceypetco.gov.lk',
      ],
      [
        'K K A Jayawikrama',
        'Deputy General Manager · Commercial & Supply Chain',
        '+94 11 2106761',
        'dgm.commercial@ceypetco.gov.lk',
      ],
      [
        'N B M P Jeewasiri',
        'Deputy General Manager · Technical Services & Corporate Affairs',
        '+94 11 7296290',
        'dgm.ts@ceypetco.gov.lk',
      ],
      [
        'B T T Perera',
        'Deputy General Manager · Finance',
        '+94 11 7296146',
        'dgm.fin@ceypetco.gov.lk',
      ],
    ],
  },
  {
    title: 'Senior Management · Refinery',
    people: [
      [
        'Deputy Refinery Manager',
        'Manufacturing & Operations',
        '+94 11 2400666 / +94 11 5668490',
        'refinery.manager@ceypetco.gov.lk',
      ],
      [
        'Deputy Refinery Manager',
        'Maintenance & Projects',
        '+94 11 2400684 / +94 11 5668911',
        'drm.mp@ceypetco.gov.lk',
      ],
      [
        'A K Seneviratne',
        'Acting Deputy Refinery Manager · Technical Services',
        '',
        'drm.ts@ceypetco.gov.lk',
      ],
      [
        'K V J Chandrawanka',
        'Acting Deputy Refinery Manager · Electrical & Instrument',
        '+94 11 2401527',
        'mgr.electrical@ceypetco.gov.lk',
      ],
    ],
  },
  {
    title: 'Head Office',
    people: [
      [
        'R A K C Ariyaratne',
        'Chief Legal Officer',
        '+94 11 2106773',
        'clo@ceypetco.gov.lk',
      ],
      [
        'M C D Perera',
        'Senior Manager · Finance',
        '+94 11 2400435',
        'smgr.fin@ceypetco.gov.lk',
      ],
      [
        'Y A D S Priyankara',
        'Chief Internal Auditor',
        '+94 11 7296223',
        'cia@ceypetco.gov.lk',
      ],
      [
        'G P Upananda',
        'Manager · Human Resource',
        '+94 11 7296278',
        'mgr.hr@ceypetco.gov.lk',
      ],
      [
        'G P K Wijekoon',
        'Manager · Engineering & Premises',
        '+94 11 7296132',
        'mgr.eng@ceypetco.gov.lk',
      ],
      [
        'W K S Gunawardhana',
        'Manager · Research & Development',
        '+94 11 7296287',
        'dgm.mkt@ceypetco.gov.lk',
      ],
      [
        'W M T Wijesinghe',
        'Acting Manager · Commercial',
        '+94 11 7296125',
        'dgm.commercial@ceypetco.gov.lk',
      ],
      [
        'A G D Bandara',
        'Manager · Shipping',
        '+94 11 7296300',
        'mgr.shipping@ceypetco.gov.lk',
      ],
      [
        'Operations Management',
        'Stocks & Terminal Operations',
        '+94 11 7296290',
        'dgm.ts@ceypetco.gov.lk',
      ],
      [
        'K Hewagamage',
        'Manager · Procurements & Stores',
        '+94 11 7296331',
        'mgr.procurement@ceypetco.gov.lk',
      ],
      [
        'W A A C Weerasinghe',
        'Manager · Human Resource Development',
        '',
        'mgr.hrd@ceypetco.gov.lk',
      ],
      [
        'V Shanmuganathan',
        'Acting Manager · Marketing',
        '+94 11 7296248',
        'mgr.mkt@ceypetco.gov.lk',
      ],
      [
        'R M Ariyamanjula',
        'Acting Manager · Corporate Planning & Business Development',
        '+94 11 7296292',
        'mgr.cpbd@ceypetco.gov.lk',
      ],
      [
        'I C Galagodage',
        'Acting Manager · Lubricant & Special Products',
        '+94 11 7296346',
        'dmgr.lub@ceypetco.gov.lk',
      ],
      [
        'D L Perera',
        'Acting Manager · Information Technology',
        '+94 11 7296218',
        'lakshitha@ceypetco.gov.lk',
      ],
      [
        'U H A S Jayaweera',
        'Acting Deputy Manager · Investigation',
        '+94 11 7296230',
        '',
      ],
      [
        'B M W A R Bandara',
        'Acting Assistant Manager · Security',
        '+94 11 7296320',
        '',
      ],
      [
        'Anurudda B. Koralagedara',
        'Acting Assistant Manager · Secretariat',
        '+94 11 7296310',
        'anuruddakg@ceypetco.gov.lk',
      ],
    ],
  },
  {
    title: 'Operating Divisions',
    people: [
      [
        'A I Wanasekara',
        'Manager · Aviation Operations, Katunayake',
        '+94 11 2253039',
        'mgr.avi@ceypetco.gov.lk',
      ],
      [
        'A M K B Adhikari',
        'Acting Deputy Manager · Sapugaskanda Terminal',
        '+94 11 2401112 / +94 11 5750880',
        '',
      ],
      [
        'B S S Perera',
        'Manager · Agro Chemicals',
        '+94 11 2694483 / +94 11 5666815',
        'mgr.agro@ceypetco.gov.lk',
      ],
    ],
  },
];

const DIRECTORY_GROUP_ORDER = [
  'Corporate Management',
  'Senior Management · Refinery',
  'Head Office',
  'Operating Divisions',
];

function ManagementDirectory() {
  const { t } = useLanguage();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/management-contacts/active', {
          params: { limit: 500 },
        });
        const contacts = res.data && res.data.data ? res.data.data : [];
        if (cancelled) return;
        const map = {};
        contacts.forEach((c) => {
          const key = c.group || 'Other';
          if (!map[key]) map[key] = [];
          map[key].push(c);
        });
        const ordered = Object.keys(map).sort((a, b) => {
          const ia = DIRECTORY_GROUP_ORDER.indexOf(a);
          const ib = DIRECTORY_GROUP_ORDER.indexOf(b);
          if (ia === -1 && ib === -1) return a.localeCompare(b);
          if (ia === -1) return 1;
          if (ib === -1) return -1;
          return ia - ib;
        });
        setGroups(
          ordered.map((title) => ({
            title,
            people: (map[title] || []).sort((a, b) => a.order - b.order),
          }))
        );
      } catch (err) {
        if (!cancelled) setGroups([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="management-directory content-section">
      <div className="container">
        <div className="page-title-row">
          <div>
            <p className="eyebrow">{t('directory')}</p>
            <h2>{t('directoryTitle')}</h2>
          </div>
          <p>
            {t('directoryCopy')}
          </p>
        </div>
        <div className="management-groups">
          {loading ? (
            <details open>
              <summary>
                <span>
                  <small>—</small>
                  {t('loadingDirectory')}
                </span>
                <b>—</b>
              </summary>
            </details>
          ) : groups.length === 0 ? (
            <details open>
              <summary>
                <span>
                  <small>—</small>
                  {t('emptyDirectory')}
                </span>
                <b>—</b>
              </summary>
            </details>
          ) : (
            groups.map((group, index) => (
              <details open={index === 0} key={group.title}>
                <summary>
                  <span>
                    <small>{String(index + 1).padStart(2, '0')}</small>
                    {group.title}
                  </span>
                  <b>{String(group.people.length).padStart(2, '0')} {t('contacts')}</b>
                </summary>
                <div className="management-list">
                  {group.people.map((person, personIndex) => (
                    <article key={person._id}>
                      <span className="management-person-index">
                        {String(personIndex + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <h3>{person.name}</h3>
                        <p>{person.role}</p>
                      </div>
                      <div className="management-contact-details">
                        {person.phone && (
                          <a
                            href={`tel:${person.phone
                              .split('/')[0]
                              .replaceAll(' ', '')}`}
                          >
                            <Icon name="phone" size={14} /> {person.phone}
                          </a>
                        )}
                        {person.email && (
                          <a href={`mailto:${person.email}`}>
                            <span>@</span> {person.email}
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </details>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function ManagementTeam() {
  const { t } = useLanguage();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/team-members/active', {
          params: { limit: 200 },
        });
        if (cancelled) return;
        const items = res.data && res.data.data ? res.data.data : [];
        setLeaders(
          [...items].sort((a, b) =>
            (a.order ?? 0) - (b.order ?? 0) ||
            String(a.name).localeCompare(String(b.name))
          )
        );
      } catch (err) {
        if (!cancelled) setLeaders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = [];
  for (let i = 0; i < leaders.length; i += 2) {
    rows.push(leaders.slice(i, i + 2));
  }

  const renderPhoto = (member) =>
    member.photo ? (
      <img src={member.photo} alt={member.name} />
    ) : (
      <span className="leader-photo-fallback">
        {member.name
          .split(' ')
          .slice(0, 2)
          .map((w) => w[0])
          .join('')
          .toUpperCase()}
      </span>
    );

  return (
    <section className="content-section management-team-section">
      <div className="container">
        <div className="page-title-row">
          <div>
            <p className="eyebrow">{t('leadership')}</p>
            <h2>{t('managementTeam')}</h2>
          </div>
        </div>

        {loading ? (
          <div className="management-team-rows">
            <div className="team-row">
              {Array.from({ length: 2 }).map((_, i) => (
                <article className="team-member-card" key={i}>
                  <div className="team-member-photo">
                    <div className="leader-photo-loading" />
                  </div>
                  <div className="team-member-info">
                    <h3>Loading...</h3>
                    <p className="team-member-role">Please wait</p>
                    <p className="team-member-desc">Loading team information</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : leaders.length === 0 ? (
          <div className="management-team-rows">
            <div className="team-row">
              <article className="team-member-card">
                <div className="team-member-photo">
                  <img src="/images/chairman.jpeg" alt="" />
                </div>
                <div className="team-member-info">
                  <h3>No team members yet</h3>
                  <p className="team-member-role">Check back soon</p>
                  <p className="team-member-desc">
                    Leadership information will appear here shortly
                  </p>
                </div>
              </article>
            </div>
          </div>
        ) : (
          <div className="management-team-rows">
            {rows.map((row, rowIndex) => (
              <div
                className={`team-row ${rowIndex % 2 ? 'team-row-reversed' : ''}`}
                key={rowIndex}
              >
                <div className="team-row-portraits">
                  {row.map((member) => (
                    <figure className="team-member-portrait" key={member._id}>
                      <div className="team-member-photo">
                        {renderPhoto(member)}
                      </div>
                      <figcaption>{member.role || 'Management Team'}</figcaption>
                    </figure>
                  ))}
                </div>
                <div className="team-row-details">
                  {row.map((member) => (
                    <article className="team-member-info" key={member._id}>
                      <h3>{member.name}</h3>
                      <p className="team-member-desc">
                        {member.description ||
                          'Leadership profile details are being prepared'}
                      </p>
                      <a
                        className="team-member-more"
                        href={`/management-team/${member._id}`}
                      >
                        {t('seeMore')} <Icon name="arrow" size={15} />
                      </a>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ManagementTeamProfile({ memberId }) {
  const { t } = useLanguage();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/admin/team-members/active/${memberId}`)
      .then((res) => {
        if (!cancelled) setMember(res.data?.data || null);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [memberId]);

  if (loading) {
    return (
      <main className="inner-page management-profile-page">
        <div className="container management-profile-status">{t('loadingProfile')}</div>
      </main>
    );
  }

  if (notFound || !member) {
    return (
      <main className="inner-page management-profile-page">
        <div className="container management-profile-status">
          <p className="eyebrow">{t('managementTeam')}</p>
          <h1>{t('profileNotFound')}</h1>
          <a href="/management">{t('backTeam')}</a>
        </div>
      </main>
    );
  }

  return (
    <main className="inner-page management-profile-page">
      <section className="management-profile-hero">
        <div className="container">
          <a className="management-profile-back" href="/about">
            <Icon name="arrow" size={16} /> {t('backTeam')}
          </a>
          <div className="management-profile-grid">
            <figure className="management-profile-photo">
              {member.photo ? (
                <img src={member.photo} alt={member.name} />
              ) : (
                <span>{member.name.slice(0, 2).toUpperCase()}</span>
              )}
            </figure>
            <article className="management-profile-copy">
              <p className="eyebrow light">{t('leadershipLabel')}</p>
              <h1>{member.name}</h1>
              <p className="management-profile-role">{member.role}</p>
              <div className="management-profile-divider" />
              <h2>{t('professionalProfile')}</h2>
              <p className="management-profile-description">
                {member.description ||
                  'Leadership profile details are being prepared'}
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

function getNewsPreview(item) {
  const text = (item.summary?.trim() || item.content || '')
    .replace(/\s+/g, ' ')
    .trim();
  const maxLength = 160;

  if (text.length <= maxLength) return text;

  const excerpt = text.slice(0, maxLength + 1);
  const lastSpace = excerpt.lastIndexOf(' ');
  return `${excerpt.slice(0, lastSpace > 0 ? lastSpace : maxLength).trimEnd()}…`;
}

function NewsDetailPage({ newsId }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);
  const photoTriggerRef = useRef(null);
  const lightboxRef = useRef(null);
  const closePhotoRef = useRef(null);
  const galleryImages = Array.isArray(item?.images) ? item.images.filter(Boolean) : [];
  const isPhotoOpen = activePhotoIndex !== null && galleryImages.length > 0;

  const closePhoto = () => {
    setActivePhotoIndex(null);
    requestAnimationFrame(() => photoTriggerRef.current?.focus());
  };

  useEffect(() => {
    if (!isPhotoOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closePhotoRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setActivePhotoIndex(null);
        requestAnimationFrame(() => photoTriggerRef.current?.focus());
      } else if (event.key === 'ArrowRight' && galleryImages.length > 1) {
        event.preventDefault();
        setActivePhotoIndex((index) => (index + 1) % galleryImages.length);
      } else if (event.key === 'ArrowLeft' && galleryImages.length > 1) {
        event.preventDefault();
        setActivePhotoIndex((index) => (index - 1 + galleryImages.length) % galleryImages.length);
      } else if (event.key === 'Tab') {
        const buttons = [...(lightboxRef.current?.querySelectorAll('button:not([disabled])') || [])];
        if (!buttons.length) return;
        if (event.shiftKey && document.activeElement === buttons[0]) {
          event.preventDefault();
          buttons[buttons.length - 1].focus();
        } else if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) {
          event.preventDefault();
          buttons[0].focus();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isPhotoOpen, galleryImages.length]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setActivePhotoIndex(null);
    api
      .get(`/admin/news/by/${newsId}`)
      .then((res) => {
        if (!cancelled) setItem(res.data?.data || null);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [newsId]);

  if (loading) {
    return (
      <main className="inner-page news-detail-page">
        <div className="container news-detail-status">
          <p className="eyebrow">NEWS</p>
          <p>Loading article...</p>
        </div>
      </main>
    );
  }

  if (notFound || !item) {
    return (
      <main className="inner-page news-detail-page">
        <div className="container news-detail-status">
          <p className="eyebrow">NEWS</p>
          <h1>Article not found</h1>
          <p>This article may have been unpublished or removed</p>
          <a href="/news">
            Back to News <Icon name="arrow" size={16} />
          </a>
        </div>
      </main>
    );
  }

  const category = (item.category || 'News')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const published = item.publishedDate
    ? new Date(item.publishedDate).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    : null;
  const paragraphs = (item.content || '')
    .split(/\n{2,}|\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <main className="inner-page news-detail-page">
      <header className="news-detail-header">
        <div className="container news-detail-header-inner">
          <nav className="news-detail-breadcrumbs" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span aria-hidden="true">/</span>
            <a href="/news">News</a>
            <span aria-hidden="true">/</span>
            <span>Article</span>
          </nav>
          <span className="news-detail-category">{category}</span>
          <h1>{item.title}</h1>
          {item.summary && <p className="news-detail-lead">{item.summary}</p>}
          <div className="news-detail-meta">
            {published && (
              <time dateTime={item.publishedDate}>
                <Icon name="clock" size={16} /> {published}
              </time>
            )}
            {item.author && (
              <span>
                <Icon name="user" size={16} /> {item.author}
              </span>
            )}
          </div>
        </div>
      </header>
      {item.featuredImage && (
        <div className="container news-detail-feature-wrap">
          <figure className="news-detail-feature">
            <img src={displayImageUrl(item.featuredImage)} alt={item.title} />
          </figure>
        </div>
      )}
      <section className="news-detail-content-section">
        <div className="container news-detail-layout">
          <article className="news-detail-article">
            <div className="news-detail-copy">
              {paragraphs.length ? (
                paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))
              ) : (
                <p>Full details of this update are being prepared and will be published shortly.</p>
              )}
            </div>
          </article>
          <aside className="news-detail-aside" aria-label="Article information">
            <p className="news-detail-aside-heading">Article information</p>
            <dl>
              <div><dt>Category</dt><dd>{category}</dd></div>
              {published && <div><dt>Published</dt><dd>{published}</dd></div>}
              {item.author && <div><dt>Author</dt><dd>{item.author}</dd></div>}
            </dl>
            <a href="/news" className="news-detail-back">
              <Icon name="arrow" size={16} /> Back to all news
            </a>
          </aside>
        </div>
        {galleryImages.length > 0 && (
          <section className="container news-detail-gallery" aria-labelledby="news-gallery-title">
            <div className="news-detail-gallery-heading">
              <p className="eyebrow">FROM THE STORY</p>
              <h2 id="news-gallery-title">Photo gallery</h2>
            </div>
            <div className="news-detail-gallery-grid" tabIndex={0} aria-label="Article photos; scroll to see more">
              {galleryImages.map((image, index) => (
                <figure key={`${image}-${index}`}>
                  <button type="button" onClick={(event) => { photoTriggerRef.current = event.currentTarget; setActivePhotoIndex(index); }} aria-label={`View photo ${index + 1} of ${galleryImages.length}`}>
                    <img src={displayImageUrl(image)} alt={`${item.title} — image ${index + 1}`} loading="lazy" />
                  </button>
                </figure>
              ))}
            </div>
          </section>
        )}
      </section>
      {isPhotoOpen && (
        <div className="news-photo-lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={closePhoto}>
          <div className="news-photo-lightbox-panel" ref={lightboxRef} onClick={(event) => event.stopPropagation()}>
            <div className="news-photo-lightbox-top">
              <span>Photo {activePhotoIndex + 1} of {galleryImages.length}</span>
              <button ref={closePhotoRef} type="button" className="news-photo-lightbox-close" onClick={closePhoto} aria-label="Close photo viewer">×</button>
            </div>
            <div className="news-photo-lightbox-stage">
              {galleryImages.length > 1 && (
                <button type="button" className="news-photo-lightbox-nav" onClick={() => setActivePhotoIndex((index) => (index - 1 + galleryImages.length) % galleryImages.length)} aria-label="Previous photo">
                  <Icon name="arrow" size={25} />
                </button>
              )}
              <img src={displayImageUrl(galleryImages[activePhotoIndex])} alt={`${item.title} — image ${activePhotoIndex + 1}`} />
              {galleryImages.length > 1 && (
                <button type="button" className="news-photo-lightbox-nav" onClick={() => setActivePhotoIndex((index) => (index + 1) % galleryImages.length)} aria-label="Next photo">
                  <Icon name="arrow" size={25} />
                </button>
              )}
            </div>
            <p className="news-photo-lightbox-hint">Use the arrow keys to browse · Esc to close</p>
          </div>
        </div>
      )}
    </main>
  );
}

const contactLocations = [
  ['Customer Care', '+94 117 296 130', '', ''],
  ['Head Office', '+94 117 296 100', '', 'secretariat@ceypetco.gov.lk'],
  [
    'Refinery',
    '+94 11 2541382',
    '+94 11 2400436',
    'ref.manager@ceypetco.gov.lk',
  ],
  [
    'Aviation · Katunayake',
    '+94 11 2251319 / +94 11 2253376',
    '+94 11 2252331',
    'avi.opsbia@ceypetco.gov.lk',
  ],
  [
    'Aviation · Ratmalana',
    '+94 11 2637755',
    '+94 11 2637755',
    'avi.opsrat@ceypetco.gov.lk',
  ],
  [
    'Agro Chemicals · Kolonnawa',
    '+94 11 2572316',
    '+94 11 2572316',
    'agrochem@ceypetco.gov.lk',
  ],
];

function ContactDirectory() {
  return (
    <section className="contact-directory">
      <div className="container">
        <div className="contact-directory-heading">
          <div>
            <p className="eyebrow">OFFICE DIRECTORY</p>
            <h2>Direct contacts by location</h2>
          </div>
          <address>
            No. 609, Dr. Danister de Silva Mawatha,
            <br />
            Colombo 09, Sri Lanka
          </address>
        </div>
        <div className="contact-location-grid">
          {contactLocations.map(([name, phone, fax, email]) => (
            <article key={name}>
              <h3>{name}</h3>
              <dl>
                <div>
                  <dt>Telephone</dt>
                  <dd>{phone}</dd>
                </div>
                {fax && (
                  <div>
                    <dt>Fax</dt>
                    <dd>{fax}</dd>
                  </div>
                )}
                {email && (
                  <div>
                    <dt>Email</dt>
                    <dd>
                      <a href={`mailto:${email}`}>{email}</a>
                    </dd>
                  </div>
                )}
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HistoryPage({ data }) {
  return (
    <>
      <section className="content-section history-section">
        <div className="container">
          <div className="page-title-row">
            <div>
              <p className="eyebrow">{data.journeyLabel}</p>
              <h2>{data.journeyTitle}</h2>
            </div>
            <p>{data.journeyIntro}</p>
          </div>
          <div className="history-timeline">
            {data.milestones.map((item, index) => (
              <article key={item._id || index}>
                <div className="history-year">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <b>{item.year}</b>
                </div>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="history-gallery-section">
        <div className="container">
          <div className="page-title-row">
            <div>
              <p className="eyebrow">{data.galleryLabel}</p>
              <h2>{data.galleryTitle}</h2>
            </div>
          </div>
          <div className="history-gallery">
            {data.gallery.map((item, index) => (
              <figure
                className={item.wide ? 'wide' : ''}
                key={item._id || index}
              >
                <img
                  src={item.image}
                  alt={item.alt || ''}
                />
                {item.caption && <figcaption>{item.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const mobileAppPlatforms = {
  android: { label: 'Android', hint: 'Get it on', badge: 'APK download' },
  ios: { label: 'iOS', hint: 'Download on the', badge: 'App Store' },
  web: { label: 'Web', hint: 'Continues in', badge: 'Your browser' },
};

const fallbackMobileApps = [
  {
    _id: 'fallback-fuelup',
    title: 'FuelUP',
    description:
      'Ceypetco\u2019s official mobile application for finding fuel stations, checking product availability and accessing public services on the move.',
    platform: 'android',
    downloadUrl: 'https://fuelup.cpstl.lk/apk/',
    storeUrl: '',
    order: 1,
    featured: true,
    status: 'published',
  },
];

function MobileAppsPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const page = pageData['/mobile-app'];

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await api.get('/admin/mobile-apps', {
          params: { limit: 50 },
        });
        if (!cancelled)
          setApps(res.data && res.data.data ? res.data.data : []);
      } catch (err) {
        if (!cancelled) setApps([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const platformOf = (app) =>
    mobileAppPlatforms[app.platform] || mobileAppPlatforms.android;
  const storeTarget = (app) => app.downloadUrl || app.storeUrl || '';
  const visibleApps = (apps.length ? apps : fallbackMobileApps).sort(
    (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.order - b.order,
  );
  const featured = visibleApps[0] || fallbackMobileApps[0];
  const others = visibleApps.slice(1);

  const stats = [
    {
      icon: 'shield',
      value: '100% official',
      label: 'Released under the Ceypetco brand',
    },
    {
      icon: 'globe',
      value: 'Nationwide',
      label: 'Station coverage across Sri Lanka',
    },
    {
      icon: 'download',
      value: 'Free to get',
      label: 'No account required to explore',
    },
    {
      icon: 'clock',
      value: 'Always current',
      label: 'Fresh product and service updates',
    },
  ];

  const highlights = [
    {
      icon: 'station',
      title: 'Fuel station finder',
      text: 'Locate approved Ceypetco stations and key product information with ease',
    },
    {
      icon: 'clock',
      title: 'Up-to-date information',
      text: 'See the latest product and service updates as soon as they are published',
    },
    {
      icon: 'shield',
      title: 'Trusted standards',
      text: 'The same quality and security Ceypetco applies across the nation\u2019s fuel supply',
    },
    {
      icon: 'download',
      title: 'Direct, fast install',
      text: 'Download from the official source or your device app store in seconds',
    },
  ];

  const steps = [
    {
      icon: 'app',
      title: 'Choose your app',
      text: 'Select the release for your device platform from the catalogue below',
    },
    {
      icon: 'download',
      title: 'Download securely',
      text: 'Install from the official link or your device app store',
    },
    {
      icon: 'station',
      title: 'Start exploring',
      text: 'Find stations and check the latest updates right away',
    },
  ];

  const renderAppIcon = (app, options = {}) => {
    const { size = '', dark = false } = options;
    const cls = [
      'mobile-app-icon-glyph',
      size ? `mobile-app-icon-glyph-${size}` : '',
      dark ? 'mobile-app-icon-glyph-dark' : '',
    ]
      .filter(Boolean)
      .join(' ');
    return app.appIcon ? (
      <img
        className={`mobile-app-icon-img${size ? ` mobile-app-icon-img-${size}` : ''}`}
        src={app.appIcon}
        alt={`${app.title} icon`}
        loading="lazy"
      />
    ) : (
      <span className={cls}>
        <Icon name="app" size={size === 'lg' ? 30 : 22} />
      </span>
    );
  };

  const renderStoreButton = (app) => (
    <a
      key={app._id}
      className="mobile-store-button"
      href={storeTarget(app)}
      target="_blank"
      rel="noreferrer"
    >
      <Icon name="app" size={18} />
      <span>
        <small>{platformOf(app).hint}</small>
        <b>{platformOf(app).label}</b>
      </span>
    </a>
  );

  const renderAppActions = (app) => (
    <div className="mobile-app-actions">
      {app.downloadUrl ? (
        <a
          className="mobile-app-download"
          href={app.downloadUrl}
          target="_blank"
          rel="noreferrer"
        >
          <Icon name="download" size={16} />
          {app.featured ? 'Download now' : 'Download'}
        </a>
      ) : null}
      {app.storeUrl && (
        <a
          className="mobile-app-store"
          href={app.storeUrl}
          target="_blank"
          rel="noreferrer"
        >
          View in store
        </a>
      )}
      {!app.downloadUrl && !app.storeUrl && (
        <span className="mobile-app-coming">Coming soon</span>
      )}
    </div>
  );

  return (
    <main className="inner-page mobile-apps-page">
      <section className="mobile-apps-hero">
        <span className="mobile-apps-hero-bg" aria-hidden="true"></span>
        <div className="container mobile-apps-hero-grid">
          <div className="mobile-apps-hero-copy">
            <p className="eyebrow light">{page.label}</p>
            <h1>{page.title}</h1>
            <p className="mobile-apps-hero-lead">{page.intro}</p>
            <div className="breadcrumbs">
              <a href="/">Home</a>
              <span>/</span>
              <b>Mobile Apps</b>
            </div>
            {visibleApps.filter((app) => storeTarget(app)).length > 0 && (
              <div className="mobile-apps-hero-stores">
                {visibleApps
                  .filter((app) => storeTarget(app))
                  .map(renderStoreButton)}
              </div>
            )}
            <div className="mobile-apps-hero-chips">
              <span>
                <Icon name="shield" size={14} /> Official Ceypetco release
              </span>
              <span>
                <Icon name="app" size={14} /> Mobile &amp; web access
              </span>
            </div>
          </div>
          <div className="mobile-apps-hero-visual">
            <div className="mobile-apps-phone">
              <span className="mobile-apps-phone-notch"></span>
              <div className="mobile-apps-phone-screen">
                <div className="mobile-apps-phone-app">
                  {renderAppIcon(featured, { size: 'lg', dark: true })}
                </div>
                <p className="mobile-apps-phone-title">{featured.title}</p>
                <small className="mobile-apps-phone-byline">
                  Ceypetco public services
                </small>
                <div className="mobile-apps-phone-row">
                  <span className="mobile-apps-phone-pill active">
                    <Icon name="station" size={13} /> Station finder
                  </span>
                </div>
                <div className="mobile-apps-phone-lines">
                  <i></i>
                  <i></i>
                  <i></i>
                </div>
                <div className="mobile-apps-phone-card mobile-apps-phone-card-a">
                  <Icon name="shield" size={16} />
                  <span>
                    <b>Verified</b>
                    <small>By Ceypetco</small>
                  </span>
                </div>
                <div className="mobile-apps-phone-card mobile-apps-phone-card-b">
                  <Icon name="clock" size={16} />
                  <span>
                    <b>Updated today</b>
                    <small>Live product info</small>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mobile-apps-stats">
        <div className="container mobile-apps-stats-grid">
          {stats.map((stat) => (
            <div className="mobile-apps-stat" key={stat.value}>
              <span className="mobile-apps-stat-icon">
                <Icon name={stat.icon} size={18} />
              </span>
              <div>
                <b>{stat.value}</b>
                <small>{stat.label}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mobile-apps-intro content-section">
        <div className="container mobile-apps-intro-grid">
          <div className="mobile-apps-intro-head">
            <p className="eyebrow">ABOUT THE EXPERIENCE</p>
            <h2>
              One app. The whole network
              <br />
              at your fingertips
            </h2>
            <p className="mobile-apps-intro-lead">
              The official Ceypetco application brings station locations,
              product information and public service updates together in a
              single, trusted place — available on mobile and the web.
            </p>
          </div>
          <div className="mobile-apps-highlights">
            {highlights.map((highlight) => (
              <article className="mobile-apps-highlight" key={highlight.title}>
                <span className="mobile-apps-highlight-icon">
                  <Icon name={highlight.icon} size={18} />
                </span>
                <div>
                  <h3>{highlight.title}</h3>
                  <p>{highlight.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mobile-apps-section">
        <div className="container">
          {loading ? (
            <div className="mobile-apps-empty">
              <p className="eyebrow">MOBILE APPS</p>
              <h2>Loading mobile apps…</h2>
            </div>
          ) : visibleApps.length === 0 ? (
            <div className="mobile-apps-empty">
              <p className="eyebrow">MOBILE APPS</p>
              <h2>Official mobile apps coming soon</h2>
              <p>
                Downloadable Ceypetco applications will be listed here shortly
              </p>
            </div>
          ) : (
            <>
              <div className="page-title-row">
                <div>
                  <p className="eyebrow">OUR MOBILE APPS</p>
                  <h2>Choose the experience that works for you</h2>
                </div>
                <p>
                  Each official application is released under the Ceypetco brand
                  and follows the same quality and security standards
                </p>
              </div>
              <div className="mobile-apps-grid">
                {featured && (
                  <article className="mobile-app-card mobile-app-card-featured">
                    <div className="mobile-app-card-top">
                      {renderAppIcon(featured, { size: 'lg', dark: true })}
                      <div className="mobile-app-meta">
                        <span
                          className={`mobile-app-badge mobile-app-badge-${featured.platform}`}
                        >
                          {platformOf(featured).label}
                        </span>
                        <small className="mobile-app-official">
                          <Icon name="shield" size={12} /> Official application
                        </small>
                      </div>
                    </div>
                    <div className="mobile-app-card-body">
                      <h3>{featured.title}</h3>
                      <p className="mobile-app-card-copy">
                        {featured.description}
                      </p>
                      {renderAppActions(featured)}
                    </div>
                  </article>
                )}
                {others.map((app) => (
                  <article className="mobile-app-card" key={app._id}>
                    <div className="mobile-app-card-top">
                      {renderAppIcon(app)}
                      <div className="mobile-app-meta">
                        <span
                          className={`mobile-app-badge mobile-app-badge-${app.platform}`}
                        >
                          {platformOf(app).label}
                        </span>
                        <small className="mobile-app-official">
                          <Icon name="shield" size={12} /> Official
                        </small>
                      </div>
                    </div>
                    <h3>{app.title}</h3>
                    <p className="mobile-app-card-copy">{app.description}</p>
                    {renderAppActions(app)}
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="mobile-apps-steps content-section">
        <div className="container">
          <div className="page-title-row">
            <div>
              <p className="eyebrow">GETTING STARTED</p>
              <h2>Up and running in three steps</h2>
            </div>
            <p>
              Official applications are released under the Ceypetco brand and
              follow the same quality and security standards across every
              release
            </p>
          </div>
          <div className="mobile-apps-steps-grid">
            {steps.map((step, index) => (
              <article key={step.title}>
                <span className="mobile-apps-step-index">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="mobile-apps-step-icon">
                  <Icon name={step.icon} size={20} />
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

const divisionPages = {
  '/refinery': {
    kicker: 'REFINERY OPERATIONS',
    heading: 'More than five decades of refining expertise',
    copy: 'The Sapugaskanda Refinery was commissioned in August 1969 to process 38,000 barrels per stream day. Continuous improvements have expanded capability, improved efficiency and enabled production that meets changing national requirements',
    stats: [
      ['1969', 'Commissioned'],
      ['1,100+', 'Direct jobs'],
      ['30–35%', 'CPC sales volume'],
    ],
    image: '/images/refinery-detail-2.jpg',
    features: [
      '100% Sri Lankan operating staff',
      'Foreign-exchange savings for the nation',
      'Internationally recognised refinery training',
    ],
    table: [
      ['Crude distiller', '5,200'],
      ['Naphtha Unifiner', '940'],
      ['Platformer', '285'],
      ['Gas oil Unifiner', '450'],
      ['Visbreaker', '2,000'],
      ['Merox unit', '70'],
      ['Vacuum Unit', '950'],
      ['Bitumen Blowing Unit', '350'],
    ],
  },
  '/marketing-sales': {
    kicker: 'MARKETING & SALES',
    heading: 'An islandwide network built around access',
    copy: 'CPC marketing operations began in April 1962. Today, the network supplies Sri Lanka through hundreds of dealers, connecting dependable petroleum products with households, mobility and industry',
    stats: [
      ['850+', 'Dealer locations'],
      ['Islandwide', 'Distribution'],
      ['Since 1962', 'Marketing operations'],
    ],
    image: '/images/media-3.jpg',
    features: [
      'Retail and commercial fuel supply',
      'Dealer and regional-office support',
      'Product quality and pricing information',
    ],
    prices: [
      ['Petrol 92', 'Rs. 414.00 / L'],
      ['Auto Diesel', 'Rs. 382.00 / L'],
      ['Lanka Kerosene', 'Rs. 285.00 / L'],
      ['Petrol 95 Euro 4', 'Rs. 495.00 / L'],
      ['Super Diesel Euro 4', 'Rs. 478.00 / L'],
      ['Industrial Kerosene', 'Rs. 434.00 / L'],
      ['Fuel Oil Super', 'Rs. 332.00 / L'],
      ['Fuel Oil 1500 · High Sulphur', 'Rs. 332.00 / L'],
      ['Fuel Oil 1500 · Low Sulphur', 'Rs. 332.00 / L'],
    ],
  },
  '/aviation': {
    kicker: 'CEYPETCO AVIATION',
    heading: 'Quality fuel. The right aircraft. The right time',
    copy: 'Ceypetco Aviation provides round-the-clock aviation refuelling at Sri Lanka’s international airports, with daytime services for domestic, executive and nominated aircraft at Ratmalana',
    stats: [
      ['24/7', 'International service'],
      ['1.3M L', 'Daily demand'],
      ['3', 'Operating locations'],
    ],
    image: '/images/aviation-service.jpg',
    features: [
      'JET A-1 and AV GAS availability',
      'International quality-control standards',
      'Hydrant and refueller operations',
    ],
    locations: [
      ['Katunayake', 'Three JET A-1 tanks · 2.6M litres each'],
      ['Mattala', 'Three JET A-1 tanks · 1.0M litres each'],
      ['Ratmalana', 'Five tanks · 280,000 litres total'],
    ],
  },
  '/agro-chemicals': {
    kicker: 'AGRO CHEMICALS',
    heading: 'Trusted crop protection for over 50 years',
    copy: 'Established in 1969, the Agrochemicals Function supplies quality crop-protection solutions while supporting safe use, reasonable pricing and timely delivery across farming communities',
    stats: [
      ['50+ years', 'Market service'],
      ['ISO 9001', 'Quality certified'],
      ['Islandwide', 'Field support'],
    ],
    image: '/images/agro-products.jpg',
    features: [
      'Quality, environment and safety systems',
      'Guidance for farmers and agrarian centres',
      'Reasonably priced crop-protection products',
    ],
    products: [
      ['Insecticides', 'Profenophos · BPMC · Fipronil'],
      ['Weedicides', 'Diuron · Pretilachlor · Glyphosate'],
      ['Fungicides', 'Tebuconazole · Mancozeb · Captan'],
      ['Bio-Insecticides', 'Flipper'],
    ],
  },
  '/lubricants': {
    kicker: 'CEYPETCO LUBRICANTS',
    heading: 'Certified protection for every application',
    copy: 'Ceypetco lubricating oils are blended in an ISO-certified plant and developed for demanding automotive and industrial uses in line with recognised API and ACEA specifications',
    stats: [
      ['ISO', 'Certified blending'],
      ['20+', 'Product families'],
      ['Automotive +', 'Industrial use'],
    ],
    image: '/images/control-room.png',
    features: [
      'Internationally aligned specifications',
      'Automotive and industrial product ranges',
      'Nationwide Ceypetco brand support',
    ],
    products: [
      ['Engine Oils', 'Enduro · Supreme XHD · Platinum'],
      ['Transmission', 'ATF Dexron III · Gear Oil GL-4/GL-5'],
      ['Speciality', 'Brake Fluid · Coolant · Grease'],
      ['Industrial', 'Hydra · Hypertrans · Circulation Oil'],
    ],
  },
};

const additionalOperationPages = {
  '/bunkering': {
    theme: 'marine',
    eyebrow: 'MARINE FUEL SERVICES',
    heading: 'Fuel support for vessels and port operations',
    cardsTitle: 'Marine fuel and supply coordination',
    copy: 'Ceypetco has identified bunkering as a marine fuel business and reported sales of marine diesel and marine fuel oil to ships. Our team can confirm current product availability, specifications and supply arrangements for a planned call.',
    facts: ['Marine diesel', 'Marine fuel oil', 'Vessel supply enquiries'],
    cards: [
      { title: 'Marine diesel', text: 'Discuss the grade, required quantity and technical specification for your vessel.' },
      { title: 'Marine fuel oil', text: 'Request current fuel oil specifications and confirm whether your required grade can be supplied.' },
      { title: 'Supply coordination', text: 'Share the vessel, port, expected arrival and delivery window so the relevant team can assess the request.' },
    ],
    steps: ['Identify the vessel and port of call', 'Provide fuel type, grade and estimated quantity', 'Confirm timing and delivery arrangements with Ceypetco'],
    note: 'Products, delivery locations and commercial terms are confirmed for each enquiry.',
    overviewTitle: 'Planning a marine fuel supply',
    overview: 'A bunker request depends on the vessel, fuel specification, quantity and delivery window. Early coordination gives the supply team time to confirm the product and arrangements for the port call.',
    detailItems: [
      { title: 'Vessel and voyage', text: 'Provide the vessel name, IMO number where available, port of call and estimated arrival and departure times.' },
      { title: 'Fuel requirement', text: 'State the marine diesel or fuel oil grade, required quantity and technical specification.' },
      { title: 'Delivery planning', text: 'Confirm the preferred delivery window, receiving arrangements and port contact.' },
      { title: 'Quality documents', text: 'Request the current product specification and delivery documents needed by the vessel operator.' },
    ],
    specTitle: 'Products and request details',
    specIntro: 'CPC has reported marine diesel and marine fuel oil sales to ships. A specific grade or delivery method must be confirmed for each request.',
    specRows: [
      ['Marine diesel', 'Share the required grade and technical specification.'],
      ['Marine fuel oil', 'Confirm the requested grade and vessel requirements.'],
      ['Supply window', 'Provide port, ETA, estimated quantity and preferred timing.'],
    ],
    faqs: [
      { question: 'Can I see a live bunker price here?', answer: 'No. Pricing and commercial terms are confirmed for individual enquiries.' },
      { question: 'Is supply available at every port?', answer: 'Location and delivery arrangements need confirmation for each port call.' },
      { question: 'What should I send first?', answer: 'Send vessel details, port and ETA, product and grade, estimated quantity and contact details.' },
    ],
    source: { label: 'CPC Annual Report 2021 · Bunkering Business', href: 'https://ceypetco.gov.lk/wp-content/uploads/2025/08/2021-_English.pdf' },
  },
  '/ev-charging': {
    theme: 'electric',
    eyebrow: 'ELECTRIC MOBILITY',
    heading: 'Explore the next chapter of mobility',
    cardsTitle: 'Charging information to check',
    copy: 'Ceypetco is developing a role in electric mobility alongside its established energy services. The Ministry of Energy reported an initial programme for charging facilities at ten CPC-owned filling stations; confirm the status of any individual location before travelling.',
    facts: ['Charging enquiries', 'Location confirmation', 'Partnership discussions'],
    cards: [
      { title: 'Charging locations', text: 'Ask whether a Ceypetco charging location is currently available and confirm its opening hours.' },
      { title: 'Vehicle compatibility', text: 'Before travelling, confirm connector type, charging power and access requirements with the site operator.' },
      { title: 'Future collaboration', text: 'Organisations can enquire about electric mobility and potential service partnerships.' },
    ],
    steps: ['Tell us your location or proposed site', 'Include your vehicle or charging requirements', 'Request confirmation of current availability and access'],
    note: 'Charging locations, equipment and opening dates can change. This page does not provide live availability, bookings or payments.',
    overviewTitle: 'Plan a charging visit with confidence',
    overview: 'A useful charging stop starts with verified site information. Drivers should check that a station is operating, that its connector works with their vehicle and that access is available when they plan to arrive.',
    detailItems: [
      { title: 'Location and status', text: 'Confirm the exact address and whether the charger is commissioned and available to the public.' },
      { title: 'Connector compatibility', text: 'Check the connector standard and whether the charger supports the vehicle and charging cable.' },
      { title: 'Charging speed', text: 'Ask whether equipment is AC or DC and confirm rated power; actual speed also depends on the vehicle.' },
      { title: 'Access and payment', text: 'Check operating hours, access conditions and the payment method with the site before setting out.' },
    ],
    specTitle: 'What the published programme says',
    specIntro: 'The Ministry of Energy’s 2024 progress report describes steps toward charging centres at CPC-owned filling stations. It is a programme update, not a live list of operating chargers.',
    specRows: [
      ['Initial scope', 'Ten CPC-owned filling stations were identified for the first stage.'],
      ['Equipment', 'Connector and power rating must be checked per site.'],
      ['Live status', 'Confirm commissioning, opening hours and access before travel.'],
    ],
    faqs: [
      { question: 'Does this page show live chargers?', answer: 'No. Contact the station or Ceypetco to confirm current status.' },
      { question: 'Will my vehicle be compatible?', answer: 'Compatibility depends on connector type, charging standard and the vehicle. Check with the site operator.' },
      { question: 'Can I book or pay on this website?', answer: 'No. Booking and payment are not available on this website.' },
    ],
    source: { label: 'Ministry of Energy · 2024 Progress Report', href: 'https://energymin.gov.lk/power/wp-content/uploads/2025/07/Ministry-of-Energy_E.pdf' },
  },
  '/special-chemicals': {
    theme: 'chemicals',
    eyebrow: 'INDUSTRIAL PRODUCTS',
    heading: 'Specialist petroleum products for industry',
    cardsTitle: 'Support for industrial customers',
    copy: 'Ceypetco identifies Special Boiling Point (SBP) solvent among its industrial products. Industrial customers can request current specifications, availability and the appropriate route for supply.',
    facts: ['SBP solvent', 'Technical information', 'Bulk customer guidance'],
    cards: [
      { title: 'SBP solvent', text: 'Request the current product specification and confirm suitability for your intended industrial process.' },
      { title: 'Technical documents', text: 'Ask for the latest specification and safety information before storing or handling a product.' },
      { title: 'Customer registration', text: 'CPC provides a bulk consumer registration route for qualifying industrial users of SBP and other fuels.' },
    ],
    steps: ['Describe the product and intended industrial use', 'State the quantity and delivery location', 'Request current technical documents and supply guidance'],
    note: 'Product suitability and safe handling should be checked against the current official documents.',
    overviewTitle: 'Technical supply starts with the right specification',
    overview: 'Special Boiling Point solvent is a specialist petroleum product. Industrial buyers should match the current specification to their process and review safety information before ordering, storing or using it.',
    detailItems: [
      { title: 'Product identification', text: 'Identify the required SBP solvent and describe the industrial application so the appropriate specification can be checked.' },
      { title: 'Technical review', text: 'Request the latest product specification and safety data sheet. Check relevant properties against process requirements.' },
      { title: 'Bulk consumer route', text: 'CPC states that users of SBP and certain fuels above 3,300 litres per month must register as bulk consumers.' },
      { title: 'Storage and handling', text: 'Plan suitable storage, transport and workplace controls using the current safety data sheet.' },
    ],
    specTitle: 'Information to prepare',
    specIntro: 'This page introduces the product category. Current grades, packaging, availability and technical limits should be confirmed through CPC’s product documents.',
    specRows: [
      ['Product', 'Special Boiling Point (SBP) solvent.'],
      ['Documents', 'Ask for the current specification and safety data sheet.'],
      ['Demand', 'Provide expected monthly volume and delivery location.'],
      ['Registration', 'Bulk consumer registration may be required above 3,300 litres per month.'],
    ],
    faqs: [
      { question: 'Is SBP solvent suitable for my process?', answer: 'Suitability depends on the process and current product specification. Review technical documents before purchase.' },
      { question: 'When is bulk registration needed?', answer: 'CPC states that users of SBP and specified fuels consuming more than 3,300 litres per month are required to register.' },
      { question: 'Where is registration information?', answer: 'Use the Consumer Registration page in the Services menu.' },
    ],
    source: { label: 'CPC · Bulk Consumer Registration', href: 'https://ceypetco.gov.lk/consumer-reg/' },
  },
  '/bitumen': {
    theme: 'bitumen',
    eyebrow: 'BITUMEN',
    heading: 'The material behind durable infrastructure',
    cardsTitle: 'Grades and project planning',
    copy: 'Petroleum bitumen is used in road construction and other industrial applications. Ceypetco’s published specifications include penetration grades 60/70 and 80/100; confirm the grade, current specification and supply terms for your project.',
    facts: ['Grade 60/70', 'Grade 80/100', 'Project supply enquiries'],
    cards: [
      { title: '60/70 penetration grade', text: 'A grade named for its specified penetration range. Review the current CPC specification for test limits.' },
      { title: '80/100 penetration grade', text: 'An alternative penetration grade listed in CPC procurement specifications for bitumen.' },
      { title: 'Project planning', text: 'Confirm the required grade, quantity, packaging, delivery location and schedule before procurement.' },
    ],
    steps: ['Specify the bitumen grade and quantity', 'Share the project location and delivery schedule', 'Confirm current specification, packaging and availability'],
    note: 'Grades shown here are based on published CPC specifications and do not indicate live stock.',
    overviewTitle: 'Choosing a grade for the project',
    overview: 'Penetration grade is one part of a bitumen specification. Project teams should follow the contract or engineer’s required grade, then compare the current product document, delivery form and schedule before procurement.',
    detailItems: [
      { title: 'Road construction', text: 'Bitumen is used as a binder in asphalt mixtures. The selected grade must follow the road design and project specification.' },
      { title: 'Grade selection', text: 'CPC’s published procurement specification includes 60/70 and 80/100 penetration grades, each with its own test limits.' },
      { title: 'Quality review', text: 'Check penetration, softening point, flash point and other required properties against the current specification.' },
      { title: 'Delivery planning', text: 'Confirm quantity, packaging or bulk handling, destination and required delivery dates before ordering.' },
    ],
    specTitle: 'Published grade reference',
    specIntro: 'These are selected limits from CPC’s published procurement specification. Use the full current document and project requirements for technical decisions.',
    specRows: [
      ['60/70 penetration', '60–70 (0.1 mm at 25°C, 100 g, 5 seconds); softening point 48–56°C.'],
      ['80/100 penetration', '80–100 (0.1 mm at 25°C, 100 g, 5 seconds); softening point 45–55°C.'],
      ['Flash point', 'Minimum 250°C for 60/70; minimum 232°C for 80/100 in the cited specification.'],
      ['Supply status', 'Published specifications do not establish current stock, price or delivery availability.'],
    ],
    faqs: [
      { question: 'What do 60/70 and 80/100 mean?', answer: 'They identify penetration ranges measured under specified test conditions. Check project requirements before selecting a grade.' },
      { question: 'Can I use these figures for a tender?', answer: 'Use the full current CPC specification and project contract documents. The figures here are a summary.' },
      { question: 'Does this page show current prices?', answer: 'No. Grade, price, packaging and delivery terms must be confirmed for each enquiry.' },
    ],
    source: { label: 'CPC · Bitumen 60/70 and 80/100 specifications', href: 'https://ceypetco.gov.lk/wp-content/uploads/2026/01/AS-02-2026.pdf' },
  },
};

const subsidiaries = [
  {
    shortName: 'CPSTL',
    name: 'Ceylon Petroleum Storage Terminals Limited',
    role: 'Petroleum storage and distribution',
    description: 'CPSTL manages common-user petroleum storage and distribution infrastructure. Its network connects the Kolonnawa and Muthurajawela installations with regional bulk depots, supporting the movement of fuel to customers across Sri Lanka.',
    facts: ['Two main installations', '11 regional bulk depots', 'Storage, quality assurance and distribution'],
    website: 'https://www.cpstl.lk/cpstl/aboutus',
  },
  {
    shortName: 'TPTL',
    name: 'Trinco Petroleum Terminal (Pvt) Ltd',
    role: 'China Bay tank farm development',
    description: 'TPTL is a joint venture between Ceylon Petroleum Corporation and Lanka IOC PLC. It is responsible for developing the allocated Upper Tank Farm facilities at China Bay, Trincomalee, to strengthen petroleum storage infrastructure.',
    facts: ['CPC–Lanka IOC joint venture', 'Upper Tank Farm, China Bay', '61 tanks allocated for development'],
    website: 'https://trincopetroleum.com/',
  },
];

function SubsidiariesPage() {
  return (
    <section className="subsidiaries-section content-section">
      <div className="container">
        <div className="subsidiaries-intro">
          <p className="eyebrow">OUR GROUP</p>
          <h2>Working together for reliable energy infrastructure</h2>
          <p>CEYPETCO works through specialist companies to support the storage, handling and distribution of petroleum products. Explore their roles and visit their official websites for current information.</p>
        </div>
        <div className="subsidiaries-grid">
          {subsidiaries.map((company, index) => (
            <article className="subsidiary-card" key={company.shortName}>
              <div className="subsidiary-card-top">
                <span className="subsidiary-number">0{index + 1}</span>
                <span className="subsidiary-short-name">{company.shortName}</span>
              </div>
              <p className="eyebrow">{company.role}</p>
              <h3>{company.name}</h3>
              <p className="subsidiary-description">{company.description}</p>
              <ul>
                {company.facts.map((fact) => <li key={fact}>{fact}</li>)}
              </ul>
              <a href={company.website} target="_blank" rel="noopener noreferrer">
                Visit official website <Icon name="arrow" size={17} />
              </a>
            </article>
          ))}
        </div>
        <p className="subsidiaries-source">
          Ownership information: <a href="https://ceypetco.gov.lk/wp-content/uploads/2025/08/Audited-Financial-Statements-2022.pdf" target="_blank" rel="noopener noreferrer">CPC audited financial statements</a>.
        </p>
      </div>
    </section>
  );
}

const energyInstitutions = [
  {
    category: 'ENERGY POLICY',
    name: 'Ministry of Energy',
    description: 'National energy policy, sector coordination and information relevant to petroleum supply.',
    image: '/images/institutions/energy.jpg',
    website: 'https://energymin.gov.lk/index.php/main/',
  },
  {
    category: 'PUBLIC FINANCE',
    name: 'Ministry of Finance',
    description: 'Public finance, national budgets and economic planning for state-sector investment.',
    image: '/images/institutions/finance.jpg',
    website: 'https://www.treasury.gov.lk/',
  },
  {
    category: 'PORTS & AVIATION',
    name: 'Ministry of Ports and Civil Aviation',
    description: 'Policy for ports and aviation, sectors served by marine and aviation fuel operations.',
    image: '/images/institutions/aviation.jpg',
    website: 'https://www.slpa.lk/port-colombo/ministry',
    linkLabel: 'View ministry profile',
  },
  {
    category: 'ROAD INFRASTRUCTURE',
    name: 'Road Development Authority',
    description: 'Development and maintenance of national roads that support transport and fuel logistics.',
    image: '/images/institutions/roads.jpg',
    website: 'https://www.rda.gov.lk/',
  },
  {
    category: 'UPSTREAM PETROLEUM',
    name: 'Petroleum Development Authority of Sri Lanka',
    description: 'PDASL regulates petroleum exploration, development and production in Sri Lanka.',
    image: '/images/institutions/pdasl-hero.jpg',
    website: 'https://pdasl.gov.lk/',
  },
];

function EnergyMinistriesPage() {
  return (
    <section className="energy-institutions-section content-section">
      <div className="container">
        <div className="energy-institutions-intro">
          <p className="eyebrow">PUBLIC INSTITUTIONS</p>
          <h2>Connected across energy and infrastructure</h2>
          <p>Explore the ministries and statutory authorities whose distinct responsibilities connect with Sri Lanka’s energy system, transport network and petroleum resources.</p>
        </div>
        <div className="energy-institutions-grid">
          {energyInstitutions.map((institution) => (
            <a className="energy-institution-card" href={institution.website} target="_blank" rel="noopener noreferrer" key={institution.name}>
              <img src={institution.image} alt="" loading="lazy" decoding="async" />
              <span className="energy-institution-shade" aria-hidden="true" />
              <div className="energy-institution-body">
                <span>{institution.category}</span>
                <h3>{institution.name}</h3>
                <p>{institution.description}</p>
                <span className="energy-institution-arrow" aria-label="Visit official website"><Icon name="arrow" size={21} /></span>
              </div>
            </a>
          ))}
        </div>
        <div className="energy-institutions-context">
          <div>
            <p className="eyebrow">HOW THE ROLES CONNECT</p>
            <h2>From policy to petroleum resources</h2>
            <p>These organisations serve different parts of the national system. Ministries set policy and coordinate sectors. Authorities carry out specialist mandates for roads and upstream petroleum resources.</p>
            <p>PDASL is the independent statutory body under the Ministry of Energy responsible for regulating petroleum exploration, development and production under the Petroleum Resources Act No. 21 of 2021.</p>
            <a href="https://pdasl.gov.lk/" target="_blank" rel="noopener noreferrer">Explore PDASL <Icon name="arrow" size={17} /></a>
          </div>
          <figure>
            <img src="/images/institutions/pdasl-map.jpg" alt="PDASL map of Sri Lanka’s offshore petroleum basins and well locations" loading="lazy" />
            <figcaption>Offshore basin map published by <a href="https://pdasl.gov.lk/" target="_blank" rel="noopener noreferrer">PDASL</a>.</figcaption>
          </figure>
        </div>
        <p className="energy-institutions-note">Card imagery illustrates each sector. The PDASL image and basin map are from its official website; cards link to the institutions’ official sites.</p>
      </div>
    </section>
  );
}

function AdditionalOperationPage({ data }) {
  return (
    <div className={`additional-operation-page additional-operation-page--${data.theme}`}>
      <section className="content-section additional-operation">
        <div className="container additional-operation-intro">
          <div className="additional-operation-copy">
            <p className="eyebrow">{data.eyebrow}</p>
            <h2>{data.heading}</h2>
            <p>{data.copy}</p>
            <a className="text-link" href={`/contact?subject=${encodeURIComponent(data.eyebrow)}`}>
              Make an enquiry <Icon name="arrow" size={17} />
            </a>
          </div>
          <aside className="additional-operation-facts">
            <span>AT A GLANCE</span>
            {data.facts.map((fact, index) => <p key={fact}><small>0{index + 1}</small>{fact}</p>)}
          </aside>
        </div>
      </section>
      <section className="additional-operation-info content-section">
        <div className="container">
          <p className="eyebrow">SERVICE INFORMATION</p>
          <h2>{data.cardsTitle}</h2>
          <div className="additional-operation-points">
            {data.cards.map((card, index) => (
              <article key={card.title}>
                <span>0{index + 1}</span>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="additional-operation-detail content-section">
        <div className="container">
          <div className="additional-operation-section-heading">
            <p className="eyebrow">IN PRACTICE</p>
            <h2>{data.overviewTitle}</h2>
            <p>{data.overview}</p>
          </div>
          <div className="additional-operation-detail-grid">
            {data.detailItems.map((item, index) => (
              <article key={item.title}>
                <span>0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="additional-operation-spec content-section">
        <div className="container additional-operation-spec-grid">
          <div>
            <p className="eyebrow">REFERENCE GUIDE</p>
            <h2>{data.specTitle}</h2>
            <p>{data.specIntro}</p>
          </div>
          <dl>
            {data.specRows.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
        </div>
      </section>
      <section className="additional-operation-faq content-section">
        <div className="container additional-operation-faq-grid">
          <div>
            <p className="eyebrow">HELPFUL ANSWERS</p>
            <h2>Frequently asked questions</h2>
            <p>Essential information to help you plan the next step.</p>
          </div>
          <div>
            {data.faqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}<span aria-hidden="true">+</span></summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="content-section additional-operation-enquiry">
        <div className="container additional-operation-enquiry-grid">
          <div>
            <p className="eyebrow">PLAN YOUR ENQUIRY</p>
            <h2>Start with the right details</h2>
            <p>{data.note}</p>
            <a className="additional-operation-button" href={`/contact?subject=${encodeURIComponent(data.eyebrow)}`}>
              Contact Ceypetco <Icon name="arrow" size={17} />
            </a>
          </div>
          <ol>
            {data.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </div>
        <div className="container additional-operation-source">
          <span>REFERENCE</span>
          <a href={data.source.href} target="_blank" rel="noopener noreferrer">{data.source.label} ↗</a>
        </div>
      </section>
    </div>
  );
}

function DivisionPage({ data }) {
  const details = data.table || data.prices || data.locations || data.products;
  const detailTitle = data.table
    ? 'Process-unit capacity'
    : data.prices
      ? 'Current product prices'
      : data.locations
        ? 'Operating locations'
        : 'Product range';
  return (
    <>
      <section className="division-intro content-section">
        <div className="container division-story">
          <div>
            <p className="eyebrow">{data.kicker}</p>
            <h2>{data.heading}</h2>
            <p>{data.copy}</p>
          </div>
          <div className="division-feature-image">
            <img src={data.image} alt="" />
          </div>
        </div>
      </section>
      <section className="division-stat-band">
        <div className="container">
          {data.stats.map(([value, label]) => (
            <div key={label}>
              <b>{value}</b>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="content-section division-details">
        <div className="container division-detail-grid">
          <div>
            <p className="eyebrow">WHY IT MATTERS</p>
            <h2>Built around quality, reliability and service</h2>
            <ul>
              {data.features.map((item) => (
                <li key={item}>
                  <Icon name="shield" size={19} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="detail-panel">
            <div>
              <p className="eyebrow">AT A GLANCE</p>
              <h3>{detailTitle}</h3>
            </div>
            {details.map(([name, value]) => (
              <div className="detail-row" key={name}>
                <span>{name}</span>
                <b>
                  {value}
                  {data.table ? ' MT/day' : ''}
                </b>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="division-cta">
        <div className="container">
          <div>
            <p className="eyebrow light">NEED MORE INFORMATION?</p>
            <h2>Connect with the right Ceypetco team</h2>
          </div>
          <a href={`/contact?subject=${encodeURIComponent(data.kicker)}`}>
            Contact this division <Icon name="arrow" size={18} />
          </a>
        </div>
      </section>
    </>
  );
}

function RefineryPage() {
  const defaults = {
    kicker: 'REFINERY OPERATIONS & CAPABILITIES',
    heading:
      'We refine with precision and expertise, delivering quality petroleum products that fuel the nation\u2019s growth',
    copy: [
      'Our refinery transforms crude oil into high-quality fuels and products that keep Sri Lanka moving',
      'We combine proven technology with strict safety and quality standards to deliver reliable energy every day',
    ],
    gallery: ['refinery-card-1.jpg', 'refinery-card-2.jpg', 'refinery-card-3.jpg'],
    paragraphs: [
      'The Ceylon Petroleum Corporation was established under Act No. 28 of 1961 and entered the import, distribution and marketing of petroleum products throughout the island. The Sapugaskanda Oil Refinery was commissioned in August 1969 to process 38,000 barrels per stream day\u2014approximately 5,200 metric tonnes per day\u2014of Iranian Light crude oil',
      'Although the crude distiller\u2019s rated capacity was 5,200 MT/day, the unit was capable of processing 5,800 MT/day. Crudes with characteristics similar to Iranian Light, including Upper Zakum and Arabian Light, could be processed while meeting the required specifications',
      'LPG production commenced in 1971, with the Naphtha Merox unit modified to process LPG. Special Boiling Point Solvent production also began using existing facilities. The Crude Distiller was subsequently debottlenecked, increasing refining capacity to 50,000 barrels per stream day\u2014approximately 6,900 MT/day',
      'A new Kerosene Merox unit was commissioned in 1981 to process Jet A-1. The crude distiller was later revamped to process Far Eastern crudes such as Miri Light, while Naphtha Unifiner capacity increased to 1,100 MT/day in 1992. The Platformer was revamped in 1999 to reach 650 MT/day, meet growing gasoline demand and support the phase-out of lead in gasoline',
      'The existing Kerosene Unifiner was converted to process diesel, and the Gas Oil Unifiner was rehabilitated in 2003 to meet a diesel sulphur specification of 0.3% by weight',
      'Small and medium-scale energy-conservation projects have improved operational efficiency. The Utilities section supplies the electricity, water, steam and instrument air required for plant operations. The refinery contains 65 tanks for crude oil, finished products and intermediate products, supported by four additional crude-oil tanks at the Orugodawatta tank farm',
    ],
    keyFacts: [
      'Operated by a 100% Sri Lankan workforce',
      'Provides direct employment for more than 1,100 citizens',
      'Contributes 30\u201335% of CPC\u2019s total sales volume',
      'Reduces foreign-currency outflows through domestic refining',
      'More than five decades of continuous operating experience',
      'Refinery training is recognised by overseas organisations',
    ],
    detailRows: [
      ['Crude distiller', '5,200'],
      ['Naphtha Unifiner', '940'],
      ['Platformer', '285'],
      ['Gas oil Unifiner', '450'],
      ['Visbreaker', '2,000'],
      ['Merox unit', '70'],
      ['Vacuum Unit', '950'],
      ['Bitumen Blowing Unit', '350'],
    ],
  };
  const div = useDivision('refinery', defaults);
  const textValue = (value, fallback) =>
    typeof value === 'string' || typeof value === 'number'
      ? String(value)
      : fallback;
  const stringList = (value, fallback) => {
    if (!Array.isArray(value)) return fallback;
    const items = value
      .filter((item) => typeof item === 'string' || typeof item === 'number')
      .map((item) => String(item).trim())
      .filter(Boolean);
    return items.length ? items : fallback;
  };
  const kicker = textValue(div.kicker, defaults.kicker);
  const heading = textValue(div.heading, defaults.heading);
  const gallery = stringList(div.gallery, defaults.gallery);
  const paragraphs = stringList(div.paragraphs, defaults.paragraphs);
  const importance = stringList(div.keyFacts, defaults.keyFacts);
  const copy = stringList(div.copy, defaults.copy);
  const galleryImage = (img) =>
    !img
      ? ''
      : /^(https?:|data:|blob:)/i.test(img) || img.startsWith('/')
        ? img
        : `/images/${String(img).replace(/^images\//i, '')}`;
  return (
    <>
      <section className="refinery-opening content-section">
        <div className="container refinery-opening-grid">
          <div>
            <p className="eyebrow">{kicker}</p>
            <h2>{heading}</h2>
          </div>
          <div className="refinery-lead">
            <strong>{copy[0]}</strong>
            <p>{copy[1]}</p>
          </div>
        </div>
        <div className="container refinery-photo-strip">
          {[
            'Laboratory quality testing at the refinery',
            'Maintenance work at the refinery',
            'Skilled refinery welding operations',
          ].map((alt, index) => (
            <figure key={gallery[index] || index}>
              {gallery[index] && <img src={galleryImage(gallery[index])} alt={alt} />}
              <span>0{index + 1}</span>
            </figure>
          ))}
        </div>
      </section>
      <section className="refinery-history content-section">
        <div className="container refinery-history-grid">
          <div className="refinery-sticky-title">
            <p className="eyebrow">SAPUGASKANDA REFINERY</p>
            <h2>Advancing Sri Lanka\u2019s refining capability since 1969</h2>
            <div className="refinery-year">
              <b>1969</b>
              <span>
                Commissioned
                <br />
                in August
              </span>
            </div>
          </div>
          <div className="refinery-narrative">
            {paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>
      <section className="refinery-importance">
        <div className="container">
          <div className="refinery-importance-heading">
            <p className="eyebrow light">NATIONAL VALUE</p>
            <h2>Why the refinery matters</h2>
          </div>
          <div className="refinery-importance-grid">
            {importance.map((item, index) => (
              <article key={item}>
                <span>0{index + 1}</span>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="refining-process content-section">
        <div className="container">
          <div className="page-title-row">
            <div>
              <p className="eyebrow">REFINING PROCESS</p>
              <h2>From crude oil to essential products</h2>
              <p className="refining-process-intro">
                Fractional distillation separates crude oil into useful products
                according to boiling point and density—from LPG and petrol to
                diesel, lubricants and bitumen
              </p>
            </div>
          </div>
          <div
            className="refinery-flow"
            role="img"
            aria-label="Animated fractional distillation process showing crude oil separated into LPG, petrol, jet fuel, diesel, lubricants and bitumen"
          >
            <div className="flow-intake">
              <span className="flow-drop" aria-hidden="true" />
              <strong>Crude oil</strong>
              <p>Heated before entering the distillation column</p>
              <div className="intake-line">
                <i />
              </div>
            </div>
            <div className="distillation-column">
              <div className="column-cap">
                <span />
              </div>
              <div className="temperature-scale">
                <span>20°C</span>
                <span>120°C</span>
                <span>250°C</span>
                <span>370°C+</span>
              </div>
              <div className="column-core">
                {Array.from({ length: 7 }).map((_, index) => (
                  <span key={index} style={{ '--tray': index }} />
                ))}
                <i className="process-vapour vapour-one" />
                <i className="process-vapour vapour-two" />
                <i className="process-vapour vapour-three" />
              </div>
              <div className="column-label">
                <small>FRACTIONATION</small>
                <b>Distillation column</b>
              </div>
            </div>
            <div className="product-streams">
              {[
                ['01', 'LPG', 'Light gases', '20°C'],
                ['02', 'Petrol', 'Motor gasoline', '70°C'],
                ['03', 'Jet fuel', 'Kerosene fraction', '170°C'],
                ['04', 'Diesel', 'Transport fuel', '270°C'],
                ['05', 'Lubricants', 'Oils & waxes', '350°C'],
                ['06', 'Bitumen', 'Heavy residue', '370°C+'],
              ].map(([number, name, use, temperature], index) => (
                <article
                  className="product-stream"
                  style={{ '--stream': index }}
                  key={name}
                >
                  <div className="stream-pipe">
                    <i />
                  </div>
                  <span>{number}</span>
                  <div>
                    <strong>{name}</strong>
                    <small>{use}</small>
                  </div>
                  <b>{temperature}</b>
                </article>
              ))}
            </div>
            <div className="process-legend">
              <span>Lower boiling point</span>
              <i />
              <span>Higher boiling point & density</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function FuelPriceCards({ products, category }) {
  return (
    <div className="fuel-price-grid">
      {products.map(([name, price, date], index) => (
        <article className="fuel-price-card" key={name}>
          <div className="price-card-top">
            <span>{category}</span>
            <small>{String(index + 1).padStart(2, '0')}</small>
          </div>
          <h3>{name}</h3>
          <div className="price-value">
            <span>Rs</span>
            <b>{price}</b>
            <small>per litre</small>
          </div>
          <div className="price-effective">
            <Icon name="clock" size={15} />
            <span>
              Effective from <b>{date}</b>
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

function MarketingSalesPage() {
  const [fuelPrices, setFuelPrices] = useState([]);
  const [fuelPricesLoading, setFuelPricesLoading] = useState(true);

  const div = useDivision('marketing-sales', {
    kicker: 'MARKETING & SALES',
    heading: 'Serving every fuel need through an islandwide dealer network',
    copy: [
      'Following the incorporation of CPC under the Act of Parliament in 1961, marketing operations commenced on 28 April 1962. Today, Ceypetco serves Sri Lanka\u2019s fuel requirements through approximately 850 dealers',
      'Outstation spot prices incorporate the applicable transport differential',
    ],
    stats: [
      { value: '1962', label: 'Marketing operations commenced' },
      { value: '850', label: 'Dealers serving Sri Lanka' },
      { value: 'Islandwide', label: 'Retail and commercial fuel access' },
    ],
  });
  const stats = div.stats || [];
  const copy = div.copy || [];

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setFuelPricesLoading(true);
      try {
        const res = await api.get('/admin/fuel-prices/active', {
          params: { limit: 100 },
        });
        if (!cancelled)
          setFuelPrices(res.data && res.data.data ? res.data.data : []);
      } catch (err) {
        if (!cancelled) setFuelPrices([]);
      } finally {
        if (!cancelled) setFuelPricesLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryOrder = [
    'White Oil',
    'Lubricants',
    'Aviation Fuel',
  ];
  const grouped = categoryOrder
    .map((category) => ({
      category,
      products: fuelPrices
        .filter((p) => p.category === category)
        .map((p) => [
          p.product,
          (p.price ?? 0).toFixed(2),
          p.effectiveDate
            ? new Date(p.effectiveDate)
              .toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
              .replace(/\//g, '-')
            : '',
        ]),
    }))
    .filter((g) => g.products.length > 0);

  return (
    <>
      <section className="marketing-intro content-section">
        <div className="container marketing-intro-grid">
          <div>
            <p className="eyebrow">{div.kicker}</p>
            <h2>{div.heading}</h2>
          </div>
          <div>
            <p>{copy[0]}</p>
            <p>{copy[1]}</p>
          </div>
        </div>
        <div className="container marketing-stats">
          {stats.map((stat) => (
            <div key={stat.label}>
              <b>{stat.value}</b>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="fuel-pricing content-section">
        <div className="container">
          <div className="pricing-heading">
            <div>
              <p className="eyebrow">FUEL PRICING</p>
              <h2>Current market rates</h2>
              <p>
                Current rates for Ceylon Petroleum Corporation fuel products
              </p>
            </div>
            <div className="pricing-status">
              <span></span>
              <div>
                <b>Current pricing</b>
                <small>Rates supplied for June 2026</small>
              </div>
            </div>
          </div>
          {fuelPricesLoading ? (
            <div className="price-category">
              <div className="price-category-title">
                <div>
                  <p className="eyebrow">PRODUCT CATEGORY</p>
                  <h3>Loading prices...</h3>
                </div>
              </div>
            </div>
          ) : grouped.length === 0 ? (
            <div className="price-category">
              <div className="price-category-title">
                <div>
                  <p className="eyebrow">PRODUCT CATEGORY</p>
                  <h3>No prices published</h3>
                </div>
              </div>
            </div>
          ) : (
            grouped.map((g, i) => (
              <div
                className="price-category"
                key={g.category}
              >
                <div className="price-category-title">
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <p className="eyebrow">PRODUCT CATEGORY</p>
                    <h3>{g.category}</h3>
                  </div>
                </div>
                <FuelPriceCards products={g.products} category={g.category} />
              </div>
            ))
          )}
          <div className="pricing-note">
            <Icon name="building" size={22} />
            <div>
              <b>Outstation pricing</b>
              <p>{copy[1]}</p>
            </div>
          </div>
          <a className="hp-marketing-link" href="/marketing-sales/historical-prices">
            <span>
              <small>EXPLORE THE ARCHIVE</small>
              <b>Historical Fuel Prices</b>
              <span>Browse published prices and bitumen revisions dating back to 1990.</span>
            </span>
            <Icon name="arrow" size={22} />
          </a>
        </div>
      </section>
    </>
  );
}

function AviationPage() {
  const div = useDivision('aviation', {
    kicker: 'OUR AIM',
    heading: 'Quality fuel. The right aircraft. The right time',
    mission: {
      heading: 'Our Vision',
      text: 'To be the region\u2019s leading service-oriented, customer-focused and environmentally responsible aviation fuel supplier',
    },
    copy: [
      'Ceypetco Aviation provides round-the-clock refuelling at Bandaranaike International Airport and Mattala Rajapaksa International Airport, together with daytime service for domestic flights, corporate and executive jets, and nominated aircraft at Colombo Airport, Ratmalana',
      'Clean, dry aviation fuel and rigorous contamination control are essential to aircraft safety, engine life and maintenance performance. Ceypetco applies international-quality handling standards throughout its into-plane operation',
    ],
    stats: [
      { value: '24/7', label: 'International airport refuelling' },
      { value: '1.3M L', label: 'Current daily demand' },
      { value: '04', label: 'Operating locations' },
      { value: 'Sole', label: 'Into-plane operator in Sri Lanka' },
    ],
    gallery: [1, 2, 3, 4, 5, 6].map(
      (n) =>
        `/images/aviation-gallery-${n}.jpg`,
    ),
    locations: [
      {
        name: 'Katunayake',
        code: 'BIA · CMB / VCBI',
        service: 'Hydrant and refueller · over-wing / under-wing',
        capacity: 'Three JET A-1 tanks · 2.6 million litres each',
        avgas: '200-litre sealed drums',
        contacts: [
          { role: 'Deputy Manager · Aviation Operations', phone: '+94 11 2253039', email: 'manjular@ceypetco.gov.lk' },
          { role: 'Operations Department', phone: '+94 11 5756955', email: 'avi.opsbia@ceypetco.gov.lk' },
        ],
      },
      {
        name: 'Mattala',
        code: 'MRIA · HRI / VCRI',
        service: 'Hydrant and refueller · over-wing / under-wing',
        capacity: 'Three JET A-1 tanks · 1.0 million litres each',
        avgas: '200-litre sealed drums',
        contacts: [
          { role: 'Assistant Manager · Aviation Operations', phone: '+94 47 2031946', email: '' },
          {
            role: 'Operations Department',
            phone: '+94 47 5678343 · +94 47 2031945 · +94 47 2031947',
            email: 'mria.ops@ceypetco.gov.lk',
          },
        ],
      },
      {
        name: 'Ratmalana',
        code: 'RML / VCCC',
        service: 'Daytime refueller service · over-wing / under-wing',
        capacity: 'Five JET A-1 tanks · 280,000 litres total',
        avgas: '200-litre sealed drums',
        contacts: [
          { role: 'Shift Superintendent', phone: '+94 11 2637755 · +94 11 5664707', email: 'cpcavirat@ceypetco.gov.lk' },
          { role: 'Commercial Manager', phone: '+94 11 5455115 · +94 76 3842287', email: 'mria.cm@ceypetco.gov.lk' },
          { role: 'Accountant · Aviation', phone: '+94 11 5455191', email: 'acc.aviation@ceypetco.gov.lk' },
        ],
      },
      {
        name: 'Palali',
        code: 'Jaffna International Airport · JAF / VCCJ',
        service: 'JET A-1 aviation fuel supply',
        capacity: '',
        avgas: '',
        contacts: [
          { role: 'Ceypetco Aviation · general enquiries', phone: '+94 11 2253039', email: '' },
        ],
      },
    ],
  });
  const defaultPrices = [
    { customer: 'Spot / One-Time Customer', location: 'CMB & RML', price: '3.53' },
    { customer: 'Spot / One-Time Customer', location: 'HRI', price: '3.51' },
    { customer: 'Spot / One-Time Customer', location: 'JAF', price: '3.64' },
  ];
  const [prices, setPrices] = useState(defaultPrices);
  const [pricesEffectiveDate, setPricesEffectiveDate] = useState('01 August 2026');
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await api.get('/admin/aviation-prices/active', {
          params: { limit: 100 },
        });
        if (!cancelled && res.data?.data?.length) {
          const rows = res.data.data.map((p) => ({
            customer: p.customer || '',
            location: p.location || '',
            price: p.price != null ? String(p.price) : '',
          }));
          setPrices(rows);
          const eff = res.data.data.find((p) => p.effectiveDate);
          if (eff?.effectiveDate) {
            try {
              const d = new Date(eff.effectiveDate);
              setPricesEffectiveDate(d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }));
            } catch (e) { }
          }
        }
      } catch (err) { }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);
  const palaliLocation = {
    name: 'Palali',
    code: 'Jaffna International Airport · JAF / VCCJ',
    service: 'JET A-1 aviation fuel supply',
    capacity: '',
    avgas: '',
    contacts: [{ role: 'Ceypetco Aviation · general enquiries', phone: '+94 11 2253039', email: '' }],
  };
  const configuredLocations = div.locations || [];
  const allLocations = configuredLocations.some((loc) => /palali|palaly|jaffna/i.test(loc.name || ''))
    ? configuredLocations
    : [...configuredLocations, palaliLocation];
  const locations = allLocations.map((loc) => ({
    ...loc,
    contacts: (loc.contacts || []).map((c) => (Array.isArray(c) ? c : [c.role, c.phone, c.email])),
  }));
  const vision = (div.vision && div.vision.text) || div.mission.text;
  const copy = div.copy || [];
  const stats = div.stats || [];
  const gallery = div.gallery || [];
  const galleryImage = (img) =>
    !img
      ? ''
      : /^(https?:|data:|blob:)/i.test(img) || img.startsWith('/')
        ? img
        : `/images/${String(img).replace(/^images\//i, '')}`;
  return (
    <>
      <section className="aviation-opening content-section">
        <div className="container aviation-opening-grid">
          <div>
            <p className="eyebrow">{div.kicker}</p>
            <h2>{div.heading}</h2>
            <blockquote>{vision}</blockquote>
          </div>
          <div>
            <p>{copy[0]}</p>
            <p>{copy[1]}</p>
          </div>
        </div>
        <div className="container aviation-stats">
          {stats.map((stat) => (
            <div key={stat.label}>
              <b>{stat.label === 'Operating locations' ? String(locations.length).padStart(2, '0') : stat.value}</b>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="aviation-price-section content-section">
        <div className="container">
          <div className="aviation-price-heading">
            <div>
              <p className="eyebrow">AVIATION FUEL PRICING</p>
              <h2>Contract customer rates</h2>
              <p>
                Effective {pricesEffectiveDate} · Prices shown in US dollars per US
                gallon
              </p>
            </div>
            <div className="aviation-price-unit">
              <b>US$/USG</b>
              <span>Published pricing unit</span>
            </div>
          </div>
          <div className="aviation-price-table">
            <div className="aviation-price-head">
              <span>Customer category</span>
              <span>Location</span>
              <span>Revised price</span>
            </div>
            {prices.map((price, index) => (
              <article key={`${price.customer}-${price.location}`}>
                <small>{String(index + 1).padStart(2, '0')}</small>
                <strong>{price.customer}</strong>
                <span>{price.location}</span>
                <b>${price.price}</b>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="aviation-fuel content-section">
        <div className="container">
          <div className="page-title-row">
            <div>
              <p className="eyebrow">FUEL & QUALITY</p>
              <h2>International specifications at every location</h2>
            </div>
            <p>
              JET A-1 is supplied across Ceypetco aviation locations. Confirm
              Aviation Gasoline 100LL availability before your flight.
            </p>
          </div>
          <div className="aviation-fuel-grid">
            <article>
              <span>01</span>
              <h3>JET A-1</h3>
              <p>
                Produced and supplied to the latest Aviation Fuel Quality
                Requirements for Jointly Operated Systems (AFQRJOS),
                incorporating DEF STAN 91-91 for turbine fuel, kerosene type JET
                A-1, NATO Code F-35 and ASTM D1655.
              </p>
              <small>Readily available</small>
            </article>
            <article>
              <span>02</span>
              <h3>Aviation Gasoline 100LL</h3>
              <p>
                Supplied to the latest British Ministry of Defence DEF STAN
                91-90 specification and made available in sealed 200-litre drums
                with prior notice
              </p>
              <small>Available on prior notice</small>
            </article>
            <article className="aviation-provider">
              <p className="eyebrow light">TECHNICAL SERVICE PROVIDER</p>
              <h3>PETRONAS Aviation</h3>
              <p>
                Supporting Ceypetco Aviation’s commitment to specialist
                handling, operational quality and international service
                standards
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="aviation-gallery-section">
        <div className="container">
          <div className="page-title-row">
            <div>
              <p className="eyebrow">OPERATIONS GALLERY</p>
              <h2>Aviation fuel in action</h2>
            </div>
          </div>
          <div className="aviation-gallery">
            {gallery.map((image, index) => (
              <figure
                className={index === 0 || index === 3 ? 'wide' : ''}
                key={image || index}
              >
                <img
                  src={galleryImage(image)}
                  alt={`Ceypetco aviation fuel operation ${index + 1}`}
                />
                <figcaption>
                  Operation {String(index + 1).padStart(2, '0')}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
      <section className="aviation-payment">
        <div className="container aviation-payment-grid">
          <div>
            <p className="eyebrow light">PAYMENT SCHEMES</p>
            <h2>Flexible arrangements for aviation customers</h2>
            <p>
              Contract customers are served through arrangements with the
              Ceypetco Commercial Manager. International credit cards, cash in
              USD, Air BP cards and UVair are accepted according to the
              applicable customer arrangement
            </p>
            <small>
              Customers should maintain a backup payment or third-party fuelling
              nomination and contact operations in advance to prevent
              last-minute disruption
            </small>
          </div>
          <div className="aviation-payment-contact">
            <span>COMMERCIAL & PAYMENT SUPPORT</span>
            <a href="tel:+94112253039">+94 11 2253039</a>
            <a href="tel:+94771066764">+94 77 1066764</a>
            <p>Fax · +94 11 2252331</p>
          </div>
        </div>
      </section>
      <section className="aviation-locations content-section">
        <div className="container">
          <div className="page-title-row">
            <div>
              <p className="eyebrow">OPERATING LOCATIONS</p>
              <h2>Airport services and contacts</h2>
            </div>
          </div>
          <div className="aviation-location-grid">
            {locations.map((location, index) => (
              <article key={location.name}>
                <div className="aviation-location-title">
                  <span>0{index + 1}</span>
                  <div>
                    <h3>{location.name}</h3>
                    <small>{location.code}</small>
                  </div>
                </div>
                <dl>
                  <div>
                    <dt>Service</dt>
                    <dd>{location.service}</dd>
                  </div>
                  {location.capacity && <div>
                    <dt>JET A-1 Storage</dt>
                    <dd>{location.capacity}</dd>
                  </div>}
                  {location.avgas && <div>
                    <dt>AV GAS</dt>
                    <dd>{location.avgas}</dd>
                  </div>}
                </dl>
                <div className="aviation-contact-list">
                  {location.contacts.map(([role, phone, email]) => (
                    <div key={role}>
                      <b>{role}</b>
                      <a
                        href={`tel:${phone.split('·')[0].replaceAll(' ', '')}`}
                      >
                        {phone}
                      </a>
                      {email && <a href={`mailto:${email}`}>{email}</a>}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function AgroChemicalsPage() {
  const div = useDivision('agro-chemicals', {
    kicker: 'CEYPETCO AGROCHEMICALS',
    heading: 'More than 50 years supporting Sri Lanka\u2019s farming communities',
    copy: [
      'Ceylon Petroleum Corporation established its Agrochemicals Function in 1969. As a strategic business unit within the Marketing Function, it has served the national agrochemicals market for more than five decades',
      'Ceypetco Agrochemicals is the only government-sector organisation engaged in the agrochemicals business among Sri Lanka\u2019s marketing companies, helping maintain product quality, access and reasonable market pricing',
    ],
    image:
      '/images/agro-products.jpg',
    gallery: [
      '/images/agro-production-1.webp',
      '/images/agro-production-2.webp',
    ],
    certs: [
      { standard: 'ISO 9001:2015', label: 'Quality Management System' },
      { standard: 'ISO 14001:2015', label: 'Environmental Management System' },
      {
        standard: 'OHSAS 18001:2007',
        label: 'Employee Health & Safety · qualified since 2019',
      },
    ],
    paragraphs: [
      'Ceypetco Agrochemicals provides solutions from land and bed preparation through harvest by controlling or eradicating pests, fungi and weeds. The range includes insecticides, fungicides and weedicides for diverse cultivation requirements',
      'Our primary goal is to strengthen a marketing strategy based on consistently high quality, reasonable prices and dependable on-time delivery. Professionally qualified field officers located around the island work directly with farming communities',
      'Since December 2018, restricted Ceypetco Glyphosate has been distributed to approved planters at reasonable prices, supporting efforts to reduce production costs in the tea and rubber plantation sectors',
      'Ceypetco imports quality agrochemicals, formulates, repacks, stores and markets them while working closely with the Registrar of Pesticides, Department of Agriculture, agrarian service centres, farmer organisations and other agricultural institutions to promote safe use',
    ],
    keyFacts: [
      'Automated production equipment supports defect-free output and strengthens the competitiveness of the Ceypetco range. The organisation continues to preserve farmer confidence by providing current guidance to sellers, farmer organisations, agrarian service centres and intermediaries',
      'Ceypetco maintains health-care facilities, HSE practices and a supportive working environment for agrochemical staff, helping the strategic business unit fulfil its national responsibilities and sustain goodwill across farming communities',
    ],
    productGroups: [
      { group: 'Insecticides', products: ['Profenophos 50% EC', 'B.P.M.C. 50% EC', 'Fipronil 0.3% G', 'Fipronil 50g/l SC', 'Imidacloprid 200g/l SC'] },
      { group: 'Weedicides', products: ['Diuron 80% WP', 'Pretilachlor 30% EC', 'Glyphosate 36% SL · Restricted'] },
      { group: 'Fungicides', products: ['Tebuconazole 25% EW', 'Mancozeb 80% WP', 'Captan 50% WP', 'Sulphur 80% WG'] },
      { group: 'Bio-Insecticides', products: ['Flipper'] },
    ],
  });
  const rawGroups = div.productGroups || [];
  const productGroups = rawGroups.map((g) =>
    Array.isArray(g) ? g : [g.group, g.products || []],
  );
  const certs = div.certs || [];
  const paragraphs = div.paragraphs || [];
  const keyFacts = div.keyFacts || [];
  const copy = div.copy || [];
  const gallery = div.gallery || [];
  const openingImages = [
    { src: gallery[0], alt: 'Ceypetco agrochemical production team member wearing protective equipment', caption: 'Safe production' },
    { src: gallery[1], alt: 'Ceypetco agrochemical automated production facility', caption: 'Quality controlled' },
  ];
  const image = div.image;
  const imageSrc = (img) =>
    !img
      ? ''
      : /^(https?:|data:|blob:)/i.test(img) || img.startsWith('/')
        ? img
        : `/images/${String(img).replace(/^images\//i, '')}`;
  return (
    <>
      <section className="agro-opening content-section">
        <div className="container agro-opening-grid">
          <div>
            <p className="eyebrow">{div.kicker}</p>
            <h2>{div.heading}</h2>
            <p>{copy[0]}</p>
            <p>{copy[1]}</p>
          </div>
          <div className="agro-opening-images">
            {openingImages
              .filter((figure) => figure.src)
              .map((figure) => (
                <figure key={figure.caption}>
                  <img src={imageSrc(figure.src)} alt={figure.alt} />
                  <span>{figure.caption}</span>
                </figure>
              ))}
          </div>
        </div>
      </section>
      <section className="agro-standards">
        <div className="container">
          <div className="agro-standards-heading">
            <p className="eyebrow light">CERTIFIED SYSTEMS</p>
            <h2>Quality, environment and occupational safety</h2>
            <p>
              Experienced staff maintain the product range under guidance from
              the Sri Lanka Standards Institution
            </p>
          </div>
          <div className="agro-cert-grid">
            {certs.map((cert, index) => (
              <article key={cert.standard}>
                <span>0{index + 1}</span>
                <h3>{cert.standard}</h3>
                <p>{cert.label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="agro-role content-section">
        <div className="container agro-role-grid">
          <div>
            <p className="eyebrow">FROM PREPARATION TO HARVEST</p>
            <h2>
              Practical crop-protection solutions across the cultivation cycle
            </h2>
            {image && (
              <img
                src={imageSrc(image)}
                alt="Safe application of crop-protection products in farmland"
              />
            )}
          </div>
          <div className="agro-role-copy">
            {paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>
      <section className="agro-flipper">
        <div className="container agro-flipper-grid">
          <div className="flipper-left-panel">
            <div className="flipper-left-text">
              <span>BIO-INSECTICIDE</span>
              <h2>Flipper</h2>
              <p>
                A contact crop-protection option based on potassium salts of fatty
                acids, developed to help manage soft-bodied pests.
              </p>
              <a
                href="/documents/agro/Flipper.pdf"
                target="_blank"
                rel="noreferrer"
              >
                Read the Flipper product leaflet{' '}
                <Icon name="download" size={18} />
              </a>
            </div>
            <div className="flipper-left-bottle">
              <img
                src="/images/flipper-bottle-transparent.png"
                alt="Ceypetco Agro Flipper Bio-Insecticide bottle"
              />
            </div>
          </div>
          <div className="flipper-right-panel">
            <div className="flipper-right-text">
              <p className="eyebrow light">CROP PROTECTION</p>
              <h3>More choice for responsible pest management</h3>
              <p>
                Flipper adds a bio-insecticide to the Ceypetco Agro range,
                complementing its insecticide, fungicide and weed-control products.
                It acts through direct contact with target pests.
              </p>
              <p>
                The product leaflet identifies aphids and whiteflies among its
                targets. Check the leaflet for approved crops, application rates
                and safe-use instructions before use.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="agro-products-section content-section">
        <div className="container">
          <div className="page-title-row">
            <div>
              <p className="eyebrow">PRODUCT RANGE</p>
              <h2>Solutions for healthier cultivation</h2>
            </div>
            <p>
              Ceypetco agrochemical products are available across the Sri Lankan
              market at reasonable prices
            </p>
          </div>
          <div className="agro-product-grid">
            {productGroups.map(([group, products], index) => (
              <article key={group}>
                <div>
                  <span>0{index + 1}</span>
                  <h3>{group}</h3>
                </div>
                <ul>
                  {products.map((product) => (
                    <li key={product}>{product}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="agro-strategy content-section">
        <div className="container agro-strategy-grid">
          <div>
            <p className="eyebrow">OUR BUSINESS STRATEGY</p>
            <h2>
              Quality products, reasonable pricing and delivery when farmers
              need it
            </h2>
          </div>
          <div>
            {keyFacts.map((fact) => (
              <p key={fact.slice(0, 40)}>{fact}</p>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const oilTypes = [
  ['Brake Fluid', '#ff0000'],
  ['Specialty Oil', '#ffd400'],
  ['Transformer Oil', '#8a8a8a'],
  ['Industrial Oil', '#11bde3'],
  ['Tractor Fluid', '#f5f4c7'],
  ['Transmission Fluid', '#f5a7b7'],
  ['Gear Oil', '#8c0046'],
  ['Marine Engine Oil', '#08678a'],
  ['Gas Fuel Engine Oil', '#99470f'],
  ['Two Stroke Engine Oil', '#9cff20'],
  ['Four Stroke Engine Oil', '#008000'],
  ['Diesel Engine Oil', '#1000ee'],
  ['Petrol Engine Oil', '#ffa300'],
  ['Greases', '#70451f'],
];

function OilTypesChart() {
  return (
    <section className="oil-types-section content-section">
      <div className="container oil-types-layout">
        <div className="oil-types-copy">
          <p className="eyebrow">PRODUCT COVERAGE</p>
          <h2>Oil types distribution</h2>
          <p>
            A broad lubricant portfolio developed for mobility, industry,
            agriculture, marine operations and specialist applications
          </p>
          <div className="oil-types-legend">
            {oilTypes.map(([name, color], index) => (
              <div
                style={{
                  '--oil-color': color,
                  '--oil-delay': `${index * 45}ms`,
                }}
                key={name}
              >
                <i></i>
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="oil-chart-wrap">
          <div
            className="oil-chart"
            aria-label="Circular chart showing fourteen Ceypetco lubricant categories"
          >
            <div className="oil-chart-centre">
              <b>14</b>
              <span>
                Lubricant
                <br />
                categories
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LubricantsPage() {
  const div = useDivision('lubricants', {
    kicker: 'THE BEST FROM THE BEST',
    heading:
      'Internationally aligned protection for automotive and industrial performance',
    copy: [
      'All Ceypetco lubricating oils are blended in a plant certified to ISO 9001/2000. The Ceypetco lubricant range covers products developed to meet relevant international specifications from the American Petroleum Institute (API), MTU Friedrichshafen GmbH and the European Automobile Manufacturers\u2019 Association (ACEA)',
      'Our products serve demanding automotive and industrial applications with a focus on quality, consistency and dependable protection',
    ],
    image:
      '/images/lubricants-hero.jpg',
    standards: ['API', 'ACEA', 'MTU', 'ISO'],
    mission: {
      heading:
        'Deliver quality products and total solutions through professional expertise, technology and innovation',
      text: 'To achieve excellence in petroleum refining, sales and marketing while meeting stakeholder expectations through a dedicated team, an efficient dealer network, high ethical standards and the highest concern for health, safety and the environment',
    },
    vision: {
      heading: 'A premier, customer-driven and environmentally responsible petroleum enterprise',
      text: 'To lead petroleum and related industries in the region while contributing meaningfully to the prosperity of Sri Lanka',
    },
  });
  const [query, setQuery] = useState('');
  const filtered = lubricantProducts.filter(({ name }) =>
    name.toLowerCase().includes(query.toLowerCase()),
  );
  const copy = div.copy || [];
  const standards = div.standards || [];
  const legacyLubricantImage = '/images/lubricants-hero.jpg';
  const heroImage = !div.image || div.image === legacyLubricantImage || div.image === 'lubricants-hero.jpg'
    ? '/images/lubricant-intro-generated.webp'
    : div.image.startsWith('http') || div.image.startsWith('/')
      ? div.image
      : `/images/${div.image}`;
  return (
    <>
      <section className="lubricant-intro content-section">
        <div className="container lubricant-intro-grid">
          <div className="lubricant-image">
            <img src={heroImage} alt="Amber lubricating oil being poured into an engine" />
            <span>
              ISO
              <br />
              <b>9001</b>
            </span>
          </div>
          <div>
            <p className="eyebrow">{div.kicker}</p>
            <h2>{div.heading}</h2>
            <p>{copy[0]}</p>
            <p>{copy[1]}</p>
            <div className="lubricant-standards">
              {standards.map((standard) => (
                <span key={standard}>{standard}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="lubricant-purpose">
        <div className="container lubricant-purpose-grid">
          <article>
            <span>01</span>
            <p className="eyebrow">OUR MISSION</p>
            <h3>{div.mission.heading}</h3>
            <p>{div.mission.text}</p>
          </article>
          <article>
            <span>02</span>
            <p className="eyebrow">OUR VISION</p>
            <h3>{div.vision.heading}</h3>
            <p>{div.vision.text}</p>
          </article>
        </div>
      </section>
      <OilTypesChart />
      <section className="lubricant-products content-section">
        <div className="container">
          <div className="lubricant-products-heading">
            <div>
              <p className="eyebrow">PRODUCT INDEX</p>
              <h2>Technical product documents</h2>
              <p>
                Access locally stored product information and material safety
                datasheets
              </p>
            </div>
            <label>
              <span>Search product</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search lubricant products..."
              />
            </label>
          </div>
          <div className="lubricant-table">
            <div className="lubricant-table-head">
              <span>Product name</span>
              <span>Product information</span>
              <span>Safety datasheet</span>
            </div>
            {filtered.map((product, index) => (
              <article key={product.name}>
                <div>
                  <small>{String(index + 1).padStart(2, '0')}</small>
                  <b>{product.name}</b>
                </div>
                <div>
                  {product.tds ? (
                    <a href={product.tds} target="_blank" rel="noreferrer">
                      TDS PDF <Icon name="download" size={16} />
                    </a>
                  ) : (
                    <span>Not available</span>
                  )}
                </div>
                <div>
                  {product.msds ? (
                    <a href={product.msds} target="_blank" rel="noreferrer">
                      MSDS PDF <Icon name="download" size={16} />
                    </a>
                  ) : (
                    <span>Not available</span>
                  )}
                </div>
              </article>
            ))}
            {filtered.length === 0 && (
              <div className="no-lubricants">
                <h3>No matching products</h3>
                <p>Try a different product name or specification</p>
              </div>
            )}
          </div>
          <div className="lubricant-table-footer">
            <span>
              Showing {filtered.length} of {lubricantProducts.length} products
            </span>
            <span>Documents open from this website</span>
          </div>
        </div>
      </section>
    </>
  );
}

const defaultRegionalOffices = [
  [
    'West',
    'Dematagoda',
    'Mr. M C Mendis',
    'Acting Regional Manager',
    '+94 11 729 6457',
    'ro.west@ceypetco.gov.lk',
  ],
  [
    'Sabaragamuwa',
    'Kegalle',
    'K A N D Chandrasena',
    'Acting Regional Manager',
    '+94 35 313 5732',
    'ro.sabaragamuwa@ceypetco.gov.lk',
  ],
  [
    'South',
    'Galle',
    'Mr. D C Edirisinghe',
    'Regional Manager',
    '+94 91 223 4523',
    'ro.south@ceypetco.gov.lk',
  ],
  [
    'Uva',
    'Badulla',
    '',
    'Acting Regional Manager',
    '+94 55 223 1979',
    'ro.uwa@ceypetco.gov.lk',
  ],
  [
    'North Central',
    'Anuradhapura',
    '',
    'Regional Manager',
    '+94 25 222 2374',
    'ro.nc@ceypetco.gov.lk',
  ],
  [
    'North',
    'Jaffna',
    'Mr. S Sivatharan',
    'Regional Manager',
    '+94 21 222 2033',
    'ro.north@ceypetco.gov.lk',
  ],
  [
    'Central',
    'Kandy',
    'Mr. B R M S B Ratnayake',
    'Acting Regional Manager',
    '+94 81 238 8674',
    'ro.central@ceypetco.gov.lk',
  ],
  [
    'North West',
    'Kurunegala',
    'Mr. A G J W Bandara',
    'Regional Manager',
    '+94 37 222 2517',
    'ro.nw@ceypetco.gov.lk',
  ],
  [
    'East',
    'Batticaloa',
    '',
    'Regional Manager',
    '+94 65 222 4429',
    'ro.east@ceypetco.gov.lk',
  ],
];

const bulkConsumerSteps = [
  'Download and submit the duly completed CPC application form',
  'Submit every supporting document listed in the Documents Required guide',
  'A CPC officer will visit the location and certify the premises',
  'CPC will create an account number and issue mobile-app credentials',
  'Sign the Bulk Consumer Agreement and submit the required bank guarantee',
  'Install the fuel-ordering application on an Android mobile device',
  'Pay for monthly fuel requirements through the available online platforms',
  'Place fuel orders using the registered mobile application',
];

const bulkConsumerRegions = [
  [
    'Western Province',
    'Colombo · Kalutara · Gampaha',
    'Mr. Chaminda Mendis',
    '0777768546',
  ],
  [
    'Northern Province',
    'Jaffna · Mullaitivu · Kilinochchi · Mannar · Vavuniya',
    'Mr. Sivadaran',
    '0775023457',
  ],
  [
    'North Western Province',
    'Kurunegala · Puttalam',
    'Mr. Bandara',
    '0713473103',
  ],
  [
    'North Central Province',
    'Anuradhapura · Polonnaruwa',
    'Mr. Pethiyagoda',
    '0714395411',
  ],
  [
    'Central Province',
    'Kandy · Nuwara Eliya · Matale',
    'Mr. Rathnayake',
    '0714440471',
  ],
  [
    'Eastern Province',
    'Batticaloa · Trincomalee · Ampara',
    'Mr. Devapriya',
    '0777566455',
  ],
  ['Uva Province', 'Badulla · Monaragala', 'Mr. Wimalasiri', '0774101377'],
  [
    'Southern Province',
    'Galle · Hambantota · Matara',
    'Mr. Chandimal',
    '0777440062',
  ],
];

const bulkConsumerResources = [
  [
    'Application Form',
    'https://ceypetco.gov.lk/wp-content/uploads/2026/04/Consumer-Registration-Application.pdf',
  ],
  [
    'Documents Required',
    'https://ceypetco.gov.lk/wp-content/uploads/2026/04/Documents-Required.pdf',
  ],
  [
    'Bulk Consumer Agreement',
    'https://ceypetco.gov.lk/wp-content/uploads/2026/04/Agreement-for-Bulk-Consumers-Private-Company.pdf',
  ],
  [
    'Bank Guarantee Format',
    'https://ceypetco.gov.lk/wp-content/uploads/2026/04/Guarantee-Format.pdf',
  ],
  ['Fuel Ordering Mobile App', 'https://fuelup.cpstl.lk/apk/'],
];

function InnerPage({ type, preserveTemplate, managedSections }) {
  const { t } = useLanguage();
  const aboutVideoRef = useRef(null);
  const [aboutVideoPlaying, setAboutVideoPlaying] = useState(false);
  const [historyPage, setHistoryPage] = useState(defaultHistoryPage);
  const page = type === '/history'
    ? { label: historyPage.heroLabel, title: historyPage.heroTitle, intro: historyPage.heroIntro, image: historyPage.heroImage }
    : pageData[type === '/electric-mobility' ? '/ev-charging' : type] || pageData['/about'];
  useEffect(() => {
    if (type !== '/history') return undefined;
    let cancelled = false;
    api.get('/admin/history-page').then((res) => {
      if (!cancelled && res.data?.data) setHistoryPage(res.data.data);
    }).catch(() => { });
    return () => { cancelled = true; };
  }, [type]);
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [tenders, setTenders] = useState([]);
  const [tendersLoading, setTendersLoading] = useState(true);
  const [downloadTender, setDownloadTender] = useState(null);
  const [notices, setNotices] = useState([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [supplierResources, setSupplierResources] = useState([]);
  const [supplierSection, setSupplierSection] = useState(null);
  const [careers, setCareers] = useState([]);
  const [careersLoading, setCareersLoading] = useState(true);
  const [annualReports, setAnnualReports] = useState([]);
  const [annualReportsLoading, setAnnualReportsLoading] = useState(true);
  const [regionalOffices, setRegionalOffices] = useState(null);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const serviceItems = [
    {
      title: 'New Dealership Registration',
      category: 'Business Services',
      text: 'Start an application to join Ceypetco’s islandwide retail network',
      image: 'media-3.jpg',
      href: '/contact?subject=New%20Dealership%20Registration&from=services',
    },
    {
      title: 'Regional Offices',
      category: 'Islandwide Support',
      text: 'Find regional contacts serving communities and dealers across Sri Lanka',
      image: 'head-office.webp',
      href: '/regional-offices?from=services',
    },
    {
      title: 'Fuel Station Services',
      category: 'Digital Services',
      text: 'Access information and support for Ceypetco fuel station operations',
      image: 'distribution.jpg',
      href: '/#fuel-network',
    },
    {
      title: 'Product Specifications',
      category: 'Technical Information',
      text: 'Review quality and technical information for marketed petroleum products',
      image: 'media-1.jpg',
      href: 'https://ceypetco.gov.lk/wp-content/uploads/2026/04/Marketing-Sepecifictions.pdf',
    },
    {
      title: 'Supplier Registration',
      category: 'Procurement',
      text: 'Register interest in supplying products and professional services to CPC',
      image: 'refinery.png',
      href: '/tenders?from=services#supplier-registration',
    },
    {
      title: 'Consumer Registration',
      category: 'Customer Services',
      text: 'Submit consumer information and connect with the appropriate service team',
      image: 'hero.png',
      href: '/consumer-registration?from=services',
    },
    {
      title: 'Notices',
      category: 'Public Information',
      text: 'Follow important notices and updates from current infrastructure projects',
      image: 'media-2.jpg',
      href: '/notices?from=services',
    },
    {
      title: 'Projects',
      category: 'Strategic Development',
      text: 'Explore refinery modernization and infrastructure initiatives',
      image: 'refinery-detail-1.jpg',
      href: '/projects?from=services',
    },
    {
      title: 'Annual Reports',
      category: 'Corporate Publications',
      text: 'Request access to annual reports and key corporate publications',
      image: 'about-banner.webp',
      href: '/annual-reports?from=services',
    },
    {
      title: 'Right to Information',
      category: 'Public Access',
      text: 'Learn how to submit an official request for public information',
      image: 'career-team.jpg',
      href: '/right-to-information?from=services',
    },
  ];
  const onlineBankingService = {
    title: 'Online Banking',
    category: 'Banking Information',
    text: 'View bank and branch information. No payments are processed on this website.',
    image: 'head-office.webp',
    href: '/online-banking?from=services',
  };
  const operationServiceItems = divisions.slice(4).map(([title, text, image, href]) => ({
    title,
    category: 'Our Operations',
    text,
    image,
    href: `${href}?from=services`,
  }));
  const availableServices =
    services.length > 0
      ? services.map((s) => ({ ...s, href: s.link }))
      : serviceItems;
  const serviceList = [
    ...availableServices.filter((item) =>
      !item.href?.startsWith('/online-banking') &&
      !operationServiceItems.some(({ href }) => item.href?.startsWith(href.split('?')[0]))
    ),
    onlineBankingService,
    ...operationServiceItems,
  ];
  const resolveServiceImage = (item) =>
    !item.image
      ? ''
      : item.image.startsWith('http')
        ? item.image
        : item.image.startsWith('/')
          ? item.image
          : `/images/${item.image}`;
  const requestedSubject =
    new URLSearchParams(window.location.search).get('subject') || '';
  const cameFromServices =
    new URLSearchParams(window.location.search).get('from') === 'services';
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', subject: requestedSubject, message: '' });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactResult, setContactResult] = useState(null);
  const updateContactField = ({ target: { name, value } }) => {
    setContactForm((current) => ({ ...current, [name]: value }));
    setContactResult(null);
  };
  const submitContactForm = async (event) => {
    event.preventDefault();
    setContactSubmitting(true);
    setContactResult(null);
    try {
      const response = await api.post('/admin/contact-messages', contactForm);
      setContactResult({ type: 'success', message: response.data?.message || 'Your message has been sent successfully.' });
      setContactForm({ name: '', email: '', phone: '', subject: requestedSubject, message: '' });
    } catch (error) {
      setContactResult({ type: 'error', message: error.response?.data?.message || 'We could not send your message. Please try again.' });
    } finally {
      setContactSubmitting(false);
    }
  };

  useEffect(() => {
    if (type !== '/news') return undefined;
    let cancelled = false;
    const loadNews = async () => {
      setNewsLoading(true);
      try {
        const res = await api.get('/admin/news', {
          params: { limit: 50 },
        });
        if (!cancelled) setNews(res.data && res.data.data ? res.data.data : []);
      } catch (err) {
        if (!cancelled) setNews([]);
      } finally {
        if (!cancelled) setNewsLoading(false);
      }
    };
    loadNews();
    return () => {
      cancelled = true;
    };
  }, [type]);

  useEffect(() => {
    if (type !== '/tenders') return undefined;
    let cancelled = false;
    const loadTenders = async () => {
      setTendersLoading(true);
      try {
        const res = await api.get('/admin/tenders', {
          params: { limit: 100 },
        });
        if (!cancelled)
          setTenders(res.data && res.data.data ? res.data.data : []);
      } catch (err) {
        if (!cancelled) setTenders([]);
      } finally {
        if (!cancelled) setTendersLoading(false);
      }
    };
    loadTenders();
    return () => {
      cancelled = true;
    };
  }, [type]);

  useEffect(() => {
    if (type !== '/notices') return undefined;
    let cancelled = false;
    const loadNotices = async () => {
      setNoticesLoading(true);
      try {
        const res = await api.get('/admin/notices', {
          params: { limit: 50 },
        });
        if (!cancelled)
          setNotices(res.data && res.data.data ? res.data.data : []);
      } catch (err) {
        if (!cancelled) setNotices([]);
      } finally {
        if (!cancelled) setNoticesLoading(false);
      }
    };
    loadNotices();
    return () => {
      cancelled = true;
    };
  }, [type]);

  useEffect(() => {
    if (type !== '/projects') return undefined;
    let cancelled = false;
    const loadProjects = async () => {
      setProjectsLoading(true);
      try {
        const res = await api.get('/admin/projects', {
          params: { limit: 50 },
        });
        if (!cancelled)
          setProjects(res.data && res.data.data ? res.data.data : []);
      } catch (err) {
        if (!cancelled) setProjects([]);
      } finally {
        if (!cancelled) setProjectsLoading(false);
      }
    };
    loadProjects();
    return () => {
      cancelled = true;
    };
  }, [type]);

  useEffect(() => {
    if (type !== '/regional-offices') return undefined;
    let cancelled = false;
    api
      .get('/admin/regional-offices/active', { params: { limit: 50 } })
      .then((res) => {
        if (!cancelled && res.data?.data?.length) {
          setRegionalOffices(
            res.data.data.map((o) => [
              o.region || '',
              o.district || '',
              o.manager || '',
              o.openingHours || '',
              o.phone || '',
              o.email || '',
            ])
          );
        }
      })
      .catch(() => { });
    return () => {
      cancelled = true;
    };
  }, [type]);

  useEffect(() => {
    if (type !== '/tenders') return undefined;
    let cancelled = false;
    const loadSupplier = async () => {
      try {
        const [res, sec] = await Promise.all([
          api.get('/admin/supplier-resources'),
          api.get('/admin/supplier-section'),
        ]);
        if (!cancelled) {
          const list = (res.data && res.data.data) || [];
          setSupplierResources([...list].sort((a, b) => a.order - b.order));
          setSupplierSection(sec.data && sec.data.data ? sec.data.data : null);
        }
      } catch (err) {
        if (!cancelled) {
          setSupplierResources([]);
          setSupplierSection(null);
        }
      }
    };
    loadSupplier();
    return () => {
      cancelled = true;
    };
  }, [type]);

  useEffect(() => {
    if (type !== '/current-opportunities') return undefined;
    let cancelled = false;
    const loadCareers = async () => {
      setCareersLoading(true);
      try {
        const res = await api.get('/admin/careers/active', {
          params: { limit: 100 },
        });
        if (!cancelled)
          setCareers(res.data && res.data.data ? res.data.data : []);
      } catch (err) {
        if (!cancelled) setCareers([]);
      } finally {
        if (!cancelled) setCareersLoading(false);
      }
    };
    loadCareers();
    return () => {
      cancelled = true;
    };
  }, [type]);

  useEffect(() => {
    if (type !== '/annual-reports' && type !== '/publications') return undefined;
    let cancelled = false;
    const loadAnnualReports = async () => {
      setAnnualReportsLoading(true);
      try {
        const res = await api.get('/admin/annual-reports/active', {
          params: { limit: 100 },
        });
        if (!cancelled)
          setAnnualReports(
            (res.data && res.data.data ? res.data.data : []).filter((report) => Boolean(report.url))
          );
      } catch (err) {
        if (!cancelled) setAnnualReports([]);
      } finally {
        if (!cancelled) setAnnualReportsLoading(false);
      }
    };
    loadAnnualReports();
    return () => {
      cancelled = true;
    };
  }, [type]);

  useEffect(() => {
    if (type !== '/services') return undefined;
    let cancelled = false;
    const loadServices = async () => {
      setServicesLoading(true);
      try {
        const res = await api.get('/admin/services', {
          params: { limit: 100 },
        });
        if (!cancelled)
          setServices(res.data && res.data.data ? res.data.data : []);
      } catch (err) {
        if (!cancelled) setServices([]);
      } finally {
        if (!cancelled) setServicesLoading(false);
      }
    };
    loadServices();
    return () => {
      cancelled = true;
    };
  }, [type]);

  const currentCareers = careers;

  return (
    <main className="inner-page">
      <section className={`page-hero${type === '/about' ? ' page-hero--about' : ''}${type === '/management' ? ' page-hero--management' : ''}${type === '/refinery' ? ' page-hero--refinery' : ''}${type === '/lubricants' ? ' page-hero--lubricants' : ''}${type === '/tenders' ? ' page-hero--tenders' : ''}${pageBrandLogos[type] ? ' page-hero--' + type.slice(1) : ''}`}>
        <img src={page.image} alt="" />
        {pageBrandLogos[type] && (
          <div className="page-hero-logo">
            <img src={pageBrandLogos[type]} alt={`${page.title} logo`} />
          </div>
        )}
        {type === '/about' && (
          <div className="page-hero-caption">
            09 June 1967 – Hon. Prime Minister Dudley Senanayake laying the foundation stone for the construction of the refinery.
          </div>
        )}
        {type === '/management' && (
          <div className="page-hero-caption">
            Hon. Prime Minister Sirimavo Bandaranaike inaugurating the bunkering service.
          </div>
        )}
        <div className="container page-hero-copy">
          <p className="eyebrow light">{type === '/about' ? t('aboutLabel') : page.label}</p>
          <h1>{type === '/about' ? t('aboutTitle') : page.title}</h1>
          <p>{type === '/about' ? t('aboutIntro') : page.intro}</p>
          <div className="breadcrumbs">
            <a href="/">Home</a>
            <span>/</span>
            <b>{type === '/about' ? t('aboutLabel') : page.breadcrumb || page.label}</b>
          </div>
        </div>
      </section>
      {['/news', '/notices', '/publications', '/annual-reports'].includes(type) && (
        <nav className="media-section-nav" aria-label="Media sections">
          <div className="container">
            <a className={type === '/news' ? 'active' : ''} href="/news">News</a>
            <a className={type === '/notices' ? 'active' : ''} href="/notices">Notices</a>
            <a className={['/publications', '/annual-reports'].includes(type) ? 'active' : ''} href="/publications">Publications</a>
            <a href="/gallery">Gallery</a>
          </div>
        </nav>
      )}
      {['/careers', '/corporate-life', '/current-opportunities'].includes(type) && (
        <nav className="media-section-nav" aria-label="Careers sections">
          <div className="container">
            <a className={type === '/corporate-life' ? 'active' : ''} href="/corporate-life">Corporate Life</a>
            <a className={type === '/current-opportunities' ? 'active' : ''} href="/current-opportunities">Current Opportunities</a>
          </div>
        </nav>
      )}
      {[
        '/regional-offices',
        '/consumer-registration',
        '/projects',
        '/right-to-information',
        '/tenders',
        '/online-banking',
      ].includes(type) || (cameFromServices && ['/notices', '/annual-reports'].includes(type)) ? (
        <div className="public-access-backbar">
          <div className="container">
            <a href={cameFromServices ? '/services' : '/#services'}>
              <Icon name="arrow" size={16} />
              {cameFromServices
                ? 'Back to All Services'
                : 'Back to Services & Resources'}
            </a>
          </div>
        </div>
      ) : null}
      {['/about', '/management', '/history', '/subsidiaries', '/energy-ministries'].includes(type) && (
        <div className="subpage-nav">
          <div className="container">
            <span>{type === '/history' ? 'Discover Ceypetco' : t('discover')}</span>
            <a className={type === '/about' ? 'active' : ''} href="/about">
              {t('aboutUs')}
            </a>
            <a className={type === '/management' ? 'active' : ''} href="/management">
              Management
            </a>
            <a className={type === '/history' ? 'active' : ''} href="/history">
              Our history
            </a>
            <a className={type === '/subsidiaries' ? 'active' : ''} href="/subsidiaries">
              Subsidiaries
            </a>
            <a className={type === '/energy-ministries' ? 'active' : ''} href="/energy-ministries">
              Related ministries
            </a>
          </div>
        </div>
      )}
      {divisionPages[type] &&
        ![
          '/refinery',
          '/marketing-sales',
          '/aviation',
          '/agro-chemicals',
          '/lubricants',
        ].includes(type) && <DivisionPage data={divisionPages[type]} />}
      {['/ev-charging', '/electric-mobility'].includes(type) && <ElectricMobilityContent />}
      {!['/ev-charging', '/electric-mobility'].includes(type) && additionalOperationPages[type] && (
        <AdditionalOperationPage data={additionalOperationPages[type]} />
      )}
      {type === '/refinery' && <RefineryPage />}
      {type === '/marketing-sales' && <MarketingSalesPage />}
      {type === '/marketing-sales/historical-prices' && <HistoricalPricesPage />}
      {type === '/aviation' && <AviationPage />}
      {type === '/agro-chemicals' && <AgroChemicalsPage />}
      {type === '/lubricants' && <LubricantsPage />}
      {type === '/history' && <HistoryPage data={historyPage} />}
      {type === '/subsidiaries' && <SubsidiariesPage />}
      {type === '/energy-ministries' && <EnergyMinistriesPage />}
      {type === '/management' && (
        <>
          <ManagementTeam />
          <ManagementDirectory />
        </>
      )}
      {type === '/contact' && <ContactDirectory />}
      {type === '/about' && (
        <>
          <section className="content-section">
            <div className="container story-grid">
              <div>
                <p className="eyebrow">WHO WE ARE</p>
                <h2>Energy security at the heart of everything</h2>
              </div>
              <div>
                <p>
                  CPC carries on business as an importer, exporter, seller,
                  supplier and distributor of petroleum products, while
                  supporting exploration, production and refining activities
                  that advance the nation
                </p>
                <p>
                  Established under Act No. 28 of 1961, the Corporation
                  continues to serve households, transport, aviation and
                  industry across Sri Lanka
                </p>
              </div>
            </div>
          </section>
          <section className="vision-section">
            <div className="container vision-grid">
              <article>
                <span>01</span>
                <p className="eyebrow">OUR VISION</p>
                <h3>To become Asia’s most trusted and premier energy brand</h3>
              </article>
              <article>
                <span>02</span>
                <p className="eyebrow">OUR MISSION</p>
                <h3>
                  To deliver sustainable energy solutions meeting the highest
                  Quality, Health, Safety and Environment standards
                </h3>
              </article>
            </div>
          </section>
          <section className="about-video-section" aria-labelledby="about-video-title">
            <div className="container">
              <div className="about-video-heading">
                <p className="eyebrow">CEYPETCO IN FOCUS</p>
                <h2 id="about-video-title">Get to know Ceypetco</h2>
                <p>See the people, operations and purpose behind the energy that keeps Sri Lanka moving.</p>
              </div>
              <div className="about-video-frame">
                <video
                  ref={aboutVideoRef}
                  controls
                  playsInline
                  preload="metadata"
                  poster="/images/about-banner.webp"
                  aria-label="Ceypetco promotional video"
                  onPlay={() => setAboutVideoPlaying(true)}
                  onPause={() => setAboutVideoPlaying(false)}
                  onEnded={() => setAboutVideoPlaying(false)}
                >
                  <source
                    src="https://ceypetco.gov.lk/wp-content/uploads/2024/12/promo-video.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support video playback.{' '}
                  <a href="https://ceypetco.gov.lk/wp-content/uploads/2024/12/promo-video.mp4">
                    Watch the Ceypetco video
                  </a>
                  .
                </video>
                {!aboutVideoPlaying && (
                  <button
                    className="about-video-play"
                    type="button"
                    aria-label="Play Ceypetco promotional video"
                    onClick={() => aboutVideoRef.current?.play()}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8 5.5v13l10-6.5z" fill="currentColor" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </section>
        </>
      )}
      {type === '/services' && (
        <>
          <section className="services-intro">
            <div className="container services-stats">
              <div>
                <b>{String(serviceList.length).padStart(2, '0')}</b>
                <span>
                  Essential public
                  <br />
                  service areas
                </span>
              </div>
              <div>
                <b>Islandwide</b>
                <span>
                  Regional support
                  <br />
                  and operations
                </span>
              </div>
              <div>
                <b>One place</b>
                <span>
                  Clear access to
                  <br />
                  official information
                </span>
              </div>
            </div>
          </section>
          <section className="content-section services-directory">
            <div className="container">
              <div className="page-title-row">
                <div>
                  <p className="eyebrow">EXPLORE SERVICES</p>
                  <h2>How can we help?</h2>
                </div>
                <p>
                  Direct access to frequently used Ceypetco services and
                  information
                </p>
              </div>
              <div className="directory-grid">
                {serviceList.map((item, i) => (
                  <article className="service-card" key={item.title}>
                    <a
                      className="service-card-image"
                      href={item.href}
                      target={
                        item.href.startsWith('http') ? '_blank' : undefined
                      }
                      rel={
                        item.href.startsWith('http') ? 'noreferrer' : undefined
                      }
                    >
                      <img src={resolveServiceImage(item)} alt="" />
                      <span>0{i + 1}</span>
                    </a>
                    <div className="service-card-body">
                      <p className="eyebrow">{item.category}</p>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                      <a
                        className="service-card-link"
                        href={item.href}
                        target={
                          item.href.startsWith('http') ? '_blank' : undefined
                        }
                        rel={
                          item.href.startsWith('http')
                            ? 'noreferrer'
                            : undefined
                        }
                      >
                        Access service
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
      {type === '/online-banking' && (
        <section className="payment-options online-banking-directory content-section">
          <div className="container">
            <div className="payment-heading">
              <p className="eyebrow">BANKING REFERENCE</p>
              <h2>Bank and branch directory</h2>
              <p>Find the bank and branch names listed for CEYPETCO transactions.</p>
            </div>
            <div className="online-banking-info" role="note">
              <Icon name="shield" size={23} />
              <p>
                <strong>Information only.</strong> This website does not accept or process
                payments. Confirm account details using official CEYPETCO payment
                instructions before making a transfer through your own bank.
              </p>
            </div>
            <div className="payment-logo-row bank-payment-row">
              {paymentBanks.map(({ name, branch, logo }) => (
                <div className="bank-entry" key={name}>
                  <span className="bank-entry-logo">
                    <img src={`/images/banks/${logo}`} alt={`${name} logo`} loading="lazy" />
                  </span>
                  <span className="bank-entry-name">{name}</span>
                  <span className="bank-entry-branch">{branch}</span>
                </div>
              ))}
            </div>
            <div className="aviation-payment-heading">
              <span aria-hidden="true" />
              <h3>Aviation fuelling</h3>
              <span aria-hidden="true" />
              <p>Card networks listed for eligible aviation fuelling arrangements. Confirm acceptance with CEYPETCO before payment.</p>
            </div>
            <div className="payment-logo-row card-payment-row aviation-card-row" aria-label="Aviation fuelling card networks">
              {aviationCardNetworks.map(({ name, logo }) => (
                <div className="aviation-card-entry" key={name}>
                  <img src={`/images/${logo}`} alt={`${name} logo`} loading="lazy" />
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      {type === '/consumer-registration' && (
        <>
          <section className="bulk-consumer-intro content-section">
            <div className="container bulk-consumer-intro-grid">
              <div>
                <p className="eyebrow">CONSUMER POINT REGISTRATION</p>
                <h2>Bulk customer registration</h2>
              </div>
              <div>
                <p>
                  Customers consuming more than{' '}
                  <strong>3,300 litres per month</strong> of Industrial Diesel,
                  Industrial Kerosene, Furnace Oil or SBP must register with CPC
                  as Bulk Consumers
                </p>
                <div className="bulk-fuel-tags">
                  {[
                    'Industrial Diesel',
                    'Industrial Kerosene',
                    'Furnace Oil',
                    'SBP',
                  ].map((fuel) => (
                    <span key={fuel}>{fuel}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bulk-process content-section">
            <div className="container">
              <div className="bulk-section-heading">
                <p className="eyebrow">REGISTRATION PROCESS</p>
                <h2>How to become a bulk consumer</h2>
              </div>
              <div className="bulk-step-grid">
                {bulkConsumerSteps.map((step, index) => (
                  <article key={step}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <p>{step}</p>
                  </article>
                ))}
              </div>
              <aside className="bulk-important-note">
                <div>
                  <Icon name="clock" size={25} />
                </div>
                <div>
                  <p className="eyebrow light">IMPORTANT ORDERING NOTE</p>
                  <h3>Next-working-day cutoff: 3:00 PM</h3>
                  <p>
                    Delivery allocations are generated automatically on working
                    days. The order must be placed through the mobile app and
                    sufficient funds must be available in the CPC account when
                    allocation is generated. Delivery remains subject to
                    capacity
                  </p>
                </div>
              </aside>
            </div>
          </section>

          <section className="bulk-resources content-section">
            <div className="container">
              <div className="bulk-section-heading split-heading">
                <div>
                  <p className="eyebrow">DOWNLOADS & RESOURCES</p>
                  <h2>Everything needed to apply</h2>
                </div>
                <p>Official forms and resources open in a new browser tab</p>
              </div>
              <div className="bulk-resource-grid">
                {bulkConsumerResources.map(([label, href], index) => (
                  <a href={href} target="_blank" rel="noreferrer" key={label}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <Icon name={index === 4 ? 'app' : 'download'} size={24} />
                    <strong>{label}</strong>
                    <Icon name="arrow" size={17} />
                  </a>
                ))}
              </div>
            </div>
          </section>

          <section className="bulk-contacts content-section">
            <div className="container">
              <div className="bulk-contact-summary">
                <div>
                  <p className="eyebrow light">FURTHER ASSISTANCE</p>
                  <h2>Bulk consumer support</h2>
                </div>
                <a href="mailto:ccu@ceypetco.gov.lk">
                  <span>Email</span>
                  <b>ccu@ceypetco.gov.lk</b>
                </a>
                <a href="tel:0117296130">
                  <span>General line</span>
                  <b>011 729 6130</b>
                </a>
              </div>
              <div className="bulk-whatsapp-row">
                <span>WhatsApp assistance</span>
                {[
                  '0744136151',
                  '0744136152',
                  '0744136153',
                  '0744136154',
                  '0744136155',
                  '0744136157',
                ].map((number) => (
                  <a
                    href={`https://wa.me/94${number.slice(1)}`}
                    target="_blank"
                    rel="noreferrer"
                    key={number}
                  >
                    {number}
                  </a>
                ))}
              </div>
              <div className="bulk-regional-heading">
                <p className="eyebrow">REGIONAL ASSISTANCE</p>
                <h3>Regional managers and area supervisors</h3>
              </div>
              <div className="bulk-region-grid">
                {bulkConsumerRegions.map(([region, districts, name, phone]) => (
                  <article key={region}>
                    <small>{region}</small>
                    <h4>{name}</h4>
                    <p>{districts}</p>
                    <a href={`tel:${phone}`}>
                      <Icon name="phone" size={15} /> {phone}
                    </a>
                  </article>
                ))}
              </div>
              <div className="bulk-faq">
                <p className="eyebrow">FREQUENTLY ASKED QUESTION</p>
                <h3>Which fuels are available to industrial customers?</h3>
                <p>
                  Industrial Diesel, Industrial Kerosene, Furnace Oil and SBP
                </p>
              </div>
            </div>
          </section>
        </>
      )}
      {type === '/regional-offices' && (
        <section className="regional-offices-page content-section">
          <div className="container">
            <div className="regional-offices-heading">
              <div>
                <p className="eyebrow">ISLANDWIDE ASSISTANCE</p>
                <h2>Regional offices</h2>
              </div>
              <p>
                Contact the regional team responsible for customer, dealer and
                operational support in your area
              </p>
            </div>
            <div className="regional-office-grid">
              {(regionalOffices || defaultRegionalOffices).map(
                ([region, city, manager, role, phone, email], index) => (
                  <article className="regional-office-card" key={region}>
                    <div className="regional-office-top">
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <Icon name="building" size={24} />
                    </div>
                    <p className="eyebrow">{region.toUpperCase()} REGION</p>
                    <h3>{city}</h3>
                    <div className="regional-manager">
                      <small>REGIONAL CONTACT</small>
                      {manager && <strong>{manager}</strong>}
                      <span>{role}</span>
                    </div>
                    <div className="regional-contact-links">
                      <a href={`tel:${phone.replaceAll(' ', '')}`}>
                        <Icon name="phone" size={16} />
                        <span>{phone}</span>
                      </a>
                      <a href={`mailto:${email}`}>
                        <span className="contact-at">@</span>
                        <span>{email}</span>
                      </a>
                    </div>
                  </article>
                ),
              )}
            </div>
            <div className="regional-offices-note">
              <Icon name="globe" size={21} />
              <p>
                For general enquiries or assistance identifying the appropriate
                regional office, contact the Ceypetco head office
              </p>
              <a href="/contact">
                Contact head office <Icon name="arrow" size={16} />
              </a>
            </div>
          </div>
        </section>
      )}
      {type === '/right-to-information' && (
        <section className="rti-page content-section">
          <div className="container">
            <div className="rti-heading">
              <div>
                <p className="eyebrow">RIGHT TO INFORMATION</p>
                <h2>Nominated and Information Officers</h2>
              </div>
              <p>
                Official points of contact for information requests addressed to
                Ceylon Petroleum Corporation
              </p>
            </div>

            <div className="rti-intro-panel">
              <div className="rti-mark" aria-hidden="true">
                RTI
              </div>
              <div>
                <p className="eyebrow light">CEYLON PETROLEUM CORPORATION</p>
                <h3>Report of nominated and information officers</h3>
                <p>
                  Use the contact details below to reach the appropriate officer
                  regarding an official Right to Information enquiry
                </p>
              </div>
              <span>No. 609, Dr. Danister de Silva Road, Colombo 09</span>
            </div>

            <div className="rti-officer-grid">
              {[
                {
                  index: '01',
                  role: 'Nominated Officer',
                  name: 'Mr. K W Samantha Pushpalal',
                  phones: ['+94 11 2106758', '+94 77 3856981'],
                  email: 'dgm.hr@ceypetco.gov.lk',
                },
                {
                  index: '02',
                  role: 'Information Officer',
                  name: 'Ms. R M Y S Rajakaruna',
                  phones: ['+94 11 7296353'],
                  email: 'infor.officer@ceypetco.gov.lk',
                },
              ].map((officer) => (
                <article key={officer.role}>
                  <div className="rti-officer-top">
                    <span>{officer.index}</span>
                    <div>
                      <Icon name="shield" size={24} />
                    </div>
                  </div>
                  <p className="eyebrow">{officer.role.toUpperCase()}</p>
                  <h3>{officer.name}</h3>
                  <div className="rti-address">
                    <small>OFFICIAL ADDRESS</small>
                    <p>No. 609, Dr. Danister de Silva Road, Colombo 09</p>
                  </div>
                  <div className="rti-contact-actions">
                    <div>
                      <small>TELEPHONE</small>
                      {officer.phones.map((phone) => (
                        <a
                          href={`tel:${phone.replaceAll(' ', '')}`}
                          key={phone}
                        >
                          <Icon name="phone" size={15} /> {phone}
                        </a>
                      ))}
                    </div>
                    <div>
                      <small>EMAIL</small>
                      <a href={`mailto:${officer.email}`}>
                        <span>@</span> {officer.email}
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="rti-guidance">
              <div>
                <Icon name="globe" size={22} />
              </div>
              <div>
                <p className="eyebrow">CONTACT GUIDANCE</p>
                <h3>Direct your enquiry to the Information Officer</h3>
                <p>
                  For general assistance with CPC services, use the main contact
                  directory. For RTI correspondence, use the official officer
                  details shown above
                </p>
              </div>
              <a href="/contact?subject=Right%20to%20Information">
                General contact directory <Icon name="arrow" size={16} />
              </a>
            </div>
          </div>
        </section>
      )}
      {['/annual-reports', '/publications'].includes(type) && (
        <section className="annual-reports-page content-section">
          <div className="container">
            <div className="annual-reports-heading">
              <div>
                <p className="eyebrow">PUBLICATION ARCHIVE</p>
                <h2>Annual reports</h2>
              </div>
              <p>
                Published CPC annual reports covering operational performance,
                governance and financial reporting, arranged by year
              </p>
            </div>

            {annualReportsLoading ? (
              <div className="annual-reports-loading">
                <p className="eyebrow light">LATEST AVAILABLE REPORT</p>
                <p>Loading reports...</p>
              </div>
            ) : annualReports.length === 0 ? (
              <div className="annual-reports-loading">
                <p className="eyebrow light">PUBLICATION ARCHIVE</p>
                <p>No annual reports published yet</p>
              </div>
            ) : (
              <>
                <article className="annual-report-featured">
                  <div className="annual-report-cover" aria-hidden="true">
                    <span>CEYPETCO</span>
                    <b>{annualReports[0].year}</b>
                    <small>ANNUAL REPORT</small>
                    <i />
                  </div>
                  <div className="annual-report-featured-copy">
                    <p className="eyebrow light">LATEST AVAILABLE REPORT</p>
                    <h3>Annual Report {annualReports[0].year}</h3>
                    <p>
                      Review the latest available published record of Ceylon
                      Petroleum Corporation&rsquo;s performance and activities
                    </p>
                    <div className="annual-report-meta">
                      <span>
                        <b>{annualReports[0].year}</b> Reporting year
                      </span>
                      <span>
                        <b>PDF</b> English edition
                      </span>
                    </div>
                    {annualReports[0].url && (
                      <a
                        href={annualReports[0].url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download latest report{' '}
                        <Icon name="download" size={17} />
                      </a>
                    )}
                  </div>
                </article>

                <div className="annual-archive-heading">
                  <div>
                    <p className="eyebrow">REPORT LIBRARY</p>
                    <h3>Previous annual reports</h3>
                  </div>
                  <span>
                    {annualReports.length} report
                    {annualReports.length === 1 ? '' : 's'} available
                  </span>
                </div>
                {annualReports.length > 1 ? (
                  <div className="annual-report-grid">
                    {annualReports.slice(1).map((report, index) => (
                      <a
                        href={report.url}
                        target="_blank"
                        rel="noreferrer"
                        key={report._id}
                        style={{ cursor: report.url ? 'pointer' : 'default' }}
                      >
                        <span>{String(index + 2).padStart(2, '0')}</span>
                        <div>
                          <small>ANNUAL REPORT</small>
                          <strong>{report.year}</strong>
                        </div>
                        <div className="annual-download-icon">
                          <Icon name="download" size={18} />
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="annual-reports-loading">
                    <p className="eyebrow light">REPORT LIBRARY</p>
                    <p>More reports will be added to the archive</p>
                  </div>
                )}
              </>
            )}

            <div className="annual-report-note">
              <Icon name="globe" size={21} />
              <p>
                Reports are presented in the years currently available in the
                CPC publication archive. Selecting a report opens the official
                PDF in a new browser tab
              </p>
              <a href="/contact?subject=Annual%20report%20enquiry">
                Publication enquiry <Icon name="arrow" size={16} />
              </a>
            </div>
          </div>
        </section>
      )}
      {type === '/projects' && (
        <section className="media-page content-section">
          <div className="container">
            <div className="page-title-row">
              <div>
                <p className="eyebrow">STRATEGIC INITIATIVES</p>
                <h2>Projects & Development</h2>
              </div>
              <p>
                Key infrastructure and modernization projects driving Ceypetco's
                development
              </p>
            </div>
            {projectsLoading ? (
              <div className="news-grid">
                <div className="news-grid-empty">Loading projects...</div>
              </div>
            ) : projects.length === 0 ? (
              <div className="news-grid">
                <div className="news-grid-empty">No projects published yet</div>
              </div>
            ) : (
              <div className="news-grid">
                {projects.map((project) => (
                  <article key={project._id}>
                    <div
                      className="news-image"
                      style={{
                        backgroundImage: project.featuredImage
                          ? `url(${project.featuredImage})`
                          : undefined,
                      }}
                    ></div>
                    <div>
                      <p className="eyebrow">{project.category}</p>
                      <h3>{project.title}</h3>
                      {(project.location || project.statusLabel) && (
                        <p className="project-location">
                          {[project.location, project.statusLabel]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      )}
                      <p>{project.summary || project.content}</p>
                      {project.documents && project.documents.length > 0 && (
                        <div className="project-doc-links">
                          {project.documents.map((doc, i) => (
                            <a
                              key={i}
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {doc.name} <Icon name="download" size={16} />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
      {type === '/notices' && (
        <section className="notices-page content-section">
          <div className="container">
            <div className="notices-heading">
              <div>
                <p className="eyebrow">PUBLIC INFORMATION</p>
                <h2>Notices, circulars and agreements</h2>
              </div>
              <p>
                Official statements and downloadable documents published for
                customers, dealers, partners and the public
              </p>
            </div>
            {noticesLoading && (
              <div className="notices-featured" role="status">
                <div className="notice-featured-index">···</div>
                <div>
                  <p className="eyebrow light">PUBLIC INFORMATION</p>
                  <h3>Loading notices...</h3>
                </div>
              </div>
            )}
            {!noticesLoading && notices.length === 0 && (
              <div className="notices-featured">
                <div className="notice-featured-index">01</div>
                <div>
                  <p className="eyebrow light">PUBLIC INFORMATION</p>
                  <h3>No notices published yet</h3>
                </div>
              </div>
            )}

            {notices.length > 0 && (
              <>
                <div className="notices-featured">
                  <div className="notice-featured-index">01</div>
                  <div>
                    <p className="eyebrow light">{(notices[0].category || 'Notice').replace(/-/g, ' ')}</p>
                    <h3>{notices[0].title}</h3>
                    <p>{notices[0].summary || notices[0].content}</p>
                    {notices[0].publishedDate && <small>Published {new Date(notices[0].publishedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</small>}
                    {notices[0].document ? (
                      <a
                        href={notices[0].document}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download document <Icon name="download" size={16} />
                      </a>
                    ) : (
                      <small>Official statement</small>
                    )}
                  </div>
                </div>
                <div className="notice-document-grid">
                  {notices.slice(1).map((notice, index) => (
                    <article key={notice._id}>
                      <div className="notice-document-top">
                        <span>{String(index + 2).padStart(2, '0')}</span>
                        <Icon
                          name={notice.document ? 'download' : 'clock'}
                          size={22}
                        />
                      </div>
                      <p className="eyebrow">{(notice.category || 'Notice').replace(/-/g, ' ')}</p>
                      <h3>{notice.title}</h3>
                      {notice.publishedDate && <time className="notice-document-date" dateTime={notice.publishedDate}>{new Date(notice.publishedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</time>}
                      <p>{notice.summary || notice.content}</p>
                      {notice.document ? (
                        <a
                          href={notice.document}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download document <Icon name="download" size={16} />
                        </a>
                      ) : (
                        <span className="notice-unavailable">
                          Official notice
                        </span>
                      )}
                    </article>
                  ))}
                </div>
              </>
            )}
            <div className="notices-support">
              <Icon name="globe" size={22} />
              <p>
                Need clarification about a notice or circular? Contact Ceypetco
                customer care for assistance
              </p>
              <a href="/contact?subject=Public%20notice%20enquiry">
                Request clarification <Icon name="arrow" size={16} />
              </a>
            </div>
          </div>
        </section>
      )}
      {type === '/media' && (
        <section className="media-hub content-section">
          <div className="container">
            <div className="media-hub-heading">
              <p className="eyebrow">MEDIA CENTRE</p>
              <h2>Explore Ceypetco updates</h2>
              <p>Find the right source for stories, public information and published reports.</p>
            </div>
            <div className="media-hub-grid">
              {[
                { number: '01', title: 'News', description: 'Corporate announcements, activities and stories.', href: '/news', action: 'Browse news' },
                { number: '02', title: 'Notices', description: 'Current official notices, circulars and documents.', href: '/notices', action: 'Read notices' },
                { number: '03', title: 'Publications', description: 'Annual reports and published corporate records.', href: '/publications', action: 'View publications' },
                { number: '04', title: 'Gallery', description: 'Photography and videos from across Ceypetco.', href: '/gallery', action: 'Explore gallery' },
              ].map((item) => (
                <a href={item.href} className="media-hub-card" key={item.title}>
                  <span>{item.number}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <b>{item.action} <Icon name="arrow" size={17} /></b>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
      {type === '/news' && (
        <section className="media-news-page content-section">
          <div className="container">
            <div className="page-title-row">
              <div>
                <p className="eyebrow">LATEST STORIES</p>
                <h2>News and updates</h2>
              </div>
              <p>Published announcements and stories from Ceylon Petroleum Corporation.</p>
            </div>
            <div className="news-grid">
              {newsLoading ? (
                <p className="news-grid-empty">Loading latest updates...</p>
              ) : news.length === 0 ? (
                <p className="news-grid-empty">
                  No published news available yet
                </p>
              ) : (
                news.map((item) => (
                  <article key={item._id}>
                    {item.featuredImage ? (
                      <div
                        className="news-image"
                        style={{
                          backgroundImage: `url(${displayImageUrl(item.featuredImage)})`,
                        }}
                      ></div>
                    ) : (
                      <div className="news-image"></div>
                    )}
                    <div>
                      <p className="eyebrow">
                        {(item.category || 'News')
                          .replace(/-/g, ' ')
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </p>
                      {item.publishedDate && <time className="media-news-date" dateTime={item.publishedDate}>{new Date(item.publishedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</time>}
                      <h3>{item.title}</h3>
                      <p className="news-preview">{getNewsPreview(item)}</p>
                      <a href={`/news/${item._id}`}>
                        Read update <Icon name="arrow" size={16} />
                      </a>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      )}
      {type === '/tenders' && (
        <section className="tenders-hub content-section">
          <div className="container">
            <div className="tenders-heading">
              <div>
                <p className="eyebrow">PROCUREMENT PORTAL</p>
                <h2>Tenders and supplier registration</h2>
              </div>
              <p>
                Commercial, refinery and procurement opportunities, supported by
                supplier registration guidance and application resources
              </p>
            </div>

            <section
              className="supplier-registration-panel"
              id="supplier-registration"
            >
              <div className="supplier-registration-copy">
                <p className="eyebrow light">
                  {supplierSection
                    ? supplierSection.eyebrow
                    : 'SUPPLIER ACCESS'}
                </p>
                <h3>
                  {supplierSection
                    ? supplierSection.title
                    : 'Registration resources'}
                </h3>
                <p>
                  {supplierSection
                    ? supplierSection.description
                    : 'Guidance and application support for oil suppliers, foreign suppliers, independent inspectors and local contractors'}
                </p>
              </div>
              <div className="supplier-resource-grid">
                {supplierResources.length === 0 ? (
                  <span className="supplier-resource-empty">
                    No registration resources available yet
                  </span>
                ) : (
                  supplierResources.map((resource) => (
                    <a
                      href={resource.url || '#'}
                      key={resource._id}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Icon name="download" size={16} />
                      <span>{resource.title}</span>
                      <Icon name="arrow" size={14} />
                    </a>
                  ))
                )}
              </div>
            </section>

            {tendersLoading && (
              <div className="tender-loading" aria-label="Loading tenders">
                {['COMMERCIAL DIVISION', 'REFINERY DIVISION'].map(
                  (division, di) => (
                    <section className="tender-division" key={division}>
                      <div className="tender-division-heading">
                        <p className="eyebrow skeleton-text">{division}</p>
                        <span
                          className="skeleton-text"
                          style={{ width: 160 }}
                        >
                          Loading opportunities
                        </span>
                      </div>
                      <div className="tender-list">
                        {[0, 1, 2].map((row, ri) => (
                          <article
                            className="tender-skeleton-row"
                            key={row}
                            style={{
                              '--skeleton-delay': `${(di * 3 + ri) * 70}ms`,
                            }}
                          >
                            <div className="tender-skeleton-block">
                              <span className="skeleton-pill" />
                              <span className="skeleton-line skeleton-short" />
                            </div>
                            <span className="skeleton-line skeleton-title" />
                            <div className="tender-skeleton-block">
                              <span className="skeleton-line skeleton-short" />
                              <span className="skeleton-line" />
                            </div>
                            <span className="skeleton-line skeleton-link" />
                          </article>
                        ))}
                      </div>
                    </section>
                  ),
                )}
              </div>
            )}

            {!tendersLoading && tenders.length === 0 && (
              <div className="tender-division">
                <div className="tender-division-heading">
                  <p className="eyebrow">OPEN TENDERS</p>
                  <span>No open opportunities</span>
                </div>
              </div>
            )}

            {[
              'COMMERCIAL DIVISION',
              'REFINERY DIVISION',
              'PROCUREMENTS & STORES DIVISION',
            ].map((division, di) => {
              const items = tenders.filter((t) => t.division === division);
              if (items.length === 0) return null;
              return (
                <section
                  className="tender-division"
                  key={division}
                  style={{ '--tender-section-delay': `${di * 140}ms` }}
                >
                  <div className="tender-division-heading">
                    <p className="eyebrow">{division}</p>
                    <span>{items.length} published opportunities</span>
                  </div>
                  <div className="tender-list">
                    {items.map((item, index) => (
                      <article
                        className="tender-card"
                        key={item._id}
                        style={{
                          '--tender-delay': `${index * 70}ms`,
                        }}
                      >
                        <div>
                          <span className="status">
                            {item.status ? item.status.toUpperCase() : 'OPEN'}
                          </span>
                          <b>{item.reference}</b>
                        </div>
                        <h3>{item.title}</h3>
                        <div>
                          <small>
                            {item.closingDate
                              ? 'Closing date'
                              : 'Availability'}
                          </small>
                          <p>
                            {item.closingDate
                              ? new Date(
                                item.closingDate,
                              ).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })
                              : 'Open'}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="btn-text"
                          onClick={(e) => {
                            e.preventDefault();
                            if (item.documents && item.documents.length) {
                              setDownloadTender({ ...item, url: item.documents[0].url });
                            }
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--cpc-red)', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          Download tender <Icon name="download" size={16} />
                        </button>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}

            <div className="tender-rfq-note">
              <div>
                <p className="eyebrow light">REFINERY DIVISION · RFQ</p>
                <h3>Request-for-quotation information</h3>
              </div>
              <a href="/contact?subject=Refinery%20Division%20RFQ">
                Request RFQ details <Icon name="arrow" size={17} />
              </a>
            </div>
          </div>
          {downloadTender && <TenderDownloadModal tender={downloadTender} onClose={() => setDownloadTender(null)} />}
        </section>
      )}
      {type === '/careers' && (
        <section className="content-section careers-hub">
          <div className="container">
            <div className="careers-intro">
              <p className="eyebrow">WORK WITH US</p>
              <h2>Build the future of energy</h2>
              <p>Contribute to the work that keeps Sri Lanka moving. Explore life across the corporation or find a role that matches your skills.</p>
            </div>
            <div className="careers-hub-grid">
              <a href="/corporate-life" className="careers-hub-card">
                <span>01 / OUR PEOPLE</span>
                <h3>Corporate Life</h3>
                <p>See how teams across operations, technical services and support functions contribute to a shared public purpose.</p>
                <b>Explore corporate life <Icon name="arrow" size={18} /></b>
              </a>
              <a href="/current-opportunities" className="careers-hub-card">
                <span>02 / JOIN US</span>
                <h3>Current Opportunities</h3>
                <p>Browse published vacancies and review role details, requirements and deadlines.</p>
                <b>View opportunities <Icon name="arrow" size={18} /></b>
              </a>
            </div>
          </div>
        </section>
      )}
      {type === '/corporate-life' && (
        <>
          <section className="content-section corporate-life-intro">
            <div className="container corporate-life-lead">
              <div>
                <p className="eyebrow">LIFE AT CEYPETCO</p>
                <h2>Many disciplines. One national purpose.</h2>
              </div>
              <p>Ceylon Petroleum Corporation brings together people in refining, supply, distribution, commercial services and essential support roles. Their work connects technical expertise with the everyday needs of communities and businesses across Sri Lanka.</p>
            </div>
            <div className="container corporate-life-pillars">
              <article><span>01</span><h3>Meaningful work</h3><p>Contribute to the reliable supply of petroleum products and services that support the country’s transport, industry and daily life.</p></article>
              <article><span>02</span><h3>Learning and development</h3><p>Technical knowledge, professional development and practical experience help people grow across a range of disciplines.</p></article>
              <article><span>03</span><h3>Safety and responsibility</h3><p>Safety, quality and environmental care are integral to work across facilities, field operations and offices.</p></article>
            </div>
          </section>
          <section className="content-section corporate-life-paths">
            <div className="container">
              <p className="eyebrow">WHERE TEAMS CONTRIBUTE</p>
              <h2>Work across the energy value chain</h2>
              <div className="corporate-life-path-grid">
                <article><span>01</span><h3>Refining and technical operations</h3><p>Plant operations, engineering, maintenance, laboratory work and safety.</p></article>
                <article><span>02</span><h3>Supply and distribution</h3><p>Planning, logistics and the coordination needed to move products nationwide.</p></article>
                <article><span>03</span><h3>Customer and commercial services</h3><p>Supporting the people and organisations that depend on Ceypetco products.</p></article>
                <article><span>04</span><h3>Corporate support</h3><p>Finance, people, procurement, digital services and administration.</p></article>
              </div>
              <div className="corporate-life-cta"><div><span>YOUR NEXT STEP</span><h3>See where you could contribute</h3><p>Explore current vacancies and review the requirements for each role.</p></div><a className="career-button" href="/current-opportunities">View current opportunities <Icon name="arrow" size={17} /></a></div>
            </div>
          </section>
        </>
      )}
      {type === '/current-opportunities' && (
        <section className="content-section current-opportunities">
          <div className="container">
            <div className="careers-intro">
              <p className="eyebrow">WORK WITH US</p>
              <h2>Build the future of energy</h2>
              <p>Review available positions below, including role details, requirements and application deadlines where provided.</p>
            </div>
            <div className="current-opportunities-heading"><div><span>OPEN POSITIONS</span><h3>Current opportunities</h3></div></div>
            <div className="career-vacancy-list">
              {careersLoading ? <div className="careers-status">Loading opportunities…</div> : currentCareers.length === 0 ? <div className="careers-status"><h3>No current openings</h3><p>Please check back later for new vacancies.</p></div> : (
                currentCareers.map((job) => (
                  <article className="career-vacancy" key={job._id}>
                    <div className="career-vacancy-top"><div><span>{job.reference || 'CEYPETCO VACANCY'}</span><h3>{job.title}</h3></div>{job.applicationDeadline && <div className="career-deadline"><small>APPLICATION DEADLINE</small><strong>{new Date(job.applicationDeadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>}</div>
                    <div className="career-vacancy-meta">{[job.department, job.location, job.type].filter(Boolean).map((item) => <span key={item}>{item}</span>)}</div>
                    {job.description && <p className="career-vacancy-description">{job.description}</p>}
                    {(job.responsibilities || job.requirements) && <div className="career-vacancy-details">{job.responsibilities && <div><h4>What the role involves</h4><p>{job.responsibilities}</p></div>}{job.requirements && <div><h4>What you will need</h4><p>{job.requirements}</p></div>}</div>}
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      )}
      {type === '/contact' && (
        <section className="content-section">
          <div className="container contact-grid">
            <div>
              <p className="eyebrow">CONTACT INFORMATION</p>
              <h2>Find the right team</h2>
              <div className="contact-cards">
                {[
                  ['Customer Care', '+94 117 296 130'],
                  ['Head Office', '+94 117 296 100'],
                  ['Refinery', '+94 11 254 1382'],
                  ['Aviation · Katunayake', '+94 11 225 1319'],
                ].map(([name, phone]) => (
                  <article key={name}>
                    <span>
                      <Icon name="phone" size={20} />
                    </span>
                    <div>
                      <small>{name}</small>
                      <a href={`tel:${phone.replaceAll(' ', '')}`}>{phone}</a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <form className="contact-form" onSubmit={submitContactForm}>
              <p className="eyebrow">SEND A MESSAGE</p>
              <h3>How can we help?</h3>
              <div className="field-row">
                <input aria-label="Name" name="name" placeholder="Your name" value={contactForm.name} onChange={updateContactField} maxLength="150" required />
                <input
                  aria-label="Email"
                  name="email"
                  placeholder="Email address"
                  type="email"
                  value={contactForm.email}
                  onChange={updateContactField}
                  maxLength="254"
                  required
                />
              </div>
              <input aria-label="Phone" name="phone" placeholder="Phone number" type="tel" value={contactForm.phone} onChange={updateContactField} maxLength="40" />
              <input
                aria-label="Subject"
                name="subject"
                placeholder="Subject"
                value={contactForm.subject}
                onChange={updateContactField}
                maxLength="200"
                required
              />
              <textarea
                aria-label="Message"
                name="message"
                placeholder="Your message"
                rows="5"
                value={contactForm.message}
                onChange={updateContactField}
                maxLength="5000"
                required
              ></textarea>
              {contactResult && <p className={`contact-form-result ${contactResult.type}`} role={contactResult.type === 'error' ? 'alert' : 'status'}>{contactResult.message}</p>}
              <button type="submit" disabled={contactSubmitting}>
                {contactSubmitting ? 'Sending…' : 'Send message'} <Icon name="arrow" size={17} />
              </button>
            </form>
          </div>
        </section>
      )}
      {managedSections && managedSections.length > 0 && !preserveTemplate && (
        <ManagedSections sections={managedSections} />
      )}
    </main>
  );
}

function App() {
  const { t } = useLanguage();
  const showOriginalPage = new URLSearchParams(window.location.search).get('cmsPreview') === 'original';
  const [path, setPath] = useState(
    () => window.location.pathname.replace(/\/$/, '') || '/',
  );
  const [isNavigating, setIsNavigating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navDropClosed, setNavDropClosed] = useState(true);
  const [navAboutDropClosed, setNavAboutDropClosed] = useState(true);
  const [navMediaDropClosed, setNavMediaDropClosed] = useState(true);
  const [navCareersDropClosed, setNavCareersDropClosed] = useState(true);
  const [slide, setSlide] = useState(0);
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [homeServices, setHomeServices] = useState([]);
  const [managedPage, setManagedPage] = useState(null);
  const cleanPath = (path || '').split('?')[0].replace(/\/$/, '') || '/';
  const preserveOriginalTemplate = new Set([
    '/', '/about', '/history', '/services', '/management', '/subsidiaries', '/energy-ministries',
    '/marketing-sales', '/refinery', '/aviation', '/agro-chemicals', '/lubricants',
    '/services/marine-bunkering', '/bunkering', '/electric-mobility', '/ev-charging',
    '/news', '/notices', '/tenders', '/projects', '/careers', '/annual-reports', '/contact',
    '/regional-offices', '/right-to-information', '/consumer-registration', '/online-banking',
    '/mobile-app', '/media', '/gallery',
  ]).has(cleanPath);
  const managedPageHasContent = Boolean(
    managedPage &&
      ((managedPage.sections && managedPage.sections.length > 0) ||
        ['title', 'subtitle', 'eyebrow', 'image'].some(
          (key) => managedPage.hero && managedPage.hero[key],
        )),
  );
  const changeSlide = (direction) =>
    setSlide(
      (current) =>
        (current + direction + heroSlides.length) % heroSlides.length,
    );
  const scrollAfterNavigation = (hash) => {
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => {
        if (hash)
          document
            .querySelector(hash)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else jumpToPageTop();
      }),
    );
  };

  const handleHeaderNavigation = (event) => {
    if (event.defaultPrevented) return;
    const link = event.target.closest('a');
    if (
      !link ||
      link.target === '_blank' ||
      link.hasAttribute('download') ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const url = new URL(link.href, window.location.origin);
    if (url.origin !== window.location.origin) return;
    const nextPath = url.pathname.replace(/\/$/, '') || '/';
    if (nextPath.startsWith('/admin') || nextPath.startsWith('/login')) return;
    if (url.hash && nextPath === path) return;
    event.preventDefault();
    if (!url.hash) jumpToPageTop();
    if (showOriginalPage) url.searchParams.set('cmsPreview', 'original');
    
    setMenuOpen(false);
    setNavDropClosed(true);
    setNavAboutDropClosed(true);
    setNavMediaDropClosed(true);
    setNavCareersDropClosed(true);

    window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
    setPath(nextPath);
    scrollAfterNavigation(url.hash);
  };

  useEffect(() => {
    let active = true;
    setManagedPage(null);
    api.get('/admin/pages/public', { params: { path } })
      .then(({ data }) => { if (active) setManagedPage(data.data || null); })
      .catch(() => { if (active) setManagedPage(null); });
    return () => { active = false; };
  }, [path]);

  useEffect(() => {
    if (!managedPage) return;
    if (managedPage.seoTitle) document.title = managedPage.seoTitle;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && managedPage.seoDescription) meta.setAttribute('content', managedPage.seoDescription);
  }, [managedPage]);

  useEffect(() => {
    if (!managedPage?.overrides?.length || showOriginalPage) return;
    // Published overrides live in the same nodes React renders. Re-asserting the
    // copy after a commit is safe because a write only happens when the content
    // actually differs, so this never oscillates.
    applyCmsOverrides(managedPage.overrides);
  });

  useEffect(() => {
    if (!managedPage?.overrides?.length) return undefined;
    // Late-mounted template content (deferred images, fonts) is caught by a short
    // settling window. A MutationObserver must not be used here: it re-entered
    // React's commit phase and destroyed the child nodes reconciliation tracks.
    // In editor preview the canvas owns the DOM, so apply the published copy once.
    if (showOriginalPage) {
      applyCmsOverrides(managedPage.overrides);
      return undefined;
    }
    return scheduleCmsOverrides(managedPage.overrides);
  }, [managedPage, path, showOriginalPage]);

  useEffect(() => {
    const handlePopState = () => {
      if (!window.location.hash) jumpToPageTop();
      setPath(window.location.pathname.replace(/\/$/, '') || '/');
      scrollAfterNavigation(window.location.hash);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeMenu = (event) => {
      if (event.type === 'keydown' && event.key !== 'Escape') return;
      if (event.type === 'resize' && window.innerWidth <= 900) return;
      setMenuOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeMenu);
    window.addEventListener('resize', closeMenu);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeMenu);
      window.removeEventListener('resize', closeMenu);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (path !== '/') return undefined;
    let cancelled = false;
    const loadNews = async () => {
      setNewsLoading(true);
      try {
        const res = await api.get('/admin/news', {
          params: { limit: 3 },
        });
        if (!cancelled)
          setNews(res.data && res.data.data ? res.data.data : []);
      } catch (err) {
        if (!cancelled) setNews([]);
      } finally {
        if (!cancelled) setNewsLoading(false);
      }
    };
    loadNews();
    return () => {
      cancelled = true;
    };
  }, [path]);

  useEffect(() => {
    if (path !== '/') return undefined;
    let cancelled = false;
    const loadHomeServices = async () => {
      try {
        const res = await api.get('/admin/home-services', {
          params: { limit: 50 },
        });
        if (!cancelled)
          setHomeServices(
            res.data && res.data.data ? res.data.data : [],
          );
      } catch (err) {
        if (!cancelled) setHomeServices([]);
      }
    };
    loadHomeServices();
    return () => {
      cancelled = true;
    };
  }, [path]);

  useEffect(() => {
    const timer = window.setInterval(() => changeSlide(1), 5000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const selectors =
      [
        '.section-heading',
        '.about-copy',
        '.image-composition',
        '.quick-card',
        '.home-service-card',
        '.home-services-all',
        '.regional-office-card',
        '.bulk-step-grid article',
        '.bulk-resource-grid a',
        '.bulk-region-grid article',
        '.notice-document-grid article',
        '.sorem-impact-grid article',
        '.sorem-detail-grid article',
        '.sorem-timeline article',
        '.annual-report-grid a',
        '.rti-officer-grid article',
        '.division-card',
        '.service-card',
        '.banking-panel',
        '.story-grid',
        '.vision-grid article',
        '.leadership-grid article',
        '.news-grid article',
        '.tender-list article',
        '.career-grid > div',
        '.contact-grid > *',
        '.services-stats > div',
        '.page-title-row',
        '.service-band-inner',
        '.division-story > *',
        '.division-stat-band .container > div',
        '.division-detail-grid > *',
        '.division-cta .container',
        '.history-timeline article',
        '.history-gallery figure',
        '.management-groups details',
        '.contact-location-grid article',
        '.fuel-map-heading > *',
        '.fuel-map-panel',
        '.directory-toolbar > *',
        '.station-results article',
        '.refinery-opening-grid > *',
        '.refinery-photo-strip figure',
        '.refinery-history-grid > *',
        '.refinery-importance-grid article',
        '.process-visual',
        '.marketing-intro-grid > *',
        '.marketing-stats > div',
        '.pricing-heading > *',
        '.fuel-price-card',
        '.pricing-note',
        '.marketing-resources .container > *',
        '.aviation-opening-grid > *',
        '.aviation-stats > div',
        '.aviation-price-heading > *',
        '.aviation-price-table article',
        '.aviation-fuel-grid article',
        '.aviation-gallery figure',
        '.aviation-payment-grid > *',
        '.aviation-location-grid > article',
        '.agro-opening-grid > *',
        '.agro-cert-grid article',
        '.agro-role-grid > *',
        '.agro-flipper-grid > *',
        '.agro-product-grid article',
        '.agro-strategy-grid > *',
        '.lubricant-intro-grid > *',
        '.lubricant-purpose article',
        '.oil-types-copy > *',
        '.oil-chart-wrap',
        '.lubricant-products-heading > *',
        '.lubricant-table article',
        '.mb-section-heading',
        '.mb-intro-grid > *',
        '.mb-vessel-card',
        '.mb-fuel-card',
        '.mb-why-card',
        '.mb-infra-grid > *',
        '.mb-process-step',
        '.mb-quality-card',
        '.mb-safety-item',
        '.mb-compliance-grid > *',
        '.mb-stat-card',
        '.mb-timeline-item',
        '.mb-faq-grid > *',
        '.mb-enquiry-grid > *',
        '.mb-cta-inner',
        '.em-section-heading',
        '.em-about-grid > *',
        '.em-stat-card',
        '.em-location-card',
        '.em-notice-inner',
        '.em-tech-card',
        '.em-process-step',
        '.em-development-step',
        '.em-safety-card',
        '.em-benefit-card',
        '.em-sustainability-grid > *',
        '.em-enquiry-grid > *',
        '.em-faq-grid > *',
        '.em-cta-inner',
      ].join(',');



    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -45px' },
    );

    const observed = new WeakSet();

    const applyReveal = () => {
      const allTargets = document.querySelectorAll(selectors);
      allTargets.forEach((element, index) => {
        if (element.classList.contains('is-visible') || observed.has(element)) return;
        if (isReduced) {
          element.classList.add('is-visible');
          return;
        }
        element.classList.add('reveal-item');
        element.style.setProperty('--reveal-delay', `${(index % 4) * 70}ms`);
        observer.observe(element);
        observed.add(element);
      });
    };

    applyReveal();

    const mutationObserver = new MutationObserver(() => applyReveal());
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [path]);

  useEffect(() => {
    const selectors = ['.home-news .news-grid article'];
    if (path === '/news') {
      selectors.push('.media-news-page .news-grid article');
    }
    const cards = document.querySelectorAll(selectors.join(','));
    if (!cards.length) return undefined;

    cards.forEach((element, index) => {
      element.classList.add('reveal-item');
      element.style.setProperty('--reveal-delay', `${(index % 4) * 70}ms`);
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cards.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -45px' },
    );

    cards.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [path, news]);
  return (
    <div className="site-shell" onClick={handleHeaderNavigation}>
      <header className="header">
        <div className="container nav-wrap">
          <a className="brand notranslate" href="/" translate="no">
            <img
              src="/images/ceypetco-logo.png"
              alt="Ceylon Petroleum Corporation logo"
            />
            <span>
              <b>CEYPETCO</b>
              <small>Ceylon Petroleum Corporation</small>
            </span>
          </a>
          <button
            type="button"
            className={`menu-button ${menuOpen ? 'is-open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={t('menu')}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <nav
            id="primary-navigation"
            className={`nav notranslate ${menuOpen ? 'open' : ''}`}
            aria-label="Primary navigation"
            translate="no"
          >
            <a className={path === '/' ? 'active' : ''} href="/">
              {t('home')}
            </a>
            <div
              className={`nav-group ${navAboutDropClosed ? 'closed' : ''} ${path === '/about' || path === '/management' || path === '/history' || path === '/subsidiaries' || path === '/energy-ministries' ? 'active' : ''}`}
              onMouseEnter={() => setNavAboutDropClosed(false)}
            >
              <a
                href="/about"
                aria-expanded={!navAboutDropClosed}
                onClick={(event) => {
                  if (!window.matchMedia('(max-width: 900px)').matches) return;
                  event.preventDefault();
                  setNavAboutDropClosed((closed) => !closed);
                  setNavDropClosed(true);
                  setNavMediaDropClosed(true);
                  setNavCareersDropClosed(true);
                }}
              >
                {t('discover')}{' '}
                <span className="chevron" aria-hidden="true">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </a>
              <div className="nav-dropdown">
                <div className="dropdown-heading">
                  <span>{t('aboutLabel')}</span>
                  <b>{t('aboutTitle')}</b>
                  <p>{t('aboutIntro')}</p>
                </div>
                <div className="dropdown-links">
                  <a href="/about">
                    <b>{t('aboutUs')}</b>
                    <small>Our mission, vision and leadership</small>
                  </a>
                  <a href="/management">
                    <b>Management</b>
                    <small>Corporate and operational leadership</small>
                  </a>
                  <a href="/history">
                    <b>{t('ourHistory')}</b>
                    <small>Our journey through the decades</small>
                  </a>
                  <a href="/subsidiaries">
                    <b>Subsidiaries</b>
                    <small>CPSTL and TPTL</small>
                  </a>
                  <a href="/energy-ministries">
                    <b>Related ministries</b>
                    <small>Related public institutions</small>
                  </a>
                </div>
              </div>
            </div>
            <div
              className={`nav-group services-nav-group ${navDropClosed ? 'closed' : ''} ${path === '/services' || path === '/online-banking' || path === '/services/marine-bunkering' || divisionPages[path] || additionalOperationPages[path] ? 'active' : ''}`}
              onMouseEnter={() => setNavDropClosed(false)}
            >
              <a
                href="/services"
                aria-expanded={!navDropClosed}
                onClick={(event) => {
                  if (!window.matchMedia('(max-width: 900px)').matches) return;
                  event.preventDefault();
                  setNavDropClosed((closed) => !closed);
                  setNavAboutDropClosed(true);
                  setNavMediaDropClosed(true);
                  setNavCareersDropClosed(true);
                }}
              >
                {t('services')}{' '}
                <span className="chevron" aria-hidden="true">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </a>
              <div className="nav-dropdown">
                <div className="dropdown-heading">
                  <span>{t('servicesLabel')}</span>
                  <b>{t('servicesTitle')}</b>
                  <p>{t('servicesCopy')}</p>
                </div>
                <div className="dropdown-links">
                  <a href="/services">
                    <b>{t('allServices')}</b>
                    <small>Applications and public access</small>
                  </a>
                  <a href="/refinery">
                    <b>{t('refinery')}</b>
                    <small>Operations and capabilities</small>
                  </a>
                  <a href="/marketing-sales">
                    <b>{t('marketing')}</b>
                    <small>Distribution and fuel products</small>
                  </a>
                  <a href="/aviation">
                    <b>{t('aviation')}</b>
                    <small>Airport fueling services</small>
                  </a>
                  <a href="/agro-chemicals">
                    <b>{t('agro')}</b>
                    <small>Crop-protection solutions</small>
                  </a>
                  <a href="/lubricants">
                    <b>{t('lubricants')}</b>
                    <small>Automotive and industrial oils</small>
                  </a>
                  <a href="/services/marine-bunkering">
                    <b>Marine Bunkering</b>
                    <small>Marine fuel information</small>
                  </a>
                  <a href="/ev-charging">
                    <b>EV Charging</b>
                    <small>Charging locations and guidance</small>
                  </a>
                  <a href="/special-chemicals">
                    <b>Special Chemicals</b>
                    <small>Industrial specialty products</small>
                  </a>
                  <a href="/bitumen">
                    <b>Bitumen</b>
                    <small>Road and industrial materials</small>
                  </a>
                </div>
              </div>
            </div>
            <div
              className={`nav-group media-nav-group ${navMediaDropClosed ? 'closed' : ''} ${['/media', '/news', '/notices', '/publications', '/annual-reports', '/gallery'].includes(path) || path.startsWith('/news/') ? 'active' : ''}`}
              onMouseEnter={() => { setNavMediaDropClosed(false); setNavAboutDropClosed(true); setNavDropClosed(true); setNavCareersDropClosed(true); }}
              onFocus={() => { setNavMediaDropClosed(false); setNavAboutDropClosed(true); setNavDropClosed(true); setNavCareersDropClosed(true); }}
            >
              <a
                href="/media"
                aria-haspopup="true"
                aria-expanded={!navMediaDropClosed}
                onClick={(event) => {
                  if (!window.matchMedia('(max-width: 900px)').matches) return;
                  event.preventDefault();
                  setNavMediaDropClosed((closed) => !closed);
                  setNavAboutDropClosed(true);
                  setNavDropClosed(true);
                  setNavCareersDropClosed(true);
                }}
              >
                {t('media')}{' '}
                <span className="chevron" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </a>
              <div className="nav-dropdown">
                <div className="dropdown-heading">
                  <span>MEDIA CENTRE</span>
                  <b>Stay informed</b>
                  <p>News, public notices, publications and visual stories in one place.</p>
                </div>
                <div className="dropdown-links">
                  <a href="/news"><b>News</b><small>Stories and corporate updates</small></a>
                  <a href="/notices"><b>Notices</b><small>Official public information</small></a>
                  <a href="/publications"><b>Publications</b><small>Annual reports and records</small></a>
                  <a href="/gallery"><b>Gallery</b><small>Photos and videos</small></a>
                </div>
              </div>
            </div>
            <a className={path === '/tenders' ? 'active' : ''} href="/tenders">
              {t('tenders')}
            </a>
            <div
              className={`nav-group careers-nav-group ${navCareersDropClosed ? 'closed' : ''} ${['/careers', '/corporate-life', '/current-opportunities'].includes(path) ? 'active' : ''}`}
              onMouseEnter={() => setNavCareersDropClosed(false)}
            >
              <a
                href="/careers"
                aria-expanded={!navCareersDropClosed}
                onClick={(event) => {
                  if (!window.matchMedia('(max-width: 900px)').matches) return;
                  event.preventDefault();
                  setNavCareersDropClosed((closed) => !closed);
                  setNavAboutDropClosed(true);
                  setNavDropClosed(true);
                  setNavMediaDropClosed(true);
                }}
              >
                {t('careers')}{' '}
                <span className="chevron" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </span>
              </a>
              <div className="nav-dropdown">
                <div className="dropdown-heading"><span>CAREERS</span><b>Grow with purpose</b><p>Discover our people and explore open positions.</p></div>
                <div className="dropdown-links">
                  <a href="/corporate-life"><b>Corporate Life</b><small>People, purpose and pathways</small></a>
                  <a href="/current-opportunities"><b>Current Opportunities</b><small>Available roles and applications</small></a>
                </div>
              </div>
            </div>
            <GoogleTranslate />
            <a
              className={`nav-cta ${path === '/contact' ? 'current' : ''}`}
              href="/contact"
            >
              <span>{t('contact')}</span> <Icon name="arrow" size={16} />
            </a>
          </nav>
        </div>
      </header>
      <div className={`page-transition-wrapper ${isNavigating ? 'is-navigating' : ''}`}>
      {managedPage && managedPageHasContent && !preserveOriginalTemplate && !showOriginalPage ? (
        <ManagedPage page={managedPage} />
      ) : cleanPath === '/' ? (
        <main>
          <section
            className="hero"
            id="home"
          >
            <div className="hero-slides">
              {heroSlides.map((item, index) => (
                <img
                  className={`hero-photo hero-photo-${index + 1} ${index === slide ? 'active' : ''}`}
                  src={item.image}
                  alt={item.alt}
                  key={item.image}
                />
              ))}
            </div>
            <div className="hero-shade"></div>
            <div className="container hero-inner">
              <div className="hero-copy-panel" key={slide}>
                <div className="hero-accent"></div>
                <p className="eyebrow light">{heroSlides[slide].eyebrow}</p>
                <h1>{heroSlides[slide].title}</h1>
                <p className="hero-copy">{heroSlides[slide].copy}</p>
                <a className="hero-link" href={heroSlides[slide].href}>
                  {heroSlides[slide].cta} <Icon name="arrow" size={18} />
                </a>
              </div>
            </div>
            <div
              className="hero-slide-progress"
              role="progressbar"
              aria-label="Hero slide progress"
              aria-valuemin="1"
              aria-valuemax={heroSlides.length}
              aria-valuenow={slide + 1}
            >
              <i
                style={{ width: `${((slide + 1) / heroSlides.length) * 100}%` }}
              ></i>
            </div>
            <button
              className="slider-arrow prev"
              onClick={() => changeSlide(-1)}
              aria-label="Previous image"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              className="slider-arrow next"
              onClick={() => changeSlide(1)}
              aria-label="Next image"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
            <div className="slider-dots">
              {heroSlides.map((item, index) => (
                <button
                  className={index === slide ? 'active' : ''}
                  onClick={() => setSlide(index)}
                  aria-label={`Show image ${index + 1}`}
                  key={item.image}
                ></button>
              ))}
            </div>
          </section>
          <section className="every-drop-section" id="about">
            <div className="container">
              <div className="every-drop-grid">
                <div className="every-drop-content-col">
                  <h2 className="every-drop-title">
                    Every drop powers
                    <br />
                    national <span className="text-red">progress</span>
                  </h2>
                  <p className="every-drop-description">
                    Ceylon Petroleum Corporation plays a vital role in the national economy through the continuous supply of petroleum products. We are committed to ensuring uninterrupted fuel supply so Sri Lanka can keep moving toward a stronger, more resilient economy.
                  </p>
                  <div className="every-drop-features-grid">
                    <div className="drop-feature-card">
                      <div className="feature-icon-wrapper" style={{ color: '#dc2626' }}>
                        <Icon name="shield" size={24} />
                      </div>
                      <h4>Energy Security</h4>
                      <p>Safeguarding a reliable petroleum supply for the country.</p>
                    </div>
                    <div className="drop-feature-card">
                      <div className="feature-icon-wrapper" style={{ color: '#dc2626' }}>
                        <Icon name="droplet" size={24} />
                      </div>
                      <h4>Trusted Supply</h4>
                      <p>Supporting transport, commerce and communities islandwide.</p>
                    </div>
                    <div className="drop-feature-card">
                      <div className="feature-icon-wrapper" style={{ color: '#dc2626' }}>
                        <Icon name="bar-chart" size={24} />
                      </div>
                      <h4>Driving Growth</h4>
                      <p>Powering industries and people for a brighter tomorrow.</p>
                    </div>
                  </div>
                  <div className="every-drop-cta">
                    <a className="every-drop-btn" href="#divisions">
                      SEE OUR OPERATIONS <Icon name="arrow" size={17} />
                    </a>
                  </div>
                </div>
                <div className="every-drop-image-col">
                  <div className="every-drop-image-wrapper">
                    <div className="image-overlay-gradient"></div>
                    <img src="/images/bunkering/jupiter-sun.jpg" alt="Sea Platform" className="every-drop-img" /> 
                  </div>
                  <div className="every-drop-accents">
                    <span></span><span></span><span></span>
                  </div>
                  <div className="every-drop-badge">
                    <div className="every-drop-badge-content">
                      <span className="badge-number">60+</span>
                      <span className="badge-text">YEARS SERVING<br />THE NATION</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="home-services" id="services">
            <div className="container">
              <div className="home-services-heading">
                <div>
                  <p className="eyebrow">PUBLIC ACCESS</p>
                  <h2>Services and resources</h2>
                </div>
                <p>
                  Applications, digital tools, publications and information for
                  customers, dealers and business partners
                </p>
              </div>
              <div className="home-services-grid">
                {(homeServices.length > 0 ? homeServices : fallbackServices).map(
                  (service, index) => (
                    <a
                      className="home-service-card"
                      href={service.link}
                      data-icon={service.icon}
                      key={service._id || service.title}
                    >
                      <span className="home-service-icon">
                        <Icon name={service.icon} size={25} />
                      </span>
                      <span className="home-service-index">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h3>{service.title}</h3>
                      <p>{service.description}</p>
                      <span className="home-service-link">
                        Access service <Icon name="arrow" size={15} />
                      </span>
                    </a>
                  ),
                )}
                <a className="home-services-all" href="/services">
                  <span>Complete service directory</span>
                  <Icon name="arrow" size={22} />
                </a>
              </div>
            </div>
          </section>
          <section className="home-news section" id="news">
            <div className="container">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">LATEST UPDATES</p>
                  <h2>News &amp; media</h2>
                </div>
                <p>
                  The latest news and announcements from across Ceypetco
                </p>
              </div>
              <div className="news-grid">
                {newsLoading ? (
                  <p className="news-grid-empty">Loading latest updates...</p>
                ) : news.length === 0 ? (
                  <p className="news-grid-empty">
                    No published updates available yet
                  </p>
                ) : (
                  news.map((item) => (
                    <article key={item._id}>
                      {item.featuredImage ? (
                        <div
                          className="news-image"
                          style={{
                            backgroundImage: `url(${displayImageUrl(item.featuredImage)})`,
                          }}
                        ></div>
                      ) : (
                        <div className="news-image"></div>
                      )}
                      <div>
                        <p className="eyebrow">
                          {(item.category || 'News')
                            .replace(/-/g, ' ')
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </p>
                        <h3>{item.title}</h3>
                        <p className="news-preview">{getNewsPreview(item)}</p>
                        <a className="home-news-link" href={`/news/${item._id}`}>
                          Read update <Icon name="arrow" size={16} />
                        </a>
                      </div>
                    </article>
                  ))
                )}
              </div>
              <div className="home-news-footer">
                <a className="text-link" href="/news">
                  View all news <Icon name="arrow" size={17} />
                </a>
              </div>
            </div>
          </section>
          <section className="operations section" id="divisions">
            <div className="container">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">OUR OPERATIONS</p>
                  <h2>
                    One corporation
                    <br />A nation in motion
                  </h2>
                </div>
                <p>
                  From refining and distribution to specialised sectors, our
                  operations work together to serve Sri Lanka’s energy needs
                </p>
              </div>
              <div className="division-grid">
                {divisions.map(([title, text, image, href]) => (
                  <a className="division-card" href={href} key={title} aria-label={`Explore ${title}`}>
                    <img src={image} alt="" loading="lazy" decoding="async" />
                    <div className="division-overlay"></div>
                    <div className="division-content">
                      <h3>{title}</h3>
                      <p>{text}</p>
                      <span className="division-arrow" aria-hidden="true">
                        <Icon name="arrow" size={20} />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
          <section className="home-brands section" aria-labelledby="home-brands-heading">
            <div className="container">
              <div className="home-brands-split-layout">
                <div className="home-brands-info">
                  <p className="eyebrow">CEYPETCO BRANDS</p>
                  <h2 id="home-brands-heading">Built for every journey</h2>
                  <p className="home-brands-desc">
                    Explore the Ceypetco brands serving industry, transport,
                    agriculture and emerging energy needs.
                  </p>
                </div>
                <div className="home-brands-grid-wrapper">
                  <div className="home-brands-grid">
                    {brandLogos.map((brand, index) => (
                      <a href={brand.href} className="home-brand-grid-card" key={index} aria-label={`Explore ${brand.name}`}>
                        <div className="home-brand-logo-box">
                          <img src={brand.image} alt={`${brand.name} logo`} loading="lazy" decoding="async" />
                        </div>
                        <span className="home-brand-name">{brand.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="service-band">
            <div className="container service-band-inner">
              <div>
                <p className="eyebrow light">PUBLIC SERVICES</p>
                <h2>
                  Everything you need,
                  <br />
                  in one place
                </h2>
              </div>
              <div className="service-links">
                {[
                  [
                    'Product Specifications',
                    'https://ceypetco.gov.lk/wp-content/uploads/2026/04/Marketing-Sepecifictions.pdf',
                  ],
                  ['Supplier Registration', '/tenders#supplier-registration'],
                  ['Consumer Registration', '/consumer-registration'],
                  ['Annual Reports', '/annual-reports'],
                  ['Right to Information', '/right-to-information'],
                  ['Notices & Projects', '/notices'],
                ].map(([item, href]) => (
                  <a href={href} key={item}>
                    {item}
                    <Icon name="arrow" size={17} />
                  </a>
                ))}
              </div>
            </div>
          </section>
          <div id="fuel-network">
            <FuelDistributionMap />
          </div>
          {managedPage && !showOriginalPage && !preserveOriginalTemplate && (
            <ManagedSections sections={managedPage.sections} />
          )}
        </main>
      ) : districtFromPath(cleanPath) ? (
        <FuelStationPage district={districtFromPath(cleanPath)} />
      ) : cleanPath.startsWith('/management-team/') ? (
        <ManagementTeamProfile
          key={cleanPath}
          memberId={cleanPath.split('/').pop()}
        />
      ) : cleanPath.startsWith('/news/') ? (
        <NewsDetailPage key={cleanPath}
          newsId={cleanPath.split('/').pop()} />
      ) : cleanPath === '/mobile-app' ? (
        <MobileAppsPage />
      ) : cleanPath === '/gallery' ? (
        <GalleryPage />
      ) : cleanPath === '/services/marine-bunkering' || cleanPath === '/bunkering' ? (
        <MarineBunkeringPage />
      ) : (
        <InnerPage
          type={cleanPath}
          preserveTemplate={preserveOriginalTemplate}
          managedSections={
            managedPage && !showOriginalPage ? managedPage.sections : []
          }
        />
      )}
      <footer id="footer">
        <div className="container footer-main">
          <div className="footer-brand">
            <div className="footer-brand-lockup">
              <img
                src="/images/ceypetco-logo.png"
                alt="Ceylon Petroleum Corporation logo"
              />
              <div>
                <h3>Ceylon Petroleum Corporation</h3>
                <span>CEYPETCO · SRI LANKA</span>
              </div>
            </div>
            <p>
              {t('footerCopy')}
            </p>
            <a className="footer-brand-link" href="/about">
              {t('footerLink')} <Icon name="arrow" size={16} />
            </a>
          </div>
          <nav className="footer-links" aria-label="Corporation links">
            <h4>{t('corporation')}</h4>
            <a href="/about">{t('aboutUs')}</a>
            <a href="/management">Management</a>
            <a href="/history">{t('ourHistory')}</a>
            <a href="/subsidiaries">Subsidiaries</a>
            <a href="/energy-ministries">Related ministries</a>
            <a href="/services">{t('allServices')}</a>
            <a href="/careers">{t('careers')}</a>
            <a href="/contact">{t('contact')}</a>
          </nav>
          <nav className="footer-links" aria-label="Public resource links">
            <h4>{t('publicResources')}</h4>
            <a href="/marketing-sales">{t('fuelPricing')}</a>
            <a href="/tenders">{t('tenders')}</a>
            <a href="/notices">{t('notices')}</a>
            <a href="/annual-reports">{t('annualReports')}</a>
            <a href="/right-to-information">{t('rightToInformation')}</a>
          </nav>
          <div className="footer-contact">
            <h4>{t('headOffice')}</h4>
            <div className="footer-contact-item">
              <Icon name="building" size={19} />
              <p>
                No. 609, Dr. Danister de Silva Mawatha, Colombo 09, Sri Lanka
              </p>
            </div>
            <div className="footer-contact-item">
              <Icon name="phone" size={19} />
              <div>
                <span>{t('generalLine')}</span>
                <a href="tel:+94117296100">+94 11 7296 100</a>
              </div>
            </div>
            <div className="footer-contact-item">
              <Icon name="globe" size={19} />
              <div>
                <span>{t('email')}</span>
                <a href="mailto:secretariat@ceypetco.gov.lk">
                  secretariat@ceypetco.gov.lk
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 Ceylon Petroleum Corporation</span>
          <span>{t('footerTagline')}</span>
        </div>
      </footer>
      <PopupNotice />
      </div>
    </div>
  );
}

function TenderDownloadModal({ tender, onClose }) {
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/tender-downloads', {
        tenderId: tender._id,
        email,
        mobileNumber
      });
      // Success: download and close
      window.open(tender.url, '_blank');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request download');
      setLoading(false);
    }
  };

  return (
    <div className="tender-modal-overlay" style={{ display: 'flex', zIndex: 9999, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.6)', alignItems: 'center', justifyContent: 'center' }}>
      <div className="tender-modal-content" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: 0, backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Download Tender Document</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {/* Form Side */}
          <div style={{ flex: '1 1 300px', padding: '24px', borderRight: '1px solid #eee' }}>
            <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>Please provide your contact details to download the tender document for <strong>{tender.title}</strong>.</p>
            {error && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label>
                <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email Address *</span>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }} />
              </label>
              <label>
                <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Mobile Number *</span>
                <input type="tel" required value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }} />
              </label>
              <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '0.5rem' }}>
                {loading ? 'Processing...' : 'Submit & Download'}
              </button>
            </form>
          </div>

          {/* Preview Side */}
          <div style={{ flex: '1 1 300px', padding: '24px', backgroundColor: '#fafafa' }}>
            <p style={{ marginBottom: '1rem', fontWeight: 600 }}>Document Preview</p>
            <div style={{ width: '100%', height: '300px', border: '1px solid #ddd', background: '#fff', overflow: 'hidden', position: 'relative' }}>
              <iframe src={`https://docs.google.com/gview?url=${encodeURIComponent(tender.url)}&embedded=true`} width="100%" height="100%" style={{ border: 'none', pointerEvents: 'none' }}></iframe>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

