import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface IToast {
    id: number;
    message: string;
}

export interface IError {
    id: number;
    message: string;
    supplementaryMessage?: string;
    ttl: number;
}
export type TAPIError = {
    message: string;
    supplementaryMessage: string;
}



interface IMainStore {
    toastList: Array<IToast>;
    errorList: Array<IError>;
}

const initialState: IMainStore = {
    toastList: [],
    errorList: [],
}


export const mainSlice = createSlice({
    name: 'main',
    initialState,
    reducers: {
        addToast: (state, action: PayloadAction<string>) => {
            const id = state.toastList.reduce((acc, current) => current.id >= acc ? acc = current.id + 1 : acc, 1);
            state.toastList = [...state.toastList, { id, message: action.payload }]
        },
        removeToast: (state, action: PayloadAction<number>) => {
            state.toastList = state.toastList.filter(toast => toast.id !== action.payload);
        },
        addError: (state, action: PayloadAction<string | TAPIError>) => {
            if (!action.payload) return;
            const id = state.errorList.reduce((acc, current) => current.id >= acc ? acc = current.id + 1 : acc, 1);
            if (typeof action.payload === 'string') {
                state.errorList = [...state.errorList, { id, message: action.payload, ttl: Date.now() + 10000 }]
            } else {
                state.errorList = [...state.errorList, { id, message: action.payload.message, supplementaryMessage: action.payload.supplementaryMessage, ttl: Date.now() + 10000 }]
            }
        },
        removeError: (state, action: PayloadAction<number>) => {
            state.errorList = state.errorList.filter(error => error.id !== action.payload);
        },
    }
})

export const { addToast, removeToast, addError, removeError } = mainSlice.actions;
export default mainSlice.reducer;