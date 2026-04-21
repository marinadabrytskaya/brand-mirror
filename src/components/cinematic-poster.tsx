type CinematicPosterProps = {
  brandName: string;
  title: string;
  genre: string;
  tagline: string;
  scoreBand?: string;
  scoreModifier?: string;
  posterScore?: number;
  posterUrl: string;
  credit?: string;
  placeholderVideoUrl?: string;
  placeholderPosterUrl?: string;
  isPlaceholder?: boolean;
  className?: string;
};

export function CinematicPoster({
  brandName,
  title,
  genre,
  tagline,
  scoreBand,
  scoreModifier,
  posterScore,
  posterUrl,
  credit = "Powered by Sahar",
  placeholderVideoUrl,
  placeholderPosterUrl,
  isPlaceholder = false,
  className = "",
}: CinematicPosterProps) {
  return (
    <div
      className={`brandmirror-poster ${isPlaceholder ? "is-placeholder" : ""} ${className}`.trim()}
      style={{
        backgroundImage: isPlaceholder
          ? undefined
          : `linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.005)), url(${posterUrl}), linear-gradient(180deg, #171c22 0%, #12171c 100%)`,
      }}
    >
      {placeholderVideoUrl ? (
        <video
          className="brandmirror-poster-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={placeholderPosterUrl}
          aria-hidden="true"
        >
          <source src={placeholderVideoUrl} type="video/mp4" />
        </video>
      ) : null}
      <span className="brandmirror-poster-kicker">{credit}</span>
      <div className="brandmirror-poster-copy">
        <h2 className="brandmirror-poster-title">{brandName}</h2>
        <p className="brandmirror-poster-tagline">{tagline}</p>
        <p className="brandmirror-poster-genre">{genre}</p>
      </div>
      <div className="brandmirror-poster-footer">
        {scoreBand && typeof posterScore === "number" ? (
          <p className="brandmirror-poster-tagline">{`RATED ${posterScore} · ${scoreBand}`}</p>
        ) : scoreBand ? (
          <p className="brandmirror-poster-tagline">{scoreBand}</p>
        ) : null}
        {scoreModifier ? <p className="brandmirror-poster-credit">{scoreModifier}</p> : null}
        <span className="brandmirror-poster-credit">{typeof posterScore === "number" ? "brandmirror.app" : title}</span>
      </div>
    </div>
  );
}
