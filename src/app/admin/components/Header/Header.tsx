import "./Header.css";

export default function Header({ leftEl, rightEl, children, subtitle, desc }: any) {
  return (
    <header className="header">
      <div className="header__subtitle">{subtitle}</div>

      <div className="header__top">
        <span className="header__left">{leftEl}</span>
        <h1 className="header__title">{children}</h1>
        <span className="header__right">{rightEl}</span>
      </div>

      <div className="header__bottom">{desc}</div>
    </header>
  );
}
