"use client";

import { useState } from "react";
import "./FaqSection.scss";
import Rubricator from "../ui/Rubricator";
import questionIconAsset from "../../assets/icons/question.svg";
import { FAQ_CATEGORIES, FAQ_ITEMS } from "./faqData";

// Next імпортує картинки як обʼєкт { src, width, height } — беремо адресу
const questionIcon = questionIconAsset.src;

const ALL = "all";

// Кнопки фільтра: теми + «Всі» в кінці (як у макеті); кількість рахується з даних
const tabs = [
  ...FAQ_CATEGORIES.map((category) => ({
    ...category,
    count: FAQ_ITEMS.filter((item) => item.category === category.id).length,
  })),
  { id: ALL, label: "Всі", count: FAQ_ITEMS.length },
];

const FaqSection = () => {
  const [active, setActive] = useState(FAQ_CATEGORIES[0].id);
  const items = active === ALL ? FAQ_ITEMS : FAQ_ITEMS.filter((item) => item.category === active);

  return (
    <section className="faq" aria-labelledby="faq-title">
      <div className="container">
        <header className="faq__header">
          <Rubricator icon={questionIcon}>Запитання</Rubricator>
          <h2 id="faq-title" className="section-title faq__title">
            Хочете <span className="section-title__accent">дізнатися більше?</span>
          </h2>
          <p className="faq__text">Зібрали відповіді на найпоширеніші питання про нашу спільноту</p>
        </header>

        <div className="faq__tabs" role="group" aria-label="Теми запитань">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`faq__tab${tab.id === active ? " faq__tab--active" : ""}`}
              aria-pressed={tab.id === active}
              onClick={() => setActive(tab.id)}
            >
              {tab.label}
              <span className="faq__tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* key — щоб при зміні теми картки м'яко з'являлись заново */}
        <ul key={active} className="faq__list" aria-live="polite">
          {items.map((item) => (
            <li key={item.question} className="faq__card">
              <span className="faq__badge">{item.badge}</span>
              <h3 className="faq__question">{item.question}</h3>
              <p className="faq__answer">{item.answer}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FaqSection;
