import { MainButton } from "../atoms/Button";
import { NavTitle } from "../atoms/Navigation";

export default function HelperPage({ children }: { children: any }) {
  return (
    <div>
      <NavTitle title="test" />
      <div>{children}</div>
      <MainButton />
    </div>
  );
}
