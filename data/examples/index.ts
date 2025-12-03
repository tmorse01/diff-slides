import { reactUseState } from "./react-usestate";
import { reactUseEffect } from "./react-useeffect";
import { reactCustomHook } from "./react-custom-hook";
import { reactContext } from "./react-context";
import { reactUseStateArrays } from "./react-usestate-arrays";
import { reactUseReducer } from "./react-usereducer";
import { reactLazyInitialization } from "./react-lazy-initialization";
import { reactUseEffectDependencies } from "./react-useeffect-dependencies";
import { reactFormValidation } from "./react-form-validation";
import { reactCustomFormHook } from "./react-custom-form-hook";
import { reactFetchLoadingStates } from "./react-fetch-loading-states";
import { reactFetchAbortController } from "./react-fetch-abort-controller";
import { nodejsExpressRoute } from "./nodejs-express-route";
import { nodejsAsyncAwait } from "./nodejs-async-await";
import { nodejsErrorHandling } from "./nodejs-error-handling";
import { nodejsMiddleware } from "./nodejs-middleware";

export const previewExamples = [
  reactUseState,
  reactUseEffect,
  reactCustomHook,
  reactContext,
  reactUseStateArrays,
  reactUseReducer,
  reactLazyInitialization,
  reactUseEffectDependencies,
  reactFormValidation,
  reactCustomFormHook,
  reactFetchLoadingStates,
  reactFetchAbortController,
  nodejsExpressRoute,
  nodejsAsyncAwait,
  nodejsErrorHandling,
  nodejsMiddleware,
];

export type { CodeExample, CodeStep } from "./types";

