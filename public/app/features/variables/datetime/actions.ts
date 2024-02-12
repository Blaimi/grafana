import { DateTimeVariableModel } from '../types';
import { ThunkResult } from '../../../types';
import { getVariable } from '../state/selectors';
import { variableAdapters } from '../adapters';
import { createDateTimeOptions } from './reducer';
import { KeyedVariableIdentifier } from '../state/types';
import { setOptionFromUrl } from '../state/actions';
import { UrlQueryValue } from '@grafana/data';
import { changeVariableProp } from '../state/sharedReducer';
import { ensureStringValues, toKeyedVariableIdentifier, toVariablePayload } from '../utils';
import { toKeyedAction } from '../state/keyedVariablesReducer';
export const updateDateTimeVariableOptions = (identifier: KeyedVariableIdentifier): ThunkResult<void> => {
  return async (dispatch, getState) => {
    const { rootStateKey, type } = identifier;
    dispatch(toKeyedAction(rootStateKey, createDateTimeOptions(toVariablePayload(identifier))));

    const variableInState = getVariable<DateTimeVariableModel>(identifier, getState());

    await variableAdapters.get(type).setValue(variableInState, variableInState.options[0], true);
  };
};

export const setDateTimeVariableOptionsFromUrl =
  (identifier: KeyedVariableIdentifier, urlValue: UrlQueryValue): ThunkResult<void> =>
  async (dispatch, getState) => {
    const { rootStateKey } = identifier;

    const variableInState = getVariable<DateTimeVariableModel>(identifier, getState());

    const stringUrlValue = ensureStringValues(urlValue);
    dispatch(
      toKeyedAction(
        rootStateKey,
        changeVariableProp(toVariablePayload(variableInState, { propName: 'query', propValue: stringUrlValue }))
      )
    );

    await dispatch(setOptionFromUrl(toKeyedVariableIdentifier(variableInState), stringUrlValue));
  };
