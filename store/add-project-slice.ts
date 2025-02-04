import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import {
  FormStateV2,
  IsTouchedPayload,
  SetFormElementPayload,
} from '@/lib/models/formStateModels';
import { resetAllFormValidation } from '@/lib/utility/formHelpers';

const initialAddProjectFormState: FormStateV2 = {
  numRecurringFees: { value: 0 },
};

const addProjectFormSlice = createSlice({
  name: 'addProjectForm',
  initialState: initialAddProjectFormState,
  reducers: {
    setFormElement(state, action: PayloadAction<SetFormElementPayload>) {
      const { inputValue, inputKey, isValid } = action.payload;
      state[inputKey] = {
        ...state[inputKey],
        value: inputValue,
        isValid: isValid,
      };
    },
    clearFormState() {
      return initialAddProjectFormState;
    },
    setIsTouchedState(state, action: PayloadAction<IsTouchedPayload>) {
      const { inputKey, isTouched, isValid } = action.payload;
      state[inputKey] = {
        ...state[inputKey],
        value: state[inputKey]?.value ? state[inputKey].value : '',
        isValid: isValid,
        isTouched: isTouched,
      };
    },
    resetFormValidation(state) {
      return resetAllFormValidation(state);
    },
    // removeRecurringFeeState(
    //   state,
    //   action: PayloadAction<{ inputKey: string }>
    // ) {
    //   const { inputKey } = action.payload;
    //   delete state[inputKey];
    // },
    // incrementRecurringFee(state) {
    //   (state.numRecurringFees.value as number)++;
    // },
    // decrementRecurringFee(state) {
    //   (state.numRecurringFees.value as number)--;
    // },
    // setRecurringFee(state, action: PayloadAction<number>) {
    //   state.numRecurringFees.value = action.payload;
    // },
  },
});

export default addProjectFormSlice;
export const addProjectFormActions = addProjectFormSlice.actions;
