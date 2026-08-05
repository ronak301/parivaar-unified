import * as React from "react";
import {
  FieldValues,
  useForm,
  UseFormProps,
  UseFormReturn,
} from "react-hook-form";

/**
 * A wrapper around react-hook-form's useForm hook that tracks form submissions
 * and injects formName into the context so that form elements can use it for their
 * own analytics purposes
 *
 * @param formName
 * @param props
 */
export function useTrackedForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any
>(
  formName: string,
  props?: UseFormProps<TFieldValues, TContext>
): UseFormReturn<TFieldValues, TContext> & { formName: string } {
  const formProps = useForm(props);

  const handleSubmit = React.useCallback(
    (handler) =>
      formProps.handleSubmit(async (args) => {
        await handler(args);
      }),
    [formName, formProps]
  );

  return { ...formProps, formName, handleSubmit };
}
