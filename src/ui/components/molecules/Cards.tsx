import { NavLink } from "react-router";

export function CardStart({
  title,
  text,
  image,
  to,
}: {
  title: string;
  text: string;
  image: string;
  to: string;
}) {
  return (
    <div>
      <h3>{title}</h3>
      <div>{text}</div>
      <img src={image}></img>
      <NavLink to={to}>Загрузить</NavLink>
    </div>
  );
}

export function CardAsset() {}
