import React, { FormEvent, ReactElement, useCallback } from 'react';

import { selectors } from '@grafana/e2e-selectors';

import { VariableLegend } from '../editor/VariableLegend';
import { VariableTextField } from '../editor/VariableTextField';
import { VariableEditorProps } from '../editor/types';
import { TextBoxVariableModel } from '../types';

export interface Props extends VariableEditorProps<TextBoxVariableModel> {}

export function TextBoxVariableEditor({ onPropChange, variable: { query, placeholder } }: Props): ReactElement {
  const updateVariable = useCallback(
    (event: FormEvent<HTMLInputElement>, updateOptions: boolean) => {
      event.preventDefault();
      onPropChange({ propName: 'originalQuery', propValue: event.currentTarget.value, updateOptions: false });
      onPropChange({ propName: 'query', propValue: event.currentTarget.value, updateOptions });
    },
    [onPropChange]
  );

  const updatePlaceholderVariable = useCallback(
    (event: FormEvent<HTMLInputElement>, updateOptions: boolean) => {
      event.preventDefault();
      onPropChange({ propName: 'placeholder', propValue: event.currentTarget.value, updateOptions });
    },
    [onPropChange]
  );

  const onChange = useCallback((e: FormEvent<HTMLInputElement>) => updateVariable(e, false), [updateVariable]);
  const onBlur = useCallback((e: FormEvent<HTMLInputElement>) => updateVariable(e, true), [updateVariable]);
  const onPlaceholderChange = useCallback((e: FormEvent<HTMLInputElement>) => updatePlaceholderVariable(e, false), [updatePlaceholderVariable]);
  const onPlaceholderBlur = useCallback((e: FormEvent<HTMLInputElement>) => updatePlaceholderVariable(e, true), [updatePlaceholderVariable]);
  const onPlaceholderChange = useCallback(
    (e: FormEvent<HTMLInputElement>) => updatePlaceholderVariable(e, false),
    [updatePlaceholderVariable],
  );
  const onPlaceholderBlur = useCallback(
    (e: FormEvent<HTMLInputElement>) => updatePlaceholderVariable(e, true),
    [updatePlaceholderVariable]
  );

  return (
    <>
      <VariableLegend>Text options</VariableLegend>
      <VariableTextField
        value={query}
        name="Default value"
        placeholder="default value, if any"
        onChange={onChange}
        onBlur={onBlur}
        width={30}
        testId={selectors.pages.Dashboard.Settings.Variables.Edit.TextBoxVariable.textBoxOptionsQueryInputV2}
      />
      <VariableTextField
        value={placeholder}
        name="Placeholder"
        placeholder="placeholder for empty field"
        onChange={onPlaceholderChange}
        onBlur={onPlaceholderBlur}
        width={30}
        testId={selectors.pages.Dashboard.Settings.Variables.Edit.TextBoxVariable.textBoxOptionsPlaceholder}
      />
    </>
  );
}
