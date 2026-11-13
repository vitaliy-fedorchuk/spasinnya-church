"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/server/auth/actions";

const LoginForm = ({ next }: { next?: string }) => {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form className="login__form" action={action} noValidate>
      {next && <input type="hidden" name="next" value={next} />}

      <label className="a-field">
        <span className="a-field__label">Електронна пошта</span>
        <input
          className="a-input"
          type="email"
          name="email"
          autoComplete="username"
          defaultValue={state.email}
          required
          autoFocus
        />
      </label>

      <label className="a-field">
        <span className="a-field__label">Пароль</span>
        <input className="a-input" type="password" name="password" autoComplete="current-password" required />
      </label>

      {state.error && (
        <p className="login__error" role="alert">
          {state.error}
        </p>
      )}

      <button className="a-btn a-btn--primary login__submit" type="submit" disabled={pending}>
        {pending ? "Входимо…" : "Увійти"}
      </button>
    </form>
  );
};

export default LoginForm;
