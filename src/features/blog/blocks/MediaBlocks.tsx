import { useState } from "react";
import type { GalleryBlock, ImageBlock, VideoBlock } from "../types";
import playIcon from "../../../assets/welcome/play.svg";

export const Image = ({ block }: { block: ImageBlock }) => (
  <figure className={`ab-image ${block.wide ? "ab-image--wide" : ""}`.trim()}>
    <img src={block.image.src} alt={block.image.alt} loading="lazy" />
    {block.caption && <figcaption className="ab-caption">{block.caption}</figcaption>}
  </figure>
);

export const Gallery = ({ block }: { block: GalleryBlock }) => (
  <figure className="ab-gallery">
    <ul className="ab-gallery__list" data-count={Math.min(block.images.length, 4)}>
      {block.images.map((img, i) => (
        <li key={i} className="ab-gallery__item">
          <img src={img.src} alt={img.alt} loading="lazy" />
        </li>
      ))}
    </ul>
    {block.caption && <figcaption className="ab-caption">{block.caption}</figcaption>}
  </figure>
);

export const Video = ({ block }: { block: VideoBlock }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const poster = block.poster ?? `https://i.ytimg.com/vi/${block.youtubeId}/hqdefault.jpg`;

  return (
    <figure className="ab-video">
      <div className="ab-video__frame" data-surface="dark">
        {isPlaying ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${block.youtubeId}?autoplay=1&rel=0`}
            title={block.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button type="button" className="ab-video__poster" onClick={() => setIsPlaying(true)}>
            <img src={poster} alt="" loading="lazy" />
            <span className="ab-video__play">
              <img src={playIcon} alt="" />
              Дивитися відео
            </span>
            <span className="visually-hidden">: {block.title}</span>
          </button>
        )}
      </div>
      {block.caption && <figcaption className="ab-caption">{block.caption}</figcaption>}
    </figure>
  );
};
