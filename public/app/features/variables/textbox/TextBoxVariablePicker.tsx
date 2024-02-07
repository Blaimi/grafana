import React, { ChangeEvent, FocusEvent, KeyboardEvent, ReactElement, useCallback, useEffect, useState } from 'react';

import { isEmptyObject } from '@grafana/data';
import { Input } from '@grafana/ui';
import { t } from 'app/core/internationalization';
import { useDispatch } from 'app/types';

import { variableAdapters } from '../adapters';
import { ALL_VARIABLE_VALUE, VARIABLE_PREFIX } from '../constants';
import { VariablePickerProps } from '../pickers/types';
import { toKeyedAction } from '../state/keyedVariablesReducer';
import { changeVariableProp } from '../state/sharedReducer';
import { TextBoxVariableModel } from '../types';
import { toVariablePayload } from '../utils';

export interface Props extends VariablePickerProps<TextBoxVariableModel> {}

export function TextBoxVariablePicker({ variable, onVariableChange, readOnly }: Props): ReactElement {
  const dispatch = useDispatch();
  const [updatedValue, setUpdatedValue] = useState(variable.current.value);
  const placeholder = variable.placeholder;
  useEffect(() => {
    setUpdatedValue(variable.current.value);
  }, [variable]);

  const updateVariable = useCallback(() => {
    if (!variable.rootStateKey) {
      console.error('Cannot update variable without rootStateKey');
      return;
    }

    if (variable.current.value === updatedValue) {
      return;
    }

    const data = { propName: 'query', propValue: updatedValue };

    if (updatedValue === '') {
      data.propValue = ALL_VARIABLE_VALUE;
    }

    dispatch(
      toKeyedAction(
        variable.rootStateKey,
        changeVariableProp(
          toVariablePayload({ id: variable.id, type: variable.type }, data)
        )
      )
    );

    if (onVariableChange) {
      onVariableChange({
        ...variable,
        current: isEmptyObject(variable.current) ? {} : { ...variable.current, value: updatedValue },
      });
      return;
    }

    variableAdapters.get(variable.type).updateOptions(variable);
  }, [variable, updatedValue, dispatch, onVariableChange]);

  const checkForOnEmptyValue = () => {
    if (updatedValue !== '' && updatedValue !== ALL_VARIABLE_VALUE) {
      return updatedValue;
    } else {
      return '';
    }
  };

  const valueToDisplay = checkForOnEmptyValue();

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setUpdatedValue(event.target.value),
    [setUpdatedValue]
  );

  const onBlur = (e: FocusEvent<HTMLInputElement>) => updateVariable();
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      updateVariable();
    }
  };

  return (
    <Input
      type="text"
      value={valueToDisplay ?? ''}
      onChange={onChange}
      onBlur={onBlur}
      disabled={readOnly}
      onKeyDown={onKeyDown}
      placeholder={placeholder ?? t('variable.textbox.placeholder', 'Enter variable value')}
      id={VARIABLE_PREFIX + variable.id}
    />
  );
}
