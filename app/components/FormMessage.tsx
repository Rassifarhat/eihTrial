export type Message = {
  error?: string;
  success?: string;
};

type SearchParams = Record<string, string | string[] | undefined>;

const normalize = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export const getMessageFromSearchParams = (searchParams: SearchParams): Message => {
  const error = normalize(searchParams.error);
  const success = normalize(searchParams.success);

  if (error) {
    return { error };
  }

  if (success) {
    return { success };
  }

  return {};
};

export function FormMessage({ message }: { message?: Message }) {
  if (!message?.error && !message?.success) {
    return null;
  }

  const isError = Boolean(message.error);
  const text = message.error || message.success || "";

  return (
    <div
      className={
        isError
          ? "mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200"
          : "mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100"
      }
    >
      {text}
    </div>
  );
}
