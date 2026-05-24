type FieldErrorProps = {
  message?: string | null;
  id?: string;
};

export function FieldError({ message, id }: FieldErrorProps) {
  if (!message?.trim()) return null;
  return (
    <p id={id} className="mt-1.5 text-xs text-red-300/90" role="alert">
      {message}
    </p>
  );
}
