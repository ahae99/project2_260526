/// <reference types="vite/client" />

const WS_ENDPOINT: string =
  (import.meta.env.VITE_WS_ENDPOINT as string) ||
  'wss://1ek4gh2dl4.execute-api.us-west-2.amazonaws.com/prod';

export default WS_ENDPOINT;
