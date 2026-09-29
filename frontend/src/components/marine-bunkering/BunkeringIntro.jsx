import { Check } from 'lucide-react';

const HIGHLIGHTS = [
  'Marine fuel supply for propulsion and auxiliary engines',
  'Established petroleum storage and handling infrastructure',
  'Coordination with maritime and port stakeholders',
];

const BunkeringIntro = () => (
  <section className="mb-section mb-intro" id="bunkering-intro" aria-labelledby="mb-intro-title">
    <div className="container mb-intro-grid">
      <div className="mb-intro-copy">
        <p className="mb-eyebrow">About bunkering</p>
        <h2 id="mb-intro-title">Fuel supply for a vital shipping hub</h2>
        <p>
          Ceylon Petroleum Corporation (CPC), known as CEYPETCO, supports
          marine fuel supply for vessels calling at Sri Lankan ports. Bunkers
          power a ship&apos;s main engines, auxiliary machinery and onboard systems.
        </p>
        <p>
          Sri Lanka sits close to major Indian Ocean shipping routes. Its port
          and petroleum infrastructure makes the island an important location
          for vessel services.
        </p>
        <p>
          Fuel sourcing, storage, handling and coordination with port teams all
          play a part in a reliable bunkering operation.
        </p>
        <ul className="mb-intro-points">
          {HIGHLIGHTS.map((item) => (
            <li key={item}>
              <Check size={17} aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <figure className="mb-intro-figure">
        <div className="mb-intro-accents" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <img
          src="/images/bunkering/jupiter-sun.jpg"
          alt="Marine fuel transfer alongside a commercial vessel"
          loading="lazy"
          decoding="async"
        />
        <figcaption>
          <span>VESSEL SUPPLY</span>
          <b>Coordinated fuel delivery at the port</b>
        </figcaption>
      </figure>
    </div>
  </section>
);

export default BunkeringIntro;
