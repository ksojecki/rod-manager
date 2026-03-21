import type { UseFormRegisterReturn } from 'react-hook-form';

export interface AuthFormFieldProps {
  label: string;
  type: 'email' | 'password' | 'text';
  registration: UseFormRegisterReturn;
  errorMessage?: string;
  hint?: string;
}

/**
 * Shared labeled auth form field with optional hint and validation message.
 */
export function AuthFormField({
  label,
  type,
  registration,
  errorMessage,
  hint,
}: AuthFormFieldProps) {
  return (
    <label className="form-control w-full">
      <span className="label-text">{label}</span>
      <input
        className="input input-bordered w-full"
        type={type}
        {...registration}
      />
      {hint !== undefined ? (
        <span className="label-text-alt mt-1 text-base-content/60">{hint}</span>
      ) : null}
      {errorMessage !== undefined ? (
        <span className="label-text-alt mt-1 text-error">{errorMessage}</span>
      ) : null}
    </label>
  );
}
