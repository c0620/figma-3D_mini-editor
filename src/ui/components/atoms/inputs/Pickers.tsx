export function InputColor({ label }: { label: string }) {
  return (
    <>
      <label>
        {label}
        <input type="color" />
      </label>
    </>
  );
}
