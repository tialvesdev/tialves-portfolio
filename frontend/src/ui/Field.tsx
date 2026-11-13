import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cx } from './cx';

type Base = { label: string; error?: string };

export type TextFieldProps = Base & InputHTMLAttributes<HTMLInputElement> & { multiline?: false };
export type TextAreaFieldProps = Base & TextareaHTMLAttributes<HTMLTextAreaElement> & { multiline: true };

/** Campo de formulário com a moldura da janela de diálogo. */
export function Field(props: TextFieldProps | TextAreaFieldProps) {
  const auto = useId();
  const { label, error, className, multiline, id = auto, ...rest } = props;
  const errId = error ? `${id}-err` : undefined;
  const common = {
    id,
    className: cx('gx-field__input', className),
    'aria-invalid': error ? true : undefined,
    'aria-describedby': errId,
  };
  return (
    <div className="gx-field">
      <label className="gx-field__label" htmlFor={id}>
        {label}
      </label>
      {multiline ? (
        <textarea {...common} {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input {...common} {...(rest as InputHTMLAttributes<HTMLInputElement>)} />
      )}
      {error && (
        <span id={errId} className="gx-field__error">
          {error}
        </span>
      )}
    </div>
  );
}
