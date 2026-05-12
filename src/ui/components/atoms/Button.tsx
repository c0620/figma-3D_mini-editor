import { Link } from "react-router";

export function MainButton({
  text,
  action,
  to,
}: {
  text: string;
  action: "nav" | "event";
  to?: string;
}) {
  switch (action) {
    case "event":
      return <div>{text}</div>;
    case "nav":
      return <Link to={to!}>{text}</Link>;
  }
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
