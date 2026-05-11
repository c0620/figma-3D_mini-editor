export function TextBlock({
  text,
  textListItems,
}: {
  text: string;
  textListItems: Array<string> | null;
}) {
  return (
    <div>
      {text} {textListItems && textListItems.map((item) => <p>{item}</p>)}
    </div>
  );
}
export function ScrollPanel({ children }: { children: any }) {
  return <div>{children}</div>;
}
