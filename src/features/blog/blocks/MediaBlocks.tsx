"use client";

import { useState } from "react";
import { galleryLayoutOf, type GalleryBlock, type ImageBlock, type VideoBlock } from "../types";
import { srcSetOf } from "@/features/media/urls";
import { zoomProps } from "@/features/media/zoom";
import playIconAsset from "../../../assets/welcome/play.svg";

// Next імпортує картинки як обʼєкт { src, width, height } — беремо адресу
const playIcon = playIconAsset.src;

export const Image = ({ block }: { block: ImageBlock }) => (
  <figure className={`ab-image ${block.wide ? "ab-image--wide" : ""}`.trim()}>
    <img
      src={block.image.src}
      srcSet={srcSetOf(block.image.src)}
      sizes={block.wide ? "(max-width: 767px) 100vw, 1160px" : "(max-width: 767px) 100vw, 860px"}
      alt={block.image.alt}
      loading="lazy"
      {...zoomProps(block.image.src, block.caption || block.image.alt)}
    />
    {block.caption && <figcaption className="ab-caption">{block.caption}</figcaption>}
  </figure>
);

export const Gallery = ({ block }: { block: GalleryBlock }) => (
  <figure className="ab-gallery">
    <ul
      className="ab-gallery__list"
      data-count={block.images.length}
      data-layout={galleryLayoutOf(block.images.length, block.layout)}
    >
      {block.images.map((img, i) => (
        <li key={i} className="ab-gallery__item">
          <img
            src={img.src}
            srcSet={srcSetOf(img.src)}
            sizes="(max-width: 767px) 85vw, 780px"
            alt={img.alt}
            loading="lazy"
            {...zoomProps(img.src, img.alt || block.caption || "")}
          />
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
            <img src={poster} srcSet={srcSetOf(poster)} sizes="(max-width: 767px) 100vw, 1160px" alt="" loading="lazy" />
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
