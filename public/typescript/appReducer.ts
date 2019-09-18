import { Reducer } from 'react';
import { decode } from 'urlsafe-base64';
import { createErrorCode } from './functions';
import { Action, ApplicationEvent, ApplicationState, SerializedPublicKeyCredential } from './models';
import { isServerResponseError, serverResponseErrorReducer } from './serverResponseErrorReducer';

export type AppReducer = Reducer<ApplicationState, Action>;

export const appReducer: AppReducer = (state, { value, type, timestamp }) => {
  const { requestInformation } = state;
  switch (type) {
    case ApplicationEvent.NOT_SUPPORTED:
      return {
        requestInformation,
        message: 'status.webauthn_not_supported',
        errorInfo: {
          timestamp,
          code: createErrorCode('webauthn_not_supported'),
          showMailTo: false,
          showRetry: false,
        },
      };

    case ApplicationEvent.REQUEST_USER_FOR_ATTESTATION:
      return {
        requestInformation,
        message: 'status.registration_initial',
        errorInfo: null,
      };

    case ApplicationEvent.PUBLIC_KEY_CREDENTIALS_SERIALIZED:
      const credentials: SerializedPublicKeyCredential = value as any;
      return {
        ...state,
        clientDataJSON: decode(credentials.response.clientDataJSON).toString(),
      };

    case ApplicationEvent.REQUEST_USER_FOR_ASSERTION:
      return {
        requestInformation,
        message: 'status.authentication_initial',
        errorInfo: null,
      };

    case ApplicationEvent.ERROR:
      if (isServerResponseError(value)) {
        return serverResponseErrorReducer(state, timestamp, value.response);
      }
      return {
        requestInformation,
        message: 'status.general_error',
        errorInfo: {
          timestamp,
          code: createErrorCode(`${value}`),
          showRetry: true,
          showMailTo: true,
        },
      };
  }

  return state;
};
