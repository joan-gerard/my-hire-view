import { HERO_IMAGES } from "@/lib/marketing/constants";

export function Hero() {
  return (
    <section className="ot-hero" aria-labelledby="hero-title">
      <div className="ot-wrap ot-hero-copy">
        <p className="ot-eyebrow">
          <i />
          Stand out & Get seen
          <i />
        </p>
        <h1 id="hero-title" className="ot-hero-title">
          <span>We</span>
          <span>built</span>
          <span className="ot-word-lime">MyHireView</span>
          <span>because</span>
          <span>good</span>
          <span className="ot-word-pink">applications</span>
          <span>kept</span>
          <span>vanishing</span>
          <span>in</span>
          <span>the</span>
          <span>void.</span>
        </h1>
      </div>
      <div className="ot-marquee" aria-hidden="true">
        <div className="ot-marquee-track ot-hero-track">
          {[0, 1].map((copy) => (
            <div className="ot-hero-set" key={copy}>
              {HERO_IMAGES.map((image) => (
                <img
                  key={`${copy}-${image.src}`}
                  src={image.src}
                  alt=""
                  style={{ width: image.width }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
