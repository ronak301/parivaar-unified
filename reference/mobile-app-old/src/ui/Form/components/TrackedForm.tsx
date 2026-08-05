import { isFunction } from "lodash";
import * as React from "react";
import {
  FieldPath,
  FieldValues,
  FormProvider,
  UseFormProps,
  UseFormReturn,
} from "react-hook-form";

import { useTrackedForm } from "./useTrackForm";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export function runIfFn<T, U>(
  valueOrFn: T | ((...fnArgs: U[]) => T),
  ...args: U[]
): T {
  return isFunction(valueOrFn) ? valueOrFn(...args) : valueOrFn;
}

export interface TrackedFormProps<
  TFieldValues extends FieldValues,
  TContext = any
> {
  /**
   * Form name
   */
  name: string;

  /**
   * Field name to target the focus on
   */
  focus?: FieldPath<TFieldValues>;

  /**
   * Additional props to pass to the underlying `react-hook-form` form.
   */
  formHookProps?: UseFormProps<TFieldValues, TContext>;

  /**
   * Contents of the form
   */
  children:
    | React.ReactNode
    | (({ formState }: UseFormReturn<TFieldValues>) => React.ReactNode);
}

/**
 * This component is a wrapper around the FormProvider from react-hook-form.
 *
 * It enforces the user of the `useTrackedForm` hook to provide a name for the form,
 * and a form observer to track the form viewed event.
 *
 * @param name
 * @param onSubmit
 * @param formHookProps
 * @param focus
 * @param children
 * @constructor
 */
export function TrackedForm<T extends FieldValues>({
  name,
  formHookProps = {},
  focus = undefined,
  children,
  ...rest
}: TrackedFormProps<T>) {
  const form = useTrackedForm(name, formHookProps);

  React.useEffect(() => {
    if (focus) {
      form.setFocus(focus);
    }
  }, [focus, form, form.setFocus]);

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
      {...rest}>
      <FormProvider {...form}>{runIfFn(children, form)}</FormProvider>
    </KeyboardAwareScrollView>
  );
}
