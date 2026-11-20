"use client";

import { useRef, type CSSProperties } from "react";
import "./MinistriesSection.scss";
import Rubricator from "../ui/Rubricator";
import BlackButton from "../buttons/BlackButton";
import { useStackedCards } from "../../hooks/useStackedCards";
import archeryIconAsset from "../../assets/icons/archery.svg";
import { MINISTRIES } from "@/features/ministries/data";

const archeryIcon = archeryIconAsset.src;

const MinistriesSection = () => {
  const listRef = useRef<HTMLUListElement>(null);
  useStackedCards(listRef);

  return (
    <section className="ministries" aria-labelledby="ministries-title">
      <div className="container ministries__grid">
        {/* Права частина (у розмітці перша — щоб на телефоні була зверху) */}
        <div className="ministries__intro">
          <div className="ministries__intro-inner">
            <Rubricator icon={archeryIcon}>Діяльність</Rubricator>
            <h2 id="ministries-title" className="section-title ministries__title">
              Служіння та проєкти <span className="section-title__accent">Церкви</span>
            </h2>
            <p className="ministries__text">
              Ми віримо, що кожна людина має дар і покликання. Наші служіння — це місця, де ці дари
              знаходять застосування і приносять плід.
            </p>
            {/* TODO: сторінки /sluzhinnya ще немає — там буде перелік усіх служінь і проєктів */}
            <BlackButton className="ministries__button" text="Усі служіння" href="/sluzhinnya" />
          </div>
        </div>

        {/* Ліва частина: картки, що наїжджають одна на одну */}
        <ul ref={listRef} className="ministries__cards">
          {MINISTRIES.map((item, index) => (
            <li
              key={item.title}
              className="ministries__card"
              data-surface="dark"
              style={{ "--index": index } as CSSProperties}
            >
              <img
                className="ministries__photo"
                src={item.photo}
                style={item.photoStyle}
                alt=""
                loading="lazy"
              />
              {item.logo && (
                <img
                  className={`ministries__logo${item.logoInverted ? " ministries__logo--inverted" : ""}`}
                  src={item.logo}
                  alt=""
                />
              )}
              <div className="ministries__body">
                <span className="ministries__tag">{item.tag}</span>
                <h3 className="ministries__card-title">{item.title}</h3>
                <p className="ministries__card-text">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default MinistriesSection;
