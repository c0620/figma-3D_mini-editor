import { Link } from "react-router";

export function MainButton({ text }: { text: string }) {
  return <div>{text}</div>;
}

export function ActionButton() {
  return <div>ActionButton</div>;
}

export function NavLinkButton({ to }: { to: string }) {
  return (
    <div>
      <Link to={to}>arrow</Link>
    </div>
  );
}

export function OptionButton() {
  return <div>OptionButton</div>;
}
